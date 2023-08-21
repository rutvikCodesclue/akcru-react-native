import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    activitycontainer: {
      backgroundColor: COLORS.BLACK,
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
