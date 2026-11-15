/**
 * Verify a local SDK pause with Spotify's Web API. When the SDK reports a
 * successful pause but Spotify is still playing on THIS Echo device, send an
 * explicit, device-targeted pause. Never pause a different Spotify device.
 *
 * Injectable dependencies keep this logic testable without React or Spotify.
 */
export async function pauseEchoDevice({
    player,
    deviceId,
    getAccessToken,
    fetchImpl = fetch,
    isCurrent = () => true,
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
}) {
    if (!player || !deviceId) {
        throw new Error("Spotify player is not ready.");
    }

    // Record the track when the user requested Pause. If a different track
    // starts outside Echo while this request is pending, don't stop it.
    let originalTrackId = null;
    try {
        const state = await player.getCurrentState();
        originalTrackId = state?.track_window?.current_track?.id ?? null;
    } catch {
        // Missing SDK state must not prevent a safe device-specific API check.
    }

    if (!isCurrent()) return "superseded";

    // A resolved SDK pause is not proof that Spotify actually paused.
    let sdkError = null;
    try {
        await player.pause();
    } catch (error) {
        sdkError = error;
    }

    await wait(350);
    if (!isCurrent()) return "superseded";

    const token = await getAccessToken();
    if (!isCurrent()) return "superseded";

    const playbackResponse = await fetchImpl("https://api.spotify.com/v1/me/player", {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!isCurrent()) return "superseded";
    if (playbackResponse.status === 204) return "already-paused";
    if (!playbackResponse.ok) {
        throw new Error(`Could not verify Spotify pause (${playbackResponse.status}).`);
    }

    const playback = await playbackResponse.json();
    if (!isCurrent()) return "superseded";
    if (!playback?.is_playing) return "already-paused";

    // The pause button controls only Echo's SDK device, never someone's
    // desktop, television, phone, or another Echo browser player.
    if (playback.device?.id !== deviceId) return "other-device";
    if (originalTrackId && playback.item?.id && originalTrackId !== playback.item.id) {
        return "track-changed";
    }

    const result = await fetchImpl(
        `https://api.spotify.com/v1/me/player/pause?device_id=${encodeURIComponent(deviceId)}`,
        {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    if (!isCurrent()) return "superseded";
    if (!result.ok) {
        throw new Error(`Spotify pause failed (${result.status}).`);
    }
    return sdkError ? "paused-via-api-after-sdk-error" : "paused-via-api";
}
