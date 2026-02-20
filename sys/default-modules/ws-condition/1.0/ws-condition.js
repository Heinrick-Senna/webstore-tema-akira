wsMain.createModule({
  name: 'condicoes',
  function: 'get',
  onlyAfter: 'info-lojas',
  options: {
    templateConfigs: {
      icon: true,
      title: true,
      subtitle: true
    }
},
  get() {
    let tag = document.querySelectorAll('[data-wsjs-module="condition"]');
    if (!tag || tag.length == 0) return true;

    tag.forEach(t => wsMain.modules['condicoes'].create(t) );

    return true;
  },
  create(elm) {
    let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['condicoes'].templateConfigs));
    let condicoes = wsMain.globalData['infoLoja'].condicoes;

    let optionsCondition = wsMain.tools.getWsData(elm, 'options');
        templateConfigs = {...templateConfigs, ...optionsCondition};

    if (!Array.isArray(condicoes) || condicoes.length == 0) return true;

    let conditionContainer = wsMain.tools.createElm({
        type: 'div', 
        attrs: {
            class: 'condicoes-loja',
        }
    });

    condicoes.forEach((c, i)=> {
        let 
            itemContainer = wsMain.tools.createElm({type: 'div', attrs: {class: 'condicao-item condicao-item-' + i}}),
            iconContainer = wsMain.tools.createElm({type: 'div', innerHTML: c.icone, attrs: {class: 'condicao-icone'}}),
            textContainer = wsMain.tools.createElm({type: 'div', attrs: {class: 'condicao-textos'}}),
            title = wsMain.tools.createElm({type: 'h3', innerHTML: c.titulo, attrs: {class: 'condicao-titulo'}}),
            subtitle = wsMain.tools.createElm({type: 'p', innerHTML: c.subtitulo, attrs: {class: 'condicao-subtitulo'}});

        if (templateConfigs.title) textContainer.append(title);
        if (templateConfigs.subtitle) textContainer.append(subtitle);
        
        let conditionHiperLink = wsMain.tools.createElm({
            type: c.url ? 'a' : 'div', 
            attrs: { 
              class: 'condicao-hiperlink'
            }
        });

        if (c.url) {
          conditionHiperLink.setAttribute('href', c.url);
        }

        if (templateConfigs.icon) conditionHiperLink.append(iconContainer);
        if (templateConfigs.title || templateConfigs.subtitle) conditionHiperLink.append(textContainer);
        
        itemContainer.append(conditionHiperLink);
        conditionContainer.append(itemContainer);
    });

    let conditionSlideOptions = wsMain.tools.getWsData(elm, 'slide');
    
    let [slideSuccess, slide] = conditionSlideOptions ? wsMain.tools.createSlide(conditionContainer, conditionSlideOptions) : [null, null];
    
    if (templateConfigs.icon || templateConfigs.title || templateConfigs.subtitle) wsMain.tools.replaceSpanTag(conditionContainer, elm);

    if (slideSuccess) slide.update();

    return true;
  }
});
