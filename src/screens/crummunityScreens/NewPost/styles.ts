import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    input: {
        width: SIZES.ScreenWidth * 0.92,
        borderColor: COLORS.LIGHTGREY,
        marginTop: 10,
        alignSelf: 'center',
        height: 100,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    container: {
        marginHorizontal: 15,
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
    postButton: {
        ...FONTS.Title3,
        marginLeft: 5,
        backgroundColor: COLORS.MIDORANGE,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: COLORS.AKCRUBLUE,
        borderRadius: 5,
    },
    postgallerycontainer: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    postvideo: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
});
