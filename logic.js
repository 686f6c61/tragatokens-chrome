// Lógica pura de la tragaperras: sin DOM, testeable con node:test.

export const SYMBOLS = [
  'mistral', 'nvidia', 'minimax', 'zai', 'qwen',
  'deepseek', 'xai', 'gemini', 'codex', 'claude'
];

export const APUESTAS = [5, 10, 25, 50];
export const START_CREDITS = 100;

const APUESTA_BASE = APUESTAS[0];

// Cada tira tiene 20 posiciones; la frecuencia controla la probabilidad
// (los símbolos de mayor premio aparecen una sola vez).
const FRECUENCIA = {
  mistral: 5, nvidia: 3, minimax: 2, zai: 2, qwen: 2,
  deepseek: 2, xai: 1, gemini: 1, codex: 1, claude: 1
};

function construirTira(orden) {
  const tira = [];
  for (const simbolo of orden) {
    for (let i = 0; i < FRECUENCIA[simbolo]; i++) tira.push(simbolo);
  }
  return tira;
}

// Orden distinto por tira para que visualmente no giren idénticas.
export const REELS = [
  construirTira(['mistral', 'nvidia', 'minimax', 'zai', 'qwen', 'deepseek', 'xai', 'gemini', 'codex', 'claude']),
  construirTira(['nvidia', 'mistral', 'qwen', 'minimax', 'claude', 'zai', 'gemini', 'deepseek', 'codex', 'xai']),
  construirTira(['minimax', 'qwen', 'mistral', 'deepseek', 'nvidia', 'zai', 'codex', 'xai', 'gemini', 'claude'])
];

// Baraja cada tira de forma fija (Fisher-Yates con semilla simple) para que
// los símbolos iguales no queden contiguos en el tambor.
function mezclar(tira, semilla) {
  const copia = [...tira];
  let estado = semilla;
  for (let i = copia.length - 1; i > 0; i--) {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    const j = estado % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

REELS.forEach((tira, i) => {
  REELS[i] = mezclar(tira, 7 + i * 13);
});

// Devuelve un índice por carrete. El rng se inyecta para poder testear.
export function spin(rng = Math.random) {
  return REELS.map((tira) => Math.floor(rng() * tira.length));
}

// Premios base con la apuesta mínima; escalan en proporción a la apuesta.
const TABLA_TRES = {
  claude: 250,
  codex: 150,
  gemini: 100,
  xai: 75,
  deepseek: 60,
  qwen: 40,
  zai: 30,
  minimax: 20,
  nvidia: 15,
  mistral: 10
};

export function payout(simbolos, apuesta = APUESTA_BASE) {
  const multiplicador = apuesta / APUESTA_BASE;
  const [a, b, c] = simbolos;
  if (a === b && b === c) return TABLA_TRES[a] * multiplicador;
  const mistrales = simbolos.filter((s) => s === 'mistral').length;
  if (mistrales === 2) return 5 * multiplicador;
  if (mistrales === 1) return 2 * multiplicador;
  return 0;
}
