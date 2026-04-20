import {StyleSheet} from 'react-native';
import {COLORS} from '../../../assets/constants';

export default StyleSheet.create({
    activeScale: {
        transform: [{scale: 1.04}],
    },
    inactiveScale: {
        transform: [{scale: 0.92}],
    },
    activeFrame: {
        borderRadius: 14,
        padding: 2,
        shadowColor: '#B678FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.95,
        shadowRadius: 10,
        elevation: 14,
    },
    activeInner: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: COLORS.BLACK,
    },
    inactiveWrap: {
        position: 'relative',
    },
    inactiveOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
});
