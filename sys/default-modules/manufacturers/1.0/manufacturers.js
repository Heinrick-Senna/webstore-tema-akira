wsMain.createModule({
  name: "manufacturer",
  function: "get",
  async get() {
    if (!document.querySelector('[data-wsjs-module="manufacturer"]')) return;
    let data = await ApiWS.Calls.manufactures();

    return wsMain.modules[this.funcName].create(data);
  },
  create(returnJson) {
    let fabricantes = returnJson.fabricantes;

    if (!fabricantes || fabricantes.length == 0) return;

    let divHolder = wsMain.tools.createElm({
      type: "div"
    });

    fabricantes.forEach((f) => {
      if (f.logotipo) {
        let hiperLink = wsMain.tools.createElm({
          type: "a",
          attrs: {
            href: f.url,
            id: "manufacturer-" + f.id,
          },
        });
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
      }
    });

    let slideOptions = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-module="manufacturer"]`), 'slide');

    let slideSuccess, slider;

    if (slideOptions) {
      [slideSuccess, slider] = wsMain.tools.createSlide(divHolder, slideOptions);
      if (!slideSuccess) return;
    }

    wsMain.tools.replaceSpanTag(divHolder, 'module="manufacturer"');

    slider.update();

    return true;
  },
});
