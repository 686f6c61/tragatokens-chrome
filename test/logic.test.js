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

test('hay 7 símbolos definidos, con claude y codex incluidos', () => {
  assert.deepEqual(
    [...SYMBOLS].sort(),
    ['bar', 'campana', 'cereza', 'claude', 'codex', 'estrella', 'limon']
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

test('cada tira contiene exactamente un claude y un codex (premios escasos)', () => {
  for (const reel of REELS) {
    assert.equal(reel.filter((s) => s === 'claude').length, 1);
    assert.equal(reel.filter((s) => s === 'codex').length, 1);
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
  assert.equal(payout(['bar', 'bar', 'bar'], 5), 100);
  assert.equal(payout(['campana', 'campana', 'campana'], 5), 60);
  assert.equal(payout(['estrella', 'estrella', 'estrella'], 5), 40);
  assert.equal(payout(['limon', 'limon', 'limon'], 5), 25);
  assert.equal(payout(['cereza', 'cereza', 'cereza'], 5), 15);
});

test('payout: a mayor apuesta, premio proporcional', () => {
  assert.equal(payout(['claude', 'claude', 'claude'], 10), 500);
  assert.equal(payout(['claude', 'claude', 'claude'], 25), 1250);
  assert.equal(payout(['claude', 'claude', 'claude'], 50), 2500);
  assert.equal(payout(['cereza', 'cereza', 'limon'], 50), 50);
  assert.equal(payout(['cereza', 'limon', 'bar'], 25), 10);
});

test('payout: dos cerezas pagan 5 (apuesta mínima) en cualquier posición', () => {
  assert.equal(payout(['cereza', 'cereza', 'limon'], 5), 5);
  assert.equal(payout(['cereza', 'bar', 'cereza'], 5), 5);
  assert.equal(payout(['claude', 'cereza', 'cereza'], 5), 5);
});

test('payout: una cereza paga 2 (apuesta mínima) en cualquier posición', () => {
  assert.equal(payout(['cereza', 'limon', 'bar'], 5), 2);
  assert.equal(payout(['campana', 'cereza', 'estrella'], 5), 2);
  assert.equal(payout(['limon', 'bar', 'cereza'], 5), 2);
});

test('payout: sin combinación no hay premio sea cual sea la apuesta', () => {
  assert.equal(payout(['limon', 'bar', 'campana'], 5), 0);
  assert.equal(payout(['claude', 'claude', 'bar'], 50), 0);
  assert.equal(payout(['claude', 'codex', 'bar'], 50), 0);
  assert.equal(payout(['estrella', 'campana', 'limon'], 25), 0);
});
