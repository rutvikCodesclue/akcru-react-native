import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    chipShell: {
        height: 44,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipShellUnselected: {
        borderWidth: 1.5,
        borderColor: COLORS.OVERLAY_WHITE_30,
        backgroundColor: COLORS.OVERLAY_WHITE_05,
        paddingHorizontal: 20,
    },
    chipGradientBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
    chipSelectedFace: {
        margin: 1.5,
        minHeight: 41,
        borderRadius: 10.5,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipText: {
        ...FONTS.Title2,
        color: COLORS.OVERLAY_WHITE_90,
    },
    chipTextSelected: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
});
