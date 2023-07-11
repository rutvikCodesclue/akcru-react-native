import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
  bgimage: {
    height: SIZES.ScreenHeight,
  
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.ScreenHeight * 0.25,

  },
  mastercontainer: {
    height: SIZES.ScreenHeight,
    width: SIZES.ScreenWidth,
  },
});
