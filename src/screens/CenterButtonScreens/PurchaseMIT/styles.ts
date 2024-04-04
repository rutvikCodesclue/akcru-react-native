import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    pricecontainer: {
        alignItems: 'center',
        backgroundColor: COLORS.TRANSDARKGREY,
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 15,
        marginVertical: 5,
    },
    mitimage: {
        width: 115,
        height: 100,
    },
    mitprice: {
        ...FONTS.Title1,
        
        color: COLORS.LIGHTGREY,
        marginBottom: 10,
    },
    counticonbox: {
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        padding: 5,
        backgroundColor: COLORS.DARKERGREY,
    },
    warningText: {
        ...FONTS.Title2,
        color: 'red',
    },
});
