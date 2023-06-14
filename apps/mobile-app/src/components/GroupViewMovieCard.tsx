import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
//import { ResizeMode, Video } from 'expo-av';
import { Video, ResizeMode } from "expo-av";
import AkcruButtons from './Buttons';
import { COLORS } from '../../constants/index';


const GroupViewMovieCard = () => {
  const video = React.useRef(null);
  const [streamStatus, setStreamStatus] = React.useState({}); //Video Player Status

  return (
    <View>
      <View style={styles.videocontain}>
        <View>
          <Video
            ref={video}
            source={{
              uri: "https://priymuscontent.s3.amazonaws.com/Movie+folder/Attack+of+the+Lederhosen+Zombies_Feature+subtitles.mp4",
            }}
            posterSource={{
              uri: "https://m.media-amazon.com/images/I/81v18fCWa6L._RI_.jpg",
            }}
            usePoster={true}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            volume={0}
            onPlaybackStatusUpdate={(status: {}) => setStreamStatus(() => status)}
            style={styles.videoplayer}
          />
        </View>
      </View>
      <AkcruButtons.MedButton
        btnname={streamStatus.isPlaying ? "Pause Movie" : "Play Movie"}
        onPress={() =>
          streamStatus.isPlaying
            ? video.current.pauseAsync()
            : video.current.playAsync()
        }
        color={COLORS.AKCRUBLUE}
      />
    </View>
  );
}

export default GroupViewMovieCard

const styles = StyleSheet.create({
    
  videocontain: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'center'  
  },
  videoplayer : {
alignSelf: 'center',
aspectRatio: 16/9,
width: "95%"

  }
})