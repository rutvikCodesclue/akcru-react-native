import {StyleSheet} from 'react-native';
import {SIZES} from '../../../assets/constants';

export default StyleSheet.create({
    poster: {
        width: SIZES.ScreenWidth / 3.6,
        height: SIZES.ScreenWidth / 2.4,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        resizeMode: 'cover',
    },
});
