import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
    posterstyle: {
        width: 65,
        height: 100,
        borderRadius: 4,
    },
    paragraphText: {
        ...FONTS.Username,
        color: COLORS.LIGHTGREY,
    },
    paragraphText2: {
        ...FONTS.Username,
        color: COLORS.AKCRUBLUE,
    },
    paragraphText3: {
        ...FONTS.Username,
        color: COLORS.PINK,
    },
    paragraphText2label: {
        ...FONTS.Title3,
        color: COLORS.AKCRUBLUE,

        marginBottom: 10,
    },
    paragraphText3label: {
        ...FONTS.Title3,
        color: COLORS.MIDORANGE,
    },
});
