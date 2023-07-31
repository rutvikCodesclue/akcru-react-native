import { Text, View } from 'react-native'
import React from 'react'
import styles from './styles'
import VideoPlayer from 'react-native-media-console';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { Akcru_Content } from '../../../../assets/constants/ListData';


type ContentPlayerNavigationProp = StackNavigationProp<
  NoBottomTabStackParams,
  'ContentPlayer'
>;

type ContentPlayerRouteProp = RouteProp<
  NoBottomTabStackParams,
  'ContentPlayer'
>;

type Props = {
  navigation: ContentPlayerNavigationProp;
  route: ContentPlayerRouteProp;
};


export default function ContentPlayer({navigation, route}: Props) {
  const id: number | undefined = route.params?.id ?? null;

  const {
    name,
    year,
    length,
    rated,
    rating,
    desc,
    actors,
    directors,
    portrait_poster,
    youtubetrailer,
    landscape_poster,
    movie_url,
    genre,
  } = Akcru_Content[0].movies[id ?? 0];


  return (
    <View style={styles.container}>
      <VideoPlayer
        source={{
          uri: movie_url,
        }}
        tapAnywhereToPause={false}
        toggleResizeModeOnFullscreen={false}
        poster={landscape_poster}
        containerStyle={{zIndex: 100}}
        onBack={() => navigation.pop()}
      />
    </View>
  );
}
