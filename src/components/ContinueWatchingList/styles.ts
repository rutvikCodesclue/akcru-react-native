import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../assets/constants';

/** Wider than legacy /3.6; height keeps ~1.5 poster aspect (matches old w/h ratio) */
const CARD_WIDTH = SIZES.ScreenWidth / 3;
const POSTER_HEIGHT = (CARD_WIDTH * 3) / 2;

export default StyleSheet.create({
    listContent: {
        paddingHorizontal: '2%',
    },
    /** One continue-watching unit: poster + action strip */
    card: {
        width: CARD_WIDTH,
        marginRight: 12,
    },
    posterWrap: {
        position: 'relative',
        width: CARD_WIDTH,
    },
    posterImage: {
        width: CARD_WIDTH,
        height: POSTER_HEIGHT,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        resizeMode: 'cover',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    actionBar: {
        width: CARD_WIDTH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: COLORS.BLACK,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.18)',
    },
    actionHit: {
        padding: 4,
    },
});
