wsMain.createModule({
  name: "pag-contact",
  function: 'create',
  create() {
    document.querySelectorAll('[data-wsjs-contact="container"] [data-wsjs-contact]').forEach(inpt => {
      inpt.addEventListener('focusout', (event) => {
        event.target.value = event.target.value.trim();
      });
      inpt.addEventListener('mouseout', (event) => {
        event.target.value = event.target.value.trim();
      });
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

    try {

      document.querySelector('[data-wsjs-contact="Telefone"]').addEventListener('keypress', e => wsMain.data.cellphoneFilter(e));
      
      document.querySelector('[data-wsjs-contact="Telefone"]').addEventListener('keyup', e => wsMain.data.cellphoneMask(e));
    } catch (err) {}

    return true;
  },
  async sendContactForm() {
    let Json = [];
    document.querySelectorAll('input[data-wsjs-contact]').forEach(inpt => {
      let label = inpt.getAttribute('data-wsjs-contact'); 
      if (label != 'Assunto' && label != 'prodId') {
        Json.push({
          Nome: label,
          Valor: inpt.value
        });
      }
    });

    try {
      Json.push({
        Nome: 'Mensagem',
        Valor: document.querySelector('textarea[data-wsjs-contact]').value
      });
    } catch(err) {}


    document.querySelector('input[type=submit]').setAttribute('disabled', 'true');

    console.log(Json);

    let LV_ID = document.querySelector('#HD_LV_ID').value;
    let ASSUNTO = document.querySelector('[data-wsjs-contact="title"]')?.value || '';
    let PROD_ID = document.querySelector('#LV_HD_PROD_ID')?.value || 'undefined';

    let bodySend = new FormData();
    bodySend.append('tipo', "enviar-json");
    bodySend.append('LV_ID', LV_ID);
    bodySend.append('ASSUNTO', ASSUNTO);
    bodySend.append('PROD_ID', PROD_ID);
    
    let jsonText = JSON.stringify(Json);
    jsonText = jsonText.substring(1, jsonText.length-1)

    bodySend.append('Json', jsonText);

    let url = `/indiqueAJAX/contato.aspx`;

    let config = {
        method: 'POST',
        body: bodySend,
        redirect: 'follow'
    };

    let data = await fetch(url, config);
    let response = await data.text();

    document.querySelectorAll('[data-wsjs-contact]').forEach(inpt => inpt.value = '');
      
    if (response == '1') {
      document.querySelector('.contact-message').innerHTML = '<span>Mensagem enviada com sucesso</span>Obrigado por entrar em contato. Responderemos o mais breve poss&iacute;vel.';
      document.querySelector('.contact-message').classList.add('success');
    } else {
      document.querySelector('.contact-message').innerHTML = '<span>N&atilde;o conseguimos enviar sua mensagem</span>Revise o formul&aacute;rio e envie sua mensagem novamente.';
      document.querySelector('.contact-message').classList.add('error');
    }

    document.querySelector('.contact-message-container').style.display = 'block';
    setTimeout(() => {
      document.querySelector('.contact-message-container').style.opacity = '1';
    }, 1);
    
    document.querySelector('input[type=submit]').removeAttribute('disabled');
  }
});
