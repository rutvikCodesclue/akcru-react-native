import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
  container: {
    marginBottom:20,
    marginHorizontal: SIZES.ScreenWidth * 0.03,
  },
  input: {
    width: SIZES.ScreenWidth * 0.92,
    flexDirection: 'row',

    borderBottomWidth: 1,
    borderColor: COLORS.LIGHTGREY,
    marginBottom: 20,
    alignSelf: 'center',
    height: 40,
  },
  textinput: {
    color: COLORS.LIGHTGREY,
  },
  inputlabel: {
    ...FONTS.Title2White,
    marginLeft: 5,
    color: COLORS.LIGHTGREY,
  },
});
