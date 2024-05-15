import {StyleSheet} from 'react-native';
import {SIZES} from '../../../assets/constants';

export default StyleSheet.create({
    poster: {
        width: SIZES.ScreenWidth / 3.5,
        height: SIZES.ScreenWidth / 2.35,
        borderRadius: 5,
        margin: 5,
        resizeMode: 'cover',
    },
});
