import {View, ScrollView, SafeAreaView, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import BasicListCategories from '../../../components/BasicListCategories';
import {COLORS} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {findMovies, getUserReactions} from '../../../lib/api/movies.lib';
import {IMovie, ITrailer} from '../../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import {getTrailerById} from '../../../lib/api/sizzles.lib';
import SizzleDetailCard from '../../../components/SizzleDetailCard';

type SizzleDetailScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'SizzleDetailScreen'>;

type SizzleDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SizzleDetailScreen'>;

type Props = {
    navigation: SizzleDetailScreenNavigationProp;
    route: SizzleDetailScreenRouteProp;
};

export default function SizzleDetailScreen({navigation}: Props) {
    const [sizzle, setSizzle] = useState<ITrailer[]>([]);
    const [isSizzleDataLoaded, setIsSizzleDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'SizzleDetailScreen'>>();
    const [randomMovies, setRandomMovies] = useState<IMovie[]>([]);

    const user = useAuthStore(state => state.user);

    useEffect(() => {
        const fetchSizzle = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedSizzle: ITrailer | undefined = await getTrailerById(id);
                    if (fetchedSizzle) {
                        setSizzle([fetchedSizzle]);
                        setIsSizzleDataLoaded(true);
                    } else {
                        setSizzle([]);
                        setIsSizzleDataLoaded(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
                setIsSizzleDataLoaded(false);
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
        fetchSizzle();
    }, [routeParams.params?.id]);

    const {id, title, description, portraitURL, landscapeURL, duration, trailerURL} = sizzle[0] || {};

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

                    {isSizzleDataLoaded ? (
                        <View style={{marginBottom: '5%'}}>
                            <View style={{marginTop: -65, marginBottom: 10}}>
                                <SizzleDetailCard
                                    reactions={reactions}
                                    portraitURL={portraitURL}
                                    title={title}
                                    duration={duration}
                                    description={description}
                                    id={id}
                                    trailerURL={trailerURL}
                                    landscapeURL={landscapeURL}
                                    contentButtonName="Play Movie"
                                    playContent={() => {
                                        navigation2.navigate('ContentPlayer', {
                                            id: id,
                                            movieURL: movieURL,
                                            landscapeURL: landscapeURL,
                                        });
                                    }}
                                    PlayTrailer={() => {
                                        navigation2.navigate('SizzlePlayer', {
                                            id: id,
                                            trailerURL: trailerURL,
                                            landscapeURL: landscapeURL,
                                        });
                                    }}
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
            </SafeAreaView>
        </TabContainer>
    );
}
