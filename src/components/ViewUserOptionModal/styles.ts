import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    post: {
        ...FONTS.paragraph1,
        fontSize: 12,
        lineHeight: 18,
    },
    footStats: {
        ...FONTS.paragraph1,
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.AKCRUBLUE,
        opacity: 0.5,
        paddingTop: 10,
    },
    cardcontainer: {
        backgroundColor: COLORS.SURFACE_ELEVATED,
        borderRadius: 5,
        padding: 10,
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
        marginTop: 10,
        width: SIZES.ScreenWidth / 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    postfooterside: {
        justifyContent: 'space-between',
    },
    postoptionsmodal: {
        width: '100%',
        height: '25%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 15,
    },
    postoptioncontainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: COLORS.OVERLAY_BLACK_50,
    },
});
