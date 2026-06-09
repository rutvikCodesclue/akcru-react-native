import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';

const contentHorizontal = 24;

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        paddingHorizontal: contentHorizontal,
    },
    screenBody: {
        flex: 1,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: contentHorizontal,
        paddingTop: 8,
        paddingBottom: 8,
    },
    brandTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 22 : 18,
        color: COLORS.WHITE,
        letterSpacing: 2,
    },
    skipButton: {
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    skipLabel: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 14 : 12,
        color: COLORS.WHITE,
        letterSpacing: 1.4,
    },
    pager: {
        flex: 1,
    },
    pagerContent: {
        flexGrow: 1,
    },
    page: {
        width: SIZES.ScreenWidth,
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: COLORS.BLACK,
    },
    pageSpacer: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    heroSection: {
        width: '100%',
        alignSelf: 'stretch',
        overflow: 'hidden',
        backgroundColor: COLORS.BLACK,
    },
    heroImage: {
        width: '100%',
        backgroundColor: COLORS.BLACK,
    },
    heroGradientTop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
    heroGradientBottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    heroPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.CATREDDRK,
    },
    contentBlock: {
        paddingHorizontal: contentHorizontal,
        paddingTop: 0,
        paddingBottom: 12,
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'flex-end',
        backgroundColor: COLORS.BLACK,
    },
    creatorName: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 13 : 11,
        color: COLORS.CATREDLGT,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    welcomeText: {
        ...FONTS.paragraph2,
        fontSize: isTablet() ? 13 : 11,
        color: COLORS.WHITE,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: isTablet() ? 20 : 18,
    },
    premiereTitleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 12,
        paddingHorizontal: 8,
    },
    premiereTitleRowLeft: {
        justifyContent: 'flex-start',
        paddingHorizontal: 0,
    },
    premiereTitleSimple: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 28 : 22,
        color: COLORS.WHITE,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 8,
        fontStyle: 'italic',
        lineHeight: isTablet() ? 34 : 28,
    },
    premiereTitleAlignLeft: {
        textAlign: 'left',
        paddingHorizontal: 0,
    },
    premiereTitleWhite: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 28 : 22,
        color: COLORS.WHITE,
        fontStyle: 'italic',
        letterSpacing: 0.5,
        lineHeight: isTablet() ? 34 : 28,
    },
    premiereTitleRed: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 28 : 22,
        color: COLORS.CATREDLGT,
        fontStyle: 'italic',
        letterSpacing: 0.5,
        lineHeight: isTablet() ? 34 : 28,
    },
    premiereTitleGold: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 28 : 22,
        color: COLORS.STARGOLD,
        fontStyle: 'italic',
        letterSpacing: 0.5,
        lineHeight: isTablet() ? 34 : 28,
    },
    quoteText: {
        ...FONTS.paragraph2,
        fontSize: isTablet() ? 15 : 14,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginTop: 18,
        lineHeight: isTablet() ? 24 : 22,
        paddingHorizontal: 4,
    },
    footer: {
        paddingHorizontal: contentHorizontal,
        paddingTop: 4,
        paddingBottom: isTablet() ? 28 : 20,
        backgroundColor: COLORS.BLACK,
    },
    continueButton: {
        width: '100%',
        height: isTablet() ? 54 : 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonDisabled: {
        opacity: 0.45,
    },
    continueLabel: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 16 : 14,
        color: COLORS.WHITE,
        letterSpacing: 1.4,
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    paginationDotActive: {
        backgroundColor: COLORS.CATREDLGT,
    },
    paginationDotInactive: {
        backgroundColor: COLORS.DARKERGREY,
    },
});
