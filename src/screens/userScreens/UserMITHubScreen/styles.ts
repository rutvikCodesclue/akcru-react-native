import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

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
    height: 35,
  },
  screenTitle: {
    ...FONTS.Title3,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  topcontainer: {
    marginTop: 60,
    marginHorizontal: 15,
  },
});
