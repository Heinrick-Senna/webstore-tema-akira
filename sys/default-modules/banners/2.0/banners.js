// Criando MÃ³dulo e Setando No Array de MÃ³dulos
wsMain.createModule({
  name: "banners",
  function: "get",
  async get() {
    let data = await ApiWS.Calls.banners();

    return wsMain.modules[this.funcName].create(data);
  },
  create(returnJson) {
    // Declarando Json de Banners
    let banners = returnJson.banners.filter(b => document.querySelector(`*[data-wsjs-banner="${b.tipo}"]`) ? true : false );
    let bannersTypes = banners.map(b => b.tipo);
        bannersTypes = bannersTypes.filter((b, i) => bannersTypes.indexOf(b) === i);
    // Verificando Se Existem Banners
    if (!banners || banners.length == 0) return "Sem Banners";

    if (bannersTypes.indexOf('category_description') == -1) document.querySelectorAll('*[data-wsjs-banner="category_description"]').forEach(elm => elm.remove());
    else document.querySelectorAll('*[data-wsjs-banner="category_description"]').forEach(elm => elm.style.opacity = '');

    banners.forEach((b, i) => {
      if (b.tipo == 'popup') {
        let vrf = window.sessionStorage.getItem('bannerPopup') || true;
        if (vrf != 'false') {
          bannerPopUp(b, i);
          window.sessionStorage.setItem('bannerPopup', 'false');
        }
      }
    });

    function bannerPopUp(banner, indxToRemove) {
      let popupDiv = wsMain.tools.createElm('div');

      document.querySelector('body').style.overflow = 'hidden';

      let popupContainer = wsMain.tools.createElm('div');

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        attrs: {
          target: banner.target || '',
          href: banner.url || '#'
        }
      });

      if (banner.conteudo) {
        hyperLink.innerHTML = banner.conteudo
      } else {
        let img = wsMain.tools.createElm({
          type: 'img',
          attrs: {
            src: banner.imagem
          }
        });

        hyperLink.append(img);
      }

      popupContainer.append(hyperLink);
      popupContainer.innerHTML += '<span data-wsjs-icon="close"></span>';

      popupDiv.append(popupContainer);

      popupDiv.addEventListener('click', () => {
        popupDiv.setAttribute('style', 'filter: opacity(0)!important;');
        setTimeout(() => {
          document.querySelector('body').style.overflow = 'auto';
          popupDiv.remove();
        }, 301);
      });

      wsMain.tools.replaceSpanTag(popupDiv, 'banner=popup')
    }

    bannersTypes.forEach(actualType => {
      if (actualType == 'popup') return;

      let slideContainer = wsMain.tools.createElm({
        type: "div",
        attrs: {
          id: "banner-" + actualType,
          class: "banner-holder",
        },
      }); 

      banners.forEach(b => {
        // Verificando se o banner Ã© do tipo atual
        if (b.tipo != actualType) return;
        if (b.tipo == "category_description" && b.conteudo.trim() == '' && b.imagem == '') return;

        // Verificando Altura dos Banners
        let imgStyle = "";
        if (b.altura != "0" || b.largura != "0") {
          if (b.altura != "0" && b.largura != "0") {
            imgStyle = `width:${b.largura}px;height${b.altura}px`;
          } else if (b.altura != 0) {
            imgStyle = `height:${b.altura}px;width:auto;max-width:100%;`;
          } else if (b.largura != 0) {
            imgStyle = `width:${b.largura}px`;
          }
        }

        let bannerImage;

        if (b.conteudo) {
          let div = wsMain.tools.createElm('div');
          if (actualType == 'category_description') {
            let innerElement = document.querySelector('*[data-wsjs-banner="category_description"]').innerHTML.replace('{{value}}', b.conteudo);
            div.innerHTML = innerElement;
            bannerImage = div;
            bannerImage.style.opacity = '';
          } else {
            div.innerHTML = b.conteudo;
            bannerImage = div.firstChild;
          }
        } else {
           bannerImage = wsMain.tools.createElm({
             type: "img",
             lazyLoad: b.tipo == 'full' ? false : true,
             attrs: {
               src: b.imagem,
               alt: b.titulo,
               style: imgStyle,
             },
           });
        }

        let bannerHiperLink = wsMain.tools.createElm({
          type: "a",
          attrs: { 
          href: b.url || '#', 
          target: b.target || '' },
        });

        if (actualType == 'category_description') bannerHiperLink = bannerImage;
        else bannerHiperLink.append(bannerImage);

        slideContainer.append(bannerHiperLink);
      });

      if (!slideContainer.hasChildNodes()) return;

      let slideOptions = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-banner="${actualType}"]`), 'slide')

      let slideSuccess, slider;

      if (slideOptions && (actualType != 'mini' || (actualType == 'mini' && slideContainer.querySelectorAll(':scope > *').length > slideOptions?.slides?.perView))) {
        [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
        if (!slideSuccess) return;
      }
        
      wsMain.tools.replaceSpanTag(slideContainer, `banner="${actualType}"`);

      setTimeout(() => {
        if (slider) slider.update();
      }, 5);

    });

    try {
      document.querySelectorAll('*[data-wsjs-banner]').forEach(item => item.remove());
    } catch(_) {}
    
    // document.querySelectorAll('[data-wsjs-banner]').forEach(item => item.remove());
    return true;
  },
});
