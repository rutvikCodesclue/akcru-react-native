import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';

const videoCardSize = Math.min(SIZES.ScreenWidth - 48, 340);

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: isTablet() ? 48 : 36,
        paddingBottom: 32,
        alignItems: 'center',
    },
    brandTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 28 : 22,
        color: COLORS.AKCRUBLUE,
        letterSpacing: 2,
    },
    welcomeLabel: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontSize: isTablet() ? 14 : 12,
        letterSpacing: 1.2,
        marginTop: 20,
        textTransform: 'uppercase',
    },
    presentsTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 22 : 18,
        color: COLORS.WHITE,
        letterSpacing: 1,
        marginTop: 4,
        textTransform: 'uppercase',
    },
    videoSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: 28,
    },
    videoCard: {
        width: videoCardSize,
        height: videoCardSize,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        alignSelf: 'center',
        backgroundColor: COLORS.DARKERGREY,
    },
    videoThumbnail: {
        width: videoCardSize,
        height: videoCardSize,
        aspectRatio: 1,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.OVERLAY_BLACK_35,
    },
    playIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.OVERLAY_WHITE_30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    description: {
        ...FONTS.paragraph2,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginTop: 24,
    },
    creatorName: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 26 : 22,
        color: COLORS.AKCRUBLUE,
        letterSpacing: 1.5,
        marginTop: 12,
        textTransform: 'uppercase',
    },
    creatorTagline: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginTop: 6,
        textAlign: 'center',
    },
    continueButton: {
        width: Math.min(SIZES.ScreenWidth - 48, 340),
        height: isTablet() ? 52 : 48,
        borderRadius: 10,
        backgroundColor: COLORS.AKCRUBLUE,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    continueLabel: {
        fontFamily: 'Montserrat-Bold',
        fontSize: isTablet() ? 16 : 14,
        color: COLORS.WHITE,
        letterSpacing: 1.2,
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 28,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    paginationDotActive: {
        backgroundColor: COLORS.AKCRUBLUE,
    },
    paginationDotInactive: {
        backgroundColor: COLORS.DARKERGREY,
    },
    spacer: {
        flex: 1,
        minHeight: 16,
    },
});
