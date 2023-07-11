import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
  bgimage: {
    height: SIZES.ScreenHeight,
    // width: SIZES.ScreenWidth,
  },
  container: {
    flex: 1,
    marginTop: SIZES.ScreenHeight * 0.09,
    marginHorizontal: SIZES.ScreenWidth * 0.03

  },
  backbutton: {

  },
  warningText: {
    ...FONTS.Title2,
    color: 'red',
  },
});
