import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import { isTablet } from '../../../assets/constants/theme';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    post: {
        ...FONTS.paragraph2,
        lineHeight: 18,
    },
    footStats: {
        ...FONTS.paragraph1,
        lineHeight: 18,
        color: COLORS.AKCRUBLUE,
        opacity: 0.5,
        paddingTop: 6,
    },
    cardcontainer: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    gradientFrame: {
        borderRadius: 14,
        padding: 2,
    },
    cardInner: {
        backgroundColor: '#0a0a12',
        borderRadius: 12,
        padding: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarColumn: {
        marginRight: 10,
    },
    metaColumn: {
        flex: 1,
        minWidth: 0,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
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
    },
    badgePill: {
        alignSelf: 'flex-start',
        marginTop: 4,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 7,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.OVERLAY_WHITE_20,
    },
    badgePillText: {
        ...FONTS.Akcrubadges,
        fontSize: 11,
    },
    badgeLegacyWrap: {
        marginTop: 4,
    },
    optionWrap: {
        marginLeft: 8,
        marginTop: -2,
    },
    actionWrap: {
        flexDirection: 'row',
        alignItems: 'center',
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
    timeText: {
        ...FONTS.Username,
        color: COLORS.OVERLAY_WHITE_35,
        marginTop: 10,
        fontSize: 12,
    },
    questionText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: '700',
        marginTop: 6,
        lineHeight: 22,
    },
    mediaImage: {
        width: '100%',
        aspectRatio: 4 / 5,
        marginTop: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        alignSelf: 'center',
    },
    choicesWrap: {
        marginTop: 10,
    },
    pollMetaWrap: {
        marginTop: 10,
    },
    voterText: {
        ...FONTS.paragraph1,
        color: COLORS.AKCRUBLUE,
    },
    votedText: {
        ...FONTS.Title2,
        color: COLORS.AKCRUPINK,
        marginTop: 4,
    },
    expiryText: {
        ...FONTS.Title2,
        color: COLORS.CATREDLGT,
        textAlign: 'center',
        marginTop: 4,
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
    postvideo: {
        width: '100%',
        aspectRatio: 4 / 5,
        borderRadius: 10,
        marginTop: 12,
        alignSelf: 'center',
    },
    postfooter: {
        marginTop: 16,
        width: isTablet() ? '15%' : SIZES.ScreenWidth / 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    postfooterside: {
        justifyContent: 'space-between',
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
    videoStyle: {width: '100%', height: '100%', borderRadius: 10},
    choiceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        backgroundColor: COLORS.WHITE,
        borderRadius: 5,
        shadowColor: COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    choiceImage: {
        width: 38,
        height: 38,
        marginRight: 10,
        borderRadius: 8,
    },
    choiceText: {
        flex: 1,
        ...FONTS.paragraph1,
        color: COLORS.WHITE,
    },
    choicePercentage: {
        ...FONTS.paragraph1,
        color: COLORS.PURPLE,
    },
    selectedPollChoice: {
        backgroundColor: 'rgba(155, 89, 182, 0.35)',
        borderColor: '#9b59b6',
        borderWidth: 1,
    },
    choiceSelected: {
        ...FONTS.paragraph1,
        color: COLORS.AKCRUPINK,
        textAlign: 'center',
        marginTop: 5,
    },
    pollChoice: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(52, 152, 219, 0.5)',
        backgroundColor: 'rgba(20, 20, 31, 0.92)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    choicePercentText: {
        ...FONTS.Title2,
        color: '#9b59b6',
        marginLeft: 10,
    },
});
