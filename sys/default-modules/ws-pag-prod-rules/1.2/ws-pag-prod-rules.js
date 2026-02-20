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
        fixModalDotsClick(dotsModalSlider, modalSlider) {
            if (!dotsModalSlider || !modalSlider) return;

            const cont = dotsModalSlider.container;
            if (!cont || cont.__wsDotsModalFixed) return;
            cont.__wsDotsModalFixed = true;

            // Evita que overlays de thumbs (Ã­cone de play, svg, etc.) comam o clique
            try {
                const style = document.createElement('style');
                style.textContent = `
      [data-wsjs-productmodal] [data-wsjs-product="dots"] .ws-prod-video-thumb *,
      [data-wsjs-productmodal] [data-wsjs-product="dots"] .ws-prod-video-thumb { pointer-events: none; }
    `;
                document.head.appendChild(style);
            } catch (_) { }

            const mod = wsMain.modules['pag-produto'];

            cont.addEventListener('click', (ev) => {
                // sobe atÃ© o slide
                const slideEl = ev.target.closest('.keen-slider__slide');
                if (!slideEl || !cont.contains(slideEl)) return;

                // Ã­ndice do slide dentro dos slides atuais do dotsModal
                const slides = dotsModalSlider.slides || Array.from(cont.querySelectorAll('.keen-slider__slide'));
                const idx = slides.indexOf(slideEl);
                if (idx < 0) return;

                ev.preventDefault();
                ev.stopPropagation();

                try {
                    if (typeof modalSlider.moveToIdx === 'function') {
                        modalSlider.moveToIdx(idx);
                        // manter autoplay do vÃ­deo correto
                        try { mod.playActiveSlideVideos(modalSlider); } catch (_) { }
                    }
                } catch (e) {
                    console.warn('fixModalDotsClick move error:', e);
                }
                return false;
            }, { capture: true });
        },

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

            // Detecta se existe Ã¢ncora de photos na pÃ¡gina
            const hasPhotosAnchor = !!document.querySelector(
                '[data-ws-anchor="photos"], #ws-anchor-photos, .ws-photos-anchor, .FotosHolder, #DivShowFotos'
            );

            // MantÃ©m opÃ§Ãµes originais e forÃ§a list:true APENAS quando nÃ£o hÃ¡ Ã¢ncora
            const eff = Object.assign({}, options);
            if (!hasPhotosAnchor) {
                eff.list = true;
            }

            // NÃƒO remover a foto principal automaticamente quando list:true
            if (eff.excludeMain === true && Array.isArray(copyProd.fotos) && copyProd.fotos.length > 0) {
                copyProd.fotos = copyProd.fotos.slice(1);
            }

            // === respeitar photoType (zoom/normal/thumb) ===
            const requestedKey = (eff.photoType === 'zoom' || eff.photoType === 'normal' || eff.photoType === 'thumb')
                ? eff.photoType
                : 'thumb';

            if (Array.isArray(copyProd.fotos)) {
                copyProd.fotos = copyProd.fotos.map(function (f) {
                    var item = Object.assign({}, f);
                    var ensure = function (key) { return (item[key] && String(item[key]).trim()) ? item[key] : null; };
                    if (!ensure(requestedKey)) {
                        var candidates = (requestedKey === 'zoom')
                            ? ['zoom', 'normal', 'thumb']
                            : (requestedKey === 'normal')
                                ? ['normal', 'zoom', 'thumb']
                                : ['thumb', 'normal', 'zoom'];

                        for (var i = 0; i < candidates.length; i++) {
                            var c = candidates[i];
                            if (ensure(c)) { item[requestedKey] = item[c]; break; }
                        }
                        if (!ensure(requestedKey)) {
                            item[requestedKey] = item.thumb || item.normal || item.zoom || '';
                        }
                    }
                    return item;
                });
            }

            // Render dos Dots com a chave pedida
            const sizeKey = requestedKey; // 'zoom' | 'normal' | 'thumb'
            const dotsDiv = wsMain.modules['pag-produto'].subFunctions.createSlide(copyProd, eff, sizeKey, false);
            dotsDiv.setAttribute('data-wsjs-product', 'dots');

            // >>> Autoplay nos vÃ­deos de Dots SOMENTE quando nÃ£o existe Ã¢ncora de photos
            if (!hasPhotosAnchor) {
                const videos = dotsDiv.querySelectorAll('video');
                videos.forEach(function (v) {
                    try {
                        v.setAttribute('muted', '');
                        v.muted = true;
                        v.setAttribute('autoplay', '');
                        v.setAttribute('playsinline', '');
                        v.setAttribute('preload', 'auto');
                        v.removeAttribute('controls');

                        const tryPlay = () => {
                            const p = v.play && v.play();
                            if (p && typeof p.catch === 'function') p.catch(() => { });
                        };

                        if (v.readyState >= 2) {
                            tryPlay();
                        } else {
                            v.addEventListener('canplay', tryPlay, { once: true });
                            v.addEventListener('loadedmetadata', tryPlay, { once: true });
                        }
                    } catch (e) {
                        console.warn('dots video autoplay warn:', e);
                    }
                });
            }
            // <<< fim autoplay

            // === Mapear cliques dos Dots para abrir DIRETO no Ã­ndice correto (sem animaÃ§Ã£o visÃ­vel)
            // - Usa o array original prod.fotos como "verdade" do Ã­ndice lÃ³gico
            // - Se vocÃª usou excludeMain:true, jÃ¡ foi tratado acima
            try {
                // Mapeia src -> index lÃ³gico (considerando a chave pedida e fallback)
                var indexMap = [];
                if (Array.isArray(copyProd.fotos)) {
                    indexMap = copyProd.fotos.map(function (f, idx) {
                        var src = (f && f[sizeKey]) ? String(f[sizeKey]).trim() : '';
                        return { idx: idx, src: src };
                    }).filter(function (x) { return !!x.src; });
                }

                // Cada dot gerado tem um <img> ou <video> com o src que usamos
                var dotNodes = dotsDiv.querySelectorAll('.listing-photos-container__dots > div, [data-wsjs-product="dots"] > div, [data-wsjs-product="dots"] .ws-prod-video-thumb, [data-wsjs-product="dots"] img');
                // fallback simples se a estrutura for sÃ³ <div> filhos diretos
                if (!dotNodes || dotNodes.length === 0) {
                    dotNodes = dotsDiv.querySelectorAll('div[style*="cursor"]');
                }

                // Normaliza: queremos clicar no 'div' wrapper do dot
                var wrapDots = [];
                dotNodes.forEach(function (n) {
                    var wrap = n;
                    if (n.tagName && n.tagName.toLowerCase() !== 'div') {
                        wrap = n.closest('div') || n;
                    }
                    if (wrapDots.indexOf(wrap) === -1) wrapDots.push(wrap);
                });

                wrapDots.forEach(function (wrap) {
                    var media = wrap.querySelector('img,video');
                    if (!media) return;
                    var src = String(media.getAttribute('src') || '').trim();
                    if (!src) return;

                    // acha o Ã­ndice lÃ³gico por src (exato)
                    var found = indexMap.find(function (m) { return m.src === src; });

                    // se nÃ£o achou por exato, tenta por prefixo (PEQ/MED/zoom variam)
                    if (!found) {
                        var base = src.replace(/\/(PEQ_|MED_)?/i, '/'); // remove PEQ_/MED_ do caminho
                        found = indexMap.find(function (m) {
                            return m.src === base ||
                                m.src.endsWith(base.split('/').pop());
                        });
                    }

                    var idx = found ? found.idx : wrapDots.indexOf(wrap); // fallback: posiÃ§Ã£o do dot
                    wrap.setAttribute('data-dot-index', String(idx));

                    // intercepta o clique para abrir direto no slide
                    wrap.addEventListener('click', function (ev) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        // abre o zoom jÃ¡ no Ã­ndice, sem animaÃ§Ã£o visÃ­vel
                        window.wsPagProd_goToPhoto && window.wsPagProd_goToPhoto(idx);
                        return false;
                    }, { capture: true });
                });
            } catch (err) {
                console.warn('dots attach click mapping warn:', err);
            }

            return dotsDiv;
        },
        photos(prod, options, text) {
            const copyProd = structuredClone(prod)

            if (options?.list && prod?.fotos && Array.isArray(prod.fotos) && prod.fotos.length > 0) {
                copyProd['fotos'] = [copyProd.fotos[0]]
            }

            let photosDiv = wsMain.modules['pag-produto'].subFunctions.createSlide(copyProd, options, 'normal', false);
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
                    const src = p[photoType];
                    const isVideo = typeof src === 'string' && /\.(webm|mp4)(\?|$)/i.test(src);

                    if (isVideo) {
                        const baseAttrs = { src, autoplay: '', loop: '', muted: '', playsinline: '', preload: 'auto' };
                        const attrs = (photoType === 'thumb') ? baseAttrs : Object.assign({}, baseAttrs, { controls: '' });
                        const video = wsMain.tools.createElm({ type: 'video', attrs });
                        video.classList.add('ws-prod-video');

                        const wrap = wsMain.tools.createElm('div');
                        if (photoType === 'thumb') {
                            const holder = wsMain.tools.createElm('div');
                            holder.classList.add('ws-prod-video-thumb');
                            const overlay = wsMain.tools.createElm('span');
                            overlay.setAttribute('data-wsjs-icon', 'play');
                            holder.append(video); holder.append(overlay);
                            wrap.append(holder);
                        } else {
                            wrap.append(video);
                        }

                        div.append(wrap);
                    } else {
                        let img = wsMain.tools.createElm({
                            type: 'img',
                            lazyLoad: lazy,
                            attrs: {
                                alt: 'Foto ' + (pIdx + 1) + ' do Produto',
                                src: src
                            }
                        });
                        let imgHolder = wsMain.tools.createElm('div');
                        imgHolder.append(img);
                        div.append(imgHolder);
                    }
                });
                children = true;
            }

            let ytVideoCode = wsMain.data.getYouTubeVideoId(prod.video);
            if (ytVideoCode) {
                if (photoType == 'thumb') {
                    div.innerHTML += `<div><div style="background-image: url(https://i.ytimg.com/vi_webp/${ytVideoCode}/sddefault.webp);" class="iframe-overlay">${options.icon || "<span data-wsjs-icon='play'></span>"}</div></div>`;
                } else {
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
                console.log(err)
            }

            if (!options?.modal) {
                div.append(containerList);
                return div;
            }

            if (installmentsNum < 1) {
                return div;
            };

            /* popup/modal parcelas */
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
        /* SUBFUNCTION: Wires dos DOTS dentro do modal (zoom) â€” mobile
   - Atribui data-dot-index para TODOS os dots (imagem/vÃ­deo)
   - Faz o clique mover o slider do modal
   - Auto-observa o DOM para rodar somente quando o modal/dots existirem */
        wireModalDots: function () {
            const mod = wsMain.modules['pag-produto'];
            if (!mod) return;

            function getModalSliderInstance() {
                try {
                    const slidesCache = (mod.cache && mod.cache['slides']) || {};
                    return slidesCache.modalSlider || null;
                } catch (_e) { return null; }
            }

            function normalizeDotsIndexes(root) {
                try {
                    const holders = root.querySelectorAll('[data-wsjs-product="dots"] .keen-slider');
                    holders.forEach((holder) => {
                        const items = Array.from(holder.children || []);
                        items.forEach((dotElm, i) => {
                            const clickable =
                                dotElm.querySelector('[data-dot-index]') ||
                                dotElm.querySelector('.ws-prod-video-thumb') ||
                                dotElm.firstElementChild ||
                                dotElm;
                            if (clickable && !clickable.hasAttribute('data-dot-index')) {
                                clickable.setAttribute('data-dot-index', String(i));
                            }
                        });
                    });
                } catch (e) {
                    console.log('normalizeDotsIndexes error:', e);
                }
            }

            function bindDotsClicks(root) {
                const modalSlider = getModalSliderInstance();
                const holders = root.querySelectorAll('[data-wsjs-product="dots"] .keen-slider');
                holders.forEach((holder) => {
                    const items = Array.from(holder.children || []);
                    items.forEach((dotElm, i) => {
                        const clickable =
                            dotElm.querySelector('[data-dot-index]') ||
                            dotElm.querySelector('.ws-prod-video-thumb') ||
                            dotElm.firstElementChild ||
                            dotElm;

                        if (!clickable) return;

                        // Evita mÃºltiplos binds
                        if (clickable.__ws_modal_dot_bound) return;
                        clickable.__ws_modal_dot_bound = true;

                        clickable.addEventListener('click', function (ev) {
                            ev.preventDefault();
                            ev.stopPropagation();

                            const idxAttr = this.getAttribute('data-dot-index');
                            const idx = Number.isFinite(+idxAttr) ? +idxAttr : i;

                            const slider = getModalSliderInstance();
                            if (slider && typeof slider.moveToIdx === 'function') {
                                slider.moveToIdx(idx);
                                // MantÃ©m autoplay do vÃ­deo ativo no slide
                                try { mod.playActiveSlideVideos(slider); } catch (_e) { }
                            } else if (window.wsPagProd_goToPhoto) {
                                window.wsPagProd_goToPhoto(idx);
                            }
                            return false;
                        }, { capture: true });
                    });
                });
            }

            function process(root) {
                if (!root) return;
                normalizeDotsIndexes(root);
                bindDotsClicks(root);
            }

            // 1) Se o modal jÃ¡ estiver no DOM, processa agora
            const initial = document.querySelector('[data-wsjs-productmodal]') ||
                document.querySelector('[data-wsjs-product="modal"]');
            if (initial) process(initial);

            // 2) Observa aberturas/updates do modal e aplica quando surgir
            if (!mod.__wireModalDotsObserver) {
                const mo = new MutationObserver((muts) => {
                    for (const m of muts) {
                        m.addedNodes && m.addedNodes.forEach((n) => {
                            if (!(n instanceof HTMLElement)) return;
                            if (
                                n.matches?.('[data-wsjs-productmodal], [data-wsjs-product="modal"]') ||
                                n.querySelector?.('[data-wsjs-productmodal], [data-wsjs-product="modal"]')
                            ) {
                                const root = n.matches?.('[data-wsjs-productmodal], [data-wsjs-product="modal"]')
                                    ? n
                                    : n.querySelector?.('[data-wsjs-productmodal], [data-wsjs-product="modal"]');
                                process(root || document);
                            }
                        });
                    }
                });
                mo.observe(document.body, { childList: true, subtree: true });
                mod.__wireModalDotsObserver = mo;
            }

            // 3) Observa troca de slides no modal para manter autoplay do vÃ­deo
            //    (caso o mÃ³dulo jÃ¡ possua um emissor de eventos, deixe como estÃ¡ â€” este Ã© defensivo)
            try {
                const slider = getModalSliderInstance();
                if (slider && !slider.__ws_video_autoplay_bound) {
                    slider.__ws_video_autoplay_bound = true;
                    slider.on('animationEnded', () => {
                        try { mod.playActiveSlideVideos(slider); } catch (_e) { }
                    });
                }
            } catch (_e) { }
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
                    let photosToUse = json.fotos;

                    let dotsSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'thumb', false, photosToUse);
                    let dotsModalSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'thumb', false, photosToUse);
                    let photosSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'normal', false, photosToUse);
                    let modalSlides = wsMain.modules['pag-produto'].subFunctions.createSlide(wsMain.globalData.infoProduto, {}, 'zoom', false, photosToUse);

                    if (wsMain.modules['pag-produto'].cache['slides'].photoSlider) {
                        wsMain.modules['pag-produto'].cache['slides'].photoSlider.container.parentNode.innerHTML = photosSlides.innerHTML;
                        wsMain.modules['pag-produto'].cache['slides'].photoSlider.update();
                    }

                    if (wsMain.modules['pag-produto'].cache['slides'].dotSlider) {
                        wsMain.modules['pag-produto'].cache['slides'].dotSlider.container.parentNode.innerHTML = dotsSlides.innerHTML;
                        wsMain.modules['pag-produto'].cache['slides'].dotSlider.update();
                    }

                    if (wsMain.modules['pag-produto'].cache['slides'].modalSlider) {
                        wsMain.modules['pag-produto'].cache['slides'].modalSlider.container.parentNode.innerHTML = modalSlides.innerHTML;
                        wsMain.modules['pag-produto'].cache['slides'].modalSlider.update();
                    }

                    if (wsMain.modules['pag-produto'].cache['slides'].dotsModalSlider) {
                        wsMain.modules['pag-produto'].cache['slides'].dotsModalSlider.container.parentNode.innerHTML = dotsModalSlides.innerHTML;
                        wsMain.modules['pag-produto'].cache['slides'].dotsModalSlider.update();
                    }

                    try {
                        wsMain.modules['pag-produto'].slideTreat();
                    } catch (e) {
                        console.log('teste de slidetreat', e)
                    }

                }


            } catch (_) {
                console.log(_)
            }

            try {
                delete json['nome'];
            } catch (_) { }

            let newPrices = JSON.parse(JSON.stringify(json['precos']));

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
        } catch (err) {
            console.log(err);
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
                    // Get today's date and time
                    let now = new Date().getTime();

                    // Find the distance between now and the count down date
                    let distance = countDownDate - now;

                    // Time calculations for days, hours, minutes and seconds
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
            console.log(err)
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
    },
    slideTreat() {
        try {
            var photosDiv = document.querySelector('[data-wsjs-product="photos"]'),
                photosSlideOption = wsMain.tools.getWsData(photosDiv, 'slide');

            if (photosSlideOption) {
                try { photosSlideOption = { ...wsMain.options['pag-produto'].slide['photos'], ...photosSlideOption }; } catch (_) { }
            }

            var dotsDiv = document.querySelector('[data-wsjs-product="dots"]'),
                dotsSlideOption = wsMain.tools.getWsData(dotsDiv, 'slide');

            if (dotsSlideOption && !dotsSlideOption['forcing-slides']) {
                try { dotsSlideOption = { ...wsMain.options['pag-produto'].slide['dots'], ...dotsSlideOption }; } catch (err) { }
            }

            var modalDiv = document.querySelector('[data-wsjs-product="modal"]'),
                modalSlideOption = wsMain.tools.getWsData(modalDiv, 'slide');

            let modalContainer = document.querySelector('[data-wsjs-productmodal]') || modalDiv;

            if (modalSlideOption) {
                try { modalSlideOption = { ...wsMain.options['pag-produto'].slide['modal'], ...modalSlideOption }; } catch (_) { }
            }

            var dotsModalDiv = document.querySelector('[data-wsjs-productmodal] [data-wsjs-product="dots"]'),
                dotsModalSlideOption = wsMain.tools.getWsData(dotsModalDiv, 'slide');

            // --- Plugins (definiÃ§Ãµes) ---
            /* Helper seguro para sincronizar thumbs do MODAL com o slider principal */
            function ThumbnailPlugin(mainSlider) {
                return (thumbsSlider) => {
                    function removeActive() {
                        thumbsSlider.slides.forEach((s) => s.classList.remove('is-active'));
                    }
                    function addActive(idx) {
                        const rel = idx >= 0 ? idx : 0;
                        thumbsSlider.slides[rel]?.classList.add('is-active');
                    }

                    thumbsSlider.on('created', () => {
                        // marca ativo inicial
                        addActive(thumbsSlider.track?.details?.rel ?? 0);

                        // clique no dot => vai para o Ã­ndice correspondente no modal
                        thumbsSlider.slides.forEach((slide, idx) => {
                            if (slide.__wsDotBound) return;
                            slide.__wsDotBound = true;
                            slide.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try { mainSlider.moveToIdx(idx); } catch (_) { }
                                return false;
                            }, { capture: true });
                        });

                        // quando o principal anima, sincroniza estado e (sÃ³ se couber) move os thumbs
                        mainSlider.on('animationStarted', (main) => {
                            try {
                                const nextAbs = main.animator?.targetIdx ?? main.track?.details?.rel ?? 0;
                                const nextRel = main.track?.absToRel ? main.track.absToRel(nextAbs) : nextAbs;

                                removeActive();
                                addActive(nextRel);

                                const maxIdx = thumbsSlider.track?.details?.maxIdx ?? 0;
                                // âš ï¸ SÃ³ move os thumbs se houver rolagem possÃ­vel (maxIdx > 0)
                                if (maxIdx > 0) {
                                    thumbsSlider.moveToIdx(Math.min(maxIdx, nextRel));
                                } else {
                                    // Sem rolagem possÃ­vel (poucos dots): garante posiÃ§Ã£o em 0
                                    if (typeof thumbsSlider.moveToIdx === 'function') thumbsSlider.moveToIdx(0);
                                }
                            } catch (_) { }
                        });
                    });
                };
            }

            function keyArrowsPlugin() {
                return (slider) => {
                    document.addEventListener('keydown', function (event) {
                        const blocked = ['input', 'textarea', 'select'];
                        if (blocked.includes(document.activeElement.tagName.toLowerCase())) return;
                        if (event.key == 'ArrowLeft') slider.prev();
                        if (event.key == 'ArrowRight') slider.next();
                    });
                }
            }

            function ModalPlugin(main) {
                return (slider) => {
                    if (main && main.animator) {
                        main.on("slideChanged", () => {
                            try {
                                const next = main.animator.targetIdx || 0;
                                if (slider.track.details.abs != next) slider.moveToIdx(next);
                            } catch (_) { }
                        });
                    } else if (main) {
                        main.querySelectorAll && main.querySelectorAll('img').forEach((img, idx) => {
                            img.addEventListener('click', () => slider.moveToIdx(idx))
                        });
                    }
                }
            }

            function ZoomPlugin() {
                return (slider) => {
                    if (typeof ImageZoom == 'undefined' || !ImageZoom) return;
                    try {
                        document.querySelectorAll('[data-wsjs-product-state] > .js-image-zoom__zoomed-image').forEach(div => div.remove());
                    } catch (_) { }

                    slider.slides.forEach((slide) => {
                        if (slide.querySelector('img') && !slide.querySelector('.pseudo-youtube-frame')) {
                            const imgWrap = slide.querySelector('div');
                            const img = slide.querySelector('img');
                            if (!imgWrap || !img) return;
                            const zoomDiv = wsMain.tools.createElm('zoom');
                            imgWrap.appendChild(zoomDiv);
                            zoomDiv.append(img);

                            let container = document.querySelector('[data-wsjs-product-state]');
                            let width = (container.clientWidth - 38) / 2;

                            ImageZoom(zoomDiv, {
                                zoomWidth: width,
                                zoomHeight: width,
                                zoomPosition: 'left',
                                zoomContainer: container,
                                offset: { vertical: 0, horizontal: 0 },
                                zoomStyle: "transform: translate(50%, 50%) scale(2); z-index: 2;top: 2rem; left: calc(2rem - 0.1rem);"
                            });
                        }
                    });
                }
            }

            // --- CriaÃ§Ã£o dos sliders SEM plugins no 3Âº parÃ¢metro ---
            let [photoSuccess, photoSlider] = photosSlideOption
                ? wsMain.tools.createSlide(photosDiv, photosSlideOption, [])
                : [false, null];

            let [dotSuccess, dotSlider] = dotsSlideOption
                ? wsMain.tools.createSlide(dotsDiv, dotsSlideOption, [])
                : [false, null];

            let [modalSuccess, modalSlider] = modalSlideOption
                ? wsMain.tools.createSlide(modalDiv, modalSlideOption, [])
                : [false, null];

            let [dotsModalSuccess, dotsModalSlider] = dotsModalSlideOption
                ? wsMain.tools.createSlide(dotsModalDiv, dotsModalSlideOption, [])
                : [false, null];

            // Plugin de thumbs (versÃ£o segura acima)
            if (modalSlider && dotsModalSlider) {
                const plugThumbsModal = ThumbnailPlugin(modalSlider);
                plugThumbsModal(dotsModalSlider);

                // ðŸ‘‡ Ajuste de layout quando a qtd de dots <= perView
                try {
                    const perViewDots =
                        (dotsModalSlider.options && dotsModalSlider.options.slides && dotsModalSlider.options.slides.perView)
                        || 1;

                    const totalDots = (dotsModalSlider.slides && dotsModalSlider.slides.length) || 0;

                    if (totalDots <= perViewDots) {
                        // sem rolagem: desabilita drag, borracha e centralizaÃ§Ã£o
                        dotsModalSlider.update({
                            drag: false,
                            rubberband: false,
                            // em versÃµes recentes a chave Ã© "align". Se seu parser usa alignCenter, ele serÃ¡ ignorado aqui.
                            align: 'start',
                            slides: { perView: totalDots }
                        });

                        // forÃ§a um reflow/resize para recalcular positions corretamente
                        requestAnimationFrame(() => {
                            try { dotsModalSlider.update(); } catch (_) { }
                        });
                    } else {
                        // com rolagem: garante que o update pÃ³s-mount corrija medidas pÃ³s-modal-visÃ­vel
                        requestAnimationFrame(() => {
                            try { dotsModalSlider.update(); } catch (_) { }
                        });
                    }
                } catch (_) { }
            }

            // --- AplicaÃ§Ã£o manual dos "plugins" apÃ³s os sliders existirem ---
            try {
                if (photoSlider) {
                    if (wsMain.globalData.infoProduto['tipo_zoom_fotos'] == '1') {
                        const plugZoom = ZoomPlugin(); plugZoom(photoSlider);
                    }
                    const plugArrows = keyArrowsPlugin(); plugArrows(photoSlider);

                    // re-aplica zoom ao trocar de slide (evita imagem cortada)
                    if (wsMain.globalData.infoProduto['tipo_zoom_fotos'] == '1' && photoSlider.on) {
                        photoSlider.on('slideChanged', () => {
                            if (typeof ImageZoom == 'undefined' || !ImageZoom) return;
                            try {
                                document.querySelectorAll('[data-wsjs-product-state] > .js-image-zoom__zoomed-image').forEach(d => d.remove());
                            } catch (_) { }
                            const active = photoSlider.container.querySelector('.keen-slider__slide.active, .keen-slider__slide[aria-hidden="false"]');
                            if (!active) return;
                            const imgWrap = active.querySelector('div');
                            const img = active.querySelector('img');
                            if (!imgWrap || !img) return;
                            const zoomDiv = wsMain.tools.createElm('zoom');
                            imgWrap.appendChild(zoomDiv);
                            zoomDiv.append(img);
                            let container = document.querySelector('[data-wsjs-product-state]');
                            let width = (container.clientWidth - 38) / 2;
                            try {
                                ImageZoom(zoomDiv, {
                                    zoomWidth: width, zoomHeight: width, zoomPosition: 'left', zoomContainer: container,
                                    offset: { vertical: 0, horizontal: 0 },
                                    zoomStyle: "transform: translate(50%, 50%) scale(2); z-index: 2;top: 2rem; left: calc(2rem - 0.1rem);"
                                });
                            } catch (_) { }
                        });
                    }
                }
            } catch (_) { }

            try {
                if (photoSlider && dotSlider) {
                    const plugThumbs = ThumbnailPlugin(photoSlider);
                    plugThumbs(dotSlider);
                }
            } catch (_) { }

            try {
                if ((photoSlider || photosDiv) && modalSlider) {
                    const plugModal = ModalPlugin(photoSlider || photosDiv);
                    plugModal(modalSlider);
                }
            } catch (_) { }

            try {
                if (modalSlider && dotsModalSlider) {
                    const plugThumbsModal = ThumbnailPlugin(modalSlider);
                    plugThumbsModal(dotsModalSlider);
                }
            } catch (_) { }

            try {
                wsMain.modules['pag-produto'].subFunctions.fixModalDotsClick(dotsModalSlider, modalSlider);
            } catch (_) { }

            // --- DOTs abrem o modal jÃ¡ na imagem clicada (via photoSlider) ---
            try {
                wsMain.modules['pag-produto'].bindDotsOpenModal(
                    dotSlider,
                    modalSlider,
                    photoSlider,
                    dotsModalSlider,
                    modalContainer
                );
            } catch (_) { }

            // --- Modo legado (quando nÃ£o hÃ¡ dotsSlideOption) ---
            if (!dotsSlideOption && dotsDiv) {
                if (dotsDiv.parentNode && dotsDiv.parentNode.classList.contains('prod-photo-container')) {
                    dotsDiv.parentNode.classList.add('listing-photos-container')
                }
                dotsDiv.classList.add('listing-photos-container__dots')

                document.querySelectorAll('.listing-photos-container__dots > div').forEach((div, idx) => {
                    div.style.cursor = 'pointer';
                    div.addEventListener('click', () => {
                        try { photoSlider && photoSlider.moveToIdx(idx); } catch (_) { }
                        try { modalSlider && (modalSlider.container.dataset.wsVideoSound = 'on'); } catch (_) { }
                        document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
                        modalContainer.setAttribute('style', 'display: flex;');
                        setTimeout(() => {
                            modalContainer.setAttribute('style', 'display: flex; opacity: 1;');
                            if (modalSlider) modalSlider.update();
                            if (dotsModalSlider) dotsModalSlider.update();
                            try { wsMain.modules['pag-produto'].playActiveSlideVideos(modalSlider); } catch (_) { }
                        }, 50);
                    }, { passive: true });
                })
            }

            // --- Abrir modal ao clicar no slide principal (mantÃ©m comportamento) ---
            function openModalPlugin() {
                if (!modalContainer) return;
                const openAndSync = () => {
                    document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
                    try { modalSlider && (modalSlider.container.dataset.wsVideoSound = 'on'); } catch (_) { }
                    modalContainer.setAttribute('style', 'display: flex;');
                    setTimeout(() => {
                        modalContainer.setAttribute('style', 'display: flex; opacity: 1;');
                        if (modalSlider) modalSlider.update();
                        if (dotsModalSlider) dotsModalSlider.update();
                        try { wsMain.modules['pag-produto'].playActiveSlideVideos(modalSlider); } catch (_) { }
                    }, 50);
                };

                if (photoSlider && photoSlider.slides) {
                    photoSlider.slides.forEach(slide => {
                        slide.addEventListener('click', () => openAndSync());
                    });
                } else if (photosDiv) {
                    photosDiv.querySelectorAll('img').forEach((img) => {
                        img.addEventListener('click', () => openAndSync());
                    })
                }
            }
            openModalPlugin();

            // Guarda instÃ¢ncias no cache
            wsMain.modules['pag-produto'].cache['slides'] = {
                modalSlider: modalSlider,
                photoSlider: photoSlider,
                dotSlider: dotSlider,
                dotsModalSlider: dotsModalSlider
            };

            // === WIRE DOS VÃDEOS ===
            (function ensureVideoEvents() {
                const mod = wsMain.modules['pag-produto'];
                const slides = mod.cache?.slides || {};
                const wire = (typeof mod.wireSliderVideoEvents === 'function') ? mod.wireSliderVideoEvents.bind(mod) : null;
                if (!wire) return;
                ['photoSlider', 'dotSlider', 'modalSlider', 'dotsModalSlider'].forEach(key => {
                    const s = slides[key];
                    if (s && s.container && !s.__wsVideoWired) { try { wire(s); s.__wsVideoWired = true; } catch (_) { } }
                });
            })();

            let closeButton = wsMain.tools.createElm({
                type: 'span',
                attrs: {
                    'data-wsjs-icon': 'close',
                    class: 'close-button',
                    onclick: 'wsMain.modules["pag-produto"].closeModal()'
                }
            });

            wsMain.data.treatIcon(closeButton);
            if (modalContainer) modalContainer.append(closeButton);

            setTimeout(() => {
                if (modalSlider) modalSlider.update();
                if (photoSlider) photoSlider.update();
                if (dotSlider) dotSlider.update();
                if (dotsModalSlider) dotsModalSlider.update();
                setTimeout(() => {
                    if (modalSlider) modalSlider.update();
                    if (photoSlider) photoSlider.update();
                    if (dotSlider) dotSlider.update();
                    if (dotsModalSlider) dotsModalSlider.update();
                }, 50);

                document.querySelectorAll("*[data-wsjs-lazyload=scroll]").forEach((elm) => {
                    if (elm.getBoundingClientRect().top < window.innerHeight) wsMain.tools.lazyLoad(elm);
                });

                if (modalContainer) modalContainer.setAttribute('style', 'display: none;');
            }, 100);
        } catch (err) {
            console.log(err);
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

            console.log(response);

            let data = await response.json();

            console.log(data);

            try {
                console.log(`resultado calculo frete:${JSON.stringify(data)}`);
            } catch (e) {
                console.log(`resultado calculo frete ERROR:${data}`);
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

                // Adiciona a opÃƒÂ§ÃƒÂ£o inicial "Selecione"
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Selecione";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                select.appendChild(defaultOption);

                // Adiciona as opÃƒÂ§ÃƒÂµes das variaÃƒÂ§ÃƒÂµes
                kit.variacoes.forEach((variacao) => {
                    if (variacao.estoque > 0) {
                        const option = document.createElement("option");
                        option.value = variacao.id;

                        // Pega todos os valores dos atributos (separando em caso de mÃƒÂºltiplos via "|")
                        const textoOption = variacao.atributos
                            .map(attr => attr.valor?.split("|")[0]?.trim()) // pega o primeiro valor antes de "|"
                            .filter(Boolean) // remove valores vazios
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
    },
    // === HELPERS DE VÃDEO (SUBSTITUIR ESTES QUATRO) ===
    bindVideoAutoplay(container) {
        const vids = container.querySelectorAll('video.ws-prod-video');
        vids.forEach(v => {
            v.setAttribute('playsinline', '');
            if (!v.hasAttribute('preload')) v.setAttribute('preload', 'auto');
            v.setAttribute('loop', '');
            // fora do modal, manter muted p/ maximizar autoplay
            const isModal = !!container.closest('[data-wsjs-product="modal"]');
            if (!isModal) {
                v.muted = true;
                v.setAttribute('muted', '');
            }
        });
    },

    stopAllVideos(container) {
        container.querySelectorAll('video.ws-prod-video').forEach(v => {
            try { v.pause(); } catch (_) { }
        });
    },

    async playOneVideo(v, wantSound) {
        try {
            v.muted = !wantSound;
            if (wantSound) v.removeAttribute('muted'); else v.setAttribute('muted', '');
            await v.play();
        } catch (_) {
            // fallback: se com som nÃ£o rolar, tenta sem som
            if (wantSound) {
                try { v.muted = true; v.setAttribute('muted', ''); await v.play(); } catch (_e) { }
            }
        }
    },

    wireSliderVideoEvents(sliderInstance) {
        const mod = wsMain.modules['pag-produto'];
        if (!sliderInstance || !sliderInstance.container) return;

        // helper interno: atualiza estado dos vÃ­deos baseado na visibilidade dos slides
        const updateVideosByVisibility = () => {
            try {
                const c = sliderInstance.container;
                const details = sliderInstance.track?.details;
                const slidesMeta = details?.slides || [];
                const slidesEls = sliderInstance.slides || [];

                // Ã­ndices visÃ­veis (mesmo que parcialmente)
                const visibleIdx = [];
                for (let i = 0; i < slidesMeta.length; i++) {
                    if (slidesMeta[i] && slidesMeta[i].portion > 0) visibleIdx.push(i);
                }

                // pausa vÃ­deos de slides NÃƒO visÃ­veis
                for (let i = 0; i < slidesEls.length; i++) {
                    if (visibleIdx.indexOf(i) === -1) {
                        slidesEls[i].querySelectorAll('video.ws-prod-video').forEach(v => {
                            try { v.pause(); v.currentTime = 0; } catch (_) { }
                        });
                    }
                }

                // toca vÃ­deos de slides visÃ­veis
                const wantSound = !!c.closest('[data-wsjs-product="modal"]') || c.dataset.wsVideoSound === 'on';
                visibleIdx.forEach(i => {
                    const el = slidesEls[i];
                    if (!el) return;
                    el.querySelectorAll('video.ws-prod-video').forEach(v => mod.playOneVideo(v, wantSound));
                });
            } catch (_) { /* noop */ }
        };

        // preparaÃ§Ã£o inicial
        try {
            mod.bindVideoAutoplay(sliderInstance.container);
            updateVideosByVisibility();
        } catch (_) { }

        if (!sliderInstance.on) return;

        // dispara em QUALQUER mudanÃ§a de detalhes (drag, arrow, DOTs, programÃ¡tico)
        sliderInstance.on('detailsChanged', updateVideosByVisibility);

        // garantia extra ao finalizar a troca
        sliderInstance.on('slideChanged', updateVideosByVisibility);

        // se o slider for recriado, reconfigura
        sliderInstance.on('created', () => {
            try {
                mod.bindVideoAutoplay(sliderInstance.container);
                updateVideosByVisibility();
            } catch (_) { }
        });

        // ao destruir, pausa geral
        sliderInstance.on('destroyed', () => {
            try { mod.stopAllVideos(sliderInstance.container); } catch (_) { }
        });
    },

    // --- DOTs abrem o modal jÃ¡ na imagem clicada (via photoSlider) ---
    bindDotsOpenModal(dotSlider, modalSlider, photoSlider, dotsModalSlider, modalContainer) {
        if (!dotSlider || !modalSlider || !modalContainer) return;

        const container = dotSlider.container;
        if (!container) return;

        // Evita listener duplicado ao reexecutar
        if (container.__wsDotsDelegated) return;
        container.__wsDotsDelegated = true;

        // Abre modal sincronizado com o Ã­ndice atual do photoSlider
        const openModal = (initialIdx) => {
            // habilita som no modal (autoplay pode cair em fallback mudo se o navegador barrar)
            try { modalSlider.container.dataset.wsVideoSound = 'on'; } catch (_) { }
            document.addEventListener('keyup', wsMain.modules['pag-produto'].closeModal, false);
            modalContainer.setAttribute('style', 'display: flex;');
            setTimeout(() => {
                modalContainer.setAttribute('style', 'display: flex; opacity: 1;');
                try { modalSlider.update(); } catch (_) { }
                try { dotsModalSlider && dotsModalSlider.update(); } catch (_) { }
                // >>> NOVO: posiciona o modal diretamente no Ã­ndice clicado
                try {
                    if (typeof initialIdx === 'number') {
                        // desabilita transiÃ§Ã£o sÃ³ nesta ida inicial (se seu CSS tiver a classe, melhor)
                        modalSlider.container.classList.add('no-transition-once');
                        modalSlider.moveToIdx(initialIdx);
                        setTimeout(() => modalSlider.container.classList.remove('no-transition-once'), 120);
                        // mantÃ©m os thumbs do modal sincronizados, se existirem
                        try { dotsModalSlider && dotsModalSlider.moveToIdx(initialIdx); } catch (_) { }
                    }
                } catch (_) { }
                try { wsMain.modules['pag-produto'].playActiveSlideVideos(modalSlider); } catch (_) { }
            }, 50);
        };

        // DelegaÃ§Ã£o: um Ãºnico listener no container dos DOTs
        container.addEventListener('click', (ev) => {
            // encontra o slide clicado (compatÃ­vel com re-render)
            const slideEl = ev.target && ev.target.closest('.keen-slider__slide');
            if (!slideEl || !container.contains(slideEl)) return;

            // Se o thumb tiver <video>, evita capturar o clique (jÃ¡ forÃ§amos pointer-events: none nos vÃ­deos de DOTs)
            // mas se algum thumbnail for <a>, evitamos navegaÃ§Ã£o
            const anchor = ev.target.closest('a');
            if (anchor) ev.preventDefault();

            // calcula o Ã­ndice do slide dentre os slides atuais do dotSlider
            let idx = -1;
            const slides = dotSlider.slides || Array.from(container.querySelectorAll('.keen-slider__slide'));
            for (let i = 0; i < slides.length; i++) {
                if (slides[i] === slideEl) { idx = i; break; }
            }
            if (idx < 0) return;

            // Alinha o principal e abre o modal; sem stopPropagation para nÃ£o conflitar com lÃ³gica do Keen
            try { photoSlider && photoSlider.moveToIdx(idx); } catch (_) { }
            openModal();
            // 1) Se existir slider de fotos, jÃ¡ alinhe antes de abrir (evita â€œroladinhaâ€)
            try { photoSlider && photoSlider.moveToIdx(idx); } catch (_) { }
            // 2) Abra o modal jÃ¡ com o Ã­ndice-alvo para o caso â€œsÃ³ dotsâ€ (ou como garantia)
            openModal(idx);
        }, false);

        // Se o Keen atualizar/recriar internamente, preservamos a delegaÃ§Ã£o (fica no container),
        // mas garantimos o cursor de "mÃ£o" nos slides atuais
        const paintPointer = () => {
            const slides = container.querySelectorAll('.keen-slider__slide');
            slides.forEach(s => { s.style.cursor = 'pointer'; });
        };
        // pinta jÃ¡ e tambÃ©m quando o dotsSlider avisar mudanÃ§as
        try { paintPointer(); } catch (_) { }
        try { dotSlider.on && dotSlider.on('detailsChanged', paintPointer); } catch (_) { }
    },

});

try { wsMain.modules['pag-produto'].subFunctions.wireModalDots(); } catch (_e) { }

function FuncaoRecebeJsonSubProdutos(json) {
    json = JSON.parse(json);

    Object.keys(json).forEach(key => {
        if (!json[key] || json[key] == '' || json[key].length == 0) delete json[key];
    });

    try {
        wsMain.options['pag-produto'].isVariation = true;
    } catch (err) {
        console.log(err)
    }

    wsMain.modules['pag-produto'].update(json);
}

// ==== HELPERS (novos) ====
// abre o zoom no Ã­ndice informado, sem animaÃ§Ã£o visÃ­vel
window.wsPagProd_goToPhoto = function (index) {
    try {
        // 1) Se o zoom jÃ¡ estiver disponÃ­vel (Swiper/Glide/etc.), pula direto sem animaÃ§Ã£o
        if (window.zoomSwiper && typeof zoomSwiper.slideTo === 'function') {
            // Swiper: segundo parÃ¢metro = speed (0 = instantÃ¢neo)
            if (!isZoomOpen()) openZoom();
            rAF2(function () { zoomSwiper.slideTo(index, 0); });
            return;
        }
        if (window.zoomGlide && zoomGlide.go) {
            // Glide: podemos desligar transiÃ§Ã£o sÃ³ na primeira ida
            var oldDur = (zoomGlide.settings && zoomGlide.settings.animationDuration) || 400;
            if (!isZoomOpen()) openZoom();
            rAF2(function () {
                try { zoomGlide.update({ animationDuration: 0 }); } catch (_) { }
                zoomGlide.go('=' + index);
                // restaura depois de um tick
                setTimeout(function () {
                    try { zoomGlide.update({ animationDuration: oldDur }); } catch (_) { }
                }, 50);
            });
            return;
        }

        // 2) API genÃ©rica do seu stack, se existir
        if (window.WS && WS.product && typeof WS.product.openPhoto === 'function') {
            WS.product.openPhoto(index); // muitos stacks jÃ¡ aceitam Ã­ndice direto
            return;
        }

        // 3) Fallback: abre modal e forÃ§a ir ao Ã­ndice com eventos/flags
        if (!isZoomOpen()) openZoom();
        // tenta localizar um slider genÃ©rico (data-attr conhecidos)
        rAF2(function () {
            // tente marcar data-initial-index para inicializaÃ§Ã£o (se o init ler isso)
            var holder = document.querySelector('.zoom-holder, .ws-zoom-holder, [data-zoom-holder]');
            if (holder) holder.setAttribute('data-initial-index', String(index));

            // tenta botÃµes de navegaÃ§Ã£o repetidos para chegar lÃ¡ rapidamente sem anim
            var slides = document.querySelectorAll('.zoom-slide, .ws-zoom-slide, [data-zoom-slide]');
            if (slides && slides[index]) {
                // EstratÃ©gia simples: pular por teclas/controles atÃ© o Ã­ndice,
                // mas primeiro sem transiÃ§Ã£o (remove classe de animaÃ§Ã£o se existir)
                disableFirstTransitionOnce();
                jumpToIndexByControls(index);
            }
        });
    } catch (e) {
        console.warn('wsPagProd_goToPhoto error:', e);
    }

    function isZoomOpen() {
        // Ajuste os seletores se necessÃ¡rios
        return !!document.querySelector('.zoom-open, .ws-zoom-open, body.modal-open, .modal-zoom-open');
    }

    function openZoom() {
        // EstratÃ©gias comuns: clicar na foto principal ou chamar uma funÃ§Ã£o global
        var btn = document.querySelector('[data-open-zoom], .js-open-zoom, .foto-principal, .prod-photo-main img');
        if (btn) {
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else if (window.WS && WS.product && typeof WS.product.openZoom === 'function') {
            WS.product.openZoom(); // caso exista
        }
    }

    function rAF2(fn) {
        requestAnimationFrame(function () { requestAnimationFrame(fn); });
    }

    function disableFirstTransitionOnce() {
        try {
            var root = document.querySelector('.zoom-wrapper, .ws-zoom-wrapper, .zoom-holder');
            if (!root) return;
            root.classList.add('no-transition-once');
            // CSS opcional (caso seu CSS jÃ¡ nÃ£o trate):
            // .no-transition-once * { transition: none !important; animation: none !important; }
            setTimeout(function () {
                root.classList.remove('no-transition-once');
            }, 120);
        } catch (_) { }
    }

    function jumpToIndexByControls(targetIndex) {
        try {
            // Se existir lista/thumbnails do zoom, tente clicar direto nela
            var thumbs = document.querySelectorAll('.zoom-thumbs img, .ws-zoom-thumbs img, [data-zoom-thumb]');
            if (thumbs && thumbs[targetIndex]) {
                thumbs[targetIndex].click();
                return;
            }
            // Caso contrÃ¡rio, use next/prev atÃ© chegar lÃ¡ (rÃ¡pido e sem anima)
            var current = getCurrentZoomIndex() || 0;
            var nextBtn = document.querySelector('.zoom-next, .ws-zoom-next, [data-zoom-next]');
            var prevBtn = document.querySelector('.zoom-prev, .ws-zoom-prev, [data-zoom-prev]');

            var steps = targetIndex - current;
            if (steps === 0) return;
            var click = function (el) {
                el && el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            };

            // desabilita transiÃ§Ã£o novamente sÃ³ por seguranÃ§a
            disableFirstTransitionOnce();

            if (steps > 0) {
                for (var i = 0; i < steps; i++) click(nextBtn);
            } else {
                for (var j = 0; j < Math.abs(steps); j++) click(prevBtn);
            }
        } catch (_) { }
    }

    function getCurrentZoomIndex() {
        // tente ler de um atributo/estado comum
        var active = document.querySelector('.zoom-slide.is-active, .ws-zoom-slide.is-active, [data-zoom-slide].is-active');
        if (!active) return 0;
        var idx = active.getAttribute('data-index') || active.getAttribute('data-slide-index');
        return idx ? parseInt(idx, 10) : 0;
    }
};


