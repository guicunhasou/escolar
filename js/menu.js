const corpo = document.body;

const botaoMenu = document.querySelector(".botao-menu");
const menuPrincipal = document.querySelector(".menu-principal");

botaoMenu?.addEventListener("click", () => {
  const menuEstaAberto = corpo.classList.toggle("menu-aberto");
  botaoMenu.setAttribute("aria-expanded", String(menuEstaAberto));
});

menuPrincipal?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    corpo.classList.remove("menu-aberto");
    botaoMenu?.setAttribute("aria-expanded", "false");
  });
});