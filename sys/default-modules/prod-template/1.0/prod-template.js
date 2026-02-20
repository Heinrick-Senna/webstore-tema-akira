wsMain.createModule({
  name: 'prod-template',
  createProd(prod, template, configs) {
      Object.keys(configs).forEach(k => {
        if (!configs[k]) template.querySelectorAll(`[data-wsjs-prod-template="${k}"]`).forEach(elm => elm.remove());
      });

      function replaceData(elm, query) {
          let div = template.querySelector(`[data-wsjs-prod-template="${query}"]`);
          if (div) {
            try {

              div.getAttributeNames().forEach((attr) => {

                if (
                  attr != "data-wsjs-module" &&
                  attr != "data-wsjs-options" &&
                  attr != 'data-wsjs-infos' && 
                  attr != 'data-wsjs-banner' &&
                  attr != 'data-wsjs-listing' && 
                  attr != 'data-wsjs-prod-list' &&
                  attr != 'data-wsjs-prod-template' &&
                  attr != 'data-wsholder'
                  ) {
                    elm.setAttribute(attr, div.getAttribute(attr));
                  }
                });
                
                div.parentNode.insertBefore(elm, div);
                div.remove();
              } catch(err) {
                console.log(err);
              }
          }
      }

      function getOptionText(elm) {
          let optionText = template.querySelector(`[data-wsjs-prod-template=${elm}]`).innerHTML;

          return optionText;
      }

      replaceData(wsMain.tools.createElm({type: 'p', innerHTML: prod.nome}), 'name');

      /* Tratativa Imagens */
      let imgHiperLink = wsMain.tools.createElm({type: 'a', attrs: { href: prod.links['ver_produto'] }});

      
      let photo = prod.fotos && prod.fotos[0] ? prod.fotos[0] : '';

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
      

      let img = wsMain.tools.createElm({
        type: 'img',
        lazyLoad: configs.lazyLoad,
        attrs: { 
          src: photo,
          alt: prod.nome
        }
      });
      
      imgHiperLink.style.setProperty('aspect-ratio', aspectRatio);

      if (prod.fotos && prod.fotos[0]) imgHiperLink.append(img);
      else {
        imgHiperLink.innerHTML = `<span data-wsjs-icon="noimage"></span>`;
        imgHiperLink.classList.add('whithout-image');
      }
    
    replaceData(imgHiperLink, 'image');

      if (prod.disponivel) {

          if (typeof WsFavoritos != undefined) {
              let icons = '<span data-wsjs-icon="favorite"></span>';

              let div = wsMain.tools.createElm({
                  type: 'div',
                  innerHTML: icons,
                  attrs: {
                      id: 'prod-favorite-link-' + prod.id,
                      data: 'prod-favorite-link-' + prod.id, 
                      onclick: `funcAddFavoriteWs("${prod.id}");`
                  }
              });
              replaceData(div, 'favorite');
          }

          // Tratativa PreÃ§os
          let precos = prod.precos;
          if (precos) {
              let defaultPrice = precos.preco, promoPrice = precos.preco_promocao;
              let precoMain;
              
              if (isNaN(promoPrice) || promoPrice >= defaultPrice || promoPrice == 0) {
                  replaceData(wsMain.tools.createElm({type: 'span', innerHTML: wsMain.data.treatPrice(defaultPrice)}), 'price-main');
                  precoMain = defaultPrice;
              } else if (promoPrice < defaultPrice) {
                  replaceData(wsMain.tools.createElm({type: 'span', innerHTML: wsMain.data.treatPrice(promoPrice)}), 'price-main');
                  replaceData(wsMain.tools.createElm({type: 'span', innerHTML: wsMain.data.treatPrice(defaultPrice)}), 'price-second');
                  precoMain = promoPrice;

                  let spanText = getOptionText('desconto');
                  let descountPercentage = Math.round(100 - (((promoPrice)*100)/defaultPrice));
                  if (spanText == null || spanText == undefined) spanText = '% Desconto';
                  let spanTag = wsMain.tools.createElm({type: 'span', innerHTML: descountPercentage + spanText});
                  replaceData(spanTag, 'desconto');
              } else {
                  alert('preco-a-combinar');
              }
              
              let maxInstallments = precos.max_parcelas, minValueToDivide = precos.valor_min_parcelas;
              let installmentsNum, installments = [];
              
              if (maxInstallments && !isNaN(maxInstallments) && precoMain > minValueToDivide) {
                  for (let i = maxInstallments; i > 1; i--) {
                      let newInstallment = precoMain / i;
                      if (newInstallment >= minValueToDivide && typeof installmentsNum == 'undefined') installmentsNum = i;
                  }
                  
              // PadrÃ£o com juros
              if (installmentsNum) {
                  let installmentString = installmentsNum + 'x de ' + wsMain.data.treatPrice(precoMain/installmentsNum);
                  if (precos.juros_inicia && !isNaN(precos.juros_inicia) && precos.juros_inicia > installmentsNum) installmentString += ' sem juros';
                  
                  let spanInstallment = wsMain.tools.createElm({type: 'span', innerHTML: installmentString});
                  
                  replaceData(spanInstallment, 'price-installment');
              }
              
              
              // PadrÃ£o sem juros
              // if (installmentsNum && installmentsNum >= precos.juros_inicia) {
                  //     let installmentString = installmentsNum + 'x de ' + wsMain.data.treatPrice(precoMain/installmentsNum) + ' sem juros';
                  //     let spanInstallment = wsMain.tools.createElm({type: 'span', innerHTML: installmentString});
                  //     replaceData(spanInstallment, 'price-installment');
                  // }
              }
              
              if (precos.desconto_avista && !isNaN(precos.desconto_avista)) {
                  let spanCache = wsMain.tools.createElm({type: 'span', innerHTML: wsMain.data.treatPrice(precoMain - (precoMain * (precos.desconto_avista/100))) + ' &agrave; vista'});
                  replaceData(spanCache, 'price-cash');
              }

              if (prod.links?.botao_comprar) {
                  replaceData(wsMain.tools.createElm({type: 'a', innerHTML: 'Adicionar ao carrinho', attrs: {
                      href: prod.links.botao_comprar
                  }}), 'button');
              }

          } else {
              let consultPrice = wsMain.tools.createElm({type: 'span', innerHTML: 'PreÃ§o sobe consulta', attrs: {
                  class: 'prod-consult-message'
              }});
              replaceData(consultPrice, 'price-main');
              template.children[0].classList.add('consult')
          }

          if (prod.lancamento) {
              let spanText = getOptionText('lancamento');
              if (spanText == null || spanText == undefined) spanText = 'LanÃ§amento';
              let spanTag = wsMain.tools.createElm({type: 'span', innerHTML: getOptionText('lancamento') || 'LanÃ§amento'});
              replaceData(spanTag, 'lancamento');
          }

          if (prod.fretegratis) {
              let spanText = getOptionText('frete-gratis');
              if (spanText == null || spanText == undefined) spanText = 'Frete GrÃ¡tis';
              let spanTag = wsMain.tools.createElm({type: 'span', innerHTML: spanText});
              replaceData(spanTag, 'frete-gratis');
          }

          

      } else {
          let spanMessage = wsMain.tools.createElm({
            type: 'span', 
            innerHTML: 'Produto indispon&iacute;vel'
          });
          template.children[0].classList.add('unavaliable');
          replaceData(spanMessage, 'price-main');
          spanMessage.classList.add('prod-unavaliable-message');
      }

      template.querySelectorAll('[data-wsjs-prod-template]').forEach(elm => {
          try {elm.remove(); } catch(e) {}
      });

      return template;
  }
});
