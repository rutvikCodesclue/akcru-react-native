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
    charCount: {
        ...FONTS.paragraph3,
        color: 'rgba(255,255,255,0.45)',
        alignSelf: 'flex-end',
        marginTop: 6,
    },
    container: {
        marginHorizontal: 15,
    },
    cancelButton: {
        ...FONTS.paragraph1,
        backgroundColor: COLORS.AKCRUPINK,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
    },
    searchinput: {
        width: SIZES.ScreenWidth / 1.08,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 35,
    },
    screenTitle: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '20%',
    },
    screenTitle2: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '2%',
        textAlign: 'center',
    },
    postcontainer: {
        width: SIZES.ScreenWidth * 0.93,
        alignSelf: 'center',
        marginBottom: 5,
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
    suggestionList: {
        marginTop: 8,
    },
    suggestionItem: {
        marginVertical: 5,
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
