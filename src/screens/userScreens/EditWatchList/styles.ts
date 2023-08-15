import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    container: {
        marginBottom: 75,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    poster: {
        width: SIZES.ScreenWidth * 0.2,
        height: SIZES.ScreenWidth * 0.3,
        borderRadius: 5,
        margin: 5,
        resizeMode: 'cover',
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.PUREGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
        borderRadius: 3,
        textAlign: 'center',
    },
});
