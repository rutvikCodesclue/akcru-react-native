import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
  tosmodal: {
    flex: 1,
    backgroundColor: COLORS.FADEDBLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tosmodalcontainer: {
    backgroundColor: COLORS.AKCRUBACKGROUND,
    width: SIZES.ScreenWidth * 0.8,
    height: SIZES.ScreenHeight * 0.8,
    paddingHorizontal: 10,
  },
  tostitle: {
    ...FONTS.Title2,
    textAlign: 'center',
    marginVertical: 10,
  },
  tosparagraph: {
    ...FONTS.Title2White,
    fontSize: 12,
    paddingBottom: 10,
    textAlign: 'center',
  },

  datePicker: {
    width: SIZES.ScreenWidth / 2,
    height: 50,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.LIGHTGREY,
    borderRadius: 5,
    color: COLORS.LIGHTGREY,
    fontSize: 16,
    marginBottom: 10,
  },
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
