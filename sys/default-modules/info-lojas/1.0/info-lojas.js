wsMain.createModule({
    name: 'info-lojas',
    function: 'get',
    subFunctions: {
        metaDescription(obj, options, text) {
          let innerElement = obj.seo['meta_description'];

          let p = wsMain.tools.createElm({
            type: 'p',
            innerHTML: innerElement
          });

          return p;
        },
        socialMidia(obj, options, text) {
            let social = obj.redes_sociais;
            if (!social) return;
            
            let ulHolder = wsMain.tools.createElm('ul');

            let socialMidiaConfigs = {
                facebook: 'https://www.facebook.com.br/',
                twitter: 'https://www.twitter.com/',
                linkedin: 'https://www.linkedin.com/',
                instagram: 'https://www.instagram.com/',
                youtube: 'https://www.youtube.com/',
                pinterest: 'https://www.pinterest.com/',
                tiktok: 'https://www.tiktok.com/'
            };            

            Object.keys(social).forEach(key => {
              if (!social[key]) return;
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
                    target: '_blank',
                      href: socialMidiaConfigs[key] + social[key]
                  }
              });
              let itemHolder = wsMain.tools.createElm('li');
                  itemHolder.append(itemLink);
                  ulHolder.append(itemHolder);
            });

            return ulHolder;
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
              href: 'https://api.whatsapp.com/send?phone=55' + phone,
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
          let institutional = obj.menuinstitucional;

          if (!Array.isArray(institutional) || institutional.length == 0) return false;

          let ul = wsMain.tools.createElm('ul');

          institutional.forEach(item => {
            let hyperLink = wsMain.tools.createElm({
              type: 'a',
              innerHTML: item['titulo'],
              attrs: {
                href: item.url
              }
            });

            let elm = wsMain.tools.createElm('li');
            try {
              if (hyperLink.innerText.trim() == document.querySelector('.institutional-container h1').innerText.trim()) elm.classList.add('actual');
            } catch(_) {}

            elm.append(hyperLink);
            ul.append(elm);
          });

          return ul;
        },
        paymentBadges(obj, options, text) {
          let badges = obj.estrutura?.bandeiras_pagamento;

          if (!badges) return false;
          
          let arrBadges = badges.split('|').filter(item => item ? true : false);

          if(!Array.isArray(arrBadges) || arrBadges.length == 0) return false;

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

          let innerElement = '';
          mainArr.forEach(wordHolder => {
            let placeholderArr = new RegExp(/{(.*){(.*)}(.*)}/gmi).exec(wordHolder);
            let before = placeholderArr[1];
            let word = placeholderArr[2];
            let after = placeholderArr[3];

            if (data[word]) innerElement += before + data[word] + after;
          });

          if (!innerElement) return false;

          let span = wsMain.tools.createElm({
            type: 'span',
            innerHTML: innerElement
          });

          return span;
          
        }
      },
    async get() {
        let data = await ApiWS.Calls.infosLojas();

        return wsMain.modules[this.funcName].create(data);
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
