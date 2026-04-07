import {DeviceEventEmitter} from 'react-native';

export const HEXAGON_SHAKE_EVENT = 'akcru.hexagonShake';

let lastEmitMs = 0;
const DEBOUNCE_MS = 700;

/** Fire-and-forget: bottom tab center hex should wiggle + haptics (listeners in AkcruCenterButton). */
export function emitHexagonShake(): void {
    const now = Date.now();
    if (now - lastEmitMs < DEBOUNCE_MS) {
        return;
    }
    lastEmitMs = now;
    DeviceEventEmitter.emit(HEXAGON_SHAKE_EVENT);
}

export function subscribeHexagonShake(listener: () => void) {
    return DeviceEventEmitter.addListener(HEXAGON_SHAKE_EVENT, listener);
}
