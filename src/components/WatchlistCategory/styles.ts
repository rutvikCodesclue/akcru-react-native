import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  poster: {
    width: SIZES.ScreenWidth / 3.6,
    height: SIZES.ScreenWidth / 2.4,
    borderRadius: 5,
    margin: 5,
    resizeMode: 'cover',
  },
});
