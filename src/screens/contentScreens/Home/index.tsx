import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import BasicListCategories from '../../../components/BasicListCategories';
import LargeListCategories from '../../../components/LargeListCategories';
import FullPageCategories from '../../../components/FullPageCategories';
import {Akcru_Content} from '../../../../assets/constants/ListData';
import Header from '../../../components/header';
import CategoriesBtn from '../../../components/CategoriesBtn';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../../../components/akcruButtons';

import {COLORS, SIZES} from '../../../../assets/constants/index';
import styles from './styles';
import {CATEGORIES} from '../../../../assets/constants/Data';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { ClientStackParams } from '../../../navigation/ClientStack';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-media-console';
import { SafeAreaView } from 'react-native-safe-area-context';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';





const HomeScreen = () => {
  
  const [newOnAkcru, setNewOnAkcru] = useState<IMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<IMovie[]>([]);
  const [yearMovies, setyearMovies] = useState<IMovie[]>([]);
  const [randomMovies, setRandomMovies] = useState<IMovie[]>([]); 
  const [topBox, setTopBox]= useState<IMovie[]>([]);
  const [topBoxIndex, setTopBoxIndex] = useState(2)

  const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    useEffect(() => {
        const fetchNewOnAkcru = async () => {
            try {
                const newUploads: IMovie[] = await findMovies(/* specify parameters if needed */);
                setNewOnAkcru(newUploads);
            } catch (error) {
                console.error('Error fetching new uploads:', error);
            }
        };

        const fetchTopRatedMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by rating in descending order
                const sortedMovies = allMovies.sort((a, b) => b.rating - a.rating);

                // Get the top 8 highest rated movies
                const top8RatedMovies = sortedMovies.slice(0, 8);

                setTopRatedMovies(top8RatedMovies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchyearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by rating in descending order
                const sortedMovies = allMovies.sort((a, b) => a.year - b.year);

                // Get the 5 oldest movies
                const Oldest5Movies = sortedMovies.slice(0, 5);

                setyearMovies(Oldest5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };

        const fetchRandomMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Get 5 random movies from the list
                const randomMovies: IMovie[] = [];
                while (randomMovies.length < 5) {
                    const randomIndex = Math.floor(Math.random() * allMovies.length);
                    const randomMovie = allMovies[randomIndex];
                    if (!randomMovies.includes(randomMovie)) {
                        randomMovies.push(randomMovie);
                    }
                }

                setRandomMovies(randomMovies);
            } catch (error) {
                console.error('Error fetching random movies:', error);
            }
        };

        const fetchTopBoxMovie = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by rating in descending order
                const sortedMovies = allMovies.sort((a, b) => b.rating - a.rating);

                // Get the top 8 highest rated movies
                const top8RatedMovies = sortedMovies.slice(0, 8);

                // Set the topBox state with the top rated movies
                setTopBox(top8RatedMovies);
                setIsMovieDataLoaded(true);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };
        fetchTopBoxMovie();
        fetchyearMovies();
        fetchTopRatedMovies();
        fetchNewOnAkcru();
        fetchRandomMovies();
    }, []);

  const handleGenrePress = (genre: string) => {
    navigation.navigate('SearchMovieResultScreen', {
      genre: genre,
    });
  };

   const handlePress = () => {
     navigation.navigate('ContentDetailScreen', {
         id: topBox[topBoxIndex]?.id, // Pass the appropriatemovie ID to the ContentDetailScreen
     });
   };

  return (
      <View>
          {isMovieDataLoaded ? (
              <ScrollView stickyHeaderIndices={[0]}>
                  <View>
                      <Header />
                  </View>
                  <Pressable style={styles.videocontainer} onPress={handlePress}>
                      <View style={{height: SIZES.ScreenHeight / 1.63}}>
                          <VideoPlayer
                              source={{
                                  uri: topBox[topBoxIndex]?.movieURL,
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
                              poster={topBox[topBoxIndex]?.portraitURL}
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
                                  <Text style={styles.bigTitle}>{topBox[topBoxIndex]?.title}</Text>
                                  <View style={{flexDirection: 'row', marginVertical: 10}}>
                                      <Text style={styles.drawfonttag}>{topBox[topBoxIndex]?.rated}</Text>
                                      <Text style={styles.drawfonttag}>
                                          {capitalizeFirstLetterOfString(topBox[topBoxIndex]?.genres[0])}
                                      </Text>
                                      <Text style={styles.drawfonttag}>
                                          {capitalizeFirstLetterOfString(topBox[topBoxIndex]?.genres[1])}
                                      </Text>

                                      <Text style={styles.drawfonttag}>{topBox[topBoxIndex]?.rating}/10</Text>
                                  </View>
                                  <Text style={styles.desc}>{topBox[topBoxIndex]?.description}</Text>
                              </View>
                          </View>
                      </View>
                  </Pressable>
                  <View style={{marginHorizontal: 15, marginTop: 75, marginBottom: 75}}>
                      {/* TODO: remove this.  */}
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
                      <BasicListCategories
                          Akcru_Content={{id: 'newOnAkcru', title: 'New on Akcru', movies: newOnAkcru}}
                      />
                      <BasicListCategories
                          Akcru_Content={{id: 'topRatedMovies', title: 'Top Rated on Akcru', movies: topRatedMovies}}
                      />
                      <LargeListCategories
                          Akcru_Content={{id: 'oldiesButGoodies', title: 'Oldies but Goodies', movies: yearMovies}}
                      />
                      <BasicListCategories
                          Akcru_Content={{id: 'recommendedForYou', title: 'Recommended by Akcru', movies: randomMovies}}
                      />
                      {/* <BasicListCategories Akcru_Content={TopOnAkcru} /> */}

                      {/* <BasicListCategories Akcru_Content={RecommendedForYou} /> */}
                      {/* <FullPageCategories Akcru_Content={allcategory} /> */}
                  </View>
              </ScrollView>
          ) : (
              <View style={styles.activitycontainer}>
                  <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
              </View>
          )}
      </View>
  );
};

export default HomeScreen;
