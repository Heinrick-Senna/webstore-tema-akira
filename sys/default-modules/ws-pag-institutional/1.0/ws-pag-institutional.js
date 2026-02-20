wsMain.createModule({
  name: 'pag-institutional',
  function: 'get',
  get () {
    let title = document.querySelector('h1').innerHTML;
    let content = document.querySelector('content').innerHTML;


    document.querySelector('.other-pages-row h1').innerHTML = title;
    document.querySelector('.other-pages-row .content').innerHTML = content;
  
  }
});
