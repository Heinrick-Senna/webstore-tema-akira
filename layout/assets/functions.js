
try {
    document.addEventListener("DOMContentLoaded", function () {
        if (document.querySelector('#HdEtapaLoja').value == 'HOME') {
            function onScroll() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const elements = document.querySelectorAll('.paralax-image');

                elements.forEach(function (elem) {
                    const img = elem.querySelector('img');
                    if (img) {
                        const offsetTop = elem.getBoundingClientRect().top + scrollTop;
                        img.style.top = (scrollTop - offsetTop) + "px";
                    }
                });
            }
            onScroll();
            window.addEventListener('scroll', onScroll);
        }
    });
} catch (err) {

}

window.addEventListener('load', () => {
    try {
        isReady('info-lojas', () => {
            const holder = document.querySelector('[data-wsjs-infos-v2="institutional"]');
            const list = document.createElement('ul');
            list.className = holder.className;
            list.classList.add('institutional-footer');

            document.querySelectorAll('footer .institutional-footer li a').forEach(elm => {
                if (elm.title.indexOf('Produto: ') != -1) {
                    elm.title = elm.title.replace('Produto: ', '');
                    elm.innerText = elm.title;
                    list.append(elm);
                }
            });

            holder.parentNode.append(list);
            holder.parentNode.removeAttribute('data-wsjs-container');
            holder.remove();
        });
    } catch (err) {

    }
});
