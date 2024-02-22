import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import styles from '../PurchaseMIT/styles';

export default StyleSheet.create({
    input: {
        width: "95%",
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        marginTop: 10,
    },
    textinput: {
        color: COLORS.WHITE,
    },
    inputlabel: {
        ...FONTS.Title2White,
        marginLeft: 5,
        color: COLORS.LIGHTGREY,
    },
    title: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
        color: COLORS.MIDORANGE,
    },
    container: {
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    bgimage: {
        height: SIZES.ScreenHeight,
        // width: SIZES.ScreenWidth,
    },
    datepicker: {
        height: 120,
        marginTop: -10,
    },
    iosbutton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: COLORS.LIGHTGREY,
    },
    iospickerbutton: {
        paddingHorizontal: 20,
    },
});
