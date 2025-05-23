let tarefaEditando = null;

const msgVazia = document.getElementById("mensagem-vazia");

const atualizarMensagemVazia = () => {
  const tarefas = document.querySelectorAll(".tarefa");
  msgVazia.style.display = tarefas.length === 0 ? "block" : "none";
};

document.getElementById("limparcampos").addEventListener("click", () => {
  document.getElementById("formulario").reset();
  tarefaEditando = null;
  document.getElementById("submeter").textContent = "Submeter";
});

document.getElementById("submeter").addEventListener("click", () => {
  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const comentario = document.getElementById("comentario").value;
  const prioridade = document.getElementById("prioridade").value;
  const notificacao = document.getElementById("notificacao").value;

  const criadaEm = new Date().toISOString();
  const criadaFormatada = new Date(criadaEm).toLocaleDateString('pt-BR');
  const dataFormatada = new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  if (!titulo || !data) return alert("Preencha o título e a data da tarefa.");

  if (tarefaEditando) {
    tarefaEditando.querySelector(".titulo-tarefa").textContent = titulo;
    tarefaEditando.querySelector(".data-tarefa").textContent = data;
    tarefaEditando.querySelector(".data-tarefa-formatada-display").textContent = dataFormatada;
    tarefaEditando.querySelector(".prioridade").textContent = prioridade;
    tarefaEditando.querySelector(".comentario").textContent = comentario;
    tarefaEditando.querySelector(".notificacao").textContent = notificacao;

    tarefaEditando = null;
    this.textContent = "Submeter";
  } else {
    const nova = document.createElement("div");
    nova.classList.add("tarefa");
    nova.innerHTML = criarHTMLTarefa({ titulo, data, prioridade, comentario, notificacao, criadaEm, criadaFormatada, dataFormatada });

    document.getElementById("tarefas").appendChild(nova);

    nova.querySelector(".toggle-detalhes").addEventListener("click", function () {
      const detalhes = nova.querySelector(".detalhes");
      const visivel = detalhes.style.display === "block";
      detalhes.style.display = visivel ? "none" : "block";
      this.textContent = visivel ? "Mostrar mais" : "Ocultar";
    });

    nova.querySelector(".remover-tarefa").addEventListener("click", () => {
      nova.remove();
      atualizarMensagemVazia();
    });

    nova.querySelector(".editar-tarefa").addEventListener("click", () => ativarEdicao(nova));

    nova.querySelector(".titulo-tarefa").addEventListener("click", () => mostrarDetalhes(nova));
  }

  document.getElementById("formulario").reset();
  atualizarMensagemVazia();
});

function ativarEdicao(div) {
  tarefaEditando = div;
  document.getElementById("titulo").value = div.querySelector(".titulo-tarefa").textContent;
  document.getElementById("data").value = div.querySelector(".data-tarefa").textContent;
  document.getElementById("prioridade").value = div.querySelector(".prioridade").textContent;
  document.getElementById("comentario").value = div.querySelector(".comentario").textContent;
  document.getElementById("notificacao").value = div.querySelector(".notificacao").textContent;
  document.getElementById("submeter").textContent = "Salvar edição";
}

function criarHTMLTarefa({ titulo, data, prioridade, comentario, notificacao, criadaEm, criadaFormatada, dataFormatada }) {
  return `
    <h5 class="titulo-tarefa mb-2 fw-semibold">${titulo}</h5>
    <p><strong>Data da tarefa:</strong> 
      <span class="data-tarefa-formatada-display">${dataFormatada}</span>
      <span class="data-tarefa" style="display:none;">${data}</span>
    </p>
    <p><strong>Prioridade:</strong> <span class="prioridade">${prioridade}</span></p>
    <div class="detalhes" style="display: none;">
      <p><strong>Comentário:</strong> <span class="comentario">${comentario}</span></p>
      <p><strong>Data de criação:</strong> 
        <span>${criadaFormatada}</span>
        <span class="criacao" style="display:none;">${criadaEm}</span>
      </p>
      <p><strong>Notificação:</strong> <span class="notificacao">${notificacao}</span></p>
    </div>
    <div class="d-flex flex-wrap gap-2 mt-2">
      <button class="btn btn-secondary btn-sm toggle-detalhes">Mostrar mais</button>
      <button class="btn btn-secondary btn-sm editar-tarefa">Editar</button>
      <button class="btn btn-danger btn-sm remover-tarefa">Remover</button>
    </div>
    <hr>
  `;
}

document.getElementById("filtro").addEventListener("change", aplicarFiltro);

function aplicarFiltro() {
  const criterio = document.getElementById("filtro").value;
  const container = document.getElementById("tarefas");
  const cards = Array.from(container.getElementsByClassName("tarefa"));

  const pesos = { "Alta": 1, "Média": 2, "Baixa": 3 };

  cards.sort((a, b) => {
    switch (criterio) {
      case "criado":
        return new Date(getTexto(a, ".criacao")) - new Date(getTexto(b, ".criacao"));
      case "data":
        return new Date(getTexto(a, ".data-tarefa")) - new Date(getTexto(b, ".data-tarefa"));
      case "prioridade":
        return (pesos[getTexto(a, ".prioridade")] || 4) - (pesos[getTexto(b, ".prioridade")] || 4);
      case "titulo":
        return getTexto(a, ".titulo-tarefa").localeCompare(getTexto(b, ".titulo-tarefa"));
      default:
        return 0;
    }
  });

  cards.forEach(card => container.appendChild(card));
}

function getTexto(el, seletor) {
  const alvo = el.querySelector(seletor);
  return alvo ? alvo.textContent.trim() : "";
}

function mostrarDetalhes(tarefa) {
  document.getElementById("tarefas").style.display = "none";
  document.getElementById("formulario").style.display = "none";
  document.getElementById("detalhes-view").style.display = "block";

  document.getElementById("detalhes-titulo").textContent = tarefa.querySelector(".titulo-tarefa").textContent;
  document.getElementById("detalhes-data").textContent = tarefa.querySelector(".data-tarefa").textContent;
  document.getElementById("detalhes-comentario").textContent = tarefa.querySelector(".comentario").textContent;
  document.getElementById("detalhes-prioridade").textContent = tarefa.querySelector(".prioridade").textContent;
  document.getElementById("detalhes-notificacao").textContent = tarefa.querySelector(".notificacao").textContent;

  const iso = tarefa.querySelector(".criacao").textContent;
  document.getElementById("detalhes-criacao").textContent = new Date(iso).toLocaleDateString('pt-BR');

  const dataTarefa = new Date(tarefa.querySelector(".data-tarefa").textContent);
  const hoje = new Date();
  const prazo = dataTarefa < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) ? "Atrasada" : "Dentro do prazo";
  document.getElementById("detalhes-status").textContent = prazo;
}

document.getElementById("voltar-btn").addEventListener("click", () => {
  document.getElementById("detalhes-view").style.display = "none";
  document.getElementById("tarefas").style.display = "block";
  document.getElementById("formulario").style.display = "block";
});

atualizarMensagemVazia();
