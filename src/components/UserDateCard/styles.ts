import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
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
    posterstyle: {
        width: 65,
        height: 100,
        borderRadius: 4,
    },
    paragraphText: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        fontSize: 12,
    },
    paragraphText2: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
        fontSize: 12,
    },
    paragraphText3: {
        ...FONTS.Title2,
        color: COLORS.MIDORANGE,
        fontSize: 12,
    },
    paragraphText2label: {
        ...FONTS.Title3,
        color: COLORS.AKCRUBLUE,
        fontSize: 15,
        marginBottom:10
    },
    paragraphText3label: {
        ...FONTS.Title3,
        color: COLORS.MIDORANGE,
        fontSize: 15,
    },
});
