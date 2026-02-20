wsMain.createModule({
  name: 'prod-template',
  createProd(prod, template, configs) {

    try {
      let prodButton = '{prodbutton-var}'

      if (prodButton == 2 || prodButton == 1) {
        configs.button = true;

        if (prodButton == 2) configs.redirect = true;
      }

    } catch (err) { }

    let precoMain;

    Object.keys(configs).forEach(k => {
      if (!configs[k]) template.querySelectorAll(`[data-wsjs-prod-template="${k}"]`).forEach(elm => elm.remove());
    });

    function replaceData(elm, query, strValue) {
      let divArr = template.querySelectorAll(`[data-wsjs-prod-template="${query}"]`);
      divArr.forEach(div => {
        if (div) {
          try {
            let elmToReplace = elm.cloneNode(true);

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
                elmToReplace.setAttribute(attr, div.getAttribute(attr));
              }
            });

            if (query == 'price-main' && configs.startingOff && Array.isArray(prod.variacoes) && prod.variacoes.length > 0) {
              let isHighEnough = false;
              prod.variacoes.forEach(prodVar => {
                if (prodVar.prices.price && prodVar.prices.price > precoMain) isHighEnough = true;
              })
              if (isHighEnough) elmToReplace.innerHTML = '<span class="price-startingOff">A partir de</span> ' + elmToReplace.innerHTML
            }

            if (strValue) {
              let template = div.innerHTML;
              let elmValue = elmToReplace.innerText;

              if (template.indexOf('{{value}}') != -1) elmToReplace.innerHTML = template.replace(/{{value}}/gm, elmValue);
            }

            div.parentNode.replaceChild(elmToReplace, div);
          } catch (err) {
            console.log(err);
          }
        }
      })
    }

    template.setAttribute('ws-prod-sku', prod.codigo);
    template.setAttribute('ws-prod-id', prod.id);

    try {
      if (prod.fabricante) {
        let manufacturerDiv = wsMain.tools.createElm({
          type: 'a',
          attrs: {
            href: prod.fabricante.url || ''
          }
        });

        manufacturerDiv.innerHTML = prod.fabricante.nome;

        replaceData(manufacturerDiv, 'manufacturer');
      }
    } catch (err) {

    }

    replaceData(wsMain.tools.createElm({ type: 'p', innerHTML: prod.nome }), 'name');

    try {
      if (prod.integracoes && prod.integracoes.length > 0) prod.integracoes.forEach(integ => {
        if (integ.tipo == 'trustvox_list') {
          let trustVoxDiv = wsMain.tools.createElm({
            type: 'div',
            innerHTML: integ.conteudo,
            attrs: {
              class: 'prod-shwocase-trustvox-container'
            }
          });
          replaceData(trustVoxDiv, 'trustvox-container');
        }
      });
    } catch (err) { }

    try {

      template.querySelectorAll('[data-wsjs-prod-template="link"]').forEach(item => {
        item.setAttribute('href', prod.links['ver_produto']);
        item.setAttribute('title', prod.nome);
        item.removeAttribute('data-wsjs-prod-template');
      });
    } catch (_) { }

    /* Tratativa Imagens */

    if (!configs.imageSize) configs.imageSize = 'PEQ';
    let virtualWidth = configs.imgAttr ? configs.imgAttr.split('x')[0] : 213;
    let virtualHeight = configs.imgAttr ? configs.imgAttr.split('x')[1] : 263;

    let imgHiperLink = wsMain.tools.createElm({ type: 'a', attrs: { href: prod.links['ver_produto'] } });
    if (prod.fotos) {

      function hoverImage() {
        let img = template.querySelector('img:nth-child(2)');
        template.classList.add(`photo-swap-${configs.photoSwap || 'opacity'}`)
        img.setAttribute('src', img.getAttribute('othersrc'))
        img.removeAttribute('othersrc')
        template.removeEventListener('mouseover', hoverImage);
      }

      prod.fotos.forEach((photo, i) => {
        if (i > 1 || (i == 1 && document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == true)) return;

        photo = photo.replace('PEQ_', configs.imageSize + '_');

        let imgObj = {
          type: 'img',
          lazyLoad: i == 1 ? false : configs.lazyLoad,
          attrs: {
            width: virtualWidth,
            height: virtualHeight,
            alt: prod.nome
          }
        }

        if (i == 1) {
          imgObj.attrs['otherSrc'] = photo
        } else imgObj.attrs['src'] = photo

        let img = wsMain.tools.createElm(imgObj);

        if (i == 1) {
          template.classList.add(`photo-swap-transform-${configs.photoSwap || 'opacity'}`);
          template.addEventListener('mouseover', hoverImage);
        }

        imgHiperLink.append(img);
      });

    } else {
      imgHiperLink.innerHTML = `<span data-wsjs-icon="noimage"></span>`;
      imgHiperLink.classList.add('whithout-image');
      imgHiperLink.setAttribute('title', 'Produto sem Imagem');
    }

    replaceData(imgHiperLink, 'image');

    if (prod.disponivel) {

      if (typeof WsFavoritos != 'undefined') {
        let iconOnTemplate = template.querySelector('[data-wsjs-prod-template="favorite"]')?.innerHTML;

        let iconToUse = iconOnTemplate && iconOnTemplate.trim() != '' ? iconOnTemplate : '<span data-wsjs-icon="favorite"></span>';

        let div = wsMain.tools.createElm({
          type: 'div',
          innerHTML: iconToUse,
          attrs: {
            id: 'prod-favorite-link-' + prod.id,
            data: 'prod-favorite-link-' + prod.id,
            onclick: `funcAddFavoriteWs("${prod.id}");`
          }
        });
        replaceData(div, 'favorite');
      }

      // Treating Prices
      let precos = prod.precos;
      if (precos) {
        let defaultPrice = precos.preco, promoPrice = precos.preco_promocao;
        if (defaultPrice > 0) {
          try {
            template.querySelector('[data-wsjs-prod-template="price-container"]').removeAttribute('data-wsjs-prod-template');
          } catch (err) { }
          try {

            if (isNaN(promoPrice) || promoPrice >= defaultPrice || promoPrice == 0) {
              precoMain = defaultPrice;
              replaceData(wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(defaultPrice) }), 'price-main', true);
            } else if (promoPrice < defaultPrice) {
              precoMain = promoPrice;
              replaceData(wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(promoPrice) }), 'price-main', true);
              replaceData(wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(defaultPrice) }), 'price-second', true);

              let descountPercentage = Math.round(100 - (((promoPrice) * 100) / defaultPrice));
              descountPercentage = descountPercentage < 1 ? 1 : descountPercentage;
              let spanTag = wsMain.tools.createElm({ type: 'span', innerHTML: descountPercentage });
              replaceData(spanTag, 'desconto', true);
            } else {

            }

          } catch (err) { }

          try {

            let maxInstallmentNum = precos.max_parcelas, minInstallmentsValue = precos.valor_min_parcelas;
            let initFeeNum = precos.juros_inicia, initFeeValue = precos.juros;

            if (maxInstallmentNum > 0) {
              let whithoutFee = initFeeNum > 0 && initFeeValue > 0;
              let installmentValue = precoMain, installmentNum;

              if (whithoutFee) {
                installmentNum = initFeeNum < maxInstallmentNum ? (initFeeNum - 1) : maxInstallmentNum;
                installmentValue = wsMain.data.compostFeeValue(initFeeValue, installmentNum, initFeeNum, precoMain);

                while (installmentNum > 0 && installmentValue < minInstallmentsValue) {
                  installmentNum--;

                  if (installmentNum > 0) installmentValue = wsMain.data.compostFeeValue(initFeeValue, installmentNum, initFeeNum, precoMain);
                }

                if (installmentNum == 0) whithoutFee = false;

              }

              if (!whithoutFee) {
                installmentNum = maxInstallmentNum;

                installmentValue = wsMain.data.compostFeeValue(initFeeValue, installmentNum, initFeeNum, precoMain);

                while (installmentValue < minInstallmentsValue && installmentNum > 0) {
                  installmentNum--;

                  if (installmentNum > 0) installmentValue = wsMain.data.compostFeeValue(precos.juros, installmentNum, initFeeNum, precoMain);
                }
              }

              if (installmentNum == 0) installmentNum = 1;

              let installmentString = installmentNum + 'x de ' + wsMain.data.treatPrice(installmentValue);

              if (whithoutFee) installmentString += ' sem juros';

              let spanInstallment = wsMain.tools.createElm({ type: 'span', innerHTML: installmentString });

              replaceData(spanInstallment, 'price-installment', true);
            }

          } catch (err) {

          }

          try {
            if (configs['price-cash'] && precos.desconto_avista && !isNaN(precos.desconto_avista)) {
              let priceTemplate = template.querySelector('[data-wsjs-prod-template="price-cash"]');
              if (priceTemplate) {
                let spanText = wsMain.data.treatPrice(precoMain - (precoMain * (precos.desconto_avista / 100)));
                let spanCache = wsMain.tools.createElm({ type: 'span', innerHTML: spanText });
                replaceData(spanCache, 'price-cash', true);
              }
            }
          } catch (err) {

          }

          try {

            if (configs.button) {
              if (wsMain.globalData.infoLoja?.estrutura?.modo != '2' && wsMain.globalData.infoLoja?.estrutura?.modo != '3') {
                template.querySelector('[data-wsjs-prod-template="button-container"]').removeAttribute('data-wsjs-prod-template');
                let shopId = document.querySelector('#HD_LV_ID').value;

                try {
                  if (configs["quantity-selector"]) {
                    let inputSelector = template.querySelector('[data-wsjs-prod-template="quantity-selector"]');
                    inputSelector.removeAttribute('data-wsjs-prod-template');
                    inputSelector.setAttribute('id', 'HD_QTD_PROD_' + prod.id);
                    inputSelector.setAttribute('min', prod.qtdminima <= 0 ? 1 : prod.qtdminima);
                    inputSelector.setAttribute('value', 1);
                  }
                } catch (err) {

                }

                let afterFunction = !configs.redirect ? 'wsMain.modules["cart-drawer"].changeState()' : "";

                let buttonLink = `javascript:void(wsFuncBtBuyOnList('${shopId}', '${prod.id}', '${afterFunction}'))`;
                let buttonClass = !configs.redirect ? 'button-second' : 'button-main';

                try {
                  let templateButtonClass = template.querySelector('[data-wsjs-prod-template="button"]').getAttribute('class');
                  if (templateButtonClass && templateButtonClass.trim() != '') buttonClass = templateButtonClass;
                } catch (err) { }

                replaceData(
                  wsMain.tools.createElm({
                    type: 'a',
                    innerHTML: !configs.redirect ? 'Adicionar' : 'Comprar',
                    attrs: {
                      "data-sku": prod.codigo,
                      class: buttonClass,
                      href: buttonLink
                    }
                  })
                  ,
                  'button');
              }
            }
          } catch (err) {

          }
        } else {
          try {
            template.querySelector('[data-wsjs-prod-template="price-container"]').remove();
          } catch (err) { }
        }

      } else {
        try {
          template.querySelector('[data-wsjs-prod-template="price-container"]').removeAttribute('data-wsjs-prod-template');
        } catch (err) { }
        let consultPrice = wsMain.tools.createElm({
          type: 'span',
          innerHTML: 'Pre&ccedil;o sob consulta',
          attrs: {
            class: 'prod-consult-message'
          }
        });
        replaceData(consultPrice, 'price-main');
        template.classList.add('consult');
        template.children[0].classList.add('consult');
      }

      if (prod.lancamento) {
        let spanText = template.querySelector('[data-wsjs-prod-template="lancamento"]').innerHTML;
        let spanTag = wsMain.tools.createElm({ type: 'span', innerHTML: spanText });
        replaceData(spanTag, 'lancamento');
      }

      if (prod.fretegratis) {
        let spanText = template.querySelector('[data-wsjs-prod-template="frete-gratis"]').innerHTML;
        let spanTag = wsMain.tools.createElm({ type: 'span', innerHTML: spanText });
        replaceData(spanTag, 'frete-gratis');
      }



    } else {
      try {
        template.querySelector('[data-wsjs-prod-template="price-container"]').removeAttribute('data-wsjs-prod-template');
      } catch (err) { }
      let spanMessage = wsMain.tools.createElm({
        type: 'span',
        innerHTML: 'Indispon&iacute;vel'
      });
      template.classList.add('unavaliable');
      template.children[0].classList.add('unavaliable');
      replaceData(spanMessage, 'price-main');
      spanMessage.classList.add('prod-unavaliable-message');
    }

    template.querySelectorAll('[data-wsjs-prod-template]').forEach(elm => {
      if (elm.getAttribute('data-wsjs-prod-template') == 'ws-review') {
        if (!wsMain.modules['app-review']) elm.remove();
      } else {
        try { elm.remove(); } catch (e) { }
      }
    });

    return template;
  }
});
