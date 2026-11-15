import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pauseEchoDevice } from './spotifyPauseCoordinator.js';

const response = (status, data = {}) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => data
});

function setup({
    currentDevice = 'ECHO-1', currentTrack = 'track-a',
    playing = true, sdkPauseError = null, remoteStatus = 200,
    pauseStatus = 204, current = () => true
} = {}) {
    const requests = [];
    const player = {
        getCurrentState: async () => ({track_window: { current_track: { id: 'track-a' }}}),
        pause: async () => { if (sdkPauseError) throw sdkPauseError; }
    };
    const fetchImpl = async (url, init) => {
        requests.push({url, method: init?.method ?? 'GET'});
        if (url === 'https://api.spotify.com/v1/me/player' && !init?.method) {
            return response(remoteStatus, { is_playing: playing,
                device: { id: currentDevice }, item: { id: currentTrack } });
        }
        if (url.startsWith('https://api.spotify.com/v1/me/player/pause?')) {
            return response(pauseStatus);
        }
        throw new Error(`Unexpected request: ${url}`);
    };
    return {player, requests, options: {
        player, deviceId:'ECHO-1', getAccessToken: async () => 'dummy',
        fetchImpl, isCurrent: current, wait: async () => {}
    }};
}

describe('Spotify pause coordination — Batch 6', () => {
    it('does not send an extra pause if Spotify already paused', async () => {
        const h = setup({playing:false});
        assert.equal(await pauseEchoDevice(h.options), 'already-paused');
        assert.deepEqual(h.requests.map(x=>x.method), ['GET']);
    });
    it('uses a device-specific Web API fallback when SDK pause has no effect', async () => {
        const h = setup();
        assert.equal(await pauseEchoDevice(h.options), 'paused-via-api');
        assert.deepEqual(h.requests.map(x=>x.method), ['GET','PUT']);
        assert.match(h.requests[1].url, /device_id=ECHO-1$/);
    });
    it('recovers when the SDK pause throws but the targeted device is still playing', async () => {
        const h = setup({sdkPauseError: new Error('SDK unavailable')});
        assert.equal(await pauseEchoDevice(h.options), 'paused-via-api-after-sdk-error');
    });
    it('does not pause another Spotify device', async () => {
        const h = setup({currentDevice:'DESKTOP-1'});
        assert.equal(await pauseEchoDevice(h.options), 'other-device');
        assert.deepEqual(h.requests.map(x=>x.method), ['GET']);
    });
    it('does not pause a new track started outside Echo', async () => {
        const h = setup({currentTrack:'track-b'});
        assert.equal(await pauseEchoDevice(h.options), 'track-changed');
        assert.deepEqual(h.requests.map(x=>x.method), ['GET']);
    });
    it('cancels on logout or a newer command', async () => {
        let isCurrent = true;
        const h = setup({current: () => isCurrent});
        h.options.wait = async () => {isCurrent=false;};
        assert.equal(await pauseEchoDevice(h.options), 'superseded');
        assert.equal(h.requests.length, 0);
    });
    it('does not accept a failed Web API pause as success', async () => {
        const h = setup({pauseStatus:403});
        await assert.rejects(() => pauseEchoDevice(h.options), /pause failed \(403\)/);
    });
    it('does not send pause if Spotify playback status is unavailable', async () => {
        const h = setup({remoteStatus:429});
        await assert.rejects(() => pauseEchoDevice(h.options), /verify Spotify pause \(429\)/);
        assert.deepEqual(h.requests.map(x=>x.method), ['GET']);
    });
    it('recognizes no active playback (204)', async () => {
        const h = setup({remoteStatus:204});
        assert.equal(await pauseEchoDevice(h.options), 'already-paused');
        assert.equal(h.requests.length, 1);
    });
});
