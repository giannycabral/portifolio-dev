// Textos estilizados para as seções
const secoesTexto = {
  sobre: "✧ Sobre PixelGirl ✧",
  habilidades: "✧ Árvore Mágica de Habilidades ✧",
  projetos: "✧ Minhas Aventuras ✧",
  educacao: "✧ Academia Mágica ✧",
  contato: "✧ Portal de Mensagens ✧",
};

// Configuração dos sons
const SONS_CONFIG = {
  hover: {
    url: "assets/sounds/mixkit-fairy-arcade-sparkle-866.wav",
    volume: 0.1,
  },
  click: {
    url: "assets/sounds/mixkit-arcade-game-jump-coin-216.wav",
    volume: 0.2,
  },
  select: {
    url: "assets/sounds/mixkit-quick-jump-arcade-game-239.wav",
    volume: 0.15,
  },
};

// Cache de sons
const cacheSons = {
  hover: null,
  click: null,
  select: null,
};

// Variável para controlar se o áudio foi inicializado
let audioInicializado = false;

// Função para carregar um som
async function carregarSom(config) {
  try {
    const audio = new Audio();

    // Adiciona listener para debug
    audio.addEventListener("canplaythrough", () => {
      console.log(`Som ${config.url} carregado com sucesso`);
    });

    audio.addEventListener("error", (e) => {
      console.error(`Erro ao carregar som ${config.url}:`, e.target.error);
    });

    // Define o volume padrão
    audio.volume = config.volume;

    // Carrega o áudio
    audio.src = config.url;
    await audio.load();

    return audio;
  } catch (error) {
    console.error("Erro ao carregar som:", error);
    return null;
  }
}

// Função para inicializar os sons
async function inicializarSons() {
  if (audioInicializado) return;

  try {
    console.log("Inicializando sistema de áudio...");

    // Carrega os sons em paralelo
    const resultados = await Promise.allSettled([
      carregarSom(SONS_CONFIG.hover),
      carregarSom(SONS_CONFIG.click),
      carregarSom(SONS_CONFIG.select),
    ]);

    // Atualiza o cache com os sons que carregaram com sucesso
    resultados.forEach((resultado, index) => {
      if (resultado.status === "fulfilled" && resultado.value) {
        const chave = Object.keys(cacheSons)[index];
        cacheSons[chave] = resultado.value;
        console.log(`Som ${chave} carregado com sucesso`);
      } else {
        console.error(`Falha ao carregar som ${index}:`, resultado.reason);
      }
    });

    audioInicializado = true;
    console.log("Sistema de áudio inicializado!");
  } catch (error) {
    console.error("Erro ao inicializar sons:", error);
  }
}

// Função para tocar sons com tratamento de erro
function tocarSom(som, volumeOverride = null) {
  if (!som || !audioInicializado) return;

  try {
    // Clona o áudio para poder tocar múltiplas vezes
    const audioClone = som.cloneNode();

    // Permite sobrescrever o volume se necessário
    if (volumeOverride !== null) {
      audioClone.volume = volumeOverride;
    }

    const audioPromise = audioClone.play();
    if (audioPromise) {
      audioPromise.catch((error) => {
        if (error.name !== "NotAllowedError") {
          console.error("Erro ao tocar áudio:", error);
        }
      });
    }
  } catch (error) {
    console.error("Erro ao tocar som:", error);
  }
}

// Função para mostrar/ocultar seções
function mostrarSecao(idSecao) {
  // Oculta todas as seções
  document.querySelectorAll(".conteudo-secao").forEach((secao) => {
    secao.classList.add("oculto");
  });

  // Mostra a seção selecionada
  document.getElementById(idSecao).classList.remove("oculto");

  // Atualiza o título da seção
  const tituloSecao = document.querySelector(`[data-secao="${idSecao}"]`);
  if (tituloSecao) {
    tituloSecao.textContent = secoesTexto[idSecao];
  }

  // Toca o efeito sonoro específico da seção
  tocarSom(cacheSons.select);
}

// Adiciona navegação por teclado
document.addEventListener("keydown", (e) => {
  const secoes = ["sobre", "habilidades", "projetos", "educacao", "contato"];
  const indiceAtual = secoes.findIndex(
    (id) => !document.getElementById(id).classList.contains("oculto")
  );

  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    const proximoIndice =
      e.key === "ArrowRight"
        ? (indiceAtual + 1) % secoes.length
        : (indiceAtual - 1 + secoes.length) % secoes.length;

    // Efeito sonoro de movimento
    tocarSom(cacheSons.click);
    mostrarSecao(secoes[proximoIndice]);
  }
});

// Inicializa os sons quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  let audioPermitido = false;

  const iniciarAudio = async () => {
    if (!audioPermitido) {
      audioPermitido = true;
      await inicializarSons();
      console.log("Sistema de áudio pronto para uso!");
    }
  };

  // Configura os efeitos sonoros para os botões após a primeira interação
  const configurarEventosSom = () => {
    if (!audioInicializado) return;

    document
      .querySelectorAll(".botao-kawaii, .botao-pixel")
      .forEach((botao) => {
        botao.addEventListener("mouseenter", () => {
          tocarSom(cacheSons.hover);
        });

        botao.addEventListener("click", () => {
          tocarSom(cacheSons.click);
        });
      });

    document.querySelectorAll(".botao-navegacao").forEach((botao) => {
      botao.addEventListener("mouseenter", () => {
        tocarSom(cacheSons.hover);
      });
    });
  };

  // Tenta iniciar o áudio em várias interações do usuário
  ["click", "keydown", "touchstart"].forEach((evento) => {
    document.addEventListener(
      evento,
      async () => {
        await iniciarAudio();
        configurarEventosSom();
      },
      { once: true }
    );
  });
});
