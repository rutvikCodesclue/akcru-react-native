import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    titleText1: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    paragraphText: {
        ...FONTS.Username,
        color: COLORS.LIGHTGREY,
        marginHorizontal: 5,
    },
    paragraphText2: {
        ...FONTS.Username,
        color: COLORS.AKCRUBLUE,
    },
    paragraphText3: {
        ...FONTS.Username,
        color: COLORS.MIDORANGE,
    },
    declineButton: {
        ...FONTS.Username,
        color: COLORS.AKCRUBLUE,
    },
});
