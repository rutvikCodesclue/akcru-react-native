import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import styles from './styles';
import { Icon } from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../akcruButtons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParams } from '../../navigation/ClientStack';
import { formatMovieDuration } from '../../util/util';
import { capitalizeFirstLetterOfString } from '../../util/util';
import { API } from '../../clients/api.client';
import Orientation from 'react-native-orientation-locker';

type ReactionStat = {
    type: string;
    percentage: string;
};

type CombinedReaction = {
    type: string;
    percentage: string;
};

type SizzleDetailCardProps = {
    title: string;
    year: number;
    duration: number;
    rated: string;
    rating: number;
    description: string;
    actors: string;
    directors: string;
    id: string;
    portraitURL: string;
    trailerURL: string;
    landscapeURL: string;
    movieURL: string;
    genre1: string;
    genre2: string;
    onPress: () => void;
    playContent: () => void;
    showAddToWatchListConfirmationModal: boolean;
    handleCancelAddToWatchList: () => void;
    handleConfirmAddToWatchList: () => void;
    watchlistButton: () => void;
    PlayTrailer: () => void;
    reactions: any;
    contentButtonName: string;
};

const SizzleDetailCard = ({
    id: trailerId,
    title,
    duration,
    description,
    portraitURL,
    trailerURL,
    landscapeURL,
    onPress,
    playContent,
    PlayTrailer,
    reactions,
    contentButtonName,
}: SizzleDetailCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [reactionStats, setReactionStats] = useState<ReactionStat[]>([]);
    const [combinedReactions, setCombinedReactions] = useState<CombinedReaction[]>([]);

    useEffect(() => {
        const fetchReactionStats = async () => {
            try {
                const response = await API.get(`/v1/trailers/${trailerId}/reaction-stats`);
                if (response.data && response.data.success) {
                    setReactionStats(response.data.reactionStats);
                    console.log('Reaction Stats:', response.data.reactionStats);
                }
            } catch (error) {
                console.error('Error fetching reaction statistics:', error);
            }
        };

        fetchReactionStats();
    }, [trailerId]);

    useEffect(() => {
        const fetchUserReaction = async () => {
            try {
                const response = await API.get(`/v1/trailers/${trailerId}/user-reaction`);
                if (response.data && response.data.success) {
                    setSelectedReaction(response.data.reaction);
                }
            } catch (error) {
                console.error('Error fetching user reaction:', error);
            }
        };

        fetchUserReaction();
    }, [trailerId]);

    const postReaction = async (reactionType: string | null) => {
        try {
            const response = await API.post(`/v1/trailers/${trailerId}/reactions`, { reactionType });
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
                const stats = reactionStats.find((stat: ReactionStat) => stat.type === reaction) || { percentage: '0' };
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
                <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => {
                        PlayTrailer ? PlayTrailer() : navigation.navigate('SizzlePlayer', {
                            id: trailerId,
                            trailerURL: trailerURL,
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
                    {renderMetaChip(formatMovieDuration(duration))}
                </View>

                <View style={styles.descriptionWrap}>
                    <Text style={styles.descriptionText}>
                        {description}
                    </Text>
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
            </View>
        </View>
    );
};

export default SizzleDetailCard;
