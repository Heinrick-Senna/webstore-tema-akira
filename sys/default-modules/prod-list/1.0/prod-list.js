wsMain.createModule({
  // Nome do MÃ³dulo
  name: 'product-list',
  // Nome da FunÃ§Ã£o (get nÃ£o precisaria ser colocado pois Ã© o padrÃ£o);
  function: 'get',
  // VÃ¡riaveis de configuraÃ§Ã£o
  options: {
      templateConfigs: {
          "image": true,
          "name": true,
          "price-main": true,
          "price-second": true,
          "price-installment": true,
          "price-cash": true,
          "button": false,
          "desconto": true,
          "lancamento": true,
          "frete-gratis": true,
          "favorito": true,
          "lazyLoad": true,
      },
  },
  data: {},
  // Gatilho do MÃ³dulo
  async get() {
      document.querySelectorAll('[data-wsjs-prod-list]').forEach(async elm => {
          let functionName = elm.getAttribute('data-wsjs-prod-list');

          let data = await ApiWS.Calls.listProducts[functionName]();
          let options = wsMain.tools.getWsData(elm, 'options');
          let text = elm.innerHTML;
          
          let vrfSearch = document.querySelector('#LV_HD_BUSCA_VALOR');
          if (vrfSearch) document.querySelectorAll('*[data-wsjs-search="false"]').forEach(item => item.remove());

          if (data && (data?.totalitens > 0 || data?.grupos?.length > 0 || data.length > 0)) {
            wsMain.modules[this.funcName].create[functionName](data, options, text);
            try {
              console.log('Chegou aqui')
              document.querySelectorAll('*[data-wsjs-remove]').forEach(elm => elm.removeAttribute('data-wsjs-remove'));
            } catch(_) {}
          } else if (functionName == 'category') wsMain.modules[this.funcName].showEmpty();
        });
      return true;
  },
  create: {
      group(returnJson) {
          this.list(returnJson?.grupos, 'group');
      },
      related(returnJson, options, text) {
          this.list([{codigo: 'relacionados', nome: text, breve: '', produtos: returnJson}], 'related');
      },
      spotlight(returnJson, options, text) {
          this.list([{codigo: 'destaque', nome: text, breve: '', produtos: returnJson.produtos}], 'spotlight');
      },
      previous(returnJson, options, text) {
          this.list([{codigo: 'ultimo', nome: text, breve: '', produtos: returnJson.produtos}], 'previous');
      },
      home(returnJson, options, text) {
        this.list([{codigo: 'home', nome: text, breve: ``, produtos: returnJson.produtos}], 'home');          
      },
      category(returnJson, options, text) {
        this.list([{codigo: 'category', nome: text, breve: '', produtos: returnJson.produtos}], 'category');          
      },
      list(arr, name) {
          try {
              let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['product-list'].templateConfigs));
              let optionsUsed = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}"]`), 'options') || {};

              templateConfigs = {...templateConfigs, ...optionsUsed};

              let template = document.querySelector('[data-wsjs-module="prod-template"] > *');

              if (!Array.isArray(arr) && arr.length == 0) return;
  
              let groupSection = wsMain.tools.createElm('section');

              let arrSlider = [];
              
              arr.forEach((actualGroup, i) => {
                  let groupSpan = document.querySelector(`*[data-wsjs-prod-list="${i}"]`);

                  let spanToGetData = name == 'group' && groupSpan ? groupSpan : document.querySelector(`[data-wsjs-prod-list="${name}"]`);
                  
                  if (name == 'group' && groupSpan) {
                    let optionsOfGroup = wsMain.tools.getWsData(groupSpan, 'options');
                    templateConfigs = {...templateConfigs, ...optionsOfGroup}
                  }
                  
                  if (!Array.isArray(actualGroup.produtos) || actualGroup.produtos.length == 0) return;
  
                  let groupHolder =  wsMain.tools.createElm({
                      type: 'div', 
                      attrs: {
                          class: `prod-list prod-list-${name} ${templateConfigs.container != false ? 'container' : '' }`,
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
  
                  let groupTitle = wsMain.tools.createElm({
                      type: 'h2', 
                      innerHTML: actualGroup.nome || ''
                  });
                  
                  let subtitle = wsMain.tools.createElm({
                      type: 'p', 
                      innerHTML: actualGroup.breve || ''
                  });
  
                  titleHiperLink.append(groupTitle);
  
                  let groupList = wsMain.tools.createElm({
                      type: 'div',
                      attrs: {
                        class: 'prod-list-holder'
                      }
                  });

                  if (actualGroup.nome) divTexts.append(titleHiperLink);
                  if (actualGroup.breve) divTexts.append(subtitle);
  
                  for (let z = 0; z < actualGroup.produtos.length; z++) {
                      let actualProd = actualGroup.produtos[z];
                          try {
                              groupList.append(wsMain.modules['prod-template'].createProd(actualProd, template.cloneNode(true), templateConfigs));
                              // console.log('Tudo bem com produto');  
                              // console.log(actualGroup.produtos[z]);
                            } catch(e) {
                              console.log('Erro com o produto');  
                              console.log(actualGroup.produtos[z]);
                            console.error(e);
                          }
                  }

                  let slideOptions = wsMain.tools.getWsData(spanToGetData, 'slide') || false;
                  if (name == 'group' && !slideOptions && wsMain.modules['product-list'].cache) slideOptions = wsMain.modules['product-list'].cache;
                  if (slideOptions && name == 'group') wsMain.modules['product-list'].cache = slideOptions;
                  let slideSuccess;


                  if (slideOptions) {
                    [slideSuccess, arrSlider[i]] = wsMain.tools.createSlide(groupList, slideOptions);
                    wsMain['prod-slides'].push(arrSlider[i]);
                    if (!slideSuccess) return;
                  }

                  groupHolder.append(groupList);
                  if (actualGroup.breve || actualGroup.nome) groupList.append(divTexts);
                  
                  if (name == 'group' && groupSpan) {
                    let groupClone = groupSection.cloneNode();
                        groupClone.append(groupHolder);
                    wsMain.tools.replaceSpanTag(groupSection, `prod-list="${i}"`, false, false);
                  } else if (name == 'group' && i == 0) {
                    groupSection.append(groupHolder);
                    wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);
                  } else if (name == 'group') {
                    let groupClone = groupSection.cloneNode();
                        groupClone.append(groupHolder);
                    groupSection.parentNode.insertBefore(groupClone, groupSection.nextSibling)
                  } else {
                    groupSection.append(groupHolder);
                    wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);
                  }

                  if (slideOptions) arrSlider[i].update();
              });
  

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
    try {
      document.querySelectorAll('[data-wsjs-listing="none"]').forEach(item => item.remove());
    } catch(_) {}

    let vrfSearch = document.querySelector('#LV_HD_BUSCA_VALOR');

    let container = wsMain.tools.createElm({
      type: 'div',
      attrs: {
        class: 'prod-list-empty'
      }
    });

    let title = wsMain.tools.createElm({
      type: 'h1',
      innerHTML: vrfSearch ? 'Nenhum produto encontrado' : 'Ainda n&atilde;o temos produtos nesta categoria'
    });

    let subtitle = wsMain.tools.createElm({
      type: 'p',
      innerHTML: vrfSearch ? `N&atilde;o localizamos nenhum produto relacionados a "${vrfSearch.value}".` : 'N&atilde;o se preocupe, temos muitos outros produtos para mostrar &agrave; voc&ecirc;.'
    });

    let subtitle_2 = wsMain.tools.createElm({
      type: 'p',
      innerHTML: 'Refa&ccedil;a a busca ou navegue pelas nossas categorias.'
    });

    let button = wsMain.tools.createElm({
      type: 'a',
      innerHTML: 'Ir &agrave;s compras',
      attrs: {
        class: 'button-main',
        href: '/'
      }
    });

    container.append(title);
    container.append(subtitle);
    if (vrfSearch) container.append(subtitle_2);
    container.append(button);



    wsMain.tools.replaceSpanTag(container, document.querySelector('[data-wsjs-prod-list="category"]'));
  }
});
