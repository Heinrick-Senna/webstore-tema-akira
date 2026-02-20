wsMain.createModule({
  name: "banners",
  function: "get",
  options: {
    idealWidth: {
      full: {
        width: '1500',
        height: '300'
      },
      topo: {
        width: '1200',
        height: '300'
      },
      mini: {
        width: '300',
        height: '150'
      },
      tarja: {
        width: '1200',
        height: '90'
      },
      rodape: {
        width: '1200',
        height: '300'
      },
      popup: {
        width: '600',
        height: '400'
      },
    }
  },
  async get() {
    let data = await ApiWS.Calls.banners();

    return wsMain.modules['banners'].create(data);
  },
  create(returnJson) {
    // Declarando Json de Banners
    let banners = returnJson.banners.filter(b => document.querySelector(`*[data-wsjs-banner="${b.tipo}"]`) || b.tipo == 'popup' ? true : false );
    let bannersTypes = banners.map(b => b.tipo);
        bannersTypes = bannersTypes.filter((b, i) => bannersTypes.indexOf(b) === i);
    // Verificando Se Existem Banners
    if (!banners || banners.length == 0) return "Sem Banners";

    let deviceType = document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'false' ? 'D' : 'M';

    if (bannersTypes.indexOf('category_description') == -1) document.querySelectorAll('*[data-wsjs-banner="category_description"]').forEach(elm => elm.remove());
    else document.querySelectorAll('*[data-wsjs-banner="category_description"]').forEach(elm => elm.style.opacity = '');

    banners = banners.filter(b => b.dispositivos == deviceType || b.dispositivos == 'T');

    banners.forEach((b, i) => {
      b.virtualWidth = wsMain.options['banners'].idealWidth[b.tipo]?.width || '1200';
      b.virtualHeight = wsMain.options['banners'].idealWidth[b.tipo]?.height || '300';
      if (b.tipo == 'popup') {
        let vrf = window.sessionStorage.getItem('bannerPopup_' + b.id);
        if (vrf != 'false') {
          window.sessionStorage.setItem('bannerPopup_' + b.id, 'false');
          bannerPopUp(b, i);
        }
      }
    });

    function bannerPopUp(banner, indxToRemove) {
      let popupDiv = wsMain.tools.createElm({
        type: 'div',
        attrs: {
          class: 'banner-popup-modal'
        }
      });

      document.querySelector('body').style.overflow = 'hidden';

      let popupContainer = wsMain.tools.createElm('div');

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        attrs: {
          target: banner.target || '',
          href: banner.url || 'javascript:;'
        }
      });

      if (banner.conteudo) {
        hyperLink.innerHTML = banner.conteudo
      } else {
        let img = wsMain.tools.createElm({
          type: 'img',
          attrs: {
            width: banner.virtualWidth,
            height:  banner.virtualHeight,
            alt: banner.titulo,
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

      try {
        document.querySelector('body').append(popupDiv);
      } catch(err) {}
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
              width: b.virtualWidth,
              height: b.virtualHeight,
              src: b.imagem,
              alt: b.titulo,
              style: imgStyle,
             },
           });
        }

        let bannerHiperLink = wsMain.tools.createElm({
          type: "a",
          attrs: {
            href: b.url || 'javascript:;',
            alt: b.titulo, 
            target: b.target
          },
        });
        
        if (actualType == 'category_description') bannerHiperLink = bannerImage;
        else bannerHiperLink.append(bannerImage);

        slideContainer.append(bannerHiperLink);
      });

      if (!slideContainer.hasChildNodes()) return;

      let slideOptions = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-banner="${actualType}"]`), 'slide')

      if (deviceType == 'M') slideOptions['lazyLoad'] = true;

      let slideSuccess, slider;

      let vrsMobile = document.querySelector('#HD_VRS_MOBILE').value == 'true';

      if (slideOptions) {
        if (vrsMobile) {
          [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
          if (!slideSuccess) return;
        } else {
          if (wsMain.version.compare('1.0.0') == 1) {
            if (actualType != 'mini' || (actualType == 'mini' && slideContainer.querySelectorAll(':scope > *').length > slideOptions?.slides?.perView)) {
              [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
              if (!slideSuccess) return;
            }
          } else {
            [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
            if (!slideSuccess) return;
          }
        }
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
