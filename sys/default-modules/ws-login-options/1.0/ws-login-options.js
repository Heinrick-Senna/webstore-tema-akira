wsMain.createModule({
  name: 'login-options',
  function: 'get',
  get() {
    return wsMain.modules['login-options'].create();
  },
  create() {
    let userName = document.querySelector('#HD_LVCLI_NOME').value,
      shopId = document.querySelector('#HD_LV_ID').value;

    let container = document.querySelector('[data-wsjs-login="container"]');
    let options = wsMain.tools.getWsData(container, 'options');

    try {
      if (options.float == false) {
        container.classList.add('lateral-list');
        if (typeof nPanel == 'undefined') {
          container.querySelector('[data-wsjs-login="button"]').addEventListener('click', () => {
            wsMain.modules['login-options'].open();
          });
    
          document.addEventListener('keydown', (event) => {
            if(event.key == 'Escape') wsMain.modules['login-options'].open(true);
          });          
        }
      }
  
      container.style.opacity = "1";
    } catch(err) {}

    if (userName != 'Visitante') {
      document.querySelectorAll('[data-wsjs-login]').forEach(item => {
        let attr = item.getAttribute('data-wsjs-login');
        if (attr == 'container') item.classList.add('logged');
        if (attr == 'list-register') item.remove();
        if (attr == 'logout') item.setAttribute('href', `/logoff/${shopId}/logoff`);
        if (attr == 'username') item.innerHTML = item.innerHTML.replace('{{value}}', userName);
        if (attr != 'list-register') item.removeAttribute('data-wsjs-login');
        if (attr == 'favorite' && typeof WsFavoritos == 'undefined') item.remove();

        wsMain.addons.dataLoad(item);
      });
    } else {
      document.querySelectorAll('[data-wsjs-login]').forEach(item => {
        let attr = item.getAttribute('data-wsjs-login');
        if (attr == 'logout' || attr == 'username' || attr == 'list-login') item.remove();
        if (attr == 'container') item.classList.add('not-logged'); 
        else if (attr != 'list-login') item.removeAttribute('data-wsjs-login');
        if (attr == 'favorite' && typeof WsFavoritos == 'undefined') item.remove();

        wsMain.addons.dataLoad(item);
      });
    }

    return true;

  },
  open(vrf) {
    const body = document.querySelector('body'),
      list = document.querySelector('.login-options-container.lateral-list .login-options-list'),
      overlay = document.querySelector('[data-wsjs-cart="overlay-holder"]')

    if (list.style.right == '0px' || vrf) {
      body.style.left = '';
      body.style.overflow = '';
      list.style.right = ''
      overlay.setAttribute('style', 'width: 0;height: 0;opacity:0');
    } else {
      list.style.right = '0'
      body.style.overflow = 'hidden';
      body.style.left = '-48rem';
      overlay.setAttribute('style', 'width: 100%;height: 100%;opacity:0.5')
    }
  }
})
