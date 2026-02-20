wsMain.createModule({
    name: 'newsletter',
    function: 'create',
    create() {
      try {
        document.querySelectorAll('[data-wsjs-newsletter] input').forEach(inpt => {
          inpt.addEventListener('invalid' ,(event) => {
            event.preventDefault();
            event.target.parentNode.setAttribute('data-wsjs-error', 'true');
          });
          inpt.addEventListener('keydown', (event) => {
            try {
              event.target.parentNode.removeAttribute('data-wsjs-error');
            } catch(_) {}
          });
        });
      } catch(_) {

      }
      return true;
    },
    async registerNews() {
        let name = document.querySelector('form#newsletter input[type="text"]').value,
            email = document.querySelector('form#newsletter input[type="email"]').value;

        let data = await ApiWS.Calls.CadastraNews(name, email);
        
        wsMain.modules['newsletter'].notificationNews(data);
    },
    notificationNews(returnJson) {
        if (returnJson.status == '200') {
            document.querySelector('.newsletter-message').innerText = returnJson.mensagem;
            document.querySelector('.newsletter-message').classList.add('success');
        } else {
            document.querySelector('.newsletter-message').innerText = returnJson.mensagem;
            document.querySelector('.newsletter-message').classList.add('error');
        }

        setTimeout(() => {
            document.querySelector('.newsletter-message').style.opacity = '1';
            document.querySelector('.newsletter-message').style.marginBottom = '7rem';
        }, 100);

        setTimeout(() => {
            document.querySelector('.newsletter-message').style.opacity = '0';
            setTimeout(() => {
                document.querySelector('.newsletter-message').classList.remove('success');
                document.querySelector('.newsletter-message').classList.remove('error');
            }, 400);
        }, 800)
    }
});
