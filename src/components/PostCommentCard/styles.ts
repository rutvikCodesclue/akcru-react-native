import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    topContainer: {},
    cardGlow: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarWrap: {
        marginRight: 8,
    },
    headerContent: {
        flex: 1,
    },
    identityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    roleIcon: {
        marginLeft: 3,
    },
    userName: {
        ...FONTS.Username,
        marginRight: 4,
        fontSize: 13,
    },
    fullName: {
        ...FONTS.paragraph1,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    metaText: {
        ...FONTS.Username,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
    },
    metaRow: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginLeft: 4,
    },
    badgePill: {
        alignSelf: 'flex-start',
        marginTop: 2,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgePillText: {
        ...FONTS.Akcrubadges,
        fontSize: 11,
    },
    editedLabel: {
        color: COLORS.PURPLE,
    },
    menuWrap: {
        marginLeft: 8,
        paddingTop: 2,
    },
    bodyWrap: {
        marginTop: 8,
    },
    post: {
        ...FONTS.paragraph1,
        color: 'rgba(255,255,255,0.95)',
        lineHeight: 18,
        fontSize: 13,
    },
    footStats: {
        ...FONTS.paragraph2,
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
    },
    cardcontainer: {
        backgroundColor: '#121722',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
    postvideo: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
    postfooter: {
        marginTop: 0,
        width: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerRow: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
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
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    mediaSheetGradientBorder: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 1,
        backgroundColor: 'transparent',
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
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});
