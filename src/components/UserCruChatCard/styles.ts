import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

const AVATAR_SIZE = 58;
const ONLINE_DOT = 12;

export const userCruChatCardMetrics = {AVATAR_SIZE, ONLINE_DOT};

export default StyleSheet.create({
    cardGradientBorder: {
        borderRadius: 18,
        padding: 1.25,
        shadowColor: '#E547FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.55,
        shadowRadius: 12,
        elevation: 6,
    },
    card: {
        borderRadius: 17,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(38,42,84,0.96)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        zIndex: 2,
        minHeight: 102,
    },
    avatarWrap: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        marginRight: 14,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    avatarRing: {
        borderWidth: 2,
    },
    onlineDot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: ONLINE_DOT,
        height: ONLINE_DOT,
        borderRadius: ONLINE_DOT / 2,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: 'rgba(12,12,16,0.95)',
    },
    body: {
        flex: 1,
        minWidth: 0,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    name: {
        ...FONTS.Title3,
        flex: 1,
        marginRight: 8,
        color: COLORS.WHITE,
        fontWeight: '800',
        fontSize: 32 / 2,
    },
    time: {
        ...FONTS.paragraph1,
        fontSize: 32 / 2,
        color: 'rgba(255,255,255,0.86)',
        fontWeight: '600',
    },
    movieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    poster: {
        width: 58,
        height: 40,
        borderRadius: 6,
        backgroundColor: COLORS.TRANSDARKGREY,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    movieTitle: {
        ...FONTS.paragraph1,
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.90)',
    },
    preview: {
        ...FONTS.paragraph1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 18,
    },
});
