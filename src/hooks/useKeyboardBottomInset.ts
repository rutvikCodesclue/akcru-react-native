import {useEffect, useState} from 'react';
import {Dimensions, Keyboard, Platform} from 'react-native';

/**
 * Bottom inset (pt) to pad above the software keyboard.
 * iOS only: window does not resize; we reserve space using keyboard frame.
 * Android: return 0 — activity uses adjustResize; avoid double inset with layout shrink.
 */
export function useKeyboardBottomInset(): number {
    const [inset, setInset] = useState(0);

    useEffect(() => {
        if (Platform.OS !== 'ios') {
            return;
        }

        const sub = Keyboard.addListener('keyboardWillChangeFrame', e => {
            const winH = Dimensions.get('window').height;
            const topOfKeyboard = e.endCoordinates.screenY;
            const overlap = Math.max(0, winH - topOfKeyboard);
            setInset(overlap);
        });
        const hide = Keyboard.addListener('keyboardWillHide', () => setInset(0));
        return () => {
            sub.remove();
            hide.remove();
        };
    }, []);

    return inset;
}
