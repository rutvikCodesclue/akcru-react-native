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
    marginHorizontal: SIZES.ScreenWidth * 0.03,
   

  },
  mastercontainer: {
    height: SIZES.ScreenHeight,
    width: SIZES.ScreenWidth,
  },
  warningText: {
    ...FONTS.Title2,
    color: 'red',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: COLORS.LIGHTGREY,
    borderWidth: 2,
    alignContent: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    ...FONTS.Title2,
    color: COLORS.MIDORANGE,
    marginLeft: 10,
  },
  backbutton: {},
});
