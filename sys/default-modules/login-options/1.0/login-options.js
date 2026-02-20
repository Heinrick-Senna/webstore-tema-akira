wsMain.createModule({
    name: 'login',
    function: 'get',
    get() {
        return wsMain.modules[this.funcName].create();
    },
    create() {
        let userName = document.querySelector('#HD_LVCLI_NOME').value,
            shopId = document.querySelector('#HD_LV_ID').value;

        userName = 'Marcelo';

        if (userName == 'Visitante') {
            document.querySelector('[data-wsjs-login="link-1"]').setAttribute('href', '/login');
            document.querySelector('[data-wsjs-login="link-2"]').setAttribute('href', `/login`);
            document.querySelector('[data-wsjs-login="list-register"]').remove();
        }

        return true;

    }
})
