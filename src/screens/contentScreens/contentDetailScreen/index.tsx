import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import styles from './styles';

import Header from '../../../components/header';
import MovieDetailCard from '../../../components/MovieDetailCard';
import BasicListCategories from '../../../components/BasicListCategories';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {ClientStackParams} from '../../../navigation/ClientStack';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { addToWatchlist, findMovieById, findMovies, getUserReactions, getWatchlist } from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { formatMovieDuration } from '../../../util/util';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { set } from 'lodash';
import ResultModal from '../../../components/ResultModal/ResultModal';
import useAuthStore from '../../../stores/auth.store';



type ContentDetailScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  'ContentDetailScreen'
>;

type ContentDetailScreenRouteProp = RouteProp<
  ClientStackParams,
  'ContentDetailScreen'
>;

type Props = {
  navigation: ContentDetailScreenNavigationProp;
  route: ContentDetailScreenRouteProp;
};

export default function ContentDetailScreen({navigation, route}: Props) {
    const movieId: string | undefined = route.params?.movieId ?? null;
    const [movie, setMovie] = useState<IMovie[]>([]);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<ClientStackParams, 'ContentDetailScreen'>>();
    const [randomMovies, setRandomMovies] = useState<IMovie[]>([]);

    const user = useAuthStore(state => state.user);

   useEffect(() => {
       const fetchMovie = async () => {
           try {
               const id: string | undefined = routeParams.params?.id;
               if (id) {
                   const fetchedMovie: IMovie | undefined = await findMovieById(id);
                   if (fetchedMovie) {
                       setMovie([fetchedMovie]);
                       setIsMovieDataLoaded(true); // Data fetched successfully
                   } else {
                       setMovie([]);
                       setIsMovieDataLoaded(false); // Data not found
                   }
               }
           } catch (error) {
               console.error('Error fetching movie:', error);
               setIsMovieDataLoaded(false); // Error occurred during fetching
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
       fetchRandomMovies();
       fetchMovie();
   }, [routeParams.params?.id]);

    const {
        id,
        title,
        description,
        actors,
        director,
        genres,
        portraitURL,
        landscapeURL,
        rating,
        year,
        rated,
        length,
        movieURL,
        duration,
        trailerURL,
    } = movie[0] || {};

    const [showAddToWatchListConfirmationModal, setShowAddToWatchListConfirmationModal] = useState(false);

    const handleCancelAddToWatchList = () => {
        setShowAddToWatchListConfirmationModal(false);
        // Handle cancel logic
    };

    const [watchlist, setWatchlist] = useState<IMovie[]>([]); // State to store the watchlist data

    // Fetch the watchlist when the component is focused or when the user ID changes
    useFocusEffect(
        React.useCallback(() => {
            // ... (other code)

            const fetchWatchlist = async () => {
                try {
                    const userId = user?.id; // Get the current user's ID
                    if (userId) {
                        const watchlistMovies = await getWatchlist(userId);
                        setWatchlist(watchlistMovies);
                    }
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                }
            };

            fetchWatchlist();
        }, [user?.id]), // Re-run the effect if the user's ID changes
    );

    const handleConfirmAddToWatchList = async () => {
        setShowAddToWatchListConfirmationModal(false);

        if (id) {
            // Check if the movie is already in the watchlist
            const isMovieInWatchlist = watchlist.some(movie => movie.id === id);

            if (isMovieInWatchlist) {
                // If the movie is already in the watchlist, show the message
                handleShowResultModal('alreadyInList');
            } else {
                setResult(true);
                // Ensure that the movie ID is available
                const success = await addToWatchlist(id);
                if (success) {
                    // Handle the UI or state updates for successful addition
                    setResult(false);
                    handleShowResultModal('success');
                } else {
                    setResult(false);
                    handleShowResultModal('failed');
                }
            }
        }
    };

     const [result, setResult] = useState(false);
    const [typeResultModal, setTypeResultModal] = useState('');
    const [showResultModal, setShowResultModal] = useState(false);

    const handleShowResultModal = (typeResultModal: React.SetStateAction<string>) => {
        setTypeResultModal(typeResultModal);
        setShowResultModal(true);
    };

    const handleCloseResultModal = () => {
        if (typeResultModal === 'success') {
            //do something
        }
        setShowResultModal(false);
    };
        console.log('Movie Title:',title, year )
        
const [reactions, setReactions] = useState<string[]>([]); // Initialize as an empty array of strings

useEffect(() => {
    getUserReactions().then(fetchedReactions => {
        console.log('Fetched Reactions:', fetchedReactions); // Log for debugging
        if (Array.isArray(fetchedReactions)) {
            setReactions(fetchedReactions);
        }
    });
}, []);

    
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View>
                        <Header />
                    </View>

                    {isMovieDataLoaded ? (
                        <View style={{marginBottom: 75}}>
                            <View style={{marginTop: -65, marginBottom: 10}}>
                                <MovieDetailCard
                                    reactions={reactions} // Pass the reactions here
                                    portraitURL={portraitURL}
                                    title={title}
                                    year={year}
                                    duration={duration}
                                    rated={rated}
                                    rating={rating}
                                    description={description}
                                    actors={actors && actors.map(actor => actor.name).join(', ')}
                                    directors={director && director.map(director => director.name).join(', ')}
                                    id={id}
                                    // trailerURL={trailerURL}
                                    landscapeURL={landscapeURL}
                                    movieURL={movieURL}
                                    genre1={genres[0]}
                                    genre2={genres[1]}
                                    onPressin={() => {
                                        navigation2.navigate('ContentPlayer', {
                                            id: id,
                                            movieURL: movieURL,
                                            landscapeURL: landscapeURL,
                                        });
                                    }}
                                    PlayTrailer={() => {
                                        navigation2.navigate('TrailerPlayer', {
                                            id: id,
                                            trailerURL: trailerURL,
                                            landscapeURL: landscapeURL,
                                        });
                                    }}
                                    onPress={() => {
                                        navigation.navigate('MITDateSchedule', {
                                            id: id,
                                            title: title,
                                            portraitURL: portraitURL,
                                            year: year,
                                        });
                                        console.log('Movie Title:', id, description);
                                    }}
                                    watchlistButton={() => {
                                        setShowAddToWatchListConfirmationModal(true);
                                    }}
                                    showAddToWatchListConfirmationModal={showAddToWatchListConfirmationModal}
                                    handleCancelAddToWatchList={handleCancelAddToWatchList}
                                    handleConfirmAddToWatchList={handleConfirmAddToWatchList}
                                />
                            </View>
                            <View></View>

                            <View style={{marginHorizontal: 15}}>
                                <BasicListCategories
                                    Akcru_Content={{
                                        id: 'recommendedForYou',
                                        title: 'Recommended by Akcru',
                                        movies: randomMovies,
                                    }}
                                />
                            </View>
                            {/* <View style={{marginHorizontal: 15}}>
                            <Text style={{...FONTS.Title2, marginVertical: 10}}>Akcru Review</Text>
                            <View style={{marginBottom: 75}}>
                                <View>
                                    {FAKE_USER_PROFILES.map(item => (
                                        <View key={item.userID} style={{marginBottom: 10}}>
                                            <AkcruReviewCard
                                                userPicture={item.userPicture}
                                                userName={item.userName}
                                                movieReview={item.movieReview}
                                                movieReviewDate={item.movieReviewDate}
                                                userID={item.userID}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={'placeholder'}
                                        placeholderTextColor={'transparent'}
                                        style={styles.textinput}
                                    />
                                </View>
                                <View style={{alignItems: 'flex-end'}}>
                                    <AkcruButtons.XSmallButton
                                        btnname={'POST'}
                                        onPress={function (): void {}}
                                        color=""
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        </View> */}
                        </View>
                    ) : (
                        <View style={styles.activitycontainer}>
                            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                        </View>
                    )}
                </ScrollView>
                <Modal animationType="fade" transparent={true} visible={showResultModal}>
                    <ResultModal closeModal={handleCloseResultModal} type={typeResultModal} />
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
}
