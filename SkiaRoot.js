// import { useEffect, useState } from "react";
// import { Canvas, Path, Rect, useImage } from "@shopify/react-native-skia";
// import { useWindowDimensions, View, Alert, Platform } from "react-native";
// import ClipImage, { makeHexagonPath } from "./ClipImage";
// const imgs = [
//   "https://images.pexels.com/photos/261152/pexels-photo-261152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//   "https://images.unsplash.com/photo-1662819050844-105002a4f862?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
// ];

// const alertsIsAnnoying = true;

// export default function SkiaRoot() {
//   const { width, height } = useWindowDimensions();
//   const imgSize = width * 0.5;
//   const onError = (err) => {
//     if (!alertsIsAnnoying)
//       Platform.OS == "web"
//         ? alert("Error loading Skia Image:\n" + err)
//         : Alert.alert("Error loading Skia Image", err);
//     console.log(err);
//   };
//   const images = [
//     useImage(imgs[0], onError),
//     useImage(imgs[1], onError),
//     useImage(require("./assets/images/moviedrama.jpg"), onError),
//     useImage(require("./assets/images/moviedrama.jpg"), onError),
//   ];
//   return (
//     <Canvas style={{ flex: 1, backgroundColor: "pink" }}>
//       {images.map((img, i) => (
//         <ClipImage
//           skiaImage={img}
//           imageSize={imgSize}
//           // render images under one another
//           imagePosition={[width / 4, imgSize * i]}
//         />
//       ))}
//     </Canvas>
//   );
// }
