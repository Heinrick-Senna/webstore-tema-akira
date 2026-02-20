let mobileAdjustsModule = {};
if (typeof mobileAdjusts != 'undefined') mobileAdjustsModule = mobileAdjusts;

if (!mobileAdjustsModule) mobileAdjustsModule = {};

mobileAdjustsModule['default'] = () => {

  if (!document.querySelector('[data-wsjs-draginner]') || document.querySelector('[data-wsjs-draginner]').getAttribute('data-wsjs-mobile') == 'true') return;

  document.querySelectorAll('section[data-wsjs-sectype="condicoes"] [data-wsjs-module="condition"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 1;arrows:false;dots:true;', 'condition');
  });

  document.querySelectorAll('section[data-wsjs-sectype="manufacturer"] [data-wsjs-module="manufacturer"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 3;alignCenter:true;arrows:true;dotsType: group;dots:true;', 'manufacturer');
  });

  document.querySelectorAll('[data-wsjs-banner="full"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 1;dots:true;arrows:false;autoplay:5000;', 'full');
  });

  document.querySelectorAll('[data-wsjs-banner="topo"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 1;dots:true;arrows:false;', 'topo');
  });

  document.querySelectorAll('[data-wsjs-banner="tarja"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 1;arrows:false;', 'tarja');
  });

  document.querySelectorAll('[data-wsjs-banner="rodape"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 1;arrows:false;', 'rodape');
  });

  document.querySelectorAll('[data-wsjs-banner="mini"]').forEach(item => {
    mobileAdjustsModule.variety(item, 'slides.perView: 1.25;alignCenter:true;slides.origin: center;arrows:false;slides.spacing: 20;', 'mini');
  });

  document.querySelectorAll('section[data-wsjs-sectype="prodSlide"] [data-wsjs-prod-list="group"]').forEach(item => {
    mobileAdjustsModule.variety(item, `slides.perView: 2;needOffset: false;arrows:false;dots:true;slides.spacing:10;`, 'group');
  });

  try {
    if (typeof nPanel != 'undefined' && nPanel.token) {

      if (document.querySelector('[data-wsjs-draginner]').getAttribute('data-wsjs-mobile') != 'true') {
        document.querySelectorAll('[data-wsjs-sectype="prodSlide"]').forEach(sec => {
          let item = infoPanel.virtual.index.querySelector(`[data-wsjs-id="${sec.getAttribute('data-wsjs-id')}"] .container > span`);
          mobileAdjustsModule.variety(item, `slides.perView: 2;needOffset: false;arrows:false;dots:true;slides.spacing:10;`, 'group');
        })

        additionalPanel.replaceGroupSections();
      }

    }
  } catch(err) {}

  try {
    if (document.querySelector('[data-wsjs-draginner]').getAttribute('data-wsjs-mobile') != 'true') {
      let style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      style.appendChild(document.createTextNode(":root { --prodperline: 2; --prodperline-categorie: 2; }"));
    
      document.querySelector('body').append(style);
    }
  } catch(err) {}
}

mobileAdjustsModule['variety'] = (item, str, objName) => {
  if (typeof mobileAdjustsModule[objName] != 'undefined') {
    let objToUse = mobileAdjustsModule[objName];
    if (objToUse == 'false' || !objToUse) return;
    
    item.setAttribute('data-wsjs-slide', objToUse);
  } else {
    let virtualOptions = wsMain.tools.getWsData(item, 'slide');
    if (virtualOptions.autoplay) str += 'autoplay: ' + virtualOptions.autoplay + ';';
    item.setAttribute('data-wsjs-slide', str);
  }
}

if (document.readyState !== 'loading') {
  mobileAdjustsModule['default']()
} else {
  document.addEventListener('DOMContentLoaded', function () {
    mobileAdjustsModule['default']();
  });
}
