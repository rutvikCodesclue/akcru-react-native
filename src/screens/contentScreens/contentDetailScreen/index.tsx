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
import {
    addToWatchlist,
    buyMovie,
    findMovieById,
    findMovies,
    getMoviePurchaseStatus,
    getUserReactions,
    getWatchlist,
    IContentPurchaseStatus,
    rentMovie,
} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import ResultModal from '../../../components/ResultModal/ResultModal';
import useAuthStore from '../../../stores/auth.store';
import ContentPurchaseModal from '../../../components/ContentPurchaseModal';
import {getUserWallet} from '../../../lib/api/wallet.lib';
import ComfirmationModal from '../../../components/ConfirmationModal';

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

    const [confirmAction, setConfirmAction] = useState<'rent' | 'buy' | null>(null);

    const user = useAuthStore(state => state.user);
    // grab the raw string|null out of the store
    const rawBalance = useAuthStore(s => s.walletBalance);

    // coerce it to a number, defaulting to 0 if it was null or unparsable
    const balance = rawBalance != null ? Number(rawBalance) : 0;
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);

    useEffect(() => {
        getUserWallet()
            .then(b => {
                if (b !== undefined) {
                    setWalletBalance(b);
                }
            })
            .catch(e => console.error('wallet fetch failed', e));
    }, [setWalletBalance]);

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
        movieURL,
        duration,
        trailerURL,
        rentable,
        buyable,
        rentalPrice: rentalPriceStr,
        buyPrice: buyPriceStr,
        rentalDurationHrs = undefined,
    } = movie[0] || {};

    const playContent = () => {
        navigation2.navigate('ContentPlayer', {id, movieURL, landscapeURL, title});
    };

    const [purchaseStatus, setPurchaseStatus] = useState<IContentPurchaseStatus>({active: false});

    useEffect(() => {
        if (!id) return;
        (async () => {
            const status = await getMoviePurchaseStatus(id);
            setPurchaseStatus(status);
        })();
    }, [id]);

    const rentCost = rentalPriceStr != null ? Number(rentalPriceStr) : 0;
    const buyCost = buyPriceStr != null ? Number(buyPriceStr) : 0;

    const rentalLabel =
        rentable && rentCost && rentalDurationHrs ? `${rentalDurationHrs}h rental for ${rentCost} AD` : undefined;
    const buyLabel = buyable && buyCost ? `Buy for ${buyCost} AD` : undefined;

    // for the currently selected item:

    const canRent = balance >= rentCost;
    const canBuy = balance >= buyCost;

    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Determine primary button text
    const primaryText = purchaseStatus.active
        ? 'Play'
        : !rentable && !buyable
        ? 'Play for Free'
        : rentable && !buyable
        ? rentalLabel!
        : buyable && !rentable
        ? buyLabel!
        : 'Buy or Rent';

    // 6) New simplified “play or pay” gate:
    const handlePrimary = () => {
        // If it’s locked (active=false) and needs purchase …
        if (!purchaseStatus.active && (rentable || buyable)) {
            setShowPurchaseModal(true);
            return;
        }
        // otherwise just play
        playContent();
    };

    // 7) “Yes, I want to rent/buy” → queue up confirmation
    const handleRent = () => {
        setShowPurchaseModal(false);
        setConfirmAction('rent');
    };
    const handleBuy = () => {
        setShowPurchaseModal(false);
        setConfirmAction('buy');
    };

    // 8) After they confirm in the ConfirmationModal
    const runPurchase = async () => {
        if (!confirmAction) return;
        setConfirmAction(null);
        setIsProcessing(true);

        let ok = false;
        if (confirmAction === 'rent') {
            ok = await rentMovie(id!);
            if (ok) setPurchaseStatus({active: true}); // you can expand .purchase if you need it
        } else {
            ok = await buyMovie(id!);
            if (ok) setPurchaseStatus({active: true});
        }

        setIsProcessing(false);
        if (ok) playContent();
    };

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
                                    contentButtonName={isProcessing ? 'Processing…' : primaryText}
                                    playContent={handlePrimary}
                                    PlayTrailer={() => {
                                        navigation2.navigate('TrailerPlayer', {
                                            id: id,
                                            trailerURL: trailerURL,
                                            landscapeURL: landscapeURL,
                                            title,
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

                {!purchaseStatus.active && (rentable || buyable) && (
                    <ContentPurchaseModal
                        visible={showPurchaseModal}
                        onClose={() => setShowPurchaseModal(false)}
                        onRent={handleRent}
                        onBuy={handleBuy}
                        rentalLabel={rentalLabel}
                        buyLabel={buyLabel}
                        canRent={canRent}
                        canBuy={canBuy}
                        rentalPrice={rentCost}
                        buyPrice={buyCost}
                        balance={balance}
                    />
                )}
                {confirmAction != null && (
                    <Modal transparent animationType="fade" visible onRequestClose={() => setConfirmAction(null)}>
                        <ComfirmationModal
                            confirmationText={
                                confirmAction === 'rent'
                                    ? `Rent this movie for ${rentCost} AD? This cannot be undone.`
                                    : `Buy this movie for ${buyCost} AD? This cannot be undone.`
                            }
                            onPressYes={runPurchase}
                            onPressNo={() => setConfirmAction(null)}
                        />
                    </Modal>
                )}
            </SafeAreaView>
        </TabContainer>
    );
}
