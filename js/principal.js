/* Aviso */
const aviso = document.querySelector(".aviso");
const botaoFecharAviso = document.querySelector(".botao-fechar-aviso");

botaoFecharAviso?.addEventListener("click", () => {
  if (aviso) {
    aviso.style.display = "none";
  }
});