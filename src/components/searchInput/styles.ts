import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../assets/constants';
import {FONTS} from '../../../assets/constants/theme';

export default StyleSheet.create({
    searchRoot: {
        width: '100%',
        backgroundColor: COLORS.BLACK,
    },
    topGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 65,
        width: SIZES.ScreenWidth,
    },
    searchLauncherWrap: {
        alignItems: 'center',
        backgroundColor: COLORS.BLACK,
    },
    searchLauncher: {
        width: SIZES.ScreenWidth / 1.1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginVertical: 10,
        alignItems: 'center',
        height: 46,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    launcherIcon: {
        marginRight: 10,
    },
    launcherText: {
        ...FONTS.Title2,
        color: COLORS.DARKGREY,
    },
    modalRoot: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    backbutton: {
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 6,
        backgroundColor: COLORS.BLACK,
    },
    backTouch: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 6,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        ...FONTS.Title3,
        marginLeft: 4,
        color: COLORS.LIGHTGREY,
    },
    searchmodal: {
        backgroundColor: COLORS.BLACK,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    textinput: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        flex: 1,
    },
    searchinput: {
        width: '100%',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        height: 46,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    clearIcon: {
        marginLeft: 8,
    },
    searchHint: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
        marginTop: 8,
        marginLeft: 2,
    },
    modalListWrap: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 4,
        backgroundColor: COLORS.BLACK,
    },
    movieRow: {
        marginHorizontal: 6,
        marginBottom: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        minHeight: 84,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    moviePoster: {
        width: 70,
        height: 70,
        borderRadius: 4,
        backgroundColor: COLORS.BLACK,
    },
    movieMeta: {
        flex: 1,
        marginLeft: 10,
        marginRight: 8,
    },
    movieTitle: {
        ...FONTS.Title2,
        fontSize: 13,
    },
    movieYear: {
        ...FONTS.paragraph1,
        fontSize: 12,
        color: COLORS.DARKGREY,
        marginTop: 2,
    },
    movieChipRow: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    movieChip: {
        ...FONTS.paragraph6,
        color: COLORS.WHITE,
        backgroundColor: 'rgba(183, 149, 255, 0.35)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    loaderWrap: {
        paddingTop: 26,
        alignItems: 'center',
    },
    emptyWrap: {
        paddingTop: 28,
        alignItems: 'center',
    },
    emptyText: {
        ...FONTS.paragraph1,
        color: COLORS.DARKGREY,
    },
});
