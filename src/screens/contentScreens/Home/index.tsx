import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
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
import {COLORS} from '../../../../assets/constants/index';
import styles from './styles';
import {CATEGORIES} from '../../../../assets/constants/Data';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { ClientStackParams } from '../../../navigation/ClientStack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';

const AllMovies = Akcru_Content[0];
const NewOnAkcru = Akcru_Content[1];
const TopOnAkcru = Akcru_Content[2];
const TrendingNow = Akcru_Content[3];
const RecommendedForYou = Akcru_Content[4];

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

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View>
        <Header />
      </View>
      {/* <View style={styles.videocontainer}>
        <TouchableWithoutFeedback
          onPress={() =>
            status.isPlaying
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }>
          <View>
            <Video
              ref={video}
              source={{
                uri: 'https://priymuscontent.s3.amazonaws.com/Movie+folder/Warrior.mp4',
              }}
              resizeMode={ResizeMode.COVER}
              isLooping
              volume={0}
              onPlaybackStatusUpdate={(status: {}) => setStatus(() => status)}
              style={styles.video}
            />
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
                <Text style={styles.bigTitle}>{AllMovies.movies[3].name}</Text>
                <View style={{flexDirection: 'row', marginVertical: 10}}>
                  <Text style={styles.drawfonttag}>
                    {AllMovies.movies[3].rated}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {AllMovies.movies[3].genre[0]}
                  </Text>

                  <Text style={styles.drawfonttag}>
                    {AllMovies.movies[3].rating}/10
                  </Text>
                </View>
                <Text style={styles.desc}>{AllMovies.movies[3].desc}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{marginRight: 10}}>
                  <AkcruButtons.MedButton
                    btnname={'Watch Movie'}
                    color={COLORS.AKCRUBLUE}
                    onPress={function (): void {}}
                  />
                </View>
                <View>
                  <AkcruButtons.MedButton
                    btnname={'Watch Trailer'}
                    color={COLORS.TAGCOLOR}
                    onPress={function (): void {}}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View> */}
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
