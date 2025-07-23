import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../assets/constants';
import {isTablet} from '../../../assets/constants/theme';

const inputHeight = isTablet() ? 60 : 45;

export default StyleSheet.create({
    input: {
        width: SIZES.ScreenWidth * 0.9,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: inputHeight,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    textinput: {
        color: COLORS.WHITE,
        width: '100%',
    },
});
