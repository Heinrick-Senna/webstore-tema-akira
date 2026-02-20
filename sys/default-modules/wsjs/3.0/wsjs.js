/* 08-07-2022 */
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
            async home() {
                let name = "/produtos/home",
                    obj = {},
                    cookieArr = ['M30','M10','M30'], 
                    cookieNameAdjust = document.querySelector("#VarsCategorias")?.value;
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
                    wsMain.setGlobalData('listHomeProds', data);
                return data;
            },
            async previous() {
                let Ultimos = ApiWS.Cookie.get("WS_LOJA_" + ApiWS.LV);
                if (!Ultimos || Ultimos.trim() == '') return;
                let name = "/produtos/ultimos",
                    obj = {
                        ultmos: Ultimos
                    },
                    cookieArr = [false, 'M', false];
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                    wsMain.setGlobalData('listLastProds', data);
                return data;
            },
            async related() {
                let name = "/produtos/relacionados",
                    obj = {
                        Produto: document.querySelector("#LV_HD_PROD_ID").value
                    },
                    cookieArr = ['H','M10','H'];
                    cookieNameAdjust = obj.Produto;
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
                    wsMain.setGlobalData('listRelatedProds', data);
                return data;
            },
            async spotlight() {
                let name = "/produtos/destaques",
                    obj = {},
                    cookieArr = ['H','M30','H'];
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                    wsMain.setGlobalData('listHighlightProds', data);
                return data;
            },
            async group() {
                let name = "/produtos/grupos",
                    obj = {},
                    cookieArr = ['H','H','H'];
                let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                    wsMain.setGlobalData('listGroupProds', data);
                return data;
            },
            async category() {
              let name = "/produtos/listagem",
              obj = {
                SubEtapaWs: document.querySelector("#HdSubEtapa")?.value || '',
                InfoListagem: document.querySelector("#HdVarInfoListagem")?.value,
                VarsFiltrosListagem: document.querySelector("#HdFiltrosListagem")?.value || '',
                VarsFiltrosListagemJson: document.querySelector("#HdFiltrosListagemJson")?.value || '',
                num_pagina: new URL(window.location).searchParams.get('pagina') || 1
              },
              cookieArr = [false, "M10", false];
              let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
              wsMain.setGlobalData('listCategoryProds', data);
              return data;
            }
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
            let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
                wsMain.setGlobalData('infoLoja', data);
            return data;
        },
        async manufactures() {
            let name = "/fabricantes",
                obj = {},
                cookieArr = ['D', 'H', 'D'];
            let data = await ApiWS.Calls.newCall(name, obj, cookieArr);
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
                cookieNameAdjust = obj.InfoListagem
            let data = await ApiWS.Calls.newCall(name, obj, cookieArr, cookieNameAdjust);
                wsMain.setGlobalData('infoBanners', data);
            return data;
        },
        async carrinho() {
          let url = endPointRestCalls + `/CheckoutSmart/CarrinhoSmart.aspx?tipo=CarrinhoOnPageVrs2&LV_ID=${ApiWS.LV}&LvToken=${ApiWS.Token + WsParamAdds}`;
      
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
            let data = await ApiWS.Calls.newCall(name, obj, cookieArr);

            let cookieNameAdjust = `${obj.VarsCategorias}_${obj.DptTipo}_${obj.DptId}_${obj.VarsFiltrosListagem}`
                wsMain.setGlobalData('infoCategory', data, cookieNameAdjust);
            return data;
        },
        async CadastraNews(Nome, Email) {
          if (Nome == "") return {status: 500, mensagem: "Preencha o campo nome."};
          if (Email == "") return {status: 500, mensagem: "Preencha o campo e-mail."};
          let name = '/cadastra-news',
          obj = {
              Nome: Nome,
              Email: Email
          },
          cookieArr = [false, false, false];
          let data = await ApiWS.Calls.newCall(name, obj, cookieArr, false, 'POST');
          return data;
        },
        async newCall(name, obj = false, cookieArr, cookieNameAdjust, method = 'GET') {
            let cookieName;
            if (cookieArr[0] && ApiWS.LVdashview != 1) {
                cookieName = name.toLowerCase().replace(/\//g, '') + ApiWS.LV.replace(/_|\|/g,'');
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
        
            if (obj && typeof obj == 'object') params = {...params, ...obj};
        
            // Object.keys(params).forEach(p => uri.searchParams.append(p, params[p]));
            
            uri += '?'
            Object.keys(params).forEach(p => {
              uri += p + '=' + params[p] + "&"
            });
            uri = uri.substring(0, uri.length - 1);
                
            let response = await fetch(uri, {method: method});

            let data = await response.text(); 
            let jsonToReturn;
            ApiWS.logs.restCalls.push({
              'url': uri,
              'response': data,
              'method': method
            })
            try {
              jsonToReturn = JSON.parse(data);
            } catch(err) {
              console.log(err);
              jsonToReturn = {};
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
        var GetTypeCdn = $("#HD_TYPE_CDN").val();
        var GetTypeCdnApi = $("#HD_TYPE_CDN_API").val();
        var CdnOption = $("#HD_CDN_OPT").val();
        var CdnKind = $("#HD_CDN_KIND").val();
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
                            UrlApi = GetTypeCdnApi;
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
