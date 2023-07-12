import { StyleSheet } from "react-native";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
  gallerycontainer: {
    marginBottom: 20,
  },
  galleryImage: {
    width: SIZES.ScreenWidth / 3.7,
    height: SIZES.ScreenWidth / 3.7,
    marginRight: 10,
    borderRadius: 8,
  },
  galleryImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  container: {
    marginBottom: 75,
    marginHorizontal: SIZES.ScreenWidth * 0.03,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 10,
  },
  title: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  input: {
    width: SIZES.ScreenWidth * 0.92,
    flexDirection: "row",

    borderBottomWidth: 1,
    borderColor: COLORS.LIGHTGREY,
    marginBottom: 20,
    alignSelf: "center",
    height: 40,
  },
  textinput: {
    color: COLORS.WHITE,
  },
  inputlabel: {
    ...FONTS.Title2White,
    marginLeft: 5,
    color: COLORS.LIGHTGREY,
  },
  settingslabel: {
    ...FONTS.Title2White,
    marginLeft: 5,
    color: COLORS.MIDORANGE,

  },
});
