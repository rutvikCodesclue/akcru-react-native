import * as Font from "expo-font";

export default useFonts = async () => {
   await Font.loadAsync({
     "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
     "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
     "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
     "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
     "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
     "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
     "Montserrat-Thin": require("../assets/fonts/Montserrat-Thin.ttf"),
   });
};