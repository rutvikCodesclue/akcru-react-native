import {View, ScrollView, SafeAreaView, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import {COLORS} from '../../../../assets/constants';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {getUserReactions} from '../../../lib/api/movies.lib';
import {IEpisode, ISeries} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import {findEpisodeById} from '../../../lib/api/series.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import EpisodeDetailCard from '../../../components/EpisodeDetailCard';

type EpisodeDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>;

type Props = {
    route: EpisodeDetailScreenRouteProp;
};

export default function EpisodeDetailScreen({route}: Props) {
    const [episode, setEpisode] = useState<IEpisode | null>(null);
    const [isEpisodeDataLoaded, setIsEpisodeDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>>();
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        const fetchEpisode = async () => {
            try {
                const episodeId: string | undefined = routeParams.params?.episodeId;
                if (episodeId) {
                    const fetchedEpisode: IEpisode | null = await findEpisodeById(episodeId);
                    if (fetchedEpisode) {
                        setEpisode(fetchedEpisode);
                        setIsEpisodeDataLoaded(true);
                    } else {
                        setEpisode(null);
                        setIsEpisodeDataLoaded(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching episode:', error);
                setIsEpisodeDataLoaded(false);
            }
        };

        fetchEpisode();
    }, [routeParams.params?.episodeId]);

    const [reactions, setReactions] = useState<string[]>([]);

    useEffect(() => {
        getUserReactions().then(fetchedReactions => {
            if (Array.isArray(fetchedReactions)) {
                setReactions(fetchedReactions);
            }
        });
    }, []);

    const navigation = useNavigation();

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
                    <View>
                        <Header />
                    </View>
                    {isEpisodeDataLoaded && episode ? (
                        <View style={{marginBottom: '5%'}}>
                            <View style={{marginTop: -65, marginBottom: 10}}>
                                <EpisodeDetailCard
                                    reactions={reactions}
                                    portraitURL={episode.portraitURL}
                                    title={episode.title}
                                    // year={episode.year}
                                    duration={episode.duration}
                                    description={episode.description}
                                    actors={episode.actors && episode.actors.map(actor => actor.name).join(', ')}
                                    directors={
                                        episode.director && episode.director.map(director => director.name).join(', ')
                                    }
                                    id={episode.id}
                                    trailerURL={episode.trailerURL}
                                    landscapeURL={episode.landscapeURL}
                                    movieURL={episode.episodeURL}
                                    episodeNumber={episode.episodeNumber}
                                    playButtonName="Play Episode"
                                    playEpisode={() => {
                                        console.log('Episode URL:', episode.episodeURL);
                                        navigation.navigate('EpisodePlayer', {
                                            seriesId: episode.seriesId, // Pass seriesId
                                            seasonId: episode.seasonId, // Pass seasonId
                                            episodeId: episode.id,
                                            episodeURL: episode.episodeURL,
                                            landscapeURL: episode.landscapeURL,
                                        });
                                    }}
                                    PlayTrailer={() => {
                                        navigation.navigate('TrailerPlayer', {
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
                                    // watchlistButton={() => {
                                    //     setShowAddToWatchListConfirmationModal(true);
                                    // }}
                                    // showAddToWatchListConfirmationModal={showAddToWatchListConfirmationModal}
                                    // handleCancelAddToWatchList={handleCancelAddToWatchList}
                                    // handleConfirmAddToWatchList={handleConfirmAddToWatchList}
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
