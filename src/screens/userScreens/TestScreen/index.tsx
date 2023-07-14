
import {Text, View, StyleSheet, Image, Platform} from 'react-native';
import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AkcruButtons from '../../../components/akcruButtons';
import {FAB, Portal, Provider} from 'react-native-paper';
import { COLORS, SIZES } from '../../../../assets/constants';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-media-console';



const TestScreen = () => {
  const [state, setState] = React.useState({open: false});

  const onStateChange = ({open}) => setState({open});

  const [response, setResponse] = React.useState<any>(null);

  const {open} = state;
  return (
    <View style={{flex: 1}}>
      <View style={{height: SIZES.ScreenHeight / 4}}>
        <VideoPlayer
          source={{
            uri: 'https://priymuscontent.s3.amazonaws.com/Movie+folder/Widows.mp4',
          }}
          tapAnywhereToPause={true}
         
          toggleResizeModeOnFullscreen={true}
          isFullscreen={false}
          posterResizeMode='cover'
          poster="https://priymuscontent.s3.amazonaws.com/Beta+test+posters/widowsPT.jpg"
         
        />
      </View>
      <View style={{backgroundColor: 'red', flex: 1}}></View>
    </View>
  );
}

export default TestScreen;

const styles = StyleSheet.create({
  fab: {
    backgroundColor: COLORS.AKCRUBLUE,
  },
  image: {
    marginVertical: 24,
    alignItems: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  corner: {
    width: 200,
    height: 100
  }
});
