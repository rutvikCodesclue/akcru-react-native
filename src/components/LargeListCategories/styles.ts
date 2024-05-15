import {StyleSheet} from 'react-native';
import {SIZES} from '../../../assets/constants';

export default StyleSheet.create({
    poster: {
        width: SIZES.ScreenWidth / 1.3,
        height: SIZES.ScreenWidth / 2.4,
        borderRadius: 5,
        margin: 5,
        resizeMode: 'cover',
    },
});
