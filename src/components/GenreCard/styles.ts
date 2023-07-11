import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  genrecard: {
    width: SIZES.ScreenWidth / 2.2,
    height: SIZES.ScreenWidth / 2.2,
    borderRadius: 5,
    margin: 3,
  },
  genrecardoverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: SIZES.ScreenWidth / 2.2,
    height: SIZES.ScreenWidth / 2.2,
    borderRadius: 5,
    margin: 3,
  },
});
