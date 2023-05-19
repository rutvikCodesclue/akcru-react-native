import { View, Text, ScrollView } from 'react-native';
import React, { useRef, useState } from 'react';
import { Header, CategoriesList, TopAkcruWatchList, TrendingNowList, NewOnAkcruList, RecommendedForYouList, MovieHomeScreenHero } from '../../components';
//import { ResizeMode, Video } from 'expo-av';
import styles from '../LoginScreens/Styles/styles';
import { FONTS } from '../../../constants';
import { AkcruDollarAmount } from '../../../constants/Mockusers';
import {ResizeMode, Video} from 'expo-av';
import {LinearGradient} from 'expo-linear-gradient';
import {
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import styled from 'styled-components/native';

const {height, width} = Dimensions.get('screen');

const VideoContainer = styled(View)`
  flex: 1;
  background-color: #0e0f0f;
  height: ${() => height * 0.56}px;
  width: ${() => width}px;
  z-index: 1;
  overflow: hidden;
`;


const VideoPlayer = styled(Video)`
  align-self: center;
  width: 100%;
  height: 100%;
`;

const Overlay = styled(LinearGradient)`
  width: 100%;
  position: absolute;
  height: 56%;
  padding: 27px 0px;
  bottom: 0;
`;


const MovieHomeScreen = () => {
const video = React.useRef(null);
const [status, setStatus] = React.useState({});

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header ADAmount={AkcruDollarAmount[0].ADAmount} />
        </View>
        <View>
          {/* Tom Cruise */}

          <VideoContainer>
            <TouchableWithoutFeedback
              onPress={() =>
                status.isPlaying
                  ? video.current.pauseAsync()
                  : video.current.playAsync()
              }
            >
              <View>
                <VideoPlayer
                  ref={video}
                  source={{
                    uri: "https://priymuscontent.s3.amazonaws.com/Movie+folder/AmericanApocalypse_L33_2ch.mp4",
                  }}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  volume={0}
                  onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                />
                <Overlay
                  colors={[
                    "#000000",
                    "#000000af",
                    "#00000055",
                    "#00000016",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                />
              </View>
            </TouchableWithoutFeedback>
          </VideoContainer>

          {/* End */}
          {/* <MovieHomeScreenHero /> */}
        </View>
        <View style={{ marginTop: 10 }}>
          <CategoriesList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Top Akcru Watchlist
          </Text>
        </View>
        <View>
          <TopAkcruWatchList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Trending Now
          </Text>
        </View>
        <View>
          <TrendingNowList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            New On Akcru
          </Text>
        </View>
        <View>
          <NewOnAkcruList />
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ ...FONTS.Title2, marginVertical: 10 }}>
            Recommended for you
          </Text>
        </View>
        <View style={{ marginBottom: 75 }}>
          <RecommendedForYouList />
        </View>
      </ScrollView>
    </View>
  );
}

export default MovieHomeScreen