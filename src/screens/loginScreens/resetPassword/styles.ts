import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    bgimage: {
        height: SIZES.ScreenHeight,
        // width: SIZES.ScreenWidth,
    },
    container: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.09,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    container2: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.09,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    backbutton: {},
    warningText: {
        ...FONTS.Title2,
        color: 'red',
        textAlign: 'center',
    },
    warningText2: {
        ...FONTS.Title2,
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    input: {
        width: SIZES.ScreenWidth * .85,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        height: 45,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    textinput: {
        color: COLORS.WHITE,
        width: '100%',
    },
    textinputprefix: {
        color: COLORS.WHITE,
        marginBottom:2
    },
});
