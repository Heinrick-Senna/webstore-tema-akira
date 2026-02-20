// console.log(window.location.href.indexOf('localhost'))

// if (window.location.href.indexOf("localhost") == -1) {
//   const consoleSubstitute = console;
//   console = {
//     assert() {
//       console.active ? consoleSubstitute.assert.apply(null, arguments) : null;
//     },
//     clear() {
//       console.active ? consoleSubstitute.clear() : null;
//     },
//     count() {
//       console.active ? consoleSubstitute.count.apply(null, arguments) : null;
//     },
//     countReset() {
//       console.active ? consoleSubstitute.countReset.apply(null, arguments) : null;
//     },
//     debug() {
//       console.active ? consoleSubstitute.debug.apply(null, arguments) : null;
//     },
//     dir() {
//       console.active ? consoleSubstitute.dir.apply(null, arguments) : null;
//     },
//     dirxml() {
//       console.active ? consoleSubstitute.dirxml.apply(null, arguments) : null;
//     },
//     error() {
//       console.active ? consoleSubstitute.error.apply(null, arguments) : null;
//     },
//     group() {
//       console.active ? consoleSubstitute.group.apply(null, arguments) : null;
//     },
//     groupCollapsed() {
//       console.active
//         ? consoleSubstitute.groupCollapsed.apply(null, arguments)
//         : null;
//     },
//     groupEnd() {
//       console.active ? consoleSubstitute.groupEnd.apply(null, arguments) : null;
//     },
//     info() {
//       console.active ? consoleSubstitute.info.apply(null, arguments) : null;
//     },
//     table() {
//       console.active ? consoleSubstitute.table.apply(null, arguments) : null;
//     },
//     time() {
//       console.active ? consoleSubstitute.time.apply(null, arguments) : null;
//     },
//     timeEnd() {
//       console.active ? consoleSubstitute.timeEnd.apply(null, arguments) : null;
//     },
//     timeLog() {
//       console.active ? consoleSubstitute.timeLog.apply(null, arguments) : null;
//     },
//     trace() {
//       console.active ? consoleSubstitute.trace.apply(null, arguments) : null;
//     },
//     warn() {
//       console.active ? consoleSubstitute.warn.apply(null, arguments) : null;
//     },
//     log() {
//       console.active ? consoleSubstitute.log.apply(null, arguments) : null;
//     },
//     enable() {
//       console.active = !console.active;
//       window.localStorage.setItem("logEnable", console.active);
//     },
//     active: window.localStorage.getItem("logEnable") != "false" || false,
//   };
// }

// Class Modules
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
      this.options[name] = { ...this.options[name], ...obj };
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
      default:
        break;
    }

    objetos[name] = JSON.stringify(obj);
  }
  async exec(funcs) {
    let arr = funcs || this.moduleArr;

    arr.forEach(async module => {
      try {
        if (module.onlyAfter) {
          wsMain.execAfter(module.onlyAfter, module);
        } else {
          let success;
          try {
            success = await module.function();
          } catch(err) {
            throw err;
          }
          
          if (success && !module.onlyAfter) {
            module.isOk = true;
            console.log(`A funÃ§Ã£o ${module.funcName} deu certo!`, module);
          } else {
            console.log(module);
            throw 'Erro desconhecido';
          }
        }
      } catch(err) {
        console.log(`A funÃ§Ã£o ${module.funcName} deu errado :(`);
        console.error(err);
      }
      
      document.querySelectorAll("*[data-wsjs-lazyload=scroll]").forEach((elm) => {
        if (elm.getBoundingClientRect().top < window.innerHeight) {
          wsMain.tools.lazyLoad(elm);
        }
      });
      wsMain.tools.lineClamp();

    });
  }
  async execAfter(modName, module) {
    if (modName == 'all') {
      
      let modVerify = setInterval(() => {
        let allOk = true;
        wsMain.moduleArr.forEach(mods => mods.isOk = allOk);
        
        if (!allOk) return;
      
        clearInterval(modVerify);
        try { delete module.onlyAfter } catch(_) {} 
        try { wsMain.exec([module]) } catch(_) {}
      }, 100);
      
    } else {
      
      let modVerify = setInterval(() => {
        wsMain.moduleArr.forEach(mods => {
        if (mods.funcName == modName && mods.isOk == true) {
          clearInterval(modVerify);   
          try { delete module.onlyAfter } catch(_) {}     
          try { wsMain.exec([module]) } catch(_) {}
        }
      });


    }, 100);
  }
  }
}

// Criando Objeto Main
let objetos = {};

// Instanciando a wsMainjs
ApiWS.ApiStart();
let wsMain = new wsMainjs();

// FunÃ§Ãµes de Trativa
wsMain.data = {
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
  quantityFilter(e) {
    if (parseInt(e.key).toString() == 'NaN' || e.target.value.length >= 3) e.preventDefault();
  },
  cellphoneMask(e) {
    let v = e.target.value.replace(/\D/g,"");
    if (v.length >  7) v = v.replace(/^(\d{1,2})(\d{1,5})(\d{0,})/, "($1) $2-$3");
    if (v.length <= 7 && v.length >= 3) v = v.replace(/^(\d{1,2})(\d{1,5})/, '($1) $2');
    if (v.length <= 2) v = v.replace(/^(\d{1,2})/, '($1)');
    console.log(v.length);
    if (v.length < 15) {
      e.target.value = v;
    } else {
      e.target.value;
    }
  },
  replaceAllIcons: () => document.querySelectorAll('[data-wsjs-icon]').forEach(elm => wsMain.data.treatIcon(elm)),
  treatIcon: tag => { 
    if (wsMain.globalData.icons) {
      tag.innerHTML = wsMain.globalData.icons[tag.getAttribute('data-wsjs-icon').toLowerCase()] || tag.getAttribute('data-wsjs-icon')
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
    } catch (e) {}
  
    return ValorParcela;
  }
};

// FunÃ§Ãµes de Ferramentas
wsMain.tools = {
  breadcrumb(arr) {
    let div = wsMain.tools.createElm('div');
    arr.forEach((crumb, i) => {
      let crumbSpam = wsMain.tools.createElm('span');

      let hiperLink = wsMain.tools.createElm({
          type: 'a', 
          innerHTML: crumb.nome,
          attrs: {
              href: crumb.url
      }});

      div.append(hiperLink);
      if (i != arr.length-1) div.append(crumbSpam);
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
      if (obj.lazyLoad != false) {
        elm.setAttribute("data-wsjs-src", obj.attrs.src);
        elm.setAttribute("data-wsjs-lazyload", "scroll");
        elm.classList.add("lazyload");
      } else {
        elm.setAttribute("src", obj.attrs.src);
      }
    }

    
    
    return elm;
  },
  createSlide(elmToSlide, obj = {}, plugins) {
    if (!elmToSlide) return;
    let usedOptions ={
      loop: true,
      slides: { 
        perView: 1,
      },
      arrows: true,
      dots: false,
      ...obj
    };

    let childrenLength = parseInt(Array.from(elmToSlide.children).length);

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

    // Adding Wrapper Fulled With Elements
    elmToSlide.append(wrapper);
    elmToSlide.classList.add("slide-container");

    let slider = new KeenSlider(elmToSlide.querySelector(":scope > .keen-slider"), usedOptions, plugins);

    if (childrenLength > usedOptions.slides.perView) {
      if (usedOptions.arrows || usedOptions.prevArrow) {
        let prevArrow = wsMain.tools.createElm({
          type: "span",
          innerHTML: typeof usedOptions.prevArrow != 'string' ? '<span data-wsjs-icon="Arrow"></span>' : usedOptions.prevArrow,
          attrs: {
            class: "arrow arrow--prev icon-ws",
          },
        });

        prevArrow.addEventListener("click", () => slider.prev());
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

        nextArrow.addEventListener("click", () => slider.next());
        elmToSlide.append(nextArrow);
      }

      if (usedOptions.dots) {
        let dots = wsMain.tools.createElm({
          type: "div",
          attrs: {
            class: "dots",
          },
        });

        slider.track.details.slides.forEach((_e, idx) => {
          if (usedOptions.dotsType != 'group' || idx % usedOptions.slides.perView == 0) {
            let dot = wsMain.tools.createElm({
              type: "span",
              innerHTML:
                typeof usedOptions.dots != "string" ? "<span class='slide-dot'></span>" : usedOptions.dots,
              attrs: {
                class: `slide-dots ${idx == 0 ? 'active' : ''}`,
              },
            });

            dot.addEventListener("click", (event) => { 
              slider.moveToIdx(idx);
            });

            slider.on('slideChanged', (s) => {
              let slideIdx = s.track.details.rel;
              let l = s.options.slides.perView;
              let dot = s.container.parentNode.querySelectorAll('.slide-dots')[usedOptions.dotsType == 'group' ? slideIdx / l : slideIdx];

              if (dot) {
                s.container.parentNode.querySelector('.slide-dots.active').classList.remove('active');
                dot.classList.add('active');  
              }
            })

            dots.appendChild(dot);
          }
        });

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
  spanTagVerify(tag) {
    let itens = document.querySelectorAll(`[data-wsjs-${tag}]`);
    if (itens.length > 0) return true;
    return false;
  },
  getWsData(elm, typeData) {
    if (!elm) return false;

    let opt = {};
    let optionsText = elm.getAttribute("data-wsjs-" + typeData);
    
    if (typeData == 'slide' && optionsText === null) return false;

    if (optionsText === null || optionsText.trim() == '') return opt;

    let optionsArr = optionsText.split(';');

    if (optionsArr[optionsArr.length -1].trim() == '') optionsArr = optionsArr.slice(0, -1);

    optionsArr.forEach(optKey => {
      let keyName = optKey.split(':')[0].trim(),
          keyValue = optKey.split(':')[1].trim();

          if (keyValue == 'false') keyValue = false;
          if (keyValue == 'true') keyValue = true;

          let optToChange = opt;
          keyName.split('.').forEach((k, i) => {
            optToChange = optToChange[k] = i == keyName.split('.').length -1 ? keyValue : optToChange[k] || {};
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
        )

        elmToPut.setAttribute(attr, divPlaceHolder.getAttribute(attr));
      });

      // elmToPut.style.backgroundColor = '';

      if (elmToPut.querySelector('[data-wsjs-lazyload]') || elmToPut.hasAttribute('data-wsjs-lazyload')) {
        document.addEventListener("scroll", wsMain.addons.lazyLoad);
      }

      elmToPut.querySelectorAll('.lazyload').forEach(elm => {
        if (elm.getAttribute('data-wsjs-lazyload') != 'slide') {
          elm.style.minHeight = elm.getAttribute('data-lazyheight') || elmToPut.style.minHeight
        }
      });
      divPlaceHolder.parentNode.replaceChild(elmToPut, divPlaceHolder);
      
      setTimeout(() => {
        elmToPut.style.minHeight = '';
      }, 20);
      wsMain.data.replaceAllIcons();
    } catch (err) {
      console.log(err);
    }
  },
  lazyLoad(elm) {
    elm.style.minHeight = '';
    elm.removeAttribute("data-wsjs-lazyload");
    elm.setAttribute("src", elm.getAttribute("data-wsjs-src"));
    elm.setAttribute("alt", elm.getAttribute("data-wsjs-alt"));
    elm.removeAttribute("data-wsjs-alt");
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
    let arrFunctions = Object.keys(subFunctions).filter((k) => document.querySelector(`*[data-wsjs-${spanTag}=${k}]`) );

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
            } catch(_) {
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
    } catch(_) {}
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
      let lineToClamp = parseInt(maxLine/lineHeight);

      
      if (lineToClamp > lineStatic) lineToClamp = lineStatic;
      
      elm.style.setProperty('max-height', parseInt(lineHeight*lineToClamp) + 'px');
      elm.style.setProperty('min-height', parseInt(lineHeight*lineToClamp) + 'px');
      elm.style.setProperty('-webkit-line-clamp', lineToClamp);
    });
  }
};

wsMain.addons = {
  lastScrollPos: scrollY,
  lazyLoad() {
    document.querySelectorAll("*[data-wsjs-lazyload=scroll]").forEach((elm) => {
      if (elm.getBoundingClientRect().top - 20 < window.innerHeight) {
        wsMain.tools.lazyLoad(elm);
      }
    });

    if (document.querySelectorAll('*[data-wsjs-lazyload="scroll"]').length == 0) {
      document.removeEventListener('scroll', wsMain.addons.lazyLoad);
    }
  },
  throttle(fn, wait) {
    var time = Date.now();
    return function() {
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

    if (headerOptions.mobile) {
      if (vrf || scrollY < header.offsetHeight) {
        logoHeader.style.height = '6rem';
        logoHeader.style.margin = '2rem 0' 
      } else {
        logoHeader.style.height = '4rem';
        logoHeader.style.margin = '1rem 0' 
      }
    } else {
      if (scrollY > wsMain.addons.lastScrollPos && scrollY > (header.offsetHeight*1.75)) {
        console.log('Fechar')
        logoHeader.style.height = '4rem';
        document.querySelector('header .nav-header').style.transform = 'translateY(-100%)';
      }

      if (vrf || scrollY < (header.offsetHeight*1.5) || (Math.abs(scrollY - wsMain.addons.lastScrollPos) > ((height/100)*4) && scrollY < wsMain.addons.lastScrollPos)) { 
        logoHeader.style.height = '6rem';
        document.querySelector('header .nav-header').style.transform = 'translateY(0)';
      }
    }

    this.lastScrollPos = scrollY;
  },
  headerFirstLoad() {
    let header = document.querySelector('header');
    let headerOptions = wsMain.tools.getWsData(header, 'options');
    if (headerOptions.float != true) return;

    header.style.zIndex = '3';
    header.style.position = 'fixed'; 
    header.parentNode.style.paddingTop = header.offsetHeight +  'px';

    let booleanScroll = true;
    document.addEventListener('scroll' , (e) => {
      if (scrollY < header.offsetHeight) wsMain.addons.floatHeader(true);    
      if (booleanScroll) {
        booleanScroll = false;
        setTimeout(() => {
          wsMain.addons.floatHeader();
          booleanScroll = true;
        }, 500);
      };
    });
  }
}

if (document.querySelector('#HdEtapaLoja').value == 'HOME') {
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

// Executando Todos MÃ³dulos
window.addEventListener("load", async () => {

  try {
    let newsTitle = document.querySelector('.newsletter-text h2');
    if (newsTitle.innerHTML.trim() == '') newsTitle.parentNode.remove();
  } catch(_) { }

  await wsMain.exec();
  BuscaInicializa('input-busca');
  wsMain.data.replaceAllIcons();
  console.warn('Terminaram-se os mÃ³dulos')
});

// Aplicando Lazyload
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
        try { eval(funcToCall) } catch(_) {}
      }
    }, 100);
  } else {
    let modVerify = setInterval(() => {
      wsMain.moduleArr.forEach((mods) => {
        if (mods.funcName == mod && mod.isOk == true) {
          clearInterval(modVerify);          
          try { eval(funcToCall) } catch(_) {}
        }
      });
    }, 100);
  }
}

function FuncaoRecebeJsonSubProdutos(json) {
  json = JSON.parse(json);

  Object.keys(json).forEach(key => {
    if (!json[key] || json[key] == '' || json[key].length == 0) delete json[key];
  });

  wsMain.modules['pag-produto'].update(json);
}
