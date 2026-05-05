import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { isTablet } from '../../../../assets/constants/theme';

export default StyleSheet.create({
    titleText1: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',

        textDecorationLine: 'underline',
    },
    paragraphText: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
    },
    gallerycontainer: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    gallerycontainer2: {
        marginHorizontal: 15,
        marginBottom: 90,
    },
    galleryImage: {
        width: isTablet() ? SIZES.ScreenWidth / 3.3 : SIZES.ScreenWidth / 3.55,
        height: SIZES.ScreenWidth / 2.35,
        margin: 5,
        borderRadius: 5,
    },
    galleryImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
    },
    titleText2: {
        ...FONTS.Title2,
        color: COLORS.PINK,

        marginVertical: 5,
    },
    titleText2White: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,

        marginVertical: 5,
    },
    titleText3: {
        ...FONTS.Title2,
        color: COLORS.DARKGREY,
    },
    lineSeperator: {
        borderBottomWidth: 1.5,
        borderColor: COLORS.DARKERGREY,
        marginTop: 20,
        marginBottom: 10,
    },
    inputContainer: {
        width: SIZES.ScreenWidth / 2.5,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 35,
    },
    inputContainer2: {
        width: SIZES.ScreenWidth / 1.1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignSelf: 'center',
        height: 40,
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
    searchinput: {
        width: SIZES.ScreenWidth / 1.1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 40,
    },
    selectedPhotoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedPhotoContainer2: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    selectedPhoto: {
        width: SIZES.ScreenWidth,
        aspectRatio: 1,
        opacity: 0,
        marginTop: -100,
    },

    lineDivider: {
        borderBottomWidth: 1.5,
        borderColor: COLORS.DARKERGREY,
        marginTop: 20,
        marginBottom: 10,
    },

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: COLORS.BLACK,
        borderRadius: 12,
        padding: 16,
    },
    title: {...FONTS.Title1, marginBottom: 12, color: COLORS.PINK},
    separator: {height: 1, backgroundColor: COLORS.DARKERGREY, marginVertical: 8},
    userRow: {flexDirection: 'row', alignItems: 'center'},
    avatar: {width: 32, height: 32, borderRadius: 16},
    username: {marginLeft: 12, ...FONTS.Title2},
    closeBtn: {marginTop: 16, alignSelf: 'flex-end'},
    closeText: {...FONTS.paragraph2, color: COLORS.PINK},
});
