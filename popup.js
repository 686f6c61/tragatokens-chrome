import { REELS, APUESTAS, START_CREDITS, spin, payout } from './logic.js';
import { SVG } from './simbolos.js';
import { sonidoPalanca, sonidoParada, sonidoPremio, sonidoFallo, setSilencio } from './sound.js';

const ALTO_CELDA = 78;
const REPETICIONES = 7; // copias de la tira para poder dar varias vueltas
const VUELTAS = [2, 3, 4]; // vueltas completas por carrete antes de parar
const DURACIONES = [1100, 1600, 2100]; // ms por carrete

const $ = (id) => document.getElementById(id);
const tiras = [...document.querySelectorAll('.tira')];
const brazo = $('brazo');
const palanca = $('palanca');
const mensaje = $('mensaje');
const displayCreditos = $('creditos');
const displayRecord = $('record');
const displayApuesta = $('apuesta');
const botonMenos = $('apuesta-menos');
const botonMas = $('apuesta-mas');
const botonRecargar = $('recargar');
const botonSilencio = $('silencio');

let creditos = START_CREDITS;
let record = 0;
let indiceApuesta = 0;
let silencio = false;
let girando = false;
let indices = [0, 0, 0]; // posición actual de cada carrete

const apuesta = () => APUESTAS[indiceApuesta];

// --- Persistencia (chrome.storage con localStorage de reserva) ---

const CLAVES = ['creditos', 'record', 'indiceApuesta', 'silencio'];

const almacen = {
  async leer() {
    if (globalThis.chrome?.storage?.local) {
      return chrome.storage.local.get(CLAVES);
    }
    const bruto = localStorage.getItem('quematokens');
    return bruto ? JSON.parse(bruto) : {};
  },
  async guardar() {
    const datos = { creditos, record, indiceApuesta, silencio };
    if (globalThis.chrome?.storage?.local) {
      await chrome.storage.local.set(datos);
    } else {
      localStorage.setItem('quematokens', JSON.stringify(datos));
    }
  }
};

// --- Carretes ---

function montarCarretes() {
  tiras.forEach((tira, i) => {
    const celdas = [];
    for (let r = 0; r < REPETICIONES; r++) {
      for (const simbolo of REELS[i]) {
        celdas.push(`<div class="celda">${SVG[simbolo]}</div>`);
      }
    }
    tira.innerHTML = celdas.join('');
    colocar(tira, indices[i]);
  });
}

function colocar(tira, indice) {
  tira.style.transition = 'none';
  tira.style.transform = `translateY(${-indice * ALTO_CELDA}px)`;
}

function girarCarrete(numero, destino, duracion) {
  return new Promise((resolver) => {
    const tira = tiras[numero];
    const largo = REELS[numero].length;
    const actual = indices[numero];
    const avance = VUELTAS[numero] * largo + ((destino - actual + largo) % largo);
    const final = actual + avance;

    // Forzar reflujo para que la transición arranque desde la posición actual.
    tira.getBoundingClientRect();
    tira.style.transition = `transform ${duracion}ms cubic-bezier(0.15, 0.6, 0.25, 1)`;
    tira.style.transform = `translateY(${-final * ALTO_CELDA}px)`;

    tira.addEventListener('transitionend', () => {
      indices[numero] = destino;
      colocar(tira, destino); // normaliza a la primera repetición
      sonidoParada();
      resolver();
    }, { once: true });
  });
}

// --- Tirada ---

async function tirar() {
  if (girando) return;
  if (creditos < apuesta()) {
    mensaje.textContent = 'Sin tokens: recarga con +100';
    return;
  }

  girando = true;
  palanca.classList.add('bloqueada');
  botonMenos.disabled = true;
  botonMas.disabled = true;
  mensaje.classList.remove('gano');
  mensaje.textContent = 'Girando...';

  creditos -= apuesta();
  pintarMarcadores();
  sonidoPalanca();

  const resultado = spin();
  await Promise.all(resultado.map((destino, i) => girarCarrete(i, destino, DURACIONES[i])));

  const simbolos = resultado.map((idx, i) => REELS[i][idx]);
  const premio = payout(simbolos, apuesta());

  if (premio > 0) {
    creditos += premio;
    if (premio > record) {
      record = premio;
      mensaje.textContent = `¡RÉCORD! +${premio}`;
    } else {
      mensaje.textContent = `¡PREMIO! +${premio}`;
    }
    mensaje.classList.add('gano');
    sonidoPremio(premio);
    parpadearLuces();
  } else {
    mensaje.textContent = 'Otra vez será...';
    sonidoFallo();
  }

  pintarMarcadores();
  await almacen.guardar();

  girando = false;
  palanca.classList.remove('bloqueada');
  botonMenos.disabled = false;
  botonMas.disabled = false;

  if (creditos < apuesta()) {
    mensaje.textContent = 'Sin tokens: recarga con +100';
  }
}

function pintarMarcadores() {
  displayCreditos.textContent = String(creditos);
  displayRecord.textContent = String(record);
  displayApuesta.textContent = String(apuesta());
}

// --- Palanca (clic o arrastre hacia abajo) ---

let arrastrando = false;
let yInicio = 0;
let progreso = 0;

function pintarBrazo(p) {
  // p=0 brazo arriba, p=1 brazo abajo (espejo vertical sobre el pivote).
  brazo.style.transform = `scaleY(${1 - 2 * p})`;
}

palanca.addEventListener('pointerdown', (e) => {
  if (girando) return;
  arrastrando = true;
  yInicio = e.clientY;
  brazo.classList.remove('soltada');
  palanca.setPointerCapture(e.pointerId);
});

palanca.addEventListener('pointermove', (e) => {
  if (!arrastrando) return;
  progreso = Math.min(1, Math.max(0, (e.clientY - yInicio) / 80));
  pintarBrazo(progreso);
});

palanca.addEventListener('pointerup', () => {
  if (!arrastrando) return;
  arrastrando = false;
  const fueClic = progreso < 0.15;
  soltarPalanca(fueClic);
});

function soltarPalanca(fueClic) {
  const accionar = () => {
    brazo.classList.add('soltada');
    pintarBrazo(0);
    tirar();
  };
  if (fueClic && !girando) {
    // Clic simple: animar la bajada completa y soltar.
    brazo.classList.add('soltada');
    pintarBrazo(1);
    setTimeout(accionar, 250);
  } else if (progreso > 0.55) {
    accionar();
  } else {
    brazo.classList.add('soltada');
    pintarBrazo(0);
  }
  progreso = 0;
}

// --- Luces de la marquesina ---

function montarLuces() {
  for (const lado of ['luces', 'luces2']) {
    $(lado).innerHTML = '<div class="luz"></div>'.repeat(5);
  }
  let fase = 0;
  setInterval(() => {
    fase = 1 - fase;
    document.querySelectorAll('.luz').forEach((luz, i) => {
      luz.classList.toggle('encendida', i % 2 === fase);
    });
  }, 600);
}

function parpadearLuces() {
  const luces = document.querySelectorAll('.luz');
  let ciclos = 0;
  const id = setInterval(() => {
    luces.forEach((luz) => luz.classList.toggle('encendida'));
    if (++ciclos > 9) clearInterval(id);
  }, 120);
}

// --- Controles: apuesta, recarga y silencio ---

function cambiarApuesta(paso) {
  if (girando) return;
  const nuevo = indiceApuesta + paso;
  if (nuevo < 0 || nuevo >= APUESTAS.length) return;
  indiceApuesta = nuevo;
  pintarMarcadores();
  almacen.guardar();
}

botonMenos.addEventListener('click', () => cambiarApuesta(-1));
botonMas.addEventListener('click', () => cambiarApuesta(1));

botonRecargar.addEventListener('click', async () => {
  creditos += 100;
  pintarMarcadores();
  if (!girando) mensaje.textContent = 'Tokens recargados';
  await almacen.guardar();
});

function pintarSilencio() {
  botonSilencio.querySelector('.ondas').classList.toggle('oculto', silencio);
  botonSilencio.querySelector('.tachado').classList.toggle('oculto', !silencio);
  setSilencio(silencio);
}

botonSilencio.addEventListener('click', async () => {
  silencio = !silencio;
  pintarSilencio();
  await almacen.guardar();
});

// --- Inicio ---

async function iniciar() {
  const datos = await almacen.leer();
  if (typeof datos.creditos === 'number') creditos = datos.creditos;
  if (typeof datos.record === 'number') record = datos.record;
  if (typeof datos.indiceApuesta === 'number'
      && datos.indiceApuesta >= 0 && datos.indiceApuesta < APUESTAS.length) {
    indiceApuesta = datos.indiceApuesta;
  }
  if (typeof datos.silencio === 'boolean') silencio = datos.silencio;

  pintarMarcadores();
  pintarSilencio();
  if (creditos < apuesta()) mensaje.textContent = 'Sin tokens: recarga con +100';
  montarCarretes();
  montarLuces();
  pintarBrazo(0);
}

iniciar();
