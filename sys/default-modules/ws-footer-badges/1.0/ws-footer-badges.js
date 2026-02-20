wsMain.createModule({
  name: "footer-badges",
  create(returnJson) {
    try {
      if (!Array.isArray(returnJson)) returnJson = [returnJson];
      returnJson.forEach(badge => {
        let li = wsMain.tools.createElm('li'); 
  
        li.setAttribute('id', badge.name.trim().replace(/ /g, ''));
  
        let holder = wsMain.tools.createElm({
          type: 'a', 
          attrs: {
            class: 'badge-holder',
            title: badge.name,
            target: badge.url?.trim() != 'javascript:void()' ? '_blank' : '',
            href: badge.url || ''
          }
        });
  
        if (badge.content) {
          holder.innerHTML = badge.content;
        } else {
          holder.appendChild( wsMain.tools.createElm({
            type: 'img',
            lazyLoad: true,
            attrs: {
              width: 100,
              height: 70,
              src: badge.image,
              alt: badge.name
            }
          }));
        }
  
        li.append(holder);
        document.querySelector('[data-wsjs-badges]').append(li);
      });
    } catch(err) {}
  },
});
