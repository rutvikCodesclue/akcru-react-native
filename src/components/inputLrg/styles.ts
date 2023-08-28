import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants'

export default StyleSheet.create({
  input: {
    width: SIZES.ScreenWidth * 0.8,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.LIGHTGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    height: 40,
    backgroundColor: COLORS.TRANSDARKGREY,
  },
  textinput: {
    color: COLORS.WHITE,
    
  },
});