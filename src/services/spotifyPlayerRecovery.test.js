// Focused Node tests for the device-ID recovery path (no real Spotify needed).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const sourceUrl = new URL('./spotifyPlayerService.js', import.meta.url);
const source = (await readFile(sourceUrl, 'utf8'))
  .replace('import { getSpotifyAccessToken } from "./spotifyAuthService";',
    'const getSpotifyAccessToken = globalThis.__spotifyRecoveryTestGetToken;')
  .replace('import { pauseEchoDevice } from "./spotifyPauseCoordinator";',
    'const pauseEchoDevice = globalThis.__spotifyRecoveryTestPauseEchoDevice;');
assert.ok(source.includes('globalThis.__spotifyRecoveryTestGetToken'));
globalThis.__spotifyRecoveryTestGetToken = async () => 'mock-access-token';
globalThis.__spotifyRecoveryTestPauseEchoDevice = async () => {}; 

// Data URL permits Node to import Vite's extensionless service without
// changing the production module or requiring a Vite installation.
const service = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const priorConsoleInfo = console.info;
const priorConsoleWarn = console.warn;
const priorConsoleError = console.error;
console.info = () => {};
console.warn = () => {};
console.error = () => {};

const response = (status, data = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => data,
});

async function runScenario(transferStatus) {
  service.disconnectSpotifyPlayer();
  const players = [];
  const transfers = [];
  const plays = [];
  class FakePlayer {
    constructor() { this.listeners = {}; players.push(this); }
    addListener(name, listener) { this.listeners[name] = listener; }
    async connect() {
      const id = players.indexOf(this) === 0 ? 'STALE-SDK-ID' : 'FRESH-SDK-ID';
      queueMicrotask(() => this.listeners.ready?.({ device_id: id }));
      return true;
    }
    disconnect() {}
  }
  globalThis.window = { Spotify: { Player: FakePlayer } };
  globalThis.fetch = async (url, options = {}) => {
    if (url.endsWith('/me/player/devices')) {
      return response(200, { devices: [{ name: 'Echo Web Player', id: 'FRESH-SDK-ID' }] });
    }
    if (url.endsWith('/me/player') && options.method === 'PUT') {
      const id = JSON.parse(options.body).device_ids[0];
      transfers.push(id);
      return id === 'STALE-SDK-ID' ? response(transferStatus, { error: { message: 'Device not found' } }) : response(204);
    }
    if (url.includes('/me/player/play?')) {
      plays.push(url);
      return response(204);
    }
    if (url.endsWith('/me/player')) return response(204);
    throw new Error(`Unexpected request URL: ${url}`);
  };
  await service.initializeSpotifyPlayer();
  let caught;
  try {
    await service.playSpotifyTrack('test-track');
  } catch (err) {
    caught = err;
  }
  return { players, transfers, plays, caught };
}

test('rebuilds local SDK after repeated 404 and plays using new ready device ID', async () => {
  const result = await runScenario(404);
  assert.equal(result.caught, undefined);
  assert.equal(result.players.length, 2);
  assert.deepEqual(result.transfers, ['STALE-SDK-ID', 'STALE-SDK-ID', 'FRESH-SDK-ID']);
  assert.equal(result.plays.length, 1);
  assert.match(result.plays[0], /device_id=FRESH-SDK-ID/);
  service.disconnectSpotifyPlayer();
});

test('does not rebuild the player for non-404 transfer errors', async () => {
  const result = await runScenario(403);
  assert.match(result.caught?.message, /403/);
  assert.equal(result.players.length, 1);
  assert.deepEqual(result.transfers, ['STALE-SDK-ID']);
  assert.equal(result.plays.length, 0);
  service.disconnectSpotifyPlayer();
});

process.on('exit', () => {
  console.info = priorConsoleInfo;
  console.warn = priorConsoleWarn;
  console.error = priorConsoleError;
});
