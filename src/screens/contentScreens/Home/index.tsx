import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import React, {useRef, useState} from 'react';
import BasicListCategories from '../../../components/BasicListCategories';
import LargeListCategories from '../../../components/LargeListCategories';
import FullPageCategories from '../../../components/FullPageCategories';
import {Akcru_Content} from '../../../../assets/constants/ListData';
import Header from '../../../components/header';
import CategoriesBtn from '../../../components/CategoriesBtn';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../../../components/akcruButtons';
// import {Video, ResizeMode} from 'expo-av';
import {COLORS, SIZES} from '../../../../assets/constants/index';
import styles from './styles';
import {CATEGORIES} from '../../../../assets/constants/Data';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { ClientStackParams } from '../../../navigation/ClientStack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-media-console';

const AllMovies = Akcru_Content[0];
const NewOnAkcru = Akcru_Content[1];
const TopOnAkcru = Akcru_Content[2];
const TrendingNow = Akcru_Content[3];
const RecommendedForYou = Akcru_Content[4];
const TopBox = Akcru_Content[8]

const HomeScreen = () => {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  const handleGenrePress = genre => {
    navigation.navigate('SearchMovieResultScreen', {
      genre: genre,
    });
  };

   const handlePress = () => {
     navigation.navigate('ContentDetailScreen', {
       id: TopBox.movies[0].id, // Pass the appropriate movie ID to the ContentDetailScreen
     });
   };

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View>
        <Header />
      </View>
      <Pressable style={styles.videocontainer} onPress={handlePress}>
        <View style={{height: SIZES.ScreenHeight / 1.63}}>
          <VideoPlayer
            source={{
              uri: TopBox.movies[0].movie_url,
            }}
            muted={true}
            tapAnywhereToPause={true}
            disablePlayPause
            disableSeekButtons
            disableSeekbar
            disableVolume
            disableBack
            disableFullscreen
            disableTimer
            toggleResizeModeOnFullscreen={true}
            isFullscreen={true}
            posterResizeMode="cover"
            poster={TopBox.movies[0].portrait_poster}
          />
        </View>
        <View>
          <LinearGradient
            // Background Linear Gradient
            colors={['transparent', COLORS.AKCRUBACKGROUND]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 200,
            }}
          />
          <View
            style={{
              marginHorizontal: 15,
              marginBottom: 20,
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
            }}>
            <View>
              <Text style={styles.bigTitle}>{TopBox.movies[0].name}</Text>
              <View style={{flexDirection: 'row', marginVertical: 10}}>
                <Text style={styles.drawfonttag}>{TopBox.movies[0].rated}</Text>
                <Text style={styles.drawfonttag}>
                  {TopBox.movies[0].genre[0]}
                </Text>
                <Text style={styles.drawfonttag}>
                  {TopBox.movies[0].genre[1]}
                </Text>

                <Text style={styles.drawfonttag}>
                  {TopBox.movies[0].rating}/10
                </Text>
              </View>
              <Text style={styles.desc}>{TopBox.movies[0].desc}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      <View style={{marginHorizontal: 15, marginTop: 75, marginBottom: 75}}>
        <View>
          <FlatList
            data={MOVIE_GENRES}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <CategoriesBtn
                category={item.genre}
                color={item.color}
                onPress={() => handleGenrePress(item.genre)}
              />
            )}
          />
        </View>
        <BasicListCategories Akcru_Content={NewOnAkcru} />
        <BasicListCategories Akcru_Content={TopOnAkcru} />
        <LargeListCategories Akcru_Content={TrendingNow} />
        <BasicListCategories Akcru_Content={RecommendedForYou} />
        {/* <FullPageCategories Akcru_Content={allcategory} /> */}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
