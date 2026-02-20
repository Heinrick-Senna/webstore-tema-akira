//iniciar obtendo dados do objeto cartJson e montando o carrinho. ApÃƒÂ³s isso, manter um listnner observando a mudanÃƒÂ§a
//do parÃƒÂ¢metro lastUpdate, quando mudar ÃƒÂ© pq o carrinho precisa ser atualizado os dados.

/*
Exemplo de cartJson:
{"products":[{"productId":"4336244","itemId":"15278431","groupId":"","sku":"TABPREC002","name":"Produto de teste da loja","url":"/produto/28589/4336244/produto-de-teste-da-loja.aspx","pre_order":null,"add_info":null,"photo":"https://imageswscdn.wslojas.com.br/files/28589/PEQ_produto-de-teste-da-loja-74-1.jpg","gift_packaging":null,"quantity":9,"original_price":0.00,"real_price":95.00,"subtotal":0,"quantity_max":9,"quantity_min":1,"quantity_pack":1}],"tc":"2042f056782055f3638fff06563f72f36702f525322868132611","origemData":"CACHE","lastUpdate":"20240910193250","lvId":"28589","orderId":"","alert":null,"version":"20240912093809","subtotal":855.00,"cupom":{"name":null,"type":null,"amount":0},"shipping":{"selected":false,"isFree":false,"deadline":0,"price":0,"discount":0,"weight":0,"id":null,"name":null,"scheduling":null},"total":855.00,"discount":0,"cash_discount":10.00,"max_installments":12,"max_installments_no_interest":5,"installments_interest":2.99,"installments_min_value":5.00}
*/

//productQtdChange(itemId, qtd)  //observar lastUpdate para retorno

//removeProductCart(itemId, groupId) //observar lastUpdate

//shippingCalculate(cep) //observar objets (shippingMsgReturn e shippingOptionsReturn) apÃƒÂ³s o cÃƒÂ¡lculo

//shippingSelectOption(shippingId) //selecionar um mÃƒÂ©todo de envio

//(talvez nÃƒÂ£o use) cartDataRefresh() //nÃƒÂ£o serÃƒÂ¡ usado, mas caso necessÃƒÂ¡rio, ele forÃƒÂ§a uma verificaÃƒÂ§ÃƒÂ£o dos dados do carrinho

//cartCleanAll() //limpa o carrinho

//cartFinishOrder() //finaliza o pedido, verificar o objeto finishOrderButtonStatus true or false se o botÃƒÂ£o pode ou nÃƒÂ£o ser clicado

//cartCupomAdd(cupom) //cartCupomAddReturn = {};
//funcCupomFinished()  //funÃƒÂ§ÃƒÂ£o chamada pelo core da Webstore quando o cupom ÃƒÂ© inserido , analisar cartCupomAddReturn para ver o resultado

//giftPackAdd(itemID, productID)

//checkoutCartLoading()  //carregando na pÃƒÂ¡gina toda acima de tudo

//funcAlertMessageCart(msg) //essa funÃƒÂ§ÃƒÂ£o existe aqui no cÃƒÂ³digo, e ÃƒÂ© chamada quando hÃƒÂ¡ necessidade de exibiÃƒÂ§ÃƒÂ£o de uma mensagem para o usuÃƒÂ¡rio.
//criar ela no padrÃƒÂ£o visual dos alertas aqui

console.log('%c Checkout Smart Vrs.2026-01-07', 'background: green; color: #FFF');

let wsCartFinishButtonLabel = 'FINALIZAR COMPRA';
if (typeof over_wsCartFinishButtonLabel !== 'undefined') wsCartFinishButtonLabel = over_wsCartFinishButtonLabel;

let wsCartFinishBoletoPixMsg = 'no boleto ou PIX ';
if (typeof over_wsCartFinishBoletoPixMsg !== 'undefined') wsCartFinishBoletoPixMsg = over_wsCartFinishBoletoPixMsg;

let wsCart1XDescount = false;
if (typeof over_wsCart1XDescount !== 'undefined') wsCart1XDescount = over_wsCart1XDescount;

let wsShippingToDateMsg = false
if (typeof over_wsShippingToDateMsg !== 'undefined') wsShippingToDateMsg = over_wsShippingToDateMsg;

function funcAlertMessageCart(msg) {
    wsMain.modules['checkout-cart'].factoryFunctions.updateUserMessage(msg)

    const cepInfos = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos')
    const loader = cepInfos.querySelector('.carrinhoLoader-container')

    if(loader.classList.contains('loaderOn')) {
        loader.classList.remove('loaderOn')
        cepInfos.querySelector('[loaders-type="btn"]').style.display = ''
    }
}

function funcCupomFinished() {
    if(!cartCupomAddReturn.success) {
        wsMain.modules['checkout-cart'].factoryFunctions.updateUserMessage(cartCupomAddReturn, false, 'ws-core-msg')
    }
}

/*function funcShowLoaderGlobal() {
    wsMain.tools.showLoading();
}

function funcHideLoaderGlobal() {
    wsMain.tools.hideLoading();
}*/

wsMain.createModule({
    name: "checkout-cart",
    function: 'get',
    factoryFunctions: {
        linkToShare: '',
        linkToShareParams: {},
        formatPrices: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', }),
        cartPrices: {
            totalWithoutShipping: 0,
            cashDiscount: 0,
            shipping: 0,
        },

        createProds(prodsArr, proxyUserData) {
            if (!prodsArr || !prodsArr.length) {
                document.querySelector('.checkout-content > main').classList.add('popupHidden')
                document.querySelector('.checkout-content > .resumo').classList.add('popupHidden')
                document.querySelector('.float-resume').classList.add('popupHidden')
                document.querySelector('.checkout-content > .voltarCompras').classList.remove('popupHidden')

                return
            }

            const container = document.querySelector('#ws-carrinhoNovo .checkout-content .itensCarrinho')

            if (!container) return

            const productsStr = prodsArr.map(prod => {
                proxyUserData.total += Number(prod.quantity)
                proxyUserData.qntyToRemove += Number(prod.quantity)

                const isStoreGift = !!prod.storeGift

                const prodOriginalPrice = this.formatPrices.format(prod.original_price)
                const prodRealPrice = this.formatPrices.format(prod.real_price)
                const giftPacking = prod.gift_packaging?.active ? this.formatPrices.format(prod.gift_packaging.amount) : ''
                const cashBack = prod.cashback?.valor ? this.formatPrices.format(prod.cashback.valor) : ''

                let giftPackingElement = ``
                if (!isStoreGift && giftPacking) {
                    const checked = prod?.gift_packaging?.status ? 'checked' : ''
                    giftPackingElement = `
                <div class="presenteOption">
                    <div class="embrulharPresentes">
                        <label>
                            <div>
                                <input type="checkbox" class="embrulhar" name="embrulharPresente" ${checked}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="7.984" height="5.719" viewBox="0 0 7.984 5.719">
                                <path id="Caminho_9991" data-name="Caminho 9991" d="M151.5,1792.954l1.954,1.954,3.909-3.909" transform="translate(-150.439 -1789.939)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                </svg>
                            </div>                    
                            <span>Embrulhar para presente</span>
                        </label>
                    </div>

                    <div class="produtoPrecos__valores">
                        <p class="valores__preco">${giftPacking}</p>
                    </div>
                </div>
            `
                }

                let cashBackElement = ``
                if (!isStoreGift && cashBack) {
                    cashBackElement = `
            <div class="prod__cashBack">
                <p class="cashBack__msg"><span>Ganhe ${cashBack} de cashback</span></p>
            </div>
            `
                }

                let vars
                if (prod.add_info) {
                    vars = prod.add_info.map(elm => {
                        return `
                    <p variation="${elm.title.split(' ')[0]}">${elm.title}: ${elm.value}</p>
                `
                    }).join('')
                }

                // PreÃ§o exibido
                const priceHtml = isStoreGift
                    ? `<p class="valores__desconto valores__brinde">Brinde</p>`
                    : `
                <p class="valores__preco" style="${prod.original_price ? "" : "display: none;"}">${prodOriginalPrice}</p>
                <p class="valores__desconto">${prodRealPrice}</p>
                <p class="valores__desconto__un" style="display: none">(${prodRealPrice})</p>
            `

                // Quantidade (brinde: travada e sem + / -)
                const quantityHtml = isStoreGift
                    ? `
                <div class="quantidadeProdutos__btns quantidadeProdutos__btns--locked">
                    <input type="text" class="quantidadeProdutos__btns__qnt" value="${prod.quantity}" maxlength="3" disabled>
                </div>
            `
                    : `
                <div class="quantidadeProdutos__btns">
                    <span class="quantidadeProdutos__button quantidadeProdutos__btns__sub">-</span>
                    <input type="text" class="quantidadeProdutos__btns__qnt" value="${prod.quantity}" maxlength="3">
                    <span class="quantidadeProdutos__button quantidadeProdutos__btns__add">+</span>
                </div>
            `

                return `
            <div class="itemCar" prod-price="${prod.real_price}" itemId="${prod.itemId}" groupId="${prod.groupId}" productId="${prod.productId}" storeGift="${isStoreGift ? 'true' : 'false'}">
                <a href="${prod.url}" target="_blank" class="produtoImg">
                    <img src="${prod.photo}" alt="imagem do produto">
                </a>

                <div class="produto__nome-mobile">
                    <a href="${prod.url}" class="produto__nome">${prod.name}</a>
                    <p class="produto__sku">Cod. ${prod.sku}</p>
                    ${vars ? vars : ''}
                </div>

                <div class="itemCar__especificacoes">
                    <a href="${prod.url}" class="produto__nome">${prod.name}</a>
                    <p class="produto__sku">Cod. ${prod.sku}</p>
                    ${vars ? vars : ''}
                    
                    <div class="itemCar__infos">
                        <div class="produtoDetalhes">
                        <p class="qtd__mobile">Quantidade:</p>
                            <div class="quantidadeProduto">

                            <div class="quantidadeProdutos-container">
                                <p class="qtd__desktop">Quantidade</p>

                                ${quantityHtml}

                                <div class="lixeira">
                                    <div class="iconLixeira">
                                        <div class="iconLixeira__over"></div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15.045" height="16.55" viewBox="0 0 15.045 16.55">
                                        <path id="Caminho_9993" data-name="Caminho 9993" d="M972.782,1787.01v-.6a3.751,3.751,0,0,0-.164-1.588,1.518,1.518,0,0,0-.658-.655,3.708,3.708,0,0,0-1.586-.166h-1.2a3.708,3.708,0,0,0-1.586.166,1.518,1.518,0,0,0-.658.655,3.751,3.751,0,0,0-.164,1.588v.6m1.505,4.139v3.762m3.01-3.762v3.762m-8.277-7.9h13.545m-1.505,0v8.428a5.6,5.6,0,0,1-.246,2.378,2.209,2.209,0,0,1-.987.986,5.562,5.562,0,0,1-2.379.248h-3.311a5.562,5.562,0,0,1-2.379-.248,2.21,2.21,0,0,1-.987-.986,5.6,5.6,0,0,1-.246-2.378v-8.428" transform="translate(-962.25 -1783.25)" fill="none" stroke="#222" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                        </svg>              
                                    </div>
                                </div>
                            </div>

                                <div class="produtoPrecos__valores">
                                    ${priceHtml}
                                </div>
                            </div>
                            ${giftPackingElement}
                            ${cashBackElement}
                        </div>
                    </div>
                </div>

            </div>
        `
            }).join('')

            container.innerHTML = `
    <h2>Itens do carrinho</h2>

    ${productsStr}

    <div class="optionsButtonItensCar">
        <span class="optionButtonContinuaCompra ButtonOptionsCar">Continuar comprando</span>
        <span class="optionButtonLimpar ButtonOptionsCar">Limpar carrinho</span>
        <span class="optionButtonCompartilhar ButtonOptionsCar">Compartilhar</span>
    </div>
    `

            const allProducts = container.querySelectorAll('.itemCar')
            allProducts.forEach(prod => {
                const isGift = prod.getAttribute('storeGift') === 'true'
                if (isGift) return

                const price = prod.getAttribute('prod-price')
                wsMain.modules['checkout-cart'].factoryFunctions.updateSingleProductsPrice(prod, price)
            })

            const giftsInputs = container.querySelectorAll('.presenteOption input[type="checkbox"]')

            if (!giftsInputs.length) return

            giftsInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const getItemId = wsMain.modules['checkout-cart'].subFunctions.getItemId(e.target)
                    const getProductId = container.querySelector(`[itemId="${getItemId}"]`).getAttribute('productId')
                    giftPackAdd(getItemId, getProductId)
                })
            })
        },

        createMobileResumeInfos() {
            const floatResume = document.querySelector('.float-resume')

            const prodsClone = document.querySelector('#ws-carrinhoNovo .resumo .totalProdutos .resumoItem__titulo')
            floatResume.querySelector('.float-resume__infos__produtos__label').innerHTML = prodsClone.innerHTML

            const priceClone = document.querySelector('#ws-carrinhoNovo .resumo .totalProdutos .resumoItem__promo')
            floatResume.querySelector('.float-resume__infos__produtos__preco').innerHTML = priceClone.innerHTML

            const totalPrice = document.querySelector('#ws-carrinhoNovo .resumo .resumoItemTotal .totalPedido')
            floatResume.querySelector('.float-resume-prices p.float-resume-price__total__price').innerHTML = totalPrice.innerHTML

            const shippingPrice = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .calcular')
            const calculateShippingMobile = floatResume.querySelector('#ws-carrinhoNovo .float-resume .float-resume__infos .float-resume__infos__frete .float-resume__infos__frete__preco')
            if(shippingPrice.innerHTML == 'Calcular') calculateShippingMobile.classList.add('uncalculated')
            else calculateShippingMobile.classList.remove('uncalculated')
        
            calculateShippingMobile.innerHTML = shippingPrice.innerHTML

            if (floatResume.querySelector('.buttonFinalizar')) return
            const btnClone = document.querySelector('#ws-carrinhoNovo .buttonFinalizar').cloneNode(true)
            floatResume.append(btnClone)
        },
        createResumeInfos(data) {
            const realPriceLabel = document.querySelector('#ws-carrinhoNovo .resumo .totalProdutos .resumoItem__promo')
            const originalPriceLabel = document.querySelector('#ws-carrinhoNovo .resumo .totalProdutos .resumoItem__preco')
            const discountPriceLabel = document.querySelector('#ws-carrinhoNovo .resumo .descontoCalculado')

            if (!realPriceLabel && !originalPriceLabel && !discountPriceLabel) return

            // nao encontrei o preco original no cartJson
            originalPriceLabel.style.display = 'none'

            const subTotal = typeof data.subtotal == 'string' ? Number(data.subtotal.replace(',','.')) : data.subtotal

            realPriceLabel.innerHTML = `${this.formatPrices.format(subTotal)}`

            if (!data.discount) {
                discountPriceLabel.style.display = 'none'
            } else if(data.discount && data.price) {
                const treatedDiscount = typeof data.discount == 'string' ? Number(data.discount.replace(',','.')) : data.discount
                const priceFull = (treatedDiscount + data.price) / 100
                discountPriceLabel.querySelector('p:last-child').innerHTML = `- ${this.formatPrices.format(priceFull)}`
            } else if (data.discount) {
                const treatedDiscount = typeof data.discount == 'string' ? Number(data.discount.replace(',','.')) : data.discount
                discountPriceLabel.querySelector('p:last-child').innerHTML = `- ${this.formatPrices.format(treatedDiscount)}`
            } else {
                discountPriceLabel.style.display = 'none'
            }

            const totalOrderLabel = document.querySelector('#ws-carrinhoNovo .resumo .resumoItemTotal .totalPedido')
            totalOrderLabel.innerHTML = `${this.formatPrices.format(data.total)}`
            
            if(wsCart1XDescount) {
                wsCart1XDescount = Number(wsCart1XDescount)

                const descount1XLabel = document.querySelector('#ws-carrinhoNovo .resumo .resumoItem.descontoem1x')
                descount1XLabel.style.display = ""

                const percentage = (100 - wsCart1XDescount) / 100

                descount1XLabel.innerHTML = `<p>
                1X de ${this.formatPrices.format(data.total * percentage)} <span class="discount">-${wsCart1XDescount}%</span>
                </p>`
            } else if (!wsCart1XDescount) {
                const descount1XLabel = document.querySelector('#ws-carrinhoNovo .resumo .resumoItem.descontoem1x')
                descount1XLabel.style.display = "none"
            }

            const installmentsLabel = document.querySelector('#ws-carrinhoNovo .resumoItem.parcelas')
            const installment = wsMain.modules['checkout-cart'].subFunctions.getInstallment(data.total, data.installments_min_value, data.max_installments)

            if (installment) {
                if(!data.max_installments_no_interest || data.max_installments_no_interest <= 1) {
                    const installmentsContainer = document.querySelector('#ws-carrinhoNovo .resumoItem.parcelas')
                    installmentsContainer.style.display = 'none'
                }
                let installmentPrice = wsMain.data.compostFeeValue(data.installments_interest, data.max_installments_no_interest, data.max_installments_no_interest + 1, data.total);
                installmentsLabel.innerHTML = `<p>em at&eacute; ${data.max_installments_no_interest}x sem juros de ${wsMain.data.treatPrice(installmentPrice)}</p>`

                if(installmentPrice < data.installments_min_value) {
                    installmentPrice = wsMain.data.compostFeeValue(data.installments_interest, installment, data.max_installments_no_interest + 1, data.total);
                    installmentsLabel.innerHTML = `<p>em at&eacute; ${installment}x sem juros de ${wsMain.data.treatPrice(installmentPrice)}</p>`
                }
            } else {
                installmentsLabel.style.display = 'none'
            }

            const sectionCashback = document.querySelector('[ws-cart-app="ws-cashback"]')
            if(data.cashback && data.cashback?.valor > 0) {
                const logged =  document.querySelector('#HD_LVCLI_ID').value
                
                if(logged && data.cashback.saldo == 0) {
                    const usarCashback = document.querySelector('#ws-carrinhoNovo .resumo .usar-cashback')
                    usarCashback.style.display = 'none'

                    const inserirCupom = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom')

                    inserirCupom.classList.add('resume-bottom-border')
                }
                
                if(logged && data.cashback.saldo > 0) { 
                    const usarCashbackLogin = document.querySelector('#ws-carrinhoNovo .resumo .usar-cashback .usar-cashback__login')
                    usarCashbackLogin.style.display = 'none'

                    const useCashbackContainer = document.querySelector('#ws-carrinhoNovo .resumo .usar-cashback .usar-cashback__use-cashback') 
                    const cashbackValueSpan = useCashbackContainer.querySelector('.cashback-value') 
                    cashbackValueSpan.innerHTML = this.formatPrices.format(data.cashback.saldo) 
                    useCashbackContainer.style.display = ''

                    const cashbackBtn = useCashbackContainer.querySelector('.cashback-btn')
                    
                    cashbackBtn.addEventListener('click', (e) => {
                        const usarCashback = document.querySelector('#ws-carrinhoNovo .resumo .usar-cashback')
                        usarCashback.style.display = 'none'
                        
                        const inserirCupom = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom')
                        
                        inserirCupom.classList.add('resume-bottom-border')
                        wsMain.modules['checkout-cart'].factoryFunctions.updateCupomStatus('#cashback')
                    })
                }

                const cashbackMsg = sectionCashback.querySelector('.cashback-app__infos__msg > span')
                cashbackMsg.innerHTML = `Ganhe ${this.formatPrices.format(data.cashback.valor)} de cashback`
            } else {
                const usarCashback = document.querySelector('#ws-carrinhoNovo .resumo .usar-cashback')
                usarCashback.style.display = 'none'

                sectionCashback.style.display = 'none'

                const inserirCupom = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom')

                inserirCupom.classList.add('resume-bottom-border')
            }

            const discountTag = document.querySelector('#ws-carrinhoNovo .resumoItem.pixBoleto .discount')
            const discountLabel = document.querySelector('#ws-carrinhoNovo .resumoItem.pixBoleto .totalPedido')
            const discountPixBoletoMsg = document.querySelector('#ws-carrinhoNovo .resumoItem.pixBoleto .pixBoleto__msg')

            if (data.cash_discount && data.cash_discount > 0) {
                discountPixBoletoMsg.innerHTML = wsCartFinishBoletoPixMsg
                this.cartPrices.totalWithoutShipping = data.total 
                this.cartPrices.cashDiscount = data.cash_discount
                discountTag.innerHTML = `-${data.cash_discount}%`

                discountLabel.innerHTML = `ou ${this.createBoletoPixDiscount()}`
            } else {    
                const pixBoletoContainer = document.querySelector('#ws-carrinhoNovo .resumoItem.pixBoleto')
                pixBoletoContainer.style.display = 'none'
                discountLabel.innerHTML = this.formatPrices.format(data.total)
            }

            const resumeContainer = document.querySelector('#ws-carrinhoNovo .resumo')
            wsMain.modules['checkout-cart'].observer(resumeContainer, data)
        },
        createFreightLabel(data) {
            if (!data.length) {
                const resumeShippingDiscount = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .shipping-discount-resume')
                resumeShippingDiscount.style.display = 'none'
                const container = document.querySelector('#ws-carrinhoNovo .frete .freteOpcoes')
                container.innerHTML = ''
                const calcLabel = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .calcular')
                calcLabel.classList.add('uncalculated')
                calcLabel.innerHTML = 'Calcular'
                return
            }

            if (!data || !data.length) return

            const container = document.querySelector('#ws-carrinhoNovo .frete .freteOpcoes')

            if (!container) return

  const shippingOptions = data.map(elm => {
                const checked = elm.selected ? "checked" : ""
                const price = elm.price && !elm.isFree ? this.formatPrices.format(elm.price / 100) : 'Gr&aacute;tis'
                let deadline

                if(wsShippingToDateMsg) {
                    const formatedDay = wsMain.modules['checkout-cart'].subFunctions.addBusinessDays(Number(elm.deadline))

                    let msg = 'Entrega'

                    if(elm.name.toLowerCase().includes('retirada') || elm.name.toLowerCase().includes('retirar')) {
                        msg = 'Retirar'
                    }

                    deadline = `${msg} at&eacute; ${formatedDay}`
                } else {
                    if (elm.deadline > 1) {
                        deadline = `${elm.deadline} dias &uacute;teis`
                    } else if (elm.deadline == 1) {
                        deadline = `${elm.deadline} dia &uacute;til`
                    } else if (elm.deadline == 0) {
                        deadline = `Hoje`
                    }
                }


                if (checked) {
                    const calcLabel = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .calcular')
                    calcLabel.classList.remove('uncalculated')
                    if (elm.price) {
                        calcLabel.innerHTML = `${this.formatPrices.format(Number(elm.price) / 100)}`
                        this.cartPrices.shipping = Number(elm.price / 100)
                    }
                    if (!elm.price && elm.isFree) {
                        calcLabel.innerHTML = `Gr&aacute;tis`
                    }
                    if (!elm.price && !elm.isFree) {
                        calcLabel.innerHTML = `${elm.name}`
                    }
                }

                let discount = ''
                if (elm.discount) {
                    const treatedDiscount = typeof elm.discount == 'string' ? Number(elm.discount.replace(',','.')) : elm.discount
                    const priceFull = (treatedDiscount + elm.price) / 100
                    const calcLabel = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .calcular')
                    calcLabel.classList.remove('uncalculated')
                    const resumeShippingDiscount = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .shipping-discount-resume')

                    resumeShippingDiscount.style.display = ''

                    calcLabel.innerHTML = this.formatPrices.format(priceFull)
                    resumeShippingDiscount.innerHTML = `- ${this.formatPrices.format(treatedDiscount / 100)}`
                    discount = `<span class="shipping-priceDiscount">${this.formatPrices.format(priceFull)}</span>`
                }

                let typeFreight

                if(elm.name == "A combinar") typeFreight = 'A combinar'
                else typeFreight = 'price'

                const labelDiscount = typeof elm.discount == 'string' ? Number(elm.discount.replace(',','.')) : elm.discount

                return `
                <label class="opcoes lbl_shipping_method_${elm.id}">
                <input type="radio" id="method_${elm.id}" typeFreight="${typeFreight}" name="freight" shipping-value="${elm.price}" shipping-discount="${labelDiscount}" ${checked}>
                <div for="${elm.id}">
                    <span>${elm.name}</span>
                    <span class="expectativeTempo" style="${elm.name == "A combinar" ? 'display:none' : ''}">${deadline} - ${discount} <span class="fullprice-shipping">${price}</span></span>
                </div>
                </label>
                `
            }).join('')

            container.innerHTML = `${shippingOptions}`
            this.createMobileResumeInfos()

            const loader = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos .carrinhoLoader-container')
            loader.classList.remove('loaderOn')

            const btn = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos button')
            btn.style.display = ''
        
            const allOptions = container.querySelectorAll('input[type="radio"]')
            if (!allOptions.length) return
            allOptions.forEach(input => {
                if(input.checked) {
                    const defaultChecked = input.id.split('_')[1]
                    wsMain.modules['checkout-cart'].factoryFunctions.updateShareLink('shippingMethod', defaultChecked)
                }

                input.addEventListener('input', (e) => {
                    const shippingId = e.target.id.split('_')[1]
                    const shippingValue = e.target.getAttribute('shipping-value')
                    const resumeShippingDiscount = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .shipping-discount-resume')
                    const discount = e.target.getAttribute('shipping-discount')

                    this.cartPrices.shipping = Number(shippingValue / 100)

                    wsMain.modules['checkout-cart'].factoryFunctions.updateShareLink('shippingMethod', shippingId)
                    shippingSelectOption(shippingId)
                    if (shippingValue) {
                        const calcLabel = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .calcular')
                        calcLabel.classList.remove('uncalculated')
                        calcLabel.innerHTML = e.target.getAttribute('typeFreight') !== 'A combinar' ? `${this.formatPrices.format((Number(shippingValue) + Number(discount)) / 100)}` : 'A combinar'

                        if (Number(discount)) {
                            resumeShippingDiscount.style.display = ''
                            resumeShippingDiscount.innerHTML = `- ${this.formatPrices.format(Number(discount) / 100)}`
                        } else {
                            resumeShippingDiscount.style.display = 'none'
                        }
                    }

                    cartCupomAddReturn = {}
                    this.createMobileResumeInfos()
                })
            })

            const shippingMethod = wsMain.modules['checkout-cart'].subFunctions.getUrlParam('shippingMethod')

            if(shippingMethod) {
                const shippingInput = document.querySelector(`#ws-carrinhoNovo .frete .opcoes > #method_${shippingMethod}`)
                shippingInput.checked = true

                shippingSelectOption(shippingInput.id.split('_')[1])
            }
            this.updateBoletoPixDiscount()

            cartCupomAddReturn = {}
        },
        createMessageToUser() {
            const existClone = document.querySelector('#msg-to-user')

            if (!existClone) {
                const clone = document.querySelector('#product-popup').cloneNode(true)

                clone.id = 'msg-to-user'
                const container = document.querySelector('#ws-carrinhoNovo')
                container.appendChild(clone)

                const messageContainer = document.querySelector('#msg-to-user')
                messageContainer.classList.add('popupHidden')

                messageContainer.querySelector('.removerConfirmacao__popup__btns').remove()

                const close = document.querySelector('#msg-to-user .removerConfirmacao__popup__fechar')
                close.addEventListener('click', () => {
                    messageContainer.classList.add('popupHidden')
                })
            }
        },
        createSharePopup() {
            const tcElm = document.querySelector("#HD_TCSHARE_CART");

            const tcParam = tcElm ? tcElm.value : '';
            const lvId = document.querySelector('#HD_LV_ID').value
            const linkWithoutParams = `${window.location.protocol}//${window.location.host}/carrinho/${lvId}/carrinho?share_cart=${tcParam}`

            wsMain.modules['checkout-cart'].factoryFunctions.linkToShare = linkWithoutParams

            const btnShare = document.querySelector('#ws-carrinhoNovo .optionButtonCompartilhar')

            if (!btnShare) return

            const link = wsMain.modules['checkout-cart'].factoryFunctions.createShareLink()
            
            btnShare.addEventListener('click', (e) => {
                const title = 'Compartilhe seu carrinho'
                this.updateUserMessage(link, title, "share", true)
            })
        },
        createInitialShippingAndCupomOptions() {
            /* if(!finishOrderButtonStatus) {
                setTimeout(() => {
                    wsMain.modules['checkout-cart'].factoryFunctions.createInitialShippingAndCupomOptions()
                }, 1000)
                return
            } */

            const cupom = wsMain.modules['checkout-cart'].subFunctions.getUrlParam('cupom')
            const cep = wsMain.modules['checkout-cart'].subFunctions.getUrlParam('cep')

            if(cupom) {
                wsMain.modules['checkout-cart'].factoryFunctions.updateCupomStatus(cupom)
            }

            if(cep) {
                wsMain.modules['checkout-cart'].factoryFunctions.updateShareLink('cep', cep)

                const cepInput = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos>input')
                
                cepInput.value = wsMain.modules['checkout-cart'].subFunctions.cepMask(cep)
                
                const cepBtn = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos button')
                cepBtn.style.display = 'none'
                
                const cepLoader = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos .carrinhoLoader-container')
                cepLoader.classList.add('loaderOn')
                
                shippingCalculate(cep)
            } else {
                wsMain.modules['checkout-cart'].factoryFunctions.updateShippingInputValue()
            }
        },
        createShareLink() {
            const link = wsMain.modules['checkout-cart'].factoryFunctions.linkToShare
            const params = Object.entries(wsMain.modules['checkout-cart'].factoryFunctions.linkToShareParams)
            .map(([key, value]) => `&${key}=${value}`)
            .join('');

            return `${link}${params}`
        },
        createButtonMsg() {
            try {
                const allBtn = document.querySelectorAll('#ws-carrinhoNovo .buttonFinalizar')
                if (!allBtn.length) return
    
                allBtn.forEach(btn => {
                    const vrf = btn.querySelector('.buttonFinalizar__msg')
    
                    if(vrf) return
                    
                    const child = btn.querySelector('.carrinhoLoader-container')
    
                    const span = document.createElement("span");
                    span.classList.add('buttonFinalizar__msg')
                    span.innerHTML = wsCartFinishButtonLabel
                    btn.insertBefore(span, child)
                })
            } catch (error) {
                console.log("test ~ createButtonMsg ~ error:", error)
            }
        },
        createBoletoPixDiscount() {
            try {
                if(this.cartPrices.shipping 
                && this.cartPrices.shipping > 0 
                && typeof this.cartPrices.shipping == 'number') {
                    this.cartPrices.totalWithoutShipping = this.cartPrices.totalWithoutShipping - this.cartPrices.shipping
                }

                const discountCalc = (this.cartPrices.totalWithoutShipping 
                - (this.cartPrices.totalWithoutShipping * (this.cartPrices.cashDiscount / 100))
                + this.cartPrices.shipping)
    
                return this.formatPrices.format(discountCalc)
            } catch (error) {}
        },
        updateBoletoPixDiscount() {
            try {
                const discountLabel = document.querySelector('#ws-carrinhoNovo .resumoItem.pixBoleto .totalPedido')
    
                if(!discountLabel) return

                discountLabel.innerHTML = this.createBoletoPixDiscount()
            } catch (error) {}
        },
        updateUserMessage(msg, title, attr = "default", copy = false) {
            const messageContainer = document.querySelector('#msg-to-user')

            if (!messageContainer) return

            messageContainer.dataset.messageType = attr

            messageContainer.querySelector('.removerConfirmacao__popup__title').innerHTML = 'Alerta'

            const subtitle = messageContainer.querySelector('.removerConfirmacao__popup__subTitle')

            if (typeof msg == "object") {
                if (!msg.message) return

                msg = msg.message
            }
            
            if (title) {
                const mainTitle = messageContainer.querySelector('.removerConfirmacao__popup__title')
                mainTitle.innerHTML = title
            }

            if (copy) {
                const copyIcon = `
                <div class="copy-icon">
                    <div class="copy-overlay" title="Copiar URL" copy-type="onlyCopy"></div>
                    <div class="svg-container">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#333333"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                    </div>
                    <span>Copiar URL</span>
                </div>
                `

                const whatsappShareBtn = `
                <div class="copy-icon">
                    <a class="copy-overlay" title="Compartilhar no Whatsapp" target="_blank" copy-type="whatsapp"></a>
                    ${wsMain.globalData.icons.whatsapp}
                    <span>WhatsApp</span>
                </div>
                `

                subtitle.innerHTML = `<input type="text" disabled value="${msg}"></input>
                <div class="shareButtons">
                 ${copyIcon}
                 ${whatsappShareBtn}
                </div>
                `

                subtitle.querySelectorAll('.copy-overlay').forEach(elm => {
                    elm.addEventListener('click', (e) => {
                        const copyType = elm.getAttribute('copy-type')
                        const txtToCopy = subtitle.querySelector('input')
                        txtToCopy.select();

                        let msgToCopy = txtToCopy.value
                        if (copyType == "whatsapp") {
                            elm.href = `whatsapp://send?text=Veja o carrinho que montei para voc%C3%AA. ${encodeURIComponent(msgToCopy)}`
                            return
                        }

                        if (copyType == "onlyCopy") {
                            const parent = e.target.parentNode
                            const copyMsg = parent.querySelector('span')
                            copyMsg.innerHTML = 'Link copiado'
                            parent.querySelector('.svg-container').innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#333333"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                            `

                            setTimeout(() => {
                                if(copyMsg.innerHTML == 'Link copiado') {
                                    copyMsg.innerHTML = 'Copiar URL'
                                    parent.querySelector('.svg-container').innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#333333"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                                    `        
                                }
                            }, 5000)
                        }

                        navigator.clipboard.writeText(msgToCopy);
                    })
                })
            } else {
                subtitle.innerHTML = `${msg}`
            }

            messageContainer.classList.remove('popupHidden')
        },
        updateFinishButton(go) {
            const allBtn = document.querySelectorAll('#ws-carrinhoNovo .buttonFinalizar')
            if (!allBtn.length) return

            allBtn.forEach(btn => {
                const finishLoader = btn.querySelector('.carrinhoLoader-container')
                const msg = btn.querySelector('span')
                if (go) {
                    btn.classList.remove('finishNotReady')
                    finishLoader.classList.add('loaderOff')
                    msg.style.display = 'block'
                }
                else {
                    btn.classList.add('finishNotReady')
                    finishLoader.classList.remove('loaderOff')
                    msg.style.display = 'none'
                }
            })
        },
        updateShippingInputValue() {
            const getCepCookie = wsMain.modules['checkout-cart'].subFunctions.getCookie("CEP_CART_KEEP")

            if (!getCepCookie) return

            const cepInput = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos>input')

            if (!cepInput) return

            cepInput.value = wsMain.modules['checkout-cart'].subFunctions.cepMask(getCepCookie)
        },
        updateElementState(selector, condition) {
            const element = document.querySelector(selector)

            if (!element) return

            if (!condition) element.style.display = 'none'
            else element.style.display = ''
        },
        updateShareLink(param, value) {
            if(!param || !value) return
                        
            wsMain.modules['checkout-cart'].factoryFunctions.linkToShareParams[param] = value
        },
        updateCupomStatus(cupom) {
            wsMain.modules['checkout-cart'].factoryFunctions.updateShareLink('cupom', cupom)
            const cupomCheckbox = document.querySelector('#inserirCupom')
            cupomCheckbox.checked = true
            
            const cupomInput = document.querySelector('#cupomParaEnviar')
            cupomInput.value = cupom

            const cupomBtn = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom>.inserirCupom-container>button')
            cupomBtn.style.display = 'none'

            const cupomLoader = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom>input:checked~.inserirCupom-container .carrinhoLoader-container')
            cupomLoader.classList.add('loaderOn')

            wsMain.modules['checkout-cart'].factoryFunctions.updateFinishButton(false)
            cartCupomAdd(cupom)
        },
        updateSingleProductsPrice(prod, price) {
            try {
                if(!prod || !price) return
                
                const qtd = prod.querySelector('.quantidadeProdutos__btns__qnt').value
                const prodPriceUn = prod.querySelector('#ws-carrinhoNovo .quantidadeProduto .valores__desconto__un')
                const prodPrice = prod.querySelector('#ws-carrinhoNovo .quantidadeProduto .valores__desconto')
                const calcPrice = price * qtd

                if(qtd > 1) {
                    prodPriceUn.style.display = ''
                } else {
                    prodPriceUn.style.display = 'none'
                }
                
                prodPrice.innerHTML = `${this.formatPrices.format(calcPrice)}`
            } catch (error) {}
        }
    },
    subFunctions: {
        getCookie(name) {
            try {
                const cookieValue = localStorage.getItem(name);
                if (!cookieValue) return null;

                return cookieValue;
            } catch (error) {
                console.log("test ~ getCookie ~ error:", error)
            }
        },
        getInstallment(price, min, i) {
            try {
                if(i == 0) i = 1
                let installments = price / i;

                if (installments < min) {
                    return wsMain.modules['checkout-cart'].subFunctions.getInstallment(price, min, i - 1);
                } else {
                    return i;
                }
            } catch (error) {
                console.log("test ~ getInstallment ~ error:", error)
            }
        },
        getUrlParam(param) {
            try {
                const allUrlParams = new URLSearchParams(window.location.search);
                const urlParam = allUrlParams.get(param);
                
                if(!urlParam) return

                return decodeURIComponent(urlParam).replace("__hash__","#")
            } catch (error) {
                console.log("test ~ getUrlParam ~ error:", error)
            }
        },
        isEqualArrays(arr1, arr2) {
            try {
                // Verifica se possuem o mesmo comprimento
                if (arr1.length !== arr2.length) return false;

                // Gera hashes e compara
                for (let i = 0; i < arr1.length; i++) {
                    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
                }

                return true;
            } catch (error) {
                console.log("test ~ isEqualArrays ~ error:", error)
            }
        },
        getExistingPreviousChild(selector) {
            const element = document.querySelector(selector)

            if (!element) return

            let sibling = element.previousElementSibling;

            while (sibling) {
                if (window.getComputedStyle(sibling).display !== 'none') {
                    return sibling;
                }
                sibling = sibling.previousElementSibling;
            }

            return;
        },
        getItemId(element) {
            try {
                if (element.hasAttribute('itemId')) return element.getAttribute('itemId');

                let parent = element.parentNode;

                while (parent && !parent.hasAttribute('itemId')) parent = parent.parentNode;

                if (!parent) return false

                return parent.getAttribute('itemId');
            } catch (error) {
                console.log("test ~ getItemId ~ error:", error)
            }
        },
        changeResumeTotalProductsLabel(newValue) {
            try {
                const resumeItemTitle = document.querySelector('#ws-carrinhoNovo .resumoItem__titulo')
                if (!resumeItemTitle) return
                const productTotalLabel = newValue > 1 ? "Produtos" : "Produto"
                resumeItemTitle.innerHTML = `${productTotalLabel} (${newValue})`
            } catch (error) {
                console.log("test ~ changeResumeTotalProductsLabel ~ error:", error)
            }
        },
        popupRemoveItem(prodArr, proxyUserData) {
            try {
                const closeBtn = document.querySelector('#product-popup .removerConfirmacao__popup__fechar')
                const popupContainer = document.querySelector('#product-popup')
                const removeBtn = document.querySelector('#product-popup .removerConfirmacao__popup .removerConfirmacao__popup__btns .removerConfirmacao__btn__remover')
                const cancelBtn = document.querySelector('#product-popup .removerConfirmacao__popup .removerConfirmacao__popup__btns .removerConfirmacao__btn__cancelar')

                closeBtn.addEventListener('click', () => {
                    popupContainer.classList.add('popupHidden')
                    prodArr.length = 0
                    return
                })

                cancelBtn.addEventListener('click', () => {
                    popupContainer.classList.add('popupHidden')
                    prodArr.length = 0
                    return
                })

                removeBtn.addEventListener('click', () => {
                    popupContainer.classList.add('popupHidden')
                    prodArr.forEach(elm => {
                        const getItemId = wsMain.modules['checkout-cart'].subFunctions.getItemId(elm)
                        const getGroupId = elm.getAttribute('groupId')
                        removeProductCart(getItemId, getGroupId)
                        elm.remove()
                    })
                    prodArr.length = 0

                    proxyUserData.total -= proxyUserData.qntyToRemove

                    const itemsVrf = document.querySelector('.itensCarrinho .itemCar')
                    if (!itemsVrf) {
                        document.querySelector('.checkout-content > main').classList.add('popupHidden')
                        document.querySelector('.checkout-content > .resumo').classList.add('popupHidden')
                        document.querySelector('.checkout-content > .voltarCompras').classList.remove('popupHidden')


                        cartCleanAll()
                    }

                    return
                })
            } catch (error) {
                console.log("test ~ popupRemoveItem ~ error:", error)
            }
        },
        getAncestor(element, levels) {
            try {
                while (levels-- > 0) {
                    element = element.parentNode;
                }
                return element;
            } catch (error) {
                console.log("test ~ getAncestor ~ error:", error)
            }
        },
        changePopupMessage(newTitle, newSubTitle, btnTitle) {
            try {
                const popupChanger = document.querySelector("#ws-carrinhoNovo #product-popup")
                const popupTitle = popupChanger.querySelector(".removerConfirmacao__popup__title")
                const popupsubTitle = popupChanger.querySelector(".removerConfirmacao__popup__subTitle")
                const btnLabel = popupChanger.querySelector('.removerConfirmacao__popup__btns .removerConfirmacao__btn__remover')

                if (newTitle) popupTitle.innerHTML = newTitle
                if (newSubTitle) popupsubTitle.innerHTML = newSubTitle
                if (btnTitle) btnLabel.innerHTML = btnTitle
            } catch (error) {
                console.log("test ~ changePopupMessage ~ error:", error)
            }
        },
        calculatingInputsTotal() {
            try {
                const allInputs = document.querySelectorAll('#ws-carrinhoNovo .quantidadeProduto .quantidadeProdutos__btns__qnt')
                const inputsValuesSum = Array.from(allInputs).reduce((partialSum, a) => partialSum + Number(a.value), 0)
                return inputsValuesSum
            } catch (error) {
                console.log("test ~ calculatingInputsTotal ~ error:", error)
            }
        },
        loader(canvas) {
            try {
                const ctx = canvas.getContext('2d');
                const pixelRatio = window.devicePixelRatio || 1;

                // variaveis de configuracao
                const timeInMs = 1000
                const bgCircleWidth = 20
                const mainCircleWidth = 21.4
                const mainColor = '#222222'
                const secundaryColor = '#e0e0e0'

                // Define o tamanho do canvas
                canvas.width = 200 * pixelRatio;
                canvas.height = 200 * pixelRatio;
                canvas.style.width = '40px';
                canvas.style.height = '40px';

                // Ajusta a escala do contexto do canvas
                ctx.scale(pixelRatio, pixelRatio);

                const centerX = canvas.width / (2 * pixelRatio);
                const centerY = canvas.height / (2 * pixelRatio);
                const radius = 70;
                let progress = 0; // Progresso inicial de 0 a 1
                let invertColors = false; // Estado para rastrear a inversÃƒÂ£o de cores

                function drawProgressLoader(progress, invertColors) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Cores baseadas no estado invertColors
                    const backgroundColor = invertColors ? mainColor : secundaryColor;
                    const progressColor = invertColors ? secundaryColor : mainColor;

                    // CÃƒÂ­rculo de fundo
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
                    ctx.strokeStyle = backgroundColor;
                    ctx.lineWidth = bgCircleWidth;
                    ctx.stroke();

                    // CÃƒÂ­rculo de progresso
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress), false);
                    ctx.strokeStyle = progressColor;
                    ctx.lineWidth = mainCircleWidth;
                    // ctx.lineCap = 'round'; // Bordas arredondadas
                    ctx.stroke();
                }

                function updateProgress(milliseconds) {
                    const increment = 1 / (milliseconds / 16.67); // Calcula o incremento baseado nos milissegundos
                    progress += increment; // Incrementa o progresso

                    if (progress > 1) {
                        progress = 0; // Reseta o progresso para 0
                        invertColors = !invertColors; // Inverte as cores
                    }

                    drawProgressLoader(progress, invertColors);
                    requestAnimationFrame(() => updateProgress(milliseconds));
                }

                updateProgress(timeInMs);  // Chama a funÃƒÂ§ÃƒÂ£o com o tempo desejado em milissegundos (1000 ms = 1 segundo)
            } catch (error) {
                console.log("test ~ loader ~ error:", error)
            }
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

        quantityProds(proxyUserData) {
            try {
                const allBtns = document.querySelectorAll('.quantidadeProdutos__button')
                const lixeiras = document.querySelectorAll('#ws-carrinhoNovo .itemCar .lixeira .iconLixeira__over')
                const isGiftItem = (elm) => {
                    try {
                        const prod = elm.closest ? elm.closest('.itemCar') : null
                        if (!prod) return false
                        return prod.getAttribute('storeGift') === 'true'
                    } catch (e) { return false }
                }

                if (allBtns.length == 0) return

                const prodArr = []

                lixeiras.forEach(icon => {
                    icon.addEventListener('click', (e) => {
                        const mainContainer = wsMain.modules['checkout-cart'].subFunctions.getAncestor(e.target, 3)
                        const input = mainContainer.querySelector('.quantidadeProdutos__btns__qnt')

                        proxyUserData.qntyToRemove = Number(input.value)
                        prodArr.push(mainContainer)
                        const popupContainer = document.querySelector('#product-popup')
                        wsMain.modules['checkout-cart'].subFunctions.changePopupMessage("Remover o produto", "Voc&ecirc; deseja remover este item do carrinho?", "Remover")
                        popupContainer.classList.remove('popupHidden')

                        shippingOptionsReturn = []
                    })
                })

                allBtns.forEach(btn => {
                    btn.addEventListener('click', e => {
                        const clickedElm = e.target
                        if (isGiftItem(clickedElm)) return

                        const fatherContainer = wsMain.modules['checkout-cart'].subFunctions.getAncestor(clickedElm, 1);
                        const mainContainer = wsMain.modules['checkout-cart'].subFunctions.getAncestor(clickedElm, 6);
                        const prodContainer = wsMain.modules['checkout-cart'].subFunctions.getAncestor(clickedElm, 7);
                        const prodPrice = prodContainer.getAttribute('prod-price')
                        const qntyContainer = fatherContainer.querySelector('.quantidadeProdutos__btns__qnt')
                        const getItemId = wsMain.modules['checkout-cart'].subFunctions.getItemId(clickedElm)

                        if (clickedElm.classList.contains('quantidadeProdutos__btns__add')) {
                            if (qntyContainer.value >= 999) return
                            proxyUserData.total += 1
                            qntyContainer.value = Number(qntyContainer.value) + 1
                            productQtdChange(getItemId, Number(qntyContainer.value))
                        }

                        if (clickedElm.classList.contains('quantidadeProdutos__btns__sub')) {
                            if (qntyContainer.value > 1) {
                                proxyUserData.total -= 1
                                qntyContainer.value = Number(qntyContainer.value) - 1
                                productQtdChange(getItemId, Number(qntyContainer.value))
                                wsMain.modules['checkout-cart'].factoryFunctions.updateSingleProductsPrice(prodContainer, prodPrice)
                                shippingOptionsReturn = []
                                return
                            }

                            proxyUserData.qntyToRemove = 1
                            prodArr.push(mainContainer)
                            const popupContainer = document.querySelector('#product-popup')
                            popupContainer.classList.remove('popupHidden')
                        }

                        wsMain.modules['checkout-cart'].factoryFunctions.updateSingleProductsPrice(prodContainer, prodPrice)

                        shippingOptionsReturn = []
                    })
                })

                document.querySelectorAll('#ws-carrinhoNovo .quantidadeProduto .quantidadeProdutos__btns__qnt')
                    .forEach(input => {

                        if (isGiftItem(input)) return

                        const getItemId = wsMain.modules['checkout-cart'].subFunctions.getItemId(input)

                        input.addEventListener('input', () => {
                            const prodContainer = wsMain.modules['checkout-cart'].subFunctions.getAncestor(input, 7);
                            const prodPrice = prodContainer.getAttribute('prod-price')
                            const inputReplace = input.value.replace(/[^0-9]/g, '');
                            if (Number(inputReplace) > 999) return
                            input.value = inputReplace
                            productQtdChange(getItemId, Number(input.value))

                            proxyUserData.total = wsMain.modules['checkout-cart'].subFunctions.calculatingInputsTotal()
                            wsMain.modules['checkout-cart'].factoryFunctions.updateSingleProductsPrice(prodContainer, prodPrice)

                            shippingOptionsReturn = []
                        });

                        input.addEventListener('blur', () => {
                            if (input.value < 1) {
                                input.value = 1
                                const prodContainer = wsMain.modules['checkout-cart'].subFunctions.getAncestor(input, 7);
                                const prodPrice = prodContainer.getAttribute('prod-price')

                                productQtdChange(getItemId, Number(input.value))
                                proxyUserData.total = wsMain.modules['checkout-cart'].subFunctions.calculatingInputsTotal()

                                wsMain.modules['checkout-cart'].factoryFunctions.updateSingleProductsPrice(prodContainer, prodPrice)
                                shippingOptionsReturn = []
                            }
                        });
                    })

                wsMain.modules['checkout-cart'].subFunctions.popupRemoveItem(prodArr, proxyUserData)
            } catch (error) {
                console.log("test ~ quantityProds ~ error:", error)
            }
        },
        resumeProductsTotal(proxyUserData) {
            try {
                const allProductsValue = document.querySelectorAll('#ws-carrinhoNovo .quantidadeProduto .quantidadeProdutos__btns__qnt')
                let productsTotalValue = 0

                allProductsValue.forEach((elm) => {
                    productsTotalValue += Number(elm.value)
                })

                proxyUserData.total = productsTotalValue

                // const productTotalLabel = productsTotalValue > 1 ? "Produtos" : "Produto"
                // resumeItemTitle.innerHTML = `${productTotalLabel} (${productsTotalValue})`
            } catch (error) {
                console.log("test ~ resumeProductsTotal ~ error:", error)
            }
        },
        topChange() {
            try {
                window.addEventListener("scroll", function () {
                    const topChangeHeight = document.querySelector("#ws-carrinhoNovo header");
                    if (window.scrollY > 50) { // Se a rolagem for maior que 50px
                        topChangeHeight.classList.add("menor");
                    } else {
                        topChangeHeight.classList.remove("menor");
                    }
                });
            } catch (error) {
                console.log("test ~ topChange ~ error:", error)
            }
        },
        cepMask(value) {
            try {
                return value.slice(0, 5) + '-' + value.slice(5, 8);
            } catch (error) {
                console.log("test ~ cepMask ~ error:", error)
            }
        },
        handleShippingInput() {
            try {
                document.getElementById('cep').addEventListener('input', function (e) {
                    let value = e.target.value;
                    value = value.replace(/\D/g, '');
                    if (value.length > 5) {
                        value = wsMain.modules['checkout-cart'].subFunctions.cepMask(value)
                    }
                    e.target.value = value;
                });
            } catch (error) {
                console.log("test ~ cepMask ~ error:", error)
            }
        },
        loaderHandler(data) {
            try {
                const confirmButton = document.querySelectorAll('#ws-carrinhoNovo [loaders-type="btn"]')
                const inputs = document.querySelectorAll('#ws-carrinhoNovo [cart-checkout-input]')
                const btnTypeObj = {
                    cep(cep) {
                        shippingOptionsReturn = []

                        wsMain.modules['checkout-cart'].factoryFunctions.updateFinishButton(false)

                        const container = document.querySelector('#ws-carrinhoNovo .frete .freteOpcoes')
                        const calcLabel = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega .calcular')
                        calcLabel.classList.add('uncalculated')
                        container.innerHTML = ''
                        calcLabel.innerHTML = 'Calcular'

                        wsMain.modules['checkout-cart'].factoryFunctions.updateShareLink('cep', cep.replace('-', ''))

                        shippingCalculate(cep.replace('-', ''))
                    },
                    cupom(cupom) {
                        const usarCashback = document.querySelector('#ws-carrinhoNovo .resumo .usar-cashback')
                        const inserirCupom = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom')
                        const logged =  document.querySelector('#HD_LVCLI_ID')?.value

                        if(cupom == '#cashback' && data.cashBack && data.cashBack > 0 && logged) {
                            usarCashback.style.display = ''
                            inserirCupom.classList.remove('resume-bottom-border')
                        } else {
                            usarCashback.style.display = 'none'
                            inserirCupom.classList.add('resume-bottom-border')
                        }
                        
                        wsMain.modules['checkout-cart'].factoryFunctions.updateShareLink('cupom', encodeURIComponent(cupom.replace("#","__hash__")))

                        wsMain.modules['checkout-cart'].factoryFunctions.updateFinishButton(false)
                        cartCupomAdd(cupom)
                    }
                }

                confirmButton.forEach((btn) => {
                    btn.addEventListener("click", function (e) {
                        const fatherContainer = e.target.parentNode.parentNode
                        const loaderChange = fatherContainer.querySelector('[loaders-type="loadersContainer"]')
                        const inputValue = fatherContainer.querySelector('input[type="text"]').value

                        if (fatherContainer.classList.contains('inserirCupom')) {
                            if (!inputValue) {
                                const title = 'Aus&ecirc;ncia de cupom'
                                const msg = 'Por favor, digite o c&oacute;digo do cupom.'
                                wsMain.modules['checkout-cart'].factoryFunctions.updateUserMessage(msg, title)
                            }
                        }

                        if (!inputValue) return

                        const btnType = e.target.getAttribute('btn-type')

                        loaderChange.classList.add("loaderOn")
                        btn.style.display = "none"

                        btnTypeObj[btnType](inputValue)
                    })
                })

                inputs.forEach(input => {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === "Enter") {
                            console.log(e.key)
                            const fatherContainer = e.target.parentNode.parentNode
                            const loaderChange = fatherContainer.querySelector('[loaders-type="loadersContainer"]')
                            const btn = fatherContainer.querySelector('button')

                            if (fatherContainer.classList.contains('inserirCupom')) {
                                if (!e.target.value) {
                                    const title = 'Aus&ecirc;ncia de cupom'
                                    const msg = 'Por favor, digite o c&oacute;digo do cupom.'
                                    wsMain.modules['checkout-cart'].factoryFunctions.updateUserMessage(msg, title)
                                }
                            }

                            if (!e.target.value) return

                            const inputType = e.target.getAttribute('cart-checkout-input')

                            loaderChange.classList.add("loaderOn")
                            btn.style.display = "none"

                            btnTypeObj[inputType](e.target.value)
                        }
                    });
                })
            } catch (error) {
                console.log("test ~ loaderHandler ~ error:", error)
            }
        },
        buttonFinishing() {
            try {
                const allBtn = document.querySelectorAll('#ws-carrinhoNovo .buttonFinalizar')

                allBtn.forEach(btn => {
                    if (btn.getAttribute('listeningClick')) return

                    btn.addEventListener('click', (e) => {
                        const shippingOptions = document.querySelectorAll('#ws-carrinhoNovo #frete-section .freteOpcoes label.opcoes')
                        if (!shippingOptions.length) {
                            btn.classList.add('finishNotReady')
                        }

                        if (e.target.classList.contains('finishing') || e.target.classList.contains('finishNotReady')) {
                            const msg = 'O carrinho est&aacute; sendo calculado, tente novamente em alguns instantes.'
                            const title = 'Aguarde'
                            wsMain.modules['checkout-cart'].factoryFunctions.updateUserMessage(msg, title)
                            return
                        }

                        wsMain.modules['checkout-cart'].factoryFunctions.updateFinishButton(true)
                        btn.classList.add('finishing')
                        cartFinishOrder()
                    })

                    btn.setAttribute('listeningClick', true)
                })
            } catch (error) {
                console.log("test ~ buttonFinishing ~ error:", error)
            }
        },
        startLoaders() {
            try {
                const allCanvas = document.querySelectorAll('.progressCanvas');
                allCanvas.forEach(canvas => {
                    wsMain.modules['checkout-cart'].subFunctions.loader(canvas)
                })
            } catch (error) {
                console.log("test ~ startLoaders ~ error:", error)
            }
        },
        cleanCart(proxyUserData) {
            try {
                const cartSelectButton = document.querySelector("#ws-carrinhoNovo .optionButtonLimpar")

                cartSelectButton.addEventListener("click", function () {
                    const allCartSelect = document.querySelectorAll("#ws-carrinhoNovo .itemCar")
                    const popupContainer = document.querySelector('#product-popup')
                    popupContainer.classList.remove('popupHidden')
                    wsMain.modules['checkout-cart'].subFunctions.changePopupMessage("Limpar Carrinho", "Voc&ecirc; deseja limpar o carrinho?", "Sim")
                    wsMain.modules['checkout-cart'].subFunctions.popupRemoveItem(allCartSelect, proxyUserData)
                })
            } catch (error) {
                console.log("test ~ cleanCart ~ error:", error)
            }
        },
        keepOrdering(proxyUserData) {
            try {
                const cartSelectButton = document.querySelector("#ws-carrinhoNovo .optionButtonContinuaCompra")

                cartSelectButton.addEventListener("click", function () {
                    window.location.href = "/";
                })
            } catch (error) {
                console.log("test ~ keepOrdering ~ error:", error)
            }
        },
        goToShippingSection() {
            try {
                const btn = document.querySelector('#ws-carrinhoNovo .resumo .taxaEntrega > .calcular')
                btn.addEventListener('click', (e) => {
                    setTimeout(() => {
                        console.log(e.target)
                        const input = document.querySelector('#ws-carrinhoNovo .frete .cepInput input')
                        input.focus()
                    }, 1000)
                })
            } catch (error) {
                console.log("test ~ goToShippingSection ~ error:", error)
            }
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Define a rolagem suave
            });
        },
        runEssentialFunctions(proxy, data) {
            wsMain.modules['checkout-cart'].subFunctions.quantityProds(proxy)
            wsMain.modules['checkout-cart'].subFunctions.resumeProductsTotal(proxy)
            wsMain.modules['checkout-cart'].subFunctions.topChange()
            wsMain.modules['checkout-cart'].subFunctions.handleShippingInput()
            wsMain.modules['checkout-cart'].subFunctions.loaderHandler(data)
            wsMain.modules['checkout-cart'].subFunctions.buttonFinishing()
            wsMain.modules['checkout-cart'].subFunctions.goToShippingSection()
            // wsMain.modules['checkout-cart'].subFunctions.startLoaders()
            wsMain.modules['checkout-cart'].subFunctions.cleanCart(proxy)
            wsMain.modules['checkout-cart'].subFunctions.keepOrdering(proxy)
        }
    },
    async get() {
        try {
            if (!newCartVersion) return;
            const body = document.querySelector('body')
            body.style.overflow = 'hidden'
            wsMain.tools.showLoading();

            console.log('modulo checkout-cart 05-02-25')

            console.log('checkout-cart get')

            wsMain.modules['checkout-cart'].factoryFunctions.createButtonMsg()

            setTimeout(() => {
                wsMain.modules['checkout-cart'].subFunctions.scrollToTop()
            }, 1000)

            wsMain.modules['checkout-cart'].finishLoader();
            wsMain.modules['checkout-cart'].watchingUpdates(cartJson, shippingOptionsReturn, cartCupomAddReturn);
            wsMain.modules['checkout-cart'].create(cartJson, shippingOptionsReturn, shippingMsgReturn);
            setTimeout(() => {
                wsMain.modules['checkout-cart'].factoryFunctions.createInitialShippingAndCupomOptions()
            }, 2000)

            return true
        } catch (error) {
            return false
        }
    },
    async create(data, shippingOpt, shippingMsg) {
        try {
            console.log('checkout-cart create')

            if (!!Object.keys(data).length) {
                const proxyHandler = {
                    set(target, property, value) {
                        const resumeQuantityLabels = {
                            total: true,
                        }

                        if (value !== target[property]) {
                            target[property] = value;

                            if (resumeQuantityLabels[property]) {
                                wsMain.modules['checkout-cart'].factoryFunctions.updateFinishButton(false)
                                wsMain.modules['checkout-cart'].subFunctions.changeResumeTotalProductsLabel(value)
                            }

                            return true;
                        }
                        return false;
                    }
                };

                const productsTotalObj = {
                    total: 0,
                    qntyToRemove: 0
                }

                const proxyUserData = new Proxy(productsTotalObj, proxyHandler);
                wsMain.modules['checkout-cart'].factoryFunctions.createProds(data.products, proxyUserData)
                wsMain.modules['checkout-cart'].factoryFunctions.createResumeInfos(data)
                wsMain.modules['checkout-cart'].subFunctions.runEssentialFunctions(proxyUserData, data)
            }

            if (shippingOpt && shippingMsg && shippingMsg.status) {
                wsMain.modules['checkout-cart'].factoryFunctions.createFreightLabel(shippingOpt, shippingMsg)
            }

            if (!data.sendable && !!Object.keys(data).length) {
                wsMain.modules['checkout-cart'].factoryFunctions.updateElementState('#ws-carrinhoNovo .resumoItem.taxaEntrega', data.sendable)
                wsMain.modules['checkout-cart'].factoryFunctions.updateElementState('#ws-carrinhoNovo #frete-section', data.sendable)
                document.querySelector('#ws-carrinhoNovo').classList.add('noShipping')
            }

            if (!data.accept_coupon && !!Object.keys(data).length) {
                const cupomContainer = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom')
                cupomContainer.classList.remove('resume-bottom-border')
                wsMain.modules['checkout-cart'].factoryFunctions.updateElementState('#ws-carrinhoNovo .resumo .inserirCupom', data.accept_coupon)

                const cupomPreviousSibling = wsMain.modules['checkout-cart'].subFunctions.getExistingPreviousChild('#ws-carrinhoNovo .resumo .inserirCupom')
                cupomPreviousSibling.classList.add('resume-bottom-border')
            }

            wsMain.modules['checkout-cart'].factoryFunctions.createSharePopup()
            wsMain.modules['checkout-cart'].factoryFunctions.createMessageToUser()

            return true
        } catch (error) {
            return false
        }
    },
    watchingUpdates(data, shippingOpt, cupom) {
        function watchingLastUpdate(recursiveCartJson) {
            const oldLastUpdate = recursiveCartJson.lastUpdate

            setTimeout(() => {
                const actualLastUpdate = cartJson.lastUpdate

                if (oldLastUpdate !== actualLastUpdate) {
                    wsMain.modules['checkout-cart'].create(cartJson);
                    watchingLastUpdate(cartJson);
                    return
                }
                watchingLastUpdate(recursiveCartJson);
            }, 1000)
        }

        function watchingShipping(recursiveShippingOpt) {
            const oldShippingOpt = recursiveShippingOpt

            setTimeout(() => {
                const actualShippingOpt = shippingOptionsReturn
                const isEqual = wsMain.modules['checkout-cart'].subFunctions.isEqualArrays(oldShippingOpt, actualShippingOpt)
                // console.log("test ~ setTimeout ~ isEqual:", isEqual)
                // console.log('watchingShipping2', oldShippingOpt, actualShippingOpt)

                const shippingKeys = Object.keys(shippingMsgReturn)

                if (!shippingKeys.length || shippingMsgReturn.status == 400) {
                    const allBtnFinish = document.querySelectorAll('#ws-carrinhoNovo .buttonFinalizar')
                    if (!allBtnFinish.length) return

                    allBtnFinish.forEach(btnFinish => {
                        if (btnFinish) btnFinish.classList.remove('finishing')
                    })
                }

                if (!isEqual || shippingMsgReturn.status == 400) {
                    const loader = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos .carrinhoLoader-container')

                    if (shippingMsgReturn.status == 400 && loader.classList.contains('loaderOn')) {
                        const shippingMsgContainer = document.querySelector('#ws-carrinhoNovo .errorMsgFrete')
                        shippingMsgContainer.style.display = 'flex'

                        loader.classList.remove('loaderOn')

                        const btn = document.querySelector('#ws-carrinhoNovo .frete .cepInput__infos button')
                        btn.style.display = ''
                    }

                    if (shippingMsgReturn.status == 400) {
                        watchingShipping(shippingOptionsReturn);
                        return
                    }

                    wsMain.modules['checkout-cart'].create({}, shippingOptionsReturn, shippingMsgReturn);
                    watchingShipping(shippingOptionsReturn);
                    return
                }
                watchingShipping(recursiveShippingOpt);
            }, 1000)
        }

        function watchingCupom() {
            setTimeout(() => {
                if (Object.keys(cartCupomAddReturn).length) {
                    // console.log("test ~ watchingCupom ~ isEqual:",isEqual, oldCupom, actualCupom)
                    // console.log('cartCupomAddReturn success:', cartCupomAddReturn)

                    if (!cartCupomAddReturn.success) {
                        // console.log('cartCupomAddReturn success:', cartCupomAddReturn.success)
                        const invalideMessage = document.querySelector("#ws-carrinhoNovo .resumo .inserirCupom .errorMsgCupom")
                        invalideMessage.classList.remove("hiddenMessageCupom")

                        const btn = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom > .inserirCupom-container>button')
                        btn.style.display = ""

                        const loader = document.querySelector('#ws-carrinhoNovo .inserirCupom > .inserirCupom-container > .carrinhoLoader-container')
                        loader.classList.remove('loaderOn')
                    } else if(cartCupomAddReturn.success && cartCupomAddReturn.new){
                        setTimeout(() => {
                            const cupomCheckbox = document.querySelector('#inserirCupom')
                            cupomCheckbox.checked = false

                            const cupomLabel = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom > label')
                            cupomLabel.innerHTML = 'Alterar cupom'
                            
                            const loader = document.querySelector('#ws-carrinhoNovo .inserirCupom > .inserirCupom-container > .carrinhoLoader-container')
                            loader.classList.remove('loaderOn')
                
                            const btn = document.querySelector('#ws-carrinhoNovo .resumo .inserirCupom > .inserirCupom-container>button')
                            btn.style.display = ""
                            
                            const cupomDiscount = document.querySelector('#ws-carrinhoNovo .resumo .validCupomDiscount')
                            cupomDiscount.style.display = ''

                            if(cartCupomAddReturn.title) {
                                let validCupomLabel = cartCupomAddReturn.title;

                                if(validCupomLabel && validCupomLabel.includes('cashback')) {
                                    validCupomLabel = "Cashback";
                                }

                                cupomDiscount.querySelector('.validCupomDiscount__title').innerHTML = validCupomLabel
                                const invalideMessage = document.querySelector("#ws-carrinhoNovo .resumo .inserirCupom .errorMsgCupom")
                                invalideMessage.classList.add("hiddenMessageCupom")
                            }

                            if(cartCupomAddReturn.descount) {
                                cupomDiscount.querySelector('.validCupomDiscount__value').innerHTML = `- ${cartCupomAddReturn.descount}`
                            }

                            cartCupomAddReturn.new = false
                            funcCupomFinished()
                        }, 1000)
                    }

                    watchingCupom();

                    return
                }

                watchingCupom();
            }, 1000)
        }

        function watchingFinishOrder() {
            setTimeout(() => {
                wsMain.modules['checkout-cart'].factoryFunctions.updateFinishButton(finishOrderButtonStatus)

                watchingFinishOrder();
            }, 1000)
        }

        watchingCupom(cupom)
        watchingShipping(shippingOpt)
        watchingLastUpdate(data)
        watchingFinishOrder()
    },
    observer() {
        if (window.innerWidth > 800) return

        const floatResume = document.querySelector('.float-resume')
        const resume = document.querySelector('#ws-carrinhoNovo .resumo')
        floatResume.setAttribute('float-resume', 'active')

        wsMain.modules['checkout-cart'].factoryFunctions.createMobileResumeInfos();

        if (floatResume.dataset.libraryNameObserverType) return

        const handleScroll = () => {
            const targetRect = resume.getBoundingClientRect();
            if ((targetRect.top + 70) > window.innerHeight) {
                floatResume.setAttribute('float-resume', 'active')
            } else {
                floatResume.setAttribute('float-resume', 'off')
            }
        };

        // Adiciona o listener de scroll
        window.addEventListener('scroll', handleScroll);

        floatResume.dataset.libraryNameObserverType = true
    },
    finishLoader() {
        setTimeout(() => {
            const body = document.querySelector('body')
            const footer = document.querySelector('footer')
            const content = document.querySelector('#ws-carrinhoNovo .checkout-content')
            wsMain.tools.hideLoading()
            body.style.overflow = 'initial'
            footer.classList.remove('startingCart')
            content.classList.remove('startingCart')
        }, 2000)
    }
});




/*  
===========================================
===========================================

MODULE: GIFT SLIDER (20/01/2026)
Exibe os brindes disponÃ­veis em um slider no checkout

===========================================
===========================================
*/
//  controle global de logs (true = mostra logs / false = nÃ£o mostra nada)
var WS_GIFT_SLIDER_DEBUG = false;

//  helper de log (nÃ£o muda arquitetura / sÃ³ centraliza os console.log)
function wsGiftLog() {
    if (!WS_GIFT_SLIDER_DEBUG) return;
    try { console.log.apply(console, arguments); } catch (_) { }
}

setTimeout(() => {
    wsMain.createModule({
        name: "gift-slider",
        function: "get",
        subFunctions: {
            createAncors() {
                const pageWidth = window.innerWidth;

                //  Ã¢ncora custom: qualquer tag com data-ws-ancor="gifts"
                const wsGiftsAnchor = document.querySelector('[data-ws-ancor="gifts"]');
                const hasWsAnchor = !!wsGiftsAnchor;

                wsGiftLog(
                    "[gift-slider] createAncors() | anchor [data-ws-ancor='gifts'] existe:",
                    hasWsAnchor
                );

                //  Se existe Ã¢ncora custom, usamos SOMENTE ela (nada de topo/drawer)
                if (hasWsAnchor) {
                    // remove qualquer Ã¢ncora criada automaticamente antes (se existia)
                    try { wsMain.modules["gift-slider"].destroyCreatedAnchors(); } catch (_) { }

                    // define o tipo correto (checkout vs checkoutMobile)
                    const targetType = pageWidth < 1000 ? "checkoutMobile" : "checkout";

                    // transforma a Ã¢ncora custom em Ã¢ncora vÃ¡lida do mÃ³dulo
                    wsGiftsAnchor.setAttribute("cart-gift-slider", targetType);
                    wsGiftsAnchor.setAttribute("data-gift-slider-created", "0"); //  nÃ£o remover
                    wsGiftsAnchor.dataset.wsGiftsMounted = "1"; // reaproveita como mount
                    // nÃ£o limpa aqui â€” vamos limpar sÃ³ quando realmente renderizar

                    wsGiftLog(
                        "[gift-slider] createAncors() | Ã¢ncora custom configurada como:",
                        targetType
                    );

                    return;
                }

                // ---------------------------
                // comportamento antigo (sem Ã¢ncora custom)
                // ---------------------------

                wsGiftLog("[gift-slider] createAncors() | pageWidth:", pageWidth);

                let topo = document.querySelector("header .header-top .cart-holder");

                if (pageWidth < 1000) {
                    topo = document.querySelector(
                        "header .header-top .cart-holder .mobile-menu-side:last-of-type"
                    );
                }

                const cartDrawerAncor = pageWidth < 1000 ? "cartDrawerMobile" : "cartDrawer";

                wsGiftLog(
                    "[gift-slider] createAncors() | topo:",
                    !!topo,
                    "| cartDrawerAncor:",
                    cartDrawerAncor
                );

                if (topo) {
                    //  checa globalmente pra nÃ£o duplicar
                    const alreadyGlobal = document.querySelector(`[cart-gift-slider="${cartDrawerAncor}"]`);
                    if (!alreadyGlobal) {
                        const cartDrawerElm = wsMain.tools.createElm({
                            type: "div",
                            attrs: {
                                "cart-gift-slider": cartDrawerAncor,
                                "data-gift-slider-created": "1",
                            },
                        });

                        topo.insertBefore(
                            cartDrawerElm,
                            topo.querySelector(".cart-items-holder")
                        );

                        wsGiftLog("[gift-slider] createAncors() | ancora drawer criada:", cartDrawerAncor);
                    } else {
                        wsGiftLog("[gift-slider] createAncors() | drawer jÃ¡ existia (global):", cartDrawerAncor);
                    }
                } else {
                    wsGiftLog("[gift-slider] createAncors() | topo nÃ£o encontrado (ok em algumas pÃ¡ginas)");
                }

                const etapasObj = {
                    carrinho() {
                        let container = document.querySelector(".PageCheckoutCar .login-cart-row .container");
                        let existAncor = document.querySelector(".PageCheckoutCar .login-cart-row [cart-gift-slider]");

                        if (typeof newCartVersion !== "undefined") {
                            container = document.querySelector("#ws-carrinhoNovo");
                            existAncor = document.querySelector('#ws-carrinhoNovo [ws-cart-app="app-gifts"]');

                            wsGiftLog(
                                "[gift-slider] createAncors() carrinho() | newCartVersion:",
                                true,
                                "| container #ws-carrinhoNovo:",
                                !!container,
                                "| wrapper app-gifts:",
                                !!existAncor
                            );

                            if (existAncor) {
                                const targetType = pageWidth < 1000 ? "checkoutMobile" : "checkout";
                                const alreadyInside = existAncor.querySelector(`[cart-gift-slider="${targetType}"]`);

                                if (!alreadyInside) {
                                    const giftAncor = wsMain.tools.createElm({
                                        type: "div",
                                        attrs: {
                                            "cart-gift-slider": targetType,
                                            "data-gift-slider-created": "1",
                                        },
                                    });

                                    existAncor.append(giftAncor);

                                    wsGiftLog(
                                        "[gift-slider] createAncors() carrinho() | ancora criada dentro do app-gifts:",
                                        targetType
                                    );
                                } else {
                                    wsGiftLog("[gift-slider] createAncors() carrinho() | ancora jÃ¡ existia dentro do app-gifts:", targetType);
                                }
                                return;
                            }
                        }

                        wsGiftLog(
                            "[gift-slider] createAncors() carrinho() | container antigo:",
                            !!container,
                            "| existAncor:",
                            !!existAncor
                        );

                        if (!container || existAncor) return;

                        const fatherContainer = container.parentNode;
                        const targetType = pageWidth < 1000 ? "checkoutMobile" : "checkout";

                        const alreadyGlobal = document.querySelector(`[cart-gift-slider="${targetType}"]`);
                        if (alreadyGlobal) return;

                        const giftAncor = wsMain.tools.createElm({
                            type: "div",
                            attrs: {
                                "cart-gift-slider": targetType,
                                "data-gift-slider-created": "1",
                            },
                        });

                        fatherContainer.insertBefore(giftAncor, container);

                        wsGiftLog("[gift-slider] createAncors() carrinho() | ancora inserida antes do container:", targetType);
                    },
                };

                const etapa = document.querySelector("#HdEtapaLoja")?.value;
                wsGiftLog("[gift-slider] createAncors() | etapa:", etapa);

                try {
                    etapasObj[etapa] ? etapasObj[etapa]() : null;
                } catch (error) {
                    wsGiftLog("[gift-slider] createAncors() | error:", error);
                }
            },

            treatMoney(value) {
                try {
                    const n = Number(value);
                    if (!isFinite(n)) return "R$ 0,00";
                    if (wsMain?.data?.treatPrice) return wsMain.data.treatPrice(n);
                } catch (_) { }

                try {
                    const n = Number(value) || 0;
                    return n.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    });
                } catch (_) { }

                return "R$ 0,00";
            },

            //  CORREÃ‡ÃƒO PRINCIPAL: ler "cartJson" (global lexical), nÃ£o sÃ³ window.cartJson
            getCartJson() {
                wsGiftLog("[gift-slider] getCartJson() | tentando obter cartJson...");

                // 1) cartJson (do seu DOM: "let cartJson = {}")
                try {
                    if (typeof cartJson !== "undefined" && cartJson && typeof cartJson === "object") {
                        wsGiftLog("[gift-slider] getCartJson() | encontrado em variÃ¡vel global: cartJson");
                        return cartJson;
                    }
                } catch (e) {
                    wsGiftLog("[gift-slider] getCartJson() | erro ao acessar cartJson:", e);
                }

                // 2) window.cartJson (caso alguÃ©m tenha setado)
                try {
                    if (
                        typeof window.cartJson !== "undefined" &&
                        window.cartJson &&
                        typeof window.cartJson === "object"
                    ) {
                        wsGiftLog("[gift-slider] getCartJson() | encontrado em window.cartJson");
                        return window.cartJson;
                    }
                } catch (e) {
                    wsGiftLog("[gift-slider] getCartJson() | window.cartJson erro:", e);
                }

                // 3) keepcartJson (tambÃ©m existe no seu DOM)
                try {
                    if (typeof keepcartJson !== "undefined" && keepcartJson && typeof keepcartJson === "object") {
                        wsGiftLog("[gift-slider] getCartJson() | encontrado em variÃ¡vel global: keepcartJson");
                        return keepcartJson;
                    }
                } catch (e) {
                    wsGiftLog("[gift-slider] getCartJson() | erro ao acessar keepcartJson:", e);
                }

                wsGiftLog("[gift-slider] getCartJson() | NÃƒO encontrado (null)");
                return null;
            },

            getCartSignature(cart) {
                try {
                    if (!cart || typeof cart !== "object") return "";
                    const v = cart.version || "";
                    const u = cart.lastUpdate || "";
                    const t = cart.total || "";
                    const s = cart.subtotal || "";
                    const giftsCount = Array.isArray(cart.gifts) ? cart.gifts.length : 0;
                    const prodsCount = Array.isArray(cart.products) ? cart.products.length : 0;

                    const sig = `${v}|${u}|${t}|${s}|${giftsCount}|${prodsCount}`;
                    wsGiftLog("[gift-slider] getCartSignature() | signature:", sig);
                    return sig;
                } catch (e) {
                    wsGiftLog("[gift-slider] getCartSignature() | erro:", e);
                    return "";
                }
            },

            createGiftCard(gift, cartSubtotal, isChosen, chosenItemId) {
                try {
                    if (!gift || !gift.gift_product) return null;

                    const gp = gift.gift_product;
                    const applicable = !!gift.applicable;

                    const img = gp.photo
                        ? `<img src="${gp.photo}" alt="${(gp.name || "").replace(/"/g, "&quot;")}">`
                        : `<span data-wsjs-icon="noimage"></span>`;

                    //  STATUS
                    let statusHtml = "";
                    if (isChosen) {
                        statusHtml = `<span class="gift__status gift__status--chosen">Escolhido</span>`;
                    } else if (applicable) {
                        statusHtml = `<span class="gift__status gift__status--ok">Dispon&iacute;vel</span>`;
                    } else {
                        const min = Number(gift.min_value_applied || 0);
                        const sub = Number(cartSubtotal || 0);
                        const missing = min > sub ? min - sub : 0;

                        statusHtml = `
                <span class="gift__status gift__status--wait">Ainda n&atilde;o liberado</span>
                ${missing > 0
                                ? `<span class="gift__missing">Faltam ${this.treatMoney(missing)}</span>`
                                : ``
                            }
            `;
                    }

                    //  AÃ‡ÃƒO
                    let actionHtml = "";

                    // - Se jÃ¡ escolhido -> nada
                    // - Se nÃ£o liberado -> nada
                    // - Se liberado e outro jÃ¡ escolhido -> envia ID + itemId
                    // - Se liberado e nenhum escolhido -> envia sÃ³ ID
                    if (!isChosen && applicable) {
                        if (chosenItemId) {
                            actionHtml = `
                    <a class="chosegift_btn"
                       href="javascript:void(func_chose_gift(${gp.id}, ${chosenItemId}))">
                       Quero esse brinde
                    </a>`;
                        } else {
                            actionHtml = `
                    <a class="chosegift_btn"
                       href="javascript:void(func_chose_gift(${gp.id}))">
                       Quero esse brinde
                    </a>`;
                        }
                    }

                    return wsMain.tools.createElm({
                        type: "div",
                        attrs: {
                            class: `gift-prod ${applicable ? "is-applicable" : "not-applicable"} ${isChosen ? "is-chosen" : ""}`,
                        },
                        innerHTML: `
                <div class="gift__image-container">
                    <div class="gift__image-link">${img}</div>
                </div>

                <div class="gift__infos-container">
                    <p class="gift__name">${gp.name || "Brinde"}</p>
                    <div class="gift__meta">${statusHtml}</div>
                    <div class="gift__action">${actionHtml}</div>
                </div>
            `,
                    });
                } catch (e) {
                    wsGiftLog("[gift-slider] createGiftCard() | erro:", e);
                    return null;
                }
            },

            getGiftsSignature(cartOrGifts) {
                try {
                    // Aceita tanto cartJson quanto gifts array
                    const isCart = cartOrGifts && typeof cartOrGifts === "object" && Array.isArray(cartOrGifts.gifts);
                    const gifts = isCart ? cartOrGifts.gifts : cartOrGifts;

                    if (!Array.isArray(gifts) || gifts.length === 0) return "nogifts";

                    //  SKUs do carrinho (pra saber se jÃ¡ foi escolhido)
                    let cartSkus = [];
                    if (isCart && Array.isArray(cartOrGifts.products)) {
                        cartSkus = cartOrGifts.products
                            .map((p) => (p && p.sku ? String(p.sku).trim() : ""))
                            .filter((s) => !!s);
                    }

                    const parts = gifts.map((g) => {
                        const gp = g?.gift_product || {};
                        const id = g?.id ?? "";
                        const applicable = g?.applicable ? "1" : "0";
                        const min = Number(g?.min_value_applied || 0);

                        const prodId = gp?.id ?? gp?.sku ?? gp?.product_id ?? "";
                        const name = (gp?.name || "").trim();
                        const photo = gp?.photo || "";

                        //  escolhido = sku do brinde existe no array de products do carrinho
                        const giftSku = gp?.sku ? String(gp.sku).trim() : "";
                        const chosen = giftSku && cartSkus.length ? (cartSkus.indexOf(giftSku) > -1 ? "1" : "0") : "0";

                        //  inclui chosen na assinatura (pra re-renderizar quando SKU entra/sai)
                        return `${id}:${chosen}:${applicable}:${min}:${prodId}:${name}:${photo}`;
                    });

                    // estabilidade
                    parts.sort();

                    const sig = parts.join("|");
                    wsGiftLog("[gift-slider] getGiftsSignature() | sig:", sig);
                    return sig;
                } catch (e) {
                    wsGiftLog("[gift-slider] getGiftsSignature() | erro:", e);
                    return "";
                }
            },
        },

        async get() {
            try {
                wsGiftLog("[gift-slider] get() | iniciado");
                wsMain.modules["gift-slider"].subFunctions.createAncors();

                //  comeÃ§a escondido (sÃ³ aparece quando renderizar)
                wsHideGiftsAnchor();

                wsGiftLog("[gift-slider] get() | updateFromCartJson(false)");
                wsMain.modules["gift-slider"].updateFromCartJson(false);

                wsGiftLog("[gift-slider] get() | iniciando watching()");
                return wsMain.modules["gift-slider"].watching();
            } catch (error) {
                wsGiftLog("[gift-slider] get() | error:", error);
                return false;
            }
        },

        async watching(lastSignature = "", cycle = 0) {
            try {
                const check = async () => {
                    cycle = cycle + 1;

                    const cart = wsMain.modules["gift-slider"].subFunctions.getCartJson();

                    if (!cart) {
                        wsGiftLog("[gift-slider] watching() | cartJson ainda nÃ£o dispon&iacute;vel, tentando novamente...");
                        wsMain.modules["gift-slider"].watching(lastSignature, cycle);
                        return true;
                    }

                    // assinatura "geral" (pode mudar sempre)
                    const signature = wsMain.modules["gift-slider"].subFunctions.getCartSignature(cart);

                    //  assinatura sÃ³ dos brindes (sÃ³ muda se brindes mudarem)
                    const giftsSig = wsMain.modules["gift-slider"].subFunctions.getGiftsSignature(cart);

                    //  detecta se existe algum bloco de brindes jÃ¡ renderizado na pÃ¡gina
                    const hasRenderedBlock = !!document.querySelector('[cart-gift-slider][data-ws-gifts-sig]');

                    //  se version mudou, o DOM pode ter sido trocado (carrinho novo/antigo),
                    // entÃ£o recria Ã¢ncoras; mas sÃ³ re-renderiza se necessÃ¡rio.
                    const versionNow = cart?.version || "";
                    const lastVersion = wsMain.modules["gift-slider"]._lastVersion || "";

                    wsGiftLog(
                        "[gift-slider] watching() | cycle:",
                        cycle,
                        "| signature:",
                        signature,
                        "| giftsSig:",
                        giftsSig,
                        "| versionNow:",
                        versionNow,
                        "| lastVersion:",
                        lastVersion,
                        "| hasRenderedBlock:",
                        hasRenderedBlock
                    );

                    if (versionNow && versionNow !== lastVersion) {
                        wsGiftLog("[gift-slider] watching() | version mudou -> recriando Ã¢ncoras (sem re-render desnecessÃ¡rio)");
                        wsMain.modules["gift-slider"]._lastVersion = versionNow;

                        // remove apenas Ã¢ncoras criadas automaticamente (nÃ£o remove a Ã¢ncora custom)
                        wsMain.modules["gift-slider"].destroyCreatedAnchors();

                        // recria anchors corretas pro DOM atual
                        wsMain.modules["gift-slider"].subFunctions.createAncors();

                        //  se o DOM foi trocado e sumiu o render, precisa renderizar mesmo que giftsSig seja igual
                        const hasRenderedAfter = !!document.querySelector('[cart-gift-slider][data-ws-gifts-sig]');
                        if (!hasRenderedAfter) {
                            wsGiftLog("[gift-slider] watching() | DOM trocado e nÃ£o existe render -> renderizando");
                            wsMain.modules["gift-slider"].updateFromCartJson(false);
                        } else {
                            // se existe render e giftsSig nÃ£o mudou, nÃ£o mexe
                            const any = document.querySelector('[cart-gift-slider][data-ws-gifts-sig]');
                            const renderedSig = any ? (any.getAttribute("data-ws-gifts-sig") || "") : "";
                            if (renderedSig !== giftsSig) {
                                wsGiftLog("[gift-slider] watching() | render existe mas sig difere -> renderizando");
                                wsMain.modules["gift-slider"].updateFromCartJson(false);
                            } else {
                                wsGiftLog("[gift-slider] watching() | sig igual -> nÃ£o mexe no HTML");
                            }
                        }

                        wsMain.modules["gift-slider"].watching(signature, cycle);
                        return true;
                    }

                    //  se gifts nÃ£o mudou e jÃ¡ tem render com a mesma assinatura, NÃƒO mexe no HTML
                    if (hasRenderedBlock) {
                        const any = document.querySelector('[cart-gift-slider][data-ws-gifts-sig]');
                        const renderedSig = any ? (any.getAttribute("data-ws-gifts-sig") || "") : "";

                        if (renderedSig && renderedSig === giftsSig) {
                            wsMain.modules["gift-slider"].watching(signature, cycle);
                            return true;
                        }
                    }

                    // Se mudou algo relevante (brindes), renderiza
                    if (signature && signature !== lastSignature) {
                        wsGiftLog("[gift-slider] watching() | mudou algo -> updateFromCartJson(true)");
                        wsMain.modules["gift-slider"].updateFromCartJson(true);
                        wsMain.modules["gift-slider"].watching(signature, cycle);
                        return true;
                    }

                    wsMain.modules["gift-slider"].watching(lastSignature, cycle);
                    return true;
                };

                setTimeout(check, 1000);
                return true;
            } catch (error) {
                wsGiftLog("[gift-slider] watching() | error:", error);
                return false;
            }
        },

        _lastVersion: "",

        updateFromCartJson(update) {
            try {
                wsGiftLog("[gift-slider] updateFromCartJson() | update:", !!update);

                const cart = wsMain.modules["gift-slider"].subFunctions.getCartJson();
                const gifts = cart?.gifts;

                wsGiftLog(
                    "[gift-slider] updateFromCartJson() | cart existe:",
                    !!cart,
                    "| gifts Ã© array:",
                    Array.isArray(gifts),
                    "| gifts length:",
                    Array.isArray(gifts) ? gifts.length : "n/a"
                );

                //  sem brindes: limpa e esconde a Ã¢ncora custom (se existir)
                if (!Array.isArray(gifts) || gifts.length === 0) {
                    wsGiftLog("[gift-slider] updateFromCartJson() | sem brindes -> clear + hide anchor");

                    wsMain.modules["gift-slider"].clear(update);
                    wsHideGiftsAnchor();

                    return false;
                }

                //  assinatura do CONTEÃšDO (agora correta)
                const newSig = wsMain.modules["gift-slider"].subFunctions.getGiftsSignature(cart);

                //  pega todas as Ã¢ncoras reais (inclui a custom, agora com cart-gift-slider)
                const allAncors = document.querySelectorAll("[cart-gift-slider]");
                let changed = false;

                allAncors.forEach((ancor) => {
                    const oldSig = ancor.getAttribute("data-ws-gifts-sig") || "";
                    if (oldSig && oldSig === newSig) return;
                    changed = true;
                });

                if (!changed) {
                    wsGiftLog("[gift-slider] updateFromCartJson() | conteÃºdo igual (sig) -> NÃƒO atualiza HTML");
                    wsShowGiftsAnchor();
                    return true;
                }

                wsGiftLog("[gift-slider] updateFromCartJson() | conteÃºdo mudou -> renderiza");
                wsMain.modules["gift-slider"].create(gifts, cart, update);

                return true;
            } catch (error) {
                wsGiftLog("[gift-slider] updateFromCartJson() | error:", error);
                return false;
            }
        },

        async create(giftsArr, cartJson, update) {
            try {
                if (!Array.isArray(giftsArr) || giftsArr.length === 0) return;

                const pageWidth = window.innerWidth;

                //  perView dinÃ¢mico pra nÃ£o â€œencolherâ€ quando tem poucos itens
                const giftsCount = giftsArr.length;

                const sliderOptionsObj = {
                    checkout() {
                        const perView = giftsCount <= 2 ? 2 : 3.4;
                        return `slides.perView:${perView};
slides.spacing:20;
dots:false;
loop:false;
dotsType:group;`;
                    },
                    cartDrawer() {
                        const perView = giftsCount <= 1 ? 1 : 1.2;
                        return `slides.perView:${perView};
slides.spacing:16;
dots:false;
dotsType:group;
loop:false;`;
                    },
                    checkoutMobile() {
                        return `slides.perView:1;
slides.spacing:16;
dots:false;
loop:false;
dotsType:group;`;
                    },
                    cartDrawerMobile() {
                        return `slides.perView:1;
slides.spacing:16;
dots:false;
loop:false;
dotsType:group;`;
                    },
                };

                const cartDrawerAncor = pageWidth < 800 ? "cartDrawerMobile" : "cartDrawer";

                const allAncors = update
                    ? document.querySelectorAll(
                        `[cart-gift-slider="${cartDrawerAncor}"],[cart-gift-slider="checkout"],[cart-gift-slider="checkoutMobile"]`
                    )
                    : document.querySelectorAll("[cart-gift-slider]");

                wsGiftLog(
                    "[gift-slider] create() | anchors encontrados:",
                    allAncors ? allAncors.length : 0,
                    "| update:",
                    !!update
                );

                const cartSubtotal = Number(cartJson?.subtotal || 0);

                //  Assinatura baseada no CART (inclui chosen por SKU agora)
                const newSig = wsMain.modules["gift-slider"].subFunctions.getGiftsSignature(
                    cartJson || { gifts: giftsArr, products: [] }
                );

                //  SKUs do carrinho
                const cartSkus = Array.isArray(cartJson?.products)
                    ? cartJson.products
                        .map((p) => (p && p.sku ? String(p.sku).trim() : ""))
                        .filter((s) => !!s)
                    : [];

                //  SKUs possÃ­veis de brinde (aqui estÃ¡ o FIX: nÃ£o Ã© qualquer sku do carrinho)
                const giftSkus = Array.isArray(giftsArr)
                    ? giftsArr
                        .map((g) => (g && g.gift_product && g.gift_product.sku ? String(g.gift_product.sku).trim() : ""))
                        .filter((s) => !!s)
                    : [];

                //  se existir um escolhido, guarda o itemId dele (produto do carrinho cujo sku Ã© de algum brinde)
                const chosenCartProduct = Array.isArray(cartJson?.products)
                    ? cartJson.products.find((p) => {
                        const sku = p && p.sku ? String(p.sku).trim() : "";
                        if (!sku) return false;
                        return giftSkus.indexOf(sku) > -1;
                    })
                    : null;

                const chosenItemId =
                    chosenCartProduct && chosenCartProduct.itemId
                        ? chosenCartProduct.itemId
                        : null;

                wsGiftLog(
                    "[gift-slider] create() | chosenCartProduct:",
                    chosenCartProduct ? { sku: chosenCartProduct.sku, itemId: chosenCartProduct.itemId } : null
                );

                const isGiftChosenBySku = (gift) => {
                    try {
                        const sku = gift?.gift_product?.sku ? String(gift.gift_product.sku).trim() : "";
                        if (!sku || !cartSkus.length) return false;
                        return cartSkus.indexOf(sku) > -1;
                    } catch (_) {
                        return false;
                    }
                };

                //  Ordena: escolhido primeiro, depois mantÃ©m ordem original
                const giftsSorted = giftsArr
                    .map((g, i) => ({ g, i, chosen: isGiftChosenBySku(g) }))
                    .sort((a, b) => {
                        if (a.chosen === b.chosen) return a.i - b.i;
                        return a.chosen ? -1 : 1;
                    })
                    .map((x) => x.g);

                allAncors.forEach((ancor, idx) => {
                    if (!ancor) return;

                    const ancorAttrValue = ancor.getAttribute("cart-gift-slider");
                    const dataWsjsSlide = sliderOptionsObj[ancorAttrValue]
                        ? sliderOptionsObj[ancorAttrValue]()
                        : null;

                    wsGiftLog(
                        `[gift-slider] create() | anchor #${idx} | tipo:`,
                        ancorAttrValue,
                        "| slideCfg:",
                        !!dataWsjsSlide
                    );

                    if (!dataWsjsSlide) return;

                    //  se assinatura igual, nÃ£o mexe no HTML desse ancor
                    const oldSig = ancor.getAttribute("data-ws-gifts-sig") || "";
                    if (oldSig && oldSig === newSig) {
                        wsGiftLog(`[gift-slider] create() | anchor #${idx} sig igual -> skip DOM`);
                        wsShowGiftsAnchor();
                        return;
                    }

                    // marca assinatura atual
                    ancor.setAttribute("data-ws-gifts-sig", newSig);

                    // garante config do slider
                    ancor.setAttribute("data-wsjs-slide", dataWsjsSlide);

                    // ðŸ”¥ rebuild do HTML (sÃ³ quando mudou)
                    ancor.innerHTML = "";

                    ancor.append(
                        wsMain.tools.createElm({
                            type: "div",
                            attrs: { class: "container" },
                        })
                    );

                    const ancorContainer = ancor.querySelector(".container");

                    ancorContainer.append(
                        wsMain.tools.createElm({
                            type: "div",
                            attrs: { class: "gift__title" },
                            innerHTML: `<h2>Brindes</h2>`,
                        }),
                        wsMain.tools.createElm({
                            type: "div",
                            attrs: { class: "gift__sliderProds" },
                        })
                    );

                    const containerToGifts = ancor.querySelector(".gift__sliderProds");
                    containerToGifts.style.opacity = 0;

                    giftsSorted.forEach((gift) => {
                        const chosen = isGiftChosenBySku(gift);

                        const giftElm =
                            wsMain.modules["gift-slider"].subFunctions.createGiftCard(
                                gift,
                                cartSubtotal,
                                chosen,
                                chosenItemId
                            );

                        if (giftElm) containerToGifts.append(giftElm);
                    });

                    const sliderOptions = wsMain.tools.getWsData(ancor, "slide");
                    const [sliderVrf, slider] = wsMain.tools.createSlide(
                        containerToGifts,
                        sliderOptions
                    );
                    if (sliderVrf) slider.update();

                    containerToGifts.style.opacity = 1;

                    wsShowGiftsAnchor();
                });

                return true;
            } catch (error) {
                wsGiftLog("[gift-slider] create() | error:", error);
                return false;
            }
        },

        destroyCreatedAnchors() {
            try {
                const created = document.querySelectorAll('[data-gift-slider-created="1"]');

                wsGiftLog(
                    "[gift-slider] destroyCreatedAnchors() | removendo:",
                    created ? created.length : 0
                );

                created.forEach((el) => {
                    try { el.remove(); } catch (_) { }
                });

                return true;
            } catch (error) {
                wsGiftLog("[gift-slider] destroyCreatedAnchors() | error:", error);
                return false;
            }
        },

        async clear(update) {
            try {
                const pageWidth = window.innerWidth;
                const cartDrawerAncor =
                    pageWidth < 800 ? "cartDrawerMobile" : "cartDrawer";

                const allAncors = update
                    ? document.querySelectorAll(
                        `[cart-gift-slider="${cartDrawerAncor}"]`
                    )
                    : document.querySelectorAll("[cart-gift-slider]");

                wsGiftLog(
                    "[gift-slider] clear() | update:",
                    !!update,
                    "| anchors:",
                    allAncors ? allAncors.length : 0
                );

                allAncors.forEach((ancor, idx) => {
                    if (!ancor) return;
                    ancor.innerHTML = "";
                    wsGiftLog(`[gift-slider] clear() | anchor #${idx} limpo`);
                });

                return true;
            } catch (error) {
                wsGiftLog("[gift-slider] clear() | error:", error);
                return false;
            }
        },
    });

    wsGiftLog("[gift-slider] bootstrap | chamando wsMain.modules['gift-slider'].get()");
    wsMain.modules["gift-slider"].get();
}, 3000);

function wsGetGiftsAnchor() {
    return document.querySelector('[data-ws-ancor="gifts"]');
}

function wsEnsureGiftsMountPoint() {
    const anchor = wsGetGiftsAnchor();

    if (!anchor) return null;

    // reutiliza o prÃ³prio elemento como mount
    if (!anchor.dataset.wsGiftsMounted) {
        anchor.dataset.wsGiftsMounted = "1";
        anchor.innerHTML = "";
    }

    return anchor;
}

function wsShowGiftsAnchor() {
    const anchor = wsGetGiftsAnchor();
    if (anchor) {
        anchor.style.display = "";
    }
}

function wsHideGiftsAnchor() {
    const anchor = wsGetGiftsAnchor();
    if (anchor) {
        anchor.style.display = "none";
    }
}

function wsRenderGifts(html) {
    const mount = wsEnsureGiftsMountPoint();
    if (!mount) return;

    mount.innerHTML = html;
    wsShowGiftsAnchor();
}

function func_chose_gift(id, remove) {
    let lvID = document.querySelector('#HD_LV_ID').value;
    let wait = 1;

    wsMain.tools.showLoading();

    if (remove) {
        removeProductCart(remove)
        wait = 5000;
    };

    setTimeout(() => { wsFuncBtBuyOnList(lvID, id, null, "1"); }, wait);
}
