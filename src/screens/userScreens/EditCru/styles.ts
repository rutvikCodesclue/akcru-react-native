import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    container: {
        marginBottom: 20,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    input: {
        width: SIZES.ScreenWidth * 0.92,

        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        height: 40,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
        width: '100%'
    },
    inputlabel: {
        ...FONTS.Title2White,
        marginLeft: 5,
        color: COLORS.LIGHTGREY,
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
        height: 40,
    },
    listfooter: {
        borderRadius: 5,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        width: SIZES.ScreenWidth / 2.3,
        height: SIZES.ScreenHeight * 0.08,
        borderWidth: 1,
        borderColor: COLORS.AKCRUBLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? '10%' : 0
    },
});
