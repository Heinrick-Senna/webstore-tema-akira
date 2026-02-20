wsMain.createModule({
  name: "manufacturer",
  function: "get",
  async get() {
    let tag = document.querySelectorAll('[data-wsjs-module="manufacturer"]');
    if (!tag || tag.length == 0) return true;
    
    let data = await ApiWS.Calls.manufactures();

    tag.forEach(t => wsMain.modules['manufacturer'].create(data, t) );

    return true;
  },
  create(returnJson, elm) {
    let fabricantes = returnJson.fabricantes;

    if (!fabricantes || fabricantes.length == 0) return;

    let divHolder = wsMain.tools.createElm({
      type: "div"
    });

    let manufacturerOptions = wsMain.tools.getWsData(elm, 'options');


    fabricantes.forEach((f) => {
      let hiperLink = wsMain.tools.createElm({
        type: "a",
        attrs: {
          href: f.url,
          "data-id": "manufacturer-" + f.id,
        },
      });
      
      if (f.logotipo && manufacturerOptions.labelOnly != true) {
        let fImg = wsMain.tools.createElm({
          type: "img",
          attrs: {
            src: f.logotipo,
            title: f.nome,
            alt: f.nome,
          },
        });
        hiperLink.append(fImg);
        divHolder.append(hiperLink);
      } else {
        let fName = wsMain.tools.createElm({
          type: "li",
          innerHTML: `<span>${f.nome}</span>`,
          attrs: {
            title: f.nome,
          },
        });

        hiperLink.append(fName);
        divHolder.append(hiperLink);
      }
    });

    let slideOptions = wsMain.tools.getWsData(elm, 'slide');

    let slideSuccess, slider;

    if (slideOptions) {
      [slideSuccess, slider] = wsMain.tools.createSlide(divHolder, slideOptions);
      if (!slideSuccess) return;
    }

    if (manufacturerOptions.labelOnly == true) {
      wsMain.tools.replaceSpanTag(wsMain.tools.createElm({
        type: 'ul',
        innerHTML: divHolder.innerHTML
      }), elm);
    } else {
      wsMain.tools.replaceSpanTag(divHolder, elm);
    }


    if (slideOptions) slider.update();

    return true;
  },
});
