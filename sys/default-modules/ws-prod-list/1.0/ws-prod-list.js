wsMain.createModule({
  // Module name
  name: 'product-list',
  // Module function name
  function: 'get',
  actualGroup: 0,
  groupLength: document.querySelectorAll(`[data-wsjs-prod-list='group']`)?.length || false,
  // Configuration 
  options: {
    templateConfigs: {
      "image": true,
      "name": true,
      "price-main": true,
      "price-second": true,
      "price-installment": true,
      "price-cash": true,
      "button": false,
      "quantity-selector": false,
      "desconto": true,
      "lancamento": true,
      "frete-gratis": true,
      "favorito": true,
      "lazyLoad": true,
      "imageSize": 'MED',
      "startingOff": true,
      "redirect": false
    },
  },
  data: {},
  // Module Trigger
  async get() {
    wsMain.modules['product-list'].actualGroup = 0;
    wsMain.modules['product-list'].data['group'] = {};

    let isLancamento = Boolean(document.querySelector(`[data-wsjs-prod-list='lancamento']`));

    if (wsMain.modules['product-list'].groupLength > 0 || isLancamento) {
      wsMain.modules['product-list'].data['group'] = await ApiWS.Calls.listProducts['group']({
        prodLancamento: isLancamento ? '1' : null
      });
    }

    if (isLancamento) {
      let lancamentoIdx = false;
      wsMain.modules['product-list'].data['group'].grupos.forEach((group, groupIdx) => {
        if (group.type == 'lancamento') lancamentoIdx = groupIdx;
      });
      if (lancamentoIdx != false) wsMain.modules['product-list'].data['lancamento'] = wsMain.modules['product-list'].data['group'].grupos.splice(lancamentoIdx, 1);
    }

    if (wsMain.modules['product-list'].groupLength > 0) {
      let groups = document.querySelectorAll(`[data-wsjs-prod-list='group']`);
      if (!wsMain.modules['product-list'].data['group'].grupos) wsMain.modules['product-list'].data['group'].grupo  = []; 
      while (wsMain.modules['product-list'].data['group'].grupos.length < groups.length && document.querySelector(`[data-wsjs-prod-list='group']`)) {
        groups[groups.length - 1].remove();
        groups = document.querySelectorAll(`[data-wsjs-prod-list='group']`);
        wsMain.modules['product-list'].groupLength = groups.length;
      }
    }

    let promises = Array.from(document.querySelectorAll('[data-wsjs-prod-list]')).map(async elm => {
      let functionName = elm.getAttribute('data-wsjs-prod-list');
      if (functionName == 'template-empty-search' || functionName == 'template-empty-category') return;

      let options = wsMain.tools.getWsData(elm, 'options');
      let slideOptions = wsMain.tools.getWsData(elm, 'slide');
      let prodsPerlineSet = functionName == 'category' ? '{prodperline-categorie-var}' : '{prodperline-var}';
      let prodsPerLineVar = !isNaN(parseInt(prodsPerlineSet)) ? prodsPerlineSet : 4;

      if (slideOptions.slides && slideOptions.slides.perView) prodsPerLineVar = slideOptions.slides.perView;
      if (options['prods-perline']) prodsPerLineVar = options['prods-perline'];

      if (document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'true' && prodsPerLineVar >= 3) prodsPerLineVar = 2;

      let data = wsMain.modules['product-list'].data[functionName] || await ApiWS.Calls.listProducts[functionName](prodsPerLineVar);
      let text = elm.innerHTML;
      let breve = '';

      try {
        breve = elm.parentNode.parentNode.querySelector('template').innerHTML;
      } catch (err) { }

      let vrfSearch = document.querySelector('#LV_HD_BUSCA_VALOR');
      if (vrfSearch || document.querySelector("body").classList.contains('PagFabricante')) document.querySelectorAll('*[data-wsjs-search="false"]').forEach(item => item.remove());

      if (data && (data?.totalitens > 0 || data?.grupos?.length > 0 || data.length > 0)) {
        if (typeof nPanel != 'undefined' && nPanel.token && data["wssource"] == "ws-plchold") {
          if (functionName == 'group' || functionName == 'previous') {
            for (let i = data.grupos.length; i < wsMain.modules['product-list'].groupLength; i++) {
              data.grupos = [...data.grupos, data.grupos[0]];
            }
          }

          if (functionName == 'home') {
            let prodsPerline = 4;
            prodsPerline = !isNaN(parseInt('{prodperline-var}')) ? parseInt('{prodperline-var}') : prodsPerline;
            data.produtos = data.produtos.slice(0, (prodsPerline * 2));
          }

        }

        wsMain.modules['product-list'].create[functionName](data, options, text, breve);
        try {
          document.querySelectorAll('*[data-wsjs-remove]').forEach(elm => elm.removeAttribute('data-wsjs-remove'));
        } catch (_) { }

      } else if (functionName == 'category') wsMain.modules['product-list'].showEmpty();
    });

    await Promise.all(promises);
    wsMain.modules['product-list'].appPromoRelampago();
    return true;
  },
  create: {
    group(returnJson) {
      this.list(returnJson?.grupos, 'group');
    },
    related(returnJson, options, text, breve) {
      this.list([{ codigo: 'relacionados', nome: text, breve: breve, produtos: returnJson }], 'related');
    },
    suggestion(returnJson, options, text, breve) {
      this.list([{ codigo: 'sugestoes', nome: text, breve: breve, produtos: returnJson }], 'suggestion');
    },
    previous(returnJson, options, text, breve) {
      this.list([{ codigo: 'ultimo', nome: text, breve: breve, produtos: returnJson?.produtos || returnJson }], 'previous');
    },
    home(returnJson, options, text, breve) {
      this.list([{ codigo: 'home', nome: text, breve: breve, produtos: returnJson.produtos }], 'home');
    },
    lancamento(returnJson, options, text, breve) {
      this.list([{ codigo: 'lancamento', nome: returnJson[0].nome, breve: "", produtos: returnJson[0].produtos }], 'lancamento');
    },
    async category(returnJson, options, text, breve, infinity = false) {

      if (infinity) {
        let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['product-list'].templateConfigs));
        let optionsUsed = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="category"]`), 'options') || {};

        templateConfigs = { ...templateConfigs, ...optionsUsed };

        let template = document.querySelector('[data-wsjs-module="prod-template"] > *');

        let arrProds = [];

        for (let z = 0; z < returnJson.produtos.length; z++) {
          let actualProd = returnJson.produtos[z];
          try {
            arrProds.push(wsMain.modules['prod-template'].createProd(actualProd, template.cloneNode(true), templateConfigs));
          } catch (e) {
            console.log('Erro com o produto');
            console.log(returnJson.produtos[z]);
            console.error(e);
          }
        }
        return arrProds;

      } else {
        this.list([{ codigo: 'category', nome: text, breve: '', produtos: returnJson.produtos }], 'category');
      }
    },
    list(arr, name) {
      try {
        function formatSequence(a, b) {
          const initialArr = [];
          for (let i = 0; i < a; i++) initialArr.push(i);

          const output = [];
          let lastIndex = 0;
          const chunkSize = a === b ? 1 : parseInt(a / b);

          for (let i = 0; i < b; i++) {
            const value = initialArr.slice(lastIndex, i == b - 1 && a / b % 1 ? lastIndex + chunkSize + 1 : lastIndex + chunkSize);
            output.push(value);
            lastIndex += chunkSize;
          }

          return output;
        }

        let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['product-list'].templateConfigs));
        let optionsUsed = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}"]`), 'options') || {};

        templateConfigs = { ...templateConfigs, ...optionsUsed };

        let template = document.querySelector('[data-wsjs-module="prod-template"] > *');

        if (!Array.isArray(arr) && arr.length == 0) return;

        let groupSection = wsMain.tools.createElm('div');

        let arrSlider = [];

        arr.forEach((actualGroup, i) => {
          if (!Array.isArray(actualGroup.produtos) || actualGroup.produtos.length == 0) return;

          let groupHolder = wsMain.tools.createElm({
            type: 'section',
            attrs: {
              class: `prod-list prod-list-${name} ${templateConfigs.container != false ? 'container' : ''}`,
              id: 'code-list-' + actualGroup.codigo
            }
          });

          let divTexts = wsMain.tools.createElm({
            type: 'div',
            attrs: {
              class: 'prod-list-titles'
            }
          });

          let titleHiperLink = wsMain.tools.createElm({
            type: 'a',
            attrs: {
              class: 'prod-list-hiperlink',
              href: actualGroup.url && actualGroup.url != '' ? actualGroup.url : '#code-list-' + actualGroup.codigo
            }
          });

          function getTempInner(str) {
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = str;
            let strToReturn = tempDiv.innerHTML;
            tempDiv.remove();
            return strToReturn
          }

          let groupTitle = wsMain.tools.createElm({
            type: 'h2',
            innerHTML: actualGroup.nome || '',
            attrs: {
              class: 'prod-list-titles-title'
            }
          });

          if (name != 'group') {
            if (actualGroup.breve.trim() == '') {
              let dragBreve = document.querySelector(`template[data-wsjs-prod-list-template="${name}"]`)?.innerHTML.trim() || '';

              if (dragBreve.trim() != '') actualGroup.breve = dragBreve;

            }
          }

          let subtitle = wsMain.tools.createElm({
            type: 'p',
            innerHTML: actualGroup.breve || '',
            attrs: {
              class: 'prod-list-titles-subtitle'
            }
          });

          if (typeof nPanel != 'undefined' && nPanel.token) {
            groupTitle.setAttribute("data-wsjs-dragHolder", getTempInner("Digite aqui um t&iacute;tulo para sua listagem de produtos"));
            subtitle.setAttribute("data-wsjs-dragHolder", getTempInner("Digite aqui um par&aacute;grafo para chamar a aten&ccedil;&atilde;o de seus clientes"));
          }

          titleHiperLink.append(groupTitle);

          let groupList = wsMain.tools.createElm({
            type: 'div',
            attrs: {
              class: 'prod-list-holder'
            }
          });

          if (name != 'group' && (typeof nPanel != 'undefined' && nPanel.token)) {
            subtitle.setAttribute('contenteditable', 'plaintext-only')
            groupTitle.setAttribute('contenteditable', 'plaintext-only')
          }

          if (actualGroup.nome || (typeof nPanel != 'undefined' && nPanel.token)) divTexts.append(titleHiperLink);
          if (actualGroup.breve || (typeof nPanel != 'undefined' && nPanel.token)) divTexts.append(subtitle);

          let slideOptions = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}"]`), 'slide') || false;
          if (name == 'group' && !slideOptions && wsMain.modules['product-list'].cache) slideOptions = wsMain.modules['product-list'].cache;
          if (slideOptions && name == 'group') wsMain.modules['product-list'].cache = slideOptions;
          let slideSuccess;

          let prodsPerlineSet = name == 'category' ? '{prodperline-categorie-var}' : '{prodperline-var}';
          let prodsPerLineVar = !isNaN(parseInt(prodsPerlineSet)) ? prodsPerlineSet : 4;

          if (document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'true' && prodsPerLineVar >= 3) prodsPerLineVar = 2;

          if (!slideOptions && (!slideOptions.slides || !slideOptions.slides.perView)) {
            if (!isNaN(parseInt(prodsPerLineVar)) && parseInt(prodsPerLineVar) > 3 && !templateConfigs.imageSize) templateConfigs.imageSize = 'PEQ';
            if (!isNaN(parseInt(prodsPerLineVar)) && parseInt(prodsPerLineVar) <= 3 && !templateConfigs.imageSize) templateConfigs.imageSize = 'MED';
          }

          if (slideOptions && (!slideOptions.slides || !slideOptions.slides.perView)) {
            try {
              if (!isNaN(parseInt(prodsPerLineVar))) {
                if (!slideOptions.slides) slideOptions.slides = {}
                slideOptions.slides['perView'] = prodsPerLineVar
              }
            } catch (err) {
              console.log(err)
            }
          } else {
            try {
              // alert(optionsUsed['prods-perline'])
              prodsPerLineVar = optionsUsed['prods-perline'] ? optionsUsed['prods-perline'] : prodsPerLineVar;
              wsMain.globalData.infoLoja.perLineProds = prodsPerLineVar
            } catch (err) {
              console.log(err)
            }
          }

          try {
            if (slideOptions.slides.perView > 3 && !templateConfigs.imageSize) {
              templateConfigs.imageSize = 'PEQ';
            }
            if (slideOptions.slides.perView <= 3 && !templateConfigs.imageSize) {
              templateConfigs.imageSize = 'MED';
            }
          } catch (err) { }

          for (let z = 0; z < actualGroup.produtos.length; z++) {
            let actualProd = actualGroup.produtos[z];
            try {
              groupList.append(wsMain.modules['prod-template'].createProd(actualProd, template.cloneNode(true), templateConfigs));
            } catch (e) {
              console.log('Erro com o produto', actualGroup.produtos[z])
              console.error(e);
            }
          }

          if (slideOptions) {
            [slideSuccess, arrSlider[i]] = wsMain.tools.createSlide(groupList, slideOptions);
            wsMain['prod-slides'].push(arrSlider[i]);
            if (!slideSuccess) return;
          } else {
            groupList.style['gridTemplateColumns'] = `repeat(${prodsPerLineVar}, 1fr)`;
            divTexts.style['gridColumnEnd'] = `${parseInt(parseInt(prodsPerLineVar) + 1)}`;
          }


          groupHolder.append(groupList);
          if (actualGroup.breve || actualGroup.nome || (typeof nPanel != 'undefined' && nPanel.token)) groupList.append(divTexts);

          if (name != 'group') {
            let groupClone = wsMain.tools.createElm('div');
            groupClone.append(groupHolder);

            groupSection.append(groupClone);
            let attributes = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}]"`), 'options');

            wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);

            if (name == 'category') {
              try {
                if (templateConfigs.infinity || wsAppsConfig?.infinityList) {
                  groupSection.setAttribute('data-wsjs-options', attributes);
                  groupList.setAttribute('data-wsjs-infinity', 'holder');

                  document.querySelector('[data-wsjs-pagination="container"]').innerHTML =
                    '<button class="button-second" data-wsjs-infinityButton>Carregar mais produtos</button>'

                  document.querySelector('[data-wsjs-pagination="container"] [data-wsjs-infinityButton]').addEventListener('click', wsMain.modules['category-filter'].infinityList);

                  if (templateConfigs.infinity == 'scroll' || wsAppsConfig?.infinityList == '2') {
                    document.addEventListener("scroll", wsMain.modules['category-filter'].infinityScroll);
                  }
                }


              } catch (err) {
                console.log(err)
              }
            }
          }

          if (name == 'group') {
            if (wsMain.modules['product-list'].groupLength == 1) {
              groupSection.append(groupHolder);

              wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);
            } else {
              let actualSequence = formatSequence(arr.length, wsMain.modules['product-list'].groupLength)[wsMain.modules['product-list'].actualGroup];
              if (actualSequence.indexOf(i) != -1) {
                groupSection.append(groupHolder);
              }

              if (actualSequence.indexOf(i) != -1 && actualSequence.indexOf(i) == actualSequence.length - 1) {
                wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);

              }

            }
          }

          if (slideOptions) arrSlider[i].update();
        });

        // wsMain.modules['product-list'].actualGroup++;
        if (name == 'group') wsMain.modules['product-list'].actualGroup++;

        let existArrow = false;
        document.querySelectorAll('.prod-list').forEach(elm => {
          if (elm.querySelector('.arrow--prev')) existArrow = true;
        });

        if (existArrow) {
          document.querySelectorAll('.prod-list .need-offset').forEach(elm => {
            elm.classList.add('prod-list-offset');
            elm.classList.remove('need-offset');
          });
        }

        wsMain['prod-slides'].forEach(slider => slider.update());
      } catch (err) {
        console.log(err);
      }
    },
  },
  showEmpty() {
    let vrfSearch = document.querySelector('#LV_HD_BUSCA_VALOR');

    let container = wsMain.tools.createElm({
      type: 'div',
      attrs: {
        class: 'prod-list-empty'
      }
    });

    if (vrfSearch) container.innerHTML = document.querySelector('[data-wsjs-prod-list="template-empty-search"]').innerHTML.replace('{{value}}', vrfSearch.value);
    else container.innerHTML = document.querySelector('[data-wsjs-prod-list="template-empty-category"]').innerHTML;

    wsMain.tools.replaceSpanTag(container, document.querySelector('[data-wsjs-prod-list="category"]'));
  },
  appPromoRelampago() {
    if(typeof ws_promrelampago !== 'boolean') return
    if(!ws_promrelampago) return

    function calculateTimeRemaining(dateString) {
      const targetDate = new Date(dateString);
      const now = new Date();
      
      const differenceMs = targetDate - now;
    
      if (differenceMs <= 0) {
        return "";
      }
    
      const oneMinute = 60 * 1000;
      const oneHour = 60 * oneMinute;
      const oneDay = 24 * oneHour;
    
      if (differenceMs < oneMinute) {
        return ""; 
      } else if (differenceMs < oneHour) {
        const minutes = Math.floor(differenceMs / oneMinute);
        return `${minutes} minutes`;
      } else if (differenceMs < 48 * oneHour) {
        const hours = Math.floor(differenceMs / oneHour);
        return `${hours} horas`;
      } else {
        const days = Math.floor(differenceMs / oneDay);
        return `${days} dias`;
      }
    }
    
    function createPromoRelampagoElement(selector, data) {
      if(!selector || !data) return

      const prods = document.querySelectorAll(selector)

      prods.forEach(prod => {
        const div = document.createElement('div')
        div.classList.add('ws-promo-relampago-container')
        const timeRemaining = calculateTimeRemaining(data)
        div.innerHTML = `
        <p class="ws-promo-relampago__content prod-tags">Promo&ccedil;&atilde;o v&aacute;lida por ${timeRemaining}</p>
        `
  
        prod.appendChild(div)
      })
    }

    try {
      const etapa = document.querySelector("#HdEtapaLoja").value

      function appendPromoRelampagoElm(prodsArr) {
        if(!prodsArr || !prodsArr.length) return

        const products = [];
        const seenProd = new Set();

        prodsArr.forEach(obj => {
          if (!seenProd.has(obj.codigo)) {
            seenProd.add(obj.codigo);
            products.push(obj);
          }
        });

        if(!products) return

        products.forEach(prod => {
          const date =  prod?.precos?.preco_promocao_validade

          if(!date) return

          createPromoRelampagoElement(`[ws-prod-sku="${prod.codigo}"] .prod-showcase-image`, date)
        })
      }
   
      const etapaFuncAppPromoRelampago = {
        async HOME() {
          const listHomeProducts = wsMain?.globalData?.listHomeProds?.produtos
          const groupProducts = wsMain?.globalData?.listGroupProds?.grupos?.flatMap(obj => obj.produtos)
          const bruteProducts = []

          if(listHomeProducts) bruteProducts.push(listHomeProducts)
          if(groupProducts) bruteProducts.push(groupProducts)

          appendPromoRelampagoElm(bruteProducts.flat())
        },
        async PRODUTO() {
          const bruteProducts = wsMain?.globalData?.listRelatedProds 

          appendPromoRelampagoElm(bruteProducts)
        },
        async LISTAGEM() {
          const bruteProducts = wsMain?.globalData?.listCategoryProds?.produtos 

          appendPromoRelampagoElm(bruteProducts)
        },
      };
  
      etapaFuncAppPromoRelampago[etapa] != undefined ? etapaFuncAppPromoRelampago[etapa]() : '';
  
    } catch (err) {
      console.error(err);
    }
  }
});
