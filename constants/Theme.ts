import { Dimensions } from "react-native";
const ScreenWidth = Dimensions.get("window").width;
const ScreenHeight = Dimensions.get("window").height;


export const SIZES = {
   //screen size
    ScreenWidth,
    ScreenHeight,
    marginhorizontal: 15,
    marginvertical: 10,
   //element size
   SmallIcon: 25,
   MedIcon: 28,
   CatBtnSize: {
      width: 80,
      height: 50,
      borderRadius: 5,
      justifyContent: "center",
   }
}

export const COLORS = {
    WHITE: "#FFFFFF",
    DARKORANGE: "#A74640",
    MIDORANGE: "#FE6345",
    LIGHTORANGE: "#F88163",
    DARKAKCRUBLUE: "#0A92C2",
    AKCRUBLUE: "#2FBFF1",
    LIGHTGREY: "#E8E8E8",
    TRANSLIGHTGREY: "#E8E8E8A6",
    DARKGREY: "#A19C9C",
    DARKERGREY: "#464646",
    TRANSDARKGREY: "#525252A6",
    GREEN: "#09FF00",
    AKCRUBACKGROUND: "#0D182A", 
    PURPLE: "#FE50E5",
    BLACK: "#000000",
    PUREGOLD: "#DB9D00",
    STARGOLD: "#FFD700",

    TAGCOLOR: "#222835",
    
    CATGREENDRK: "#004644",
    CATGREENLGT: "#07ADA7",
    CATPURPDRK: "#3A0046",
    CATPURPLGT: "#9007AD",
    CATREDDRK: "#460000",
    CATREDLGT: "#AD0707",
    CATBLUEDRK: "#000946",
    CATBLUELGT: "#1207AD"





};

export const FONTS = {
   Title1: {fontFamily: "Montserrat-SemiBold", fontSize: 16, color: COLORS.LIGHTGREY},
   Title2: {fontFamily: "Montserrat-SemiBold", fontSize: 14, color: COLORS.LIGHTGREY},
   Title3: {fontFamily: "Montserrat-Bold", fontSize: 16, color: COLORS.LIGHTGREY},
   Title2Orange: {fontFamily: "Montserrat-SemiBold", fontSize: 12, color: COLORS.DARKORANGE,},
   Title2White: {fontFamily: "Montserrat-Medium", fontSize: 14, color: COLORS.LIGHTGREY,},
   Title2AkcruBlue: {fontFamily: "Montserrat-Medium", fontSize: 14, color: COLORS.AKCRUBLUE,},
  
}

const appTheme = { COLORS, SIZES, FONTS }

export default appTheme;