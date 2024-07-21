import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Image, FlatList, Pressable, Modal, TouchableWithoutFeedback} from 'react-native';
import styles from './styles';
import {IUserProfile, IChoice, IPollType} from '../../../types';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, MULTISIZES} from '../../../assets/constants/theme';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';
import DisplayBadge from '../General/akcrubadge';
import {Icon} from '@rneui/themed';
import {timeSince} from '../../util/util';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';

type IPoll = {
    id: string;
    question: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: IUserProfile;
    choices: IChoice[];
    totalVotes: number;
    expiresAt: string;
    type: IPollType; // Update to use PollType enum
    selectedChoice?: string; // Add this property to keep track of the selected choice
};

type PollCardProps = {
    poll: IPoll;
    onVote: (pollId: string, choiceId: string) => void;
    currentUserID: string;
    akcruBadgeColor: string;
    akcruBadge?: string;
    openProfile: () => void;
    onDeletePoll: (postId: string) => void;
    profilePicture?: string;
    isAdmin: boolean;
};

const PollCard = ({
    poll,
    onVote,
    currentUserID,
    akcruBadgeColor,
    akcruBadge,
    openProfile,
    onDeletePoll,
    isAdmin,
}: PollCardProps) => {
    const [selectedChoice, setSelectedChoice] = useState<string | null>(poll.selectedChoice || null);
    const [pollOptionsVisible, setPollOptionsVisible] = useState(false);
    const [isPollExpired, setIsPollExpired] = useState(new Date() > new Date(poll.expiresAt));
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    const isCurrentUserAuthor = poll.user.id === currentUserID;
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [debounce, setDebounce] = useState(false);

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    const openModal = (image: React.SetStateAction<string>) => {
        setSelectedImage(image);
        setImageModalVisible(true);
    };

    const closeModal = () => {
        setImageModalVisible(false);
    };

    const openVideoModal = (video: React.SetStateAction<string>) => {
        setSelectedVideo(video);
        setVideoModalVisible(true);
    };

    const handleVideoEnd = () => {
        // Logic for when the video ends
        setVideoModalVisible(false);
    };

    const handleVideoError = () => {
        // Logic for handling video errors
        setVideoModalVisible(false);
    };

    const handleVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
    };

    const handleModalVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
        setShowSkipButton(true);
    };

    const handleSkipVideo = () => {
        // Logic for skipping the video
        setVideoModalVisible(false);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const expiresAt = new Date(poll.expiresAt);
            const timeLeft = expiresAt.getTime() - now.getTime();

            if (timeLeft <= 0) {
                setIsPollExpired(true);
                clearInterval(interval);
                setTimeRemaining('Poll has expired');
            } else {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [poll.expiresAt]);

    const handleVote = (choiceId: string) => {
        if (isPollExpired) {
            return;
        }

        setDebounce(true);
        setTimeout(() => setDebounce(false), 5000); // 5 second debounce

        const now = new Date();
        const expiresAt = new Date(poll.expiresAt);

        if (now > expiresAt) {
            setIsPollExpired(true);
            return;
        }

        setSelectedChoice(choiceId);
        onVote(poll.id, choiceId);
    };

    const handleDeletePoll = () => {
        onDeletePoll(poll.id);
    };

    const openPollOptions = () => {
        setPollOptionsVisible(true);
    };

    const closePollOptions = () => {
        setPollOptionsVisible(false);
    };

    const renderDeletePoll = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={handleDeletePoll}>
                    <Icon name="trash" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Delete Poll</Text>
                </Pressable>
            );
        }
        return null;
    };

    const openProfileForTag = async (username: any) => {
        const taggedUser = await findAUser({username});
        if (taggedUser) {
            navigation.navigate('ViewUserScreen', {userID: taggedUser.id});
        } else {
            return;
        }
    };

    const renderPollText = (text: string) => {
        const parts = text.split(/(@[\w._-]+)/g); // Split text by tags
        return parts.map((part, index) => {
            const username = part.substring(1);
            if (part.startsWith('@')) {
                return (
                    <Text key={index} style={{color: COLORS.AKCRUBLUE}} onPress={() => openProfileForTag(username)}>
                        {part}
                    </Text>
                );
            }
            return part;
        });
    };

    const calculatePercentage = (choiceVotes: number, totalVotes: number): string => {
        if (totalVotes === 0) {
            return '0%';
        }
        return ((choiceVotes / totalVotes) * 100).toFixed(2) + '%';
    };

    return (
        <View style={styles.cardcontainer}>
            <LinearGradient
                // Background Linear Gradient
                colors={[COLORS.CATPURPDRK, 'transparent', COLORS.CATPURPDRK]}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 5,
                }}
            />
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <View style={{marginRight: 8}}>
                    <TouchableOpacity onPress={() => openProfile()}>
                        <HexAvatar
                            source={{uri: poll.user?.profilePicture}}
                            size={MULTISIZES.Xlarge60}
                            bordercolor={akcruBadgeColor}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...FONTS.Username, marginRight: 2}}>{poll.user?.username}</Text>
                        {poll.user?.ownerStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.STARGOLD}
                                baseSize={12}
                                style={{marginRight: 0}}
                            />
                        )}
                        {poll.user?.companyStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.WHITE}
                                baseSize={12}
                                style={{marginRight: 0}}
                            />
                        )}
                        {poll.user?.influencerStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                baseSize={12}
                                style={{marginRight: 0}}
                            />
                        )}
                        {poll.user?.blackCloakStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.BLACKCLOAK}
                                baseSize={12}
                                style={{marginRight: 0}}
                            />
                        )}
                        {poll.user?.isAdmin && (
                            <CustomIcon
                                name="police-badge"
                                type="material-community"
                                color={COLORS.STARGOLD}
                                baseSize={12}
                                style={{marginRight: 0}}
                            />
                        )}
                    </View>
                    <Text style={{...FONTS.paragraph1}}>{poll.user?.firstName}</Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <DisplayBadge akcruBadge={akcruBadge} />
                    </View>
                </View>
                {isCurrentUserAuthor && (
                    <View style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginTop: -3}}>
                        <Pressable onPress={openPollOptions}>
                            <Icon name="ellipsis-horizontal" type="ionicon" color={COLORS.AKCRUBLUE} size={20} />
                        </Pressable>
                    </View>
                )}
            </View>
            <Text style={{...FONTS.Username, color: COLORS.TRANSAKCRUBLUE, marginRight: 10}}>
                Poll started {timeSince(poll.createdAt)}
            </Text>
            <View style={{marginTop: 10}}>
                <Text style={{...FONTS.paragraph1}}>{renderPollText(poll.question)}</Text>
            </View>
            <View>
                {poll.imageUrl && (
                    <TouchableOpacity onPress={() => openModal(poll.imageUrl)}>
                        <Image source={{uri: poll.imageUrl}} style={styles.postimage} />
                    </TouchableOpacity>
                )}
            </View>
            <View>
                {/* Render video if available */}
                {poll.videoUrl && (
                    <TouchableOpacity onPress={() => openVideoModal(poll.videoUrl)}>
                        <View style={styles.postvideo}>
                            <Video
                                ref={topVideoRef}
                                style={styles.videoStyle}
                                source={{uri: poll.videoUrl}}
                                resizeMode="contain"
                                onEnd={handleVideoEnd}
                                repeat={false}
                                onError={handleVideoError}
                                onLoad={handleVideoLoad}
                                muted={true}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{marginTop: 10}}>
                <FlatList
                    data={poll.choices}
                    keyExtractor={choice => choice.id}
                    renderItem={({item: choice}) => (
                        <View style={{marginTop: 10}}>
                            <TouchableOpacity
                                style={[styles.pollChoice, selectedChoice === choice.id && styles.selectedPollChoice]}
                                onPress={() => handleVote(choice.id)}
                                disabled={selectedChoice !== null || isPollExpired || debounce}>
                                {choice.imageUrl && (
                                    <Image source={{uri: choice.imageUrl}} style={styles.choiceImage} />
                                )}
                                <Text style={styles.choiceText}>{choice.text}</Text>
                                {selectedChoice && (
                                    <Text style={styles.choiceText}>
                                        {calculatePercentage(choice.voteCount, poll.totalVotes)}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
            <View style={{marginTop: 10}}>
                <Text style={{...FONTS.paragraph1, color: COLORS.AKCRUBLUE}}>
                    {poll.totalVotes} voters have participated in this poll
                </Text>
                {selectedChoice && (
                    <Text style={{...FONTS.Title2, color: COLORS.AKCRUPINK}}>You have already voted on this poll</Text>
                )}
                {!isPollExpired && (
                    <Text style={{...FONTS.Title2, color: COLORS.CATREDLGT, textAlign: 'center'}}>
                        Time remaining: {timeRemaining}
                    </Text>
                )}
                {isPollExpired && (
                    <Text style={{...FONTS.Title2, color: COLORS.CATREDLGT, textAlign: 'center'}}>
                        Sorry, this poll has expired
                    </Text>
                )}
            </View>
            <Modal visible={pollOptionsVisible} transparent={true} animationType="fade">
                <Pressable style={styles.postoptioncontainer} onPress={closePollOptions}>
                    <View style={styles.postoptionsmodal}>{renderDeletePoll()}</View>
                </Pressable>
            </Modal>
            {/* Image Modal */}
            <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
                <Pressable
                    onPress={closeModal}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}>
                    <TouchableWithoutFeedback>
                        <Image
                            source={{uri: selectedImage}}
                            style={{width: '95%', height: '85%'}}
                            resizeMode="contain"
                        />
                    </TouchableWithoutFeedback>
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={{...FONTS.Title2, color: COLORS.WHITE, padding: 10}}>Close</Text>
                    </TouchableOpacity>
                </Pressable>
            </Modal>
            {/* Video Modal */}
            <Modal visible={isVideoModalVisible} transparent={true} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}>
                    <Video
                        ref={modalVideoRef}
                        style={{width: '100%', height: '100%'}}
                        source={{uri: poll.videoUrl}}
                        resizeMode="contain"
                        onEnd={handleVideoEnd}
                        repeat={false}
                        onError={handleVideoError}
                        onLoad={handleModalVideoLoad}
                        muted={false}
                    />
                    {showSkipButton && (
                        <View style={{position: 'absolute', zIndex: 10, bottom: '3%', right: '50%', left: '33%'}}>
                            <AkcruButtons.SmallButton
                                color={COLORS.PINK}
                                btnname={'Skip'}
                                onPress={handleSkipVideo}
                                disabled={false}
                            />
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default PollCard;
