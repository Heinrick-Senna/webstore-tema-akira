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