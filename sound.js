// Sonidos sintéticos con WebAudio: sin ficheros de audio.

let ctx = null;
let silenciado = false;

export function setSilencio(valor) {
  silenciado = valor;
}

function audio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tono(frecuencia, duracion, tipo = 'square', volumen = 0.06, retardo = 0) {
  if (silenciado) return;
  const ac = audio();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t0 = ac.currentTime + retardo;
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  gain.gain.setValueAtTime(volumen, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duracion);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duracion);
}

export function sonidoPalanca() {
  tono(180, 0.08, 'square', 0.08);
  tono(110, 0.12, 'square', 0.08, 0.06);
}

export function sonidoParada() {
  tono(320, 0.06, 'triangle', 0.09);
}

export function sonidoPremio(importe) {
  const notas = importe >= 100
    ? [523, 659, 784, 1047, 784, 1047, 1319]
    : [523, 659, 784, 1047];
  notas.forEach((f, i) => tono(f, 0.18, 'triangle', 0.09, i * 0.12));
}

export function sonidoFallo() {
  tono(150, 0.2, 'sawtooth', 0.04);
}
