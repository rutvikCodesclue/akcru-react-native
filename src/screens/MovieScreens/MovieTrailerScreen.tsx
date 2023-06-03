import { StyleSheet, Text, View, SafeAreaView, Dimensions, Alert, Button } from 'react-native'
import React, { useState, useCallback, useRef } from "react";
import { Header } from '../../components';
import WebView from 'react-native-webview';
import YoutubePlayer from "react-native-youtube-iframe";
import { SIZES } from '../../../constants';
import { MOVIES } from '../../../constants/Data';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClientStackParams } from '../../navigation/ClientStack';
import { RouteProp } from '@react-navigation/native';


type MovieTrailerScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  "MovieTrailerScreen"
>;

type MovieTrailerScreenRouteProp = RouteProp<
  ClientStackParams,
  "MovieTrailerScreen"
>;

type Props = {
  navigation: MovieTrailerScreenNavigationProp;
  route: MovieTrailerScreenRouteProp;
};


const MovieTrailerScreen = ({navigation, route}: Props) => {

  const id: number | undefined = route.params?.id ?? null;
  const movie: string | undefined = route.params?.movie ?? null;

  const {
   youtubeID
  } = MOVIES[id ?? 0];

  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  return (
    <View>
      <View>
        <Header />
      </View>
      <View style={{ height: 300, width: SIZES.ScreenWidth }}>
        <YoutubePlayer
          height={300}
          play={playing}
          videoId={youtubeID}
          onChangeState={onStateChange}
        />
        <Button title={playing ? "pause" : "play"} onPress={togglePlaying} />
      </View>
    </View>
  );
}

export default MovieTrailerScreen

const styles = StyleSheet.create({})