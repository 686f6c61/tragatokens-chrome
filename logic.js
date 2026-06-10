// Lógica pura de la tragaperras: sin DOM, testeable con node:test.

export const SYMBOLS = ['cereza', 'limon', 'estrella', 'campana', 'bar', 'siete'];

export const COST = 5;
export const START_CREDITS = 100;

// Cada tira tiene 20 posiciones; la frecuencia controla la probabilidad:
// cereza 6, limon 5, estrella 4, campana 2, bar 2, siete 1.
const FRECUENCIA = { cereza: 6, limon: 5, estrella: 4, campana: 2, bar: 2, siete: 1 };

function construirTira(orden) {
  const tira = [];
  for (const simbolo of orden) {
    for (let i = 0; i < FRECUENCIA[simbolo]; i++) tira.push(simbolo);
  }
  return tira;
}

// Orden distinto por tira para que visualmente no giren idénticas.
export const REELS = [
  construirTira(['cereza', 'limon', 'estrella', 'campana', 'bar', 'siete']),
  construirTira(['limon', 'cereza', 'campana', 'estrella', 'siete', 'bar']),
  construirTira(['estrella', 'limon', 'cereza', 'bar', 'campana', 'siete'])
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

const TABLA_TRES = {
  siete: 250,
  bar: 100,
  campana: 60,
  estrella: 40,
  limon: 25,
  cereza: 15
};

export function payout(simbolos) {
  const [a, b, c] = simbolos;
  if (a === b && b === c) return TABLA_TRES[a];
  const cerezas = simbolos.filter((s) => s === 'cereza').length;
  if (cerezas === 2) return 5;
  if (cerezas === 1) return 2;
  return 0;
}
