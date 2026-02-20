wsMain.createModule({
  name: "ws-blogs",
  function: "create",
  create() {
    let pageStep = document.querySelector('#HdEtapaLoja')?.value;

    if (pageStep == 'BLOG') {
      document.querySelector('[data-wsjs-blog="article-holder"]').remove();
      let articleList = document.querySelector('[data-wsjs-blog="list"]');
      let pageList = document.querySelector('[data-wsjs-blog="pagination"]')
      artigos.forEach(article => {
          let articleItem = wsMain.tools.createElm({
            type: 'div',
            attrs: {
              class: 'blog-pages-item'
            }
          });
          let articleAnchor = wsMain.tools.createElm({
              type: 'a',
              innerHTML: article.titulo,
              attrs: {
                href: '/' + article.url
              }
          });
      
          if (article.disponivel != 1) articleItem.classList.add('unavaliable');
      
          articleItem.append(articleAnchor)
          articleList.append(articleItem)    
      })
      
      function getItemsAroundIndex(arr, index) {
        const startIndex = Math.max(0, index - 4); // get the start index of the items to return
        const endIndex = Math.min(arr.length - 1, index + 4); // get the end index of the items to return
        return arr.slice(startIndex, endIndex + 1); // return a new array with the items within the start and end index
      }
    
      if (!artigosPaginas.paginas) artigosPaginas.paginas = [ {atual: true} ];
    
      let pages = getItemsAroundIndex(artigosPaginas.paginas, artigosPaginas.atual);
      pages.forEach((articlePage, i) => {
        let pageButton = wsMain.tools.createElm({
          type: 'li',
          attrs: {
            class: 'blog-pagination-item'
          }
        });
    
        if (articlePage.atual) pageButton.classList.add('active');

          let realPage = artigosPaginas.paginas.indexOf(articlePage) + 1;

          let pageAnchor = wsMain.tools.createElm({
              type: 'a',
              innerHTML: realPage,
              attrs: {
                  href: `/blog/?pagina=${realPage}`
              }
          });
    
        pageButton.append(pageAnchor);
        pageList.append(pageButton);
    
      });
    }
    
    if (pageStep == 'BLOG_VIEW') {
      document.querySelector('[data-wsjs-blog="list-holder"]').remove();
      Object.keys(artigo).forEach(k => {
        if (k == 'foto') artigo[k] = `<img src="${artigo[k]}"/>`

        document.querySelectorAll(`[data-wsjs-blog="article-${k}"]`).forEach(articleItem => articleItem.innerHTML = artigo[k]);
      });
    
      document.querySelectorAll(`[data-wsjs-blog="exitButton"]`).forEach(articleItem => articleItem.setAttribute('href', '/blog'));
    }
  }
});