
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
