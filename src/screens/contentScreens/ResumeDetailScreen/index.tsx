import {View, ScrollView, SafeAreaView, ActivityIndicator} from 'react-native';
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
import {
    addToWatchlist,
    findMovieById,
    findMovies,
    getUserReactions,
    getWatchlist,
    removeFromWatchlist,
} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import {navigateToMITDateSchedule} from '../../../util/RootNavigation';

type ResumeDetailScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ResumeDetailScreen'>;

type ResumeDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'ResumeDetailScreen'>;

type Props = {
    navigation: ResumeDetailScreenNavigationProp;
    route: ResumeDetailScreenRouteProp;
};

export default function ResumeDetailScreen({navigation}: Props) {
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

    const [watchlist, setWatchlist] = useState<IMovie[]>([]);
    const isCurrentMovieInWatchlist = !!id && watchlist.some(movie => movie.id === id);
    const [isProcessingWatchlist, setIsProcessingWatchlist] = useState(false);

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

    /**
     * Tap toggles the watchlist directly — no confirmation/result dialogs.
     * The heart icon re-renders from `isCurrentMovieInWatchlist` once the
     * API call resolves. Guards against rapid double-taps.
     */
    const handleWatchlistIconPress = async () => {
        if (!id || isProcessingWatchlist) {
            return;
        }
        setIsProcessingWatchlist(true);
        try {
            if (isCurrentMovieInWatchlist) {
                const success = await removeFromWatchlist(id);
                if (success) {
                    setWatchlist(prev => prev.filter(m => m.id !== id));
                }
            } else {
                const success = await addToWatchlist(id);
                if (success && movie[0]) {
                    setWatchlist(prev => (prev.some(m => m.id === id) ? prev : [...prev, movie[0]]));
                }
            }
        } catch (error) {
            console.error('ResumeDetailScreen: watchlist toggle failed', error);
        } finally {
            setIsProcessingWatchlist(false);
        }
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
            <SafeAreaView style={styles.screenContainer}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContent}>
                    <View>
                        <Header />
                    </View>

                    {isMovieDataLoaded ? (
                        <View style={styles.detailBody}>
                            <View style={styles.heroCardWrap}>
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
                                    contentButtonName="Resume Movie"
                                    playContent={() => {
                                        navigation2.navigate('ResumePlayer', {
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
                                        navigateToMITDateSchedule(
                                            {
                                                id: id,
                                                title: title,
                                                portraitURL: portraitURL,
                                                year: year,
                                            },
                                            navigation,
                                        );
                                    }}
                                    watchlistButton={handleWatchlistIconPress}
                                    isInWatchlist={isCurrentMovieInWatchlist}
                                />
                            </View>
                            <View />

                            <View style={styles.recommendedWrap}>
                                <BasicListCategories
                                    variant="highlight"
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
            </SafeAreaView>
        </TabContainer>
    );
}
