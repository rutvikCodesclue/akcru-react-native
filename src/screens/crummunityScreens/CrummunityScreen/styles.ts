import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
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
  container: {
    marginHorizontal: 15,
  },
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
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 90,
  },
  postcontainer: {
    marginHorizontal: 15,
    marginTop: 25,
    marginBottom: 75,
  },
});
