wsMain.createModule({
  name: 'category-filter',
  onlyAfter: 'info-lojas',
  function: 'get',
  subFunctions: {
    async orderSelect(target) {
      let val = target.value;
      await fetch("/carrinhoAJAX/listagem.aspx?TIPO=MUDA_ORDEM_LISTAGEM&ORDEM=" + val);
      let uri = new URL(window.location.href);
          uri.searchParams.delete('pagina');
      window.location.href = uri.href;
    },
    categoryName(obj, options, text ) {
      if (!obj.migalha) return false;
      let div = wsMain.tools.createElm({
        type: options.type,
        innerHTML: obj.migalha[obj.migalha.length -1].nome
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
    categoryFilter(obj, options, text) {
      let filters = obj.Filtros;

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
            optInput.setAttribute('checked', '');
          }
  
          let optLabel = wsMain.tools.createElm({
            type: 'label',
            for: 'filter-' + f.titulo + '-' + opt.nome,
            innerHTML: opt.nome
          });
  
          let optSpan = wsMain.tools.createElm('span');
  
          if (opt.selecionada) {
            let optHolder = wsMain.tools.createElm('div');
            optElm.innerHTML = '<span data-wsjs-icon="close"></span>'
            

            optHolder.append(optLabel)
            
            
            optHolder.append(optElm);


            activeFilters.append(optHolder);
          } else {
            optElm.append(optInput);
            optElm.append(optLabel);
            optElm.append(optSpan);
            optContainer.append(optElm);
          }
        });
  
        div.append(checkTitle);
        div.append(title);
        div.append(optContainer);
        
        container.append(div);
      });

      if (activeFilters.firstChild) {
        container.insertBefore(activeFilters, container.firstChild);
      } else if (document.querySelector('[data-wsjs-listing="categoryFilter"]').hasAttribute('data-wsjs-remove')) {
        document.querySelectorAll('*[data-wsjs-remove]').forEach(elm => elm.remove());
      } 
        
      return container;
    },
    prodsNum(obj, options, text) {
      let total = obj.paginacao?.total_itens;
      if (!total) return;     

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', total),
      });

      return span;
    },
    actualPage(obj, options, text) {
      let actualPage = obj.paginacao?.pagina_atual;
      if (!actualPage) return;

      document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.removeAttribute('data-wsjs-pagination'));
      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', actualPage),
      });

      return span;
    },
    pagesNum(obj, options, text) {
      let totalPages = obj.paginacao?.qtd_paginas;
      if (!totalPages) return;

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
      console.log('NUMERO DE PÃGINAS', lastPage, 'atual', actualPage);
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
  async get() {
    let listaCategorias = wsMain.globalData['ListaCategorias'];
    let listaProds = wsMain.globalData['listaListagem'];

    if (!listaCategorias) listaCategorias = await ApiWS.Calls.ListaCategorias();
    if (!listaProds) listaProds = await ApiWS.Calls.listProducts['category']();

    let data = {...listaCategorias, ...listaProds};

    return wsMain.modules[this.funcName].create(data);
  },
  create(returnJson) {
    // Tratativa PÃ¡gina de Favoritos
    if (window.location.href.split('.br/')[1] == 'produtos/favoritos') {
      document.querySelectorAll('[data-wsjs-favorite="false"]').forEach(item => item.remove());
      returnJson.migalha = [
        {
            "nome": "PÃ¡gina inicial",
            "url": "/",
            "atual": false
        },
        {
            "nome": "Favoritos",
            "url": "/produtos/favoritos",
            "atual": true
        }
    ];
    }
    
    wsMain.tools.replaceSubFunctions(returnJson, this.subFunctions, 'listing');

    setTimeout(() => {
      try {
         document.querySelectorAll('[data-wsjs-pagination=none]').forEach(item => item.remove());
      } catch(_){}
      try {
        document.querySelectorAll('[data-wsjs-listing=container]').forEach(item => item.style.opacity = '1');
      } catch(_){}
      try {
      
        document.querySelectorAll('[data-wsjs-listing=none]').forEach(item => item.style.opacity = '1');
      } catch(_){}
    }, 200);
    return true;
  },
  switchPage(page) {
    let uri = new URL(window.location.href);
    uri.searchParams.set('pagina', page);
    
      window.location.href = uri.href;
  },
  async switchFilter(carac, value = false) {
    try {
      let type = value ? 'FILTRO_CARAC' : 'FILTRO_CARAC_REMOVE';
      let actualFilters = document.querySelector('#HD_LV_FiltrosCaracAtuais')?.value || '';
      await fetch(`/carrinhoAJAX/listagem.aspx?TIPO=${type}&ATUAIS=${actualFilters}&CARAC=${carac}${value ? '&VALOR=' + (value) : ''}`);
      let uri = new URL(window.location.href);
          uri.searchParams.delete('pagina');
      window.location.href = uri.href;
    } catch(err) {
      console.log(err);
    }
  },
});
