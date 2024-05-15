import {View, ScrollView, SafeAreaView, ActivityIndicator, Modal} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import MovieDetailCard from '../../../components/MovieDetailCard';
import BasicListCategories from '../../../components/BasicListCategories';
import {COLORS} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {addToWatchlist, findMovieById, findMovies, getUserReactions, getWatchlist} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import ResultModal from '../../../components/ResultModal/ResultModal';
import useAuthStore from '../../../stores/auth.store';

type ContentDetailScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ContentDetailScreen'>;

type ContentDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'ContentDetailScreen'>;

type Props = {
    navigation: ContentDetailScreenNavigationProp;
    route: ContentDetailScreenRouteProp;
};

export default function ContentDetailScreen({navigation}: Props) {
    const [movie, setMovie] = useState<IMovie[]>([]);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'ContentDetailScreen'>>();
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
                        setIsMovieDataLoaded(true);
                    } else {
                        setMovie([]);
                        setIsMovieDataLoaded(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
                setIsMovieDataLoaded(false);
            }
        };

        const fetchRandomMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies();

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
    };

    const [watchlist, setWatchlist] = useState<IMovie[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchWatchlist = async () => {
                try {
                    const userId = user?.id;
                    if (userId) {
                        const watchlistMovies = await getWatchlist(userId);
                        setWatchlist(watchlistMovies);
                    }
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                }
            };

            fetchWatchlist();
        }, [user?.id]),
    );

    const handleConfirmAddToWatchList = async () => {
        setShowAddToWatchListConfirmationModal(false);

        if (id) {
            const isMovieInWatchlist = watchlist.some(movie => movie.id === id);

            if (isMovieInWatchlist) {
                handleShowResultModal('alreadyInList');
            } else {
                setResult(true);

                const success = await addToWatchlist(id);
                if (success) {
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

    const [reactions, setReactions] = useState<string[]>([]);

    useEffect(() => {
        getUserReactions().then(fetchedReactions => {
            if (Array.isArray(fetchedReactions)) {
                setReactions(fetchedReactions);
            }
        });
    }, []);

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
                    <View>
                        <Header />
                    </View>

                    {isMovieDataLoaded ? (
                        <View style={{marginBottom: '5%'}}>
                            <View style={{marginTop: -65, marginBottom: 10}}>
                                <MovieDetailCard
                                    reactions={reactions}
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
                                    trailerURL={trailerURL}
                                    landscapeURL={landscapeURL}
                                    movieURL={movieURL}
                                    genre1={genres[0]}
                                    genre2={genres[1]}
                                    contentButtonName="Play Movie"
                                    playContent={() => {
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
                                    }}
                                    watchlistButton={() => {
                                        setShowAddToWatchListConfirmationModal(true);
                                    }}
                                    showAddToWatchListConfirmationModal={showAddToWatchListConfirmationModal}
                                    handleCancelAddToWatchList={handleCancelAddToWatchList}
                                    handleConfirmAddToWatchList={handleConfirmAddToWatchList}
                                />
                            </View>
                            <View />

                            <View style={{marginHorizontal: 15}}>
                                <BasicListCategories
                                    Akcru_Content={{
                                        id: 'recommendedForYou',
                                        title: 'Recommended by Akcru',
                                        movies: randomMovies,
                                    }}
                                />
                            </View>
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
