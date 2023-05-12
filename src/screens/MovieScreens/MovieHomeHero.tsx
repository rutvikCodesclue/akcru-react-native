// import styled from 'styled-components/native';

// const {height, width} = Dimensions.get('screen');

// const VideoContainer = styled(View)`
//   flex: 1;
//   background-color: #0e0f0f;
//   height: ${() => height * 0.56}px;
//   width: ${() => width}px;
//   z-index: 1;
//   overflow: hidden;
// `;


// const VideoPlayer = styled(Video)`
//   align-self: center;
//   width: 100%;
//   height: 100%;
// `;

// const Overlay = styled(LinearGradient)`
//   width: 100%;
//   position: absolute;
//   height: 56%;
//   padding: 27px 0px;
//   bottom: 0;
// `;


// const MovieHomeScreen = () => {

//   const video = React.useRef(null);
//   const [status, setStatus] = React.useState({});
//   return (
//     <View>
//       <ScrollView stickyHeaderIndices={[0]}>
//         <View>
//           <Header ADAmount={46789} />
//         </View>
//         <View>



//           {/* Tom Cruise */}

//           <VideoContainer>
//               <TouchableWithoutFeedback
//                 onPress={() =>
//                   status.isPlaying
//                     ? video.current.pauseAsync()
//                     : video.current.playAsync()
//                 }>
//                 <View>
//                   <VideoPlayer
//                     ref={video}
//                     source={{
//                       uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
//                     }}
//                     resizeMode={ResizeMode.COVER}
//                     isLooping
//                     volume={0}
//                     onPlaybackStatusUpdate={status => setStatus(() => status)}
//                   />
//                   <Overlay
//                     colors={[
//                       '#000000',
//                       '#000000af',
//                       '#00000055',
//                       '#00000016',
//                       'transparent',
//                     ]}
//                     start={{x: 0, y: 1}}
//                     end={{x: 0, y: 0}}
//                     locations={[0, 0.25, 0.5, 0.75, 1]}
//                   />
//                 </View>
//               </TouchableWithoutFeedback>
//             </VideoContainer>


//           {/* End */}
//           {/* <MovieHomeScreenHero /> */}