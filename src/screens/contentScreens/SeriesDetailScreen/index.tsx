import {View, ScrollView, SafeAreaView, ActivityIndicator, Modal} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import BasicListCategories from '../../../components/BasicListCategories';
import {COLORS} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {addToWatchlist, findMovieById, findMovies, getUserReactions, getWatchlist} from '../../../lib/api/movies.lib';
import {IMovie, ISeries} from '../../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import ResultModal from '../../../components/ResultModal/ResultModal';
import useAuthStore from '../../../stores/auth.store';
import SeriesDetailCard from '../../../components/SeriesDetailCard';
import {findSeries, findSeriesById, getSeriesWatchlist} from '../../../lib/api/series.lib';

type SeriesDetailScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'SeriesDetailScreen'>;

type SeriesDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>;

type Props = {
    navigation: SeriesDetailScreenNavigationProp;
    route: SeriesDetailScreenRouteProp;
};

export default function SeriesDetailScreen({navigation}: Props) {
    const [movie, setMovie] = useState<IMovie[]>([]);
    const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);
    const [series, setSeries] = useState<ISeries[]>([]);
    const [isSeriesDataLoaded, setIsSeriesDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>>();
    const [randomMovies, setRandomMovies] = useState<IMovie[]>([]);
    const [randomSeries, setRandomSeries] = useState<ISeries[]>([]);

    const user = useAuthStore(state => state.user);

    useEffect(() => {
        // const fetchMovie = async () => {
        //     try {
        //         const id: string | undefined = routeParams.params?.id;
        //         if (id) {
        //             const fetchedMovie: IMovie | undefined = await findMovieById(id);
        //             if (fetchedMovie) {
        //                 setMovie([fetchedMovie]);
        //                 setIsMovieDataLoaded(true);
        //             } else {
        //                 setMovie([]);
        //                 setIsMovieDataLoaded(false);
        //             }
        //         }
        //     } catch (error) {
        //         console.error('Error fetching movie:', error);
        //         setIsMovieDataLoaded(false);
        //     }
        // };

        // const fetchRandomMovies = async () => {
        //     try {
        //         const allMovies: IMovie[] = await findMovies();

        //         const randomMovies: IMovie[] = [];
        //         while (randomMovies.length < 5) {
        //             const randomIndex = Math.floor(Math.random() * allMovies.length);
        //             const randomMovie = allMovies[randomIndex];
        //             if (!randomMovies.includes(randomMovie)) {
        //                 randomMovies.push(randomMovie);
        //             }
        //         }

        //         setRandomMovies(randomMovies);
        //     } catch (error) {
        //         console.error('Error fetching random movies:', error);
        //     }
        // };

        const fetchSeries = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedSeries: ISeries | undefined = await findSeriesById(id);
                    if (fetchedSeries) {
                        setSeries([fetchedSeries]);
                        setIsSeriesDataLoaded(true);
                    } else {
                        setSeries([]);
                        setIsSeriesDataLoaded(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching series:', error);
                setIsSeriesDataLoaded(false);
            }
        };

        fetchSeries();
        // fetchRandomMovies();
        // fetchMovie();
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
        years,
        yearsActive,
        rated,
        seasons,
        seriesTrailerURL,
        price,
    } = series[0] || {};

    // const [showAddToWatchListConfirmationModal, setShowAddToWatchListConfirmationModal] = useState(false);

    // const handleCancelAddToWatchList = () => {
    //     setShowAddToWatchListConfirmationModal(false);
    // };

    // const [watchlist, setWatchlist] = useState<ISeries[]>([]);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         const fetchWatchlist = async () => {
    //             try {
    //                 const userId = user?.id;
    //                 if (userId) {
    //                     const watchlistSeries = await getSeriesWatchlist(userId);
    //                     setWatchlist(watchlistSeries);
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching watchlist:', error);
    //             }
    //         };

    //         fetchWatchlist();
    //     }, [user?.id]),
    // );

    // const handleConfirmAddToWatchList = async () => {
    //     setShowAddToWatchListConfirmationModal(false);

    //     if (id) {
    //         const isSeriesInWatchlist = watchlist.some(series => series.id === id);

    //         if (isSeriesInWatchlist) {
    //             handleShowResultModal('alreadyInList');
    //         } else {
    //             setResult(true);

    //             const success = await addToWatchlist(id);
    //             if (success) {
    //                 setResult(false);
    //                 handleShowResultModal('success');
    //             } else {
    //                 setResult(false);
    //                 handleShowResultModal('failed');
    //             }
    //         }
    //     }
    // };

    const [result, setResult] = useState(false);
    const [typeResultModal, setTypeResultModal] = useState('');
    const [showResultModal, setShowResultModal] = useState(false);

    const handleShowResultModal = (typeResultModal: React.SetStateAction<string>) => {
        setTypeResultModal(typeResultModal);
        setShowResultModal(true);
    };

    // const handleCloseResultModal = () => {
    //     if (typeResultModal === 'success') {
    //         //do something
    //     }
    //     setShowResultModal(false);
    // };

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

                    {isSeriesDataLoaded ? (
                        <View style={{marginBottom: '5%'}}>
                            <View style={{marginTop: -65, marginBottom: 10}}>
                                <SeriesDetailCard
                                    reactions={reactions}
                                    portraitURL={portraitURL}
                                    title={title}
                                    years={years}
                                    yearsActive={yearsActive}
                                    rated={rated}
                                    rating={rating}
                                    description={description}
                                    actors={actors && actors.map(actor => actor.name).join(', ')}
                                    directors={director && director.map(director => director.name).join(', ')}
                                    id={id}
                                    seriesTrailerURL={seriesTrailerURL}
                                    landscapeURL={landscapeURL}
                                    price={price}
                                    seasons={seasons.length}
                                    genre1={genres[0]}
                                    genre2={genres[1]}
                                    contentButtonName="Play Series"
                                    playContent={() => {
                                        navigation2.navigate('ContentPlayer', {
                                            id: id,
                                            seriesTrailerURL: seriesTrailerURL,
                                            landscapeURL: landscapeURL,
                                        });
                                    }}
                                    PlayTrailer={() => {
                                        navigation2.navigate('SeriesTrailerPlayer', {
                                            id: id,
                                            seriesTrailerURL: seriesTrailerURL,
                                            landscapeURL: landscapeURL,
                                        });
                                    }}
                                    onPress={() => {
                                        navigation.navigate('MITDateSchedule', {
                                            id: id,
                                            title: title,
                                            portraitURL: portraitURL,
                                            year: years,
                                        });
                                    }}
                                    // watchlistButton={() => {
                                    //     setShowAddToWatchListConfirmationModal(true);
                                    // }}
                                    // showAddToWatchListConfirmationModal={showAddToWatchListConfirmationModal}
                                    // handleCancelAddToWatchList={handleCancelAddToWatchList}
                                    // handleConfirmAddToWatchList={handleConfirmAddToWatchList}
                                />
                            </View>
                            <View />

                            {/* <View style={{marginHorizontal: 15}}>
                                <BasicListCategories
                                    Akcru_Content={{
                                        id: 'recommendedForYou',
                                        title: 'Recommended by Akcru',
                                        movies: randomMovies,
                                    }}
                                />
                            </View> */}
                        </View>
                    ) : (
                        <View style={styles.activitycontainer}>
                            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                        </View>
                    )}
                </ScrollView>
                {/* <Modal animationType="fade" transparent={true} visible={showResultModal}>
                    <ResultModal closeModal={handleCloseResultModal} type={typeResultModal} />
                </Modal> */}
            </SafeAreaView>
        </TabContainer>
    );
}
