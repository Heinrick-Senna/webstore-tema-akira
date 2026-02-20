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
       wsMain.modules[this.funcName].create(data, tag);
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
            if (cat.id == catToSearch) return [cat, 0, false];
          } else {
            if (cat.atual) return [cat, lvl, parent];
          }

          if (cat.subcategorias && cat.subcategorias.length > 0) return searchInsideSubCat(cat.subcategorias, lvl+1, cat);
      
          return;
        }
      
        return searchInsideSubCat(mainArr);
      };

      if (options.atual) {
        let searchResult = search(arrCat);

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

      if (options.allCats || options.mobile) {
        let objToUse = {
          atual: false,
          id: 'allCats-menu',
          nome: '<span data-wsjs-icon="grid"></span> Categorias',
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
          class: 'nav-menu'
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
        if (cat.id != 'allCats-menu' && cat.tipo == 'dpt' && cat.registro != 0) cat = search(returnJson.Categorias, cat.registro)[0];
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

          let hiperLink = wsMain.tools.createElm({
            type: 'a', 
            innerHTML: cat.nome, 
            attrs: {
                class: 'nav-menu-hiperlink',
                href: cat.url
            }
          });
          

          li.append(hiperLink)

          let subCats = cat.subcategorias;
          if (subCats && Array.isArray(subCats) && subCats.length > 0) {
            if (options.hoverMode == false && options.dropDown != true || options.mobile) {
              hiperLink.removeAttribute('href');
              hiperLink.setAttribute('onclick', 'wsMain.modules["categorias"].selectMode(this)');
              hiperLink.classList.add('has-sub');

              if (subCats[0].holder != true &&  n != 0) {
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
                  hiperLink.removeAttribute('href');
                  hiperLink.addEventListener('click', (e) => {
                    if (e.target.parentNode.classList.contains('has-sub')) e.target = e.target.parentNode;
                    let subContainer = e.target.parentNode.querySelector('.nav-menu-sub-container');
                    if (subContainer) subContainer.classList.add('active');
                  });
                }
            }

            if (n == 0 && options.dropDown == true) divHolder.classList.add('dropdown');
            if (options.dropDown == true) hiperLink.classList.add('dropdown');
            
            li.append(divHolder);
            
            if (options.dropDown == true) li.classList.add('dropdown');
          }

          if (configs.megaMenu && cat.produtodestaque && options.megaMenu != false && options.dropDown != true) {
            let megaMenu = wsMain.tools.createElm({
                type: 'div',
                attrs: {
                    class: 'nav-menu-megamenu-container'
                }
            });
            let img = wsMain.tools.createElm({
                type: 'img',
                attrs: {
                    src: cat.produtodestaque.imagem
                }
            });
            let prodDestaqueName = wsMain.tools.createElm({
                type: 'div',
                innerHTML: '<span>' + cat.produtodestaque.nome + '</span>'
            });
            let prodDestaqueContainer = wsMain.tools.createElm({
              type: 'a',
              attrs: {
                href: cat.produtodestaque.url,
                class: 'nav-menu-megamenu-item'
              }
            })

            prodDestaqueContainer.append(prodDestaqueName);
            prodDestaqueContainer.append(img);
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

      ulMain.querySelectorAll(':scope > li').forEach(elm => {
        if (window.innerWidth - elm.offsetLeft < 760) {
          elm.classList.add('alignToRight');
          if (elm.querySelector(':scope > .nav-menu-megamenu-container')) {
            elm.querySelector(':scope > .nav-menu-main').style.marginRight = '30rem';
          }
        }
      });

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
      let maxWidth = ulMain.offsetWidth;
      
      function getWidth() {
        menuItens = ulMain.querySelectorAll('.nav-header .dpt-0');
        let width = 0;
        menuItens.forEach(elm => width += elm.offsetWidth);
        return width;
      }

      while (getWidth() > maxWidth) {
        ulMain.querySelector('.dpt-all').style.display = '';

        menuItens[menuItens.length -1].remove();
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
