import {View, Text, TouchableOpacity, Image, Modal} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import styles from './styles';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../akcruButtons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import {formatMovieDuration} from '../../util/util';
import {capitalizeFirstLetterOfString} from '../../util/util';
import ConfirmationModal from '../ConfirmationModal';
import {API} from '../../clients/api.client';
import {MULTISIZES} from '../../../assets/constants/theme';
import BackButton from '../General/backbutton';

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
    showAddToWatchListConfirmationModal,
    handleCancelAddToWatchList,
    handleConfirmAddToWatchList,
    PlayTrailer,
    reactions,
    contentButtonName,
}: MovieDetailCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [reactionStats, setReactionStats] = useState<ReactionStat[]>([]);
    const [combinedReactions, setCombinedReactions] = useState<CombinedReaction[]>([]);

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
                    <BackButton navigation={navigation} />
                    <View style={{marginBottom: 10, alignItems: 'flex-end', marginRight: 5}}>
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
                    </View>

                    <Modal animationType="fade" transparent={true} visible={showAddToWatchListConfirmationModal}>
                        <ConfirmationModal
                            onPressYes={handleConfirmAddToWatchList}
                            onPressNo={handleCancelAddToWatchList}
                            confirmationText={`Are you sure you want to add "${title}" to your watchlist?`}
                        />
                    </Modal>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginHorizontal: 10,
                        }}>
                        <AkcruButtons.MedButton
                            btnname={contentButtonName}
                            onPress={playContent}
                            color={COLORS.AKCRUBLUE}
                            disabled={false}
                        />

                        <AkcruButtons.MedButton
                            btnname={'Watch Trailer'}
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
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            marginRight: 10,
                        }}>
                        <Text
                            style={{
                                ...FONTS.paragraph1,
                                color: COLORS.LIGHTGREY,
                                marginRight: 10,
                            }}>
                            {year}
                        </Text>
                        <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                            {formatMovieDuration(duration)}
                        </Text>
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

                <View style={{marginHorizontal: 15, marginVertical: 10}}>
                    <TouchableOpacity onPress={onPress}>
                        <View style={styles.MITbutton}>
                            <Image source={imageindex.MITticket} style={{marginRight: 10}} />

                            <Text style={{...FONTS.Title2AkcruBlue}}>Send Movie Invite Ticket</Text>
                        </View>
                    </TouchableOpacity>
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
                    <Text style={{...FONTS.Title2Orange}}>Earn up to 500 AKCRU dollars</Text>
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

export default MovieDetailCard;
