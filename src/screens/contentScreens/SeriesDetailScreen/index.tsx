import {View, ScrollView, SafeAreaView, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import {COLORS} from '../../../../assets/constants';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {getUserReactions} from '../../../lib/api/movies.lib';
import {ISeries} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import SeriesDetailCard from '../../../components/SeriesDetailCard';
import {findSeriesById, findSeriesWithEpisodes} from '../../../lib/api/series.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';

type SeriesDetailScreenRouteProp = RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>;

type Props = {
    route: SeriesDetailScreenRouteProp;
};

export default function SeriesDetailScreen({route}: Props) {
    const [series, setSeries] = useState<ISeries | null>(null);
    const [isSeriesDataLoaded, setIsSeriesDataLoaded] = useState(false);
    const routeParams = useRoute<RouteProp<NoBottomTabStackParams, 'SeriesDetailScreen'>>();
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const id: string | undefined = routeParams.params?.id;
                if (id) {
                    const fetchedSeries: ISeries | null = await findSeriesWithEpisodes(id);
                    if (fetchedSeries) {
                        setSeries(fetchedSeries);
                        setIsSeriesDataLoaded(true);
                    } else {
                        setSeries(null);
                        setIsSeriesDataLoaded(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching series:', error);
                setIsSeriesDataLoaded(false);
            }
        };

        fetchSeries();
    }, [routeParams.params?.id]);

    const [reactions, setReactions] = useState<string[]>([]);

    useEffect(() => {
        getUserReactions().then(fetchedReactions => {
            if (Array.isArray(fetchedReactions)) {
                setReactions(fetchedReactions);
            }
        });
    }, []);

    const navigation = useNavigation();

    const handlePlaySeries = () => {
        if (series && series.seasons.length > 0 && series.seasons[0].episodes.length > 0) {
            const firstEpisode = series.seasons[0].episodes[0];
            navigation.navigate('EpisodePlayer', {
                seriesId: series.id,
                seasonId: firstEpisode.seasonId,
                episodeId: firstEpisode.id,
                episodeURL: firstEpisode.episodeURL,
                landscapeURL: firstEpisode.landscapeURL,
            });
        }
    };

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
                    <View>
                        <Header />
                    </View>
                    {isSeriesDataLoaded && series ? (
                        <View style={{marginBottom: '5%'}}>
                            <View style={{marginTop: -65, marginBottom: 10}}>
                                <SeriesDetailCard
                                    reactions={reactions}
                                    portraitURL={series.portraitURL}
                                    title={series.title}
                                    years={series.years}
                                    yearsActive={series.yearsActive}
                                    rated={series.rated}
                                    rating={series.rating}
                                    description={series.description}
                                    actors={series.actors.map(actor => actor.name).join(', ')}
                                    directors={series.director.map(director => director.name).join(', ')}
                                    id={series.id}
                                    seriesTrailerURL={series.seriesTrailerURL}
                                    landscapeURL={series.landscapeURL}
                                    price={series.price}
                                    seasons={series.seasons}
                                    episodes={series.seasons.flatMap(season => season.episodes)}
                                    genre1={series.genres[0]}
                                    genre2={series.genres[1]}
                                    contentButtonName="Play Series"
                                    playSeries={handlePlaySeries}
                                    PlayTrailer={() => {
                                        navigation.navigate('SeriesTrailerPlayer', {
                                            id: series.id,
                                            seriesTrailerURL: series.seriesTrailerURL,
                                            landscapeURL: series.landscapeURL,
                                        });
                                    }}
                                    onPress={() => {
                                        navigation.navigate('MITDateSchedule', {
                                            id: series.id,
                                            title: series.title,
                                            portraitURL: series.portraitURL,
                                            year: series.years,
                                        });
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
