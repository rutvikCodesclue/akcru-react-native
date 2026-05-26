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
import { isTablet } from '../../../assets/constants/theme';

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

    // In the renderEpisode function, replace the navigation call:

    const renderEpisode = ({item}: {item: Episode}) => (
        <View style={{marginTop: 10}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{marginRight: 10}}>
                    <TouchableOpacity
                        onPress={() => {
                            if (seasonUnlocked) {
                                console.log('Navigating to EpisodePlayer with:', {
                                    seriesId: seriesId, // Use seriesId prop consistently
                                    seasonId: item.seasonId,
                                    episodeId: item.id,
                                    episode: item, // Pass the full episode object
                                });
                                navigation.navigate('EpisodePlayer', {
                                    seriesId: seriesId, // Changed from 'id' to 'seriesId'
                                    seasonId: item.seasonId,
                                    episodeId: item.id,
                                    episode: item, // Pass the full episode object
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
                                baseSize={isTablet() ? 120 :60}
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

    const renderMetaChip = (label: string) => (
        <LinearGradient
            colors={['#7DD3FC', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3']}
            locations={[0, 0.32, 0.68, 1]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.metaChipGradientBorder}>
            <View style={styles.metaChipInner}>
                <Text style={styles.drawfonttag}>{label}</Text>
            </View>
        </LinearGradient>
    );

    const handleBackPress = () => {
        Orientation.lockToPortrait();
        navigation.pop();
    };

    return (
        <View>
            <View>
                <View style={styles.heroSection}>
                    <View style={styles.heroFrameWrap}>
                        <LinearGradient
                            colors={['#7DD3FC', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3']}
                            locations={[0, 0.32, 0.68, 1]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.heroFrameGradient}>
                            <Image
                                source={{uri: landscapeURL || portraitURL}}
                                style={styles.heroImage}
                                resizeMode="cover"
                            />
                        </LinearGradient>
                    </View>
                    <TouchableOpacity onPress={handleBackPress} style={styles.heroBackButtonWrap}>
                        <View style={styles.heroBackButtonInner}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.WHITE} />
                            <Text style={styles.heroBackButtonText}>Back</Text>
                        </View>
                    </TouchableOpacity>
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
                        colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.62)']}
                        style={styles.heroBottomOverlay}
                    />
                </View>
            </View>

            <View style={[styles.ctaRow, styles.heroActionRow]}>
                <TouchableOpacity style={{flex: 1}} onPress={playSeries}>
                    <View style={styles.VisionaryButton}>
                        <Text style={styles.buttonText}>{contentButtonName || 'Play Series'}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flex: 1}}
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
                    }}>
                    <View style={styles.MITbutton}>
                        <Text style={styles.buttonText}>Watch Trailer</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.titleWrap}>
                    <Text style={styles.titleText}>{title}</Text>
                </View>

                <View style={styles.tagsWrap}>
                    {renderMetaChip(yearsActive)}
                    {renderMetaChip(`Seasons ${seasons.length}`)}
                    {renderMetaChip(rated)}
                    {renderMetaChip(capitalizeFirstLetterOfString(genre1))}
                    {genre2 && renderMetaChip(capitalizeFirstLetterOfString(genre2))}
                </View>

                <View style={styles.metaRow}>
                    <Icon name="star" type="ionicon" size={16} color={COLORS.STARGOLD} />
                    <Text style={styles.descriptionText}>{rating ? ` ${rating.toFixed(1)} / 10 ` : '  '}</Text>
                     <Icon name="star" type="ionicon" size={16} color={COLORS.STARGOLD} />
                </View>

                <View style={styles.descriptionWrap}>
                    <Text style={styles.descriptionText}>
                        {description}
                    </Text>
                    {!!actors?.trim() && (
                        <View style={{flexDirection: 'row', marginBottom: 5}}>
                            <Text style={styles.castText}>
                                <Text style={styles.castLabel}>Cast:</Text> {actors}
                            </Text>
                        </View>
                    )}
                    {!!directors?.trim() && (
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            <Text style={styles.castText}>
                                <Text style={styles.castLabel}>Directors:</Text> {directors}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.reactionsRow}>
                    {combinedReactions.map(reaction => (
                        <TouchableOpacity
                            onPress={() => handleReactionClick(reaction.type)}
                            key={reaction.type}
                            style={{alignItems: 'center'}}>
                            {getIconForReaction(reaction.type)}
                            <Text style={styles.reactionText}>
                                {capitalizeFirstLetterOfString(reaction.type)} {reaction.percentage}%
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                    />
                </View>
        </View>
    );
};

export default SeriesDetailCard;
