import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../akcruButtons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import {formatMovieDuration} from '../../util/util';
import {capitalizeFirstLetterOfString} from '../../util/util';
import {API} from '../../clients/api.client';
import Orientation from 'react-native-orientation-locker';

type ReactionStat = {
    type: string;
    percentage: string;
};

type CombinedReaction = {
    type: string;
    percentage: string;
};

type EpisodeDetailCardProps = {
    title: string;
    duration: number;
    description: string;
    actors: string;
    directors: string;
    id: string;
    portraitURL: string;
    trailerURL: string;
    landscapeURL: string;
    onPress: () => void;
    playEpisode: () => void;
    showAddToWatchListConfirmationModal: boolean;
    handleCancelAddToWatchList: () => void;
    handleConfirmAddToWatchList: () => void;
    watchlistButton: () => void;
    PlayTrailer: () => void;
    reactions: any;
    playButtonName: string;
    seasonId: string;
    seriesId: string; // Add this field if not already present
    episodeNumber: number;
    seasonNumber?: number;
    showPlayButton?: boolean;
};

const EpisodeDetailCard = ({
    id: episodeId,
    title,
    year,
    duration,
    description,
    actors,
    directors,
    portraitURL,
    trailerURL,
    landscapeURL,
    onPress,
    playEpisode,
    watchlistButton,
    showAddToWatchListConfirmationModal,
    handleCancelAddToWatchList,
    handleConfirmAddToWatchList,
    PlayTrailer,
    reactions,
    playButtonName,
    seasonId,
    seriesId, // Add this field if not already present
    episodeNumber,
    seasonNumber,
    season,
    showPlayButton = true,
}: EpisodeDetailCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [reactionStats, setReactionStats] = useState<ReactionStat[]>([]);
    const [combinedReactions, setCombinedReactions] = useState<CombinedReaction[]>([]);

    useEffect(() => {
        const fetchReactionStats = async () => {
            try {
                const response = await API.get(`/v1/series/episodes/${episodeId}/reaction-stats`);
                if (response.data && response.data.success) {
                    setReactionStats(response.data.reactionStats);
                    console.log('Reaction Stats:', response.data.reactionStats);
                }
            } catch (error) {
                console.error('Error fetching reaction statistics:', error);
            }
        };

        fetchReactionStats();
    }, [episodeId]);

    useEffect(() => {
        const fetchUserReaction = async () => {
            try {
                const response = await API.get(`/v1/series/episodes/${episodeId}/user-reaction`);
                if (response.data && response.data.success) {
                    setSelectedReaction(response.data.reaction);
                }
            } catch (error) {
                console.error('Error fetching user reaction:', error);
            }
        };

        fetchUserReaction();
    }, [episodeId]);

    const postReaction = async (reactionType: string | null) => {
        try {
            console.log('Posting reaction:', {episodeId, reactionType});
            const response = await API.post(`/v1/series/episodes/${episodeId}/reactions`, {reactionType});
            console.log('Reaction response:', response.data);

            if (response.data && response.data.success) {
                setSelectedReaction(reactionType);
            }
        } catch (error) {
            console.error('Error posting reaction:', error);
        }
    };

    const handleReactionClick = (reactionType: string | null) => {
        if (selectedReaction !== reactionType) {
            setSelectedReaction(reactionType);
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
                <View style={{paddingTop: 20}}>
                    <View
                        style={{
                            alignSelf: 'center',
                            width: '100%',
                            paddingHorizontal: 14,
                            marginTop: 6,
                            marginBottom: 14,
                            borderRadius: 18,
                        }}>
                        <LinearGradient
                            colors={['#7DD3FC', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3']}
                            locations={[0, 0.32, 0.68, 1]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={{
                                borderRadius: 18,
                                padding: 2,
                            }}>
                            <Image
                                source={{uri: landscapeURL || portraitURL}}
                                style={{
                                    width: '100%',
                                    height: SIZES.ScreenWidth / 1.8,
                                    borderRadius: 16,
                                }}
                                resizeMode="cover"
                            />
                        </LinearGradient>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            Orientation.lockToPortrait();
                            navigation.pop();
                        }}
                        style={{
                            position: 'absolute',
                            left: 12,
                            top: 58,
                            marginHorizontal: 15,
                            zIndex: 25,
                            elevation: 8,
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                alignSelf: 'flex-start',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 14,
                                backgroundColor: COLORS.OVERLAY_BLACK_52,
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.WHITE} />
                            <Text style={{...FONTS.Title3, marginLeft: 6, color: COLORS.WHITE}}>Back</Text>
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
                        colors={[COLORS.TRANSPARENT, 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.62)']}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: SIZES.ScreenHeight / 3.4,
                        }}
                    />
                    {/* <View style={{marginBottom: 10, alignItems: 'flex-end', marginRight: 5}}>
                        <View
                            style={{
                                justifyContent: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    textAlign: 'center',
                                    marginRight: 10,
                                }}>
                                Add to Favorites
                            </Text>
                            <TouchableOpacity onPress={watchlistButton}>
                                <Icon
                                    name="add-circle-outline"
                                    type="ionicon"
                                    color={COLORS.MIDORANGE}
                                    size={MULTISIZES.Xlarge40}
                                />
                            </TouchableOpacity>
                        </View>
                    </View> */}

                    {/* <Modal animationType="fade" transparent={true} visible={showAddToWatchListConfirmationModal}>
                        <ConfirmationModal
                            onPressYes={handleConfirmAddToWatchList}
                            onPressNo={handleCancelAddToWatchList}
                            confirmationText={`Are you sure you want to add "${title}" to your watchlist?`}
                        />
                    </Modal> */}

                    {showPlayButton && (
                        <View
                            style={{
                                marginHorizontal: 10,
                                alignItems: 'center',
                            }}>
                            <AkcruButtons.LrgButton
                                btnname={playButtonName}
                                onPress={playEpisode}
                                color={COLORS.AKCRUBLUE}
                                disabled={false}
                                variant="auth"
                            />
                        </View>
                    )}
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
                        <Text style={{...FONTS.ContentTitle}}>
                            Ep. {episodeNumber} - {title}
                            <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                                {''} {formatMovieDuration(duration)}
                            </Text>
                        </Text>
                    </View>
                </View>
                {/* <View
                    style={{
                        marginHorizontal: 15,
                        flexDirection: 'row',

                        marginVertical: 5,
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            marginRight: 10,
                        }}>
                        <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                            {formatMovieDuration(duration)}
                        </Text>
                    </View>
                </View> */}
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

                <View
                    style={{
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                    }}>
                    <Image
                        source={imageindex.AkcruHexLogo}
                        style={{width: 26, height: 26, marginRight: 10}}
                        resizeMode="contain"
                    />
                    <Text style={{...FONTS.Title2Orange}}>Earn AKCRU dollars</Text>
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
                </View>
            </View>
        </View>
    );
};

export default EpisodeDetailCard;
