import {View, ScrollView, SafeAreaView, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import {COLORS} from '../../../../assets/constants';
import {RouteProp} from '@react-navigation/native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {getUserReactions} from '../../../lib/api/movies.lib';
import {IEpisode} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import {findEpisodeById} from '../../../lib/api/series.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import EpisodeDetailCard from '../../../components/EpisodeDetailCard';
import {navigateToMITDateSchedule} from '../../../util/RootNavigation';
import AkcruButtons from '../../../components/akcruButtons';

type EpisodeDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>;

export default function EpisodeDetailScreen() {
    const [episode, setEpisode] = useState<IEpisode | null>(null);
    const [isEpisodeDataLoaded, setIsEpisodeDataLoaded] = useState(false);
    const routeParams = useRoute<EpisodeDetailScreenRouteProp>();
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
    const handlePlayEpisode = () => {
        if (!episode) return;
        console.log('Episode URL:', episode.episodeURL);
        navigation.navigate('EpisodePlayer', {
            seriesId: episode.seriesId,
            seasonId: episode.seasonId,
            episodeId: episode.id,
            episodeURL: episode.episodeURL,
            landscapeURL: episode.landscapeURL,
        });
    };

    return (
        <TabContainer>
            <SafeAreaView style={styles.screenContainer}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    style={styles.screenContainer}>
                    <View style={styles.headerContainer}>
                        <Header />
                    </View>
                    {isEpisodeDataLoaded && episode ? (
                        <View style={styles.detailsCardContainer}>
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
                                    seasonId={episode.seasonId}
                                    seriesId={episode.seriesId}
                                    episodeNumber={episode.episodeNumber}
                                    playButtonName="Play Episode"
                                    playEpisode={handlePlayEpisode}
                                    showPlayButton={false}
                                    PlayTrailer={() => {
                                        navigation.navigate('TrailerPlayer', {
                                            id: episode.id,
                                            trailerURL: episode.trailerURL || episode.episodeURL,
                                            landscapeURL: episode.landscapeURL || episode.portraitURL,
                                        });
                                    }}
                                    onPress={() => {
                                        if (!episode) {
                                            return;
                                        }
                                        navigateToMITDateSchedule(
                                            {
                                                id: episode.id,
                                                title: episode.title,
                                                portraitURL: episode.portraitURL,
                                            },
                                            navigation,
                                        );
                                    }}
                                />
                        </View>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                        </View>
                    )}
                </ScrollView>

                {isEpisodeDataLoaded && episode ? (
                    <View style={styles.bottomActionContainer}>
                        <AkcruButtons.LrgButton
                            btnname="Play Episode"
                            onPress={handlePlayEpisode}
                            color={COLORS.AKCRUBLUE}
                            disabled={false}
                            variant="auth"
                        />
                    </View>
                ) : null}
            </SafeAreaView>
        </TabContainer>
    );
}
