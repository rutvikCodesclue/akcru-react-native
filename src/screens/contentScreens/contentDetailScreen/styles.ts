import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
  container: {

  },
  input: {
    flexDirection: 'row',
    borderWidth: 0.8,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingLeft: 10,
    alignItems: 'flex-start',
    height: 150,
  },
  textinput: {
    color: COLORS.LIGHTGREY,
  },
  sendbutton: {
    backgroundColor: COLORS.AKCRUBLUE,
    height: 35,
    justifyContent: 'center',
    width: 90,
    borderRadius: 5,
    alignItems: 'center',
  },
});
