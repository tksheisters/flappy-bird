// função para criar elemento html com uma classe
function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}
// função para criar as barreiras
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new Barreira(false)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// função que cria o par de barreiras
function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')
// adiciona as barreiras
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
// adiciona as barreiras ao elemento
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)
// sorteia a altura da barreira superior, e calcula a barreira inferior com base na superior
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
// para facilitar o manuseio e a leitura das informações do elemento
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// função que representa as quatro barreiras do jogo 
function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    // velocidade de deslocamento das barreiras
    const deslocamento = 2
    // função para animar os movimentos
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da tela
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            // quando a barreira passar do meio da tela aumenta a pontuação
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    }
}

// função para criar o passaro
function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = event => voando = true
    window.onkeyup = event => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 5 : -3)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        }
        else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }
        else{
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)

}



function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// const passaro = new Passaro(700)
// const barreiras = new Barreiras(700, 1200, 200, 400)
// const areaJogo = document.querySelector('[wm-flappy]')
// areaJogo.appendChild(passaro.elemento)
// areaJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)


// função para verificar sobreposição
function sobreposto(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function colisao(passaro, barreiras){
    let colisao = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colisao){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colisao = sobreposto(passaro.elemento, superior)
                || sobreposto(passaro.elemento, inferior)
        }
    })
    return colisao
}

function FlappyBird(){
    let pontos = 0

    const areaJogo = document.querySelector('[wm-flappy]')
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaJogo.appendChild(progresso.elemento)
    areaJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colisao(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20);
    }
}

new FlappyBird().start()