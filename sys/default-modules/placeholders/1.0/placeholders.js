wsMain.createModule({
  name: 'placeholders',
  function: 'create',
  subFunctions: {
    fabricantes() {
      if (wsMain.placeHolders.fabricantes.qtd > 0) {
        let tags = document.querySelectorAll('[data-wsjs-module=fabricantes]');
        tags.forEach(tag => {
          tag.setAttribute('data-wsholder', 'true');
          tag.style.minHeight = wsMain.placeHolders.fabricantes.height;
        });
      }
    },
    condicoes() {
      if (wsMain.placeHolders.condicoes.qtd > 0) {
        let tags = document.querySelectorAll('[data-wsjs-module=conditions]');

        tags.forEach(tag => {
          tag.setAttribute('data-wsholder', 'true');
          tag.style.minHeight = wsMain.placeHolders.condicoes.height;
        });
      }
    },
    banners() {
      placeholderHome.banners.forEach(banner => {
        try {
          let defaultHeight = wsMain.placeHolders.banners[banner.regiao.toLowerCase()]?.height;
          let heightToUse = banner.altura == 0 || !banner.altura ? defaultHeight : banner.altura;

          document.querySelectorAll(`*[data-wsjs-banner="${banner.regiao.toLowerCase()}"]`).forEach(tag => {
            tag.setAttribute('data-wsholder', 'true');
            tag.style.minHeight = heightToUse;
          });
        } catch(_) {}
      });
    },
    grupos() {
      return;
      if (wsMain.placeHolders.grupos.qtd > 0) {
        let heightSet = parseInt(wsMain.placeHolders.grupos?.height)*wsMain.placeHolders.grupos.qtd;
        let heightToUse = wsMain.placeHolders.grupos?.height.replace(/([0-9]{0,})/, heightSet);

        document.querySelectorAll(`[data-wsjs-prod-list]`).forEach(tag => {
          if (tag.getAttribute('data-wsjs-prod-list') != 'previous' && tag.getAttribute('data-wsjs-prod-list') != 'home' && tag.getAttribute('data-wsjs-prod-list') != 'spotlight') {
            tag.setAttribute('data-wsholder', 'true');
            tag.setAttribute('data-lazyheight', wsMain.placeHolders.grupos?.height);
            tag.style.minHeight = heightToUse;
          }
        });
      }
    },
    produtos() {

    }
  },
  async create() {
    if (wsMain.placeHolders) {
      Object.keys(wsMain.modules['placeholders'].subFunctions).forEach(async holder => {
        try {
          await wsMain.modules['placeholders'].subFunctions[holder]();
        } catch(err) {
          console.log(err);
        }
      });
      
      document.querySelector('[data-wsjs-loader]').style.display = 'block';

      return true;
    }
  }
});
