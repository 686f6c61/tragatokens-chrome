import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SYMBOLS,
  REELS,
  APUESTAS,
  START_CREDITS,
  spin,
  payout
} from '../logic.js';

test('hay 10 símbolos: los logos de las IA, NVIDIA y Mistral', () => {
  assert.deepEqual(
    [...SYMBOLS].sort(),
    ['claude', 'codex', 'deepseek', 'gemini', 'minimax', 'mistral', 'nvidia', 'qwen', 'xai', 'zai']
  );
});

test('REELS son 3 tiras de 20 posiciones con símbolos válidos', () => {
  assert.equal(REELS.length, 3);
  for (const reel of REELS) {
    assert.equal(reel.length, 20);
    for (const s of reel) {
      assert.ok(SYMBOLS.includes(s), `símbolo desconocido: ${s}`);
    }
  }
});

test('cada tira contiene exactamente un claude, un codex y un gemini (premios altos escasos)', () => {
  for (const reel of REELS) {
    assert.equal(reel.filter((s) => s === 'claude').length, 1);
    assert.equal(reel.filter((s) => s === 'codex').length, 1);
    assert.equal(reel.filter((s) => s === 'gemini').length, 1);
  }
});

test('mistral es el símbolo más frecuente (paga premios menores)', () => {
  for (const reel of REELS) {
    const cuenta = {};
    for (const s of reel) cuenta[s] = (cuenta[s] || 0) + 1;
    const maximo = Math.max(...Object.values(cuenta));
    assert.equal(cuenta.mistral, maximo);
  }
});

test('apuestas disponibles y créditos iniciales', () => {
  assert.deepEqual(APUESTAS, [5, 10, 25, 50]);
  assert.equal(START_CREDITS, 100);
});

test('spin devuelve 3 índices dentro del rango de cada tira', () => {
  for (let i = 0; i < 50; i++) {
    const indices = spin();
    assert.equal(indices.length, 3);
    indices.forEach((idx, reel) => {
      assert.ok(Number.isInteger(idx));
      assert.ok(idx >= 0 && idx < REELS[reel].length);
    });
  }
});

test('spin es determinista con un rng fijo', () => {
  const rng = () => 0;
  assert.deepEqual(spin(rng), [0, 0, 0]);
  const rngAlto = () => 0.999;
  assert.deepEqual(spin(rngAlto), [19, 19, 19]);
});

test('payout: tres iguales según tabla con apuesta mínima', () => {
  assert.equal(payout(['claude', 'claude', 'claude'], 5), 250);
  assert.equal(payout(['codex', 'codex', 'codex'], 5), 150);
  assert.equal(payout(['gemini', 'gemini', 'gemini'], 5), 100);
  assert.equal(payout(['xai', 'xai', 'xai'], 5), 75);
  assert.equal(payout(['deepseek', 'deepseek', 'deepseek'], 5), 60);
  assert.equal(payout(['qwen', 'qwen', 'qwen'], 5), 40);
  assert.equal(payout(['zai', 'zai', 'zai'], 5), 30);
  assert.equal(payout(['minimax', 'minimax', 'minimax'], 5), 20);
  assert.equal(payout(['nvidia', 'nvidia', 'nvidia'], 5), 15);
  assert.equal(payout(['mistral', 'mistral', 'mistral'], 5), 10);
});

test('payout: a mayor apuesta, premio proporcional', () => {
  assert.equal(payout(['claude', 'claude', 'claude'], 10), 500);
  assert.equal(payout(['claude', 'claude', 'claude'], 25), 1250);
  assert.equal(payout(['claude', 'claude', 'claude'], 50), 2500);
  assert.equal(payout(['mistral', 'mistral', 'gemini'], 50), 50);
  assert.equal(payout(['mistral', 'qwen', 'xai'], 25), 10);
});

test('payout: dos mistral pagan 5 (apuesta mínima) en cualquier posición', () => {
  assert.equal(payout(['mistral', 'mistral', 'zai'], 5), 5);
  assert.equal(payout(['mistral', 'gemini', 'mistral'], 5), 5);
  assert.equal(payout(['claude', 'mistral', 'mistral'], 5), 5);
});

test('payout: un mistral paga 2 (apuesta mínima) en cualquier posición', () => {
  assert.equal(payout(['mistral', 'qwen', 'gemini'], 5), 2);
  assert.equal(payout(['minimax', 'mistral', 'deepseek'], 5), 2);
  assert.equal(payout(['zai', 'xai', 'mistral'], 5), 2);
});

test('payout: sin combinación no hay premio sea cual sea la apuesta', () => {
  assert.equal(payout(['qwen', 'gemini', 'deepseek'], 5), 0);
  assert.equal(payout(['claude', 'claude', 'codex'], 50), 0);
  assert.equal(payout(['nvidia', 'codex', 'gemini'], 25), 0);
});
