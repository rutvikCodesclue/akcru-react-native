import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import {isTablet} from '../../../assets/constants/theme';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    post: {
        ...FONTS.paragraph1,

        lineHeight: isTablet() ? 26 : 18,
    },
    footStats: {
        ...FONTS.paragraph1,

        lineHeight: 18,
        color: COLORS.AKCRUBLUE,
        opacity: 0.5,
        paddingTop: 3,
    },
    cardcontainer: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    cardInner: {
        backgroundColor: '#0a0a12',
        borderRadius: 12,
        padding: 14,
    },
    gradientFrame: {
        borderRadius: 14,
        padding: 2,
    },
    displayName: {
        ...FONTS.Username,
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: isTablet() ? 18 : 15,
    },
    handleText: {
        ...FONTS.paragraph1,
        color: COLORS.OVERLAY_WHITE_45,
        fontSize: isTablet() ? 15 : 14,
        marginTop: 0,
    },
    badgePill: {
        alignSelf: 'flex-start',
        marginTop: 4,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_20,
    },
    badgePillText: {
        ...FONTS.Akcrubadges,
        fontSize: 11,
    },
    followBtn: {
        backgroundColor: 'rgba(155, 89, 182, 0.35)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(155, 89, 182, 0.7)',
    },
    followBtnText: {
        color: COLORS.WHITE,
        fontSize: 13,
        fontWeight: '600',
    },
    headline: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
        marginTop: 0,
        lineHeight: 22,
    },
    descText: {
        ...FONTS.paragraph1,
        color: COLORS.OVERLAY_WHITE_55,
        marginTop: 6,
        lineHeight: 20,
    },
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginTop: 10,
    },
    tagText: {
        color: COLORS.WHITE,
        fontSize: 13,
        marginLeft: 4,
    },
    engagementRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        marginTop: 18,
        paddingVertical: 2,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(155, 89, 182, 0.25)',
    },
    engagementLabel: {
        color: COLORS.OVERLAY_WHITE_50,
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
    },
    mediaCarouselWrap: {
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    mediaImage: {
        width: '100%',
        aspectRatio: 4 / 5,
        alignSelf: 'center',
    },
    stamps: {
        ...FONTS.Title2Orange,
        marginBottom: 3,
    },
    stamps2: {
        ...FONTS.Title2AkcruBlue,
        fontSize: 14,
        color: COLORS.LIGHTGREY,
    },
    reply: {
        ...FONTS.Title1,
        color: COLORS.AKCRUBLUE,
        fontSize: 14,
    },
    viewreply: {
        ...FONTS.Title1,
        color: COLORS.CATPURPLGT,
        fontSize: 14,
    },
    postimage: {
        width: '100%',
        aspectRatio: 4 / 5,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    postvideo: {
        width: '100%',
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    postfooter: {
        marginTop: 20,
        width: isTablet() ? '15%' : SIZES.ScreenWidth / 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    postfooterside: {
        justifyContent: 'space-between',
    },
    postoptionsmodal: {
        width: '100%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 15,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: COLORS.OVERLAY_BLACK_45,
    },
    mediaSheetGradientBorder: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 1,
        backgroundColor: COLORS.TRANSPARENT,
    },
    mediaSheet: {
        backgroundColor: COLORS.BLACK,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.25)',
    },
    mediaSheetTitle: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginBottom: 12,
    },
    optionsList: {
        borderTopWidth: 1,
        borderTopColor: COLORS.OVERLAY_WHITE_08,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.OVERLAY_WHITE_08,
    },
    optionIconWrap: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    optionLabel: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontSize: 15,
    },
    postoptioncontainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: COLORS.OVERLAY_BLACK_50,
    },
    videoStyle: {width: '100%', height: '100%', borderRadius: 10},
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{translateX: -25}, {translateY: -25}], // Center the button
        backgroundColor: COLORS.OVERLAY_BLACK_50,  // Semi-transparent background
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonText: {
        color: COLORS.WHITE,
        fontSize: 30,
    },
});
