import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../assets/constants';
import {isTablet} from '../../../assets/constants/theme';

const inputHeight = isTablet() ? 60 : 45;

export default StyleSheet.create({
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        backgroundColor: COLORS.TRANSPARENT,
    },
    textinput: {
        flex: 1,
        color: COLORS.WHITE,
    },
});
