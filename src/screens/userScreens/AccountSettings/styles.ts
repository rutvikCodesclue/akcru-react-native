import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import styles from '../PurchaseMIT/styles';

export default StyleSheet.create({
    input: {
        width: SIZES.ScreenWidth * 0.92,
        flexDirection: 'row',

        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        height: 40,
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
    },
    container: {
        marginBottom: 75,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
});
