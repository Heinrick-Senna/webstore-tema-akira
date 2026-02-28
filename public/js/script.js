var SetEndPointRestCalls = 'http://akira.lojaswebstore.com.br';/* 08-07-2022 */
let ApiWS = {
    logs: {
        restCalls: []
    },
    Cookie: {
        name(name, tipo) {
            var d = new Date();
            var minute = d.getMinutes();
            var hour = d.getHours();
            var day = d.getDate() + "-" + d.getMonth();
            var minutePlus = 0;

            if (minute < 30) { minutePlus = 1; }
            else { minutePlus = 2; }

            var cacheUse = "";

            if (tipo == "D") { cacheUse = "_" + day; }
            if (tipo == "H") { cacheUse = "_" + day + "_" + hour; }
            if (tipo == "M10") { cacheUse = "_" + day + "_" + hour + "_" + minute.toString().substring(0, 1); }
            if (tipo == "M30") { cacheUse = "_" + day + "_" + hour + "_" + minutePlus; }

            var Token = $("#HdTokenLojaTemp").val();
            var CliId = $("#HD_LVCLI_ID").val();
            if (CliId != undefined && CliId != null && CliId != "" && CliId != "0") {
                Token += "_" + CliId;
            }

            var B2B = $("#LV_USU_B2B").val();
            var URL = window.location.href;

            return Token + name + B2B + cacheUse;

        },
        set(name, tipo, value) {
            try {
                if (typeof nPanel != 'undefined' && nPanel.token) return;
                var NomeCookie = ApiWS.Cookie.name(name, tipo);
                localStorage[NomeCookie] = JSON.stringify(value);
            } catch (e) {
                try {
                    console.log("XYH*&:" + e.message);
                    var erro = e.message;
                    if (erro.indexOf("exceeded the quota") >= 0) {
                        localStorage.clear();
                    }
                } catch (e) { }
            }
        },
        get(name, tipo) {
            let NomeCookie = ApiWS.Cookie.name(name, tipo);
            let Cookie = '';

            try {
                let Cookie = JSON.parse(localStorage[NomeCookie]);
                return Cookie;
            } catch (err) {
                return false;
            }
        }
    },
    Calls: {
        listProducts: {
            async home(prodsPerlineVar) {
                let name = "/produtos/home",
                    obj = {
                        "productsPerLine": prodsPerlineVar
                    },
                    cookieArr = ['M30', 'M10', 'M30'],
                    cookieNameAdjust = document.querySelector("#VarsCategorias")?.value;
                let data = (typeof produtosHome != 'undefined') ? produtosHome : await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
                wsMain.setGlobalData('listHomeProds', data);
                return data;
            },
            async previous() {
                let lastProds = window.localStorage.getItem('lastProds' + ApiWS['LV']);
                if ((!lastProds || lastProds.trim() == '') && typeof nPanel == 'undefined') return;
                let name = "/produtos/ultimos",
                    obj = {
                        ultimos: lastProds
                    },
                    cookieArr = [false, 'M', false];
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                wsMain.setGlobalData('listLastProds', data);
                return data;
            },
            async related() {
                let name = "/produtos/relacionados",
                    obj = {},
                    cookieArr = ['H', 'M10', 'H'];

                obj["Produto"] = document.querySelector("#LV_HD_PROD_ID")?.value;

                cookieNameAdjust = obj.Produto;
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
                wsMain.setGlobalData('listRelatedProds', data);
                return data;
            },
            async suggestion() {
                let name = "/produtos/relacionados",
                    obj = {},
                    cookieArr = [false, false, false];
                obj['tc'] = localStorage["orderIdKeepTC_B"];
                cookieNameAdjust = obj.tc;
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
                wsMain.setGlobalData('listSuggestionProds', data);
                return data;
            },
            async spotlight() {
                let name = "/produtos/destaques",
                    obj = {},
                    cookieArr = ['H', 'M30', 'H'];
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                wsMain.setGlobalData('listHighlightProds', data);
                return data;
            },
            async group(params) {
                let name = "/produtos/grupos",
                    obj = {...params},
                    cookieArr = ['H', 'H', 'H'];
                let data = (typeof produtosGrupo != 'undefined') ? produtosGrupo : await ApiWS.Calls.newCall(name, obj, cookieArr);
                wsMain.setGlobalData('listGroupProds', data);
                return data;
            },
            async category(prodsPerlineVar, page = false) {
                let name = "/produtos/listagem",
                    obj = {
                        SubEtapaWs: document.querySelector("#HdSubEtapa")?.value || '',
                        InfoListagem: document.querySelector("#HdVarInfoListagem")?.value,
                        VarsFiltrosListagem: document.querySelector("#HdFiltrosListagem")?.value || '',
                        VarsFiltrosListagemJson: document.querySelector("#HdFiltrosListagemJson")?.value || '',
                        num_pagina: page || new URL(window.location).searchParams.get('pagina') || 1,
                        productsPerLine: prodsPerlineVar
                    },
                    cookieArr = [false, "M10", false];
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                wsMain.setGlobalData('listCategoryProds', data);
                return data;
            }
        },
        async institutional(PaginaSearch) {
            let name = "/PaginasAdd",
                obj = {
                    LOJA: ApiWS.LV,
                    LVdashview: ApiWS.LVdashview,
                    LvToken: ApiWS.Token + WsParamAdds,
                    LvPage: PaginaSearch
                },
                cookieArr = ['H', 'H', 'H'];
            let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
            wsMain.setGlobalData('infoProduto', data);
            return data;
        },
        async produto() {
            let name = "/produtos/dadosproduto",
                obj = {
                    Produto: document.querySelector("#LV_HD_PROD_ID").value
                },
                cookieArr = [false, 'M', false];
            let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
            wsMain.setGlobalData('infoProduto', data);
            return data;
        },
        async infosLojas() {
            let name = "/InfosLojas",
                obj = {},
                cookieArr = ['H', 'H', 'H'];
            let data = (typeof infolojasHome != 'undefined') ? infolojasHome : await ApiWS.Calls.newCall(name, obj, cookieArr);
            wsMain.setGlobalData('infoLoja', data);
            return data;
        },
        async manufactures() {
            let name = "/fabricantes",
                obj = {},
                cookieArr = ['D', 'H', 'D'];
            let data = (typeof fabricantesHome != 'undefined') ? fabricantesHome : await ApiWS.Calls.newCall(name, obj, cookieArr);
            wsMain.setGlobalData('infoManufactureres', data);
            return data;
        },
        async banners() {
            let name = "/banners",
                obj = {
                    LVetapa: document.querySelector("#HdEtapaLoja").value,
                    InfoListagem: document.querySelector("#HdVarInfoListagem")?.value || null
                },
                cookieArr = ['H', 'H', 'H'],
                cookieNameAdjust = obj.LVetapa + '-' + obj.InfoListagem
            let data = (typeof bannersHome != 'undefined') ? bannersHome : await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
            wsMain.setGlobalData('infoBanners', data);
            return data;
        },
        async carrinho() {

            let orderTC = localStorage["orderIdKeepTC_B"] ? localStorage["orderIdKeepTC_B"].trim() : '';
            let url = endPointRestCalls + `/CheckoutSmart/CarrinhoSmart.aspx?tipo=CarrinhoOnPageVrs2&LV_ID=${ApiWS.LV}&orderTC=${orderTC}&LvToken=${ApiWS.Token + WsParamAdds}`;

            let data = await fetch(url);
            let response = await data.json();

            ApiWS.logs.restCalls.push({
                name: 'carrinho',
                response: response
            });

            wsMain.setGlobalData('infoCart', response);

            return response;
        },
        async ListaCategorias() {
            let name = "/categorias",
                obj = {
                    VarsFiltrosListagem: document.querySelector("#HdFiltrosListagem")?.value || '',
                    VarsFiltrosListagemJson: document.querySelector("#HdFiltrosListagemJson")?.value || '',
                    DptId: document.querySelector("#HD_CAT_ID")?.value || '',
                    DptTipo: document.querySelector("#HD_CAT_TIPO")?.value || '',
                    VarsCategorias: document.querySelector("#VarsCategorias")?.value || ''

                },
                // cookieArr = ['D', 'D', 'D'];
                cookieArr = [false, false, false]
            let data = (typeof categoriesHome != 'undefined') ? categoriesHome : await ApiWS.Calls.newCall(name, obj, cookieArr);

            let cookieNameAdjust = `${obj.VarsCategorias}_${obj.DptTipo}_${obj.DptId}_${obj.VarsFiltrosListagem}`
            wsMain.setGlobalData('infoCategory', data, cookieNameAdjust);
            return data;
        },
        async CadastraNews(Nome, Email) {
            if (Nome == "") return { status: 500, mensagem: "Preencha o campo nome." };
            if (Email == "") return { status: 500, mensagem: "Preencha o campo e-mail." };

            const form = new FormData();
            form.append("LOJA", ApiWS.LV);
            form.append("LVdashview", "\"1\"");
            form.append("LvToken", ApiWS.Token);
            form.append("Nome", Nome);
            form.append("Email", Email);

            const options = {
                method: 'POST',
            };

            options.body = form;

            let response = await fetch(ApiWS.UrlApi + '/cadastra-news', options);
            console.log(response);
            let data = await response.json();
            console.log(data)
            return data
        },
        async newCall(name, obj = false, cookieArr, cookieNameAdjust, method = 'GET', recall = true) {
            let cookieName;
            if (cookieArr[0] && ApiWS.LVdashview != 1) {
                cookieName = name.toLowerCase().replace(/\//g, '') + ApiWS.LV.replace(/_|\|/g, '');
                cookieName += cookieNameAdjust;

                let Cookie = ApiWS.Cookie.get(cookieName, cookieArr[0]);

                if (Cookie && Cookie != '') return Cookie;
            }

            let uri = name != '/CheckoutSmart/CarrinhoSmart.aspx' ? new URL(ApiWS.UrlApi + name).href : endPointRestCalls + name;
            let params = {
                LOJA: ApiWS.LV,
                LVdashview: ApiWS.LVdashview,
                LvToken: ApiWS.Token + WsParamAdds
            };

            if (cookieArr[1]) params['cachetype'] = ApiWS.cacheTime(cookieArr[1]);

            if (obj && typeof obj == 'object') params = { ...params, ...obj };
            let optionsToReq = {};

            // Object.keys(params).forEach(p => uri.searchParams.append(p, params[p]));
            if (method == 'GET') {
                uri += '?'
                if (new URL(location.href).searchParams.get('t')) uri += 'dragdropmode=1&';
                Object.keys(params).forEach(p => {
                    uri += p + '=' + params[p] + "&"
                });
                uri = uri.substring(0, uri.length - 1);
            } else {
                optionsToReq = {
                    method: method,
                    data: params
                }
            }

            let response = await fetch(uri, optionsToReq);

            let data = await response.text();
            let jsonToReturn;
            ApiWS.logs.restCalls.push({
                'url': uri,
                'response': data,
                'method': method
            })
            try {
                jsonToReturn = JSON.parse(data);
            } catch (err) {
                if (recall) {
                    return await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust, method, false);
                } else {
                    console.log(err);
                    jsonToReturn = {};
                }
            }

            ApiWS.logs.restCalls.push({
                name: name,
                response: jsonToReturn
            });

            if (cookieArr[2]) ApiWS.Cookie.set(cookieName, cookieArr[2], jsonToReturn);

            return jsonToReturn;
        }
    }
}

ApiWS['Token'] = document.querySelector('#HdTokenLojaTemp').value;
ApiWS['LV'] = document.querySelector('#HD_LV_ID').value;
ApiWS['UrlApi'] = 'https://apilojaws.wslojas.com.br/' + 'api-loja-v2';
if (window.location.href.indexOf(".localhost") >= 0) { ApiWS['UrlApi'] = window.location.protocol + "//" + window.location.host + "/" + 'api-loja-v2'; }
if (typeof defineEndPointApi !== 'undefined' && window.location.href.indexOf("localhost") < 0) { ApiWS['UrlApi'] = defineEndPointApi + '/' + 'api-loja-v2'; }

ApiWS.FileReturn = null;
ApiWS.Json = null;
ApiWS.LVdashview = null;
ApiWS.objetosReturn = null;

let WsParamAdds = ''


ApiWS.ApiStart = function () {
    try {
        console.log("WsJsVrs23-08-2019-08-53");

        var Token = $("#HdTokenLojaTemp").val();
        ApiWS.LV = $("#HD_LV_ID").val();
        ApiWS.LVdashview = "";
        var CliId = $("#HD_LVCLI_ID").val();
        if (CliId != undefined && CliId != null && CliId != "" && CliId != "0") {
            WsParamAdds = "&WsCliId=" + CliId;
        }
        var CliIsB2b = $("#LV_USU_B2B").val();
        if (CliIsB2b == "1") {
            WsParamAdds += "&CliIsB2b=1";
        } else {
            WsParamAdds += "&CliIsB2b=0";
        }
        var UseCdn = false;
        var UrlNavegador = window.location.href;
        if (UrlNavegador.indexOf("localhost") < 0 || UrlNavegador.indexOf("localhost:3000") >= 0) {
            UseCdn = true;
            console.log("WEB");
        } else {
            console.log("LOCAL");
        }

        try {
            var layout = $("#API_layout").val();
            if (layout) {
                WsParamAdds += "&layout=" + layout;
            }
        } catch (e) { }

        try {
            var CookieDashview = "";

            if (UrlNavegador.indexOf("?dashview") >= 0 || (UrlNavegador.indexOf("localhost") >= 0 && UrlNavegador.indexOf("localhost:3000") < 0)) {
                UseCdn = false;
                localStorage["dashview"] = "1";
                CookieDashview = localStorage["dashview"];
            }

            if ((UrlNavegador.indexOf("localhost") < 0)) {
                CookieDashview = localStorage["dashview"];
            }
            if (CookieDashview != "" && CookieDashview != null && CookieDashview != undefined) {
                if (CookieDashview == "1") {
                    UseCdn = false;
                    ApiWS.LVdashview = "1";
                }
            }
            console.log("LVdashview:" + ApiWS.LVdashview);
        } catch (e) { }
        //UseCdn = true; //APAGAR!!!
        //ApiWS.LVdashview = "1"; //APAGAR!!!
        var GetTypeCdn = document.querySelector("#HD_TYPE_CDN")?.value;
        var GetTypeCdnApi = document.querySelector("#HD_TYPE_CDN_API")?.value;
        var CdnOption = document.querySelector("#HD_CDN_OPT")?.value;
        var CdnKind = document.querySelector("#HD_CDN_KIND")?.value;
        //console.log("GetTypeCdn:" + GetTypeCdn);

        var CdnKindChoice = "";
        var CdnKindChoiceMatch = "";
        try {

            if (CdnKind != "" && CdnOption != "" && CdnKind != undefined && CdnOption != undefined) {

                var objCdnOptions = JSON.parse(CdnOption);

                for (o = 0; o < objCdnOptions.length; o++) {

                    if (objCdnOptions[o].kind == CdnKind) {
                        CdnKindChoice = objCdnOptions[o].url;
                        CdnKindChoiceMatch = "1";
                    } else if (CdnKindChoiceMatch == "") {
                        CdnKindChoice = objCdnOptions[o].url;
                    }

                }

            }

        } catch (e) { }

        console.log("CdnKindChoice:" + CdnKindChoice);
        console.log("CdnKind:" + CdnKind);
        //console.log("CdnOption:" + CdnOption);


        if (UrlNavegador.indexOf(":3000") > 0) {
            GetTypeCdn = "wslojas.com.br";
            ApiWS.LVdashview = "1";
        }

        //UseCdn = true;


        if (typeof UseCdn !== 'undefined') {
            try {

                if (UseCdn == true) {

                    if (CdnKindChoice != "") {

                        console.log("CDN_Option_" + CdnKind + "");
                        UrlApi = CdnKindChoice;

                    } else {

                        console.log("XCDNTRUE001");

                        /*if (GetTypeCdn.indexOf("wslojas.com.br") >= 0) {
                            UrlApi = "https://apilojaws.wslojas.com.br";
                        } else if (GetTypeCdn.indexOf("plataformawebstore.com.br") >= 0) {
                            UrlApi = "https://apilojaws.plataformawebstore.com.br";
                        }
                        else {
                            UrlApi = "https://apilojaws.wslojas.com.br";
                        }*/

                        /*UrlApi = "https://cdn-api-ws5.webstore.com.br";*/

                        if (GetTypeCdnApi != "" && GetTypeCdnApi != undefined && GetTypeCdnApi != null) {
                            /*ApiWS['UrlApi'] = GetTypeCdnApi;*/
                        }

                    }

                }

            } catch (e) { }
        }



        //console.log("Token:" + Token);
        //console.log("LV:" + ApiWS.LV);

        window.setInterval("keepWsBrand()", 3000);

    }
    catch (e) {
        console.log(e.message);
    }
}

ApiWS.Confirm301 = function (domain) {
    try {

        var URL = window.location.href;
        URL = URL.replace(domain, "");
        URL = URL.replace(domain.replace("www.", ""), "");

        console.log("starting 301:" + URL);

        if (URL.indexOf("logoff") < 0) {

            if (URL.length > 10) {

                console.log("Analisando 301");

                $.ajax({
                    type: "GET",
                    url: UrlApi + "/" + VersaoApi + "/InfosLojas",
                    data: "LOJA=" + ApiWS.LV + "&analisa301=" + URL,
                    beforeSend: function () { },
                    error: function (e) { console.log("Falha analisando 301"); },
                    success: function (retorno) {

                        console.log("301:" + retorno);
                        if (retorno.indexOf("REDIRECT:") >= 0) {
                            window.location.href = domain + retorno.replace("REDIRECT:", "");
                        }

                    }
                });

            }
        }

    } catch (e) { console.log(e.message); console.log("Erro ao cadastrar email de newsletter:" + e.message); }
}

ApiWS.cacheTime = function (tipo) {

    try {

        var d = new Date();
        var minute = d.getMinutes();
        var hour = d.getHours();
        var day = d.getDate() + "-" + d.getMonth();
        var minutePlus = 0;

        if (minute < 30) { minutePlus = 1; }
        else { minutePlus = 2; }

        var cacheUse = "";

        if (tipo == "D") { cacheUse = day; }
        if (tipo == "H") { cacheUse = day + "_" + hour; }
        if (tipo == "M10") { cacheUse = day + "_" + hour + "_" + minute.toString().substring(0, 1); }
        if (tipo == "M30") { cacheUse = day + "_" + hour + "_" + minutePlus; }
        if (tipo == "M") { cacheUse = day + "_" + hour + "_" + minute.toString(); }

        return cacheUse;

    } catch (e) { console.log(e.message); }

}

function keepWsBrand() {
    $("div[class*='LV_RODAPE_']").show();
}

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


wsMain.createModule({
  name: 'placeholders',
  function: 'create',
  subFunctions: {
    fabricantes() {
      if (wsMain.placeHolders.fabricantes.qtd > 0) {
        let tags = document.querySelectorAll('[data-wsjs-module=fabricantes]');
        tags.forEach(tag => {
          tag.setAttribute('data-wsholder', 'true');
          tag.style.minHeight = wsMain.placeHolders.fabricantes.height;
        });
      }
    },
    condicoes() {
      if (wsMain.placeHolders.condicoes.qtd > 0) {
        let tags = document.querySelectorAll('[data-wsjs-module=conditions]');

        tags.forEach(tag => {
          tag.setAttribute('data-wsholder', 'true');
          tag.style.minHeight = wsMain.placeHolders.condicoes.height;
        });
      }
    },
    banners() {
      placeholderHome.banners.forEach(banner => {
        try {
          let defaultHeight = wsMain.placeHolders.banners[banner.regiao.toLowerCase()]?.height;
          let heightToUse = banner.altura == 0 || !banner.altura ? defaultHeight : banner.altura;

          document.querySelectorAll(`*[data-wsjs-banner="${banner.regiao.toLowerCase()}"]`).forEach(tag => {
            tag.setAttribute('data-wsholder', 'true');
            tag.style.minHeight = heightToUse;
          });
        } catch(_) {}
      });
    },
    grupos() {
      return;
      if (wsMain.placeHolders.grupos.qtd > 0) {
        let heightSet = parseInt(wsMain.placeHolders.grupos?.height)*wsMain.placeHolders.grupos.qtd;
        let heightToUse = wsMain.placeHolders.grupos?.height.replace(/([0-9]{0,})/, heightSet);

        document.querySelectorAll(`[data-wsjs-prod-list]`).forEach(tag => {
          if (tag.getAttribute('data-wsjs-prod-list') != 'previous' && tag.getAttribute('data-wsjs-prod-list') != 'home' && tag.getAttribute('data-wsjs-prod-list') != 'spotlight') {
            tag.setAttribute('data-wsholder', 'true');
            tag.setAttribute('data-lazyheight', wsMain.placeHolders.grupos?.height);
            tag.style.minHeight = heightToUse;
          }
        });
      }
    },
    produtos() {

    }
  },
  async create() {
    try {
      if (wsMain.placeHolders) {
        Object.keys(wsMain.modules['placeholders'].subFunctions).forEach(async holder => {
          try {
            await wsMain.modules['placeholders'].subFunctions[holder]();
          } catch(err) {
            console.log(err);
          }
        });
      }

      try {
        document.querySelector('[data-wsjs-loader]').style.display = 'block';      
      } catch(err) {}
      
      return true;
    } catch(err) {
      console.log(err)
      return false;
    }
  }
});

wsMain.createModule({
  name: 'ws-icons',
  /*onlyAfter: 'banners',*/
  function: 'get',
  async get() {
    let data, cookieName = 'icons';

    if (ApiWS.LVdashview != 1) {
      let Cookie = ApiWS.Cookie.get(cookieName, 'D');

      if (Cookie && Cookie != '') data = Cookie;
    }

    let obj;

    if (!data) {
      //let response = await fetch("https://cdns3.webstore.net.br/files/0ws/wireframe/icones-wireframe.svg?versao=A-01-12-23");
      //data = await response.text();

      data = `
			<svg ico="close-2" xmlns="http://www.w3.org/2000/svg" width="14.828" height="14.828" viewBox="0 0 14.828 14.828"><path data-name="Caminho 8519" d="m13.414 1.414-12 12m0-12 12 12" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
			<svg ico="copy"
			xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<defs>
				<clipPath id="a">
					<path data-name="Retï¿½ngulo 415" fill="#fff" d="M953 580h24v24h-24z"/>
				</clipPath>
			</defs>
			<g data-name="Grupo 382" transform="translate(-953 -580)" clip-path="url(#a)">
				<path data-name="Caminho 333" d="M971.091 598.316h.272a2.573 2.573 0 0 0 2.8-2.891v-8.288h-4.939a1.339 1.339 0 0 1-1.442-1.442v-5.238h-4.728a2.557 2.557 0 0 0-2.848 2.821v.413h1.354a4.316 4.316 0 0 1 3.357 1.292l4.992 4.993a4.331 4.331 0 0 1 1.187 3.348Zm-1.626-12.366h4.553a1.829 1.829 0 0 0-.6-.914l-3.551-3.639a1.66 1.66 0 0 0-.905-.588l.009 4.64c.002.351.142.501.494.501Zm-10.758 16.884h8.227a2.568 2.568 0 0 0 2.865-2.892v-6.811h-6.267a1.468 1.468 0 0 1-1.661-1.67v-6.486h-3.164a2.574 2.574 0 0 0-2.865 2.9v12.067a2.564 2.564 0 0 0 2.865 2.892Zm4.931-10.995h6a2.685 2.685 0 0 0-.73-1.143l-4.632-4.7a2.849 2.849 0 0 0-1.125-.791v6.152a.432.432 0 0 0 .487.482Z" fill="#1c1c1e"/>
			</g>
		</svg>
		<svg ico="user-without-circle"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.09 18.98">
			<path data-name="Caminho 36" d="M1.021 18.987a1.022 1.022 0 0 1-.991-1.264 8.826 8.826 0 0 1 17.024-.378 1.021 1.021 0 0 1-1.957.581 6.785 6.785 0 0 0-13.087.291 1.021 1.021 0 0 1-.989.77Z"/>
			<path data-name="Caminho 37" d="M8.928 9.802H8.17A4.589 4.589 0 0 1 3.58 5.21v-.327A4.887 4.887 0 0 1 8.47 0a5.046 5.046 0 0 1 5.047 5.051v.162a4.589 4.589 0 0 1-4.588 4.589Zm-.461-7.76a2.846 2.846 0 0 0-2.846 2.845v.327A2.547 2.547 0 0 0 8.17 7.76h.759a2.547 2.547 0 0 0 2.547-2.547V5.05A3 3 0 0 0 8.47 2.041Z"/>
		</svg>
		<svg ico="cart-2"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.06 18.98">
			<path data-name="Caminho 27" d="M15.479 18.987H2.452a1.818 1.818 0 0 1-1.807-1.619v-.043L.007 7.747V7.71a1.787 1.787 0 0 1 .124-.714 1.791 1.791 0 0 1 .4-.606 1.792 1.792 0 0 1 .6-.4 1.792 1.792 0 0 1 .7-.125h14.414a1.818 1.818 0 0 1 1.818 1.818v.081l-.772 9.586v.04a1.818 1.818 0 0 1-1.8 1.6Zm-12.838-2.02h12.65l.731-9.085H2.036Z"/>
			<path data-name="Caminho 28" d="M13.069 10.503a1.01 1.01 0 0 1-1.01-1.01V5.05a3.03 3.03 0 0 0-6.06 0v4.444a1.01 1.01 0 1 1-2.02 0V5.05a5.05 5.05 0 0 1 10.1 0v4.444a1.01 1.01 0 0 1-1.01 1.009Z"/>
		</svg>
		<svg ico="empty-heart"
			xmlns="http://www.w3.org/2000/svg" width="18.93" height="16.584">
			<path data-name="Caminho 41" d="M5.221 0a5.463 5.463 0 0 1 3.918 1.656l.32.319.326-.321A5.463 5.463 0 0 1 13.7 0a5.459 5.459 0 0 1 2.9.833l.011.007a5.059 5.059 0 0 1 .867 7.8l-7.141 7.529a1.125 1.125 0 0 1-1.659.1L1.453 8.64a5.059 5.059 0 0 1 .853-7.8l.013-.008A5.458 5.458 0 0 1 5.221 0Zm4.246 4.4h-.024a1.011 1.011 0 0 1-.714-.295l-1.024-1.02-.013-.013a3.44 3.44 0 0 0-4.291-.526 3.036 3.036 0 0 0-.5 4.679l.016.016 6.545 6.911 6.556-6.912.014-.015a3.035 3.035 0 0 0-.511-4.68 3.437 3.437 0 0 0-1.82-.521 3.439 3.439 0 0 0-2.471 1.047l-.017.017-1.036 1.02a1.012 1.012 0 0 1-.71.29Z" fill="#333"/>
		</svg>
		<svg
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.062 19.987">
			<path data-name="Caminho 27" d="M15.479 18.987H2.452a1.818 1.818 0 0 1-1.807-1.619v-.043L.007 7.747V7.71a1.787 1.787 0 0 1 .124-.714 1.791 1.791 0 0 1 .4-.606 1.792 1.792 0 0 1 .6-.4 1.792 1.792 0 0 1 .7-.125h14.414a1.818 1.818 0 0 1 1.818 1.818v.081l-.772 9.586v.04a1.818 1.818 0 0 1-1.8 1.6Zm-12.838-2.02h12.65l.731-9.085H2.036Z"/>
			<path data-name="Caminho 28" d="M13.069 10.503a1.01 1.01 0 0 1-1.01-1.01V5.05a3.03 3.03 0 0 0-6.06 0v4.444a1.01 1.01 0 1 1-2.02 0V5.05a5.05 5.05 0 0 1 10.1 0v4.444a1.01 1.01 0 0 1-1.01 1.009Z"/>
		</svg>
		<svg ico="float-box"
			xmlns="http://www.w3.org/2000/svg" width="19.467" height="18.545">
			<path data-name="Caminho 67" d="M13.913 18.545a1.125 1.125 0 0 0 1.134-1.283v-2.154h.351a3.762 3.762 0 0 0 4.069-4.139V4.14A3.764 3.764 0 0 0 15.337 0H4.131A3.768 3.768 0 0 0 0 4.14v6.829a3.768 3.768 0 0 0 4.131 4.139h5.291l3.014 2.655c.602.536.976.782 1.477.782Zm-.431-1.969-2.786-2.751a1.347 1.347 0 0 0-1.169-.474H4.192a2.159 2.159 0 0 1-2.443-2.435V4.192a2.159 2.159 0 0 1 2.443-2.434h11.092a2.149 2.149 0 0 1 2.434 2.434v6.724a2.149 2.149 0 0 1-2.434 2.435h-1.081c-.5 0-.721.2-.721.72Z" fill="#222"/>
		</svg>
		<svg ico="search-2"
			xmlns="http://www.w3.org/2000/svg" width="17.371" height="17.371">
			<g data-name="Grupo 122">
				<path data-name="Caminho 25" d="M7.465 14.929A7.466 7.466 0 0 1 4.559.587a7.466 7.466 0 0 1 5.811 13.755 7.419 7.419 0 0 1-2.905.587Zm0-13.015a5.551 5.551 0 1 0 3.924 1.626 5.514 5.514 0 0 0-3.924-1.626Z"/>
				<path data-name="Caminho 26" d="M16.433 17.371a.935.935 0 0 1-.663-.275l-4.382-4.382a.938.938 0 0 1 1.326-1.326l4.382 4.382a.938.938 0 0 1-.663 1.6Z"/>
			</g>
		</svg>
		<svg ico="user-circle"
			xmlns="http://www.w3.org/2000/svg" width="18.19" height="18.176">
			<g data-name="Grupo 120">
				<path data-name="Caminho 1329" d="M9.091 18.176a9.088 9.088 0 1 0-9.09-9.088 9.152 9.152 0 0 0 9.09 9.088Zm0-1.81a7.273 7.273 0 1 1 7.28-7.278 7.247 7.247 0 0 1-7.28 7.278Zm0-7.577a2.415 2.415 0 1 0-2.23-2.434 2.3 2.3 0 0 0 2.23 2.434Zm-3.88 4.694h7.76a.55.55 0 0 0 .57-.615 4.615 4.615 0 0 0-8.9 0 .55.55 0 0 0 .57.615Z" fill="#1c1c1e"/>
			</g>
		</svg>
		<svg ico="AmericanExpress"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 29">
			<path data-name="Caminho 5280" d="m7.359 10.078-4 8.852h4.789l.594-1.411h1.357l.594 1.411h5.266v-1.077l.47 1.077h2.73l.47-1.1v1.1h10.962l1.333-1.375 1.248 1.375 5.63.011-4.013-4.413 4.014-4.45h-5.544l-1.3 1.349-1.206-1.349H18.828l-1.024 2.285-1.045-2.285h-4.782v1.041l-.532-1.041Zm16.37 1.257h6.3l1.925 2.08 1.987-2.08h1.918l-2.922 3.193 2.922 3.155H33.85l-1.925-2.1-2 2.1h-6.2Zm1.555 2.475v-1.16h3.928l1.714 1.854-1.79 1.865h-3.852v-1.267h3.434V13.81Zm-17-2.475h2.334l2.653 6v-6h2.557l2.049 4.3 1.889-4.3h2.544v6.352h-1.546l-.013-4.977-2.257 4.977H17.11l-2.27-4.977v4.977h-3.181l-.6-1.424h-3.27l-.6 1.423H5.481Zm.061 3.612L9.42 12.41l1.073 2.537Z" fill-rule="evenodd"/>
		</svg>
		<svg ico="Arrow"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 133.53 240.91">
			<path d="M133.53 120.69c0 3.98-.92 6.06-4.09 9.22L22.53 236.84c-2.68 2.66-5.86 4.07-9.22 4.07s-6.55-1.41-9.22-4.07v-.02C1.41 234.16 0 230.98 0 227.6s1.41-6.53 4.09-9.22l97.7-97.69L4.09 23C1.41 20.33 0 17.14 0 13.78s1.41-6.55 4.07-9.22C6.87 1.79 9.51 0 12.66 0c2.84 0 6.11 1.48 10.25 4.94l106.53 106.53c3.18 3.18 4.09 5.23 4.09 9.22Z"/>
		</svg>
		<svg ico="Boleto"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34.386 22.037">
			<path data-name="Caminho 5375" d="M17.186 22.025H1.582a1.612 1.612 0 0 1-.506-.11 1.373 1.373 0 0 1-.411-.215 1.644 1.644 0 0 1-.54-.664A1.836 1.836 0 0 1 0 20.29V1.74a1.7 1.7 0 0 1 0-.21 1.68 1.68 0 0 1 .08-.45A1.618 1.618 0 0 1 .527.446 4.778 4.778 0 0 1 .938.158a.574.574 0 0 1 .19-.073c.137-.032.272-.06.416-.079A2.058 2.058 0 0 1 1.81 0h31.019a2.032 2.032 0 0 1 .656.185 1.843 1.843 0 0 1 .6.487 1.5 1.5 0 0 1 .168.316 1.77 1.77 0 0 1 .13.917v18.624a.988.988 0 0 1-.122.477 1.937 1.937 0 0 1-.163.32 1.784 1.784 0 0 1-.292.306 2.137 2.137 0 0 1-.362.242 1.537 1.537 0 0 1-.279.085 4.1 4.1 0 0 1-1.207.058q-7.386.007-14.772 0m.007-1.049h15.393a1.548 1.548 0 0 0 .21 0 .545.545 0 0 0 .341-.177.59.59 0 0 0 .139-.427V1.657a1.483 1.483 0 0 0 0-.157.479.479 0 0 0-.184-.314.679.679 0 0 0-.463-.141H1.82a.815.815 0 0 0-.415.066.539.539 0 0 0-.285.371.846.846 0 0 0 0 .188v18.676a.876.876 0 0 0 0 .188.51.51 0 0 0 .175.3.7.7 0 0 0 .464.133h15.438"/>
			<path data-name="RetÃƒÂ¢ngulo 827" d="M11.655 2.107h3.314V13.63h-3.314z"/>
			<path data-name="RetÃƒÂ¢ngulo 828" d="M2.783 2.107h2.205v16.766H2.783z"/>
			<path data-name="RetÃƒÂ¢ngulo 829" d="M29.399 2.106h2.204v16.765h-2.204z"/>
			<path data-name="RetÃƒÂ¢ngulo 830" d="M8.327 2.106h2.203v11.522H8.327z"/>
			<path data-name="RetÃƒÂ¢ngulo 831" d="M18.308 2.106h2.204v11.522h-2.204z"/>
			<path data-name="RetÃƒÂ¢ngulo 832" d="M26.073 2.107h2.204V13.63h-2.204z"/>
			<path data-name="RetÃƒÂ¢ngulo 833" d="M6.109 2.103h1.093v11.524H6.109z"/>
			<path data-name="RetÃƒÂ¢ngulo 834" d="M16.091 2.107h1.096V13.63h-1.096z"/>
			<path data-name="RetÃƒÂ¢ngulo 835" d="M21.636 2.103h1.093v11.524h-1.093z"/>
			<path data-name="RetÃƒÂ¢ngulo 836" d="M23.854 2.107h1.093v11.524h-1.093z"/>
			<path data-name="Caminho 5376" d="M12.202 16.736c0 .239-.005.421 0 .6a1.479 1.479 0 0 1-.12.531 1.682 1.682 0 0 1-.593.733 2.153 2.153 0 0 1-.349.156 1.5 1.5 0 0 1-.77.118 1.539 1.539 0 0 1-.417-.108.931.931 0 0 1-.3-.139 3.221 3.221 0 0 1-.358-.284 1.3 1.3 0 0 1-.3-.467 1.433 1.433 0 0 1-.12-.518v-1.153a1.029 1.029 0 0 1 .126-.514 2.738 2.738 0 0 1 .222-.388 1.561 1.561 0 0 1 .6-.471 1.671 1.671 0 0 1 .96-.139 3.616 3.616 0 0 1 .521.182 1.4 1.4 0 0 1 .6.486 1.542 1.542 0 0 1 .241.5 4.069 4.069 0 0 1 .057.869m-2.218.039v.346a.843.843 0 0 0 .058.423.6.6 0 0 0 .4.282.634.634 0 0 0 .327-.049.529.529 0 0 0 .318-.436v-.975a.655.655 0 0 0-.058-.335.557.557 0 0 0-.411-.291.546.546 0 0 0-.641.543c.011.163 0 .328 0 .493"/>
			<path data-name="Caminho 5377" d="M21.63 16.789c0-.231-.006-.461 0-.692a.861.861 0 0 1 .118-.4 2.463 2.463 0 0 1 .147-.279 3.409 3.409 0 0 1 .312-.344 1.439 1.439 0 0 1 .543-.308 1.517 1.517 0 0 1 .8-.068 1.6 1.6 0 0 1 .682.263 1.52 1.52 0 0 1 .511.558c.051.117.09.239.144.355a1.939 1.939 0 0 1 .061.789 7.53 7.53 0 0 1 0 .817 1.332 1.332 0 0 1-.112.373 1.09 1.09 0 0 1-.14.273 2.7 2.7 0 0 1-.329.367 1.6 1.6 0 0 1-.351.239c-.1.049-.22.05-.321.093a1.365 1.365 0 0 1-.631.044 2.744 2.744 0 0 1-.35-.1.667.667 0 0 1-.3-.136c-.11-.089-.233-.166-.335-.262a1.566 1.566 0 0 1-.327-.475 1.644 1.644 0 0 1-.123-.759v-.346Zm2.216-.011v-.43a.576.576 0 0 0-.059-.314.564.564 0 0 0-.472-.3.981.981 0 0 0-.269.063.466.466 0 0 0-.307.406v1.069a.5.5 0 0 0 .33.507.552.552 0 0 0 .535-.038.489.489 0 0 0 .246-.462c-.008-.167 0-.335 0-.5"/>
			<path data-name="Caminho 5378" d="M14.076 15.734h-1.313v-1.043c.031 0 .059-.007.087-.007h2.118a.54.54 0 0 1 .5.3.426.426 0 0 1 .053.271.9.9 0 0 1-.089.269c-.053.111-.12.215-.181.322s-.136.234-.2.353c-.034.064-.055.135-.082.2s-.056.134-.081.2c-.069.189-.145.376-.2.567a5.183 5.183 0 0 1-.147.554 1.477 1.477 0 0 0-.062.437c-.03.232-.057.464-.087.7h-1.073c0-.2-.007-.4 0-.6a2.739 2.739 0 0 1 .057-.4c.034-.173.077-.345.116-.517 0-.01.005-.02.008-.03.053-.209.1-.421.162-.626.048-.153.126-.3.187-.447.03-.073.049-.151.08-.224s.072-.144.108-.217c.01-.02.017-.04.033-.078"/>
			<path data-name="Caminho 5379" d="M27.148 18.873h-1.073c0-.2-.007-.4 0-.6a2.747 2.747 0 0 1 .057-.4c.034-.173.077-.345.116-.517 0-.01.005-.02.008-.03.053-.209.1-.421.162-.626.048-.153.126-.3.187-.447.03-.073.049-.151.08-.224s.072-.144.108-.217c.01-.02.017-.04.033-.078h-1.313v-1.041a.712.712 0 0 1 .076-.008h2.14a.532.532 0 0 1 .492.3.431.431 0 0 1 .053.271.9.9 0 0 1-.088.269c-.053.111-.12.215-.181.322s-.136.234-.2.353a2.179 2.179 0 0 0-.082.2c-.027.068-.056.134-.081.2-.069.189-.145.376-.2.567a5.206 5.206 0 0 1-.147.554 1.479 1.479 0 0 0-.062.437c-.03.232-.057.464-.087.7"/>
			<path data-name="Caminho 5380" d="M8.321 18.874h-1.11v-3.138h-1.1v-1.043a.548.548 0 0 1 .072-.009h1.608a.582.582 0 0 1 .472.3.546.546 0 0 1 .059.314v3.45Z"/>
			<path data-name="Caminho 5381" d="M18.302 18.874h-1.105v-3.137h-1.106v-1.043a.526.526 0 0 1 .071-.009h1.619a.584.584 0 0 1 .461.3.544.544 0 0 1 .059.314v3.45Z"/>
			<path data-name="Caminho 5382" d="M21.075 18.874H19.97v-3.138h-1.106v-1.043a.517.517 0 0 1 .071-.009h1.619a.584.584 0 0 1 .461.3.544.544 0 0 1 .059.314v3.45Z"/>
		</svg>
		<svg ico="Cart"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.91 237.63">
			<path d="M193.26 219.8c0 9.85-7.98 17.83-17.83 17.83s-17.83-7.98-17.83-17.83 7.99-17.83 17.83-17.83 17.83 7.98 17.83 17.83ZM110.09 219.8c0 9.85-7.98 17.83-17.83 17.83s-17.83-7.98-17.83-17.83 7.98-17.83 17.83-17.83 17.83 7.98 17.83 17.83ZM11.89 23.78h5.42l33.66 156.93c1.17 5.48 6 9.42 11.61 9.42h142.88c6.58 0 11.91-5.33 11.91-11.91s-5.33-11.91-11.91-11.91H72.12l-5.09-23.78H213.3c2.2 0 4.08-1.5 4.63-3.6l22.83-97.45c.75-2.95-1.54-5.86-4.63-5.86H44.14L38.53 9.4A11.88 11.88 0 0 0 26.91 0H11.89C5.32 0 0 5.32 0 11.89s5.32 11.89 11.89 11.89Z"/>
		</svg>
		<svg ico="Close"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.91 240.91">
			<path d="M120.45 0C53.91 0 0 53.92 0 120.45S53.91 240.9 120.45 240.9 240.9 186.99 240.9 120.45 187 0 120.45 0Zm42.91 163.36c-4.37 4.37-11.46 4.37-15.83 0l-27.08-27.08-27.08 27.08c-4.37 4.37-11.46 4.37-15.83 0-4.37-4.37-4.37-11.46 0-15.83l27.08-27.08-27.08-27.08c-4.37-4.37-4.37-11.46 0-15.83 4.37-4.37 11.46-4.37 15.83 0l27.07 27.08 27.08-27.08c4.37-4.37 11.46-4.37 15.83 0 4.37 4.37 4.37 11.46 0 15.83l-27.07 27.07 27.08 27.08c4.37 4.37 4.37 11.46 0 15.83Z"/>
		</svg>
		<svg ico="Elo"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.213 12.215">
			<path data-name="Caminho 5285" d="M9.672 6.787a3.674 3.674 0 0 1-3.615 2.895 3.743 3.743 0 0 1-1.171-.186l-.819 2.4a6.36 6.36 0 0 0 1.99.317 6.245 6.245 0 0 0 6.144-4.92Z" fill="#ec412a"/>
			<path data-name="Caminho 5286" d="M24.372 1.357v6.951l1.247.5-.59 1.371-1.234-.5a1.387 1.387 0 0 1-.608-.494 1.515 1.515 0 0 1-.239-.862v-6.97Zm-9.46 5.166a3.738 3.738 0 0 1 7.345-.766l-6.743 2.787a3.493 3.493 0 0 1-.602-2.021Zm1.543.279a1.838 1.838 0 0 1-.013-.255 2.159 2.159 0 0 1 2.226-2.086 2.21 2.21 0 0 1 1.639.752Zm3.71 1.29a2.234 2.234 0 0 1-2.7.278l-.815 1.255a3.816 3.816 0 0 0 4.582-.471Zm9.4-3.632a2.247 2.247 0 0 0-.695.109l-.485-1.406a3.836 3.836 0 0 1 1.18-.185 3.7 3.7 0 0 1 3.649 2.881l-1.5.3a2.174 2.174 0 0 0-2.151-1.698Zm-2.469 4.816 1.015-1.11a2.073 2.073 0 0 1 0-3.173l-1.015-1.11a3.522 3.522 0 0 0 0 5.393Zm2.467-.578a2.175 2.175 0 0 0 2.147-1.693l1.5.3a3.7 3.7 0 0 1-3.649 2.878 3.832 3.832 0 0 1-1.182-.185l.487-1.406a2.258 2.258 0 0 0 .697.105Z" fill-rule="evenodd"/>
			<path data-name="Caminho 5287" d="m1.874 10.858 1.515-1.956a4.093 4.093 0 0 1 0-5.589L1.873 1.357a6.959 6.959 0 0 0 0 9.5" fill="#1ba7de"/>
			<path data-name="Caminho 5288" d="M4.885 2.718a3.748 3.748 0 0 1 1.17-.186 3.674 3.674 0 0 1 3.616 2.9l2.53-.506A6.244 6.244 0 0 0 6.055 0a6.376 6.376 0 0 0-1.988.316Z" fill="#feca2f"/>
		</svg>
		<svg ico="Email"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.91 179.06">
			<path d="M140.14 115.69c-6.07 3.68-12.9 5.55-19.73 5.55s-13.47-1.77-19.3-5.37L3.75 53.01C2.14 51.96 0 53.06 0 54.92v112.59c0 6.37 5.41 11.55 12.04 11.55h216.82c6.64 0 12.04-5.19 12.04-11.55V54.92c0-1.87-2.13-2.96-3.75-1.91l-97.02 62.68Z"/>
			<path d="M114.24 102.35c3.65 2.23 8.73 2.23 12.66-.18L239.87 29.2c.66-.41 1.04-1.14 1.04-1.91V11.55C240.91 5.18 235.5 0 228.87 0H12.05C5.41 0 0 5.18 0 11.55v15.74c0 .77.38 1.5 1.04 1.91l113.2 73.15Z"/>
		</svg>
		<svg ico="Favorite"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.91 199.94">
			<path d="M221.06 19.86a68.373 68.373 0 0 0-21.53-14.52C191.42 1.91 182.5.01 173.15.01s-18.26 2.37-26.37 6.5c-8.1 4.14-15.4 10.04-21.53 17.11-.57.65-1.12 1.31-1.67 1.98a4.003 4.003 0 0 1-6.26 0c-.54-.67-1.09-1.34-1.66-1.99-6.14-7.06-13.43-12.97-21.53-17.11C86.03 2.37 77.11 0 67.76 0S49.5 1.9 41.39 5.32a67.995 67.995 0 0 0-21.54 14.53A67.652 67.652 0 0 0 5.33 41.38C1.9 49.5 0 58.4 0 67.76s1.9 18.26 5.32 26.37c3.43 8.1 8.39 15.41 14.52 21.54 5.18 5.17 67.62 61.67 91.77 81.15a14.083 14.083 0 0 0 17.68 0c24.15-19.48 86.6-75.98 91.77-81.15a67.806 67.806 0 0 0 14.52-21.54c3.43-8.1 5.32-17.01 5.32-26.37s-1.9-18.26-5.32-26.37a67.68 67.68 0 0 0-14.53-21.53Z"/>
		</svg>
		<svg ico="Filters"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.5 11.5">
			<g fill="#292d32">
				<path data-name="Caminho 4290" d="M18.75 1.5h-18a.75.75 0 0 1 0-1.5h18a.75.75 0 0 1 0 1.5Z"/>
				<path data-name="Caminho 4291" d="M15.75 6.5h-12a.75.75 0 0 1 0-1.5h12a.75.75 0 0 1 0 1.5Z"/>
				<path data-name="Caminho 4292" d="M11.75 11.5h-4a.75.75 0 0 1 0-1.5h4a.75.75 0 0 1 0 1.5Z"/>
			</g>
		</svg>
		<svg ico="Grid"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.5 11.5">
			<g data-name="burguer Menu">
				<path data-name="Caminho 8756" d="M18.75 1.5h-18a.75.75 0 0 1 0-1.5h18a.75.75 0 0 1 0 1.5Z"/>
				<path data-name="Caminho 8757" d="M18.75 6.5h-18a.75.75 0 0 1 0-1.5h18a.75.75 0 0 1 0 1.5Z"/>
				<path data-name="Caminho 8758" d="M18.75 11.5h-18a.75.75 0 0 1 0-1.5h18a.75.75 0 0 1 0 1.5Z"/>
			</g>
		</svg>
		<svg ico="MasterCard"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.484 16.864">
			<g fill-rule="evenodd">
				<path data-name="Caminho 5289" d="M13.742 14.85a8.247 8.247 0 0 1-5.407 2.014A8.433 8.433 0 0 1 8.335 0a8.246 8.246 0 0 1 5.407 2.014A8.246 8.246 0 0 1 19.149 0a8.433 8.433 0 0 1 0 16.864 8.247 8.247 0 0 1-5.407-2.014Z" fill="#ed0006"/>
				<path data-name="Caminho 5290" d="M13.742 14.85a8.5 8.5 0 0 0 0-12.836A8.246 8.246 0 0 1 19.149 0a8.433 8.433 0 0 1 0 16.864 8.247 8.247 0 0 1-5.407-2.014Z" fill="#f9a000"/>
				<path data-name="Caminho 5291" d="M13.743 2.017a8.5 8.5 0 0 1 0 12.836 8.5 8.5 0 0 1 0-12.836Z" fill="#ff5e00"/>
			</g>
		</svg>
		<svg ico="MercadoPago"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.924 17.38">
			<path data-name="Caminho 93" d="M25.923 8.211c0-4.518-5.8-8.212-12.962-8.212S0 3.693 0 8.211v.495c0 4.782 5.082 8.674 12.962 8.674 7.948 0 12.962-3.892 12.962-8.674Z" fill="#060e9f"/>
			<path data-name="Caminho 94" d="M12.961 16.058c6.767 0 12.253-3.527 12.253-7.878S19.728.303 12.961.303.707 3.83.707 8.181s5.486 7.877 12.254 7.877Z" fill="#009ee2"/>
			<path data-name="Caminho 95" d="M8.913 5.752s-.134.135-.034.236a1.6 1.6 0 0 0 1.41.269 3.743 3.743 0 0 0 1.276-.808 5.876 5.876 0 0 1 1.444-.943 1.568 1.568 0 0 1 1.041-.034 3.6 3.6 0 0 1 .974.572c.839.64 4.23 3.6 4.8 4.107a30.5 30.5 0 0 1 5.4-1.751 6.748 6.748 0 0 0-2.551-4.04 7.88 7.88 0 0 1-6.647.1 6.4 6.4 0 0 0-2.518-.572 4.471 4.471 0 0 0-3.491 1.683Z" fill="#fff"/>
			<path data-name="Caminho 96" d="M19.572 9.422c-.034-.034-3.961-3.468-4.868-4.141a2.306 2.306 0 0 0-1.108-.539 1.45 1.45 0 0 0-.537.034 5.1 5.1 0 0 0-1.444.842 4.138 4.138 0 0 1-1.41.875 2.228 2.228 0 0 1-1.544-.236 1.015 1.015 0 0 1-.268-.269.483.483 0 0 1 .134-.505l1.074-1.178a3.844 3.844 0 0 0 .369-.37 4.568 4.568 0 0 0-.973.236 4.8 4.8 0 0 1-1.141.2c-.168 0-1.007-.135-1.175-.168a17.276 17.276 0 0 1-3.122-1.145A6.782 6.782 0 0 0 .706 7.232c.235.067.571.168.738.2 3.491.774 4.566 1.582 4.767 1.751a1.192 1.192 0 0 1 .873-.4 1.115 1.115 0 0 1 .94.505 1.265 1.265 0 0 1 .839-.3 1.344 1.344 0 0 1 .5.1 1.124 1.124 0 0 1 .7.64 1.07 1.07 0 0 1 .47-.1 1.183 1.183 0 0 1 .571.135 1.219 1.219 0 0 1 .671 1.38h.134a1.363 1.363 0 0 1 1.376 1.38 1.292 1.292 0 0 1-.168.64 2.593 2.593 0 0 0 1.215.334.81.81 0 0 0 .571-.236c.034-.034.067-.1.034-.135l-.974-1.111s-.168-.168-.1-.2c.067-.067.168.034.235.1a13.561 13.561 0 0 1 1.108 1.044.4.4 0 0 0 .269.135 1.125 1.125 0 0 0 .772-.168.405.405 0 0 0 .168-.168.526.526 0 0 0-.034-.64l-1.139-1.283s-.168-.168-.1-.2c.034-.067.168.034.235.1.369.3.873.808 1.376 1.313a.961.961 0 0 0 1.108-.034.831.831 0 0 0 .4-.707.91.91 0 0 0-.235-.471l-1.578-1.582s-.168-.135-.1-.2c.034-.067.168.034.235.1.5.4 1.846 1.65 1.846 1.65a1.018 1.018 0 0 0 1.074-.034.7.7 0 0 0 .338-.573.91.91 0 0 0-.269-.775Z" fill="#fff"/>
			<path data-name="Caminho 97" d="M11.989 11.396a1.951 1.951 0 0 0-.537.135c-.034 0 0-.1.033-.168s.336-1.01-.436-1.347a.857.857 0 0 0-1.074.168c-.033.034-.033.034-.067 0a.882.882 0 0 0-.6-.808 1.22 1.22 0 0 0-1.343.471.837.837 0 0 0-.839-.741.859.859 0 1 0 0 1.717.964.964 0 0 0 .6-.236v.037a1.164 1.164 0 0 0 .7 1.313.822.822 0 0 0 .839-.135c.067-.034.067-.034.067.034a.8.8 0 0 0 .6.875.816.816 0 0 0 .906-.168c.067-.067.1-.067.1.034a1.1 1.1 0 0 0 1.074 1.044 1.062 1.062 0 0 0 1.09-1.081 1.148 1.148 0 0 0-1.113-1.144Z" fill="#fff"/>
			<path data-name="Caminho 98" d="M19.777 9.019c-1.209-1.044-3.995-3.5-4.767-4.073a3.153 3.153 0 0 0-.973-.572 1.551 1.551 0 0 0-.47-.067 1.9 1.9 0 0 0-.6.1 5.166 5.166 0 0 0-1.444.909l-.033.034a4.052 4.052 0 0 1-1.242.774 1.974 1.974 0 0 1-.478.068 1.229 1.229 0 0 1-.873-.269c-.034-.034 0-.067.033-.135l1.074-1.145a4.484 4.484 0 0 1 3.424-1.683h.1a6.15 6.15 0 0 1 2.384.572 7.575 7.575 0 0 0 3.256.774 8.432 8.432 0 0 0 3.558-.842 4.916 4.916 0 0 0-.436-.337 7.75 7.75 0 0 1-3.122.707 6.7 6.7 0 0 1-3.055-.741 6.857 6.857 0 0 0-2.585-.606h-.1a4.511 4.511 0 0 0-2.954 1.044 4.814 4.814 0 0 0-1.477.269 4.051 4.051 0 0 1-1.041.2h-.4A18.725 18.725 0 0 1 3.83 2.956a4.946 4.946 0 0 0-.436.337 18.023 18.023 0 0 0 4.062 1.178c.168 0 .336.034.537.034a4.521 4.521 0 0 0 1.175-.2 4.76 4.76 0 0 1 .739-.168l-.2.2-1.074 1.178a.51.51 0 0 0-.134.606.575.575 0 0 0 .269.3 2.286 2.286 0 0 0 1.141.3 2.207 2.207 0 0 0 .47-.034 3.95 3.95 0 0 0 1.444-.875 4.127 4.127 0 0 1 1.41-.842 1.683 1.683 0 0 1 .4-.067h.1a2.1 2.1 0 0 1 1.074.505c.873.673 4.834 4.107 4.868 4.141a.736.736 0 0 1 .235.572.679.679 0 0 1-.3.505 1 1 0 0 1-.5.168 1.1 1.1 0 0 1-.47-.135s-1.376-1.246-1.846-1.65a.426.426 0 0 0-.235-.135c-.033 0-.067.034-.1.034a.232.232 0 0 0 .1.3l1.578 1.582a.615.615 0 0 1 .2.438.694.694 0 0 1-.369.64.936.936 0 0 1-.571.168.711.711 0 0 1-.436-.135l-.235-.236a15.319 15.319 0 0 0-1.141-1.077.427.427 0 0 0-.235-.135.123.123 0 0 0-.1.034c-.033.034-.067.1.034.236a.485.485 0 0 1 .067.1l1.141 1.279a.441.441 0 0 1 .034.539l-.034.067-.1.1a.885.885 0 0 1-.571.168h-.168a.8.8 0 0 1-.235-.1 13.04 13.04 0 0 0-1.108-1.044.34.34 0 0 0-.235-.135.123.123 0 0 0-.1.034c-.1.1.034.269.1.3l.973 1.077a.1.1 0 0 1-.038.084.769.769 0 0 1-.5.2h-.14a2.4 2.4 0 0 1-.974-.269 1.324 1.324 0 0 0 .134-.606 1.464 1.464 0 0 0-1.444-1.481h-.067a1.335 1.335 0 0 0-1.343-1.515 1.7 1.7 0 0 0-.436.067 1.146 1.146 0 0 0-.7-.606 1.515 1.515 0 0 0-.537-.1 1.363 1.363 0 0 0-.806.269 1.239 1.239 0 0 0-.974-.471 1.217 1.217 0 0 0-.873.37c-.3-.236-1.511-1.01-4.734-1.751-.168-.034-.5-.135-.739-.2a2.628 2.628 0 0 0-.067.539s.6.135.7.168c3.29.741 4.4 1.515 4.566 1.65a1.077 1.077 0 0 0-.1.471 1.263 1.263 0 0 0 1.242 1.246.571.571 0 0 0 .235-.034 1.449 1.449 0 0 0 .94 1.077 1.03 1.03 0 0 0 .436.1.654.654 0 0 0 .269-.034 1.248 1.248 0 0 0 .772.707 1.316 1.316 0 0 0 .47.1 1.206 1.206 0 0 0 .369-.067 1.5 1.5 0 0 0 1.343.909 1.471 1.471 0 0 0 1.041-.438 2.718 2.718 0 0 0 1.242.37h.2a1.191 1.191 0 0 0 .839-.4c.034-.034.034-.067.067-.1a1.438 1.438 0 0 0 .4.067 1.337 1.337 0 0 0 .806-.3 1.185 1.185 0 0 0 .47-.673.739.739 0 0 0 .269.034 1.444 1.444 0 0 0 .806-.269 1.242 1.242 0 0 0 .6-1.044.737.737 0 0 0 .269.034 1.3 1.3 0 0 0 .772-.236 1.169 1.169 0 0 0 .537-.875 1.061 1.061 0 0 0-.168-.707 32.122 32.122 0 0 1 5.1-1.616 2.951 2.951 0 0 0-.067-.539 28.18 28.18 0 0 0-5.458 1.78Zm-7.755 4.511a1 1 0 0 1-1.007-.943c0-.034 0-.168-.1-.168-.034 0-.067.034-.134.067a.79.79 0 0 1-.5.236 1.477 1.477 0 0 1-.336-.067.78.78 0 0 1-.571-.774.2.2 0 0 0-.034-.135l-.034-.034H9.27a.123.123 0 0 0-.1.034 1 1 0 0 1-.47.168.787.787 0 0 1-.268-.067 1.018 1.018 0 0 1-.638-1.212.124.124 0 0 0-.033-.1l-.067-.034-.034.034a.778.778 0 1 1-.539-1.343.794.794 0 0 1 .772.673l.034.2.1-.168a1.1 1.1 0 0 1 .906-.505 1.189 1.189 0 0 1 .336.067.749.749 0 0 1 .537.741c0 .1.067.1.1.1s.067-.034.1-.034a.756.756 0 0 1 .571-.236 1.157 1.157 0 0 1 .436.1c.738.3.4 1.246.4 1.246-.067.168-.067.236 0 .269h.067a.253.253 0 0 0 .134-.034 1.171 1.171 0 0 1 .4-.1 1.034 1.034 0 0 1 1.007 1.01 1.058 1.058 0 0 1-.999 1.009Z" fill="#060e9f"/>
		</svg>
		<svg ico="noimage"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 269 380">
			<g data-name="Grupo 3819">
				<path data-name="RetÃ¢ngulo 687" fill="#f4f4f4" d="M0 0h269v380H0z"/>
				<g data-name="Grupo 5201">
					<text data-name="Produto sem foto" transform="translate(65 246.434)" fill="#d1cece" font-size="17" font-family="OpenSans, Open Sans">
						<tspan x="0" y="0">Produto sem foto</tspan>
					</text>
					<g data-name="Grupo 3818" fill="#dbdbdb">
						<path data-name="Caminho 4706" d="M122.381 167.477H110.23a3.038 3.038 0 1 1 0-6.076h12.151a3.038 3.038 0 1 1 0 6.076Z"/>
						<path data-name="Caminho 4707" d="M155.752 216.081h-42.446a3.038 3.038 0 1 1 0-6.076h42.446c8.182 0 12.6-4.172 13.123-12.353l2.106-33.455a11.906 11.906 0 0 0-2.389-8.02 3.038 3.038 0 1 1 4.86-3.645 18.2 18.2 0 0 1 3.6 12.07l-2.106 33.455c-.724 11.462-7.724 18.024-19.194 18.024Z"/>
						<path data-name="Caminho 4708" d="M99.863 209.843a3.1 3.1 0 0 1-2.552-1.377 21.073 21.073 0 0 1-3.2-10.45l-2.106-33.415a17.987 17.987 0 0 1 4.9-13.609 18.3 18.3 0 0 1 13.326-5.792 3.588 3.588 0 0 0 3.16-1.984l2.916-5.792A16.5 16.5 0 0 1 129.916 129h9.276a16.483 16.483 0 0 1 13.569 8.384l2.916 5.913a3.618 3.618 0 0 0 3.159 1.9 3.038 3.038 0 1 1 0 6.076 9.744 9.744 0 0 1-8.587-5.225l-2.956-5.913a10.283 10.283 0 0 0-8.141-5.022h-9.279a10.357 10.357 0 0 0-8.182 5.063l-2.875 5.792a9.668 9.668 0 0 1-8.587 5.306 12.194 12.194 0 0 0-8.91 3.848 11.953 11.953 0 0 0-3.241 9.073l2.107 33.455a14.726 14.726 0 0 0 2.227 7.452 3.052 3.052 0 0 1-.85 4.212 3 3 0 0 1-1.7.53Z"/>
						<path data-name="Caminho 4709" d="M134.528 199.879a16.158 16.158 0 0 1-9.963-3.443 3.03 3.03 0 1 1 3.726-4.779 10.128 10.128 0 0 0 16.364-7.979 9.941 9.941 0 0 0-1.54-5.387 3.051 3.051 0 1 1 5.144-3.281 16.2 16.2 0 0 1-13.731 24.869Z"/>
						<path data-name="Caminho 4710" d="M93.994 216.079a2.992 2.992 0 0 1-2.123-5.106l80.093-79.78a3 3 0 0 1 4.246 4.228l-80.093 79.78a2.978 2.978 0 0 1-2.123.878Z"/>
					</g>
				</g>
			</g>
		</svg>
		<svg ico="Pagarme"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.865 13.159">
			<path data-name="Caminho 5299" d="M34.752 6.644h2.106c0-.086.006-.173.006-.26A6.391 6.391 0 0 0 30.488 0v2.1a4.279 4.279 0 0 1 4.272 4.28c0 .086 0 .174-.008.26" fill="#65a300"/>
			<path data-name="Caminho 5300" d="M10.5 9.838a2.7 2.7 0 0 1-.5-.163 3.374 3.374 0 0 1-.357-.191 1.754 1.754 0 0 1-.233-.167l-.069-.069.419-.62.058.059a1.725 1.725 0 0 0 .163.128 1.807 1.807 0 0 0 1.1.357A1.262 1.262 0 0 0 12 8.888a1.108 1.108 0 0 0 .283-.818v-.332a1.44 1.44 0 0 1-.047.062 1.471 1.471 0 0 1-.147.143 1.437 1.437 0 0 1-.252.183 1.565 1.565 0 0 1-.373.138 1.919 1.919 0 0 1-.5.062 1.965 1.965 0 0 1-1.4-.512 1.911 1.911 0 0 1-.546-1.466 1.95 1.95 0 0 1 .558-1.446 1.872 1.872 0 0 1 1.373-.554 1.892 1.892 0 0 1 .752.143 1.315 1.315 0 0 1 .457.284l.125.138v-.5h.839v3.515a1.759 1.759 0 0 1-2 1.977h-.009a2.7 2.7 0 0 1-.613-.067Zm-.327-4.417a1.313 1.313 0 0 0-.321.92 1.281 1.281 0 0 0 .329.911 1.139 1.139 0 0 0 .873.353 1.221 1.221 0 0 0 .908-.345 1.4 1.4 0 0 0-.008-1.839 1.22 1.22 0 0 0-.908-.353 1.124 1.124 0 0 0-.872.354ZM0 9.82V4.406h.838v.52a.716.716 0 0 1 .05-.066 1.343 1.343 0 0 1 .155-.144 1.54 1.54 0 0 1 .264-.179 1.9 1.9 0 0 1 .387-.143 1.94 1.94 0 0 1 .506-.066 1.811 1.811 0 0 1 1.369.555A2.024 2.024 0 0 1 4.1 6.345a2.048 2.048 0 0 1-.529 1.493 1.87 1.87 0 0 1-1.4.543 1.914 1.914 0 0 1-.5-.062 1.441 1.441 0 0 1-.38-.151 2.553 2.553 0 0 1-.256-.175.841.841 0 0 1-.155-.147l-.042-.058V9.82Zm1.156-4.406a1.328 1.328 0 0 0-.342.946 1.3 1.3 0 0 0 .342.954 1.229 1.229 0 0 0 .921.35 1.091 1.091 0 0 0 .861-.361 1.534 1.534 0 0 0-.012-1.885 1.117 1.117 0 0 0-.872-.369 1.175 1.175 0 0 0-.9.367Zm29.515 3a2.271 2.271 0 0 1-1.64-.555 2.01 2.01 0 0 1-.578-1.524 2 2 0 0 1 .59-1.497 2.038 2.038 0 0 1 1.49-.578 1.977 1.977 0 0 1 1.532.6 2.375 2.375 0 0 1 .554 1.666v.2h-2.933a.313.313 0 0 0 .012.078.864.864 0 0 0 .074.163.834.834 0 0 0 .159.21.865.865 0 0 0 .295.167 1.321 1.321 0 0 0 .461.073 1.451 1.451 0 0 0 .567-.112 1.339 1.339 0 0 0 .4-.229l.115-.116.637.744c-.015.02-.038.046-.066.078a1.644 1.644 0 0 1-.2.167 2.288 2.288 0 0 1-.342.213 2.254 2.254 0 0 1-.484.167 2.7 2.7 0 0 1-.627.074Zm-.512-3.1a.654.654 0 0 0-.248.171 1.189 1.189 0 0 0-.14.2.5.5 0 0 0-.062.171l-.016.069h1.683c0-.019-.01-.046-.015-.073a.846.846 0 0 0-.066-.163.83.83 0 0 0-.143-.21.814.814 0 0 0-.249-.163.89.89 0 0 0-.373-.073h-.019a.93.93 0 0 0-.353.07Zm-9.527 2.9a.693.693 0 0 1 0-.993.751.751 0 0 1 1.024 0 .694.694 0 0 1 0 .993.752.752 0 0 1-1.024 0Zm-5.12.189a1.839 1.839 0 0 1-1.946-2.008 1.993 1.993 0 0 1 .558-1.473 1.864 1.864 0 0 1 1.373-.558 1.887 1.887 0 0 1 .752.143 1.321 1.321 0 0 1 .458.283l.124.14v-.5h.837v3.91h-.838v-.535a1.01 1.01 0 0 1-.046.065 1.154 1.154 0 0 1-.147.144 1.56 1.56 0 0 1-.252.178 1.669 1.669 0 0 1-.372.144 1.833 1.833 0 0 1-.487.066Zm-.787-2.962a1.512 1.512 0 0 0 .007 1.877 1.118 1.118 0 0 0 .873.364 1.2 1.2 0 0 0 .911-.349 1.313 1.313 0 0 0 .338-.954 1.283 1.283 0 0 0-.349-.938 1.211 1.211 0 0 0-.907-.356 1.115 1.115 0 0 0-.872.357ZM6.407 8.393a1.946 1.946 0 0 1-1.4-.52 1.957 1.957 0 0 1-.547-1.489 1.992 1.992 0 0 1 .558-1.473 1.866 1.866 0 0 1 1.372-.558 1.891 1.891 0 0 1 .753.143 1.341 1.341 0 0 1 .458.283l.124.14v-.5h.838v3.91h-.838v-.535l-.046.065a1.152 1.152 0 0 1-.147.144 1.573 1.573 0 0 1-.252.178 1.683 1.683 0 0 1-.372.144 1.835 1.835 0 0 1-.487.066ZM5.62 5.431a1.516 1.516 0 0 0 .008 1.877 1.117 1.117 0 0 0 .873.364 1.207 1.207 0 0 0 .911-.349 1.311 1.311 0 0 0 .337-.954 1.282 1.282 0 0 0-.349-.938 1.21 1.21 0 0 0-.907-.356 1.115 1.115 0 0 0-.872.357Zm21.368 2.9V5.889q0-.613-.45-.613-.558 0-.558.814v2.242H24.8V5.89q0-.613-.45-.613-.558 0-.558.814v2.247h-1.178V4.347h1.179v.519l.039-.062a1.2 1.2 0 0 1 .112-.138 1.141 1.141 0 0 1 .2-.178 1.118 1.118 0 0 1 .294-.14 1.224 1.224 0 0 1 .4-.062 1.267 1.267 0 0 1 .4.058.93.93 0 0 1 .283.14 1.363 1.363 0 0 1 .175.159.678.678 0 0 1 .1.139l.023.054a.684.684 0 0 1 .043-.059 1.554 1.554 0 0 1 .128-.131 1.4 1.4 0 0 1 .217-.171 1.245 1.245 0 0 1 .31-.131 1.385 1.385 0 0 1 .4-.059q1.257 0 1.257 1.451v2.6Zm-8.66 0V4.415h.838v.706a.457.457 0 0 1 .034-.083 1.923 1.923 0 0 1 .125-.2 1.21 1.21 0 0 1 .216-.24 1.2 1.2 0 0 1 .338-.183 1.117 1.117 0 0 1 .465-.065l-.069.907a.959.959 0 0 0-.814.252 1.108 1.108 0 0 0-.294.818v2Z" fill="#1b1c29"/>
			<path data-name="Caminho 5301" d="M1.553 11.331v1.2a.585.585 0 0 1-.184.455.7.7 0 0 1-.489.168.7.7 0 0 1-.491-.165.589.589 0 0 1-.182-.458v-1.2h.312v1.205a.382.382 0 0 0 .092.276.356.356 0 0 0 .27.1q.361 0 .361-.381v-1.2Zm.8 0 .52 1.381.519-1.381h.4v1.8h-.304v-.594l.031-.794-.532 1.388h-.224l-.53-1.386.031.793v.594h-.311v-1.8Zm2.882 1.383h-.7l-.146.419H4.07l.681-1.8h.281l.683 1.8h-.327Zm-.61-.253h.528l-.261-.747Zm3.094-.133h-.736v.554h.87v.251H6.67v-1.8h1.17v.253h-.857v.5h.74Zm.847-1 .52 1.381.518-1.38h.4v1.8h-.312v-.594l.031-.794-.531 1.388h-.216l-.53-1.387.031.793v.594h-.312v-1.8Zm2.187 1.137v.67h-.313v-1.8h.69a.7.7 0 0 1 .479.157.528.528 0 0 1 .178.415.512.512 0 0 1-.174.412.732.732 0 0 1-.487.147Zm0-.251h.376a.371.371 0 0 0 .255-.079.289.289 0 0 0 .088-.227.312.312 0 0 0-.089-.233.344.344 0 0 0-.245-.09h-.385Zm2.03.226h-.349v.695h-.313v-1.8h.633a.738.738 0 0 1 .481.14.5.5 0 0 1 .17.4.509.509 0 0 1-.087.3.556.556 0 0 1-.243.187l.4.751v.016h-.322Zm-.349-.25h.323a.357.357 0 0 0 .247-.08.279.279 0 0 0 .089-.218.3.3 0 0 0-.082-.224.349.349 0 0 0-.246-.082h-.33Zm2.382.141h-.74v.554h.865v.249h-1.174v-1.8h1.17v.253h-.857v.5h.74Zm1.383.34a.218.218 0 0 0-.084-.183 1 1 0 0 0-.3-.13 1.442 1.442 0 0 1-.345-.146.462.462 0 0 1-.247-.4.439.439 0 0 1 .178-.359.719.719 0 0 1 .461-.141.779.779 0 0 1 .336.069.552.552 0 0 1 .231.2.508.508 0 0 1 .084.284h-.31a.283.283 0 0 0-.089-.221.366.366 0 0 0-.253-.08.38.38 0 0 0-.238.066.217.217 0 0 0-.085.183.2.2 0 0 0 .092.165 1.056 1.056 0 0 0 .3.129 1.388 1.388 0 0 1 .338.143.537.537 0 0 1 .187.183.477.477 0 0 1 .06.242.429.429 0 0 1-.173.358.75.75 0 0 1-.468.133.884.884 0 0 1-.36-.072.606.606 0 0 1-.255-.2.5.5 0 0 1-.091-.3h.313a.292.292 0 0 0 .1.237.444.444 0 0 0 .29.084.385.385 0 0 0 .245-.066.214.214 0 0 0 .082-.175Zm1.657.044h-.7l-.146.419h-.326l.681-1.8h.288l.682 1.8h-.327Zm-.603-.25h.522l-.261-.747Zm2.983.207a.217.217 0 0 0-.084-.183 1.007 1.007 0 0 0-.3-.13 1.471 1.471 0 0 1-.346-.146.463.463 0 0 1-.246-.4.439.439 0 0 1 .178-.359.718.718 0 0 1 .461-.141.779.779 0 0 1 .336.069.552.552 0 0 1 .231.2.509.509 0 0 1 .084.284h-.317a.283.283 0 0 0-.088-.221.366.366 0 0 0-.253-.08.381.381 0 0 0-.238.066.219.219 0 0 0-.085.183.2.2 0 0 0 .092.165 1.056 1.056 0 0 0 .3.129 1.383 1.383 0 0 1 .337.143.535.535 0 0 1 .187.183.474.474 0 0 1 .059.242.428.428 0 0 1-.172.358.749.749 0 0 1-.468.133.884.884 0 0 1-.36-.072.6.6 0 0 1-.255-.2.5.5 0 0 1-.091-.3h.313a.291.291 0 0 0 .1.237.445.445 0 0 0 .291.084.386.386 0 0 0 .245-.066.213.213 0 0 0 .082-.175Zm1.951-1.085h-.562v1.55h-.311v-1.554h-.561v-.253h1.428Zm1.7.7a1.106 1.106 0 0 1-.092.464.691.691 0 0 1-.261.308.768.768 0 0 1-.782 0 .7.7 0 0 1-.265-.3 1.076 1.076 0 0 1-.095-.457v-.1a1.1 1.1 0 0 1 .094-.465.7.7 0 0 1 .264-.309.769.769 0 0 1 .781 0 .7.7 0 0 1 .263.3 1.1 1.1 0 0 1 .094.462Zm-.313-.093a.787.787 0 0 0-.121-.468.4.4 0 0 0-.639 0 .771.771 0 0 0-.117.45v.1a.779.779 0 0 0 .115.459.372.372 0 0 0 .321.161.368.368 0 0 0 .321-.158.8.8 0 0 0 .112-.462Zm2.115.948h-.316l-.8-1.278v1.278h-.32v-1.8h.313l.806 1.283v-1.294h.31Zm1.484-.8h-.74v.554h.865v.25h-1.181v-1.8h1.169v.253h-.856v.5h.74Zm2.507.218a.651.651 0 0 1-.212.45.728.728 0 0 1-.494.161.7.7 0 0 1-.379-.1.673.673 0 0 1-.253-.29 1.044 1.044 0 0 1-.092-.438v-.168a1.053 1.053 0 0 1 .09-.449.682.682 0 0 1 .259-.3.726.726 0 0 1 .39-.1.7.7 0 0 1 .48.161.677.677 0 0 1 .211.459h-.311a.445.445 0 0 0-.113-.281.373.373 0 0 0-.267-.086.366.366 0 0 0-.314.149.745.745 0 0 0-.112.438v.16a.791.791 0 0 0 .1.446.348.348 0 0 0 .306.154.4.4 0 0 0 .276-.083.433.433 0 0 0 .118-.276Zm1.773-.281a1.1 1.1 0 0 1-.092.465.69.69 0 0 1-.26.307.765.765 0 0 1-.781 0 .7.7 0 0 1-.265-.3 1.076 1.076 0 0 1-.095-.457v-.1a1.1 1.1 0 0 1 .094-.465.7.7 0 0 1 .263-.309.77.77 0 0 1 .781 0 .692.692 0 0 1 .263.3 1.1 1.1 0 0 1 .094.462Zm-.313-.094a.788.788 0 0 0-.113-.459.4.4 0 0 0-.638 0 .774.774 0 0 0-.117.45v.1a.783.783 0 0 0 .115.459.372.372 0 0 0 .321.161.369.369 0 0 0 .321-.158.8.8 0 0 0 .112-.463Zm.693.631a.172.172 0 0 1 .13.048.165.165 0 0 1 .046.119.16.16 0 0 1-.046.117.2.2 0 0 1-.257 0 .156.156 0 0 1-.046-.118.164.164 0 0 1 .046-.119.169.169 0 0 1 .128-.047Z" fill="#454550"/>
		</svg>
		<svg ico="PagSeguro"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.983 8.69">
			<path data-name="Caminho 5302" d="M8.3 2.71a4.313 4.313 0 1 0-2.332 5.65A4.311 4.311 0 0 0 8.3 2.71"/>
			<path data-name="Caminho 5303" d="M5.862.617a4.054 4.054 0 1 0 2.185 5.3 4.041 4.041 0 0 0-2.185-5.3"/>
			<path data-name="Caminho 5304" d="M7.895 3.777a3.584 3.584 0 1 0-3.585 3.6 3.59 3.59 0 0 0 3.585-3.6" fill="#dde460"/>
			<path data-name="Caminho 5305" d="M4.312 7.469a3.734 3.734 0 1 1 3.721-3.734 3.727 3.727 0 0 1-3.721 3.734m0-7.193a3.465 3.465 0 1 0 3.453 3.481v-.022A3.461 3.461 0 0 0 4.312.27Z"/>
			<path data-name="Caminho 5306" d="M6.688 5.428a2.976 2.976 0 1 0-2.977 2.986 2.982 2.982 0 0 0 2.977-2.986Z" fill="#a7dcda"/>
			<path data-name="Caminho 5307" d="M3.719 8.547a3.121 3.121 0 1 1 .639-6.176h.007a3.123 3.123 0 0 1-.641 6.175Zm-.007-5.974a2.85 2.85 0 1 0 2.209 1.059 2.85 2.85 0 0 0-2.209-1.059"/>
			<path data-name="Caminho 5308" d="M8.158 5.554a1.846 1.846 0 1 0-1.846 1.853 1.846 1.846 0 0 0 1.846-1.853Z" fill="#f6df3f"/>
			<path data-name="Caminho 5309" d="M6.311 7.535a1.989 1.989 0 1 1 1.981-2v.008a1.985 1.985 0 0 1-1.981 1.992Zm0-3.706a1.718 1.718 0 1 0 1.711 1.725v-.007a1.711 1.711 0 0 0-1.704-1.712h-.007m5.4.736h-.652l-.265 1.258h-.744l.724-3.4h1.4a.9.9 0 0 1 .96.861 1.282 1.282 0 0 1-1.425 1.278Zm.092-1.641h-.4l-.245 1.142h.254c.5 0 .961-.113.961-.709 0-.272-.283-.434-.573-.434Zm3.705 1.991a4.806 4.806 0 0 0-.122.907h-.719c.01-.127.057-.367.1-.6a1.117 1.117 0 0 1-.984.657.736.736 0 0 1-.775-.815 1.931 1.931 0 0 1 2-1.856 3.042 3.042 0 0 1 .856.117Zm-.638-1.233a1.273 1.273 0 0 0-1.122 1.305c0 .229.081.418.345.418.357 0 .7-.491.841-1.1l.138-.591a.577.577 0 0 0-.2-.028Zm3.366 1.8c-.229 1.03-.606 1.5-1.737 1.5a2.848 2.848 0 0 1-.887-.14l.135-.507a1.531 1.531 0 0 0 .734.175.922.922 0 0 0 1-.816l.081-.336a1.03 1.03 0 0 1-.922.468.709.709 0 0 1-.78-.759 1.946 1.946 0 0 1 2.029-1.85 3.224 3.224 0 0 1 .829.112Zm-.5-1.793a1.269 1.269 0 0 0-1.131 1.315c0 .229.081.4.331.4.479 0 .744-.611.851-1.065l.148-.614a.689.689 0 0 0-.2-.033m3.489-.641a1.631 1.631 0 0 0-.7-.168c-.31 0-.775.143-.775.494 0 .494 1.346.418 1.346 1.356 0 .745-.7 1.152-1.565 1.152a3.047 3.047 0 0 1-.994-.148l.179-.552a1.727 1.727 0 0 0 .837.19c.362 0 .765-.168.765-.546 0-.535-1.335-.479-1.335-1.34 0-.81.81-1.111 1.586-1.111a2.347 2.347 0 0 1 .836.152Zm.807 1.7a.756.756 0 0 0-.035.24c0 .345.265.483.576.483a1.52 1.52 0 0 0 .784-.235l-.025.454a2.206 2.206 0 0 1-.974.2c-.555 0-1.08-.24-1.08-.867a1.741 1.741 0 0 1 1.677-1.8c.414 0 .881.148.881.616 0 .8-1.164.908-1.8.908Zm.861-1.116c-.386 0-.666.4-.795.733.459 0 1.1-.081 1.1-.483.006-.189-.132-.251-.3-.251Zm3.29 1.846c-.229 1.03-.606 1.5-1.738 1.5a2.851 2.851 0 0 1-.886-.14l.138-.505a1.533 1.533 0 0 0 .734.175.921.921 0 0 0 1-.816l.082-.336a1.03 1.03 0 0 1-.92.47.708.708 0 0 1-.779-.759 1.946 1.946 0 0 1 2.028-1.85 3.206 3.206 0 0 1 .828.109Zm-.5-1.793a1.269 1.269 0 0 0-1.131 1.315c0 .229.081.4.331.4.479 0 .744-.611.851-1.065l.148-.614a.674.674 0 0 0-.2-.033Zm3.323 1.559a5.7 5.7 0 0 0-.1.575h-.657l.07-.458a1.081 1.081 0 0 1-.912.514c-.421 0-.7-.207-.7-.631a1.418 1.418 0 0 1 .025-.291l.362-1.7h.7l-.311 1.547a1.283 1.283 0 0 0-.041.265.3.3 0 0 0 .337.337c.382 0 .561-.351.631-.678l.316-1.468h.7Zm2.3-1.372a.587.587 0 0 0-.207-.035c-.464 0-.724.449-.811.857l-.239 1.125h-.709l.421-1.987a5.6 5.6 0 0 0 .1-.566h.662l-.1.526a.989.989 0 0 1 .836-.586.7.7 0 0 1 .2.025Zm1.029 2a.971.971 0 0 1-1.087-.928 1.618 1.618 0 0 1 1.651-1.738.958.958 0 0 1 1.08.922 1.633 1.633 0 0 1-1.646 1.743Zm.444-2.191c-.526 0-.79.743-.79 1.187 0 .306.117.53.448.53.515 0 .811-.749.811-1.188 0-.307-.138-.531-.469-.531Z"/>
		</svg>
		<svg ico="PayPal"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.431 21.276">
			<path data-name="Caminho 5292" d="M2.932 14.766h-1.9a.264.264 0 0 0-.261.223L0 19.861a.158.158 0 0 0 .157.183h.907a.264.264 0 0 0 .261-.223l.207-1.314a.264.264 0 0 1 .263-.223h.6a1.952 1.952 0 0 0 2.163-1.806 1.464 1.464 0 0 0-.242-1.227 1.763 1.763 0 0 0-1.384-.485Zm.219 1.78c-.1.682-.625.682-1.129.682h-.287l.2-1.274a.158.158 0 0 1 .156-.134h.131c.343 0 .667 0 .834.2a.634.634 0 0 1 .095.526Zm5.461-.022H7.7a.159.159 0 0 0-.156.134l-.04.255-.064-.092a1.3 1.3 0 0 0-1.075-.381 2.093 2.093 0 0 0-2.032 1.83 1.718 1.718 0 0 0 .339 1.4 1.424 1.424 0 0 0 1.146.463 1.741 1.741 0 0 0 1.26-.521l-.041.253a.158.158 0 0 0 .156.183h.82a.264.264 0 0 0 .261-.223l.492-3.114a.158.158 0 0 0-.154-.187Zm-1.268 1.771a1.014 1.014 0 0 1-1.027.869.7.7 0 0 1-.754-.88 1.019 1.019 0 0 1 1.02-.876.767.767 0 0 1 .607.248.788.788 0 0 1 .154.639Zm5.2-1.771h.914a.158.158 0 0 1 .13.249l-3.041 4.39a.264.264 0 0 1-.217.113h-.913a.158.158 0 0 1-.129-.25l.947-1.337-1.007-2.956a.158.158 0 0 1 .15-.209h.9a.265.265 0 0 1 .253.188l.535 1.785 1.261-1.858a.265.265 0 0 1 .217-.115Z" fill="#253b80" fill-rule="evenodd"/>
			<path data-name="Caminho 5293" d="m22.462 19.861.78-4.962a.159.159 0 0 1 .156-.134h.878a.158.158 0 0 1 .156.183l-.77 4.873a.264.264 0 0 1-.261.223h-.784a.158.158 0 0 1-.155-.183Zm-5.973-5.1h-1.9a.264.264 0 0 0-.261.223l-.769 4.873a.158.158 0 0 0 .156.183h.975a.185.185 0 0 0 .182-.156l.218-1.381a.264.264 0 0 1 .258-.219h.6a1.952 1.952 0 0 0 2.163-1.806 1.464 1.464 0 0 0-.243-1.227 1.762 1.762 0 0 0-1.382-.485Zm.219 1.78c-.1.682-.625.682-1.129.682h-.287l.2-1.273a.158.158 0 0 1 .156-.134h.131c.343 0 .667 0 .834.2a.634.634 0 0 1 .092.529Zm5.46-.022h-.909a.158.158 0 0 0-.156.134l-.04.254-.064-.092a1.294 1.294 0 0 0-1.074-.381 2.092 2.092 0 0 0-2.031 1.83 1.719 1.719 0 0 0 .339 1.4 1.425 1.425 0 0 0 1.146.463 1.741 1.741 0 0 0 1.259-.521l-.04.253a.158.158 0 0 0 .157.183h.819a.264.264 0 0 0 .261-.223l.492-3.115a.159.159 0 0 0-.165-.181ZM20.9 18.29a1.014 1.014 0 0 1-1.027.869.7.7 0 0 1-.754-.885 1.019 1.019 0 0 1 1.02-.876.768.768 0 0 1 .607.248.784.784 0 0 1 .151.649Z" fill="#179bd7" fill-rule="evenodd"/>
			<path data-name="Caminho 5294" d="m9.965 13.023.234-1.484-.52-.012H7.193L8.917.578a.144.144 0 0 1 .048-.086.141.141 0 0 1 .092-.034h4.19a3.729 3.729 0 0 1 2.852.861 1.963 1.963 0 0 1 .457.856 3.093 3.093 0 0 1 0 1.181l-.005.034v.3l.235.133a1.648 1.648 0 0 1 .476.363 1.688 1.688 0 0 1 .386.866 3.665 3.665 0 0 1-.055 1.256 4.427 4.427 0 0 1-.515 1.422 2.927 2.927 0 0 1-.815.893 3.308 3.308 0 0 1-1.1.5 5.479 5.479 0 0 1-1.372.159h-.326a.981.981 0 0 0-.97.828l-.025.134-.413 2.615-.019.1a.083.083 0 0 1-.026.056.07.07 0 0 1-.043.016Z" fill="#253b80"/>
			<path data-name="Caminho 5295" d="M17.014 3.424c-.012.08-.027.162-.043.246-.553 2.837-2.443 3.817-4.857 3.817h-1.229a.6.6 0 0 0-.59.506l-.629 3.992-.179 1.126a.315.315 0 0 0 .31.364h2.18a.525.525 0 0 0 .518-.442l.021-.111.411-2.605.03-.139a.524.524 0 0 1 .518-.443h.326c2.112 0 3.766-.858 4.249-3.339a2.843 2.843 0 0 0-.437-2.511 2.083 2.083 0 0 0-.599-.461Z" fill="#179bd7"/>
			<path data-name="Caminho 5296" d="M16.44 3.195a3.978 3.978 0 0 0-.537-.119 6.824 6.824 0 0 0-1.084-.079h-3.288a.524.524 0 0 0-.518.443l-.7 4.425-.02.129a.6.6 0 0 1 .59-.506h1.229c2.414 0 4.3-.981 4.857-3.817.016-.084.03-.166.043-.246a2.953 2.953 0 0 0-.454-.192Z" fill="#222d65"/>
			<path data-name="Caminho 5297" d="M11.013 3.439a.524.524 0 0 1 .518-.443h3.288a6.83 6.83 0 0 1 1.084.079q.142.023.277.052t.261.067l.124.038a2.986 2.986 0 0 1 .454.192 2.679 2.679 0 0 0-.568-2.409 4.163 4.163 0 0 0-3.2-1.016h-4.19a.6.6 0 0 0-.592.506l-1.75 11.064a.36.36 0 0 0 .355.416h2.587l.658-4.121Z" fill="#253b80"/>
		</svg>
		<svg ico="Pix"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.773 12.679">
			<g data-name="Grupo 90">
				<path data-name="Caminho 115" d="M14.719 12.062a.224.224 0 0 0 .224-.224V4.567a2.2 2.2 0 0 1 2.2-2.2h2.146a2.2 2.2 0 0 1 2.191 2.2v1.548a2.2 2.2 0 0 1-2.2 2.2h-3.033a.224.224 0 0 0 0 .448h3.034a2.646 2.646 0 0 0 2.646-2.646v-1.55a2.643 2.643 0 0 0-2.637-2.643h-2.147a2.646 2.646 0 0 0-2.646 2.643v7.271a.224.224 0 0 0 .224.224Zm9.509-3.269a.224.224 0 0 0 .224-.224V3.138a1.218 1.218 0 0 0-1.218-1.218h-.931a.224.224 0 1 0 0 .448h.931a.77.77 0 0 1 .77.77V8.57a.224.224 0 0 0 .224.223Z" fill="#939598" fill-rule="evenodd"/>
				<path data-name="Caminho 116" d="m24.029 1.3-.422-.422a.268.268 0 0 1 0-.379l.422-.422a.269.269 0 0 1 .38 0l.422.422a.268.268 0 0 1 0 .379l-.422.422a.268.268 0 0 1-.38 0Z" fill="#32bcad"/>
				<path data-name="Caminho 117" d="M31.22 4.666a.492.492 0 0 1-.7 0l-2.16-2.16a2.015 2.015 0 0 0-1.425-.59h-.923a.224.224 0 1 0 0 .448h.923a1.567 1.567 0 0 1 1.108.459l2.16 2.16a.94.94 0 0 0 1.33 0l2.161-2.153a1.567 1.567 0 0 1 1.1-.459h.751a.224.224 0 0 0 0-.448h-.751a2.016 2.016 0 0 0-1.425.59l-2.152 2.152Z" fill="#939598" fill-rule="evenodd"/>
				<path data-name="Caminho 118" d="M25.794 8.523a.224.224 0 0 0 .224.224h.923a2.015 2.015 0 0 0 1.425-.59l2.16-2.16a.493.493 0 0 1 .7 0l2.152 2.152a2.015 2.015 0 0 0 1.425.59h.751a.224.224 0 0 0 0-.448h-.76a1.568 1.568 0 0 1-1.108-.459L31.534 5.68a.94.94 0 0 0-1.33 0l-2.16 2.16a1.568 1.568 0 0 1-1.108.459h-.923a.224.224 0 0 0-.224.224Z" fill="#939598" fill-rule="evenodd"/>
				<path data-name="Caminho 119" d="M9.214 9.902a1.724 1.724 0 0 1-1.227-.508L6.215 7.622a.337.337 0 0 0-.466 0L3.97 9.4a1.725 1.725 0 0 1-1.227.508h-.349l2.244 2.244a1.8 1.8 0 0 0 2.538 0l2.251-2.251ZM2.743 3.634a1.725 1.725 0 0 1 1.227.508l1.781 1.779a.33.33 0 0 0 .466 0l1.769-1.775a1.725 1.725 0 0 1 1.227-.508h.213L7.175 1.387a1.8 1.8 0 0 0-2.538 0L2.394 3.634Z" fill="#32bcad"/>
				<path data-name="Caminho 120" d="m11.289 5.502-1.36-1.36a.26.26 0 0 1-.1.019h-.618a1.222 1.222 0 0 0-.859.356L6.58 6.289a.851.851 0 0 1-1.2 0L3.6 4.511a1.222 1.222 0 0 0-.859-.356h-.76a.257.257 0 0 1-.091-.018L.526 5.502a1.8 1.8 0 0 0 0 2.538l1.365 1.365a.259.259 0 0 1 .091-.018h.76a1.222 1.222 0 0 0 .859-.356l1.778-1.779a.871.871 0 0 1 1.2 0l1.772 1.772a1.222 1.222 0 0 0 .859.356h.618a.26.26 0 0 1 .1.019l1.36-1.36a1.8 1.8 0 0 0 0-2.538Z" fill="#32bcad"/>
				<path data-name="Caminho 121" d="M16.566 11.221a1.572 1.572 0 0 0-.333.051v.443a.769.769 0 0 0 .259.043c.222 0 .328-.075.328-.271s-.086-.266-.254-.266Zm-.408.823v-.876h.061l.006.038a1.747 1.747 0 0 1 .347-.056.345.345 0 0 1 .227.066.335.335 0 0 1 .1.272.3.3 0 0 1-.142.282.55.55 0 0 1-.258.057.929.929 0 0 1-.267-.041v.258h-.075Zm1.3-.826c-.222 0-.321.07-.321.265s.1.274.321.274.32-.069.32-.264-.098-.272-.32-.272Zm.286.54a.482.482 0 0 1-.286.068.488.488 0 0 1-.287-.068.307.307 0 0 1-.114-.269.312.312 0 0 1 .114-.271.633.633 0 0 1 .573 0 .376.376 0 0 1 0 .54m1.052.051-.248-.532h-.005l-.244.532h-.067l-.264-.641h.082l.22.538h.005l.239-.538h.069l.245.538h.005l.215-.538h.08l-.264.641Zm.81-.592c-.206 0-.276.091-.288.224h.576c-.006-.147-.081-.22-.288-.22Zm0 .61a.386.386 0 0 1-.267-.071.389.389 0 0 1 .019-.541.429.429 0 0 1 .25-.065.45.45 0 0 1 .257.062.325.325 0 0 1 .111.3h-.658c0 .132.046.249.295.249a1.918 1.918 0 0 0 .332-.037v.067a1.961 1.961 0 0 1-.338.039Zm.585-.018v-.641h.061l.006.038a1.129 1.129 0 0 1 .319-.056h.009v.071h-.018a1.048 1.048 0 0 0-.3.051v.537Zm.83-.592c-.206 0-.276.091-.288.224h.577c-.01-.147-.085-.22-.292-.22Zm0 .61a.386.386 0 0 1-.267-.071.388.388 0 0 1 .019-.541.429.429 0 0 1 .25-.065.45.45 0 0 1 .257.062.325.325 0 0 1 .111.3h-.658c0 .132.046.249.295.249a1.918 1.918 0 0 0 .332-.037v.067a1.961 1.961 0 0 1-.338.039Zm1.19-.565a.768.768 0 0 0-.259-.043c-.222 0-.328.075-.328.271s.086.267.254.267a1.654 1.654 0 0 0 .333-.05v-.446Zm.014.547-.006-.038a1.746 1.746 0 0 1-.347.056.293.293 0 0 1-.328-.338.3.3 0 0 1 .142-.281.537.537 0 0 1 .259-.058.968.968 0 0 1 .265.041v-.293h.075v.912h-.061Zm1.16-.588a1.571 1.571 0 0 0-.333.051v.442a.745.745 0 0 0 .259.045c.222 0 .328-.075.328-.271s-.086-.267-.254-.267Zm.192.549a.549.549 0 0 1-.258.057.912.912 0 0 1-.287-.048v.031h-.051v-.912h.075v.306a1.811 1.811 0 0 1 .339-.053.345.345 0 0 1 .227.066.335.335 0 0 1 .1.272.305.305 0 0 1-.142.282Zm.242.286v-.07c.037 0 .071.006.1.006a.194.194 0 0 0 .2-.132l.024-.051-.335-.641h.086l.287.554.273-.554h.085l-.361.72a.261.261 0 0 1-.268.174.783.783 0 0 1-.093-.006Zm1.754-.612h-.249v.225h.25c.171 0 .236-.019.236-.113s-.095-.114-.243-.114Zm-.046-.365h-.2v.229h.2c.169 0 .236-.02.236-.116s-.09-.114-.242-.114Zm.386.669a.738.738 0 0 1-.4.061h-.38v-.87h.361a.706.706 0 0 1 .369.056.184.184 0 0 1 .089.173.19.19 0 0 1-.137.193.2.2 0 0 1 .184.206.188.188 0 0 1-.092.18Zm.852-.208a2.87 2.87 0 0 0-.231-.01c-.131 0-.177.027-.177.086s.038.086.138.086a1.311 1.311 0 0 0 .269-.038v-.124Zm.038.269-.005-.038a1.549 1.549 0 0 1-.348.056.333.333 0 0 1-.194-.047.2.2 0 0 1 .037-.329.588.588 0 0 1 .24-.034c.067 0 .157 0 .232.009v-.011c0-.1-.066-.133-.246-.133-.07 0-.155 0-.236.011v-.13c.09-.008.192-.013.276-.013a.542.542 0 0 1 .3.06.237.237 0 0 1 .088.22v.38h-.153Zm.978 0v-.354c0-.117-.06-.159-.166-.159a1.212 1.212 0 0 0-.262.041v.472h-.179v-.641h.146l.006.041a1.487 1.487 0 0 1 .343-.058.316.316 0 0 1 .22.066.249.249 0 0 1 .07.2v.392h-.178Zm.684.018a.363.363 0 0 1-.239-.067.331.331 0 0 1-.1-.272.312.312 0 0 1 .131-.274.507.507 0 0 1 .282-.064c.074 0 .146.005.226.013v.137a2.385 2.385 0 0 0-.2-.011c-.17 0-.25.053-.25.2s.06.2.2.2a1.509 1.509 0 0 0 .269-.033v.132a1.611 1.611 0 0 1-.312.041Zm.841-.542c-.17 0-.245.053-.245.2s.074.208.245.208.243-.052.243-.2-.078-.209-.248-.209Zm.307.475a.54.54 0 0 1-.307.067.547.547 0 0 1-.312-.068.365.365 0 0 1 0-.542.739.739 0 0 1 .616 0 .3.3 0 0 1 .119.27.3.3 0 0 1-.119.272m1.153.067a.483.483 0 0 1-.312-.09.448.448 0 0 1-.136-.363.426.426 0 0 1 .176-.369.667.667 0 0 1 .368-.082c.1 0 .2.006.3.015v.156a3.764 3.764 0 0 0-.3-.014c-.248 0-.353.094-.353.295s.1.3.281.3a1.994 1.994 0 0 0 .387-.052v.155a2.159 2.159 0 0 1-.419.055Zm.945-.562c-.149 0-.206.053-.217.151h.432c-.005-.1-.066-.151-.215-.151Zm-.027.563a.415.415 0 0 1-.272-.071.33.33 0 0 1-.1-.268.325.325 0 0 1 .121-.27.476.476 0 0 1 .281-.067.5.5 0 0 1 .278.065c.1.072.112.184.113.316h-.61c0 .1.056.161.236.161a2.3 2.3 0 0 0 .342-.033v.126a2.425 2.425 0 0 1-.39.035Zm1.214-.018v-.354c0-.117-.06-.159-.166-.159a1.212 1.212 0 0 0-.262.041v.472h-.179v-.641h.146l.006.041a1.487 1.487 0 0 1 .343-.058.316.316 0 0 1 .22.066.249.249 0 0 1 .07.2v.392h-.179Zm.687.018a.233.233 0 0 1-.208-.091.333.333 0 0 1-.047-.194v-.24h-.133v-.133h.13l.019-.194h.159v.194h.253v.133h-.251v.206a.3.3 0 0 0 .018.122.114.114 0 0 0 .117.06.813.813 0 0 0 .128-.013v.128a1.009 1.009 0 0 1-.185.023Zm.35-.018v-.641h.146l.006.041a1.116 1.116 0 0 1 .317-.058h.023v.152h-.062a1 1 0 0 0-.251.033v.474Zm1.144-.269a2.87 2.87 0 0 0-.231-.01c-.131 0-.177.027-.177.086s.038.086.138.086a1.313 1.313 0 0 0 .269-.038v-.124Zm.038.269v-.038a1.551 1.551 0 0 1-.348.056.332.332 0 0 1-.194-.047.2.2 0 0 1 .037-.329.588.588 0 0 1 .24-.034c.067 0 .157 0 .232.009v-.011c0-.1-.066-.133-.246-.133-.07 0-.155 0-.236.011v-.13c.09-.008.192-.013.276-.013a.543.543 0 0 1 .3.06.237.237 0 0 1 .088.22v.38h-.141Zm.371-.912h.179v.912h-.18Z" fill="#939598"/>
			</g>
		</svg>
		<svg ico="Play" data-name="Grupo 5201"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.948 98.948">
			<rect data-name="RetÃ¢ngulo 764" width="98.948" height="98.948" rx="5" fill="#e7e7e7"/>
			<path data-name="PolÃ­gono 1" d="M70.889 48.02a2 2 0 0 1-.06 3.465L39.24 69.001a2 2 0 0 1-2.972-1.783l.614-36.096a2 2 0 0 1 3.03-1.68Z" fill="#f7f7f7"/>
		</svg>
		<svg ico="Search"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 237.76 240.91">
			<path d="m233.21 214.29-38.63-38.63c14.43-18.45 23.02-41.68 23.02-66.87C217.6 48.81 168.79 0 108.79 0S0 48.81 0 108.79 48.81 217.6 108.79 217.6c23.59 0 45.43-7.54 63.28-20.34l39.07 39.07c3.05 3.05 7.03 4.57 11.03 4.57s7.99-1.52 11.03-4.57c6.08-6.1 6.08-15.97 0-22.05ZM22.35 108.79c0-47.67 38.77-86.44 86.44-86.44s86.46 38.77 86.46 86.44-38.79 86.46-86.46 86.46-86.44-38.79-86.44-86.46Z"/>
		</svg>
		<svg ico="Share"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.91 240.91">
			<path d="M204.77 168.64c-8.43 0-16.86 3.61-22.89 8.43l-65.05-37.34c2.41-6.02 3.61-12.05 3.61-19.27s-1.2-13.25-3.61-19.27l65.05-37.34c6.02 4.82 14.45 8.43 22.89 8.43 20.48 0 36.14-15.66 36.14-36.14S225.25 0 204.77 0c-21.68 0-39.75 20.48-34.93 43.36L104.79 80.7c-10.84-12.05-26.5-20.48-44.57-20.48C26.5 60.23 0 86.73 0 120.45s26.5 60.22 60.22 60.22c18.07 0 33.73-8.43 44.57-20.48l63.84 37.34c-3.61 22.89 14.45 43.36 36.14 43.36 20.48 0 36.14-15.66 36.14-36.14s-15.66-36.14-36.14-36.14Z"/>
		</svg>
		<svg ico="Telephone"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 241.16 240.91">
			<path d="M188.35 147.53c-3.29-3.29-8.58-3.29-11.83 0L159.9 164.1c-4.74 4.74-12.07 7.08-18.26 4.44-35.43-15.27-54.59-34.33-69.26-69.16-2.59-6.14-.2-13.37 4.49-18.06l16.67-16.67c3.29-3.29 3.29-8.58 0-11.83L43.25 2.43c-3.24-3.24-8.58-3.24-11.83 0L12.27 21.59C.79 33.07-2.95 50.18 2.39 65.5c29.54 84.48 87.22 142.1 173.09 172.89 15.42 5.54 32.68 1.8 44.26-9.73l18.96-18.96c3.29-3.29 3.29-8.58 0-11.83l-50.34-50.35Z"/>
		</svg>
		<svg ico="User"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.91 238.52">
			<path d="M120.45 0C53.67 0 0 53.66 0 119.26s53.66 119.26 120.45 119.26S240.9 184.86 240.9 119.26 187.24 0 120.45 0Zm73.94 180.08c-11.93-28.62-40.55-48.9-73.94-48.9s-62.02 20.27-73.94 48.9c-14.31-15.51-22.66-36.97-22.66-60.83 0-52.48 42.93-95.41 96.6-95.41s96.6 42.93 96.6 95.41c0 23.85-8.35 44.13-22.66 60.83Z"/>
			<path d="M156.23 83.48c0 19.76-16.02 35.78-35.78 35.78s-35.78-16.02-35.78-35.78 16.02-35.78 35.78-35.78 35.78 16.02 35.78 35.78"/>
		</svg>
		<svg ico="Visa"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.928 9.551">
			<path data-name="Caminho 5298" d="M7.482 9.477h-2.59L2.95 2.067a1.2 1.2 0 0 0-.576-.784A8.432 8.432 0 0 0 0 .5V.215h4.172a1.087 1.087 0 0 1 1.08.926L6.26 6.486 8.849.215h2.518Zm5.324 0H10.36L12.374.214h2.446Zm5.179-6.7A.948.948 0 0 1 18.993 2a4.558 4.558 0 0 1 2.374.427l.432-1.994A6.192 6.192 0 0 0 19.569 0c-2.374 0-4.1 1.283-4.1 3.064 0 1.355 1.224 2.066 2.087 2.495.934.427 1.294.713 1.222 1.14 0 .641-.72.926-1.438.926a6.168 6.168 0 0 1-2.518-.571l-.432 2a7.058 7.058 0 0 0 2.662.5c2.662.07 4.316-1.212 4.316-3.136 0-2.423-3.382-2.565-3.382-3.633Zm11.942 6.7L27.985.214H25.9a1.082 1.082 0 0 0-1.008.713l-3.6 8.551h2.518l.5-1.354h3.094l.288 1.354Zm-3.669-6.769.719 3.491h-2.014Z" fill="#172b85" fill-rule="evenodd"/>
		</svg>
		<svg ico="Watch"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.75 240.91">
			<path d="M216.96 120.73c0-53.02-43.38-96.4-96.4-96.4s-96.4 43.38-96.4 96.4c0 34.94 18.08 65.07 45.79 81.94l-18.08 18.08c-4.82 4.82-4.82 12.05 0 16.87 2.41 2.41 9.64 6.03 16.87 0l24.1-24.1c9.64 2.41 18.08 3.62 27.71 3.62s18.08-1.2 27.71-3.62l24.1 24.1c8.43 6.03 14.46 2.41 16.87 0 4.82-4.82 4.82-12.05 0-16.87l-18.08-18.08c27.71-16.87 45.79-46.99 45.79-81.94Zm-60.25 12.05h-36.15c-7.23 0-12.05-4.82-12.05-12.05V60.48c0-7.23 4.82-12.05 12.05-12.05s12.05 4.82 12.05 12.05v48.2h24.1c7.23 0 12.05 4.82 12.05 12.05s-4.82 12.05-12.05 12.05ZM238.65 41.2C212.14 6.25 184.43.23 183.22.23c-6.03-1.2-13.25 2.41-14.46 9.64-1.2 6.03 2.41 13.25 9.64 14.46 1.2 0 20.48 4.82 40.97 31.33 2.41 3.62 9.64 7.23 16.87 2.41 4.82-3.61 6.03-12.05 2.41-16.87ZM62.72 24.33c6.02-1.21 10.84-7.23 9.64-14.46C71.16 3.85 65.13-.97 57.9.23 56.7.23 28.98 6.25 2.47 41.2c-3.62 4.82-3.62 13.25 2.41 16.87 7.23 4.82 14.46 1.2 16.87-2.41 20.48-26.51 39.76-31.33 40.97-31.33Z"/>
		</svg>
    <svg ico="Whatsapp" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <g id="Grupo_3127" data-name="Grupo 3127" transform="translate(6503 -590)">
    <path id="whatsapp_1_" data-name="whatsapp (1)" d="M75.249,12.819a43.721,43.721,0,0,0-68.8,52.742L.25,88.212l23.172-6.079a43.665,43.665,0,0,0,20.888,5.32h.018a43.73,43.73,0,0,0,30.92-74.634ZM44.328,80.072h-.015a36.286,36.286,0,0,1-18.491-5.064L24.5,74.22,10.745,77.827l3.67-13.407-.864-1.375A36.331,36.331,0,1,1,44.328,80.072Zm19.928-27.21c-1.092-.547-6.462-3.188-7.463-3.553s-1.729-.546-2.457.547-2.821,3.553-3.459,4.282-1.274.821-2.366.274a29.832,29.832,0,0,1-8.783-5.421,32.945,32.945,0,0,1-6.076-7.566c-.636-1.094-.005-1.628.479-2.229a30.9,30.9,0,0,0,2.73-3.736,2.009,2.009,0,0,0-.092-1.913C36.5,33,34.314,27.623,33.4,25.435c-.887-2.129-1.787-1.841-2.458-1.875-.636-.032-1.365-.038-2.093-.038a4.012,4.012,0,0,0-2.913,1.367A12.25,12.25,0,0,0,22.118,34c0,5.376,3.914,10.569,4.46,11.3s7.7,11.761,18.658,16.491a62.517,62.517,0,0,0,6.227,2.3,14.973,14.973,0,0,0,6.879.433c2.1-.314,6.461-2.642,7.372-5.193s.91-4.738.636-5.194S65.349,53.408,64.257,52.861Zm0,0" transform="translate(-6487.229 606.049)" fill-rule="evenodd"/>
    <rect id="RetÃ¢ngulo_3140" data-name="RetÃ¢ngulo 3140" width="120" height="120" transform="translate(-6503 590)" fill="none"/>
  </g>
</svg>
		<svg ico="Facebook" xmlns="http://www.w3.org/2000/svg" width="53.751" height="99.9" viewBox="0 0 53.751 99.9">
		  <path id="Icon" d="M55.873,67.438H43.511c-2,0-2.611-.768-2.611-2.611V49.7c0-2,.768-2.764,2.611-2.764H55.873V35.956a27.835,27.835,0,0,1,3.379-14.129,20.818,20.818,0,0,1,11.134-9.214A26.987,26.987,0,0,1,79.908,11H92.117c1.766,0,2.534.768,2.534,2.534V27.74c0,1.766-.768,2.534-2.534,2.534-3.379,0-6.757,0-10.136.154s-5.145,1.613-5.145,5.145c-.154,3.763,0,7.372,0,11.211H91.2c2,0,2.764.768,2.764,2.764V64.674c0,2-.614,2.764-2.764,2.764H76.99v40.62c0,2.15-.768,2.841-2.841,2.841H58.561c-1.843,0-2.611-.768-2.611-2.611Z" transform="translate(-40.9 -11)"/>
		</svg>
		<svg ico="Instagram" xmlns="http://www.w3.org/2000/svg" width="99.771" height="99.79" viewBox="0 0 99.771 99.79">
		  <g id="instagram" transform="translate(-0.449)" style="isolation: isolate">
			<path id="Caminho_9943" data-name="Caminho 9943" d="M99.967,29.339a36.463,36.463,0,0,0-2.319-12.106,25.563,25.563,0,0,0-14.6-14.6A36.557,36.557,0,0,0,70.94.312C65.6.059,63.9,0,50.354,0S35.11.059,29.788.292A36.474,36.474,0,0,0,17.682,2.612,24.348,24.348,0,0,0,8.832,8.382a24.569,24.569,0,0,0-5.751,8.831A36.561,36.561,0,0,0,.761,29.319C.508,34.661.449,36.356.449,49.9S.508,65.149.742,70.471a36.461,36.461,0,0,0,2.32,12.106,25.558,25.558,0,0,0,14.6,14.6A36.562,36.562,0,0,0,29.769,99.5c5.321.235,7.018.292,20.566.292S65.579,99.732,70.9,99.5a36.454,36.454,0,0,0,12.105-2.319,25.524,25.524,0,0,0,14.6-14.6,36.586,36.586,0,0,0,2.319-12.106c.234-5.322.292-7.018.292-20.566S100.2,34.661,99.967,29.339ZM90.98,70.081a27.352,27.352,0,0,1-1.716,9.26,16.553,16.553,0,0,1-9.474,9.474,27.448,27.448,0,0,1-9.26,1.715c-5.263.235-6.842.292-20.157.292s-14.913-.058-20.157-.292a27.337,27.337,0,0,1-9.26-1.715,15.355,15.355,0,0,1-5.731-3.724A15.514,15.514,0,0,1,11.5,79.361,27.453,27.453,0,0,1,9.787,70.1c-.235-5.263-.292-6.843-.292-20.157s.058-14.913.292-20.157a27.338,27.338,0,0,1,1.715-9.26A15.167,15.167,0,0,1,15.246,14.8a15.491,15.491,0,0,1,5.731-3.723,27.467,27.467,0,0,1,9.26-1.716c5.263-.234,6.843-.292,20.157-.292,13.334,0,14.913.059,20.157.292a27.352,27.352,0,0,1,9.26,1.716A15.344,15.344,0,0,1,85.541,14.8a15.511,15.511,0,0,1,3.724,5.732,27.463,27.463,0,0,1,1.716,9.26c.234,5.263.292,6.842.292,20.157S91.214,64.818,90.98,70.081Zm0,0" transform="translate(0 0)"/>
			<path id="Caminho_9944" data-name="Caminho 9944" d="M150.584,124.5a25.635,25.635,0,1,0,25.635,25.635A25.641,25.641,0,0,0,150.584,124.5Zm0,42.263a16.629,16.629,0,1,1,16.629-16.629A16.631,16.631,0,0,1,150.584,166.763Zm0,0" transform="translate(-100.23 -100.23)"/>
			<path id="Caminho_9945" data-name="Caminho 9945" d="M374.419,94.586a5.985,5.985,0,1,1-5.985-5.985A5.985,5.985,0,0,1,374.419,94.586Zm0,0" transform="translate(-291.431 -71.329)"/>
		  </g>
		</svg>
		<svg ico="Youtube" xmlns="http://www.w3.org/2000/svg" width="100.152" height="70.123" viewBox="0 0 100.152 70.123">
		  <path id="youtube" d="M98.089,4.891a12.547,12.547,0,0,0-8.827-8.828C81.425-6.082,50.075-6.082,50.075-6.082s-31.348,0-39.186,2.063A12.8,12.8,0,0,0,2.062,4.891C0,12.727,0,28.979,0,28.979S0,45.313,2.062,53.068A12.549,12.549,0,0,0,10.89,61.9c7.919,2.145,39.186,2.145,39.186,2.145s31.348,0,39.186-2.063a12.548,12.548,0,0,0,8.828-8.827c2.062-7.837,2.062-24.089,2.062-24.089S100.235,12.727,98.089,4.891Zm-57.995,39.1V13.965L66.163,28.979Zm0,0" transform="translate(0 6.082)"/>
		</svg>
    <svg ico="Linkedin" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <g id="Grupo_3126" data-name="Grupo 3126" transform="translate(7734 -590)">
        <rect id="RetÃ¢ngulo_3136" data-name="RetÃ¢ngulo 3136" width="120" height="120" transform="translate(-7734 590)" fill="none"/>
        <path id="icons8-linkedin_1_" data-name="icons8-linkedin (1)" d="M86.314,4H15.123A11.128,11.128,0,0,0,4,15.123v71.19A11.128,11.128,0,0,0,15.123,97.437h71.19A11.128,11.128,0,0,0,97.437,86.314V15.123A11.128,11.128,0,0,0,86.314,4ZM32.921,39.6V81.864H19.573V39.6Zm-13.348-12.3c0-3.115,2.67-5.495,6.674-5.495s6.518,2.38,6.674,5.495c0,3.115-2.492,5.628-6.674,5.628C22.242,32.921,19.573,30.407,19.573,27.293ZM81.864,81.864H68.516V59.617c0-4.449-2.225-8.9-7.786-8.988h-.178c-5.384,0-7.608,4.583-7.608,8.988V81.864H39.6V39.6H52.943v5.7a16.664,16.664,0,0,1,12.925-5.7c8.832,0,16,6.073,16,18.376Z" transform="translate(-7725 599)"/>
      </g>
    </svg>
		<svg ico="Tiktok" xmlns="http://www.w3.org/2000/svg" width="87.674" height="100" viewBox="0 0 87.674 100">
		  <path id="tiktok" d="M192.874,109.32a31.733,31.733,0,0,1-16.453-5.7c-6.57-4.8-8.837-15.233-9.186-19.1V84H151.246v68.983a15.029,15.029,0,1,1-15.029-15.029h5.058V121.965h-5.058a31.017,31.017,0,1,0,31.017,31.017V116.7a47.082,47.082,0,0,0,25.61,8.6V109.32Z" transform="translate(-105.2 -84)"/>
		</svg>
    <svg ico="Twitter" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <g id="Grupo_3122" data-name="Grupo 3122" transform="translate(7036 -793)">
        <rect id="RetÃ¢ngulo_3138" data-name="RetÃ¢ngulo 3138" width="120" height="120" transform="translate(-7036 793)" fill="none"/>
        <path id="twitter" d="M68.518,40.234,103.131,0h-8.2L64.875,34.935,40.871,0H13.185l36.3,52.828-36.3,42.192h8.2L53.125,58.127l25.35,36.892h27.686L68.516,40.234ZM57.284,53.293l-3.678-5.26L24.343,6.175h12.6L60.557,39.955l3.678,5.26,30.7,43.91h-12.6L57.284,53.3Z" transform="translate(-7035.37 805.877)"/>
      </g>
    </svg>
		<svg ico="Pinterest" xmlns="http://www.w3.org/2000/svg" width="81.247" height="100" viewBox="0 0 81.247 100">
		  <path id="pinterest" d="M44.234,0C16.821,0,2.25,17.567,2.25,36.717c0,8.879,4.963,19.959,12.909,23.471,2.267,1.021,1.967-.225,3.917-7.683a1.77,1.77,0,0,0-.425-1.738C7.292,37.63,16.434,10.621,42.613,10.621c37.888,0,30.809,52.426,6.592,52.426-6.242,0-10.892-4.9-9.421-10.963C41.567,44.863,45.059,37.1,45.059,31.9c0-13.117-19.542-11.171-19.542,6.208a21.025,21.025,0,0,0,1.9,9s-6.288,25.4-7.454,30.146c-1.975,8.033.267,21.038.463,22.159a.659.659,0,0,0,1.2.3c.621-.813,8.221-11.654,10.35-19.492.775-2.854,3.954-14.438,3.954-14.438,2.1,3.783,8.138,6.95,14.575,6.95C69.655,72.73,83.5,55.9,83.5,35.009,83.431,14.984,66.293,0,44.234,0Z" transform="translate(-2.25)"/>
		</svg>
		<svg ico="star"
			xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.44 33.53">
			<defs>
				<linearGradient id="half-star-ws-review">
					<stop offset="50%" class="alt-main"></stop>
					<stop offset="50%" class="alt-last"></stop>
				</linearGradient>
			</defs>
			<path d="M16.5,.71c.39-.68,1.25-.91,1.92-.53,.22,.12,.4,.31,.53,.53l4.81,8.46c.2,.35,.55,.6,.94,.68l9.61,1.92c.75,.14,1.24,.87,1.1,1.62-.05,.25-.17,.49-.34,.68l-6.64,7.15c-.28,.3-.41,.7-.36,1.1l1.13,9.65c.08,.77-.49,1.46-1.26,1.54-.24,.02-.49-.02-.72-.12l-8.92-4.04c-.37-.17-.8-.17-1.17,0l-8.92,4.05c-.71,.31-1.54,0-1.86-.72-.1-.22-.14-.46-.11-.71l1.13-9.65c.05-.4-.08-.8-.36-1.1L.37,14.08c-.52-.56-.49-1.44,.08-1.96,.19-.18,.43-.29,.68-.34l9.61-1.92c.4-.08,.74-.33,.94-.68L16.5,.71Z"/>
		</svg>
		<svg ico="File" version="1.1" id="Capa_1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink" 
			 viewBox="0 0 458 458" xml:space="preserve">
			<g>
				<path d="M449.23,198.839L390,159.352V15c0-8.284-6.716-15-15-15H83c-8.284,0-15,6.716-15,15v144.352L8.77,198.839
				c-4.173,2.782-6.68,7.466-6.68,12.481V443c0,8.284,6.716,15,15,15h423.82c8.284,0,15-6.716,15-15V211.32
				C455.91,206.305,453.403,201.621,449.23,198.839z M172.822,327.16L32.09,420.982V233.338L172.822,327.16z M264.122,337.16
				L400.382,428H57.617l136.26-90.84H264.122z M285.177,327.16l140.733-93.822v187.644L285.177,327.16z M418.376,214.325L390,233.242
				v-37.834L418.376,214.325z M360,30v223.242l-95.878,63.918h-70.245L98,253.242V30H360z M68,233.242l-28.376-18.917L68,195.408
				V233.242z"/>
				<path d="M137,115h184c5.522,0,10-4.477,10-10s-4.478-10-10-10H137c-5.522,0-10,4.477-10,10S131.478,115,137,115z"/>
				<path d="M137,163h184c5.522,0,10-4.477,10-10s-4.478-10-10-10H137c-5.522,0-10,4.477-10,10S131.478,163,137,163z"/>
				<path d="M137,211h184c5.522,0,10-4.477,10-10s-4.478-10-10-10H137c-5.522,0-10,4.477-10,10S131.478,211,137,211z"/>
			</g>
		</svg>
		`;

      let svgs = data.replace(/<svg/g, '|DIVIDER|<svg').split('|DIVIDER|');
      obj = {};

      svgs.forEach(text => {
        let tempDiv = wsMain.tools.createElm('div');
        tempDiv.innerHTML = text;

        try {
          obj[tempDiv.querySelector(':scope > svg').getAttribute('ico').toLowerCase().replace('.svg', '')] = text;
        } catch (_) {

        }
      });

    } else {
      obj = data;
    }

    wsMain.setGlobalData('icons', obj);
    ApiWS.Cookie.set(cookieName, 'D', obj);

    const observer = new MutationObserver((mutations, observer) => {
      document.querySelectorAll('[data-wsjs-icon]').forEach(elm => {
        if (elm.getAttribute('data-wsjs-icon') != '') wsMain.data.treatIcon(elm)
      });
    });

    observer.observe(document.querySelector('body'), {
      subtree: true,
      childList: true,
      attributes: false
    });

    return true;
  }
});

wsMain.createModule({
  name: "banners",
  function: "get",
  options: {
    idealWidth: {
      full: {
        width: '1500',
        height: '300'
      },
      topo: {
        width: '1200',
        height: '300'
      },
      mini: {
        width: '300',
        height: '150'
      },
      tarja: {
        width: '1200',
        height: '90'
      },
      rodape: {
        width: '1200',
        height: '300'
      },
      popup: {
        width: '600',
        height: '400'
      },
    }
  },
  async get() {
    let data = await ApiWS.Calls.banners();

    return wsMain.modules['banners'].create(data);
  },
  create(returnJson) {
    // Declarando Json de Banners
    let banners = returnJson.banners.filter(b => document.querySelector(`*[data-wsjs-banner="${b.tipo}"]`) || b.tipo == 'popup' ? true : false );
    let bannersTypes = banners.map(b => b.tipo);
        bannersTypes = bannersTypes.filter((b, i) => bannersTypes.indexOf(b) === i);
    // Verificando Se Existem Banners
    if (!banners || banners.length == 0) return "Sem Banners";

    let deviceType = document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'false' ? 'D' : 'M';

    if (bannersTypes.indexOf('category_description') == -1) document.querySelectorAll('*[data-wsjs-banner="category_description"]').forEach(elm => elm.remove());
    else document.querySelectorAll('*[data-wsjs-banner="category_description"]').forEach(elm => elm.style.opacity = '');

    banners = banners.filter(b => b.dispositivos == deviceType || b.dispositivos == 'T');

    banners.forEach((b, i) => {
      b.virtualWidth = wsMain.options['banners'].idealWidth[b.tipo]?.width || '1200';
      b.virtualHeight = wsMain.options['banners'].idealWidth[b.tipo]?.height || '300';
      if (b.tipo == 'popup') {
        let vrf = window.sessionStorage.getItem('bannerPopup_' + b.id);
        if (vrf != 'false') {
          window.sessionStorage.setItem('bannerPopup_' + b.id, 'false');
          bannerPopUp(b, i);
        }
      }
    });

    function bannerPopUp(banner, indxToRemove) {
      let popupDiv = wsMain.tools.createElm({
        type: 'div',
        attrs: {
          class: 'banner-popup-modal'
        }
      });

      document.querySelector('body').style.overflow = 'hidden';

      let popupContainer = wsMain.tools.createElm('div');

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        attrs: {
          target: banner.target || '',
          href: banner.url || 'javascript:;'
        }
      });

      if (banner.conteudo) {
        hyperLink.innerHTML = banner.conteudo
      } else {
        let img = wsMain.tools.createElm({
          type: 'img',
          attrs: {
            width: banner.virtualWidth,
            height:  banner.virtualHeight,
            alt: banner.titulo,
            src: banner.imagem
          }
        });

        hyperLink.append(img);
      }

      popupContainer.append(hyperLink);
      popupContainer.innerHTML += '<span data-wsjs-icon="close"></span>';

      popupDiv.append(popupContainer);

      popupDiv.addEventListener('click', () => {
        popupDiv.setAttribute('style', 'filter: opacity(0)!important;');
        setTimeout(() => {
          document.querySelector('body').style.overflow = 'auto';
          popupDiv.remove();
        }, 301);
      });

      try {
        document.querySelector('body').append(popupDiv);
      } catch(err) {}
    }

    bannersTypes.forEach(actualType => {
      if (actualType == 'popup') return;

      let slideContainer = wsMain.tools.createElm({
        type: "div",
        attrs: {
          id: "banner-" + actualType,
          class: "banner-holder",
        },
      }); 

      banners.forEach(b => {
        if (b.tipo != actualType) return;
        if (b.tipo == "category_description" && b.conteudo.trim() == '' && b.imagem == '') return;

        // Verificando Altura dos Banners
        let imgStyle = "";
        if (b.altura != "0" || b.largura != "0") {
          if (b.altura != "0" && b.largura != "0") {
            imgStyle = `width:${b.largura}px;height${b.altura}px`;
          } else if (b.altura != 0) {
            imgStyle = `height:${b.altura}px;width:auto;max-width:100%;`;
          } else if (b.largura != 0) {
            imgStyle = `width:${b.largura}px`;
          }
        }

        let bannerImage;

        if (b.conteudo) {
          let div = wsMain.tools.createElm('div');
          if (actualType == 'category_description') {
            let innerElement = document.querySelector('*[data-wsjs-banner="category_description"]').innerHTML.replace('{{value}}', b.conteudo);
            div.innerHTML = innerElement;
            bannerImage = div;
            bannerImage.style.opacity = '';
          } else {
            div.innerHTML = b.conteudo;
            bannerImage = div.firstChild;
          }
        } else {
           bannerImage = wsMain.tools.createElm({
             type: "img",
             lazyLoad: b.tipo == 'full' ? false : true,
             attrs: {
              width: b.virtualWidth,
              height: b.virtualHeight,
              src: b.imagem,
              alt: b.titulo,
              style: imgStyle,
             },
           });
        }

        let bannerHiperLink = wsMain.tools.createElm({
          type: "a",
          attrs: {
            href: b.url || 'javascript:;',
            alt: b.titulo, 
            target: b.target
          },
        });
        
        if (actualType == 'category_description') bannerHiperLink = bannerImage;
        else bannerHiperLink.append(bannerImage);

        slideContainer.append(bannerHiperLink);
      });

      if (!slideContainer.hasChildNodes()) return;

      let slideOptions = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-banner="${actualType}"]`), 'slide')

      if (deviceType == 'M') slideOptions['lazyLoad'] = true;

      let slideSuccess, slider;

      let vrsMobile = document.querySelector('#HD_VRS_MOBILE').value == 'true';

      if (slideOptions) {
        if (vrsMobile) {
          [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
          if (!slideSuccess) return;
        } else {
          if (wsMain.version.compare('1.0.0') == 1) {
            if (actualType != 'mini' || (actualType == 'mini' && slideContainer.querySelectorAll(':scope > *').length > slideOptions?.slides?.perView)) {
              [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
              if (!slideSuccess) return;
            }
          } else {
            [slideSuccess, slider] = wsMain.tools.createSlide(slideContainer, slideOptions);
            if (!slideSuccess) return;
          }
        }
      }

      wsMain.tools.replaceSpanTag(slideContainer, `banner="${actualType}"`);

      setTimeout(() => {
        if (slider) slider.update();
      }, 5);

    });

    try {
      document.querySelectorAll('*[data-wsjs-banner]').forEach(item => item.remove());
    } catch(_) {}
    
    // document.querySelectorAll('[data-wsjs-banner]').forEach(item => item.remove());
    return true;
  },
});

wsMain.createModule({
  name: 'info-lojas',
  function: 'get',
  subFunctions: {
    metaDescription(obj, options, text) {
      let innerElement = document.querySelector('[data-wsjs-infoOffset="metaDescription"]')?.getAttribute('text');
      if (!innerElement) innerElement = obj.seo['meta_description'];

      if ((!innerElement || innerElement.trim() == '') && typeof nPanel == 'undefined') return false;
      
      let p = wsMain.tools.createElm({
        type: 'p',
        innerHTML: innerElement
      });

      if (typeof basePanel != 'undefined') p.setAttribute('data-wsjs-editable', 'metaDescription');

      return p;
    },
    socialMidia(obj, options, text) {
      let social = obj.redes_sociais;
      let existSocial = false;
      if (!social) return;

      let ulHolder = wsMain.tools.createElm('ul');

      let socialMidiaConfigs = {
        facebook: 'https://www.facebook.com/',
        twitter: 'https://www.twitter.com/',
        linkedin: 'https://www.linkedin.com/',
        instagram: 'https://www.instagram.com/',
        youtube: 'https://www.youtube.com/',
        pinterest: 'https://www.pinterest.com/',
        tiktok: 'https://www.tiktok.com/'
      };

      Object.keys(social).forEach(key => {
        if (!social[key]) return;
        existSocial = true;
        let innerElement = key.charAt(0).toUpperCase() + key.slice(1);

        if (options.icons != false) innerElement = `<span data-wsjs-icon="${innerElement}"></span>`;

        let tempDiv = wsMain.tools.createElm('div');
        tempDiv.innerHTML = text;
        let customDiv = tempDiv.querySelector(`:scope > ${key}`);

        if (customDiv) innerElement = customDiv.innerHTML;

        let itemLink = wsMain.tools.createElm({
          type: 'a',
          innerHTML: innerElement,
          attrs: {
            title: key,
            target: '_blank',
            href: socialMidiaConfigs[key] + social[key]
          }
        });
        let itemHolder = wsMain.tools.createElm('li');
        itemHolder.append(itemLink);
        ulHolder.append(itemHolder);
      });

      if (existSocial) return ulHolder;

      return false
    },
    mainPhone(obj, options, text) {
      let phone = obj.dadoscontato?.fone_1;
      if (!phone) return false;

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: text.replace('{{value}}', phone),
        attrs: {
          href: 'tel:' + phone,
          target: '__blank'
        }
      });

      return hyperLink;
    },
    secondPhone(obj, options, text) {
      let phone = obj.dadoscontato?.fone_2;
      if (!phone) return false;

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: text.replace('{{value}}', phone),
        attrs: {
          href: 'tel:' + phone,
          target: '__blank'
        }
      });

      return hyperLink;
    },
    whatsapp(obj, options, text) {
      let phone = obj.dadoscontato?.fone_3;
      if (!phone) return false;

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: text.replace('{{value}}', phone),
        attrs: {
          href: 'https://api.whatsapp.com/send?phone=55' + phone.replace(/[\s-()]/g, ''),
          target: '__blank'
        }
      });

      return hyperLink;
    },
    mainEmail(obj, options, text) {
      let email = obj.dadoscontato?.email_1;
      if (!email) return false;

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: text.replace('{{value}}', email),
        attrs: {
          href: 'mailto:' + email,
          target: '__blank'
        }
      });

      return hyperLink;
    },
    secondEmail(obj, options, text) {
      let email = obj.dadoscontato?.email_2;
      if (!email) return false;

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: text.replace('{{value}}', email),
        attrs: {
          href: 'mailto:' + email,
          target: '__blank'
        }
      });

      return hyperLink;
    },
    commercialHours(obj, options, text) {
      let hours = obj.dadoscontato?.horario;
      if (!hours) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', hours)
      })

      return span;
    },
    sac(obj, options, text) {
      let sacLink = obj.links?.faleconosco;
      if (!sacLink) return false;

      let hyperLink = wsMain.tools.createElm({
        type: 'a',
        innerHTML: text.replace('{{value}}', sacLink),
        attrs: {
          href: sacLink
        }
      });

      return hyperLink;
    },
    institutional(obj, options, text) {
      let institutional = JSON.parse(JSON.stringify(obj.menuinstitucional));

      if (!Array.isArray(institutional) || institutional.length == 0) return false;

      let ul = wsMain.tools.createElm('ul');

      ul.classList.add('institutional-footer')

      if (options.filter) {
        let filterArr = options.filter.split(",").map(item => parseInt(item));
        institutional = institutional.filter(item => filterArr.indexOf(item.id) != -1);
      }

      institutional.forEach(item => {
        let hyperLink = wsMain.tools.createElm({
          type: 'a',
          innerHTML: item['titulo'],
          attrs: {
            title: item['titulo'],
            href: item.url  || "javascript:;"
          }
        });

        let elm = wsMain.tools.createElm('li');
        try {
          if (hyperLink.innerText.trim() == document.querySelector('.institutional-container h1').innerText.trim()) elm.classList.add('actual');
        } catch (_) { }

        elm.append(hyperLink);
        ul.append(elm);
      });

      return ul;
    },
    paymentBadges(obj, options, text) {
      let badges = obj.estrutura?.bandeiras_pagamento;

      if (!badges && typeof nPanel == 'undefined') return false;

      let arrBadges = badges.split('|').filter(item => item ? true : false);

      if (!Array.isArray(arrBadges) || arrBadges.length == 0 && typeof nPanel == 'undefined') return false;

      let ul = wsMain.tools.createElm('ul');


      arrBadges.forEach(item => {
        let badge;
        switch (parseInt(item)) {
          case 1:
            badge = 'visa';
            break;
          case 2:
            badge = 'mastercard'
            break;
          case 4:
            badge = 'elo';
            break;
          case 5:
            badge = 'americanexpress'
            break;
          case 6:
            badge = 'boleto';
            break;
          case 7:
            badge = 'pagseguro';
            break;
          case 8:
            badge = 'mercadopago'
            break;
          case 10:
            badge = 'paypal';
            break;
          case 17:
            badge = 'pix';
            break;
          case 18:
            badge = 'pagarme';
            break;
          default:
            break;
        }

        if (badge) {
          let elm = wsMain.tools.createElm({
            type: 'span',
            attrs: {
              'data-wsjs-icon': badge
            }
          });

          let li = wsMain.tools.createElm('li');

          li.append(elm);
          ul.append(li);
        }
      });

      return ul;
    },
    cnpj(obj, options, text) {
      let cnpj = obj.dadoscontato?.cnpj;
      if (!cnpj) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', cnpj)
      });

      return span;
    },
    socialName(obj, options, text) {
      let cnpj = obj.dadoscontato?.razao;
      if (!cnpj) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', cnpj)
      });

      return span;
    },
    cidade(obj, options, text) {
      let cidade = obj.dadoscontato?.cidade;
      if (!cidade) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', cidade)
      });

      return span;
    },
    rua(obj, options, text) {
      let rua = obj.dadoscontato?.endereco;
      if (!rua) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', rua)
      });

      return span;
    },
    bairro(obj, options, text) {
      let bairro = obj.dadoscontato?.bairro;
      if (!bairro) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', bairro)
      });

      return span;
    },
    numero(obj, options, text) {
      let numero = obj.dadoscontato?.numero;
      if (!numero) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', numero)
      });

      return span;
    },
    cep(obj, options, text) {
      let cep = obj.dadoscontato?.cep;
      if (!cep) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', cep)
      });

      return span;
    },
    uf(obj, options, text) {
      let uf = obj.dadoscontato?.uf;
      if (!uf) return false;

      let span = wsMain.tools.createElm({
        type: 'span',
        innerHTML: text.replace('{{value}}', uf)
      });

      return span;
    },
    address(obj, options, text) {
      let data = obj.dadoscontato;
      if (!data) return false;

      let mainRegex = new RegExp(/{(.*?){(.*?)}(.*?)}/gi);
      let mainArr = text.match(mainRegex);

      let innerElement = text;
      mainArr.forEach(wordHolder => {
        let placeholderArr = new RegExp(/{(.*){(.*)}(.*)}/gmi).exec(wordHolder);
        let before = placeholderArr[1], word = placeholderArr[2], after = placeholderArr[3];

        if (data[word]) innerElement = innerElement.replace(wordHolder, before + data[word] + after);
        else innerElement = innerElement.replace(wordHolder, '');
      });

      if (innerElement && innerElement.trim() != '') return wsMain.tools.createElm({
        type: 'span',
        innerHTML: innerElement
      });
    }
  },
  async get() {
    let data = await ApiWS.Calls.infosLojas();

    return wsMain.modules['info-lojas'].create(data);
  },
  async create(returnJson) {

    await wsMain.tools.replaceSubFunctions(returnJson, this.subFunctions, 'infos');

    if (document.querySelector('[data-wsjs-breadcrumb]')) {
      let breadcrumbArr = [
        {
          nome: 'Home',
          url: '/'
        }
      ];

      let path = window.location.pathname;
      let infoLoja = wsMain.globalData.infoLoja;

      if (infoLoja.links.faleconosco == path) {
        breadcrumbArr.push({
          nome: 'Fale conosco',
          url: infoLoja.links.faleconosco
        });
      } else if (document.querySelector('#HdEtapaLoja')?.value == 'BLOG_VIEW') {
        breadcrumbArr.push({
          nome: 'Blog',
          url: '/blog'
        });
        breadcrumbArr.push({
          nome: artigo.titulo,
          url: window.location.pathname
        });
      } else {
        infoLoja.menuinstitucional.forEach(elm => {
          if (elm.url == path) {
            breadcrumbArr.push({
              nome: elm.titulo,
              url: elm.url
            });
          }
        });
      }

      let breadcrumbDiv = wsMain.tools.breadcrumb(breadcrumbArr);

      wsMain.tools.replaceSpanTag(breadcrumbDiv, document.querySelector('[data-wsjs-breadcrumb]'));
    }

    return true;
  }
});

wsMain.createModule({
  name: 'categorias',
  onlyAfter: 'info-lojas',
  function: 'get',
  options: {
      megaMenu: true
  },
  async get() {
    if (!document.querySelector('[data-wsjs-module=categorias]')) return;
    let data = await ApiWS.Calls.ListaCategorias();

    document.querySelectorAll('[data-wsjs-module=categorias]').forEach(tag => {
       wsMain.modules['categorias'].create(data, tag);
    });

    wsMain.addons.headerFirstLoad();

    return true;
  },
  create(returnJson, tag) {
      let configs = wsMain.options[this.name],
          categorias = returnJson.Categorias,
          categoriasCustom = returnJson.MenuPersonalizado;

      let options = wsMain.tools.getWsData(tag, 'options');
      let text = tag.innerHTML;

      let arrCat;

      if (!options.atual && options.custom != false && (Array.isArray(categoriasCustom) && categoriasCustom.length > 0)) {
          categoriasCustom.forEach(elm => {
              if (elm.nome.trim().toString().toLowerCase() == 'categorias') elm.subcategorias = categorias;
          });
          arrCat = categoriasCustom;
      } else if (Array.isArray(categorias) || categorias.length > 0) {
          arrCat = categorias;
      } else {
          return;
      }
      let arrLvl = 0;
      function search(mainArr, catToSearch) {
        function searchInsideSubCat(arr, lvl = 0, parent = false) {
          let response;
          arr.forEach(cat => {
            let subCat = searchInsideACat(cat, lvl, parent);
            response = subCat ? subCat : response;
          });
          
          return response;
        }
      
        function searchInsideACat(cat, lvl, parent) {
          if (catToSearch) {
            if (cat.id == catToSearch) return [cat, lvl, parent];
          } else {
            if (cat.atual) return [cat, lvl, parent];
          }

          if (cat.subcategorias && cat.subcategorias.length > 0) return searchInsideSubCat(cat.subcategorias, lvl+1, cat);
      
          return;
        }
      
        return searchInsideSubCat(mainArr);
      };

      if (options.atual) {
        let searchResult = search(arrCat, document.querySelector('#HD_CAT_ID').value);

        if (searchResult) {
          arrLvl = searchResult[1];
          arrCat = searchResult[2] ? searchResult[2].subcategorias : searchResult[0].subcategorias;

          if (arrCat.length == 0 && arrLvl != 0) {
            arrCat = searchResult[0].subcategorias || 0;
          }
        } else {
          arrCat = [];
        }
      }

      if (options.allCats  || options.mobile) {
        let objToUse = {
          atual: false,
          id: 'allCats-menu',
          nome: 'Todos os departamentos',
          produtodestaque: false,
          subcategorias: JSON.parse(JSON.stringify(arrCat))
        };

        if (options.allCats) arrCat.unshift(objToUse);
        if (options.mobile) arrCat = [objToUse];
      }

      let divMain = wsMain.tools.createElm({
        type: 'div',
        innerHTML: text,
        attrs: {
          class: options.defaultCat == false ? '' : 'nav-menu'
        }
      });

      let ulMain = wsMain.tools.createElm({
        type: 'ul', 
        attrs: {
          class: 'nav-menu-list'
        }
      });

      let title = wsMain.tools.createElm({
        type: 'div', 
        attrs: {
          class: 'sub-title'
        }
      });


      let subTitle = wsMain.tools.createElm('a');
      
      let titleLink = wsMain.tools.createElm({
        type: 'div', 
        innerHTML: 'Voltar', 
        attrs: {
          onclick: 'this.parentNode.parentNode.classList.remove("active")'
        }
      });

      title.append(subTitle);
      title.append(titleLink);

      function createTitle(div, catLink, catName) {
          let clone = div.cloneNode(true);
          clone.querySelector('a').setAttribute('href', catLink);
          clone.querySelector('a').innerHTML = catName;
          return clone;
      }
      
      function createCatList(cat, n = 0) {
        if (cat.id != "allCats-menu" && cat.tipo == 'dpt' && cat.registro && cat.registro != 0) {
          try {
            cat = search(returnJson.Categorias, cat.registro)[0];
          } catch(err) {
            return '';
          }
        }
        if (cat.tipo == 'inst') wsMain.globalData.infoLoja.menuinstitucional.forEach((int) => {
          if (cat.registro == int.id) cat.url = int.url;
        });

        if (cat.registro == 0) {
          cat = {
            atual: false,
            id: 'allCats-custom',
            nome: cat.nome,
            produtodestaque: false,
            subcategorias: JSON.parse(JSON.stringify(categorias))
          }
        }

          let li = wsMain.tools.createElm({type: 'li', attrs: {
              class: 'dpt-' + n + ' nav-menu-item',
              id: 'departamento-' + cat.id,
          }});


          if (n == 0 && options.allCats && cat.id == 'allCats-menu') {
            li.classList.add('dpt-all');
            li.style.display = 'none';
          }
          
          if (options.mobile && n == 1 && cat.id == 'allCats-menu') {
            return '';
          } 
          
          let hiperLink = wsMain.tools.createElm({
            type: 'a', 
            innerHTML: cat.nome, 
            attrs: {
                class: 'nav-menu-hiperlink',
                title: cat.nome || 'Todas as Categorias',
                href: cat.url || 'javascript:;'
            }
          });
          

          li.append(hiperLink)

          let subCats = cat.subcategorias;
          if (subCats && Array.isArray(subCats) && subCats.length > 0) {
            if (options.hoverMode == false && options.dropDown != true || options.mobile) {
              hiperLink.setAttribute('href', 'javascript:;');
              hiperLink.setAttribute('onclick', 'wsMain.modules["categorias"].selectMode(this)');
              hiperLink.classList.add('has-sub');

              if (subCats[0].holder != true) {
                subCats.unshift({
                  nome: 'Ver Tudo',
                  holder: true,
                  id: cat.id,
                  url: cat.url
                });
            }

            } else {
              li.classList.add('hover');
            }

            let ul = wsMain.tools.createElm({type: 'ul', attrs: {class: 'nav-menu-sub-list'}});
            let divHolder = wsMain.tools.createElm({type: 'div', attrs: {class: n == 0 ? 'nav-menu-main' : 'nav-menu-sub-container'}});
                for (let i = 0; i < subCats.length; i++) {
                    ul.append(createCatList(subCats[i], n+1));
                }
                if (n != 0) {
                    let titleList = createTitle(title, cat.url, cat.nome);
                    if (options.dropDown != true) divHolder.append(titleList);
                }
                divHolder.append(ul);
            if (n > 0 && options.hoverMode != false) {
                hiperLink.classList.add('has-sub');
                let spanLink = wsMain.tools.createElm({
                  type: 'span', 
                  attrs: {
                    'data-wsjs-icon': 'arrow'
                  }
                });
                hiperLink.append(spanLink);
                if (options.dropDown != true) {
                  hiperLink.setAttribute('href', 'javascript:;');
                  hiperLink.addEventListener('click', (e) => {
                    let subContainer = hiperLink.parentNode.querySelector('.nav-menu-sub-container');
                    if (subContainer) subContainer.classList.add('active');
                  });
                }
            }

            if (n == 0 && options.dropDown == true) divHolder.classList.add('dropdown');
            if (options.dropDown == true) hiperLink.classList.add('dropdown');

            if (n > 0 && options.dropDown != true) {
              divHolder.append(wsMain.tools.createElm({
                type: 'div',
                attrs: {
                  class: 'nav-menu-overlay'
                }
              }));
            }
            
            li.append(divHolder);
            
            if (options.dropDown == true) li.classList.add('dropdown');
          }

          if (subCats && Array.isArray(subCats) && subCats.length > 0 && configs.megaMenu && cat.produtodestaque && options.megaMenu != false && options.dropDown != true) {
            let megaMenu = wsMain.tools.createElm({
                type: 'div',
                attrs: {
                    class: 'nav-menu-megamenu-container'
                }
            });
            let img = wsMain.tools.createElm({
                type: 'img',
                attrs: {
                  class: 'nav-menu-megamenu-item-image',
                  src: cat.produtodestaque.imagem
                }
            });
            let prodDestaqueName = wsMain.tools.createElm({
                type: 'div',
                attrs: {
                  class: 'nav-menu-megamenu-item-nome-container'
                },
                innerHTML: '<p>' + cat.produtodestaque.nome + '</p>'
            });
            let prodDestaqueContainer = wsMain.tools.createElm({
              type: 'a',
              attrs: {
                href: cat.produtodestaque.url,
                class: 'nav-menu-megamenu-item'
              }
            });
            let imgHolder = wsMain.tools.createElm({
              type: 'div', 
              attrs: {
                class: 'nav-menu-megamenu-item-image-container'
              }
            });

            let photowrap = '{photowrap}';
            let aspectRatio = '1/1';
            if ( photowrap == 'Quadrada') { 
              aspectRatio = '1/1'; 
            }
            if ( photowrap == 'Vertical') { 
              if (photo) photo = photo.replace('/PEQ_', '/MED_');
              console.log(photo);
              aspectRatio = '3/4'; 
            }
            if ( photowrap == 'Super Vertical') { 
              if (photo) photo = photo.replace('/PEQ_', '/MED_');
              console.log(photo);
              aspectRatio = '2/3'; 
            }
            if ( photowrap == 'Horizontal') { 
              aspectRatio = '4/3'; 
            }

            imgHolder.style.setProperty('aspect-ratio', aspectRatio);

            imgHolder.append(img);
            prodDestaqueContainer.append(imgHolder);
            prodDestaqueContainer.append(prodDestaqueName);
            megaMenu.append(prodDestaqueContainer);
            li.append(megaMenu);
          }


          return li;
      }
      
      for (let i = 0; i < arrCat.length; i++) {
          ulMain.append(createCatList(arrCat[i]));
      }

      if ((arrCat.length == 0 && arrLvl == 0)) {
        tag.remove();
      } else {
      divMain.append(ulMain);

      wsMain.tools.replaceSpanTag(divMain, tag);
      let maxWidth = ulMain.offsetWidth;



      ulMain.querySelectorAll(':scope .dpt-1 .nav-menu-hiperlink.dropdown').forEach(elm => {
        elm.addEventListener('mouseover', () => {
          let offset = elm.offsetTop;
          elm.nextSibling.style.top = offset + 'px';
          elm.nextSibling.style.display = 'block';
          setTimeout(() => {
            elm.nextSibling.style.opacity = '1';
          }, 1);
          setTimeout(() => {
            elm.nextSibling.style.top = offset + 'px';
            elm.nextSibling.style.display = 'block';
            setTimeout(() => {
              elm.nextSibling.style.opacity = '1';
            }, 1);
          }, 200);
        });
        
        elm.addEventListener('mouseout', () => {
            setTimeout(() => {
            elm.nextSibling.style.opacity = '';
            elm.nextSibling.style.display = '';
          }, 200);
        });
      });

      ulMain.addEventListener('mouseleave', () => { 
        ulMain.querySelectorAll('.nav-menu-sub-container.active').forEach(elm => elm.classList.remove('active'));
        ulMain.querySelectorAll('li:not(.dpt-0) > .nav-menu-hiperlink.active').forEach(elm => elm.classList.remove('active'));
      });
      let menuItens = ulMain.querySelectorAll('.nav-header .dpt-0');
      
      function getWidth() {
        menuItens = ulMain.querySelectorAll('.nav-header .dpt-0');
        let width = 0, gap = getComputedStyle(ulMain).getPropertyValue('column-gap');
        gap = gap && gap != 'normal' ? gap : 0;
        menuItens.forEach((elm, i) => width += elm.querySelector(':scope > a').offsetWidth + (i == menuItens.length-1 ? 0 : parseInt(gap)));
        return width;
      }

      let permanentCategories = options ? options['always-visible']?.split(',').map(a => a.trim()) || false : false;

      while (getWidth() > maxWidth) {
        try {
          ulMain.querySelector('.dpt-all').style.display = '';
        } catch(err) {}

        if (permanentCategories) {
          for (let p = menuItens.length - 1; p >= 0; p--) {
            let isEqual = false;

            permanentCategories.forEach(pCategorie => isEqual = 'departamento-' + pCategorie == menuItens[p].getAttribute('id') ? true : isEqual);
            
            if (!isEqual) {
              menuItens[p].remove();
              break;
            } 
          }
        } else {
          menuItens[menuItens.length -1].remove();
        }
      }

try {
      ulMain.querySelectorAll(':scope > li').forEach(elm => {
        let menuMain = elm.querySelector(':scope > .nav-menu-main');
        let megaMenu = elm.querySelector(':scope > .nav-menu-megamenu-container');

        let offsetMenuMain = menuMain.getBoundingClientRect();
        let offsetMegaMenu = menuMain.getBoundingClientRect();

        if (megaMenu) {
          if (offsetMenuMain.left + menuMain.offsetWidth + megaMenu.offsetWidth + 20 > window.innerWidth) {
            elm.classList.add('alignToRight');
            elm.querySelector(':scope > .nav-menu-main').style.marginRight = '30rem';
          }
        } else {
          if (offsetMegaMenu.left + menuMain.offsetWidth + 20 > window.innerWidth) {
            elm.classList.add('alignToRight');
          }
        }
      });
} catch (err) {

}
      }

      return true;
  },
  selectMode(elm) {
    try {
      if (elm != elm.parentNode.querySelector('.active')) {
        elm.parentNode.parentNode.querySelector('.active').classList.remove('active');
      }
    } catch(_) {}

    elm.classList.toggle('active');
  }
});

wsMain.createModule({
  name: "manufacturer",
  function: "get",
  async get() {
    let tag = document.querySelectorAll('[data-wsjs-module="manufacturer"]');
    if (!tag || tag.length == 0) return true;
    
    let data = await ApiWS.Calls.manufactures();

    tag.forEach(t => wsMain.modules['manufacturer'].create(data, t) );

    return true;
  },
  create(returnJson, elm) {
    let fabricantes = returnJson.fabricantes;

    if (!fabricantes || fabricantes.length == 0) return;

    let divHolder = wsMain.tools.createElm({
      type: "div"
    });

    let manufacturerOptions = wsMain.tools.getWsData(elm, 'options');


    fabricantes.forEach((f) => {
      let hiperLink = wsMain.tools.createElm({
        type: "a",
        attrs: {
          href: f.url,
          "data-id": "manufacturer-" + f.id,
        },
      });
      
      if (f.logotipo && manufacturerOptions.labelOnly != true) {
        let fImg = wsMain.tools.createElm({
          type: "img",
          attrs: {
            src: f.logotipo,
            title: f.nome,
            alt: f.nome,
          },
        });
        hiperLink.append(fImg);
        divHolder.append(hiperLink);
      } else {
        let fName = wsMain.tools.createElm({
          type: "li",
          innerHTML: `<span>${f.nome}</span>`,
          attrs: {
            title: f.nome,
          },
        });

        hiperLink.append(fName);
        divHolder.append(hiperLink);
      }
    });

    let slideOptions = wsMain.tools.getWsData(elm, 'slide');

    let slideSuccess, slider;

    if (slideOptions) {
      [slideSuccess, slider] = wsMain.tools.createSlide(divHolder, slideOptions);
      if (!slideSuccess) return;
    }

    if (manufacturerOptions.labelOnly == true) {
      wsMain.tools.replaceSpanTag(wsMain.tools.createElm({
        type: 'ul',
        innerHTML: divHolder.innerHTML
      }), elm);
    } else {
      wsMain.tools.replaceSpanTag(divHolder, elm);
    }


    if (slideOptions) slider.update();

    return true;
  },
});

wsMain.createModule({
  name: 'condicoes',
  function: 'get',
  onlyAfter: 'info-lojas',
  options: {
    templateConfigs: {
      icon: true,
      title: true,
      subtitle: true
    }
},
  get() {
    let tag = document.querySelectorAll('[data-wsjs-module="condition"]');
    if (!tag || tag.length == 0) return true;

    tag.forEach(t => wsMain.modules['condicoes'].create(t) );

    return true;
  },
  create(elm) {
    let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['condicoes'].templateConfigs));
    let condicoes = wsMain.globalData['infoLoja'].condicoes;

    let optionsCondition = wsMain.tools.getWsData(elm, 'options');
        templateConfigs = {...templateConfigs, ...optionsCondition};

    if (!Array.isArray(condicoes) || condicoes.length == 0) return true;

    let conditionContainer = wsMain.tools.createElm({
        type: 'div', 
        attrs: {
            class: 'condicoes-loja',
        }
    });

    condicoes.forEach((c, i)=> {
        let 
            itemContainer = wsMain.tools.createElm({type: 'div', attrs: {class: 'condicao-item condicao-item-' + i}}),
            iconContainer = wsMain.tools.createElm({type: 'div', innerHTML: c.icone, attrs: {class: 'condicao-icone'}}),
            textContainer = wsMain.tools.createElm({type: 'div', attrs: {class: 'condicao-textos'}}),
            title = wsMain.tools.createElm({type: 'h3', innerHTML: c.titulo, attrs: {class: 'condicao-titulo'}}),
            subtitle = wsMain.tools.createElm({type: 'p', innerHTML: c.subtitulo, attrs: {class: 'condicao-subtitulo'}});

        if (templateConfigs.title) textContainer.append(title);
        if (templateConfigs.subtitle) textContainer.append(subtitle);
        
        let conditionHiperLink = wsMain.tools.createElm({
            type: c.url ? 'a' : 'div', 
            attrs: { 
              class: 'condicao-hiperlink'
            }
        });

        if (c.url) {
          conditionHiperLink.setAttribute('href', c.url);
        }

        if (templateConfigs.icon) conditionHiperLink.append(iconContainer);
        if (templateConfigs.title || templateConfigs.subtitle) conditionHiperLink.append(textContainer);
        
        itemContainer.append(conditionHiperLink);
        conditionContainer.append(itemContainer);
    });

    let conditionSlideOptions = wsMain.tools.getWsData(elm, 'slide');
    
    let [slideSuccess, slide] = conditionSlideOptions ? wsMain.tools.createSlide(conditionContainer, conditionSlideOptions) : [null, null];
    
    if (templateConfigs.icon || templateConfigs.title || templateConfigs.subtitle) wsMain.tools.replaceSpanTag(conditionContainer, elm);

    if (slideSuccess) slide.update();

    return true;
  }
});

wsMain.createModule({
  name: 'login-options',
  function: 'get',
  get() {
    return wsMain.modules['login-options'].create();
  },
  create() {
    let userName = document.querySelector('#HD_LVCLI_NOME').value,
      shopId = document.querySelector('#HD_LV_ID').value;

    let container = document.querySelector('[data-wsjs-login="container"]');
    let options = wsMain.tools.getWsData(container, 'options');

    try {
      if (options.float == false) {
        container.classList.add('lateral-list');
        if (typeof nPanel == 'undefined') {
          container.querySelector('[data-wsjs-login="button"]').addEventListener('click', () => {
            wsMain.modules['login-options'].open();
          });
    
          document.addEventListener('keydown', (event) => {
            if(event.key == 'Escape') wsMain.modules['login-options'].open(true);
          });          
        }
      }
  
      container.style.opacity = "1";
    } catch(err) {}

    if (userName != 'Visitante') {
      document.querySelectorAll('[data-wsjs-login]').forEach(item => {
        let attr = item.getAttribute('data-wsjs-login');
        if (attr == 'container') item.classList.add('logged');
        if (attr == 'list-register') item.remove();
        if (attr == 'logout') item.setAttribute('href', `/logoff/${shopId}/logoff`);
        if (attr == 'username') item.innerHTML = item.innerHTML.replace('{{value}}', userName);
        if (attr != 'list-register') item.removeAttribute('data-wsjs-login');
        if (attr == 'favorite' && typeof WsFavoritos == 'undefined') item.remove();

        wsMain.addons.dataLoad(item);
      });
    } else {
      document.querySelectorAll('[data-wsjs-login]').forEach(item => {
        let attr = item.getAttribute('data-wsjs-login');
        if (attr == 'logout' || attr == 'username' || attr == 'list-login') item.remove();
        if (attr == 'container') item.classList.add('not-logged'); 
        else if (attr != 'list-login') item.removeAttribute('data-wsjs-login');
        if (attr == 'favorite' && typeof WsFavoritos == 'undefined') item.remove();

        wsMain.addons.dataLoad(item);
      });
    }

    return true;

  },
  open(vrf) {
    const body = document.querySelector('body'),
      list = document.querySelector('.login-options-container.lateral-list .login-options-list'),
      overlay = document.querySelector('[data-wsjs-cart="overlay-holder"]')

    if (list.style.right == '0px' || vrf) {
      body.style.left = '';
      body.style.overflow = '';
      list.style.right = ''
      overlay.setAttribute('style', 'width: 0;height: 0;opacity:0');
    } else {
      list.style.right = '0'
      body.style.overflow = 'hidden';
      body.style.left = '-48rem';
      overlay.setAttribute('style', 'width: 100%;height: 100%;opacity:0.5')
    }
  }
})

wsMain.createModule({
  name: 'newsletter',
  function: 'create',
  create() {
    try {
      document.querySelectorAll('[data-wsjs-newsletter="container"]').forEach(newsForm => {
        newsForm.addEventListener('submit', () => wsMain.modules['newsletter'].registerNews(newsForm));
      })

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
  async registerNews(form = false) {
      form = document.querySelector('[data-wsjs-newsletter]');
      let name = form.querySelector('input[type="text"]').value,
          email = form.querySelector('input[type="email"]').value;

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

wsMain.createModule({
  name: 'prod-template',
  createProd(prod, template, configs) {

    try {
      let prodButton = 'false'

      if (prodButton == 2 || prodButton == 1) {
        configs.button = true;

        if (prodButton == 2) configs.redirect = true;
      }

    } catch (err) { }

    let precoMain;

    Object.keys(configs).forEach(k => {
      if (!configs[k]) template.querySelectorAll(`[data-wsjs-prod-template="${k}"]`).forEach(elm => elm.remove());
    });

    function replaceData(elm, query, strValue) {
      let divArr = template.querySelectorAll(`[data-wsjs-prod-template="${query}"]`);
      divArr.forEach(div => {
        if (div) {
          try {
            let elmToReplace = elm.cloneNode(true);

            div.getAttributeNames().forEach((attr) => {

              if (
                attr != "data-wsjs-module" &&
                attr != "data-wsjs-options" &&
                attr != 'data-wsjs-infos' &&
                attr != 'data-wsjs-banner' &&
                attr != 'data-wsjs-listing' &&
                attr != 'data-wsjs-prod-list' &&
                attr != 'data-wsjs-prod-template' &&
                attr != 'data-wsholder'
              ) {
                elmToReplace.setAttribute(attr, div.getAttribute(attr));
              }
            });

            if (query == 'price-main' && configs.startingOff && Array.isArray(prod.variacoes) && prod.variacoes.length > 0) {
              let isHighEnough = false;
              prod.variacoes.forEach(prodVar => {
                if (prodVar.prices.price && prodVar.prices.price > precoMain) isHighEnough = true;
              })
              if (isHighEnough) elmToReplace.innerHTML = '<span class="price-startingOff">A partir de</span> ' + elmToReplace.innerHTML
            }

            if (strValue) {
              let template = div.innerHTML;
              let elmValue = elmToReplace.innerText;

              if (template.indexOf('{{value}}') != -1) elmToReplace.innerHTML = template.replace(/{{value}}/gm, elmValue);
            }

            div.parentNode.replaceChild(elmToReplace, div);
          } catch (err) {
            console.log(err);
          }
        }
      })
    }

    template.setAttribute('ws-prod-sku', prod.codigo);
    template.setAttribute('ws-prod-id', prod.id);

    try {
      if (prod.fabricante) {
        let manufacturerDiv = wsMain.tools.createElm({
          type: 'a',
          attrs: {
            href: prod.fabricante.url || ''
          }
        });

        manufacturerDiv.innerHTML = prod.fabricante.nome;

        replaceData(manufacturerDiv, 'manufacturer');
      }
    } catch (err) {

    }

    replaceData(wsMain.tools.createElm({ type: 'p', innerHTML: prod.nome }), 'name');

    try {
      if (prod.integracoes && prod.integracoes.length > 0) prod.integracoes.forEach(integ => {
        if (integ.tipo == 'trustvox_list') {
          let trustVoxDiv = wsMain.tools.createElm({
            type: 'div',
            innerHTML: integ.conteudo,
            attrs: {
              class: 'prod-shwocase-trustvox-container'
            }
          });
          replaceData(trustVoxDiv, 'trustvox-container');
        }
      });
    } catch (err) { }

    try {

      template.querySelectorAll('[data-wsjs-prod-template="link"]').forEach(item => {
        item.setAttribute('href', prod.links['ver_produto']);
        item.setAttribute('title', prod.nome);
        item.removeAttribute('data-wsjs-prod-template');
      });
    } catch (_) { }

    /* Tratativa Imagens */

    if (!configs.imageSize) configs.imageSize = 'PEQ';
    let virtualWidth = configs.imgAttr ? configs.imgAttr.split('x')[0] : 213;
    let virtualHeight = configs.imgAttr ? configs.imgAttr.split('x')[1] : 263;

    let imgHiperLink = wsMain.tools.createElm({ type: 'a', attrs: { href: prod.links['ver_produto'] } });
    if (prod.fotos) {

      function hoverImage() {
        let img = template.querySelector('img:nth-child(2)');
        template.classList.add(`photo-swap-${configs.photoSwap || 'opacity'}`)
        img.setAttribute('src', img.getAttribute('othersrc'))
        img.removeAttribute('othersrc')
        template.removeEventListener('mouseover', hoverImage);
      }

      prod.fotos.forEach((photo, i) => {
        if (i > 1 || (i == 1 && document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == true)) return;

        photo = photo.replace('PEQ_', configs.imageSize + '_');

        let imgObj = {
          type: 'img',
          lazyLoad: i == 1 ? false : configs.lazyLoad,
          attrs: {
            width: virtualWidth,
            height: virtualHeight,
            alt: prod.nome
          }
        }

        if (i == 1) {
          imgObj.attrs['otherSrc'] = photo
        } else imgObj.attrs['src'] = photo

        let img = wsMain.tools.createElm(imgObj);

        if (i == 1) {
          template.classList.add(`photo-swap-transform-${configs.photoSwap || 'opacity'}`);
          template.addEventListener('mouseover', hoverImage);
        }

        imgHiperLink.append(img);
      });

    } else {
      imgHiperLink.innerHTML = `<span data-wsjs-icon="noimage"></span>`;
      imgHiperLink.classList.add('whithout-image');
      imgHiperLink.setAttribute('title', 'Produto sem Imagem');
    }

    replaceData(imgHiperLink, 'image');

    if (prod.disponivel) {

      if (typeof WsFavoritos != 'undefined') {
        let iconOnTemplate = template.querySelector('[data-wsjs-prod-template="favorite"]')?.innerHTML;

        let iconToUse = iconOnTemplate && iconOnTemplate.trim() != '' ? iconOnTemplate : '<span data-wsjs-icon="favorite"></span>';

        let div = wsMain.tools.createElm({
          type: 'div',
          innerHTML: iconToUse,
          attrs: {
            id: 'prod-favorite-link-' + prod.id,
            data: 'prod-favorite-link-' + prod.id,
            onclick: `funcAddFavoriteWs("${prod.id}");`
          }
        });
        replaceData(div, 'favorite');
      }

      // Treating Prices
      let precos = prod.precos;
      if (precos) {
        let defaultPrice = precos.preco, promoPrice = precos.preco_promocao;
        if (defaultPrice > 0) {
          try {
            template.querySelector('[data-wsjs-prod-template="price-container"]').removeAttribute('data-wsjs-prod-template');
          } catch (err) { }
          try {

            if (isNaN(promoPrice) || promoPrice >= defaultPrice || promoPrice == 0) {
              precoMain = defaultPrice;
              replaceData(wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(defaultPrice) }), 'price-main', true);
            } else if (promoPrice < defaultPrice) {
              precoMain = promoPrice;
              replaceData(wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(promoPrice) }), 'price-main', true);
              replaceData(wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(defaultPrice) }), 'price-second', true);

              let descountPercentage = Math.round(100 - (((promoPrice) * 100) / defaultPrice));
              descountPercentage = descountPercentage < 1 ? 1 : descountPercentage;
              let spanTag = wsMain.tools.createElm({ type: 'span', innerHTML: descountPercentage });
              replaceData(spanTag, 'desconto', true);
            } else {

            }

          } catch (err) { }

          try {

            let maxInstallmentNum = precos.max_parcelas, minInstallmentsValue = precos.valor_min_parcelas;
            let initFeeNum = precos.juros_inicia, initFeeValue = precos.juros;

            if (maxInstallmentNum > 0) {
              let whithoutFee = initFeeNum > 0 && initFeeValue > 0;
              let installmentValue = precoMain, installmentNum;

              if (whithoutFee) {
                installmentNum = initFeeNum < maxInstallmentNum ? (initFeeNum - 1) : maxInstallmentNum;
                installmentValue = wsMain.data.compostFeeValue(initFeeValue, installmentNum, initFeeNum, precoMain);

                while (installmentNum > 0 && installmentValue < minInstallmentsValue) {
                  installmentNum--;

                  if (installmentNum > 0) installmentValue = wsMain.data.compostFeeValue(initFeeValue, installmentNum, initFeeNum, precoMain);
                }

                if (installmentNum == 0) whithoutFee = false;

              }

              if (!whithoutFee) {
                installmentNum = maxInstallmentNum;

                installmentValue = wsMain.data.compostFeeValue(initFeeValue, installmentNum, initFeeNum, precoMain);

                while (installmentValue < minInstallmentsValue && installmentNum > 0) {
                  installmentNum--;

                  if (installmentNum > 0) installmentValue = wsMain.data.compostFeeValue(precos.juros, installmentNum, initFeeNum, precoMain);
                }
              }

              if (installmentNum == 0) installmentNum = 1;

              let installmentString = installmentNum + 'x de ' + wsMain.data.treatPrice(installmentValue);

              if (whithoutFee) installmentString += ' sem juros';

              let spanInstallment = wsMain.tools.createElm({ type: 'span', innerHTML: installmentString });

              replaceData(spanInstallment, 'price-installment', true);
            }

          } catch (err) {

          }

          try {
            if (configs['price-cash'] && precos.desconto_avista && !isNaN(precos.desconto_avista)) {
              let priceTemplate = template.querySelector('[data-wsjs-prod-template="price-cash"]');
              if (priceTemplate) {
                let spanText = wsMain.data.treatPrice(precoMain - (precoMain * (precos.desconto_avista / 100)));
                let spanCache = wsMain.tools.createElm({ type: 'span', innerHTML: spanText });
                replaceData(spanCache, 'price-cash', true);
              }
            }
          } catch (err) {

          }

          try {

            if (configs.button) {
              if (wsMain.globalData.infoLoja?.estrutura?.modo != '2' && wsMain.globalData.infoLoja?.estrutura?.modo != '3') {
                template.querySelector('[data-wsjs-prod-template="button-container"]').removeAttribute('data-wsjs-prod-template');
                let shopId = document.querySelector('#HD_LV_ID').value;

                try {
                  if (configs["quantity-selector"]) {
                    let inputSelector = template.querySelector('[data-wsjs-prod-template="quantity-selector"]');
                    inputSelector.removeAttribute('data-wsjs-prod-template');
                    inputSelector.setAttribute('id', 'HD_QTD_PROD_' + prod.id);
                    inputSelector.setAttribute('min', prod.qtdminima <= 0 ? 1 : prod.qtdminima);
                    inputSelector.setAttribute('value', 1);
                  }
                } catch (err) {

                }

                let afterFunction = !configs.redirect ? 'wsMain.modules["cart-drawer"].changeState()' : "";

                let buttonLink = `javascript:void(wsFuncBtBuyOnList('${shopId}', '${prod.id}', '${afterFunction}'))`;
                let buttonClass = !configs.redirect ? 'button-second' : 'button-main';

                try {
                  let templateButtonClass = template.querySelector('[data-wsjs-prod-template="button"]').getAttribute('class');
                  if (templateButtonClass && templateButtonClass.trim() != '') buttonClass = templateButtonClass;
                } catch (err) { }

                replaceData(
                  wsMain.tools.createElm({
                    type: 'a',
                    innerHTML: !configs.redirect ? 'Adicionar' : 'Comprar',
                    attrs: {
                      "data-sku": prod.codigo,
                      class: buttonClass,
                      href: buttonLink
                    }
                  })
                  ,
                  'button');
              }
            }
          } catch (err) {

          }
        } else {
          try {
            template.querySelector('[data-wsjs-prod-template="price-container"]').remove();
          } catch (err) { }
        }

      } else {
        try {
          template.querySelector('[data-wsjs-prod-template="price-container"]').removeAttribute('data-wsjs-prod-template');
        } catch (err) { }
        let consultPrice = wsMain.tools.createElm({
          type: 'span',
          innerHTML: 'Pre&ccedil;o sob consulta',
          attrs: {
            class: 'prod-consult-message'
          }
        });
        replaceData(consultPrice, 'price-main');
        template.classList.add('consult');
        template.children[0].classList.add('consult');
      }

      if (prod.lancamento) {
        let spanText = template.querySelector('[data-wsjs-prod-template="lancamento"]').innerHTML;
        let spanTag = wsMain.tools.createElm({ type: 'span', innerHTML: spanText });
        replaceData(spanTag, 'lancamento');
      }

      if (prod.fretegratis) {
        let spanText = template.querySelector('[data-wsjs-prod-template="frete-gratis"]').innerHTML;
        let spanTag = wsMain.tools.createElm({ type: 'span', innerHTML: spanText });
        replaceData(spanTag, 'frete-gratis');
      }



    } else {
      try {
        template.querySelector('[data-wsjs-prod-template="price-container"]').removeAttribute('data-wsjs-prod-template');
      } catch (err) { }
      let spanMessage = wsMain.tools.createElm({
        type: 'span',
        innerHTML: 'Indispon&iacute;vel'
      });
      template.classList.add('unavaliable');
      template.children[0].classList.add('unavaliable');
      replaceData(spanMessage, 'price-main');
      spanMessage.classList.add('prod-unavaliable-message');
    }

    template.querySelectorAll('[data-wsjs-prod-template]').forEach(elm => {
      if (elm.getAttribute('data-wsjs-prod-template') == 'ws-review') {
        if (!wsMain.modules['app-review']) elm.remove();
      } else {
        try { elm.remove(); } catch (e) { }
      }
    });

    return template;
  }
});


wsMain.createModule({
  // Module name
  name: 'product-list',
  // Module function name
  function: 'get',
  actualGroup: 0,
  groupLength: document.querySelectorAll(`[data-wsjs-prod-list='group']`)?.length || false,
  // Configuration 
  options: {
    templateConfigs: {
      "image": true,
      "name": true,
      "price-main": true,
      "price-second": true,
      "price-installment": true,
      "price-cash": true,
      "button": false,
      "quantity-selector": false,
      "desconto": true,
      "lancamento": true,
      "frete-gratis": true,
      "favorito": true,
      "lazyLoad": true,
      "imageSize": 'MED',
      "startingOff": true,
      "redirect": false
    },
  },
  data: {},
  // Module Trigger
  async get() {
    wsMain.modules['product-list'].actualGroup = 0;
    wsMain.modules['product-list'].data['group'] = {};

    let isLancamento = Boolean(document.querySelector(`[data-wsjs-prod-list='lancamento']`));

    if (wsMain.modules['product-list'].groupLength > 0 || isLancamento) {
      wsMain.modules['product-list'].data['group'] = await ApiWS.Calls.listProducts['group']({
        prodLancamento: isLancamento ? '1' : null
      });
    }

    if (isLancamento) {
      let lancamentoIdx = false;
      wsMain.modules['product-list'].data['group'].grupos.forEach((group, groupIdx) => {
        if (group.type == 'lancamento') lancamentoIdx = groupIdx;
      });
      if (lancamentoIdx != false) wsMain.modules['product-list'].data['lancamento'] = wsMain.modules['product-list'].data['group'].grupos.splice(lancamentoIdx, 1);
    }

    if (wsMain.modules['product-list'].groupLength > 0) {
      let groups = document.querySelectorAll(`[data-wsjs-prod-list='group']`);
      if (!wsMain.modules['product-list'].data['group'].grupos) wsMain.modules['product-list'].data['group'].grupo  = []; 
      while (wsMain.modules['product-list'].data['group'].grupos.length < groups.length && document.querySelector(`[data-wsjs-prod-list='group']`)) {
        groups[groups.length - 1].remove();
        groups = document.querySelectorAll(`[data-wsjs-prod-list='group']`);
        wsMain.modules['product-list'].groupLength = groups.length;
      }
    }

    let promises = Array.from(document.querySelectorAll('[data-wsjs-prod-list]')).map(async elm => {
      let functionName = elm.getAttribute('data-wsjs-prod-list');
      if (functionName == 'template-empty-search' || functionName == 'template-empty-category') return;

      let options = wsMain.tools.getWsData(elm, 'options');
      let slideOptions = wsMain.tools.getWsData(elm, 'slide');
      let prodsPerlineSet = functionName == 'category' ? '3' : '4';
      let prodsPerLineVar = !isNaN(parseInt(prodsPerlineSet)) ? prodsPerlineSet : 4;

      if (slideOptions.slides && slideOptions.slides.perView) prodsPerLineVar = slideOptions.slides.perView;
      if (options['prods-perline']) prodsPerLineVar = options['prods-perline'];

      if (document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'true' && prodsPerLineVar >= 3) prodsPerLineVar = 2;

      let data = wsMain.modules['product-list'].data[functionName] || await ApiWS.Calls.listProducts[functionName](prodsPerLineVar);
      let text = elm.innerHTML;
      let breve = '';

      try {
        breve = elm.parentNode.parentNode.querySelector('template').innerHTML;
      } catch (err) { }

      let vrfSearch = document.querySelector('#LV_HD_BUSCA_VALOR');
      if (vrfSearch || document.querySelector("body").classList.contains('PagFabricante')) document.querySelectorAll('*[data-wsjs-search="false"]').forEach(item => item.remove());

      if (data && (data?.totalitens > 0 || data?.grupos?.length > 0 || data.length > 0)) {
        if (typeof nPanel != 'undefined' && nPanel.token && data["wssource"] == "ws-plchold") {
          if (functionName == 'group' || functionName == 'previous') {
            for (let i = data.grupos.length; i < wsMain.modules['product-list'].groupLength; i++) {
              data.grupos = [...data.grupos, data.grupos[0]];
            }
          }

          if (functionName == 'home') {
            let prodsPerline = 4;
            prodsPerline = !isNaN(parseInt('4')) ? parseInt('4') : prodsPerline;
            data.produtos = data.produtos.slice(0, (prodsPerline * 2));
          }

        }

        wsMain.modules['product-list'].create[functionName](data, options, text, breve);
        try {
          document.querySelectorAll('*[data-wsjs-remove]').forEach(elm => elm.removeAttribute('data-wsjs-remove'));
        } catch (_) { }

      } else if (functionName == 'category') wsMain.modules['product-list'].showEmpty();
    });

    await Promise.all(promises);
    wsMain.modules['product-list'].appPromoRelampago();
    return true;
  },
  create: {
    group(returnJson) {
      this.list(returnJson?.grupos, 'group');
    },
    related(returnJson, options, text, breve) {
      this.list([{ codigo: 'relacionados', nome: text, breve: breve, produtos: returnJson }], 'related');
    },
    suggestion(returnJson, options, text, breve) {
      this.list([{ codigo: 'sugestoes', nome: text, breve: breve, produtos: returnJson }], 'suggestion');
    },
    previous(returnJson, options, text, breve) {
      this.list([{ codigo: 'ultimo', nome: text, breve: breve, produtos: returnJson?.produtos || returnJson }], 'previous');
    },
    home(returnJson, options, text, breve) {
      this.list([{ codigo: 'home', nome: text, breve: breve, produtos: returnJson.produtos }], 'home');
    },
    lancamento(returnJson, options, text, breve) {
      this.list([{ codigo: 'lancamento', nome: returnJson[0].nome, breve: "", produtos: returnJson[0].produtos }], 'lancamento');
    },
    async category(returnJson, options, text, breve, infinity = false) {

      if (infinity) {
        let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['product-list'].templateConfigs));
        let optionsUsed = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="category"]`), 'options') || {};

        templateConfigs = { ...templateConfigs, ...optionsUsed };

        let template = document.querySelector('[data-wsjs-module="prod-template"] > *');

        let arrProds = [];

        for (let z = 0; z < returnJson.produtos.length; z++) {
          let actualProd = returnJson.produtos[z];
          try {
            arrProds.push(wsMain.modules['prod-template'].createProd(actualProd, template.cloneNode(true), templateConfigs));
          } catch (e) {
            console.log('Erro com o produto');
            console.log(returnJson.produtos[z]);
            console.error(e);
          }
        }
        return arrProds;

      } else {
        this.list([{ codigo: 'category', nome: text, breve: '', produtos: returnJson.produtos }], 'category');
      }
    },
    list(arr, name) {
      try {
        function formatSequence(a, b) {
          const initialArr = [];
          for (let i = 0; i < a; i++) initialArr.push(i);

          const output = [];
          let lastIndex = 0;
          const chunkSize = a === b ? 1 : parseInt(a / b);

          for (let i = 0; i < b; i++) {
            const value = initialArr.slice(lastIndex, i == b - 1 && a / b % 1 ? lastIndex + chunkSize + 1 : lastIndex + chunkSize);
            output.push(value);
            lastIndex += chunkSize;
          }

          return output;
        }

        let templateConfigs = JSON.parse(JSON.stringify(wsMain.options['product-list'].templateConfigs));
        let optionsUsed = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}"]`), 'options') || {};

        templateConfigs = { ...templateConfigs, ...optionsUsed };

        let template = document.querySelector('[data-wsjs-module="prod-template"] > *');

        if (!Array.isArray(arr) && arr.length == 0) return;

        let groupSection = wsMain.tools.createElm('div');

        let arrSlider = [];

        arr.forEach((actualGroup, i) => {
          if (!Array.isArray(actualGroup.produtos) || actualGroup.produtos.length == 0) return;

          let groupHolder = wsMain.tools.createElm({
            type: 'section',
            attrs: {
              class: `prod-list prod-list-${name} ${templateConfigs.container != false ? 'container' : ''}`,
              id: 'code-list-' + actualGroup.codigo
            }
          });

          let divTexts = wsMain.tools.createElm({
            type: 'div',
            attrs: {
              class: 'prod-list-titles'
            }
          });

          let titleHiperLink = wsMain.tools.createElm({
            type: 'a',
            attrs: {
              class: 'prod-list-hiperlink',
              href: actualGroup.url && actualGroup.url != '' ? actualGroup.url : '#code-list-' + actualGroup.codigo
            }
          });

          function getTempInner(str) {
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = str;
            let strToReturn = tempDiv.innerHTML;
            tempDiv.remove();
            return strToReturn
          }

          let groupTitle = wsMain.tools.createElm({
            type: 'h2',
            innerHTML: actualGroup.nome || '',
            attrs: {
              class: 'prod-list-titles-title'
            }
          });

          if (name != 'group') {
            if (actualGroup.breve.trim() == '') {
              let dragBreve = document.querySelector(`template[data-wsjs-prod-list-template="${name}"]`)?.innerHTML.trim() || '';

              if (dragBreve.trim() != '') actualGroup.breve = dragBreve;

            }
          }

          let subtitle = wsMain.tools.createElm({
            type: 'p',
            innerHTML: actualGroup.breve || '',
            attrs: {
              class: 'prod-list-titles-subtitle'
            }
          });

          if (typeof nPanel != 'undefined' && nPanel.token) {
            groupTitle.setAttribute("data-wsjs-dragHolder", getTempInner("Digite aqui um t&iacute;tulo para sua listagem de produtos"));
            subtitle.setAttribute("data-wsjs-dragHolder", getTempInner("Digite aqui um par&aacute;grafo para chamar a aten&ccedil;&atilde;o de seus clientes"));
          }

          titleHiperLink.append(groupTitle);

          let groupList = wsMain.tools.createElm({
            type: 'div',
            attrs: {
              class: 'prod-list-holder'
            }
          });

          if (name != 'group' && (typeof nPanel != 'undefined' && nPanel.token)) {
            subtitle.setAttribute('contenteditable', 'plaintext-only')
            groupTitle.setAttribute('contenteditable', 'plaintext-only')
          }

          if (actualGroup.nome || (typeof nPanel != 'undefined' && nPanel.token)) divTexts.append(titleHiperLink);
          if (actualGroup.breve || (typeof nPanel != 'undefined' && nPanel.token)) divTexts.append(subtitle);

          let slideOptions = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}"]`), 'slide') || false;
          if (name == 'group' && !slideOptions && wsMain.modules['product-list'].cache) slideOptions = wsMain.modules['product-list'].cache;
          if (slideOptions && name == 'group') wsMain.modules['product-list'].cache = slideOptions;
          let slideSuccess;

          let prodsPerlineSet = name == 'category' ? '3' : '4';
          let prodsPerLineVar = !isNaN(parseInt(prodsPerlineSet)) ? prodsPerlineSet : 4;

          if (document.querySelector('#HD_VRS_MOBILE').value.toLowerCase() == 'true' && prodsPerLineVar >= 3) prodsPerLineVar = 2;

          if (!slideOptions && (!slideOptions.slides || !slideOptions.slides.perView)) {
            if (!isNaN(parseInt(prodsPerLineVar)) && parseInt(prodsPerLineVar) > 3 && !templateConfigs.imageSize) templateConfigs.imageSize = 'PEQ';
            if (!isNaN(parseInt(prodsPerLineVar)) && parseInt(prodsPerLineVar) <= 3 && !templateConfigs.imageSize) templateConfigs.imageSize = 'MED';
          }

          if (slideOptions && (!slideOptions.slides || !slideOptions.slides.perView)) {
            try {
              if (!isNaN(parseInt(prodsPerLineVar))) {
                if (!slideOptions.slides) slideOptions.slides = {}
                slideOptions.slides['perView'] = prodsPerLineVar
              }
            } catch (err) {
              console.log(err)
            }
          } else {
            try {
              // alert(optionsUsed['prods-perline'])
              prodsPerLineVar = optionsUsed['prods-perline'] ? optionsUsed['prods-perline'] : prodsPerLineVar;
              wsMain.globalData.infoLoja.perLineProds = prodsPerLineVar
            } catch (err) {
              console.log(err)
            }
          }

          try {
            if (slideOptions.slides.perView > 3 && !templateConfigs.imageSize) {
              templateConfigs.imageSize = 'PEQ';
            }
            if (slideOptions.slides.perView <= 3 && !templateConfigs.imageSize) {
              templateConfigs.imageSize = 'MED';
            }
          } catch (err) { }

          for (let z = 0; z < actualGroup.produtos.length; z++) {
            let actualProd = actualGroup.produtos[z];
            try {
              groupList.append(wsMain.modules['prod-template'].createProd(actualProd, template.cloneNode(true), templateConfigs));
            } catch (e) {
              console.log('Erro com o produto', actualGroup.produtos[z])
              console.error(e);
            }
          }

          if (slideOptions) {
            [slideSuccess, arrSlider[i]] = wsMain.tools.createSlide(groupList, slideOptions);
            wsMain['prod-slides'].push(arrSlider[i]);
            if (!slideSuccess) return;
          } else {
            groupList.style['gridTemplateColumns'] = `repeat(${prodsPerLineVar}, 1fr)`;
            divTexts.style['gridColumnEnd'] = `${parseInt(parseInt(prodsPerLineVar) + 1)}`;
          }


          groupHolder.append(groupList);
          if (actualGroup.breve || actualGroup.nome || (typeof nPanel != 'undefined' && nPanel.token)) groupList.append(divTexts);

          if (name != 'group') {
            let groupClone = wsMain.tools.createElm('div');
            groupClone.append(groupHolder);

            groupSection.append(groupClone);
            let attributes = wsMain.tools.getWsData(document.querySelector(`[data-wsjs-prod-list="${name}]"`), 'options');

            wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);

            if (name == 'category') {
              try {
                if (templateConfigs.infinity || wsAppsConfig?.infinityList) {
                  groupSection.setAttribute('data-wsjs-options', attributes);
                  groupList.setAttribute('data-wsjs-infinity', 'holder');

                  document.querySelector('[data-wsjs-pagination="container"]').innerHTML =
                    '<button class="button-second" data-wsjs-infinityButton>Carregar mais produtos</button>'

                  document.querySelector('[data-wsjs-pagination="container"] [data-wsjs-infinityButton]').addEventListener('click', wsMain.modules['category-filter'].infinityList);

                  if (templateConfigs.infinity == 'scroll' || wsAppsConfig?.infinityList == '2') {
                    document.addEventListener("scroll", wsMain.modules['category-filter'].infinityScroll);
                  }
                }


              } catch (err) {
                console.log(err)
              }
            }
          }

          if (name == 'group') {
            if (wsMain.modules['product-list'].groupLength == 1) {
              groupSection.append(groupHolder);

              wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);
            } else {
              let actualSequence = formatSequence(arr.length, wsMain.modules['product-list'].groupLength)[wsMain.modules['product-list'].actualGroup];
              if (actualSequence.indexOf(i) != -1) {
                groupSection.append(groupHolder);
              }

              if (actualSequence.indexOf(i) != -1 && actualSequence.indexOf(i) == actualSequence.length - 1) {
                wsMain.tools.replaceSpanTag(groupSection, `prod-list="${name}"`, false, false);

              }

            }
          }

          if (slideOptions) arrSlider[i].update();
        });

        // wsMain.modules['product-list'].actualGroup++;
        if (name == 'group') wsMain.modules['product-list'].actualGroup++;

        let existArrow = false;
        document.querySelectorAll('.prod-list').forEach(elm => {
          if (elm.querySelector('.arrow--prev')) existArrow = true;
        });

        if (existArrow) {
          document.querySelectorAll('.prod-list .need-offset').forEach(elm => {
            elm.classList.add('prod-list-offset');
            elm.classList.remove('need-offset');
          });
        }

        wsMain['prod-slides'].forEach(slider => slider.update());
      } catch (err) {
        console.log(err);
      }
    },
  },
  showEmpty() {
    let vrfSearch = document.querySelector('#LV_HD_BUSCA_VALOR');

    let container = wsMain.tools.createElm({
      type: 'div',
      attrs: {
        class: 'prod-list-empty'
      }
    });

    if (vrfSearch) container.innerHTML = document.querySelector('[data-wsjs-prod-list="template-empty-search"]').innerHTML.replace('{{value}}', vrfSearch.value);
    else container.innerHTML = document.querySelector('[data-wsjs-prod-list="template-empty-category"]').innerHTML;

    wsMain.tools.replaceSpanTag(container, document.querySelector('[data-wsjs-prod-list="category"]'));
  },
  appPromoRelampago() {
    if(typeof ws_promrelampago !== 'boolean') return
    if(!ws_promrelampago) return

    function calculateTimeRemaining(dateString) {
      const targetDate = new Date(dateString);
      const now = new Date();
      
      const differenceMs = targetDate - now;
    
      if (differenceMs <= 0) {
        return "";
      }
    
      const oneMinute = 60 * 1000;
      const oneHour = 60 * oneMinute;
      const oneDay = 24 * oneHour;
    
      if (differenceMs < oneMinute) {
        return ""; 
      } else if (differenceMs < oneHour) {
        const minutes = Math.floor(differenceMs / oneMinute);
        return `${minutes} minutes`;
      } else if (differenceMs < 48 * oneHour) {
        const hours = Math.floor(differenceMs / oneHour);
        return `${hours} horas`;
      } else {
        const days = Math.floor(differenceMs / oneDay);
        return `${days} dias`;
      }
    }
    
    function createPromoRelampagoElement(selector, data) {
      if(!selector || !data) return

      const prods = document.querySelectorAll(selector)

      prods.forEach(prod => {
        const div = document.createElement('div')
        div.classList.add('ws-promo-relampago-container')
        const timeRemaining = calculateTimeRemaining(data)
        div.innerHTML = `
        <p class="ws-promo-relampago__content prod-tags">Promo&ccedil;&atilde;o v&aacute;lida por ${timeRemaining}</p>
        `
  
        prod.appendChild(div)
      })
    }

    try {
      const etapa = document.querySelector("#HdEtapaLoja").value

      function appendPromoRelampagoElm(prodsArr) {
        if(!prodsArr || !prodsArr.length) return

        const products = [];
        const seenProd = new Set();

        prodsArr.forEach(obj => {
          if (!seenProd.has(obj.codigo)) {
            seenProd.add(obj.codigo);
            products.push(obj);
          }
        });

        if(!products) return

        products.forEach(prod => {
          const date =  prod?.precos?.preco_promocao_validade

          if(!date) return

          createPromoRelampagoElement(`[ws-prod-sku="${prod.codigo}"] .prod-showcase-image`, date)
        })
      }
   
      const etapaFuncAppPromoRelampago = {
        async HOME() {
          const listHomeProducts = wsMain?.globalData?.listHomeProds?.produtos
          const groupProducts = wsMain?.globalData?.listGroupProds?.grupos?.flatMap(obj => obj.produtos)
          const bruteProducts = []

          if(listHomeProducts) bruteProducts.push(listHomeProducts)
          if(groupProducts) bruteProducts.push(groupProducts)

          appendPromoRelampagoElm(bruteProducts.flat())
        },
        async PRODUTO() {
          const bruteProducts = wsMain?.globalData?.listRelatedProds 

          appendPromoRelampagoElm(bruteProducts)
        },
        async LISTAGEM() {
          const bruteProducts = wsMain?.globalData?.listCategoryProds?.produtos 

          appendPromoRelampagoElm(bruteProducts)
        },
      };
  
      etapaFuncAppPromoRelampago[etapa] != undefined ? etapaFuncAppPromoRelampago[etapa]() : '';
  
    } catch (err) {
      console.error(err);
    }
  }
});


wsMain.createModule({
  name: 'cart-drawer',
  function: 'get',
  virtualTemplate: {
    total: []
  },
  async get() {
    document.addEventListener('keydown', (event) => {
      if(event.key == 'Escape') {
        const cartOverlay = document.querySelector('[data-wsjs-cart="overlay-holder"]')
        if(cartOverlay.style.width == "100%") {
          wsMain.modules['cart-drawer'].changeState();
        }
      }
    });

    let data = await ApiWS.Calls.carrinho();    
    return wsMain.modules['cart-drawer'].refresh(data);
  },
  refresh(returnJson) {
    let btn = document.querySelector('[data-wsjs-cart="button"]');
    let btnOptions = wsMain.tools.getWsData(btn ,'options');
      let innerCart = '', innerProds = '';
      let itensHolder = document.querySelector('[data-wsjs-cart="items-holder"]'),
          defaultMsg = document.querySelector('[data-wsjs-cart="default-message"]'),
          totalItensInCart = document.querySelector('.cart-holder > [data-wsjs-cart="total"]') || document.querySelector('.cart-holder > .mobile-menu-side > [data-wsjs-cart="total"]'),
          bottomMsg = document.querySelector('[data-wsjs-cart="bottom-message"]');

      let linkCarrinho = `/carrinho`;

      document.querySelectorAll('[data-wsjs-cart="link"]').forEach(elm => elm.setAttribute('href', linkCarrinho));
      document.querySelectorAll('[data-wsjs-cart="total"]').forEach((elm, i) => {
        if (elm.innerHTML.indexOf('{{value}}') != -1) {
            wsMain.modules['cart-drawer'].virtualTemplate.total[i] = elm.innerHTML;
        }
        elm.innerHTML =  wsMain.modules['cart-drawer'].virtualTemplate.total[i].replace('{{value}}', wsMain.data.treatPrice(returnJson.total))
        try {
          elm.style.opacity = '';
        } catch(err) {}
        try {
          wsMain.addons.dataLoad(elm);
        } catch(err) {}
      });

      document.querySelectorAll('[data-wsjs-cart="items-holder"] > *:not([data-wsjs-cart="template"])').forEach(item => item.remove());
      if (Array.isArray(returnJson?.products) && returnJson?.products?.length > 0) {
          defaultMsg.setAttribute('style', 'display: none;');
          totalItensInCart ? totalItensInCart.removeAttribute('style') : '';
          itensHolder.classList.add('cartHasItens')
          document.querySelector('.cart-holder .cart-default-message a').style.display = '';
          returnJson.products.forEach(prod => {
            let template = document.querySelector('[data-wsjs-cart=template]').cloneNode(true);

            let variationIndex = 0;
            
            template.querySelectorAll('[data-wsjs-cart]').forEach(tag => {

              let tagName = tag.getAttribute('data-wsjs-cart');
              let value = prod[tagName];

              if (tagName == 'variation') {
                if (prod.attributes[variationIndex]) {
                  value = prod.attributes[variationIndex].type + ': ' + prod.attributes[variationIndex].value;
                  variationIndex++;
                } else return;
              }
              
              if (tagName == 'photo_url') {
                let img = wsMain.tools.createElm({
                  type: 'img',
                  lazyLoad: false,
                  attrs: {
                    alt: prod['name'],
                    src: value
                  }
                });

                wsMain.tools.replaceSpanTag(img, tag);

              } else {
                if (tagName == 'price') value = wsMain.data.treatPrice((value*prod.qtd));
                let spanDiv = wsMain.tools.createElm({type: 'span', innerHTML: value});
                
                wsMain.tools.replaceSpanTag(spanDiv, tag);
              }
            });

            template.setAttribute('href', prod.url);
            template.removeAttribute('data-wsjs-cart');
            template.setAttribute('class', 'cart-item-holder');

            itensHolder.append(template);
          });
          
          bottomMsg.removeAttribute('style');
          innerCart += `<a class='cart-button' href="${returnJson.link}">ver carrinho</a>`;

      } else {
        if (btnOptions.float == true ) {
          document.querySelector('.cart-holder .cart-default-message a').style.display = 'none';
        }
        
        defaultMsg.removeAttribute('style');
        totalItensInCart ? totalItensInCart.style.display = "none" : '';
        itensHolder.classList.remove('cartHasItens')
        bottomMsg.setAttribute('style', 'display: none;')
        while(itensHolder.childElementCount > 1) {
            itensHolder.lastChild.remove();
        }
      }

      if (document.querySelector('[data-wsjs-cart="counter"]')) document.querySelector('[data-wsjs-cart="counter"]').innerHTML = returnJson?.qtdItems || 0;

      // cart.innerHTML =  '<div class=cart-prod-container>' + innerProds + '</div>' + innerCart;

      if (btnOptions.float != true) {
        if (typeof nPanel == 'undefined') {
          btn.addEventListener('click', () => wsMain.modules['cart-drawer'].changeState());
        }
      } else {
        document.querySelector('[data-wsjs-cart="holder"]').classList.add('float');
        btn.setAttribute('href', linkCarrinho);
      }

      console.log(returnJson)
      if (!returnJson.qtdItems || returnJson.qtdItems == 0) {
        btn.classList.add('cart-empty')
        document.querySelector('[data-wsjs-cart="holder"]').classList.add('empty');
      } else {
        btn.classList.remove('cart-empty')
        document.querySelector('[data-wsjs-cart="holder"]').classList.remove('empty');
      }

        document.querySelector('[data-wsjs-cart="holder"]').style.display = '';
      return true;
  },
  changeState(force = false, onlyOpen = false) {
    try { wsMain.modules['cart-drawer'].get(); } catch(err) {('A chamada do carrinho n&atilde;o conseguiu ser realizada', err)}
    if(onlyOpen) {
      return;
    }
    let btn = document.querySelector('[data-wsjs-cart="button"]');
    let btnOptions = wsMain.tools.getWsData(btn ,'options');
    let cartHolder = document.querySelector(`[data-wsjs-cart="holder"]`);
    let body = document.querySelector('body');

    let state = btn.getAttribute('cart-state') == 'true';
    
    btn.setAttribute('cart-state', !state);

    if (btnOptions.mobile == true) {
      if (state) {
        cartHolder.style.transform = 'translateX(100%)';
        cartHolder.classList.remove('active');
      } else {
        cartHolder.classList.add('active');
        cartHolder.style.transform = 'translateX(0)';
      }
    } else {
      if (state || force && !document.querySelector('[data-wsjs-cart="overlay-holder"]').classList.contains('float')) {          
        body.style.left = '';
        body.style.overflow = '';
        cartHolder.style.right = '-48rem';
        document.querySelector('[data-wsjs-cart="overlay-holder"]').setAttribute('style', 'width: 0;height: 0;opacity:0');
      } else {
        body.style.overflow = 'hidden';
        body.style.left = '-48rem';
        cartHolder.style.right = '0';
        document.querySelector('[data-wsjs-cart="overlay-holder"]').setAttribute('style', 'width: 100%;height: 100%;opacity:0.5');
      }
    }
  }
});

!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(n="undefined"!=typeof globalThis?globalThis:n||self).KeenSlider=t()}(this,(function(){"use strict";var n=function(){return n=Object.assign||function(n){for(var t,i=1,e=arguments.length;i<e;i++)for(var r in t=arguments[i])Object.prototype.hasOwnProperty.call(t,r)&&(n[r]=t[r]);return n},n.apply(this,arguments)};function t(n,t,i){if(i||2===arguments.length)for(var e,r=0,o=t.length;r<o;r++)!e&&r in t||(e||(e=Array.prototype.slice.call(t,0,r)),e[r]=t[r]);return n.concat(e||Array.prototype.slice.call(t))}function i(n){return Array.prototype.slice.call(n)}function e(n,t){var i=Math.floor(n);return i===t||i+1===t?n:t}function r(){return Date.now()}function o(n,t,i){if(t="data-keen-slider-"+t,null===i)return n.removeAttribute(t);n.setAttribute(t,i||"")}function a(n,t){return t=t||document,"function"==typeof n&&(n=n(t)),Array.isArray(n)?n:"string"==typeof n?i(t.querySelectorAll(n)):n instanceof HTMLElement?[n]:n instanceof NodeList?i(n):[]}function u(n){n.raw&&(n=n.raw),n.cancelable&&!n.defaultPrevented&&n.preventDefault()}function s(n){n.raw&&(n=n.raw),n.stopPropagation&&n.stopPropagation()}function c(){var n=[];return{add:function(t,i,e,r){t.addListener?t.addListener(e):t.addEventListener(i,e,r),n.push([t,i,e,r])},input:function(n,t,i,e){this.add(n,t,function(n){return function(t){t.nativeEvent&&(t=t.nativeEvent);var i=t.changedTouches||[],e=t.targetTouches||[],r=t.detail&&t.detail.x?t.detail:null;return n({id:r?r.identifier?r.identifier:"i":e[0]?e[0]?e[0].identifier:"e":"d",idChanged:r?r.identifier?r.identifier:"i":i[0]?i[0]?i[0].identifier:"e":"d",raw:t,x:r&&r.x?r.x:e[0]?e[0].screenX:r?r.x:t.pageX,y:r&&r.y?r.y:e[0]?e[0].screenY:r?r.y:t.pageY})}}(i),e)},purge:function(){n.forEach((function(n){n[0].removeListener?n[0].removeListener(n[2]):n[0].removeEventListener(n[1],n[2],n[3])})),n=[]}}}function d(n,t,i){return Math.min(Math.max(n,t),i)}function l(n){return(n>0?1:0)-(n<0?1:0)||+n}function f(n){var t=n.getBoundingClientRect();return{height:e(t.height,n.offsetHeight),width:e(t.width,n.offsetWidth)}}function p(n,t,i,e){var r=n&&n[t];return null==r?i:e&&"function"==typeof r?r():r}function v(n){return Math.round(1e6*n)/1e6}function h(n){var t,i,e,r,o,a;function u(t){a||(a=t),s(!0);var o=t-a;o>e&&(o=e);var l=r[i];if(l[3]<o)return i++,u(t);var f=l[2],p=l[4],v=l[0],h=l[1]*(0,l[5])(0===p?1:(o-f)/p);if(h&&n.track.to(v+h),o<e)return d();a=null,s(!1),c(null),n.emit("animationEnded")}function s(n){t.active=n}function c(n){t.targetIdx=n}function d(){var n;n=u,o=window.requestAnimationFrame(n)}function l(){var t;t=o,window.cancelAnimationFrame(t),s(!1),c(null),a&&n.emit("animationStopped"),a=null}return t={active:!1,start:function(t){if(l(),n.track.details){var o=0,a=n.track.details.position;i=0,e=0,r=t.map((function(n){var t,i=a,r=null!==(t=n.earlyExit)&&void 0!==t?t:n.duration,u=n.easing,s=n.distance*u(r/n.duration)||0;a+=s;var c=e;return e+=r,o+=s,[i,n.distance,c,e,n.duration,u]})),c(n.track.distToIdx(o)),d(),n.emit("animationStarted")}},stop:l,targetIdx:null}}function m(n){var i,e,o,a,u,s,c,f,h,m,g,b,x,y,k=1/0,w=[],M=null,T=0;function C(n){_(T+n)}function E(n){var t=z(T+n).abs;return D(t)?t:null}function z(n){var i=Math.floor(Math.abs(v(n/e))),r=v((n%e+e)%e);r===e&&(r=0);var o=l(n),a=c.indexOf(t([],c,!0).reduce((function(n,t){return Math.abs(t-r)<Math.abs(n-r)?t:n}))),u=a;return o<0&&i++,a===s&&(u=0,i+=o>0?1:-1),{abs:u+i*s*o,origin:a,rel:u}}function I(n,t,i){var e;if(t||!S())return A(n,i);if(!D(n))return null;var r=z(null!=i?i:T),o=r.abs,a=n-r.rel,u=o+a;e=A(u);var c=A(u-s*l(a));return(null!==c&&Math.abs(c)<Math.abs(e)||null===e)&&(e=c),v(e)}function A(n,t){if(null==t&&(t=v(T)),!D(n)||null===n)return null;n=Math.round(n);var i=z(t),r=i.abs,o=i.rel,a=i.origin,u=O(n),d=(t%e+e)%e,l=c[a],f=Math.floor((n-(r-o))/s)*e;return v(l-d-l+c[u]+f+(a===s?e:0))}function D(n){return L(n)===n}function L(n){return d(n,h,m)}function S(){return a.loop}function O(n){return(n%s+s)%s}function _(t){var i;i=t-T,w.push({distance:i,timestamp:r()}),w.length>6&&(w=w.slice(-6)),T=v(t);var e=H().abs;if(e!==M){var o=null!==M;M=e,o&&n.emit("slideChanged")}}function H(t){var r=t?null:function(){if(s){var n=S(),t=n?(T%e+e)%e:T,i=(n?T%e:T)-u[0][2],r=0-(i<0&&n?e-Math.abs(i):i),c=0,d=z(T),f=d.abs,p=d.rel,v=u[p][2],k=u.map((function(t,i){var o=r+c;(o<0-t[0]||o>1)&&(o+=(Math.abs(o)>e-1&&n?e:0)*l(-o));var u=i-p,d=l(u),h=u+f;n&&(-1===d&&o>v&&(h+=s),1===d&&o<v&&(h-=s),null!==g&&h<g&&(o+=e),null!==b&&h>b&&(o-=e));var m=o+t[0]+t[1],x=Math.max(o>=0&&m<=1?1:m<0||o>1?0:o<0?Math.min(1,(t[0]+o)/t[0]):(1-o)/t[0],0);return c+=t[0]+t[1],{abs:h,distance:a.rtl?-1*o+1-t[0]:o,portion:x,size:t[0]}}));return f=L(f),p=O(f),{abs:L(f),length:o,max:y,maxIdx:m,min:x,minIdx:h,position:T,progress:n?t/e:T/o,rel:p,slides:k,slidesLength:e}}}();return i.details=r,n.emit("detailsChanged"),r}return i={absToRel:O,add:C,details:null,distToIdx:E,idxToDist:I,init:function(t){if(function(){if(a=n.options,u=(a.trackConfig||[]).map((function(n){return[p(n,"size",1),p(n,"spacing",0),p(n,"origin",0)]})),s=u.length){e=v(u.reduce((function(n,t){return n+t[0]+t[1]}),0));var t,i=s-1;o=v(e+u[0][2]-u[i][0]-u[i][2]-u[i][1]),c=u.reduce((function(n,i){if(!n)return[0];var e=u[n.length-1],r=n[n.length-1]+(e[0]+e[2])+e[1];return r-=i[2],n[n.length-1]>r&&(r=n[n.length-1]),r=v(r),n.push(r),(!t||t<r)&&(f=n.length-1),t=r,n}),null),0===o&&(f=0),c.push(v(e))}}(),!s)return H(!0);var i;!function(){var t=n.options.range,i=n.options.loop;g=h=i?p(i,"min",-1/0):0,b=m=i?p(i,"max",k):f;var e=p(t,"min",null),r=p(t,"max",null);e&&(h=e),r&&(m=r),x=h===-1/0?h:n.track.idxToDist(h||0,!0,0),y=m===k?m:I(m,!0,0),null===r&&(b=m),p(t,"align",!1)&&m!==k&&0===u[O(m)][2]&&(y-=1-u[O(m)][0],m=E(y-T)),x=v(x),y=v(y)}(),i=t,Number(i)===i?C(A(L(t))):H()},to:_,velocity:function(){var n=r(),t=w.reduce((function(t,i){var e=i.distance,r=i.timestamp;return n-r>200||(l(e)!==l(t.distance)&&t.distance&&(t={distance:0,lastTimestamp:0,time:0}),t.time&&(t.distance+=e),t.lastTimestamp&&(t.time+=r-t.lastTimestamp),t.lastTimestamp=r),t}),{distance:0,lastTimestamp:0,time:0});return t.distance/t.time||0}}}function g(n){var t,i,e,r,o,a,u;function s(n){return 2*n}function c(n){return d(n,a,u)}function f(n){return 1-Math.pow(1-n,3)}function p(){m();var t="free-snap"===n.options.mode,i=n.track,a=i.velocity();e=l(a);var u=n.track.details,d=[];if(a||!t){var p=v(a),h=p.dist,g=p.dur;if(g=s(g),h*=e,t){var b=i.idxToDist(i.distToIdx(h),!0);b&&(h=b)}d.push({distance:h,duration:g,easing:f});var x=u.position,y=x+h;if(y<r||y>o){var k=y<r?r-x:o-x,w=0,M=a;if(l(k)===e){var T=Math.min(Math.abs(k)/Math.abs(h),1),C=function(n){return 1-Math.pow(1-n,1/3)}(T)*g;d[0].earlyExit=C,M=a*(1-T)}else d[0].earlyExit=0,w+=k;var E=v(M,100),z=E.dist*e;n.options.rubberband&&(d.push({distance:z,duration:s(E.dur),easing:f}),d.push({distance:-z+w,duration:500,easing:f}))}n.animator.start(d)}else n.moveToIdx(c(u.abs),!0,{duration:500,easing:function(n){return 1+--n*n*n*n*n}})}function v(n,t){void 0===t&&(t=1e3);var i=147e-9+(n=Math.abs(n))/t;return{dist:Math.pow(n,2)/i,dur:n/i}}function h(){var t=n.track.details;t&&(r=t.min,o=t.max,a=t.minIdx,u=t.maxIdx)}function m(){n.animator.stop()}n.on("updated",h),n.on("optionsChanged",h),n.on("created",h),n.on("dragStarted",(function(){m(),t=i=n.track.details.abs})),n.on("dragEnded",(function(){var e=n.options.mode;"snap"===e&&function(){var e=n.track,a=n.track.details,u=a.position,s=l(e.velocity());(u>o||u<r)&&(s=0);var d=t+s;0===a.slides[e.absToRel(d)].portion&&(d-=s),t!==i&&(d=i),l(e.idxToDist(d,!0))!==s&&(d+=s),d=c(d);var f=e.idxToDist(d,!0);n.animator.start([{distance:f,duration:500,easing:function(n){return 1+--n*n*n*n*n}}])}(),"free"!==e&&"free-snap"!==e||p()})),n.on("dragged",(function(){i=n.track.details.abs}))}function b(n){var t,i,e,r,f,p,v,h,m,g,b,x,y,k,w,M,T,C,E=c();function z(a){if(p&&h===a.id){var c=L(a);if(m){if(!D(a))return A(a);g=c,m=!1,n.emit("dragChecked")}if(M)return g=c;u(a);var y=function(t){if(T===-1/0&&C===1/0)return t;var e=n.track.details,o=e.length,a=e.position,u=d(t,T-a,C-a);if(0===o)return 0;if(!n.options.rubberband)return u;if(a<=C&&a>=T)return t;if(a<T&&i>0||a>C&&i<0)return t;var s=(a<T?a-T:a-C)/o,c=r*o,l=Math.abs(s*c),p=Math.max(0,1-l/f*2);return p*p*t}(v(g-c)/r*e);i=l(y);var k=n.track.details.position;(k>T&&k<C||k===T&&i>0||k===C&&i<0)&&s(a),b+=y,!x&&Math.abs(b*r)>5&&(x=!0,o(t,"moves","")),n.track.add(y),g=c,n.emit("dragged")}}function I(t){!p&&n.track.details&&n.track.details.length&&(x=!1,b=0,p=!0,m=!0,h=t.id,D(t),g=L(t),n.emit("dragStarted"))}function A(i){p&&h===i.idChanged&&(o(t,"moves",null),p=!1,n.emit("dragEnded"))}function D(n){var t=S(),i=t?n.y:n.x,e=t?n.x:n.y,r=void 0!==y&&void 0!==k&&Math.abs(k-e)<=Math.abs(y-i);return y=i,k=e,r}function L(n){return S()?n.y:n.x}function S(){return n.options.vertical}function O(){r=n.size,f=S()?window.innerHeight:window.innerWidth;var t=n.track.details;t&&(T=t.min,C=t.max)}function _(){if(E.purge(),n.options.drag&&!n.options.disabled){var i;i=n.options.dragSpeed||1,v="function"==typeof i?i:function(n){return n*i},e=n.options.rtl?-1:1,O(),t=n.container,function(){var n="data-keen-slider-clickable";a("[".concat(n,"]:not([").concat(n,"=false])"),t).map((function(n){E.add(n,"mousedown",s),E.add(n,"touchstart",s)}))}(),E.add(t,"dragstart",(function(n){u(n)})),E.input(t,"ksDragStart",I),E.input(t,"ksDrag",z),E.input(t,"ksDragEnd",A),E.input(t,"mousedown",I),E.input(t,"mousemove",z),E.input(t,"mouseleave",A),E.input(t,"mouseup",A),E.input(t,"touchstart",I,{passive:!0}),E.input(t,"touchmove",z,{passive:!1}),E.input(t,"touchend",A),E.input(t,"touchcancel",A),E.add(window,"wheel",(function(n){p&&u(n)}));var r="data-keen-slider-scrollable";a("[".concat(r,"]:not([").concat(r,"=false])"),n.container).map((function(n){return function(n){var t;E.input(n,"touchstart",(function(n){t=L(n),M=!0,w=!0}),{passive:!0}),E.input(n,"touchmove",(function(i){var e=S(),r=e?n.scrollHeight-n.clientHeight:n.scrollWidth-n.clientWidth,o=t-L(i),a=e?n.scrollTop:n.scrollLeft,s=e&&"scroll"===n.style.overflowY||!e&&"scroll"===n.style.overflowX;if(t=L(i),(o<0&&a>0||o>0&&a<r)&&w&&s)return M=!0;w=!1,u(i),M=!1})),E.input(n,"touchend",(function(){M=!1}))}(n)}))}}n.on("updated",O),n.on("optionsChanged",_),n.on("created",_),n.on("destroyed",E.purge)}function x(n){var t,i,e=null;function r(t,i,e){n.animator.active?a(t,i,e):requestAnimationFrame((function(){return a(t,i,e)}))}function o(){r(!1,!1,i)}function a(i,r,o){var a=0,u=n.size,d=n.track.details;if(d&&t){var l=d.slides;t.forEach((function(n,t){if(i)!e&&r&&s(n,null,o),c(n,null,o);else{if(!l[t])return;var d=l[t].size*u;!e&&r&&s(n,d,o),c(n,l[t].distance*u-a,o),a+=d}}))}}function u(t){return"performance"===n.options.renderMode?Math.round(t):t}function s(n,t,i){var e=i?"height":"width";null!==t&&(t=u(t)+"px"),n.style["min-"+e]=t,n.style["max-"+e]=t}function c(n,t,i){if(null!==t){t=u(t);var e=i?t:0;t="translate3d(".concat(i?0:t,"px, ").concat(e,"px, 0)")}n.style.transform=t,n.style["-webkit-transform"]=t}function d(){t&&(a(!0,!0,i),t=null),n.on("detailsChanged",o,!0)}function l(){r(!1,!0,i)}function f(){d(),i=n.options.vertical,n.options.disabled||"custom"===n.options.renderMode||(e="auto"===p(n.options.slides,"perView",null),n.on("detailsChanged",o),(t=n.slides).length&&l())}n.on("created",f),n.on("optionsChanged",f),n.on("beforeOptionsChanged",(function(){d()})),n.on("updated",l),n.on("destroyed",d)}function y(t,i){return function(e){var r,u,s,d,l,v,h=c();function m(n){var t;o(e.container,"reverse","rtl"!==(t=e.container,window.getComputedStyle(t,null).getPropertyValue("direction"))||n?null:""),o(e.container,"v",e.options.vertical&&!n?"":null),o(e.container,"disabled",e.options.disabled&&!n?"":null)}function g(){b()&&M()}function b(){var t=null;if(d.forEach((function(n){n.matches&&(t=n.__media)})),t===r)return!1;r||e.emit("beforeOptionsChanged"),r=t;var i=t?s.breakpoints[t]:s;return e.options=n(n({},s),i),m(),I(),A(),C(),!0}function x(n){var t=f(n);return(e.options.vertical?t.height:t.width)/e.size||1}function y(){return e.options.trackConfig.length}function k(t){for(var o in r=!1,s=n(n({},i),t),h.purge(),u=e.size,d=[],s.breakpoints||[]){var a=window.matchMedia(o);a.__media=o,d.push(a),h.add(a,"change",g)}h.add(window,"orientationchange",z),h.add(window,"resize",E),b()}function w(n){e.animator.stop();var t=e.track.details;e.track.init(null!=n?n:t?t.abs:0)}function M(n){w(n),e.emit("optionsChanged")}function T(n,t){if(n)return k(n),void M(t);I(),A();var i=y();C(),y()!==i?M(t):w(t),e.emit("updated")}function C(){var n=e.options.slides;if("function"==typeof n)return e.options.trackConfig=n(e.size,e.slides);for(var t=e.slides,i=t.length,r="number"==typeof n?n:p(n,"number",i,!0),o=[],a=p(n,"perView",1,!0),u=p(n,"spacing",0,!0)/e.size||0,s="auto"===a?u:u/a,c=p(n,"origin","auto"),d=0,l=0;l<r;l++){var f="auto"===a?x(t[l]):1/a-u+s,v="center"===c?.5-f/2:"auto"===c?0:c;o.push({origin:v,size:f,spacing:u}),d+=f}if(d+=u*(r-1),"auto"===c&&!e.options.loop&&1!==a){var h=0;o.map((function(n){var t=d-h;return h+=n.size+u,t>=1||(n.origin=1-t-(d>1?0:1-d)),n}))}e.options.trackConfig=o}function E(){I();var n=e.size;e.options.disabled||n===u||(u=n,T())}function z(){E(),setTimeout(E,500),setTimeout(E,2e3)}function I(){var n=f(e.container);e.size=(e.options.vertical?n.height:n.width)||1}function A(){e.slides=a(e.options.selector,e.container)}e.container=(v=a(t,l||document)).length?v[0]:null,e.destroy=function(){h.purge(),e.emit("destroyed"),m(!0)},e.prev=function(){e.moveToIdx(e.track.details.abs-1,!0)},e.next=function(){e.moveToIdx(e.track.details.abs+1,!0)},e.update=T,k(e.options)}}return function(n,i,e){try{return function(n,t){var i,e={};return i={emit:function(n){e[n]&&e[n].forEach((function(n){n(i)}));var t=i.options&&i.options[n];t&&t(i)},moveToIdx:function(n,t,e){var r=i.track.idxToDist(n,t);if(r){var o=i.options.defaultAnimation;i.animator.start([{distance:r,duration:p(e||o,"duration",500),easing:p(e||o,"easing",(function(n){return 1+--n*n*n*n*n}))}])}},on:function(n,t,i){void 0===i&&(i=!1),e[n]||(e[n]=[]);var r=e[n].indexOf(t);r>-1?i&&delete e[n][r]:i||e[n].push(t)},options:n},function(){if(i.track=m(i),i.animator=h(i),t)for(var n=0,e=t;n<e.length;n++)(0,e[n])(i);i.track.init(i.options.initial||0),i.emit("created")}(),i}(i,t([y(n,{drag:!0,mode:"snap",renderMode:"precision",rubberband:!0,selector:".keen-slider__slide"}),x,b,g],e||[],!0))}catch(n){console.error(n)}}}));

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



function moduloIdade() {
    const cookie = localStorage.getItem("modulo-idade-container")
    if(cookie == "yes") return

    const background = wsMain.tools.createElm({
        type: 'div',
        attrs: {
            class: 'modulo-idade-bg',
        },
        innerHTML: `
        <div class="modulo-idade-container">
            <div class="modulo-idade-disclaimer">
                <p>Este site possui produtos proibidos para pessoas menores de 18 anos.</p>
                <p>Voc&ecirc; possui mais de 18 anos?</p>
            </div>
            <div class="modulo-idade-buttons">
                <button choice="no">Não</button>
                <button choice="yes">Sim</button>
            </div>
        </div>
        `
    })

    document.body.append(background)
    document.body.classList.add('modulo-ativo')

    const btns = document.querySelectorAll('.modulo-idade-container .modulo-idade-buttons button')
    
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const attr = btn.getAttribute('choice')

            if(attr == "yes") {
                localStorage.setItem("modulo-idade-container", "yes");
                
                const background = document.querySelector('.modulo-idade-bg')

                background.classList.add('hidden-modulo')
                document.body.classList.remove('modulo-ativo')
                
                return
            } else if(attr == "no") {
                window.location.href = "http://www.google.com.br";
            }
            
        })
    })
}

try {
    moduloIdade()
} catch (error) {
    console.log(error)
}

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
