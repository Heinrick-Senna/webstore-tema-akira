wsMain.createModule({
  name: "checkout-cart-header",
  function: 'get',
  subFunctions: {
    progressBar() {
      try {
        const objEtapa = {
            "carrinho": 0,
            "IDENTIFICACAO": 34,
            "FORMAS_PAGAMENTO": 67,
            "FinalPagamento": 100
        }

        const subEtapa = document.querySelector('#HdSubEtapaLoja')
        const etapa = document.querySelector('#HdEtapaLoja').value

        let width
        if (subEtapa) {
            width = objEtapa[subEtapa.value] ? objEtapa[subEtapa.value] : 0
        } else {
            width = objEtapa[etapa] ? objEtapa[etapa] : 0
        }

        const barras = document.querySelectorAll('.progresso-barra .progresso-barra__conteudo')
        barras.forEach(barra => {
            barra.style.width = width + '%'
        })

        const bolinha0 = document.querySelectorAll('.progresso:nth-child(1) .bolinha')
        const bolinha1 = document.querySelectorAll('.progresso:nth-child(2) .bolinha')
        const bolinha2 = document.querySelectorAll('.progresso:nth-child(3) .bolinha')
        const todasBolinhas = document.querySelectorAll('.progresso .bolinha')

        if (width < 32) {
            bolinha0.forEach(b0 => {
                b0.classList.add('bolinhaActive')
                b0.classList.add('bolinhaMainActive')
            })
        }

        if (width >= 32) {
            bolinha1.forEach(b1 => {
                b1.classList.add('bolinhaActive')
                if (width < 67) {
                    b1.classList.add('bolinhaMainActive')
                }
            })
        }

        if (width >= 67) {
            bolinha1.forEach(b1 => {
                b1.classList.add('bolinhaActive')
            })
            bolinha2.forEach(b2 => {
                b2.classList.add('bolinhaActive')
                if (width < 100) {
                    b2.classList.add('bolinhaMainActive')
                }
            })
        }

        if (width >= 100) {
            todasBolinhas.forEach(b => {
                b.classList.add('bolinhaActive')
            })
        }
      } catch (error) {
          console.log("test ~ progressBar ~ error:", error)
      }
    },
  },
  async get() {
      try {
        wsMain.modules['checkout-cart-header'].subFunctions.progressBar()
        
        console.log('modulo checkout-cart-header 17-01-25')
        return true
      } catch (error) {
          console.log("test ~ get ~ error:", error)
          return false
      }
  }
})
