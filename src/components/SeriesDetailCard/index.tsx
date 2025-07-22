import {View, Text, TouchableOpacity, Image, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import styles from './styles';
import {Icon} from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../akcruButtons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import {capitalizeFirstLetterOfString, formatMovieDuration} from '../../util/util';
import {API} from '../../clients/api.client';
import CustomIcon from '../CustomIcon/CustomIcon';
import Orientation from 'react-native-orientation-locker';

type Episode = {
    id: string;
    title: string;
    episodeNumber: number;
    duration: number;
    landscapeURL?: string;
    seasonId: string;
    episodeURL: string;
    portraitURL: string;
    description: string;
    actors: string;
    directors: string;
    reactions: any;
};

type ReactionStat = {
    type: string;
    percentage: string;
};

type CombinedReaction = {
    type: string;
    percentage: string;
};

type SeriesDetailCardProps = {
    title: string;
    years: number;
    yearsActive: string;
    rated: string;
    rating: number;
    description: string;
    actors: string;
    directors: string;
    id: string;
    portraitURL: string;
    seriesTrailerURL: string;
    landscapeURL: string;
    genre1: string;
    genre2: string;
    onPress: () => void;
    playSeries: () => void;
    showAddToWatchListConfirmationModal: boolean;
    handleCancelAddToWatchList: () => void;
    handleConfirmAddToWatchList: () => void;
    watchlistButton: () => void;
    PlayTrailer: () => void;
    reactions: any;
    contentButtonName: string;
    duration: number;
    seasons: {id: string; seasonNumber: number}[];
    episodes: Episode[];

    selectedSeasonId: string;
    onSelectSeason: (seasonId: string) => void;
    seasonUnlocked: boolean;
    onRent: () => void;
    onBuy: () => void;
    rentalLabel?: string;
    buyLabel?: string;
    onLockedPress: () => void;
};

const SeriesDetailCard = ({
    id: seriesId,
    title,
    years,
    yearsActive,
    rated,
    rating,
    description,
    actors,
    directors,
    portraitURL,
    seriesTrailerURL,
    landscapeURL,
    genre1,
    genre2,
    onPress,
    playSeries,
    watchlistButton,
    showAddToWatchListConfirmationModal,
    handleCancelAddToWatchList,
    handleConfirmAddToWatchList,
    PlayTrailer,
    reactions,
    contentButtonName,
    duration,
    seasons,
    episodes,
    selectedSeasonId,
    onSelectSeason,
    seasonUnlocked,
    onRent,
    onBuy,
    rentalLabel,
    buyLabel,
    onLockedPress,
}: SeriesDetailCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [reactionStats, setReactionStats] = useState<ReactionStat[]>([]);
    const [combinedReactions, setCombinedReactions] = useState<CombinedReaction[]>([]);

    const handleSeasonSelect = (seasonId: string) => {
        onSelectSeason(seasonId);
    };

    useEffect(() => {
        // console.log('Episodes:', episodes); // Check structure of episodes
        console.log('Selected Season ID:', selectedSeasonId); // Check selected season ID
    }, [episodes, selectedSeasonId]);

    const filteredEpisodes = episodes
        ? episodes
              .filter(episode => episode.seasonId === selectedSeasonId)
              .sort((a, b) => a.episodeNumber - b.episodeNumber)
        : [];

    const renderSeasonButton = ({item}: {item: {id: string; seasonNumber: number}}) => (
        <TouchableOpacity
            style={[styles.seasonfonttag, selectedSeasonId === item.id && styles.selectedSeasonButton]}
            onPress={() => handleSeasonSelect(item.id)}>
            <Text style={styles.seasonButtonText}>{`Season ${item.seasonNumber}`}</Text>
        </TouchableOpacity>
    );

    // console.log('Filtered Episodes:', filteredEpisodes); // Check filtered episodes

    const renderEpisode = ({item}: {item: Episode}) => (
        <View style={{marginTop: 10}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{marginRight: 10}}>
                    <TouchableOpacity
                        onPress={() => {
                            if (seasonUnlocked) {
                                navigation.navigate('EpisodePlayer', {
                                    seriesId: id,
                                    seasonId: item.seasonId,
                                    episodeId: item.id,
                                });
                            } else {
                                onLockedPress();
                            }
                        }}>
                        <View style={{position: 'absolute', zIndex: 20, top: -8, left: SIZES.ScreenWidth * 0.05}}>
                            <CustomIcon
                                name={seasonUnlocked ? 'play-circle' : 'lock-closed'}
                                color={seasonUnlocked ? COLORS.TRANSPINK : COLORS.TRANSPINK}
                                type="ionicon"
                                baseSize={60}
                            />
                        </View>
                        <Image
                            source={{uri: item.landscapeURL}}
                            style={{
                                height: SIZES.ScreenWidth * 0.2,
                                width: SIZES.ScreenWidth * 0.3,
                                borderRadius: 5,
                                opacity: seasonUnlocked ? 1 : 0.5,
                            }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{...FONTS.Title2}}>{`Ep. ${item.episodeNumber}`}</Text>
                    <Text style={{...FONTS.Title2}}>{item.title}</Text>
                    <Text style={{...FONTS.paragraph1}}> {formatMovieDuration(item.duration)}</Text>
                    {seasonUnlocked && (
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('EpisodeDetailScreen', {
                                    seriesId,
                                    seasonId: item.seasonId,
                                    episodeId: item.id,
                                });
                            }}>
                            <Text style={{...FONTS.Title2, color: COLORS.PINK, marginTop: 10}}>Details</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={{marginTop: 10}}>
                <Text style={{...FONTS.Title2}}>
                    {item.description.length > 150 ? `${item.description.substring(0, 150)}...` : item.description}
                </Text>
            </View>
        </View>
    );

    const renderSeparator = () => <View style={styles.lineSeperator} />;

    useEffect(() => {
        const fetchReactionStats = async () => {
            try {
                const response = await API.get(`/v1/series/${seriesId}/reaction-stats`);
                if (response.data && response.data.success) {
                    setReactionStats(response.data.reactionStats);
                    console.log('Reaction Stats:', response.data.reactionStats);
                }
            } catch (error) {
                console.error('Error fetching reaction statistics:', error);
            }
        };

        fetchReactionStats();
    }, [seriesId]);

    useEffect(() => {
        const fetchUserReaction = async () => {
            try {
                const response = await API.get(`/v1/series/${seriesId}/user-reaction`);
                if (response.data && response.data.success) {
                    setSelectedReaction(response.data.reaction);
                }
            } catch (error) {
                console.error('Error fetching user reaction:', error);
            }
        };

        fetchUserReaction();
    }, [seriesId]);

    const postReaction = async (reactionType: string | null) => {
        try {
            const response = await API.post(`/v1/series/${seriesId}/reactions`, {reactionType});
            console.log('Reaction posted:', response.data);

            setSelectedReaction(reactionType);
            console.log('Selected Reaction State:', selectedReaction);
        } catch (error) {
            console.error('Error posting reaction:', error);
        }
    };

    const handleReactionClick = (reactionType: string | null) => {
        if (selectedReaction !== reactionType) {
            postReaction(reactionType);
        }
    };

    const getIconForReaction = (reactionType: string | null) => {
        let color = COLORS.LIGHTGREY;
        if (reactionType === selectedReaction) {
            color = COLORS.PURPLE;
        }

        return (
            <Icon
                key={selectedReaction}
                name={reactionType === 'LOVE' ? 'heart' : reactionType === 'LIKE' ? 'thumbs-up' : 'thumbs-down'}
                type="ionicon"
                size={20}
                color={color}
            />
        );
    };

    useEffect(() => {
        if (Array.isArray(reactions) && reactionStats) {
            const updatedReactions: CombinedReaction[] = reactions.map(reaction => {
                const stats = reactionStats.find((stat: ReactionStat) => stat.type === reaction) || {percentage: '0'};
                return {
                    type: reaction,
                    percentage: stats.percentage,
                };
            });
            setCombinedReactions(updatedReactions);
        }
    }, [reactions, reactionStats]);

    return (
        <View>
            <View>
                <View>
                    <Image
                        source={{uri: portraitURL}}
                        style={{
                            height: SIZES.ScreenHeight / 1.6,
                        }}
                        resizeMode="cover"
                    />
                </View>

                <View
                    style={{
                        height: '35%',
                        justifyContent: 'flex-end',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}>
                    <LinearGradient
                        colors={[COLORS.BLACK, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: SIZES.ScreenHeight / 1.5,
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            Orientation.lockToPortrait();
                            navigation.pop();
                        }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: SIZES.ScreenHeight * -0.4,
                            marginHorizontal: 15,
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                        </View>
                    </TouchableOpacity>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginHorizontal: 10,
                        }}>
                        <AkcruButtons.MedButton
                            btnname={contentButtonName}
                            onPress={playSeries}
                            color={COLORS.AKCRUBLUE}
                            disabled={false}
                        />

                        <AkcruButtons.MedButton
                            btnname={'Watch Trailer'}
                            onPress={() => {
                                console.log({
                                    id: seriesId,
                                    seriesTrailerURL: seriesTrailerURL,
                                    landscapeURL: landscapeURL,
                                });
                                navigation.navigate('SeriesTrailerPlayer', {
                                    id: seriesId,
                                    trailerURL: seriesTrailerURL,
                                    landscapeURL: landscapeURL,
                                });
                            }}
                            color={COLORS.CATPURPDRK}
                            disabled={false}
                        />
                    </View>
                </View>
            </View>

            <View style={{marginTop: 20, marginBottom: 15}}>
                <View
                    style={{
                        marginHorizontal: 15,
                        justifyContent: 'space-between',
                        marginBottom: 10,
                    }}>
                    <View style={{width: '100%'}}>
                        <Text style={{...FONTS.ContentTitle}}>{title}</Text>
                    </View>
                </View>
                <View
                    style={{
                        marginHorizontal: 15,
                        flexDirection: 'row',
                        marginVertical: 5,
                        alignItems: 'center',
                    }}>
                    <View style={{marginRight: 10}}>
                        <Text style={{...FONTS.paragraph1}}>{yearsActive}</Text>
                    </View>
                    <View style={{marginRight: 10}}>
                        <Text style={{...FONTS.paragraph1}}>Seasons {seasons.length}</Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                        }}>
                        <Text style={styles.drawfonttag}>{rated}</Text>
                        <Text style={styles.drawfonttag}>{capitalizeFirstLetterOfString(genre1)}</Text>
                        <Text style={styles.drawfonttag}>{capitalizeFirstLetterOfString(genre2)}</Text>
                        <Text style={styles.drawfonttag}>{rating}/10</Text>
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        width: '100%',
                        alignContent: 'center',
                        marginVertical: 10,
                    }}>
                    {combinedReactions.map(reaction => (
                        <TouchableOpacity
                            onPress={() => handleReactionClick(reaction.type)}
                            key={reaction.type}
                            style={{alignItems: 'center'}}>
                            {getIconForReaction(reaction.type)}
                            <Text style={{...FONTS.paragraph1}}>
                                {capitalizeFirstLetterOfString(reaction.type)} {reaction.percentage}%
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{marginHorizontal: 15, marginTop: 15}}>
                    <Text
                        style={{
                            ...FONTS.Title2Orange,
                            color: COLORS.LIGHTGREY,
                            lineHeight: 18,
                            marginBottom: 10,
                        }}>
                        {description}
                    </Text>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                        <Text
                            style={{
                                ...FONTS.Title2Orange,
                                color: COLORS.AKCRUBLUE,
                            }}>
                            <Text style={{color: COLORS.DARKGREY}}>Cast:</Text> {actors}
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        <Text
                            style={{
                                ...FONTS.Title2Orange,
                                color: COLORS.AKCRUBLUE,
                            }}>
                            <Text style={{color: COLORS.DARKGREY}}>Directors:</Text> {directors}
                        </Text>
                    </View>
                    <View style={{marginTop: 20}}>
                        <FlatList
                            data={seasons}
                            renderItem={renderSeasonButton}
                            keyExtractor={item => item.id}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{marginTop: 10}}
                        />
                    </View>
                    <FlatList
                        data={filteredEpisodes}
                        renderItem={renderEpisode}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{marginTop: 10}}
                        ItemSeparatorComponent={renderSeparator}
                    />
                </View>
            </View>
        </View>
    );
};

export default SeriesDetailCard;
