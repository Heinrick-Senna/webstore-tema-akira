wsMain.createModule({
    name: 'pag-produto',
    vrs: '20-03-2025-0001',
    function: 'get',
    onlyAfter: 'info-lojas',
    options: {
        slideView: typeof PagProdRules_slideView != 'undefined' ? PagProdRules_slideView : 'default',
        slide: {
            dots: {
                breakpoints: {
                    '(min-width: 1280px)': {
                        slides: {
                            perView: 4,
                            spacing: 10
                        }
                    },
                    '(min-width: 1024px) and (max-width: 1279px)': {
                        slides: {
                            perView: 4,
                            spacing: 7
                        }
                    },
                    '(max-width: 1023px)': {
                        slides: {
                            perView: 3.5,
                            spacing: 5
                        }
                    }
                }
            }
        }
    },
    subFunctions: {
        progressiveDescount(prod, options, text) {
            let descount = prod.precos['desconto_progressivo'] || prod.precos['desconto_progressico'];
            let priceToPut = prod.precos['preco_promocao'] || prod.precos['preco'];

            if (!descount || descount.length == 0) return;

            const container = wsMain.tools.createElm('div'),
                table = wsMain.tools.createElm('table'),
                tbody = wsMain.tools.createElm('tbody');

            container.innerHTML = text;
            table.appendChild(tbody)
            container.appendChild(table);

            if (options.view == 'alternative') {
                tbody.classList.add('alternative');

                let headerLine = wsMain.tools.createElm('tr');

                let firstSpan = wsMain.tools.createElm('th');
                let secondSpan = wsMain.tools.createElm('th');

                firstSpan.innerHTML = 'Leve';
                secondSpan.innerHTML = 'Ganhe';

                headerLine.append(firstSpan);
                headerLine.append(secondSpan);

                tbody.append(headerLine);
            }

            descount.forEach(item => {
                let newLine = wsMain.tools.createElm('tr');

                let firstSpan = wsMain.tools.createElm('td');
                let secondSpan = wsMain.tools.createElm('td');
                let thirdSpan = wsMain.tools.createElm('td');

                if (options.view == 'alternative') {
                    firstSpan.innerHTML = item['acima_de'];
                } else {
                    firstSpan.innerHTML = 'A partir de ' + item['acima_de'];
                }

                if (item['tipo_desconto'].toLowerCase() == 'p') {
                    secondSpan.innerHTML = item['desconto'] + '% OFF';
                } else {
                    secondSpan.innerHTML = wsMain.data.treatPrice(item['desconto']) + ' OFF';
                }

                thirdSpan.innerHTML = wsMain.data.treatPrice(priceToPut - (priceToPut * (item['desconto'] / 100)));

                newLine.append(firstSpan);
                newLine.append(secondSpan);

                if (options.view != 'alternative') {
                    newLine.append(thirdSpan);
                }

                tbody.append(newLine);
            });

            return container;
        },
        dots(prod, options, text) {
            const copyProd = structuredClone(prod);


            const hasPhotosAnchor = !!document.querySelector('.prod-photo-container [data-wsjs-product="photos"]');



            if (Array.isArray(copyProd.fotos) && copyProd.fotos.length > 1) {
                if (hasPhotosAnchor) {
                    copyProd.fotos = copyProd.fotos.slice(1);
                } else {

                    copyProd.fotos = copyProd.fotos.slice();
                }
            } else {
                copyProd.fotos = Array.isArray(copyProd.fotos) ? copyProd.fotos.slice() : [];
            }

            const photoType = options?.photoType ? options.photoType : 'thumb';
            const dotsDiv = wsMain.modules['pag-produto'].subFunctions.createSlide(copyProd, options, photoType, false);
            dotsDiv.setAttribute('data-wsjs-product', 'dots');




            try {
                const imgs = dotsDiv.querySelectorAll('img');
                imgs.forEach((img, i) => {
                    const realIdx = hasPhotosAnchor ? (i + 1) : i;
                    img.setAttribute('data-idx', String(realIdx));
                });
            } catch (e) { }

            return dotsDiv;
        },

        photos(prod, options, text) {
            const copyProd = structuredClone(prod)
            if (options?.list && prod?.fotos && Array.isArray(prod.fotos) && prod.fotos.length > 0) {
                copyProd['fotos'] = [copyProd.fotos[0]]
            }
            let photoType = options?.photoType ? options.photoType : 'normal';
            let photosDiv = wsMain.modules['pag-produto'].subFunctions.createSlide(copyProd, options, photoType, false);
            photosDiv.setAttribute('data-wsjs-product', 'photos');
            return photosDiv;
        },
        name(prod, options, text) {
            if (!prod.nome) return;
            return wsMain.tools.createElm({ type: 'h1', innerHTML: prod.nome });
        },
        breadcrumb(prod, options, text) {
            let arr = prod.migalha;
            let div = wsMain.tools.createElm('div');
            if (text) arr[0].nome = text;

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
        manufacturer(prod, options, text) {
            let obj = prod.fabricante;

            if (!obj.nome) return false;

            let span = wsMain.tools.createElm('span'),
                hiperLink = wsMain.tools.createElm({
                    type: 'a',
                    innerHTML: `${text ? text : ''}${obj.nome}`,
                    attrs: {
                        href: obj.url
                    }
                });

            span.append(hiperLink);
            return span;
        },
        code(prod, options, text) {
            return wsMain.tools.createElm({ type: 'span', innerHTML: prod.codigo });
        },
        priceOf(prod, options, text) {
            let priceToPut = prod.precos['preco_promocao'] || prod.precos['preco'];
            if (!priceToPut) return;
            let priceInner = wsMain.data.treatPrice(priceToPut);
            if ((options.startingOff == true || wsMain.options['pag-produto'].startingOff == true) && wsMain.options['pag-produto'].isVariation != true && wsMain.globalData.infoProduto.variacoes && wsMain.globalData.infoProduto.variacoes.length > 0) {
                let priceAbove;
                wsMain.globalData.infoProduto.variacoes.forEach(variation => {
                    if (variation.preco > priceToPut) priceAbove = true;
                });
                if (priceAbove) priceInner = '<span class="price-startingOff">A partir de </span>' + priceInner;
            }
            return wsMain.tools.createElm({ type: 'span', innerHTML: priceInner });
        },
        priceFor(prod, options, text) {
            if (!prod.precos['preco_promocao']) return false;
            return wsMain.tools.createElm({ type: 'span', innerHTML: wsMain.data.treatPrice(prod.precos['preco']) });
        },
        priceCash(prod, options, text) {
            let price = prod.precos['preco_promocao'] || prod.precos['preco'];
            let d = prod.precos['desconto_avista'];

            if (d && d > 0) price = price - (price * (d / 100));

            return d && parseInt(d) > 0 ? wsMain.tools.createElm({ type: 'span', innerHTML: `${wsMain.data.treatPrice(price)} ${text}` }) : false;
        },
        tagDescount(prod, options, text) {
            let promoPrice = prod.precos['preco_promocao'];
            if (!promoPrice) return false;

            let defaultPrice = prod.precos['preco'];

            let tagText = Math.round(100 - (((promoPrice) * 100) / defaultPrice)) + '%';
            let tag = wsMain.tools.createElm({
                type: 'span',
                innerHTML: text.replace('{{value}}', tagText)
            });

            return tag
        },
        tagShippingFree(prod, options, text) {
            return prod.fretegratis ? wsMain.tools.createElm({ type: 'span', innerHTML: text }) : false;
        },
        tagNew(prod, options, text) {
            return prod.lancamento ? wsMain.tools.createElm({ type: 'span', innerHTML: text }) : false;
        },
        shortDesc(prod, options, text) {
            if (!prod.breve || prod.breve == '') return false;

            let textParagraph = wsMain.tools.createElm({ type: 'p', innerHTML: prod.breve });

            if (options.link) {
                let div = wsMain.tools.createElm('div');

                let hiperLink = wsMain.tools.createElm({
                    type: 'a',
                    innerHTML: text,
                    attrs: {
                        class: 'tag-link',
                        href: options.link || '#'
                    }
                });

                div.append(textParagraph)
                div.append(hiperLink);
                return div;
            }

            return textParagraph;
        },
        linkDesc(prod, options, text) {
            if (!prod.descricoes || prod.descricoes.length <= 0) return false;

            let hiperLink = wsMain.tools.createElm({
                type: 'a',
                innerHTML: text,
                attrs: {
                    class: 'tag-link'
                }
            });

            return hiperLink;
        },
        createSlide(prod, options, photoType, lazy = true, photosToUse) {
            let div = wsMain.tools.createElm('div');
            let photos = photosToUse ? photosToUse : prod.fotos;

            if (wsMain.options['pag-produto'].slideView != 'alternative') {
                if (prod.variacoes && prod.variacoes.length > 0) {
                    prod.variacoes.forEach(variation => {
                        if (variation.fotos && variation.fotos.length > 0) photos = photos.concat(variation.fotos);
                    })
                }
            }

            let children = false;

            if (Array.isArray(photos) && photos.length > 0) {
                photos.forEach((p, pIdx) => {
                    let img = wsMain.tools.createElm({
                        type: 'img',
                        lazyLoad: lazy,
                        attrs: {
                            alt: 'Foto ' + (pIdx + 1) + ' do Produto',
                            src: p[photoType]
                        }
                    }
                    );
                    let imgHolder = wsMain.tools.createElm('div');
                    imgHolder.append(img);







                    div.append(imgHolder);

                });
                children = true;
            }

            let ytVideoCode = wsMain.data.getYouTubeVideoId(prod.video);
            if (ytVideoCode) {
                if (photoType == 'thumb') div.innerHTML += `<div><div style="background-image: url(https://i.ytimg.com/vi_webp/${ytVideoCode}/sddefault.webp);" class="iframe-overlay">${options.icon || "<span data-wsjs-icon='play'></span>"}</div></div>`;
                else {
                    let frameHTML = wsMain.tools.createElm({
                        type: 'div',
                        attrs: {
                            class: 'pseudo-youtube-frame',
                            videoCode: ytVideoCode
                        },
                        innerHTML: `<img src="//i.ytimg.com/vi_webp/${ytVideoCode}/sddefault.webp" alt="thumbnail do video do youtube"><button class="ytp-large-play-button ytp-button ytp-large-play-button-red-bg" aria-label="Reproduzir"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>`
                    });







                    div.appendChild(frameHTML)

                }

                children = true;
            }

            if (!children) {
                let imgHolder = wsMain.tools.createElm('div');
                imgHolder.classList.add('whithout-image');
                imgHolder.innerHTML = `<span data-wsjs-icon="noimage"></span>`;
                div.append(imgHolder);
            }

            return div;
        },
        avaliableDays(prod, options, text) {
            let string = 'Imediata';
            let days = parseInt(prod.prazo);
            let preSale = prod.prevenda_data ? prod.prevenda_data : null;
            if (!wsMain.modules['pag-produto'].cache) wsMain.modules['pag-produto'].cache = {}
            wsMain.modules['pag-produto'].cache['prazo'] = prod.prazo;

            let business_days = '';
            if (typeof show_business_days !== 'undefined') {
                business_days = ' &uacute;teis'
            }

            if (days > 0) {
                if (days == 1) string = days + ' dia';
                else string = days + ' dias';
                string += business_days;
            }

            if (preSale && preSale != '') {
                let dtToday = new Date();
                let dtpreSale = new Date(preSale);
                if (
                    `${dtpreSale.getFullYear()}-${dtpreSale.getUTCMonth() + 1}-${dtpreSale.getUTCDate()}`
                    !=
                    `${dtToday.getFullYear()}-${dtToday.getUTCMonth() + 1}-${dtToday.getUTCDate()}`
                ) {
                    string = `Pr&eacute;-venda: ${preSale.split('-')[2]}/${preSale.split('-')[1]}/${preSale.split('-')[0]}`;
                    text = '';
                }
            }

            return wsMain.tools.createElm({
                type: 'span',
                innerHTML: `${text}${string}`
            });
        },
        buttonBuy(prod, options, text) {
            let priceToPut = prod.precos['preco_promocao'] || prod.precos['preco'];
            if (!priceToPut || wsMain.globalData.infoLoja?.estrutura?.modo == '2' || wsMain.globalData.infoLoja?.estrutura?.modo == '3') return;
            let button = wsMain.tools.createElm({
                type: 'button',
                innerHTML: text,
                attrs: {
                    'data-sku': prod.codigo,
                    onclick: `wsFuncBtBuy()`,
                    href: "javascript:;"
                }
            });
            return button;
        },
        buttonCart(prod, options, text) {
            let priceToPut = prod.precos['preco_promocao'] || prod.precos['preco'];
            if (!priceToPut || wsMain.globalData.infoLoja?.estrutura?.modo == '2' || wsMain.globalData.infoLoja?.estrutura?.modo == '3') return;
            let button = wsMain.tools.createElm({
                type: 'button',
                innerHTML: text,
                attrs: {
                    'data-sku': prod.codigo,
                    onclick: `wsFuncBtBuy('wsMain.modules["cart-drawer"].changeState()')`
                }
            });

            return button;
        },
        buttonFavorite(prod, options, text) {
            if (typeof WsFavoritos == 'undefined') return false;
            let id = document.querySelector('#LV_HD_PROD_ID').value;

            let icons = `<span data-wsjs-icon="favorite"></span>`

            let button = wsMain.tools.createElm({
                type: 'button',
                innerHTML: icons + text,
                attrs: {
                    'aria-label': "Adicionar aos favoritos",
                    id: 'prod-favorite-link-' + id,
                    data: 'prod-favorite-link-' + id,
                    onclick: `funcAddFavoriteWs("${id}");`
                }
            });

            return button;
        },
        buttonShare(prod, options, text) {
            let button = wsMain.tools.createElm({
                type: 'button',
                innerHTML: text,
                attrs: {
                    'aria-label': "Compartilhar produto",
                    onclick: "wsMain.modules['pag-produto'].openShareOptions(this)"
                }
            })

            return button;
        },
        installments(prod, options, text) {
            let div = wsMain.tools.createElm('div'), numOfInstallments = 0;

            let price = prod.precos['preco_promocao'] || prod.precos['preco'];

            if (!prod.precos['max_parcelas'] || prod.precos['max_parcelas'] == 0 || price < prod.precos['valor_min_parcelas']) return false;

            function getInstallment(price, min, i) {
                let installments = price / i;

                if (installments < min) {
                    return getInstallment(price, min, i - 1);
                } else {
                    return i;
                }
            }

            div.innerHTML = text;

            let containerList = wsMain.tools.createElm('ul');

            let installmentsNum = getInstallment(price, prod.precos['valor_min_parcelas'], prod.precos['max_parcelas']);

            let withoutFeeNumber = 0
            let feeNumber = 0

            try {
                for (let i = 1; i <= installmentsNum; i++) {
                    let installmentPrice = wsMain.data.compostFeeValue(prod.precos['juros'], i, prod.precos['juros_inicia'], price);
                    let innerInstallment =
                        i < prod.precos['juros_inicia']
                            ?
                            `${i}x de ${wsMain.data.treatPrice(installmentPrice)} <span>sem juros<span>`
                            :
                            `${i}x de ${wsMain.data.treatPrice(installmentPrice)}`;

                    if (i < prod.precos['juros_inicia']) { withoutFeeNumber = i }
                    else { feeNumber = i };

                    let newInstallment = wsMain.tools.createElm({
                        type: 'li',
                        innerHTML: innerInstallment
                    });

                    containerList.append(newInstallment);
                }
            } catch (err) {
            }

            if (!options?.modal) {
                div.append(containerList);
                return div;
            }

            if (installmentsNum < 1) {
                return div;
            };


            div.querySelector("a").setAttribute("onclick", "wsMain.modules['pag-produto'].modalInstalments()");

            const paymentMethodsIcons = wsMain.modules['pag-produto'].paymentMethodsIcons()
            const anotherPaymentMethodsIcons = wsMain.modules['pag-produto'].paymentMethodsIcons(true)
            const descontoAVista = wsMain?.globalData?.infoProduto?.precos?.desconto_avista

            let paymentMethodsIconsHtml = ''

            if (paymentMethodsIcons) {
                paymentMethodsIconsHtml = `
                <div class="ws-modal-parcelas-payment-methods">
                    <h3>Parcele sua compra com os principais cart&otilde;es de cr&eacute;dito</h3>
                    <div class="ws-modal-parcelas-payment-methods-icons-holder">
                        ${paymentMethodsIcons.innerHTML}
                    </div>
                </div>
                `
            }

            let anotherPaymentMethods = '';

            if (descontoAVista && anotherPaymentMethodsIcons) {
                anotherPaymentMethods = `
                <div class="ws-modal-parcelas-another-payment-methods">
                    <h3>Outros meios de pagamento</h3>
                    <div class="ws-modal-parcelas-payment-methods-icons-holder">
                        ${anotherPaymentMethodsIcons.innerHTML}
                    </div>
                </div>
                `
            }

            const ul = containerList;
            const items = Array.from(ul.children);
            const half = Math.ceil(items.length / 2);

            const leftColumn = document.createElement('ul');
            const rightColumn = document.createElement('ul');

            items.slice(0, half).forEach(item => leftColumn.appendChild(item));
            items.slice(half).forEach(item => rightColumn.appendChild(item));

            ul.innerHTML = '';
            ul.appendChild(leftColumn);
            ul.appendChild(rightColumn);

            const modal = document.createElement("div");
            modal.classList.add("ws-modal-parcelas");

            let modalMsgTitle = ''

            if (feeNumber) {
                modalMsgTitle = `Parcele em at&eacute; ${feeNumber}x`
            }

            if (withoutFeeNumber && withoutFeeNumber > 1) {
                modalMsgTitle = `Parcele em at&eacute; ${withoutFeeNumber}x sem juros`
            }

            modal.innerHTML = `
            <div class="ws-modal-parcelas__wrapper">
                <span class="ws-modal-parcelas-close" onclick="wsMain.modules['pag-produto'].modalInstalments()">&times;</span>
                <div class="ws-modal-parcelas-content">
                    <h2>Meios de pagamentos para este produto</h2>
                    ${paymentMethodsIconsHtml}
                    <div class="ws-modal-parcelas-installments-list">
                        <h3>${modalMsgTitle}</h3>
                        <div>${ul.innerHTML}</div>
                    </div>
                    ${anotherPaymentMethods}
                </div>
            </div>
            `;

            document.body.append(modal);

            document.querySelector('.ws-modal-parcelas').addEventListener('click', (e) => {
                if (e.target.classList.contains('modalInstallmentOpen')) {
                    wsMain.modules['pag-produto'].modalInstalments();
                };
            });

            return div;
        },
        priceInstallment(prod, options, text) {
            let price = prod.precos['preco_promocao'] || prod.precos['preco'];

            if (!prod.precos['max_parcelas'] || prod.precos['max_parcelas'] == 0) return false;

            let initialFeeNum = prod.precos['juros_inicia'];

            let maxInstallmentsNum = prod.precos['max_parcelas'];

            let minInstallmentsValue = prod.precos['valor_min_parcelas'];

            let minInstallmentsFee = prod.precos['juros_inicia'];

            if (price <= minInstallmentsValue) return false;

            function getInstallment(price, min, i) {
                if ((price / i) < min) {
                    return getInstallment(price, min, i - 1);
                } else {
                    return i;
                }
            }

            let installmentIndex = getInstallment(price, minInstallmentsValue, maxInstallmentsNum);
            let installmentsWhioutFee = false;

            for (let i = installmentIndex; i >= 1; i--) {
                if (i < minInstallmentsFee && (price / i) >= minInstallmentsValue && !installmentsWhioutFee) installmentsWhioutFee = i;
            }

            let innerSpan;
            if (installmentsWhioutFee) {
                innerSpan = `${installmentsWhioutFee}x de ${wsMain.data.treatPrice((price / installmentsWhioutFee))} <span>sem juros<span>`;
            } else {
                innerSpan = `${installmentIndex}x de ${wsMain.data.treatPrice((price / installmentIndex))}`;
            }

            let span = wsMain.tools.createElm({
                type: 'span',
                innerHTML: innerSpan
            });

            return span;
        },
        warranty(prod, options, text) {
            let div = wsMain.tools.createElm('div');

            if (!prod['garantia_meses']) return false;

            div.innerHTML = text;

            let span = wsMain.tools.createElm({
                type: 'span',
                innerHTML: `Este produto possui garantia de ${prod['garantia_meses']} ${prod['garantia_meses'] == 1 ? 'm&ecirc;s' : 'meses'}.`
            })

            div.append(span);

            return div;
        },
        descriptions(prod, options, text) {
            let div = wsMain.tools.createElm('div');
            if (!prod.descricoes || prod.descricoes.length <= 0) return false;

            prod.descricoes.forEach((d, i) => {
                let descDiv = wsMain.tools.createElm('div'), descContainer = wsMain.tools.createElm('div');
                let title = wsMain.tools.createElm({ type: 'h2', innerHTML: d.titulo });

                if (options.accordion) {
                    let input = wsMain.tools.createElm({
                        type: 'input',
                        attrs: {
                            type: 'checkbox',
                            checked: Boolean(options.defaultOpen),
                            id: 'main-desc-' + i
                        }
                    });
                    let label = wsMain.tools.createElm({
                        type: 'label',
                        attrs: {
                            for: 'main-desc-' + i
                        }
                    });
                    let spanArrow = wsMain.tools.createElm({
                        type: 'span',
                        attrs: {
                            'data-wsjs-icon': 'arrow'
                        }
                    });

                    descDiv.append(input);
                    label.append(title);
                    label.append(spanArrow);
                    descDiv.append(label);

                } else {
                    descDiv.append(title);
                }

                let textType = options.textType ? options.textType : null;
                if (textType != null) {
                    switch (textType.toString()) {
                        case "descricao": textType = 0; break;
                        case "especificacoes": textType = 1; break;
                        case "dados-tecnicos": textType = 2; break;
                        default: textType = textType;
                    }
                }
                if (textType == i || textType == null) {
                    descContainer.innerHTML = d.conteudo.replace(/&nbsp;/g, ' ');
                    descDiv.append(descContainer);
                    div.append(descDiv);
                }

            });

            return div;
        },
        video(prod, options, text) {
            let div = wsMain.tools.createElm('div');

            let ytVideoCode = wsMain.data.getYouTubeVideoId(prod.video);
            if (ytVideoCode) {
                let frameHTML = wsMain.tools.createElm({
                    type: 'div',
                    attrs: {
                        class: 'pseudo-youtube-frame',
                        videoCode: ytVideoCode
                    },
                    innerHTML: `<img src="//i.ytimg.com/vi_webp/${ytVideoCode}/sddefault.webp" alt="thumbnail do video do youtube"><button class="ytp-large-play-button ytp-button ytp-large-play-button-red-bg" aria-label="Reproduzir"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>`
                });

                div.appendChild(frameHTML);
                return div;
            }

            return false;
        },
        quantitySelector(prod, options, text) {
            let priceToPut = prod.precos['preco_promocao'] || prod.precos['preco'];
            if (!priceToPut) return;
            let input = wsMain.tools.createElm({
                type: 'input'
            });
            input.value = 0;
            return input;
        },
        shipping(prod, options, text) {
            let div = wsMain.tools.createElm('div');
            return div
        },
        shareCopy(prod, options, text) {
            return wsMain.tools.createElm({
                type: 'a',
                innerHTML: text,
                attrs: {
                    'title': 'Copiar Link',
                    onclick: "wsMain.tools.copyLink(this)",
                    href: "javascript:;"
                }
            });
        },
        shareWhatsApp(prod, options, text) {
            let msgToSend = `Olha esse ${prod.nome} da ${window.location.href}`
            let uri = 'https://api.whatsapp.com/send?text=' + encodeURI(msgToSend);
            return wsMain.tools.createElm({
                type: 'a',
                innerHTML: text,
                attrs: {
                    target: '__blank',
                    'aria-label': 'Enviar por WhatsApp',
                    href: uri
                }
            });
        },
        shareEmail(prod, options, text) {
            let msgToSend = `Olha esse ${prod.nome} da ${window.location.href}`
            let uri = 'mailto:?body=' + encodeURI(msgToSend);
            return wsMain.tools.createElm({
                type: 'a',
                innerHTML: text,
                attrs: {
                    target: '__blank',
                    'aria-label': 'Enviar por Email',
                    href: uri
                }
            });
        },
        shareFacebook(prod, options, text) {
            let uri = "http://www.facebook.com/sharer.php?u=" + window.location.href + "&t=" + prod.nome;
            return wsMain.tools.createElm({
                type: 'a',
                innerHTML: text,
                attrs: {
                    target: '__blank',
                    'aria-label': 'Enviar pelo Facebook',
                    href: uri
                }
            });
        },
        features(prod, options, text) {
            let features = prod.caracteristicas;
            if (!Array.isArray(features) || features.length == 0) return false;

            let div = wsMain.tools.createElm({
                type: 'div',
                innerHTML: text
            });

            let table = wsMain.tools.createElm('table'),
                tbody = wsMain.tools.createElm('tbody');

            features.forEach((feature) => {
                let line = wsMain.tools.createElm('tr');

                let key = wsMain.tools.createElm({
                    type: 'td',
                    innerHTML: feature.nome,
                });

                let value = wsMain.tools.createElm({
                    type: 'td',
                    innerHTML: feature.valor
                });

                line.append(key);
                line.append(value);
                tbody.append(line);
            });

            table.append(tbody);
            div.append(table);

            return div;
        },
        modal(prod, options, text) {
            let photosDiv = wsMain.modules['pag-produto'].subFunctions.createSlide(prod, options, 'zoom');
            photosDiv.setAttribute('data-wsjs-product', 'modal');
            return photosDiv;
        },
    },
    closeModal(e) {
        if (e && e.type == 'keyup' && e.key != 'Escape') return;
        let modalDiv = document.querySelector('[data-wsjs-productmodal]') || document.querySelector('[data-wsjs-product="modal"]');
        modalDiv.setAttribute('style', 'display: flex; opacity: 0;');
        setTimeout(() => {
            modalDiv.setAttribute('style', 'display: none; opacity: 0;');
        }, 400);

        try {
            document.removeEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
        } catch (_) {

        }
    },
    update(json) {
        try {

            try {

                if (wsMain.options['pag-produto'].slideView != 'alternative') {
                    wsMain.globalData.infoProduto.variacoes.forEach((variation, i) => {
                        if (variation.codigo == json.codigo) {
                            wsMain.modules['pag-produto'].cache['slides'].photoSlider.moveToIdx(wsMain.modules['pag-produto'].cache['variationsIndex'][i] || 0);
                        }
                    });
                } else {

                    try { wsMain.modules['pag-produto'].cache['slides'].photoSlider?.destroy?.(); } catch (e) { }
                    try { wsMain.modules['pag-produto'].cache['slides'].dotSlider?.destroy?.(); } catch (e) { }
                    try { wsMain.modules['pag-produto'].cache['slides'].modalSlider?.destroy?.(); } catch (e) { }
                    try { wsMain.modules['pag-produto'].cache['slides'].dotsModalSlider?.destroy?.(); } catch (e) { }
                    try {
                        const modalWrapper = document.querySelector('[data-wsjs-productmodal]');
                        if (modalWrapper) {
                            modalWrapper.querySelectorAll('.arrow, .close-button').forEach(n => n.remove());
                        }
                    } catch (e) { }

                    let photosToUse = json.fotos;

                    let dotsSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'thumb', false, photosToUse);
                    let dotsModalSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'thumb', false, photosToUse);
                    let photosSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'normal', false, photosToUse);
                    let modalSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'zoom', false, photosToUse);

                    if (wsMain.modules['pag-produto'].cache['slides'].photoSlider) {
                        const photosDiv = document.querySelector('[data-wsjs-product="photos"]');
                        if (photosDiv) photosDiv.innerHTML = photosSlides.innerHTML;
                    }

                    if (wsMain.modules['pag-produto'].cache['slides'].dotSlider) {
                        const dotsDiv = document.querySelector('[data-wsjs-product="dots"]');
                        if (dotsDiv) {
                            dotsDiv.innerHTML = dotsSlides.innerHTML;

                            try {
                                const hasPhotosAnchor = !!document.querySelector('.prod-photo-container [data-wsjs-product="photos"]');
                                const imgs = dotsDiv.querySelectorAll('img');
                                imgs.forEach((img, i) => {

                                    img.setAttribute('data-idx', String(hasPhotosAnchor ? (i + 1) : i));
                                });
                            } catch (_) { }
                        }
                    }

                    const modalDiv = document.querySelector('[data-wsjs-product="modal"]');
                    if (wsMain.modules['pag-produto'].cache['slides'].modalSlider) {
                        if (modalDiv) modalDiv.innerHTML = modalSlides.innerHTML;
                    }


                    try {
                        if (modalDiv) {

                            modalDiv.querySelectorAll('.keen-slider').forEach(ks => {
                                const frag = document.createDocumentFragment();
                                while (ks.firstChild) frag.appendChild(ks.firstChild);
                                ks.replaceWith(frag);
                            });
                            modalDiv.querySelectorAll('.keen-slider__slide').forEach(sl => {
                                const frag = document.createDocumentFragment();
                                while (sl.firstChild) frag.appendChild(sl.firstChild);
                                sl.replaceWith(frag);
                            });


                            modalDiv.querySelectorAll('.arrow, .close-button').forEach(n => n.remove());
                        }
                    } catch (e) { }

                    if (wsMain.modules['pag-produto'].cache['slides'].dotsModalSlider) {
                        const dotsModalDiv = document.querySelector('[data-wsjs-productmodal] [data-wsjs-product="dots"]');
                        if (dotsModalDiv) dotsModalDiv.innerHTML = dotsModalSlides.innerHTML;
                    }

                    try {
                        wsMain.modules['pag-produto'].slideTreat();
                    } catch (e) {
                    }

                }


            } catch (_) {
            }

            try {
                delete json['nome'];
            } catch (_) { }

            let newPrices = json && json['precos'] ? JSON.parse(JSON.stringify(json['precos'])) : {};

            wsMain.globalData.infoProduto.prazo = null;

            json = { ...wsMain.globalData.infoProduto, ...json };

            json['precos'] = wsMain.globalData.infoProduto['precos'];

            if (newPrices['preco']) json.precos['preco'] = newPrices['preco'];

            if (newPrices['preco_promocao']) json.precos['preco_promocao'] = newPrices['preco_promocao'];
            else if (newPrices['preco']) delete json.precos['preco_promocao'];

            try {
                let qtdInpt = document.querySelector('[data-wsjs-product="quantity"]');
                let infoMin = json.quantidade_minima;
                let infoMax = json.qtd_disponivel;

                json.variacoes.forEach(variation => {
                    if (variation.codigo == json.codigo && variation.estoque) {
                        qtdInpt.setAttribute('max', variation.estoque);
                    }
                });

                qtdInpt.value = infoMin < 1 ? 1 : infoMin;
            } catch (err) {

            }

            try {
                document.querySelectorAll('[data-wsjs-product="code"]').forEach(item => item.innerHTML = json.codigo);
            } catch (err) {

            }

            document.querySelectorAll('[data-wsjs-force]').forEach(span => {
                let spanTag = span.getAttribute('data-wsjs-product');

                let template = wsMain.tools.createElm('div')
                template.innerHTML = wsMain.globalData.productHTML;

                let spanTemplate = template.querySelector(`[data-wsjs-product=${spanTag}]`);
                let spanOptions = wsMain.tools.getWsData(spanTemplate, 'options');

                let elm = wsMain.modules['pag-produto'].subFunctions[spanTag](json, spanOptions, spanTemplate.innerHTML);

                if (elm) {
                    span.setAttribute('data-wsjs-force', 'load');
                    wsMain.tools.replaceSpanTag(elm, span);
                } else {
                    span.setAttribute('data-wsjs-force', 'none');
                }
            });


            try {
                const container = document.querySelector('.prod-photo-container');
                const hasPhotosAnchor = !!container?.querySelector('[data-wsjs-product="photos"]');
                const dotsRoot = container?.querySelector('[data-wsjs-product="dots"]');
                const dotsImgs = dotsRoot ? dotsRoot.querySelectorAll('img').length : 0;
                const modalDivDbg = document.querySelector('[data-wsjs-product="modal"]');

            } catch (e) {
            }


            try { wsMain.modules['pag-produto'].slideTreat(); } catch (e) { }
            try { wsMain.modules['pag-produto'].subFunctions._wsTagIdxPhotos(); } catch (e) { }
            try { wsMain.modules['pag-produto'].subFunctions._wsBindDotsOpenModal(); } catch (e) { }


            try {
                const slides = wsMain.modules['pag-produto']?.cache?.slides || {};
                const container = document.querySelector('.prod-photo-container');
                const dotsRoot = container?.querySelector('[data-wsjs-product="dots"]');
                const dotsImgs = dotsRoot ? dotsRoot.querySelectorAll('img').length : 0;

            } catch (e) {
            }


        } catch (err) {
        }
    },
    async get() {
        let data = await ApiWS.Calls.produto();

        wsMain.modules['pag-produto'].create(data);

        return true;
    },
    create(returnJson) {
        this.buyByQueryParams()

        wsMain.modules['pag-produto'].cashbackSection();

        let prodState = this.getProdState(returnJson);

        try {
            let lastProds = window.localStorage.getItem('lastProds' + ApiWS['LV']);
            let lastProdCode = document.querySelector('#LV_HD_PROD_ID').value;
            if (lastProds) {
                lastProds = lastProds.split(',');
                if (lastProds.indexOf(lastProdCode) == -1) {
                    if (lastProds.length == 10) lastProds[0] = lastProdCode
                    else lastProds.push(lastProdCode);
                }
            } else lastProds = [lastProdCode]

            window.localStorage.setItem('lastProds' + ApiWS['LV'], lastProds.join(','))
        } catch (err) { }


        let qtdInpt = document.querySelector('[data-wsjs-product="quantity"]');
        let infoMin = wsMain.globalData.infoProduto.quantidade_minima;
        let infoMax = wsMain.globalData.infoProduto.qtd_disponivel;
        let qtdEmbalagem = wsMain.globalData.infoProduto.quantidade_embalagem;

        qtdInpt.setAttribute('step', qtdEmbalagem || 1);
        qtdInpt.setAttribute('min', infoMin);

        try {
            if (!returnJson.entrega) {
                document.querySelector('[data-wsjs-product="shippig-container"]').remove();
            } else {
                document.querySelector('[data-wsjs-product="shippig-container"]').removeAttribute('data-wsjs-prodcut');
            };
        } catch (err) { }

        if (!wsMain.globalData.infoProduto.variacoes || wsMain.globalData.infoProduto.variacoes.length <= 0) {
            qtdInpt.setAttribute('max', infoMax);
        } else {
            qtdInpt.setAttribute('max', 999);
        }

        qtdInpt.value = infoMin < 1 ? 1 : infoMin;

        qtdInpt.addEventListener('keypress', e => wsMain.data.quantityFilter(e));

        document.querySelectorAll('*[data-wsjs-product-state]').forEach(elm => elm.getAttribute('data-wsjs-product-state') != prodState ? elm.remove() : null);

        wsMain.globalData.productHTML = document.querySelector('[data-wsjs-product="container"]').innerHTML;

        wsMain.tools.replaceSubFunctions(returnJson, this.subFunctions, 'product');

        try {
            document.querySelectorAll('.pseudo-youtube-frame').forEach(el => wsMain.addons.replaceIframe(el))
        } catch (err) { }

        if (prodState == 'consult') {
            try {
                document.querySelector('[data-wsjs-contact=prodId]').value = document.querySelector("#LV_HD_PROD_ID").value;
            } catch (_) { }
        }

        try {
            let timerContainer = document.querySelector('[data-wsjs-timer="container"]');
            if (returnJson.precos.preco_promocao_validade && timerContainer) {
                let countDownDate = new Date(returnJson.precos.preco_promocao_validade).getTime();
                let timer = timerContainer.querySelector('[data-wsjs-timer="timer"]');
                timer.innerHTML = `
          <div data-wsjs-timer="Dias"></div>
          <div data-wsjs-timer="Horas"></div>
          <div data-wsjs-timer="Minutos"></div>
          <div data-wsjs-timer="Segundos"></div>`
                var x = setInterval(() => {

                    let now = new Date().getTime();


                    let distance = countDownDate - now;


                    let d = Math.floor(distance / (1000 * 60 * 60 * 24));
                    let h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    let s = Math.floor((distance % (1000 * 60)) / 1000);

                    timer.querySelector('[data-wsjs-timer="Dias"]').innerHTML = d.toString().length == 1 ? '0' + d : d;
                    timer.querySelector('[data-wsjs-timer="Horas"]').innerHTML = h.toString().length == 1 ? '0' + h : h;
                    timer.querySelector('[data-wsjs-timer="Minutos"]').innerHTML = m.toString().length == 1 ? '0' + m : m;
                    timer.querySelector('[data-wsjs-timer="Segundos"]').innerHTML = s.toString().length == 1 ? '0' + s : s;

                }, 1000);
                timerContainer.removeAttribute('data-wsjs-timer');

            } else timerContainer.remove()

        } catch (err) {
        }

        if (typeof _trustvox_shelf_rate == 'undefined') {
            document.querySelectorAll('[data-wsjs-product="trustvox"]').forEach(item => item.remove());
        }

        try {
            document.querySelector('[data-wsjs-product="inputCEP"]').value = localStorage.getItem('CEP_CART_KEEP');
        } catch (_) {

        }

        document.querySelectorAll('.prod-side-container').forEach(elm => elm.removeAttribute('style'));
        document.querySelectorAll('.prod-block-container').forEach(elm => { if (elm.innerText == '') elm.remove() });

        document.querySelectorAll('[data-wsjs-infoHolder]').forEach(elm => {
            if (elm.innerHTML.trim() == '') {
                elm.remove();
            } else {
                elm.removeAttribute('data-wsjs-infoHolder');
            }
        });

        try {
            let photos = returnJson.fotos;
            let variationsIndex = [];

            if (returnJson.variacoes && returnJson.variacoes.length > 0) {
                returnJson.variacoes.forEach(variation => {
                    if (variation.fotos && variation.fotos.length > 0) {
                        variationsIndex.push(photos.length);
                        photos = photos.concat(variation.fotos);
                    }
                })
            }

            wsMain.modules['pag-produto'].cache = {
                variationsIndex: variationsIndex
            }

        } catch (err) { }

        try {
            wsMain.modules['pag-produto'].slideTreat();
        } catch (e) {
        }

        try {
            wsMain.modules['pag-produto'].createKits();
        } catch (e) {
        }

        try {
            document.addEventListener("scroll", wsMain.modules['pag-produto'].floatPrice, 100);
        } catch (e) {
        }

        document.querySelector('.loader-container').setAttribute('style', 'opacity:0');
        setTimeout(() => {
            document.querySelector('.prod-to-load').classList.remove('prod-to-load');
            document.querySelector('.loader-container').remove();
        }, 200);
    }, slideTreat() {

        try {
            var photosDiv = document.querySelector('[data-wsjs-product="photos"]'),
                photosSlideOption = wsMain.tools.getWsData(photosDiv, 'slide');

            if (photosSlideOption) {
                try {
                    photosSlideOption = { ...wsMain.options['pag-produto'].slide['photos'], ...photosSlideOption };
                } catch (_) { }
            }

            var dotsDiv = document.querySelector('[data-wsjs-product="dots"]'),
                dotsSlideOption = wsMain.tools.getWsData(dotsDiv, 'slide');

            if (dotsSlideOption && !dotsSlideOption['forcing-slides']) {
                try {
                    dotsSlideOption = { ...wsMain.options['pag-produto'].slide['dots'], ...dotsSlideOption };
                } catch (err) { };
            }

            var modalDiv = document.querySelector('[data-wsjs-product="modal"]'),
                modalSlideOption = wsMain.tools.getWsData(modalDiv, 'slide') || {};

            let modalContainer = document.querySelector('[data-wsjs-productmodal]') || modalDiv;


            try {
                if (modalDiv) {

                    modalDiv.querySelectorAll('.keen-slider').forEach(ks => {
                        const frag = document.createDocumentFragment();
                        while (ks.firstChild) frag.appendChild(ks.firstChild);
                        ks.replaceWith(frag);
                    });
                    modalDiv.querySelectorAll('.keen-slider__slide').forEach(sl => {
                        const frag = document.createDocumentFragment();
                        while (sl.firstChild) frag.appendChild(sl.firstChild);
                        sl.replaceWith(frag);
                    });

                    modalDiv.querySelectorAll('.arrow, .close-button').forEach(n => n.remove());
                }
            } catch (e) { }





            try {
                modalSlideOption = { ...wsMain.options['pag-produto'].slide['modal'], ...modalSlideOption };
            } catch (_) { }

            var dotsModalDiv = document.querySelector('[data-wsjs-productmodal] [data-wsjs-product="dots"]'),
                dotsModalSlideOption = wsMain.tools.getWsData(dotsModalDiv, 'slide');

            function ThumbnailPlugin(main) {
                if (!main) return;
                return (slider) => {
                    function removeActive() {
                        slider.slides.forEach((slide) => {
                            slide.classList.remove("active");
                        });
                    }

                    function addActive(idx) {
                        slider.slides[idx].classList.add("active");
                    }

                    function addClickEvents() {
                        slider.slides.forEach((slide, idx) => {
                            slide.addEventListener("click", () => {
                                main.moveToIdx(main.track.absToRel(idx));
                            });
                        });
                    }

                    slider.on("slideChanged", () => {
                        try {
                            let iframe = main.container.querySelector('iframe')[0].contentWindow;
                            iframe.postMessage(
                                '{"event":"command","func":"pauseVideo","args":""}',
                                "*"
                            );
                        } catch (err) { }
                        main.moveToIdx(slider.track.details.rel);
                    })

                    slider.on("created", () => {
                        addActive(slider.track.details.rel);
                        addClickEvents();
                        main.on("animationStarted", (main) => {
                            removeActive();
                            const next = main.animator.targetIdx || 0;
                            addActive(main.track.absToRel(next));
                            if ((slider.track.details.slides.length > slider.options.slides.perView) && main.track.absToRel(next) != slider.track.details.rel) {
                                slider.moveToIdx(main.track.absToRel(next));
                            }
                        });
                    });
                };
            }

            function keyArrowsPlugin() {
                return (slider) => {
                    document.addEventListener('keydown', function (event) {
                        const blockedElements = ['input', 'textarea', 'select'];

                        if (blockedElements.includes(document.activeElement.tagName.toLowerCase())) return;

                        if (event.key == 'ArrowLeft') slider.prev();
                        if (event.key == 'ArrowRight') slider.next();
                    });

                }
            }

            function ModalPlugin(main) {
                return (slider) => {
                    if (main && main.animator) {
                        main.on("slideChanged", () => {
                            const next = main.animator.targetIdx || 0;
                            if (slider.track.details.abs != next) slider.moveToIdx(next);
                        });
                    } else if (main) {

                        main.querySelectorAll('img').forEach((img, idx) => {
                            img.addEventListener('click', () => slider.moveToIdx(idx))
                        });
                    }
                }
            }

            function ZoomPlugin() {
                return (slider) => {
                    if (typeof ImageZoom != 'undefined' && ImageZoom) {
                        try {
                            document.querySelectorAll('[data-wsjs-product-state] > .js-image-zoom__zoomed-image').forEach(div => div.remove());
                        } catch (err) { }

                        slider.slides.forEach((slide) => {
                            if (slide.querySelector('img') && !slide.querySelector('.pseudo-youtube-frame')) {
                                let zoomDiv = wsMain.tools.createElm('zoom');
                                slide.querySelector('div').appendChild(zoomDiv);
                                zoomDiv.append(slide.querySelector('img'));

                                let container = document.querySelector('[data-wsjs-product-state]');
                                let width = (container.clientWidth - 38) / 2;

                                ImageZoom(zoomDiv, {
                                    zoomWidth: width,
                                    zoomHeight: width,
                                    zoomPosition: 'left',
                                    zoomContainer: document.querySelector('[data-wsjs-product-state]'),
                                    offset: { vertical: 0, horizontal: 0 },
                                    zoomStyle: "transform: translate(50%, 50%) scale(2); z-index: 2;top: 2rem; left: calc(2rem - 0.1rem);"
                                });
                            }
                        });
                    }
                }
            }

            let [photoSuccess, photoSlider] = photosSlideOption ?
                wsMain.tools.createSlide(photosDiv, photosSlideOption, wsMain.globalData.infoProduto['tipo_zoom_fotos'] == '1' ? [ZoomPlugin(modalDiv), keyArrowsPlugin()] : [keyArrowsPlugin()])
                :
                [false, null];



            let [dotSuccess, dotSlider] = dotsSlideOption ? wsMain.tools.createSlide(dotsDiv, dotsSlideOption, [ThumbnailPlugin(photoSlider)])
                :
                [false, null];






            const wasHidden = modalContainer && window.getComputedStyle(modalContainer).display === 'none';
            if (wasHidden) {
                modalContainer.style.display = 'flex';
                modalContainer.style.visibility = 'hidden';
            }


            let [modalSuccess, modalSlider] = wsMain.tools.createSlide(
                modalDiv,
                modalSlideOption,
                [ModalPlugin(photoSlider || photosDiv)]
            );


            if (wasHidden) {
                modalContainer.style.display = 'none';
                modalContainer.style.visibility = '';
            }

            let [dotsModalSuccess, dotsModalSlider] = dotsModalSlideOption ? wsMain.tools.createSlide(dotsModalDiv, dotsModalSlideOption, [ThumbnailPlugin(modalSlider)])
                :
                [false, null];

            if (!dotsSlideOption && dotsDiv) {
                if (dotsDiv.parentNode && dotsDiv.parentNode.classList.contains('prod-photo-container')) {
                    dotsDiv.parentNode.classList.add('listing-photos-container')
                }
                dotsDiv.classList.add('listing-photos-container__dots')

                document.querySelectorAll('.listing-photos-container__dots > div').forEach((div, idx) => {
                    div.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();



                        try { wsMain.modules['pag-produto'].openModal(); } catch (_) { }


                        setTimeout(() => {
                            const hasPhotosAnchor = !!document.querySelector('.prod-photo-container [data-wsjs-product="photos"]');
                            const slides = (wsMain.modules['pag-produto'].cache && wsMain.modules['pag-produto'].cache.slides) || {};
                            const modal = slides.modalSlider;
                            const dotsModal = slides.dotsModalSlider;

                            const targetIdx = hasPhotosAnchor ? (idx + 1) : idx;
                            if (modal && typeof modal.moveToIdx === 'function') {
                                try { modal.moveToIdx(targetIdx); } catch (e) { }
                            }


                            try {
                                if (modalContainer) modalContainer.setAttribute('style', 'display: flex;');

                                setTimeout(() => {
                                    if (modalContainer) modalContainer.setAttribute('style', 'display: flex; opacity: 1;');
                                    if (modal && typeof modal.update === 'function') { try { modal.update(); } catch (e) { } }
                                    if (dotsModal && typeof dotsModal.update === 'function') { try { dotsModal.update(); } catch (e) { } }
                                }, 150);
                            } catch (_) { }

                            document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
                        }, 50);
                    }, false);
                });
            }

            function openModalPlugin() {
                if (!modalContainer) return;

                if (photoSlider && photoSlider.slides) {

                    photoSlider.slides.forEach((slide) => {
                        if (!slide.querySelector('.pseudo-youtube-frame')) {
                            slide.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try { wsMain.modules['pag-produto'].openModal(); } catch (_) { }

                                setTimeout(() => {
                                    const slides = wsMain.modules['pag-produto'].cache?.slides || {};
                                    const modal = slides.modalSlider;
                                    try {

                                        if (modal && typeof modal.moveToIdx === 'function') {
                                            modal.moveToIdx(photoSlider.track.details.rel || 0);
                                        }
                                    } catch (_) { }
                                    try {
                                        if (modalContainer) {
                                            modalContainer.style.display = 'flex';
                                            setTimeout(() => {
                                                modalContainer.style.opacity = '1';
                                                try { modal?.update?.(); } catch (_) { }
                                                try { slides.dotsModalSlider?.update?.(); } catch (_) { }
                                            }, 150);
                                        }
                                    } catch (_) { }

                                    document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
                                }, 50);
                            });
                        } else {
                            slide.style.cursor = 'pointer';
                        }
                    });
                } else if (photosDiv) {

                    photosDiv.querySelectorAll('img').forEach((img, idx) => {
                        img.addEventListener('click', (ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            try { wsMain.modules['pag-produto'].openModal(); } catch (_) { }

                            setTimeout(() => {
                                const slides = wsMain.modules['pag-produto'].cache?.slides || {};
                                const modal = slides.modalSlider;

                                try {
                                    if (modal && typeof modal.moveToIdx === 'function') {

                                        modal.moveToIdx(idx);
                                    }
                                } catch (_) { }

                                try {
                                    if (modalContainer) {
                                        modalContainer.style.display = 'flex';
                                        setTimeout(() => {
                                            modalContainer.style.opacity = '1';
                                            try { modal?.update?.(); } catch (_) { }
                                            try { slides.dotsModalSlider?.update?.(); } catch (_) { }
                                        }, 150);
                                    }
                                } catch (_) { }

                                document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
                            }, 50);
                        });
                    });
                }
            }

            openModalPlugin();

            wsMain.modules['pag-produto'].cache['slides'] = {
                modalSlider: modalSlider,
                photoSlider: photoSlider,
                dotSlider: dotSlider,
                dotsModalSlider: dotsModalSlider
            }

            let closeButton = wsMain.tools.createElm({
                type: 'span',
                attrs: {
                    'data-wsjs-icon': 'close',
                    class: 'close-button',
                    onclick: 'wsMain.modules["pag-produto"].closeModal()'
                }
            });

            wsMain.data.treatIcon(closeButton);

            if (modalContainer) {
                modalContainer.querySelectorAll('.close-button').forEach(btn => btn.remove());
            }
            if (modalContainer) modalContainer.append(closeButton);


            setTimeout(() => {
                try {
                    const slides1 = (wsMain.modules['pag-produto'].cache && wsMain.modules['pag-produto'].cache.slides) || {};
                    const maybeUpdate = (s) => { if (s && typeof s.update === 'function') { try { s.update(); } catch (e) { } } };

                    maybeUpdate(slides1.modalSlider);
                    maybeUpdate(slides1.photoSlider);
                    maybeUpdate(slides1.dotSlider);
                    maybeUpdate(slides1.dotsModalSlider);

                    setTimeout(() => {
                        const slides2 = (wsMain.modules['pag-produto'].cache && wsMain.modules['pag-produto'].cache.slides) || {};
                        maybeUpdate(slides2.modalSlider);
                        maybeUpdate(slides2.photoSlider);
                        maybeUpdate(slides2.dotSlider);
                        maybeUpdate(slides2.dotsModalSlider);
                    }, 50);
                } catch (e) { }

                try {
                    document.querySelectorAll('*[data-wsjs-lazyload=scroll]').forEach((elm) => {
                        try {
                            if (elm.getBoundingClientRect().top < window.innerHeight) {
                                wsMain.tools.lazyLoad(elm);
                            }
                        } catch (_) { }
                    });
                } catch (_) { }

                try { if (modalContainer) modalContainer.setAttribute('style', 'display: none;'); } catch (_) { }
            }, 100);

        } catch (err) {
        }
    },
    getProdState(prod) {
        if (!prod.disponivel) return 'unavailable';
        if (prod.modo == 3) return 'consult';

        if (
            wsMain.globalData['infoLoja'].estrutura['preco_apos_login']
            &&
            document.querySelector('#HD_LVCLI_NOME')?.value == 'Visitante'
        ) return 'login';

        return 'available'
    },
    shippingHolder(e) {
        if (e.key == 'Enter') try { document.querySelector('[data-wsjs-shipping]').click() } catch (_) { };
        let v = e.target.value.replace(/\D/g, "");
        e.target.value = v.replace(/^(\d{5})(\d)/, "$1-$2");
    },
    modalConsult(force) {
        let elm = document.querySelector('[data-wsjs-contact=modal]');
        let style = elm.getAttribute('style');
        if (style == 'display:flex;opacity:1;' || force) {
            elm.setAttribute('style', 'display:flex;opacity:0;');
            setTimeout(() => {
                elm.setAttribute('style', 'display:none;opacity:0;');
            }, 400);
        } else {
            elm.setAttribute('style', 'display:flex;opacity:0;');
            setTimeout(() => {
                elm.setAttribute('style', 'display:flex;opacity:1;');
            }, 1);
        }
    },
    paymentMethodsIcons(others) {
        let badges = wsMain?.globalData?.infoLoja?.estrutura?.bandeiras_pagamento;

        if (!badges && typeof nPanel == 'undefined') return false;

        let arrBadges = badges.split('|').filter(item => item ? true : false);

        if (!Array.isArray(arrBadges) || arrBadges.length == 0 && typeof nPanel == 'undefined') return false;

        let div = wsMain.tools.createElm('div');

        if (others) {
            const descontoAVista = wsMain?.globalData?.infoProduto?.precos?.desconto_avista

            arrBadges.forEach(item => {
                let badge;
                switch (parseInt(item)) {
                    case 6:
                        badge = 'boleto';
                        break;
                    case 17:
                        badge = 'pix';
                        break;
                    default:
                        break;
                }

                let msg = ''

                if (descontoAVista) {
                    msg = `<span>${badge} com ${descontoAVista}% de desconto</span>`
                }

                if (badge) {
                    const wrapper = wsMain.tools.createElm({
                        type: 'div',
                        attrs: {
                            'class': `credit-card-wrapper`,
                        },
                        innerHTML: msg
                    });

                    let elm = wsMain.tools.createElm({
                        type: 'div',
                        attrs: {
                            'class': `credit-card-container credit-card-${badge}`,
                            'data-wsjs-icon': badge
                        }
                    });

                    wrapper.append(elm);
                    div.append(wrapper);
                }
            });

            return div;
        }

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
                case 7:
                    badge = 'pagseguro';
                    break;
                case 8:
                    badge = 'mercadopago'
                    break;
                case 18:
                    badge = 'pagarme';
                    break;
                default:
                    break;
            }

            if (badge) {
                let elm = wsMain.tools.createElm({
                    type: 'div',
                    attrs: {
                        'class': `credit-card-container credit-card-${badge}`,
                        'data-wsjs-icon': badge
                    }
                });

                div.append(elm);
            }
        });

        return div;
    },
    modalInstalments() {
        const modal = document.querySelector('.ws-modal-parcelas');
        if (modal.classList.contains("modalInstallmentOpen")) {
            modal.classList.remove("modalInstallmentOpen");
            return;
        };

        modal.classList.add("modalInstallmentOpen")
    },
    cashbackSection() {
        try {
            const vrfy = document.querySelector('.cashback-container');
            if (vrfy) { return; };

            const cashbackValue = wsMain?.globalData?.infoProduto?.cashback?.valor;

            if (!cashbackValue) { return; };

            const formatPrices = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', });

            const cashbackContainer = document.createElement('div');
            cashbackContainer.classList.add('cashback-container');
            cashbackContainer.innerHTML = `
            <span class="cashback__icon-holder">
                <svg xmlns="http://www.w3.org/2000/svg" width="33.038" height="33.037" viewBox="0 0 33.038 33.037">
                <path id="Caminho_12665" data-name="Caminho 12665" d="M415.047,184.361a1.474,1.474,0,0,0-.784-1.588l-3.193-1.642a4.3,4.3,0,0,1-2.264-4.647,4.166,4.166,0,0,1,3.436-3.406v-.746a1.417,1.417,0,0,1,2.834,0v1.061a5.208,5.208,0,0,1,2.845,2.77,1.417,1.417,0,1,1-2.6,1.129,2.435,2.435,0,0,0-2.447-1.454A1.4,1.4,0,0,0,411.593,177a1.451,1.451,0,0,0,.774,1.606l3.193,1.643a4.281,4.281,0,0,1,2.286,4.556,4.153,4.153,0,0,1-2.77,3.329v.789a1.417,1.417,0,0,1-2.834,0v-.711a5.25,5.25,0,0,1-3.544-3,1.417,1.417,0,1,1,2.6-1.129,2.439,2.439,0,0,0,2.446,1.453c.059,0,.116-.012.171-.021A1.347,1.347,0,0,0,415.047,184.361Zm9.945-15.481a16.534,16.534,0,0,0-21.569-1.531L402.1,166.02a1.273,1.273,0,0,0-2.164.747l-.73,6.032a1.272,1.272,0,0,0,1.417,1.416l6.03-.729a1.273,1.273,0,0,0,.748-2.164l-1.267-1.267a12.753,12.753,0,1,1-5.323,8.077.471.471,0,0,0-.457-.569h-2.88a.479.479,0,0,0-.473.4,16.525,16.525,0,1,0,28-9.083Zm0,0" transform="translate(-396.789 -164.059)" fill="#222"/>
                </svg>
            </span>
            <span class="cashback__msg-holder">
                Voc&ecirc; receber&aacute; <span>${formatPrices.format(cashbackValue)} de cashback</span> na compra deste produto.
            </span>
            `;

            const prodBlock = document.querySelector('.available-section .prod-block-container:nth-child(2)');

            if (!prodBlock) { return; }

            const fatherContainer = prodBlock.parentNode

            if (!fatherContainer) { return; }

            fatherContainer.insertBefore(cashbackContainer, prodBlock);
        } catch (error) { }
    },
    buyByQueryParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get("adicionar") === "ok") {
                wsFuncBtBuy();
                return;
            };
        } catch (error) { }
    },
    addBusinessDays(businessDaysToAdd) {
        const date = new Date();

        while (businessDaysToAdd > 0) {
            date.setDate(date.getDate() + 1);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                businessDaysToAdd--;
            }
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return `${day}/${month}`;
    },
    async calculateShipping(elm) {

        let CEPtoSave = elm.value;
        let CEP = elm.value.replace('-', '');
        if (CEP.length != 8) return alert('Preencha o CEP Corretamente');

        let container = document.querySelector('[data-wsjs-shipping="container"]');

        container.innerHTML = `
          <section class="loader-container">
            <div class="loader"></div>
          </section>`;

        try {

            let
                PROD_PRECO = wsMain.globalData['infoProduto'].precos.preco_promocao || wsMain.globalData['infoProduto'].precos.preco,
                PROD_PESO = 0,
                PROD_PRAZO = wsMain.modules['pag-produto'].cache['prazo'],
                LV_ID = document.querySelector("#HD_LV_ID").value,
                PROD_ID = document.querySelector("#LV_HD_PROD_ID").value,
                QTD = document.querySelector('#TxtQtdAdd')?.value || '1'

            let VarFaltaXFreteGratis = typeof ws_fretegratis_faltaX !== 'undefined' ? "1" : "0";

            let params = {
                "LV_ID": LV_ID,
                "PED_ID": "0",
                "TOTAL": PROD_PRECO,
                "PROD_PRAZO": PROD_PRAZO,
                "QTD": QTD,
                "cep_orig": "VAZIO",
                "cep_dest": CEP,
                "peso": PROD_PESO,
                "ESEDEX_LOG": "VAZIO",
                "ESEDEX_PASS": "VAZIO",
                "LV_FRETE_ACEITAR": "VAZIO",
                "PROD_ID": PROD_ID,
                "FALTA_X": VarFaltaXFreteGratis,
                "JSON": "1"
            }

            let uri = endPointRestCalls + "/CheckoutSmart/CalculaFrete.aspx";

            uri += '?'
            Object.keys(params).forEach(p => {
                uri += p + '=' + params[p] + "&"
            });
            uri = uri.substring(0, uri.length - 1);

            let response = await fetch(uri);


            let data = await response.json();


            try {
            } catch (e) {
                container.innerHTML = ``;
                setTimeout(() => { container.innerHTML = `N&atilde;o foi poss&iacute;vel localizar um m&eacute;todo de envio para esse produto.`; }, 200);
                return;
            }

            if (data.length == 0) {
                container.innerHTML = ``;
                setTimeout(() => { container.innerHTML = `Nenhum m&eacute;todo de envio localizado para esse produto.`; }, 200);
                return;
            }

            if (data) localStorage.setItem('CEP_CART_KEEP', CEPtoSave);

            wsMain.globalData['shippingInfo'] = data;

            let shippingList = wsMain.tools.createElm('ul');

            data.forEach(shippingMethod => {
                let newShippingItem = wsMain.tools.createElm('li');

                let shippingValue = parseFloat(shippingMethod.valor);

                if (shippingValue == 0) shippingValue = 'Gr&aacute;tis'
                else shippingValue = wsMain.data.treatPrice(shippingValue)

                const [bussinessDay] = shippingMethod.prazo.split(' ')

                let prazo = `${shippingMethod.prazo}`

                if (bussinessDay && typeof over_wsShippingToDateMsg !== "undefined") {
                    const formatedBussinessDay = this.addBusinessDays(bussinessDay)

                    let msg = 'Entrega'

                    if (shippingMethod.tipo.toLowerCase().includes('retirada') || shippingMethod.tipo.toLowerCase().includes('retirar')) {
                        msg = 'Retirar'
                    }

                    prazo = `${msg} at&eacute; ${formatedBussinessDay}`
                }

                newShippingItem.innerHTML = `
                <span>
                ${shippingMethod.tipo}
                </span>
                <span>
                ${shippingValue}
                </span>
                <span>
                ${prazo}
                </span>
                `;

                shippingList.append(newShippingItem);
            });

            container.querySelector('.loader-container').style.opacity = '0';
            setTimeout(() => {
                container.innerHTML = ''
                container.append(shippingList);
            }, 200);

        } catch (e) {
            setTimeout(() => { container.innerHTML = `N&atilde;o foi poss&iacute;vel localizar um m&eacute;todo de envio para esse produto.`; }, 200);
        }

        return;
    },
    floatPrice() {
        try {
            let floatingContainer = document.querySelector('[data-wsjs-product="floatPrice"]');

            let h = floatingContainer.offsetHeight;
            let hVrf = (document.querySelector('body').offsetHeight - window.innerHeight) * .85;

            if (scrollY >= hVrf) floatingContainer.style.transform = 'translateY(100%)';
            else floatingContainer.style.transform = 'translateY(0)';
        } catch (err) { }
    },
    openShareOptions(e) {
        if (e.nextElementSibling.style.transform == 'none') return;

        e.nextElementSibling.style.transform = 'none';

        function closeShareOptions(e) {
            document.querySelector('.prod-social-share-items').style.transform = 'rotateX(90deg)'
            document.removeEventListener('click', closeShareOptions);
        }

        setTimeout(() => {
            document.addEventListener('click', closeShareOptions);
        }, 5);
    },
    async sendNotificationForm() {
        let Nome = '', Email = '';

        Nome = document.querySelector('input[data-wsjs-contact="Nome"]')?.value
        Email = document.querySelector('input[data-wsjs-contact="E-mail"]')?.value

        if (!Nome || !Email) return;

        let LV_ID = document.querySelector('#HD_LV_ID').value;
        let PROD_ID = document.querySelector('#LV_HD_PROD_ID')?.value || 'undefined';

        let url = `/indiqueAJAX/carrinho.aspx?tipo=LembrarDisponivel&LV_ID=${LV_ID}&PROD_ID=${PROD_ID}&EMAIL=${Email}&NOME=${Nome}`;

        let config = {
            method: 'GET'
        };

        let data = await fetch(url, config);
        let response = await data.text();

        document.querySelectorAll('[data-wsjs-contact]').forEach(inpt => inpt.value = '');

        if (response == '1') {
            document.querySelector('.contact-message').innerHTML = '<span>Cadastro realizado com sucesso</span>Voc&ecirc; ser&aacute; notificado por e-mail quando o produto estiver dispon&iacute;vel novamente.';
            document.querySelector('.contact-message').classList.add('success');
        } else if (response == '2') {
            document.querySelector('.contact-message').innerHTML = '<span>Email j&aacute; cadastrado</span>Voc&ecirc; ser&aacute; notificado por e-mail quando o produto estiver dispon&iacute;vel novamente.';
            document.querySelector('.contact-message').classList.add('success');
        } else {
            document.querySelector('.contact-message').innerHTML = '<span>N&atilde;o conseguimos enviar sua mensagem</span>Revise o formul&aacute;rio e envie sua mensagem novamente.';
            document.querySelector('.contact-message').classList.add('error');
        }

        document.querySelector('.contact-message-container').style.display = 'block';
        setTimeout(() => {
            document.querySelector('.contact-message-container').style.opacity = '1';
        }, 1);

        document.querySelector('input[type=submit]').removeAttribute('disabled');
    },
    createKits() {
        const kits = wsMain?.globalData?.infoProduto?.kit;

        if (!kits || !Array.isArray(kits) || !kits.length) return;

        const kitsContainer = document.getElementById("kits-container");
        if (!kitsContainer) return;

        kitsContainer.innerHTML = "";

        kits.forEach((kit) => {
            try {
                const kitDiv = document.createElement("div");
                kitDiv.classList.add("kit__item");

                const span = document.createElement("span");
                span.classList.add("kit__label");
                span.textContent = kit.nome;
                kitDiv.appendChild(span);

                const select = document.createElement("select");
                select.classList.add("LV_COMBO_PROD_GENERO", "kit__combo");
                select.id = `kit_variation_${kit.id}`;


                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Selecione";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                select.appendChild(defaultOption);


                kit.variacoes.forEach((variacao) => {
                    if (variacao.estoque > 0) {
                        const option = document.createElement("option");
                        option.value = variacao.id;


                        const textoOption = variacao.atributos
                            .map(attr => attr.valor?.split("|")[0]?.trim())
                            .filter(Boolean)
                            .join(" - ");

                        option.textContent = textoOption || "Sem atributos";
                        select.appendChild(option);
                    }
                });

                const selectWrapper = document.createElement("div");
                selectWrapper.classList.add("kit-combo-wrapper");
                selectWrapper.appendChild(select);

                kitDiv.appendChild(selectWrapper);
                kitsContainer.appendChild(kitDiv);

            } catch (e) { }
        });
    }
});


function FuncaoRecebeJsonSubProdutos(json) {
    json = JSON.parse(json);

    Object.keys(json).forEach(key => {
        if (!json[key] || json[key] == '' || json[key].length == 0) delete json[key];
    });

    try {
        wsMain.options['pag-produto'].isVariation = true;
    } catch (err) {
    }

    wsMain.modules['pag-produto'].update(json);
}





wsMain.modules['pag-produto'].subFunctions._wsBindZoomOnce = function _wsBindZoomOnce() {
    try {

        const hasModal = document.querySelector('[data-wsjs-productmodal],[data-wsjs-product="modal"]');
        if (hasModal || typeof window.wsLightboxOpen !== 'function') return;
        const container = document.querySelector('.prod-photo-container');

        if (!container) return;
        if (container.dataset.wszoomBound === '1') return;
        container.dataset.wszoomBound = '1';


        container.addEventListener('click', function (ev) {
            const img = ev.target && ev.target.closest('img');
            if (!img) return;

            const inPhotos = !!img.closest('[data-wsjs-product="photos"]');
            const inDots = !!img.closest('[data-wsjs-product="dots"]');
            if (!inPhotos && !inDots) return;


            const anchor = img.closest('a');
            if (anchor) {
                ev.preventDefault();
                ev.stopPropagation();
            }


            let idx = img.getAttribute('data-idx');
            idx = (idx != null) ? Number(idx) : -1;

            const info = wsMain?.globalData?.infoProduto || {};
            const fotos = Array.isArray(info.fotos) ? info.fotos : [];


            if (idx < 0) {
                const src = img.getAttribute('src') || anchor?.getAttribute('href') || '';
                idx = fotos.findIndex(f =>
                    f.zoom === src || f.normal === src || f.thumb === src
                );
            }

            if (idx < 0 || !fotos[idx]) return;

            const foto = fotos[idx];
            const zoomSrc = foto.zoom || foto.normal || foto.thumb;
            if (!zoomSrc) return;

            if (typeof window.wsLightboxOpen === 'function') {
                window.wsLightboxOpen(zoomSrc);
            } else {

                window.open(zoomSrc, '_blank', 'noopener');
            }
        }, { capture: true });
    } catch (e) { }
};


wsMain.modules['pag-produto'].subFunctions._wsTagIdxPhotos = function _wsTagIdxPhotos() {
    try {
        const container = document.querySelector('.prod-photo-container');
        if (!container) return;
        const photos = container.querySelector('[data-wsjs-product="photos"]');
        if (!photos) return;

        const optsStr = photos.getAttribute('data-wsjs-options') || '';
        const isList = /(^|;)\s*list\s*:\s*(true|\"true\"|\'true\')\s*(;|$)/i.test(optsStr);

        const imgs = photos.querySelectorAll('img');
        if (!imgs.length) return;



        imgs.forEach((img, i) => img.setAttribute('data-idx', String(i)));
    } catch (e) { }
};
wsMain.modules['pag-produto'].subFunctions._wsBindDotsOpenModal = function _wsBindDotsOpenModal() {
    try {
        const container = document.querySelector('.prod-photo-container');
        if (!container) {
            return;
        }


        const hasPhotosAnchor = !!container.querySelector('[data-wsjs-product="photos"]');
        if (hasPhotosAnchor) {
            return;
        }

        const dotsRoot = container.querySelector('[data-wsjs-product="dots"]');
        if (!dotsRoot) {
            return;
        }

        if (dotsRoot.dataset.wsDotsOpenBound === '1') {
            return;
        }
        dotsRoot.dataset.wsDotsOpenBound = '1';


        dotsRoot.addEventListener('click', function (ev) {
            const img = ev.target && ev.target.closest('img');
            if (!img) return;

            ev.preventDefault();
            ev.stopPropagation();


            let idxAttr = img.getAttribute('data-idx');
            let idx = (idxAttr != null && idxAttr !== '') ? Number(idxAttr) : NaN;

            if (Number.isNaN(idx)) {
                const allImgs = Array.from(dotsRoot.querySelectorAll('img'));
                idx = allImgs.indexOf(img);
                if (idx < 0) return;
            }



            const modalContainer = document.querySelector('[data-wsjs-productmodal]')
                || document.querySelector('[data-wsjs-product="modal"]');

            try { wsMain.modules['pag-produto'].openModal?.(); } catch (e) { }


            if (modalContainer) {

                const wasHidden = window.getComputedStyle(modalContainer).display === 'none';
                if (wasHidden) {
                    modalContainer.style.display = 'flex';
                    modalContainer.style.visibility = 'hidden';
                }


                setTimeout(() => {
                    const slides = wsMain.modules['pag-produto']?.cache?.slides || {};
                    const modal = slides.modalSlider;
                    const dotsModal = slides.dotsModalSlider;


                    try { modal?.moveToIdx?.(idx); } catch (e) { }


                    try {
                        modalContainer.style.display = 'flex';

                        if (wasHidden) modalContainer.style.visibility = '';
                        setTimeout(() => {
                            modalContainer.style.opacity = '1';
                            try { modal?.update?.(); } catch (e) { }
                            try { dotsModal?.update?.(); } catch (e) { }
                        }, 120);
                    } catch (_) { }


                    document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
                }, 40);
            }
        }, true);
    } catch (e) {
    }
};
