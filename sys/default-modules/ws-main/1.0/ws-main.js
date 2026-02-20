if (window.location.href.indexOf("localhost") == -1) {
  const consoleSubstitute = console;
  console = {
    assert() {
      console.active ? consoleSubstitute.assert.apply(null, arguments) : null;
    },
    clear() {
      console.active ? consoleSubstitute.clear() : null;
    },
    count() {
      console.active ? consoleSubstitute.count.apply(null, arguments) : null;
    },
    countReset() {
      console.active ? consoleSubstitute.countReset.apply(null, arguments) : null;
    },
    debug() {
      console.active ? consoleSubstitute.debug.apply(null, arguments) : null;
    },
    dir() {
      console.active ? consoleSubstitute.dir.apply(null, arguments) : null;
    },
    dirxml() {
      console.active ? consoleSubstitute.dirxml.apply(null, arguments) : null;
    },
    error() {
      console.active ? consoleSubstitute.error.apply(null, arguments) : null;
    },
    group() {
      console.active ? consoleSubstitute.group.apply(null, arguments) : null;
    },
    groupCollapsed() {
      console.active
        ? consoleSubstitute.groupCollapsed.apply(null, arguments)
        : null;
    },
    groupEnd() {
      console.active ? consoleSubstitute.groupEnd.apply(null, arguments) : null;
    },
    info() {
      console.active ? consoleSubstitute.info.apply(null, arguments) : null;
    },
    table() {
      console.active ? consoleSubstitute.table.apply(null, arguments) : null;
    },
    time() {
      console.active ? consoleSubstitute.time.apply(null, arguments) : null;
    },
    timeEnd() {
      console.active ? consoleSubstitute.timeEnd.apply(null, arguments) : null;
    },
    timeLog() {
      console.active ? consoleSubstitute.timeLog.apply(null, arguments) : null;
    },
    trace() {
      console.active ? consoleSubstitute.trace.apply(null, arguments) : null;
    },
    warn() {
      console.active ? consoleSubstitute.warn.apply(null, arguments) : null;
    },
    log() {
      console.active ? consoleSubstitute.log.apply(null, arguments) : null;
    },
    enable() {
      console.active = !console.active;
      window.localStorage.setItem("logEnable", console.active);
    },
    active: !!window.localStorage.getItem("logEnable") || false,
  };
}

// Declaring Module Manager
class wsMainjs {
  constructor() {
    this.moduleArr = [];
    this.modules = {};
    this.options = {};
    this.globalData = {};
    this.tools = {};
    this.data = {};
    this['prod-slides'] = [];
    this.variationUpdate;
  }
  setModule(obj = {}, moduleName, after) {
    if (!obj) return;
    if (typeof obj != "function" && typeof obj != "object") return;

    if (!moduleName) {
      if (typeof obj == "function") {
        moduleName = obj.name;
      }
      if (typeof obj == "object") {
        obj.function.name;
      }
    }

    let moduleToreturn = {
      funcName: moduleName,
      function: typeof obj == "function" ? obj : obj.function
    }

    if (after && typeof after == "string") {
      moduleToreturn['onlyAfter'] = after;
    }

    this.moduleArr.push(moduleToreturn);
  }
  createModule(obj) {
    obj["setOption"] = (opt, value) => {
      wsMain.options[obj.name][opt] = value;
    };

    if (obj.options) {
      wsMain.setOptions(obj.options, obj.name);
    }

    this.modules[obj.name] = obj;
    delete this.modules[obj.name].options;

    if (obj.function)
      this.setModule(wsMain.modules[obj.name][obj.function], obj.name, obj.onlyAfter || false);
  }
  setOptions(obj, name) {
    if (this.options[name]) {
      this.options[name] = { ...obj, ...this.options[name] };
    } else {
      this.options[name] = obj;
    }
  }
  setGlobalData(name, obj) {
    this.globalData[name] = obj;

    switch (name) {
      case 'infoBanners':
        name = 'Banners'
        break;
      case 'infoManufactureres':
        name = 'Fabricantes'
        break;
      case 'infoCart':
        name = 'carrinho'
        break;
      case 'infoCategory':
        name = 'CategoriasLista'
        break;
      case 'listGroupProds':
        name = 'ProdutosGrupos'
        break;
      case 'listHighlightProds':
        name = 'ProdutosDestaque'
        break;
      case 'listRelatedProds':
        name = 'ListaProdutosRelacionados'
        break;
      case 'infoProduto':
        name = 'ProdutoDadosRetorno'
        break;
      case 'listCategoryProds':
        name = 'ProdutosListagem';
        break;
      case 'listHomeProds':
        name = 'ProdutosHome';
        break;
      case 'infoLoja':
        name = 'InfosLojas';
        break;
      default:
        break;
    }

    objetos[name] = JSON.stringify(obj);
  }
  async exec(funcs, toLog = false) {
    let arr = funcs || this.moduleArr;
    if (toLog) console.group(toLog)
    let promises = arr.map(async module => {
      try {
        if (module.onlyAfter) {
          wsMain.execAfter(module.onlyAfter, module);
        } else {
          let success;
          try {
            success = await module.function();
          } catch (err) {
            throw err;
          }

          if (success && !module.onlyAfter) {
            module.isOk = true;
            console.log(`The module ${module.funcName} was executed correctly!`, module);
          } else {
            console.log(module);
            throw 'Erro desconhecido';
          }
        }
      } catch (err) {
        console.log(`The Module ${module.funcName} deu errado :(`);
        console.error(err);
      }

      wsMain.addons.lazyLoad();
      wsMain.tools.lineClamp();
    });

    await Promise.all(promises);

    if (toLog) console.groupEnd(toLog)
  }
  async execAfter(modName, module) {
    if (modName == 'all') {

      let modVerify = setInterval(() => {
        let allOk = true;
        wsMain.moduleArr.forEach(mods => {
          if (mods.funcName != module.funcName && mods.funcName != "placeholders") allOk = mods.isOk
        });

        if (!allOk) return;

        clearInterval(modVerify);
        try { delete module.onlyAfter } catch (_) { }
        try { wsMain.exec([module]) } catch (_) { }
      }, 100);

    } else {

      let modVerify = setInterval(() => {
        wsMain.moduleArr.forEach(mods => {
          if (mods.funcName == modName && mods.isOk == true) {
            clearInterval(modVerify);
            try { delete module.onlyAfter } catch (_) { }
            try { wsMain.exec([module]) } catch (_) { }
          }
        });


      }, 100);
    }
  }
}

// Declaring Global Object
let objetos = {};

// Instantiating the Module Manager
ApiWS.ApiStart();
let wsMain = new wsMainjs();

// Dealing functions
wsMain.data = {
  getYouTubeVideoId(string) {
    try {
      let url = new URL(string)
      let videoId = url.searchParams.get('v')
      if (!videoId) videoId = url.pathname.split('/')[url.pathname.split('/').length - 1]

      return videoId;
    } catch (err) {
      return ''
    }
  },
  treatPrice(val) {
    return val.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  },
  cellphoneFilter(e) {
    if (parseInt(e.key).toString() == 'NaN' || e.target.value.length >= 15) e.preventDefault();
  },
  quantityFilter(e, maxlength = 3) {
    if (parseInt(e.key).toString() == 'NaN') e.preventDefault();

    if (e.target.value.length >= maxlength) {
      let selected = window.getSelection();
      console.log(selected.anchorNode, e.target, e.currentTarget);
      if (selected.type != 'Range' || selected.toString().trim() == '' || (e.target != selected.anchorNode && !selected.anchorNode.contains(e.target))) e.preventDefault();
    }

    if (parseInt(e.target.value + '' + e.key) < parseInt(e.target.getAttribute('min'))) {
      e.target.value = e.target.getAttribute('min')
      e.preventDefault();
    }

    if (parseInt(e.target.value + '' + e.key) > parseInt(e.target.getAttribute('max'))) {
      e.target.value = e.target.getAttribute('max')
      e.preventDefault();
    }

    return
  },
  cellphoneMask(e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 7) v = v.replace(/^(\d{1,2})(\d{1,5})(\d{0,})/, "($1) $2-$3");
    if (v.length <= 7 && v.length >= 3) v = v.replace(/^(\d{1,2})(\d{1,5})/, '($1) $2');
    if (v.length <= 2) v = v.replace(/^(\d{1,2})/, '($1)');
    console.log(v.length);
    if (v.length < 15) {
      e.target.value = v;
    } else {
      e.target.value;
    }
  },
  treatIcon: tag => {
    if (wsMain.globalData.icons) {
      tag.innerHTML = wsMain.globalData.icons[tag.getAttribute('data-wsjs-icon').toLowerCase()] || tag.getAttribute('data-wsjs-icon')
      tag.setAttribute('data-wsjs-icon', '');
    }
  },
  compostFeeValue(Juros, NumParcela, ParcelaJurosInicia, Valor) {
    try {
      if (Juros > 0 && NumParcela >= ParcelaJurosInicia && NumParcela > 1) {
        return (Valor * (Juros / 100)) / (1 - (1 / (Math.pow((1 + (Juros / 100)), ((NumParcela))))));
      }
      else {
        return (Valor / NumParcela);
      }
    } catch (e) { }

    return ValorParcela;
  }
}

// Tool Functions
wsMain.tools = {
  showLoading() {
    let loadingDiv = document.createElement('div');
    loadingDiv.classList.add('main-loading-overlay');
  
    let spinner = document.createElement('div');
    spinner.classList.add('main-loading-spinner');
    loadingDiv.appendChild(spinner);
  
    document.body.appendChild(loadingDiv);
    
    setTimeout(() => {
      loadingDiv.style.opacity = '1';
    }, 0);
  },
  hideLoading() {
    let loadingDiv = document.querySelector('.main-loading-overlay');
    if (loadingDiv) {
      loadingDiv.style.opacity = '0';
      setTimeout(() => {
        loadingDiv.parentNode.removeChild(loadingDiv);
      }, 300); // O tempo deve coincidir com a duraÃ§Ã£o da transiÃ§Ã£o no CSS
    }
  },  
  breadcrumb(arr) {
    let div = wsMain.tools.createElm('div');
    arr.forEach((crumb, i) => {
      let crumbSpam = wsMain.tools.createElm('span');

      let hiperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: crumb.nome,
        attrs: {
          href: crumb.url
        }
      });

      div.append(hiperLink);
      if (i != arr.length - 1) div.append(crumbSpam);
    });
    return div;
  },
  createElm(obj) {
    if (typeof obj == "string") return document.createElement(obj);

    let elm = document.createElement(obj.type);
    if (obj.attrs) {
      Object.keys(obj.attrs).forEach((key) => {
        if (key != "src") {
          if (obj.attrs[key]) {
            elm.setAttribute(key, obj.attrs[key]);
          };
        }
      });
    }

    if (obj.innerHTML) elm.innerHTML = obj.innerHTML;

    if (obj.attrs?.src) {
      if (obj.lazyLoad != false && typeof nPanel == 'undefined') {
        elm.setAttribute("data-wsjs-src", obj.attrs.src);
        elm.setAttribute("data-wsjs-lazyload", "scroll");
        elm.classList.add("lazyload");
      } else {
        elm.setAttribute("src", obj.attrs.src);
      }
    }



    return elm;
  },
  createSlide(elmToSlide, obj = {}, plugins = []) {
    if (!elmToSlide) return;
    let usedOptions = {
      loop: true,
      slides: {
        perView: 1,
      },
      lazyLoad: false,
      autoplay: false,
      arrows: true,
      dots: false
    };

    function updateJson(objToOverlay, baseObj) {
      Object.keys(objToOverlay).forEach(k => {
        if (typeof objToOverlay[k] == 'object') {
          if (!baseObj[k] || typeof baseObj[k] != 'object') baseObj[k] = {}
          updateJson(objToOverlay[k], baseObj[k])
        } else {
          baseObj[k] = objToOverlay[k]
        }
      })
    }

    updateJson(obj, usedOptions);

    let childrenLength = parseInt(Array.from(elmToSlide.children).length);

    if (usedOptions.slides.min && childrenLength < usedOptions.slides.min) return [true, false];

    let arrChildren = Array.from(elmToSlide.children).map(elm => {
      let newDiv = wsMain.tools.createElm({
        type: "div",
        attrs: {
          class: "keen-slider__slide",
        }
      });

      newDiv.append(elm);
      return newDiv;
    });

    elmToSlide.innerHTML = "";

    let wrapper = wsMain.tools.createElm({
      type: "div",
      attrs: {
        class: "keen-slider",
      }
    });

    arrChildren.forEach((elm) => wrapper.append(elm));

    let animationDelay = usedOptions.autoplay;

    if (animationDelay && animationDelay > 0 && !isNaN(animationDelay) && childrenLength > usedOptions.slides.perView) {
      function AutoPlayPlugin() {
        return slider => {
          slider.on('created', () => {
            setTimeout(() => slider.next(), animationDelay);
          });

          let slideOff = true;
          slider.on('animationEnded', () => {
            if (slideOff) {

              setTimeout(() => {
                slider.next()
                slideOff = true;
              }, animationDelay);

              slideOff = false;
            }
          });
        }
      }

      plugins.push(AutoPlayPlugin());
    }

    if (usedOptions.lazyLoad) {
      function LazyLoadSlidePlugin() {
        return slider => {
          let lazyImages = [];

          // On Slide Create
          slider.on('created', () => {
            // Encontrar todas as imagens com data-wsjs-lazyload="scroll"
            lazyImages = slider.container.querySelectorAll('img[data-wsjs-lazyload="scroll"]');

            lazyImages.forEach((img, i) => {
              // Alterar para data-wsjs-lazyload="slide"
              if (i > (Math.ceil(slider.options.slides.perView)-1)) {
                img.setAttribute('data-wsjs-lazyload', 'slide');
              }
            });
          });

          // On Slide Change
          slider.on('slideChanged', () => {
            let currentSlide = slider.track.details.rel;

            slider.slides.forEach((slide, i) => {
              if (i >= Math.abs(currentSlide) && i <= Math.abs(currentSlide) + (Math.ceil(slider.options.slides.perView)-1)) {

                slide.querySelectorAll('img[data-wsjs-lazyload="slide"]').forEach(img => {
                  if (!img.src) {
                    let src = img.getAttribute('data-wsjs-src');
                    img.src = src;
  
                    img.style.minHeight = '';
                    img.removeAttribute("data-wsjs-lazyload");
                    img.removeAttribute("data-wsjs-src");
                    img.classList.remove("lazyload");
  
                  }
                })
              }
            });
          });
        };
      }

      plugins.push(LazyLoadSlidePlugin());
    }

    // Adding Wrapper Fulled With Elements
    elmToSlide.append(wrapper);
    elmToSlide.classList.add("slide-container");

    let slider = new KeenSlider(elmToSlide.querySelector(":scope > .keen-slider"), usedOptions, plugins);

    function getDots(n, m) {
      let dots = [];
      let numViews = Math.floor(n / m);  // Number of views (including incomplete views)

      for (let i = 0; i < numViews; i++) {
        dots.push(i * m);  // Add the starting index of each view
      }

      if (n % m !== 0 && numViews > 0) {
        dots.push(numViews * m);
      }

      return dots;
    }

    function getClosestIndex(arr, target) {
      let closest = Infinity;
      let index = -1;

      for (let i = 0; i < arr.length; i++) {
        let difference = Math.abs(target - arr[i]);

        if (difference < closest) {
          closest = difference;
          index = i;
        }
      }

      return index;
    }

    if (childrenLength > usedOptions.slides.perView) {
      if (usedOptions.arrows || usedOptions.prevArrow) {
        let prevArrow = wsMain.tools.createElm({
          type: "span",
          innerHTML: typeof usedOptions.prevArrow != 'string' ? '<span data-wsjs-icon="Arrow"></span>' : usedOptions.prevArrow,
          attrs: {
            class: "arrow arrow--prev icon-ws",
          },
        });

        prevArrow.addEventListener("click", () => {
          if (usedOptions.arrowsType != 'group') slider.prev();
          else {
            let arrowsSlides = getDots(slider.track.details.slides.length, usedOptions.slides.perView);

            if (arrowsSlides.length <= 1) slider.moveToIdx(0);
            else {
              let closestArrow = getClosestIndex(arrowsSlides, slider.track.details.rel);
              if (typeof arrowsSlides[closestArrow - 1] != 'undefined') slider.moveToIdx(arrowsSlides[closestArrow - 1]);
              else slider.moveToIdx(arrowsSlides[arrowsSlides.length - 1]);
            }
          }
        });
        elmToSlide.prepend(prevArrow);
      }

      if (usedOptions.arrows || usedOptions.nextArrow) {
        let nextArrow = wsMain.tools.createElm({
          type: "span",
          innerHTML: typeof usedOptions.nextArrow != 'string' ? '<span data-wsjs-icon="Arrow"></span>' : usedOptions.nextArrow,
          attrs: {
            class: "arrow arrow--next icon-ws",
          },
        });

        nextArrow.addEventListener("click", () => {
          if (usedOptions.arrowsType != 'group') slider.next();
          else {
            let arrowsSlides = getDots(slider.track.details.slides.length, usedOptions.slides.perView);

            if (arrowsSlides.length <= 1) slider.moveToIdx(0);
            else {
              let closestArrow = getClosestIndex(arrowsSlides, slider.track.details.rel);
              if (typeof arrowsSlides[closestArrow + 1] != 'undefined') slider.moveToIdx(arrowsSlides[closestArrow + 1]);
              else slider.moveToIdx(arrowsSlides[0]);
            }
          }
        });
        elmToSlide.append(nextArrow);
      }

      if (usedOptions.dots) {
        let dots = wsMain.tools.createElm({
          type: "div",
          attrs: {
            class: "dots",
          },
        });

        let dotsSlide = [];

        if (usedOptions.dotsType == 'group') {
          dotsSlide = getDots(slider.track.details.slides.length, usedOptions.slides.perView);
        } else {
          dotsSlide = slider.track.details.slides.map((_e, idx) => idx);
        }

        dotsSlide.forEach(idx => {
          let dot = wsMain.tools.createElm({
            type: "span",
            innerHTML:
              typeof usedOptions.dots != "string" ? "<span class='slide-dot'></span>" : usedOptions.dots,
            attrs: {
              class: `slide-dots ${idx == 0 ? 'active' : ''}`,
            },
          });

          dot.addEventListener("click", () => slider.moveToIdx(idx))

          slider.on('slideChanged', (s) => {
            let dotIdx = dotsSlide.indexOf(s.track.details.rel);
            if (dotIdx == -1) return;

            let dot = s.container.parentNode.querySelectorAll('.slide-dots')[dotIdx];

            if (dot) {
              s.container.parentNode.querySelector('.slide-dots.active').classList.remove('active');
              dot.classList.add('active');
            }
          })

          dots.appendChild(dot);
        })

        elmToSlide.appendChild(dots);

      }

    } else {
      if (usedOptions.alignCenter) usedOptions.slides.perView = childrenLength;

      // Removing Drag And Arrows
      if (usedOptions.needOffset) elmToSlide.classList.add('need-offset');
      else elmToSlide.setAttribute('style', 'grid-template-columns: auto;');

      slider.update({ ...usedOptions, drag: false });
    }

    return [true, slider];
  },
  getWsData(elm, typeData) {
    if (!elm) return false;

    let opt = {};
    let optionsText = elm.getAttribute("data-wsjs-" + typeData);

    if (typeData == 'slide' && optionsText === null) return false;

    if (optionsText === null || optionsText.trim() == '') return opt;

    let optionsArr = optionsText.split(';');

    if (optionsArr[optionsArr.length - 1].trim() == '') optionsArr = optionsArr.slice(0, -1);

    optionsArr.forEach(optKey => {
      let keyName = optKey.split(':')[0].trim(),
        keyValue = optKey.split(':')[1].trim();

      if (keyValue == 'false') keyValue = false;
      if (keyValue == 'true') keyValue = true;

      let optToChange = opt;
      keyName.split('.').forEach((k, i) => {
        optToChange = optToChange[k] = i == keyName.split('.').length - 1 ? keyValue : optToChange[k] || {};
      });
    });
    return opt;
  },
  replaceSpanTag(elm, tag, container = false, clone = false) {
    try {
      let elmToQuery = container ? container : document;
      let divPlaceHolder = typeof tag == 'string' ? elmToQuery.querySelector(`[data-wsjs-${tag}]`) : tag;
      if (!divPlaceHolder || (!Array.isArray(divPlaceHolder) && divPlaceHolder.length == 0)) return;

      let elmToPut = clone ? elm.cloneNode(true) : elm;

      divPlaceHolder.getAttributeNames().forEach((attr) => {
        if (
          attr != "data-wsjs-module" &&
          attr != "data-wsjs-options" &&
          attr != 'data-wsjs-infos' &&
          attr != 'data-wsjs-banner' &&
          attr != 'data-wsjs-listing' &&
          attr != 'data-wsjs-prod-list' &&
          attr != 'data-wsholder' &&
          attr != 'data-wsjs-cart'
        ) {
          if (attr == 'class') divPlaceHolder.classList.forEach(c => elmToPut.classList.add(c));
          else elmToPut.setAttribute(attr, divPlaceHolder.getAttribute(attr));
        }
      });

      divPlaceHolder.parentNode.replaceChild(elmToPut, divPlaceHolder);
      wsMain.addons.lazyLoad();
      wsMain.addons.dataLoad(elmToPut)

      setTimeout(() => {

        try {
          additionalPanel.loadAdvancedElements();
        } catch (e) { }

        try {
          let event = new Event('resize')
          window.dispatchEvent(event);
        } catch (e) { }

        elmToPut.style.minHeight = '';
      }, 20);
    } catch (err) {
      console.log(err);
    }
  },
  lazyLoad(elm) {
    elm.style.minHeight = '';
    elm.removeAttribute("data-wsjs-lazyload");
    elm.setAttribute("src", elm.getAttribute("data-wsjs-src"));
    elm.removeAttribute("data-wsjs-src");
    elm.classList.remove("lazyload");
  },
  copyLink(elm) {
    navigator.clipboard.writeText(window.location.href.toString());
    elm.setAttribute("style", "transform: translateY(-110%)");
    setTimeout(() => {
      elm.removeAttribute("style");
    }, 500);
  },
  async replaceSubFunctions(obj, subFunctions, spanTag) {
    let arrFunctions = Object.keys(subFunctions).filter((k) => document.querySelector(`*[data-wsjs-${spanTag}=${k}]`));

    arrFunctions.forEach((key) => {
      try {
        let subFunction = subFunctions[key],
          spans = document.querySelectorAll(`*[data-wsjs-${spanTag}=${key}]`);

        spans.forEach(span => {
          let spanOptions = wsMain.tools.getWsData(span, 'options'),
            spanText = span.innerHTML;
          let elm;

          try {
            elm = subFunction(obj, spanOptions, spanText);
            if (span.hasAttribute('data-wsjs-force')) span.setAttribute('data-wsjs-force', 'load')
          } catch (_) {
            if (span.hasAttribute('data-wsjs-force')) span.setAttribute('data-wsjs-force', 'none');
            else span.remove();
          }

          if (elm) {
            wsMain.tools.replaceSpanTag(elm, span, false, true);
          } else {
            if (span.hasAttribute('data-wsjs-force')) span.setAttribute('data-wsjs-force', 'none');
            else span.remove();
          }

        });
      } catch (err) {
        console.log(err);
      }
    });
    return;
  },
  removeAll(tag, elm) {
    try {
      document.querySelectorAll(`[data-wsjs-${tag}='${elm}']`).forEach(item => item.remove());
    } catch (_) { }
  },
  lineClamp() {
    return;
    let objClamp = {};
    let arrItems = document.querySelectorAll('[data-wsjs-clamp]');

    arrItems.forEach(elm => {
      let attr = elm.getAttribute('data-wsjs-clamp');
      let clampName = attr.split(':')[0], lineStatic = attr.split(':')[1];


      elm.style.setProperty('-webkit-line-clamp', lineStatic);

      objClamp[clampName] = objClamp[clampName] || {};
      objClamp[clampName].maxLine = objClamp[clampName].maxLine && objClamp[clampName].maxLine >= elm.scrollHeight ? objClamp[clampName].maxLine : elm.scrollHeight;
    });

    function getLineHeight(el) {
      var temp = document.createElement(el.nodeName), ret;
      temp.setAttribute("style", "margin:0; padding:0; "
        + "font-family:" + (el.style.fontFamily || "inherit") + "; "
        + "font-size:" + (el.style.fontSize || "inherit"));
      temp.innerHTML = "A";

      el.parentNode.appendChild(temp);
      ret = temp.clientHeight;
      temp.parentNode.removeChild(temp);

      return ret;
    }

    arrItems.forEach(elm => {
      let attr = elm.getAttribute('data-wsjs-clamp');
      let clampName = attr.split(':')[0], lineStatic = attr.split(':')[1];

      let maxLine = objClamp[clampName].maxLine;


      let lineHeight = getLineHeight(elm);
      let lineToClamp = parseInt(maxLine / lineHeight);


      if (lineToClamp > lineStatic) lineToClamp = lineStatic;

      elm.style.setProperty('max-height', parseInt(lineHeight * lineToClamp) + 'px');
      elm.style.setProperty('min-height', parseInt(lineHeight * lineToClamp) + 'px');
      elm.style.setProperty('-webkit-line-clamp', lineToClamp);
    });
  }
}

// Additional Functions
wsMain.addons = {
  replaceIframe(el) {

    function addFrame() {
      el.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${el.getAttribute('videocode')}" 
      title="YouTube video player" 
      frameborder="0" 
      allow="accelerometer"; 
      autoplay="1"; 
      clipboard-write; 
      encrypted-media; 
      gyroscope; 
      picture-in-picture" 
      allowfullscreen>
    </iframe>`;
      el.removeEventListener('click', addFrame, false)
    }

    el.addEventListener('click', addFrame, false);
  },
  lastScrollPos: scrollY,
  lazyLoad() {
    document.querySelectorAll("*[data-wsjs-lazyload=scroll]").forEach((elm) => {
      if (elm.getBoundingClientRect().top - 20 < window.innerHeight) {
        wsMain.tools.lazyLoad(elm);
      }
    });
  },
  throttle(fn, wait) {
    var time = Date.now();
    return function () {
      if ((time + wait - Date.now()) < 0) {
        fn;
        time = Date.now();
      }
    }
  },
  floatHeader(vrf) {
    let body = document.body, html = document.documentElement;
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    let header = document.querySelector('header');
    let headerOptions = wsMain.tools.getWsData(header, 'options');
    let logoHeader = document.querySelector('header .logo-header');
    let maxHeight = logoHeader.getAttribute('data-max-height') || '';
    let minHeight = logoHeader.getAttribute('data-min-height') || '';
    let maxMargin = logoHeader.getAttribute('data-max-margin') || '';
    let minMargin = logoHeader.getAttribute('data-min-margin') || '';
    let bottomQuery = headerOptions.bottomElement;
    let bottomHeader = false;
    if (bottomQuery != false) {
      bottomHeader = document.querySelector(bottomQuery) || document.querySelector('header .header-bottom');
    }

    if (scrollY > wsMain.addons.lastScrollPos && scrollY > (header.offsetHeight * .35)) {
      logoHeader.style.height = minHeight;
      logoHeader.style.margin = minMargin;
      document.querySelector('header').classList.add('float-active')
      if (bottomHeader) {
        bottomHeader.style.pointerEvents = 'none';
        bottomHeader.style.opacity = '0';
        bottomHeader.style.transform = 'translateY(-101%)';
      }
    }



    if (
      vrf
      ||
      scrollY < (header.offsetHeight * .35)
      ||
      (
        Math.abs(scrollY - wsMain.addons.lastScrollPos) > ((height / 100) * 4)
        &&
        scrollY < wsMain.addons.lastScrollPos
      )
    ) {
      logoHeader.style.height = maxHeight;
      logoHeader.style.margin = maxMargin;
      document.querySelector('header').classList.remove('float-active')
      if (bottomHeader) {
        bottomHeader.style.pointerEvents = 'all';
        bottomHeader.style.opacity = '';
        bottomHeader.style.transform = 'translateY(0)';
      }
    }

    this.lastScrollPos = scrollY;
  },
  headerFirstLoad() {
    let header = document.querySelector('header');
    let headerOptions = wsMain.tools.getWsData(header, 'options');
    if (headerOptions.float != true) return;

    setTimeout(() => document.querySelector('header .logo-header').style.transition = 'all 300ms ease 0s, font-size 0s ease 0s', 10);
    if (typeof nPanel != 'undefined' && nPanel.token) return;

    header.style.zIndex = '3';
    header.style.position = 'fixed';
    

    if (headerOptions.scroll == false) return;
    let booleanScroll = true;

    function onScroll() {
      if (scrollY < header.offsetHeight * .35) wsMain.addons.floatHeader(true);
      if (booleanScroll) {
        booleanScroll = false;
        setTimeout(() => {
          wsMain.addons.floatHeader();
          booleanScroll = true;
        }, 500);
      };
    }

    function onResize() {
      if (!header.classList.contains('float-active')) {
        header.parentNode.style.paddingTop = header.offsetHeight + 'px';
      }
    }
    
    setInterval(onResize, 1000);
    document.addEventListener('resize', onResize);
    document.addEventListener('load', onResize);
    document.addEventListener('scroll', onScroll);

    setTimeout(onResize, 5);
    onScroll();
  },
  dataLoad(elm) {
    while (elm) {
      try {
        if (elm.getAttribute('data-wsjs-container') != null) elm.removeAttribute('data-wsjs-container');
        if (document.querySelector('#HdEtapaLoja').value == 'HOME' && elm.getAttribute('data-wsjs-clsid')) elm.removeAttribute('data-wsjs-clsid');
        if (document.querySelector('#HdEtapaLoja').value == 'HOME' && elm.getAttribute('data-wsjs-sectype')) elm.style.minHeight = '';
      } catch (e) { }
      elm = elm.parentNode;
    }
  }
}

wsMain.help = async () => {
  if (!wsMain.helpModObj) {
    let response = await fetch('https://cdns3.webstore.net.br/files/0ws/dragdrop/wsHelp.json')
    let data = await response.json();
    wsMain.helpModObj = data;
  }

  return wsMain.helpModObj;
}

wsMain.version = {
  number: document.querySelector('[data-wsjs-draginner]')?.getAttribute('data-wsjs-draginner') || '0.0.1',
  compare(a, b = wsMain.version.number) {
    if (a === b) {
      return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");

    var len = Math.min(a_components.length, b_components.length);

    // loop while the components are equal
    for (var i = 0; i < len; i++) {
      // A bigger than B
      if (parseInt(a_components[i]) > parseInt(b_components[i])) {
        return 1;
      }

      // B bigger than A
      if (parseInt(a_components[i]) < parseInt(b_components[i])) {
        return -1;
      }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (a_components.length > b_components.length) {
      return 1;
    }

    if (a_components.length < b_components.length) {
      return -1;
    }

    // Otherwise they are the same.
    return 0;
  }

}

if (document.querySelector('#HdEtapaLoja').value == 'HOME' && typeof placeholderHome != 'undefined') {
  wsMain.placeHolders = {
    banners: {
      full: {
        height: '300px'
      },
      topo: {
        height: '300px'
      },
      tarja: {
        height: '90px'
      },
      mini: {
        height: '150px'
      },
      rodape: {
        height: '300px'
      }
    },
    condicoes: {
      qtd: placeholderHome?.condicoes || 0,
      height: '12rem'
    },
    fabricantes: {
      qtd: placeholderHome?.fabricantes || 0,
      height: '17rem'
    },
    grupos: {
      qtd: placeholderHome?.grupos || 0,
      height: '51rem'
    },
    produtos: {
      qtd: placeholderHome?.produtos || 0,
      height: '51rem'
    }
  };
}

// Running all modules
window.addEventListener("load", async () => {
  try {
    let newsTitle = document.querySelector('.newsletter-text h2');
    if (newsTitle.innerHTML.trim() == '') newsTitle.parentNode.remove();
  } catch (_) { }


  await wsMain.exec(false, 'Level 0');

  BuscaInicializa('input-busca');
  console.warn('All modules executed')

  if (typeof nPanel == 'undefined') {
    document.querySelectorAll('.pseudo-youtube-frame').forEach(el => wsMain.addons.replaceIframe(el))
  }
});

// Declaring LazyLoad Function
document.addEventListener("scroll", wsMain.addons.lazyLoad);

function isReady(mod, funcToCall) {
  if (mod == 'allModulosOk') {
    let modVerify = setInterval(() => {
      let allOk = true;
      wsMain.moduleArr.forEach((mods) => {
        if (mods.isOk == false) allOk = false;
      });

      if (allOk) {
        clearInterval(modVerify);
        try { funcToCall() } catch (_) { }
      }
    }, 100);

  } else {
    let modVerify = setInterval(() => {
      wsMain.moduleArr.forEach((mods) => {
        if (mods.funcName == mod && mods.isOk == true) {
          clearInterval(modVerify);
          try { funcToCall() } catch (_) { }
        }
      });
    }, 100);
  }
}
