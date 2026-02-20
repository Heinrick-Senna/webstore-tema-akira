wsMain.createModule({
  name: 'category-filter',
  function: 'get',
  subFunctions: {
    async orderSelect(target) {
      let val = target.value;
      let catId = document.querySelector('#HD_CAT_ID').value;
          let IDENTORDER = document.querySelector('#HD_PED_IDENT_INFO')?.value ? document.querySelector('#HD_PED_IDENT_INFO')?.value : "";
      let busca = document.querySelector('#LV_HD_BUSCA_VALOR')?.value ? document.querySelector('#LV_HD_BUSCA_VALOR')?.value : "";
      await fetch("/carrinhoAJAX/listagem.aspx?TIPO=MUDA_ORDEM_LISTAGEM&ORDEM=" + val + "&CAT_ID=" + catId +"&BUSCA="+busca);
          let uri = new URL(window.location.href);
          uri.searchParams.delete('pagina');
          let sParam = uri.searchParams.get('s');
          let newUrl = uri.origin + uri.pathname +
              "?order=" + val +
              "&cat=" + catId +
              "&acs=" + IDENTORDER;
          if (sParam) {
              newUrl = uri.origin + uri.pathname + "?s=" + encodeURIComponent(sParam) + "&order=" + val;
          }
          window.location.href = newUrl;
    },
    categoryName(obj, options, text ) {
      if (!obj.migalha) return false;
      let div = wsMain.tools.createElm({
        type: options.type,
        innerHTML: obj.actualCatName
      });

      return div;
    },  
    order(obj, options, text) {
      let select = wsMain.tools.createElm('select');

      let selectOptions = document.querySelectorAll('[data-wsjs-listing="order"] > *');

      selectOptions.forEach(elm => {
        select.append(elm);
        // elm.setAttribute('onclick', );
        if (elm.value == obj.ordem_atual) elm.setAttribute('selected', true);
      });

      select.setAttribute('onchange', `wsMain.modules['category-filter'].subFunctions.orderSelect(this)`);

      return select; 
    },
    breadcrumb(obj, options, text) {
      if (!obj.migalha) return false;
      let div = wsMain.tools.createElm('div');
      obj.migalha.forEach((crumb, i) => {
        let hiperLink = wsMain.tools.createElm({
            type: 'a', 
            innerHTML: crumb.nome,
            attrs: {
                href: crumb.url
        }});

        div.append(hiperLink);
        if (i != obj.migalha.length-1) div.append(wsMain.tools.createElm('span'));
      });

      return div;
    },
    searchResults(obj, options, text) {
      const userSearchInput = document.querySelector('#LV_HD_BUSCA_VALOR')

      if(!userSearchInput) return false

      const userSearchInputValue = userSearchInput.value

      if(!userSearchInputValue) return

      document.querySelector('.breadcrumb-container').classList.add('breadcrumb-hidden')

      let div

      if(!text) {
        div = wsMain.tools.createElm({
          type: 'div',
          innerHTML: `Exibindo o resultado da busca: <span>${userSearchInputValue.replace(/-/g, " ")}</span>`
        });

        return div
      }

      const label = text.replace('{{value}}', ' ')

      div = wsMain.tools.createElm({
        type: 'div',
        innerHTML: `${label} <span>${userSearchInputValue.replace(/-/g, " ")}</span>`
      });

      return div
    },
    categoryFilter(obj, options, text) {
      let filters = obj.Filtros;
      let filterIsUsed = false;

      if (!Array.isArray(filters) || filters.length == 0) return false;
  
      let container = wsMain.tools.createElm({
        type: 'nav',
        innerHTML: text
      });
      
      let activeFilters = wsMain.tools.createElm({
        type: 'div'
      });
      
      filters.forEach((f, i) => {
        if (!Array.isArray(f.opcoes) || f.opcoes.length == 0) return;
        filterIsUsed = true;
        let div = wsMain.tools.createElm({
          type: 'div',
          attrs: {
            class: 'filter-holder'
          }
        });
        let title = wsMain.tools.createElm({
          type: 'label',
          innerHTML: f.titulo,
          attrs: {
            for: f.titulo.replace(/ /g, '-') + i,
          }
        });

        let checkTitle = wsMain.tools.createElm({
          type: 'input',
          attrs: {
            id: f.titulo.replace(/ /g, '-') + i,
            type: 'checkbox',
            style: 'display: none'
          }
        });

        if (options.mobile) {
          checkTitle.setAttribute('checked', 'true');
        }
  
        let optContainer = wsMain.tools.createElm({
          type: 'div',
        });
  
        f.opcoes.forEach(opt => {
  
          let optElm = wsMain.tools.createElm({
            type: 'a',
            attrs: {
              href: opt.link.replace('FuncaoSetaFiltroCaracteristica', "wsMain.modules['category-filter'].switchFilter")
            }
          });
  
          let optInput = wsMain.tools.createElm({
            type: 'input',
            id: 'filter-' + f.titulo + '-' + opt.nome,
            attrs: {
              type: 'checkbox',
              checked: opt.selecionada ? true : false
            }
          });

          if (opt.selecionada) {
            optInput.setAttribute('checked', 'true');
          }
  
          let optLabel = wsMain.tools.createElm({
            type: 'label',
            attrs: {
              for: 'filter-' + f.titulo + '-' + opt.nome,
            },
            innerHTML: opt.nome
          });
  
          let optSpan = wsMain.tools.createElm('span');

          optElm.append(optInput);
          optElm.append(optLabel);
          optElm.append(optSpan);
          optContainer.append(optElm);

          if (opt.selecionada) {
            let optHolder = wsMain.tools.createElm('div');
            let cloneLabel = optLabel.cloneNode(true);
            let cloneOptElm = optElm.cloneNode(true);

            cloneOptElm.innerHTML = '<span data-wsjs-icon="close"></span>';

            cloneLabel.setAttribute('for', 'filter-' + f.titulo + '-' + opt.nome + '_SELECTED')
            cloneOptElm.setAttribute('id', 'filter-' + f.titulo + '-' + opt.nome + '_SELECTED')
            
            optHolder.appendChild(cloneLabel)
            
            optHolder.appendChild(cloneOptElm);

            activeFilters.appendChild(optHolder);
          }
        });
  
        div.append(checkTitle);
        div.append(title);
        div.append(optContainer);
        
        container.append(div);
      });

      if (filterIsUsed == false) return;

      if (activeFilters.firstChild) container.insertBefore(activeFilters, container.firstChild);

      return container;
    },
    prodsNum(obj, options, text) {
      let total = obj.paginacao ? obj.paginacao?.total_itens : obj.totalitens;
      if (!total) total = 1;

      if (total == 1) text = text.replace('itens', 'item');

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', total),
      });

      return span;
    },
    actualPage(obj, options, text) {
      let actualPage = obj.paginacao?.pagina_atual;
      if (!actualPage) actualPage = 1;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', actualPage),
      });

      return span;
    },
    pagesNum(obj, options, text) {
      let totalPages = obj.paginacao?.qtd_paginas;
      if (!totalPages) totalPages = 1;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', totalPages),
      });

      return span;
    },
    firstPage(obj, options, text) {
      let actualPage = obj.paginacao?.pagina_atual;
      if (actualPage == 1 || !actualPage) return false;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text,
        attrs: {
          onclick: `wsMain.modules['category-filter'].switchPage(${1})`
        }
      });

      return span;

    },
    nextPage(obj, options, text) {
      let actualPage = obj.paginacao?.pagina_atual;
      if (!actualPage || actualPage == obj.paginacao?.qtd_paginas) return;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text,
        attrs: {
          onclick: `wsMain.modules['category-filter'].switchPage(${actualPage+1})`
        }
      });

      return span;
    },
    lastPage(obj, options, text) {
      let actualPage = obj.paginacao?.pagina_atual;
      let lastPage = obj.paginacao?.qtd_paginas;
      console.log('NUMERO DE Paginas', lastPage, 'atual', actualPage);
      if (!actualPage || !lastPage) return false;
      if (actualPage == lastPage) return false;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text,
        attrs: {
          onclick: `wsMain.modules['category-filter'].switchPage(${lastPage})`
        }
      });

      return span;
    },
    prevPage(obj, options, text) {
      let actualPage = obj.paginacao?.pagina_atual;
      if (actualPage == 1 || !actualPage) return false;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text,
        attrs: {
          onclick: `wsMain.modules['category-filter'].switchPage(${actualPage-1})`
        }
      });

      return span;
    }
  },
  actualPage: 0,
  pageAwait: false,
  async get() {
    wsMain.modules['category-filter'].createDynamicLoadingAnchor()

    function triggerCreate() {
      let listaCategorias = wsMain.globalData['infoCategory'];
      let listaProds = wsMain.globalData['listCategoryProds'];
  
      let data = {...listaCategorias, ...listaProds};

      return wsMain.modules['category-filter'].create(data);
    }

    let cateogoryTimeout = setInterval(() => {
      let categoryIsReady = true;
      if (typeof wsMain.globalData['infoCategory'] == 'undefined') categoryIsReady = false
      if (typeof wsMain.globalData['listCategoryProds'] == 'undefined') categoryIsReady = false

      if (categoryIsReady) {
        triggerCreate();
        clearInterval(cateogoryTimeout)
      }
    }, 100);

    return true;
    
    // isReady(['categorias', 'product-list'], triggerCreate);
  },
  create(returnJson) {
    let pageModes = []; 

    returnJson.migalha = [
      {
        "nome": "P&aacute;gina inicial",
        "url": "/",
        "atual": false
      }
    ]


    // Tratativa de Migalha e Nome da Categoria
    try {
      function search(mainArr, catToSearch) {
        function searchInsideSubCat(arr, parent = false) {

          let response;
          arr.forEach(cat => {
            if (parent) cat.parent = parent;
            let subCat = searchInsideACat(cat, parent);
            response = subCat ? subCat : response;
          });
          
          return response;
        }
      
        function searchInsideACat(cat, parent) {
          if (cat.id == catToSearch) return cat;
          if (cat.subcategorias && cat.subcategorias.length > 0) return searchInsideSubCat(cat.subcategorias, cat, parent);
          return;
        }
      
        return searchInsideSubCat(mainArr);
      };
      let actualCat = search(returnJson.Categorias, document.querySelector('#HD_CAT_ID').value);
      
      function getParent(cat) {
        if (!cat) return;

        if (cat.parent) getParent(cat.parent);

        returnJson.migalha.push({
          "nome": cat.nome,
          "url": cat.url,
          "atual": cat.atual
        });
      }

      getParent(actualCat);

      returnJson.actualCatName = actualCat.nome;

      if (!actualCat.subcategorias || actualCat.subcategorias.length == 0) {
        returnJson.actualCatName = actualCat?.parent?.nome
        if (!actualCat.parent || !actualCat.parent.subcategorias || actualCat.parent.subcategorias.length < 2) {
          pageModes.push(7);
        }
      }

    } catch(_) {}

    // Tratativa Pagina de Favoritos
    if (window.location.href.indexOf('produtos/favoritos') != -1)  {
      returnJson.migalha.push({
        "nome": "Favoritos",
        "url": "/produtos/favoritos",
        "atual": true
      })
    }

    if (!returnJson.produtos || returnJson.produtos.length == 0) {
      pageModes.push(1)
    }

    if (returnJson.Filtros || returnJson.Filtros.length > 0) {
      let existFilter, activeFilter;
      returnJson.Filtros.forEach(filter => {
        if (filter.tipo != 'fabricates') {
          existFilter = true;
          filter.opcoes.forEach(opt => {
            if (opt.selecionada == true) activeFilter = true;
          });
        }
      })

      if (!existFilter) pageModes.push(2)
      if (!activeFilter) pageModes.push(3);
    } 

    if (window.location.href.indexOf('produtos/favoritos') != -1) {
      pageModes.push(4);
    }

    if (document.querySelector('#LV_HD_BUSCA_VALOR')) {
      pageModes.push(5);
    }

    wsMain.modules['category-filter'].resolveMode(pageModes);

    // // Executando Funcao
    wsMain.tools.replaceSubFunctions(returnJson, this.subFunctions, 'listing');

    // Tratativa Rolagem Infinita
    try {
      document.querySelector('[data-wsjs-listing="infinity"]').addEventListener('click', () => wsMain.modules['category-filter'].infinityList());
    } catch(_) {}

    return true;
  },
  resolveMode(modesArr) {
    let uri = (window.location.href);
    document.querySelectorAll('[data-wsjs-listMode]').forEach(item => {
      let modesList = item.getAttribute('data-wsjs-listMode').split('|');
      modesList.forEach(modesOnItem => {
        modesOnItem = modesOnItem.split(',');
        let selectedModes = modesOnItem.filter(mode => modesArr.includes(parseInt(mode)));
        if (uri.indexOf('/busca?') < 0) {
            if (selectedModes.length == modesOnItem.length) item.remove();
        }
      });
    });

    setTimeout(() => {
      document.querySelector('.filter-container').style.opacity = '';
    }, 50)
  },
  switchPage(page) {
    let uri = new URL(window.location.href);
    uri.searchParams.set('pagina', page);
    
      window.location.href = uri.href;
  },
  createDynamicLoadingAnchor() {
    console.log('createDynamicLoadingAnchor');
    const mainContainer = document.querySelector('.category-search-list .list-container');
    if(!mainContainer) { return; };
    const vrfLoader = mainContainer.querySelector('.category-loader');

    if(vrfLoader) { return; };

    const childToInserBefore = mainContainer.querySelector('.category-pagination-container');

    if(!childToInserBefore) { return; };

    const anchor = document.createElement('span');
    anchor.classList.add('category-loader');
    mainContainer.insertBefore(anchor, childToInserBefore);
  },
  async switchFilter(carac, value = false) {
      try {
          let type = value ? 'FILTRO_CARAC' : 'FILTRO_CARAC_REMOVE';
          let actualFilters = document.querySelector('#HD_LV_FiltrosCaracAtuais')?.value || '';
          let actualFiltersJson = document.querySelector('#HdFiltrosListagemJson')?.value || '';
          let IDENTORDER = document.querySelector('#HD_PED_IDENT_INFO')?.value || '';

          let newActualFiltersArray = []

          actualFilters.split('|').flatMap(newFilter => {
              wsMain.globalData.infoCategory.Filtros.forEach(filter => filter.id == newFilter ? newActualFiltersArray.push(newFilter) : null);
          });

          newActualFiltersArray = '|' + newActualFiltersArray.join('|') + '|';
          await fetch(`/carrinhoAJAX/listagem.aspx?TIPO=${type}&ATUAIS=${newActualFiltersArray}&FILTROS_JSON=${actualFiltersJson}&CARAC=${carac}${value ? '&VALOR=' + (value) : ''}`);

          let uri = new URL(window.location.href);
          uri.searchParams.delete('pagina');
          let url = uri.href.split('?')[0];
          if (url.indexOf("?") < 0) { url += "?vf=1"; }
          url += "&filter_vrs=" + Math.floor(Math.random() * (9999999 - 1111111 + 1));
          window.location.href = url + "&acs=" + IDENTORDER;

      } catch (err) {
          console.log(err);
      }
  },
  async infinityList() {
    wsMain.modules['category-filter'].actualPage++;

  if (!wsMain.globalData.listCategoryProds.paginacao) {
    document.querySelector('[data-wsjs-pagination="container"]').remove();
    document.removeEventListener('scroll', wsMain.modules['category-filter'].infinityScroll);
    return
  }

  try {
    wsMain.modules['category-filter'].actualPage
    let prodsPerlineSet = wsMain?.globalData?.infoLoja?.perLineProds || '{prodperline-categorie-var}';
    let prodsPerLineVar = !isNaN(parseInt(prodsPerlineSet)) ? prodsPerlineSet : 4;

    let options = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="category"]`), 'options')
    if (options['prods-perline']) prodsPerLineVar = options['prods-perline'];

    if (document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'true' && prodsPerLineVar >= 3) prodsPerLineVar = 2;
    
    let listaProds = await ApiWS.Calls.listProducts['category'](prodsPerLineVar, wsMain.modules['category-filter'].actualPage+1);
    let prods = await wsMain.modules['product-list'].create.category(listaProds, false, false, '', true);

    if (listaProds.paginacao.pagina_atual == listaProds.paginacao.qtd_paginas) {
      document.querySelector('[data-wsjs-pagination="container"]').remove();
      document.removeEventListener('scroll', wsMain.modules['category-filter'].infinityScroll);
    }

    prods.forEach(prod => document.querySelector('[data-wsjs-infinity="holder"]').append(prod) );

    document.addEventListener("scroll", wsMain.addons.lazyLoad);
  } catch(_) {
    console.log(_)
  }

},
infinityScroll() {
  if (!wsMain.modules['category-filter'].pageAwait) {
    wsMain.modules['category-filter'].pageAwait = true;

    setTimeout(() => {        
      console.log('Console log settimeout')
      let list = document.querySelector('[data-wsjs-infinity="holder"]'), listInfos = list.getBoundingClientRect();

      let listItens = list.querySelectorAll(".prod-showcase-holder"),
          lastItemInfos = listItens[listItens.length - 1].getBoundingClientRect();
      
      let distanceFromTop = window.scrollY + listInfos.top;
      let lastLineHeight = lastItemInfos.height*1.2

      if ((distanceFromTop + listInfos.height) - lastLineHeight < window.innerHeight + window.scrollY) {
        console.log('INFINITY TRIGGER')
        wsMain.modules['category-filter'].infinityList();
        console.log('Numero de produtos', listItens.length)
        setTimeout(() => {
          wsMain.modules['category-filter'].pageAwait = false;
        }, 1200);
      } else {
        wsMain.modules['category-filter'].pageAwait = false;
      }
    }, 400);    
  }
}
});
