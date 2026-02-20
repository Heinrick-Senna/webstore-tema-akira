wsMain.createModule({
  name: 'categorias',
  onlyAfter: 'info-lojas',
  function: 'get',
  options: {
      megaMenu: true
  },
  async get() {
    if (!document.querySelector('[data-wsjs-module=categorias]')) return;
    let data = await ApiWS.Calls.ListaCategorias();

    document.querySelectorAll('[data-wsjs-module=categorias]').forEach(tag => {
       wsMain.modules['categorias'].create(data, tag);
    });

    wsMain.addons.headerFirstLoad();

    return true;
  },
  create(returnJson, tag) {
      let configs = wsMain.options[this.name],
          categorias = returnJson.Categorias,
          categoriasCustom = returnJson.MenuPersonalizado;

      let options = wsMain.tools.getWsData(tag, 'options');
      let text = tag.innerHTML;

      let arrCat;

      if (!options.atual && options.custom != false && (Array.isArray(categoriasCustom) && categoriasCustom.length > 0)) {
          categoriasCustom.forEach(elm => {
              if (elm.nome.trim().toString().toLowerCase() == 'categorias') elm.subcategorias = categorias;
          });
          arrCat = categoriasCustom;
      } else if (Array.isArray(categorias) || categorias.length > 0) {
          arrCat = categorias;
      } else {
          return;
      }
      let arrLvl = 0;
      function search(mainArr, catToSearch) {
        function searchInsideSubCat(arr, lvl = 0, parent = false) {
          let response;
          arr.forEach(cat => {
            let subCat = searchInsideACat(cat, lvl, parent);
            response = subCat ? subCat : response;
          });
          
          return response;
        }
      
        function searchInsideACat(cat, lvl, parent) {
          if (catToSearch) {
            if (cat.id == catToSearch) return [cat, lvl, parent];
          } else {
            if (cat.atual) return [cat, lvl, parent];
          }

          if (cat.subcategorias && cat.subcategorias.length > 0) return searchInsideSubCat(cat.subcategorias, lvl+1, cat);
      
          return;
        }
      
        return searchInsideSubCat(mainArr);
      };

      if (options.atual) {
        let searchResult = search(arrCat, document.querySelector('#HD_CAT_ID').value);

        if (searchResult) {
          arrLvl = searchResult[1];
          arrCat = searchResult[2] ? searchResult[2].subcategorias : searchResult[0].subcategorias;

          if (arrCat.length == 0 && arrLvl != 0) {
            arrCat = searchResult[0].subcategorias || 0;
          }
        } else {
          arrCat = [];
        }
      }

      if (options.allCats  || options.mobile) {
        let objToUse = {
          atual: false,
          id: 'allCats-menu',
          nome: 'Todos os departamentos',
          produtodestaque: false,
          subcategorias: JSON.parse(JSON.stringify(arrCat))
        };

        if (options.allCats) arrCat.unshift(objToUse);
        if (options.mobile) arrCat = [objToUse];
      }

      let divMain = wsMain.tools.createElm({
        type: 'div',
        innerHTML: text,
        attrs: {
          class: options.defaultCat == false ? '' : 'nav-menu'
        }
      });

      let ulMain = wsMain.tools.createElm({
        type: 'ul', 
        attrs: {
          class: 'nav-menu-list'
        }
      });

      let title = wsMain.tools.createElm({
        type: 'div', 
        attrs: {
          class: 'sub-title'
        }
      });


      let subTitle = wsMain.tools.createElm('a');
      
      let titleLink = wsMain.tools.createElm({
        type: 'div', 
        innerHTML: 'Voltar', 
        attrs: {
          onclick: 'this.parentNode.parentNode.classList.remove("active")'
        }
      });

      title.append(subTitle);
      title.append(titleLink);

      function createTitle(div, catLink, catName) {
          let clone = div.cloneNode(true);
          clone.querySelector('a').setAttribute('href', catLink);
          clone.querySelector('a').innerHTML = catName;
          return clone;
      }
      
      function createCatList(cat, n = 0) {
        if (cat.id != "allCats-menu" && cat.tipo == 'dpt' && cat.registro && cat.registro != 0) {
          try {
            cat = search(returnJson.Categorias, cat.registro)[0];
          } catch(err) {
            return '';
          }
        }
        if (cat.tipo == 'inst') wsMain.globalData.infoLoja.menuinstitucional.forEach((int) => {
          if (cat.registro == int.id) cat.url = int.url;
        });

        if (cat.registro == 0) {
          cat = {
            atual: false,
            id: 'allCats-custom',
            nome: cat.nome,
            produtodestaque: false,
            subcategorias: JSON.parse(JSON.stringify(categorias))
          }
        }

          let li = wsMain.tools.createElm({type: 'li', attrs: {
              class: 'dpt-' + n + ' nav-menu-item',
              id: 'departamento-' + cat.id,
          }});


          if (n == 0 && options.allCats && cat.id == 'allCats-menu') {
            li.classList.add('dpt-all');
            li.style.display = 'none';
          }
          
          if (options.mobile && n == 1 && cat.id == 'allCats-menu') {
            return '';
          } 
          
          let hiperLink = wsMain.tools.createElm({
            type: 'a', 
            innerHTML: cat.nome, 
            attrs: {
                class: 'nav-menu-hiperlink',
                title: cat.nome || 'Todas as Categorias',
                href: cat.url || 'javascript:;'
            }
          });
          

          li.append(hiperLink)

          let subCats = cat.subcategorias;
          if (subCats && Array.isArray(subCats) && subCats.length > 0) {
            if (options.hoverMode == false && options.dropDown != true || options.mobile) {
              hiperLink.setAttribute('href', 'javascript:;');
              hiperLink.setAttribute('onclick', 'wsMain.modules["categorias"].selectMode(this)');
              hiperLink.classList.add('has-sub');

              if (subCats[0].holder != true) {
                subCats.unshift({
                  nome: 'Ver Tudo',
                  holder: true,
                  id: cat.id,
                  url: cat.url
                });
            }

            } else {
              li.classList.add('hover');
            }

            let ul = wsMain.tools.createElm({type: 'ul', attrs: {class: 'nav-menu-sub-list'}});
            let divHolder = wsMain.tools.createElm({type: 'div', attrs: {class: n == 0 ? 'nav-menu-main' : 'nav-menu-sub-container'}});
                for (let i = 0; i < subCats.length; i++) {
                    ul.append(createCatList(subCats[i], n+1));
                }
                if (n != 0) {
                    let titleList = createTitle(title, cat.url, cat.nome);
                    if (options.dropDown != true) divHolder.append(titleList);
                }
                divHolder.append(ul);
            if (n > 0 && options.hoverMode != false) {
                hiperLink.classList.add('has-sub');
                let spanLink = wsMain.tools.createElm({
                  type: 'span', 
                  attrs: {
                    'data-wsjs-icon': 'arrow'
                  }
                });
                hiperLink.append(spanLink);
                if (options.dropDown != true) {
                  hiperLink.setAttribute('href', 'javascript:;');
                  hiperLink.addEventListener('click', (e) => {
                    let subContainer = hiperLink.parentNode.querySelector('.nav-menu-sub-container');
                    if (subContainer) subContainer.classList.add('active');
                  });
                }
            }

            if (n == 0 && options.dropDown == true) divHolder.classList.add('dropdown');
            if (options.dropDown == true) hiperLink.classList.add('dropdown');

            if (n > 0 && options.dropDown != true) {
              divHolder.append(wsMain.tools.createElm({
                type: 'div',
                attrs: {
                  class: 'nav-menu-overlay'
                }
              }));
            }
            
            li.append(divHolder);
            
            if (options.dropDown == true) li.classList.add('dropdown');
          }

          if (subCats && Array.isArray(subCats) && subCats.length > 0 && configs.megaMenu && cat.produtodestaque && options.megaMenu != false && options.dropDown != true) {
            let megaMenu = wsMain.tools.createElm({
                type: 'div',
                attrs: {
                    class: 'nav-menu-megamenu-container'
                }
            });
            let img = wsMain.tools.createElm({
                type: 'img',
                attrs: {
                  class: 'nav-menu-megamenu-item-image',
                  src: cat.produtodestaque.imagem
                }
            });
            let prodDestaqueName = wsMain.tools.createElm({
                type: 'div',
                attrs: {
                  class: 'nav-menu-megamenu-item-nome-container'
                },
                innerHTML: '<p>' + cat.produtodestaque.nome + '</p>'
            });
            let prodDestaqueContainer = wsMain.tools.createElm({
              type: 'a',
              attrs: {
                href: cat.produtodestaque.url,
                class: 'nav-menu-megamenu-item'
              }
            });
            let imgHolder = wsMain.tools.createElm({
              type: 'div', 
              attrs: {
                class: 'nav-menu-megamenu-item-image-container'
              }
            });

            let photowrap = '{photowrap}';
            let aspectRatio = '1/1';
            if ( photowrap == 'Quadrada') { 
              aspectRatio = '1/1'; 
            }
            if ( photowrap == 'Vertical') { 
              if (photo) photo = photo.replace('/PEQ_', '/MED_');
              console.log(photo);
              aspectRatio = '3/4'; 
            }
            if ( photowrap == 'Super Vertical') { 
              if (photo) photo = photo.replace('/PEQ_', '/MED_');
              console.log(photo);
              aspectRatio = '2/3'; 
            }
            if ( photowrap == 'Horizontal') { 
              aspectRatio = '4/3'; 
            }

            imgHolder.style.setProperty('aspect-ratio', aspectRatio);

            imgHolder.append(img);
            prodDestaqueContainer.append(imgHolder);
            prodDestaqueContainer.append(prodDestaqueName);
            megaMenu.append(prodDestaqueContainer);
            li.append(megaMenu);
          }


          return li;
      }
      
      for (let i = 0; i < arrCat.length; i++) {
          ulMain.append(createCatList(arrCat[i]));
      }

      if ((arrCat.length == 0 && arrLvl == 0)) {
        tag.remove();
      } else {
      divMain.append(ulMain);

      wsMain.tools.replaceSpanTag(divMain, tag);
      let maxWidth = ulMain.offsetWidth;



      ulMain.querySelectorAll(':scope .dpt-1 .nav-menu-hiperlink.dropdown').forEach(elm => {
        elm.addEventListener('mouseover', () => {
          let offset = elm.offsetTop;
          elm.nextSibling.style.top = offset + 'px';
          elm.nextSibling.style.display = 'block';
          setTimeout(() => {
            elm.nextSibling.style.opacity = '1';
          }, 1);
          setTimeout(() => {
            elm.nextSibling.style.top = offset + 'px';
            elm.nextSibling.style.display = 'block';
            setTimeout(() => {
              elm.nextSibling.style.opacity = '1';
            }, 1);
          }, 200);
        });
        
        elm.addEventListener('mouseout', () => {
            setTimeout(() => {
            elm.nextSibling.style.opacity = '';
            elm.nextSibling.style.display = '';
          }, 200);
        });
      });

      ulMain.addEventListener('mouseleave', () => { 
        ulMain.querySelectorAll('.nav-menu-sub-container.active').forEach(elm => elm.classList.remove('active'));
        ulMain.querySelectorAll('li:not(.dpt-0) > .nav-menu-hiperlink.active').forEach(elm => elm.classList.remove('active'));
      });
      let menuItens = ulMain.querySelectorAll('.nav-header .dpt-0');
      
      function getWidth() {
        menuItens = ulMain.querySelectorAll('.nav-header .dpt-0');
        let width = 0, gap = getComputedStyle(ulMain).getPropertyValue('column-gap');
        gap = gap && gap != 'normal' ? gap : 0;
        menuItens.forEach((elm, i) => width += elm.querySelector(':scope > a').offsetWidth + (i == menuItens.length-1 ? 0 : parseInt(gap)));
        return width;
      }

      let permanentCategories = options ? options['always-visible']?.split(',').map(a => a.trim()) || false : false;

      while (getWidth() > maxWidth) {
        try {
          ulMain.querySelector('.dpt-all').style.display = '';
        } catch(err) {}

        if (permanentCategories) {
          for (let p = menuItens.length - 1; p >= 0; p--) {
            let isEqual = false;

            permanentCategories.forEach(pCategorie => isEqual = 'departamento-' + pCategorie == menuItens[p].getAttribute('id') ? true : isEqual);
            
            if (!isEqual) {
              menuItens[p].remove();
              break;
            } 
          }
        } else {
          menuItens[menuItens.length -1].remove();
        }
      }

try {
      ulMain.querySelectorAll(':scope > li').forEach(elm => {
        let menuMain = elm.querySelector(':scope > .nav-menu-main');
        let megaMenu = elm.querySelector(':scope > .nav-menu-megamenu-container');

        let offsetMenuMain = menuMain.getBoundingClientRect();
        let offsetMegaMenu = menuMain.getBoundingClientRect();

        if (megaMenu) {
          if (offsetMenuMain.left + menuMain.offsetWidth + megaMenu.offsetWidth + 20 > window.innerWidth) {
            elm.classList.add('alignToRight');
            elm.querySelector(':scope > .nav-menu-main').style.marginRight = '30rem';
          }
        } else {
          if (offsetMegaMenu.left + menuMain.offsetWidth + 20 > window.innerWidth) {
            elm.classList.add('alignToRight');
          }
        }
      });
} catch (err) {

}
      }

      return true;
  },
  selectMode(elm) {
    try {
      if (elm != elm.parentNode.querySelector('.active')) {
        elm.parentNode.parentNode.querySelector('.active').classList.remove('active');
      }
    } catch(_) {}

    elm.classList.toggle('active');
  }
});
