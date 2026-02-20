wsMain.createModule({
  name: 'cart-drawer',
  function: 'get',
  virtualTemplate: {
    total: []
  },
  async get() {
    document.addEventListener('keydown', (event) => {
      if(event.key == 'Escape') {
        const cartOverlay = document.querySelector('[data-wsjs-cart="overlay-holder"]')
        if(cartOverlay.style.width == "100%") {
          wsMain.modules['cart-drawer'].changeState();
        }
      }
    });

    let data = await ApiWS.Calls.carrinho();    
    return wsMain.modules['cart-drawer'].refresh(data);
  },
  refresh(returnJson) {
    let btn = document.querySelector('[data-wsjs-cart="button"]');
    let btnOptions = wsMain.tools.getWsData(btn ,'options');
      let innerCart = '', innerProds = '';
      let itensHolder = document.querySelector('[data-wsjs-cart="items-holder"]'),
          defaultMsg = document.querySelector('[data-wsjs-cart="default-message"]'),
          totalItensInCart = document.querySelector('.cart-holder > [data-wsjs-cart="total"]') || document.querySelector('.cart-holder > .mobile-menu-side > [data-wsjs-cart="total"]'),
          bottomMsg = document.querySelector('[data-wsjs-cart="bottom-message"]');

      let linkCarrinho = `/carrinho`;

      document.querySelectorAll('[data-wsjs-cart="link"]').forEach(elm => elm.setAttribute('href', linkCarrinho));
      document.querySelectorAll('[data-wsjs-cart="total"]').forEach((elm, i) => {
        if (elm.innerHTML.indexOf('{{value}}') != -1) {
            wsMain.modules['cart-drawer'].virtualTemplate.total[i] = elm.innerHTML;
        }
        elm.innerHTML =  wsMain.modules['cart-drawer'].virtualTemplate.total[i].replace('{{value}}', wsMain.data.treatPrice(returnJson.total))
        try {
          elm.style.opacity = '';
        } catch(err) {}
        try {
          wsMain.addons.dataLoad(elm);
        } catch(err) {}
      });

      document.querySelectorAll('[data-wsjs-cart="items-holder"] > *:not([data-wsjs-cart="template"])').forEach(item => item.remove());
      if (Array.isArray(returnJson?.products) && returnJson?.products?.length > 0) {
          defaultMsg.setAttribute('style', 'display: none;');
          totalItensInCart ? totalItensInCart.removeAttribute('style') : '';
          itensHolder.classList.add('cartHasItens')
          document.querySelector('.cart-holder .cart-default-message a').style.display = '';
          returnJson.products.forEach(prod => {
            let template = document.querySelector('[data-wsjs-cart=template]').cloneNode(true);

            let variationIndex = 0;
            
            template.querySelectorAll('[data-wsjs-cart]').forEach(tag => {

              let tagName = tag.getAttribute('data-wsjs-cart');
              let value = prod[tagName];

              if (tagName == 'variation') {
                if (prod.attributes[variationIndex]) {
                  value = prod.attributes[variationIndex].type + ': ' + prod.attributes[variationIndex].value;
                  variationIndex++;
                } else return;
              }
              
              if (tagName == 'photo_url') {
                let img = wsMain.tools.createElm({
                  type: 'img',
                  lazyLoad: false,
                  attrs: {
                    alt: prod['name'],
                    src: value
                  }
                });

                wsMain.tools.replaceSpanTag(img, tag);

              } else {
                if (tagName == 'price') value = wsMain.data.treatPrice((value*prod.qtd));
                let spanDiv = wsMain.tools.createElm({type: 'span', innerHTML: value});
                
                wsMain.tools.replaceSpanTag(spanDiv, tag);
              }
            });

            template.setAttribute('href', prod.url);
            template.removeAttribute('data-wsjs-cart');
            template.setAttribute('class', 'cart-item-holder');

            itensHolder.append(template);
          });
          
          bottomMsg.removeAttribute('style');
          innerCart += `<a class='cart-button' href="${returnJson.link}">ver carrinho</a>`;

      } else {
        if (btnOptions.float == true ) {
          document.querySelector('.cart-holder .cart-default-message a').style.display = 'none';
        }
        
        defaultMsg.removeAttribute('style');
        totalItensInCart ? totalItensInCart.style.display = "none" : '';
        itensHolder.classList.remove('cartHasItens')
        bottomMsg.setAttribute('style', 'display: none;')
        while(itensHolder.childElementCount > 1) {
            itensHolder.lastChild.remove();
        }
      }

      if (document.querySelector('[data-wsjs-cart="counter"]')) document.querySelector('[data-wsjs-cart="counter"]').innerHTML = returnJson?.qtdItems || 0;

      // cart.innerHTML =  '<div class=cart-prod-container>' + innerProds + '</div>' + innerCart;

      if (btnOptions.float != true) {
        if (typeof nPanel == 'undefined') {
          btn.addEventListener('click', () => wsMain.modules['cart-drawer'].changeState());
        }
      } else {
        document.querySelector('[data-wsjs-cart="holder"]').classList.add('float');
        btn.setAttribute('href', linkCarrinho);
      }

      console.log(returnJson)
      if (!returnJson.qtdItems || returnJson.qtdItems == 0) {
        btn.classList.add('cart-empty')
        document.querySelector('[data-wsjs-cart="holder"]').classList.add('empty');
      } else {
        btn.classList.remove('cart-empty')
        document.querySelector('[data-wsjs-cart="holder"]').classList.remove('empty');
      }

        document.querySelector('[data-wsjs-cart="holder"]').style.display = '';
      return true;
  },
  changeState(force = false, onlyOpen = false) {
    try { wsMain.modules['cart-drawer'].get(); } catch(err) {('A chamada do carrinho n&atilde;o conseguiu ser realizada', err)}
    if(onlyOpen) {
      return;
    }
    let btn = document.querySelector('[data-wsjs-cart="button"]');
    let btnOptions = wsMain.tools.getWsData(btn ,'options');
    let cartHolder = document.querySelector(`[data-wsjs-cart="holder"]`);
    let body = document.querySelector('body');

    let state = btn.getAttribute('cart-state') == 'true';
    
    btn.setAttribute('cart-state', !state);

    if (btnOptions.mobile == true) {
      if (state) {
        cartHolder.style.transform = 'translateX(100%)';
        cartHolder.classList.remove('active');
      } else {
        cartHolder.classList.add('active');
        cartHolder.style.transform = 'translateX(0)';
      }
    } else {
      if (state || force && !document.querySelector('[data-wsjs-cart="overlay-holder"]').classList.contains('float')) {          
        body.style.left = '';
        body.style.overflow = '';
        cartHolder.style.right = '-48rem';
        document.querySelector('[data-wsjs-cart="overlay-holder"]').setAttribute('style', 'width: 0;height: 0;opacity:0');
      } else {
        body.style.overflow = 'hidden';
        body.style.left = '-48rem';
        cartHolder.style.right = '0';
        document.querySelector('[data-wsjs-cart="overlay-holder"]').setAttribute('style', 'width: 100%;height: 100%;opacity:0.5');
      }
    }
  }
});
