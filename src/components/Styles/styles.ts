import { StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS } from "../../../constants";

export default StyleSheet.create({
  input: {
    width: SIZES.ScreenWidth / 1.5,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.WHITE,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: "center",
    height: 35,
  },
  searchinput: {
    width: SIZES.ScreenWidth / 1.1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: "center",
    height: 35,
    
  },
  textinput: {
    color: COLORS.WHITE,
    
  },
  lrgbuttoncontainer: {
    width: SIZES.ScreenWidth / 1.5,
    height: 40,
  },
  medbuttoncontainer: {
    width: SIZES.ScreenWidth / 2.2,
    height: 40,
  },
  lrgbutton: {
    flex: 1,
    backgroundColor: COLORS.AKCRUBLUE,
    justifyContent: "center",
    borderRadius: 5,
  },
  catbtnsize: {
    width: 72,
    height: 44,
    borderRadius: 5,
    justifyContent: "center",
  },
  drawfonttag: {
    ...FONTS.Title2Orange,
    color: COLORS.DARKGREY,
    backgroundColor: COLORS.TAGCOLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderRadius: 4,
    textAlign: "center",
  },
  genrecard: {
    width: SIZES.ScreenWidth / 2.2,
    height: SIZES.ScreenWidth / 2.2,
    borderRadius: 5,
    margin: 3
  },
  genrecardoverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: SIZES.ScreenWidth / 2.2,
    height: SIZES.ScreenWidth / 2.2,
    borderRadius: 5,
    margin: 3
  },
  searchmodal: {
    backgroundColor: COLORS.AKCRUBACKGROUND,
    alignItems: "center"
  },
  icon: {
    marginRight: 5,
    
  },
});
