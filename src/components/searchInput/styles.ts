import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  searchmodal: {
    backgroundColor: COLORS.AKCRUBACKGROUND,
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  textinput: {
    color: COLORS.WHITE,
    width: '100%'
  },
  searchinput: {
    width: SIZES.ScreenWidth / 1.1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    height: 40,
  },
});
