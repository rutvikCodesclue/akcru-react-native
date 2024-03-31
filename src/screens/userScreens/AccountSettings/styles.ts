import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import styles from '../PurchaseMIT/styles';

export default StyleSheet.create({
    input: {
        width: SIZES.ScreenWidth * 0.92,

        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        height: 40,
    },
    textinput: {
        color: COLORS.WHITE,
        width: '100%',
    },
    inputlabel: {
        ...FONTS.paragraph1,
        marginLeft: 5,
        color: COLORS.AKCRUBLUE,
    },
    title: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        color: COLORS.AKCRUBLUE,
        textDecorationLine: 'underline',
    },
    container: {
        marginBottom: 75,
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
    warningText: {
        ...FONTS.Title2,
        color: 'red',
    },
});
