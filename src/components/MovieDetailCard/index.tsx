import {View, Text, TouchableOpacity, Image, Modal, BackHandler } from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import styles from './styles';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {formatMovieDuration} from '../../util/util';
import {capitalizeFirstLetterOfString} from '../../util/util';
import ConfirmationModal from '../ConfirmationModal';
import {API} from '../../clients/api.client';
import {MULTISIZES} from '../../../assets/constants/theme';
import Orientation from 'react-native-orientation-locker';

type ReactionStat = {
    type: string;
    percentage: string;
};

type CombinedReaction = {
    type: string;
    percentage: string;
};

type MovieDetailCardProps = {
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
    isInWatchlist: boolean;
    watchlistConfirmationText: string;
    PlayTrailer: () => void;
    reactions: any;
    contentButtonName: string;
};

const MovieDetailCard = ({
    id: movieId,
    title,
    year,
    duration,
    rated,
    rating,
    description,
    actors,
    directors,
    portraitURL,
    trailerURL,
    landscapeURL,
    movieURL,
    genre1,
    genre2,
    onPress,
    playContent,
    watchlistButton,
    isInWatchlist,
    watchlistConfirmationText,
    showAddToWatchListConfirmationModal,
    handleCancelAddToWatchList,
    handleConfirmAddToWatchList,
    PlayTrailer,
    reactions,
    contentButtonName,
}: MovieDetailCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [reactionStats, setReactionStats] = useState<ReactionStat[]>([]);
    const [combinedReactions, setCombinedReactions] = useState<CombinedReaction[]>([]);
    const visionaryStatus = true

    useEffect(() => {
        const fetchReactionStats = async () => {
            try {
                const response = await API.get(`/v1/movies/${movieId}/reaction-stats`);
                if (response.data && response.data.success) {
                    setReactionStats(response.data.reactionStats);
                    console.log('Reaction Stats:', response.data.reactionStats);
                }
            } catch (error) {
                console.error('Error fetching reaction statistics:', error);
            }
        };

        fetchReactionStats();
    }, [movieId]);

    useEffect(() => {
        const fetchUserReaction = async () => {
            try {
                const response = await API.get(`/v1/movies/${movieId}/user-reaction`);
                if (response.data && response.data.success) {
                    setSelectedReaction(response.data.reaction);
                }
            } catch (error) {
                console.error('Error fetching user reaction:', error);
            }
        };

        fetchUserReaction();
    }, [movieId]);

    const postReaction = async (reactionType: string | null) => {
        try {
            const response = await API.post(`/v1/movies/${movieId}/reactions`, {reactionType});
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
        if (isNavigating) return;
        setIsNavigating(true);

        const { routes } = navigation.getState();

        if (routes.length > 1) {
            Orientation.lockToPortrait();
            navigation.pop();
            return true;
        } else {
            console.log('No more screens to pop');
            BackHandler.exitApp();
        }

        setTimeout(() => {
            setIsNavigating(false);
        }, 300);
    };

    const handleFlickFlirtPress = () => {
        navigation.replace('ClientTabNavigator', {
            screen: 'FlickFlirtScreen',
            params: {disableSystemBack: true},
        });
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
                    <View style={{marginBottom: 36, alignItems: 'flex-end', marginRight: 20}}>
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
                                    color: COLORS.WHITE,
                                }}>
                                {isInWatchlist ? 'Remove from Favorites' : 'Add to Favorites'}
                            </Text>
                            <TouchableOpacity onPress={watchlistButton}>
                                <Icon
                                    name={isInWatchlist ? 'heart' : 'heart-outline'}
                                    type="ionicon"
                                    color={isInWatchlist ? COLORS.CATREDLGT : COLORS.CATREDDRK}
                                    size={MULTISIZES.Xlarge40}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={true} visible={showAddToWatchListConfirmationModal}>
                        <ConfirmationModal
                            onPressYes={handleConfirmAddToWatchList}
                            onPressNo={handleCancelAddToWatchList}
                            variant="continueWatching"
                            yesLabel="Yes"
                            noLabel="No"
                            confirmationText={watchlistConfirmationText}
                        />
                    </Modal>

                </View>
            </View>

            <View style={[styles.ctaRow, styles.heroActionRow]}>
                <TouchableOpacity style={{flex: 1}} onPress={playContent}>
                    <View style={styles.VisionaryButton}>
                        <Text style={styles.buttonText}>{contentButtonName}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => {
                        console.log({
                            id: movieId,
                            trailerURL: trailerURL,
                            landscapeURL: landscapeURL,
                        });
                        navigation.navigate('TrailerPlayer', {
                            id: movieId,
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
                <View style={styles.metaRow}>
                    <Icon name="star" type="ionicon" size={16} color={COLORS.STARGOLD} />
                    <Text style={styles.descriptionText}>{rating ? ` ${rating.toFixed(1)} / 10 ` : '  '}</Text>
                     <Icon name="star" type="ionicon" size={16} color={COLORS.STARGOLD} />
                </View>
                <View style={styles.tagsWrap}>
                    {renderMetaChip(capitalizeFirstLetterOfString(genre1))}
                    {renderMetaChip(String(year))}
                    {renderMetaChip(formatMovieDuration(duration))}
                    {renderMetaChip(rated)}
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
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        <Text style={styles.castText}>
                            <Text style={styles.castLabel}>Directors:</Text> {directors}
                        </Text>
                    </View>
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
                <View style={styles.ctaRow}>
                    {/*
                    {visionaryStatus && (
                        <TouchableOpacity style={{flex: 1}} disabled activeOpacity={1}>
                            <View style={[styles.VisionaryButton, {opacity: 0.45}]}>
                                <Text style={styles.buttonText}>Find Your Match</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    */}
                    {visionaryStatus && (
                        <TouchableOpacity style={{flex: 1}} onPress={handleFlickFlirtPress}>
                            <View style={styles.VisionaryButton}>
                                <Text style={styles.buttonText}>Find Your Match</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={{flex: 1}} onPress={onPress}>
                        <View style={styles.MITbutton}>
                            <Image
                                source={imageindex.mitTicketImage}
                                style={{ width: 70, height: 70}}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>Send an Invite</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.earnRow}>
                    <Image
                        source={imageindex.AkcruHexLogo}
                        style={{width: 26, height: 26, marginRight: 10}}
                        resizeMode="contain"
                    />
                    <Text style={{...FONTS.Title2Orange}}>Earn AKCRU dollars</Text>
                </View>
            </View>
        </View>
    );
};

export default MovieDetailCard;
