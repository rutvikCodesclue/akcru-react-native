import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
  titleText1: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  paragraphText: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
  },
  gallerycontainer: {
    marginBottom: 20,
  },
  galleryImage: {
    width: SIZES.ScreenWidth / 3.3,
    height: SIZES.ScreenWidth / 3.3,
    marginRight: 10,
    borderRadius: 8,
  },
  galleryImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  titleText2: {
    ...FONTS.Title2,
    color: COLORS.DARKGREY,
    fontSize: 12,
    marginVertical: 5,
  },
  titleText2White: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
    marginVertical: 5,
  },
  titleText3: {
    ...FONTS.Title2,
    color: COLORS.DARKGREY,
    fontSize: 12,
  },
  lineSeperator: {
    borderBottomWidth: 1.5,
    borderColor: COLORS.DARKERGREY,
    marginTop: 20,
    marginBottom: 10,
  },
  inputContainer: {
    width: SIZES.ScreenWidth / 2.5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    height: 35,
  },
  inputContainer2: {
    width: SIZES.ScreenWidth / 1.1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    height: 35,
  },
});
