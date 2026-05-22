const slides = [
  {
    titulo: "Educação que transforma vidas e constrói futuros.",
    texto: "Compromisso, respeito e aprendizado todos os dias.",
    imagem: "assets/carrossel/1.webp",
    link: null
  },
  {
    titulo: "Celebração do Dia das Mães na escola",
    texto: "Um momento de afeto, acolhimento e integração entre estudantes, famílias e comunidade escolar.",
    imagem: "assets/carrossel/2.webp",
    link: "paginas/blog.html#cha-dia-das-maes"
  },
  {
    titulo: "Apresentação de trabalhos sobre o Dia da Terra",
    texto: "Estudantes compartilhando aprendizados sobre cuidado com o planeta e preservação do meio ambiente.",
    imagem: "assets/carrossel/3.webp",
    link: "paginas/blog.html#dia-da-terra"
  },
  {
    titulo: "Roda de leitura sobre Tiradentes",
    texto: "Uma atividade de leitura e conversa para aproximar os estudantes da história do Brasil e da cidadania.",
    imagem: "assets/carrossel/4.webp",
    link: "paginas/blog.html#tiradentes"
  },
  {
    titulo: "Documentário sobre os povos originários",
    texto: "Estudantes aprendendo sobre cultura, memória, respeito e valorização da diversidade brasileira.",
    imagem: "assets/carrossel/5.webp",
    link: "paginas/blog.html#povos-originarios"
  }
];

const carrosselCard = document.querySelector("#carrossel-card");
const carrosselTitulo = document.querySelector("#carrossel-titulo");
const carrosselTexto = document.querySelector("#carrossel-texto");
const botaoSlideAnterior = document.querySelector(".carrossel-seta-anterior");
const botaoProximoSlide = document.querySelector(".carrossel-seta-proxima");
const indicadores = Array.from(document.querySelectorAll(".carrossel-indicadores button"));

const tempoCarrossel = 20000;

let slideAtual = 0;
let intervaloCarrossel = null;

function obterIndiceSlide(indice) {
  return (indice + slides.length) % slides.length;
}

function atualizarIndicadores() {
  indicadores.forEach((indicador, indice) => {
    indicador.classList.toggle("ativo", indice === slideAtual);
  });
}

function atualizarLinkSlide(slide) {
  if (slide.link) {
    carrosselCard.setAttribute("role", "link");
    carrosselCard.setAttribute("tabindex", "0");
    carrosselCard.setAttribute("aria-label", `Abrir publicação: ${slide.titulo}`);
    carrosselCard.classList.add("carrossel-card-link");
  } else {
    carrosselCard.removeAttribute("role");
    carrosselCard.removeAttribute("tabindex");
    carrosselCard.removeAttribute("aria-label");
    carrosselCard.classList.remove("carrossel-card-link");
  }
}

function abrirLinkSlide() {
  const link = slides[slideAtual]?.link;

  if (link) {
    window.location.href = link;
  }
}

function atualizarConteudoSlide(indice) {
  slideAtual = obterIndiceSlide(indice);

  const slide = slides[slideAtual];

  carrosselTitulo.textContent = slide.titulo;
  carrosselTexto.textContent = slide.texto;

  atualizarLinkSlide(slide);

  carrosselCard.style.backgroundImage = `
    linear-gradient(
      90deg,
      rgba(2, 86, 153, 0.86) 0%,
      rgba(2, 86, 153, 0.62) 33%,
      rgba(2, 86, 153, 0.08) 64%
    ),
    url("${slide.imagem}")
  `;

  atualizarIndicadores();
}

function renderizarSlide(indice, animar = true) {
  if (!animar) {
    atualizarConteudoSlide(indice);
    return;
  }

  carrosselCard.classList.add("trocando-slide");

  setTimeout(() => {
    atualizarConteudoSlide(indice);

    requestAnimationFrame(() => {
      carrosselCard.classList.remove("trocando-slide");
    });
  }, 250);
}

function avancarSlide() {
  renderizarSlide(slideAtual + 1);
}

function voltarSlide() {
  renderizarSlide(slideAtual - 1);
}

function iniciarCarrossel() {
  intervaloCarrossel = setInterval(avancarSlide, tempoCarrossel);
}

function pararCarrossel() {
  clearInterval(intervaloCarrossel);
}

function reiniciarCarrossel() {
  pararCarrossel();
  iniciarCarrossel();
}

function configurarEventosCarrossel() {
  botaoSlideAnterior?.addEventListener("click", () => {
    voltarSlide();
    reiniciarCarrossel();
  });

  botaoProximoSlide?.addEventListener("click", () => {
    avancarSlide();
    reiniciarCarrossel();
  });

  indicadores.forEach((indicador, indice) => {
    indicador.addEventListener("click", () => {
      renderizarSlide(indice);
      reiniciarCarrossel();
    });
  });

  carrosselCard.addEventListener("click", abrirLinkSlide);

  carrosselCard.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      abrirLinkSlide();
    }
  });
}

function inicializarCarrossel() {
  if (!carrosselCard || !carrosselTitulo || !carrosselTexto || slides.length === 0) {
    return;
  }

  renderizarSlide(0, false);
  configurarEventosCarrossel();
  iniciarCarrossel();
}

inicializarCarrossel();