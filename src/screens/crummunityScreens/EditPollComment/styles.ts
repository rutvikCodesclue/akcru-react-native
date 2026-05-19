import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#050508',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    headerZIndex: {
        zIndex: 100,
    },
    topActionArea: {
        height: SIZES.ScreenHeight * 0.15,
        marginTop: -68,
        backgroundColor: '#050508',
    },
    topActionGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: SIZES.ScreenHeight * 0.15,
    },
    topActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '20%',
        marginHorizontal: 15,
    },
    cancelText: {
        ...FONTS.Title3,
        marginLeft: 5,
    },
    composerWrap: {
        marginTop: '5%',
        marginHorizontal: 15,
        backgroundColor: '#121722',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrap: {
        marginRight: 8,
    },
    authorMeta: {
        flexShrink: 1,
    },
    usernameText: {
        ...FONTS.Title2,
        fontSize: 12,
    },
    inlineBadge: {
        marginTop: 4,
        flexShrink: 0,
        transform: [{scale: 0.92}],
    },
    input: {
        width: SIZES.ScreenWidth * 0.87,
        borderColor: COLORS.FADEDBLACK,
        marginTop: 10,
        alignSelf: 'center',
        minHeight: 120,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#0b1019',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    textinput: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputAreaWrap: {
        position: 'relative',
        zIndex: 50,
    },
    charCount: {
        ...FONTS.paragraph3,
        color: 'rgba(255,255,255,0.45)',
        alignSelf: 'flex-end',
        marginTop: 6,
    },
    bottomActionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: '#050508',
        borderTopWidth: 1,
        borderTopColor: COLORS.FADEDBLACK,
    },
    suggestionPanel: {
        position: 'absolute',
        top: 126,
        left: 0,
        right: 0,
        backgroundColor: '#0b1019',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        maxHeight: 260,
        overflow: 'hidden',
        zIndex: 100,
        elevation: 8,
    },
    suggestionList: {
        width: '100%',
    },
    mentionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    mentionMeta: {
        marginLeft: 10,
        flex: 1,
    },
    mentionNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    mentionUsername: {
        ...FONTS.Title2,
        fontSize: 13,
        color: COLORS.WHITE,
    },
    mentionFirstName: {
        ...FONTS.paragraph1,
        color: 'rgba(255,255,255,0.65)',
        marginLeft: 8,
    },
    mentionBadgeWrap: {
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    mediaPreviewWrap: {
        marginTop: 10,
    },
    previewImage: {
        width: SIZES.ScreenWidth / 3.8,
        height: SIZES.ScreenWidth / 2.5,
        margin: 5,
        borderRadius: 8,
    },
    previewImageCard: {
        position: 'relative',
    },
    postvideo: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginTop: 10,
    },
});
