const CONFIGURACAO = {
  ID_PLANILHA: "1hdhV0lNT_4UdiVlhJtcsEdHLQOm3-teC6EVRYTfDzhc",
  GID_RESUMO: "1487548419",
  GID_DETALHES: "844671531",
};

const elementos = {
  dataHoje: document.getElementById("data-hoje"),
  dataReferencia: document.getElementById("data-referencia"),
  mensagemStatus: document.getElementById("status-message"),
  modalTurmas: document.getElementById("modal-turmas"),
  modalTurmasTitulo: document.getElementById("modal-turmas-titulo"),
  modalTurmasLista: document.getElementById("modal-turmas-lista"),
};

const CONFIGURACAO_CARDS = [
  {
    prefixo: "professores_iniciais",
    percentualId: "percentual-professores-iniciais",
    totalId: "total-professores-iniciais",
    ausentesId: "ausentes-professores-iniciais",
  },
  {
    prefixo: "professores_finais",
    percentualId: "percentual-professores-finais",
    totalId: "total-professores-finais",
    ausentesId: "ausentes-professores-finais",
  },
  {
    prefixo: "fundamental_iniciais",
    percentualId: "percentual-fundamental-iniciais",
    totalId: "total-fundamental-iniciais",
    ausentesId: "ausentes-fundamental-iniciais",
  },
  {
    prefixo: "fundamental_finais",
    percentualId: "percentual-fundamental-finais",
    totalId: "total-fundamental-finais",
    ausentesId: "ausentes-fundamental-finais",
  },
  {
    prefixo: "eja_iniciais",
    percentualId: "percentual-eja-iniciais",
    totalId: "total-eja-iniciais",
    ausentesId: "ausentes-eja-iniciais",
  },
  {
    prefixo: "eja_finais",
    percentualId: "percentual-eja-finais",
    totalId: "total-eja-finais",
    ausentesId: "ausentes-eja-finais",
  },
];

const CONFIGURACAO_TURMAS = {
  "fundamental-iniciais": {
    titulo: "Fundamental — Anos Iniciais",
  },
  "fundamental-finais": {
    titulo: "Fundamental — Anos Finais",
  },
  "eja-iniciais": {
    titulo: "EJA — Anos Iniciais",
  },
  "eja-finais": {
    titulo: "EJA — Anos Finais",
  },
};

let turmasPorGrupo = {
  "fundamental-iniciais": [],
  "fundamental-finais": [],
  "eja-iniciais": [],
  "eja-finais": [],
};

function exibirStatus(mensagem, tipo = "") {
  if (!elementos.mensagemStatus) return;

  const temMensagem = Boolean(mensagem && mensagem.trim());

  elementos.mensagemStatus.textContent = mensagem || "";
  elementos.mensagemStatus.hidden = !temMensagem;
  elementos.mensagemStatus.classList.remove("is-error", "is-success");

  if (temMensagem && tipo) {
    elementos.mensagemStatus.classList.add(tipo);
  }
}

function converterRespostaGviz(texto) {
  const textoJson = texto
    .replace(/^.*?setResponse\(/s, "")
    .replace(/\);?\s*$/s, "");

  return JSON.parse(textoJson);
}

function converterDataGviz(valorBruto) {
  if (typeof valorBruto !== "string" || !valorBruto.startsWith("Date(")) {
    return "";
  }

  const partes = valorBruto
    .replace("Date(", "")
    .replace(")", "")
    .split(",")
    .map((item) => Number(item.trim()));

  const [ano, mes = 0, dia = 1] = partes;
  const data = new Date(ano, mes, dia);

  return Number.isNaN(data.getTime()) ? "" : formatarData(data);
}

function obterValorExibido(celula) {
  if (!celula) return "";

  if (typeof celula.f === "string" && celula.f.trim()) {
    return celula.f.trim();
  }

  if (celula.v == null) return "";

  if (typeof celula.v === "string" && celula.v.startsWith("Date(")) {
    return converterDataGviz(celula.v);
  }

  return celula.v;
}

function obterValorBruto(celula) {
  if (!celula || celula.v == null) return "";
  return celula.v;
}

function normalizarChave(valor) {
  return String(valor || "").trim().toLowerCase();
}

function normalizarNumeroTexto(valor) {
  return String(valor)
    .trim()
    .replace("%", "")
    .replace(/\./g, "")
    .replace(",", ".");
}

function converterParaNumero(valor) {
  if (valor == null || valor === "") return NaN;

  const numero = Number(
    typeof valor === "string" ? normalizarNumeroTexto(valor) : valor
  );

  return Number.isFinite(numero) ? numero : NaN;
}

function obterNumeroDaCelula(celula) {
  const numeroBruto = converterParaNumero(obterValorBruto(celula));

  if (Number.isFinite(numeroBruto)) {
    return numeroBruto;
  }

  return converterParaNumero(obterValorExibido(celula));
}

function formatarInteiro(valor) {
  const numero = converterParaNumero(valor);
  return Number.isFinite(numero) ? String(Math.round(numero)) : "0";
}

function formatarPercentual(valor) {
  const numero = converterParaNumero(valor);

  if (!Number.isFinite(numero)) {
    return "0,0%";
  }

  return `${numero.toFixed(1).replace(".", ",")}%`;
}

function formatarData(valor) {
  const data = valor instanceof Date ? valor : new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "--/--/----";
  }

  return data.toLocaleDateString("pt-BR");
}

function montarMapaDeDados(linhas) {
  const dados = {};

  linhas.forEach((celulas) => {
    const chave = normalizarChave(obterValorExibido(celulas[0]));

    if (!chave) return;

    dados[chave] = {
      bruto: obterValorBruto(celulas[1]),
      exibido: obterValorExibido(celulas[1]),
    };
  });

  return dados;
}

function normalizarTextoTurma(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obterGrupoDaTurma(turma) {
  const texto = normalizarTextoTurma(turma);

  if (texto.startsWith("4") || texto.startsWith("5")) {
    return "fundamental-iniciais";
  }

  if (
    texto.startsWith("6") ||
    texto.startsWith("7") ||
    texto.startsWith("8") ||
    texto.startsWith("9")
  ) {
    return "fundamental-finais";
  }

  if (texto.startsWith("eja iii") || texto.startsWith("eja iv")) {
    return "eja-finais";
  }

  if (texto.startsWith("eja i") || texto.startsWith("eja ii")) {
    return "eja-iniciais";
  }

  return "";
}

function montarGruposDeTurmas(linhas) {
  const grupos = {
    "fundamental-iniciais": [],
    "fundamental-finais": [],
    "eja-iniciais": [],
    "eja-finais": [],
  };

  linhas.forEach((celulas) => {
    const turma = String(obterValorExibido(celulas[0]) || "").trim();
    const grupo = obterGrupoDaTurma(turma);

    if (!grupo) return;

    const total = obterNumeroDaCelula(celulas[1]);
    const faltosos = obterNumeroDaCelula(celulas[2]);
    const percentual = obterNumeroDaCelula(celulas[3]);

    grupos[grupo].push({
      turma,
      total: Number.isFinite(total) ? total : 0,
      faltosos: Number.isFinite(faltosos) ? faltosos : 0,
      percentual: Number.isFinite(percentual)
        ? percentual <= 1
          ? percentual * 100
          : percentual
        : 0,
    });
  });

  return grupos;
}

function lerTexto(dados, chave) {
  const item = dados[chave];

  if (!item) {
    return "";
  }

  return String(item.exibido || "");
}

function lerNumero(dados, chave, valorPadrao = NaN) {
  const item = dados[chave];

  if (!item) {
    return valorPadrao;
  }

  const numeroBruto = converterParaNumero(item.bruto);

  if (Number.isFinite(numeroBruto)) {
    return numeroBruto;
  }

  const numeroExibido = converterParaNumero(item.exibido);

  return Number.isFinite(numeroExibido) ? numeroExibido : valorPadrao;
}

function resolverTotal(dados, prefixo) {
  return lerNumero(dados, `${prefixo}_total`, 0);
}

function resolverAusentes(dados, prefixo) {
  return lerNumero(dados, `${prefixo}_ausentes`, 0);
}

function resolverPercentual(dados, prefixo, total, ausentes) {
  const percentualInformado = lerNumero(dados, `${prefixo}_percentual`);

  if (Number.isFinite(percentualInformado)) {
    return percentualInformado <= 1
      ? percentualInformado * 100
      : percentualInformado;
  }

  if (Number.isFinite(total) && total > 0 && Number.isFinite(ausentes)) {
    return (ausentes / total) * 100;
  }

  return 0;
}

function renderizarDatas(dados) {
  if (elementos.dataHoje) {
    elementos.dataHoje.textContent = formatarData(new Date());
  }

  if (elementos.dataReferencia) {
    const dataReferencia = lerTexto(dados, "data_referencia");
    elementos.dataReferencia.textContent = dataReferencia || "--/--/----";
  }
}

function renderizarCards(dados) {
  CONFIGURACAO_CARDS.forEach((card) => {
    const elementoPercentual = document.getElementById(card.percentualId);
    const elementoTotal = document.getElementById(card.totalId);
    const elementoAusentes = document.getElementById(card.ausentesId);

    if (!elementoPercentual || !elementoTotal || !elementoAusentes) return;

    const total = resolverTotal(dados, card.prefixo);
    const ausentes = resolverAusentes(dados, card.prefixo);
    const percentual = resolverPercentual(dados, card.prefixo, total, ausentes);

    elementoTotal.textContent = formatarInteiro(total);
    elementoAusentes.textContent = formatarInteiro(ausentes);
    elementoPercentual.textContent = formatarPercentual(percentual);
  });
}

async function buscarLinhasDaPlanilha(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIGURACAO.ID_PLANILHA}/gviz/tq?tqx=out:json&gid=${gid}`;

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Falha ao buscar planilha: ${resposta.status}`);
  }

  const texto = await resposta.text();
  const jsonGviz = converterRespostaGviz(texto);

  return (jsonGviz.table?.rows || []).map((linha) => linha.c || []);
}

function obterTextoFaltosos(valor) {
  const numero = Math.round(converterParaNumero(valor));

  if (numero === 1) {
    return "1 faltoso";
  }

  return `${formatarInteiro(numero)} faltosos`;
}

function renderizarListaDoModal(turmas) {
  if (!elementos.modalTurmasLista) return;

  elementos.modalTurmasLista.replaceChildren();

  if (!turmas.length) {
    const mensagemVazia = document.createElement("p");
    mensagemVazia.className = "modal-turmas-vazio";
    mensagemVazia.textContent = "Nenhuma turma encontrada para este grupo.";
    elementos.modalTurmasLista.appendChild(mensagemVazia);
    return;
  }

  const totalFaltosos = turmas.reduce(
    (soma, turma) => soma + turma.faltosos,
    0
  );

  const resumo = document.createElement("p");
  resumo.className = "modal-turmas-resumo";
  resumo.textContent = `Total do grupo: ${obterTextoFaltosos(totalFaltosos)}.`;
  elementos.modalTurmasLista.appendChild(resumo);

  const lista = document.createElement("div");
  lista.className = "modal-turmas-itens";

  turmas.forEach((turma) => {
    const item = document.createElement("article");
    item.className = "modal-turmas-item";

    const nome = document.createElement("span");
    nome.textContent = turma.turma;

    const faltosos = document.createElement("strong");
    faltosos.textContent = obterTextoFaltosos(turma.faltosos);

    item.append(nome, faltosos);
    lista.appendChild(item);
  });

  elementos.modalTurmasLista.appendChild(lista);
}

function abrirModalTurmas(grupo) {
  const configuracao = CONFIGURACAO_TURMAS[grupo];

  if (!configuracao || !elementos.modalTurmas) return;

  if (elementos.modalTurmasTitulo) {
    elementos.modalTurmasTitulo.textContent = configuracao.titulo;
  }

  renderizarListaDoModal(turmasPorGrupo[grupo] || []);

  elementos.modalTurmas.hidden = false;
  document.body.classList.add("modal-aberto");

  const botaoFechar = elementos.modalTurmas.querySelector("[data-fechar-modal]");

  if (botaoFechar) {
    botaoFechar.focus();
  }
}

function fecharModalTurmas() {
  if (!elementos.modalTurmas) return;

  elementos.modalTurmas.hidden = true;
  document.body.classList.remove("modal-aberto");
}

function configurarModalTurmas() {
  const botoes = document.querySelectorAll("[data-grupo-turmas]");

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      abrirModalTurmas(botao.dataset.grupoTurmas);
    });
  });

  const elementosFechar = document.querySelectorAll("[data-fechar-modal]");

  elementosFechar.forEach((elemento) => {
    elemento.addEventListener("click", fecharModalTurmas);
  });

  document.addEventListener("keydown", (evento) => {
    if (
      evento.key === "Escape" &&
      elementos.modalTurmas &&
      !elementos.modalTurmas.hidden
    ) {
      fecharModalTurmas();
    }
  });
}

async function carregarDadosDaPlanilha() {
  try {
    exibirStatus("Lendo dados da planilha...", "is-success");

    const [linhasResumo, linhasDetalhes] = await Promise.all([
      buscarLinhasDaPlanilha(CONFIGURACAO.GID_RESUMO),
      buscarLinhasDaPlanilha(CONFIGURACAO.GID_DETALHES),
    ]);

    if (!linhasResumo.length) {
      throw new Error("A aba de saída para o site veio sem linhas válidas.");
    }

    const dados = montarMapaDeDados(linhasResumo);

    turmasPorGrupo = montarGruposDeTurmas(linhasDetalhes);

    renderizarDatas(dados);
    renderizarCards(dados);

    exibirStatus("Dados da planilha lidos corretamente.", "is-success");
  } catch (erro) {
    console.error(erro);

    exibirStatus(
      "Não foi possível atualizar os dados da planilha no momento.",
      "is-error"
    );
  }
}

configurarModalTurmas();
renderizarDatas({});
carregarDadosDaPlanilha();