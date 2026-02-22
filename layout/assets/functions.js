
try {
    if (document.querySelector('#HdEtapaLoja').value === 'HOME') {
        document.addEventListener("DOMContentLoaded", function () {
            function onScroll() {
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var elements = document.querySelectorAll('.paralax-image');

                elements.forEach(function (elem) {
                    var img = elem.querySelector('img');
                    if (img) {
                        var offsetTop = elem.getBoundingClientRect().top + scrollTop;
                        img.style.top = (scrollTop - offsetTop) + "px";
                    }
                });
            }
            onScroll();
            window.addEventListener('scroll', onScroll);
        });
    }
} catch (err) {

}
let functToCall = () => {
    console.log('teste2!!!')
    const holder = document.querySelector('[data-wsjs-infos-v2="institutional"]');

    const list = document.createElement('ul');
    list.className = holder.className
    list.classList.add('institutional-footer')

    document.querySelectorAll('footer .institutional-footer li a').forEach(elm => {
        if (elm.title.indexOf('Produto: ') != -1) {
            list.append(elm)
        }
    })

    holder.parentNode.append(list)
    holder.parentNode.removeAttribute('data-wsjs-container')
    holder.remove();
};

window.addEventListener('load', () => {
    console.log('TESTE!')
    try {
        isReady('info-lojas', functToCall)
    } catch (err) {

    }
});
