import {StyleSheet, Platform, Dimensions} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default StyleSheet.create({
  searchinput: {
    width: SIZES.ScreenWidth / 1.08,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    height: 40,
    justifyContent: 'space-between'
  },
  backbutton: {
    backgroundColor: COLORS.AKCRUBACKGROUND,
  },
});
