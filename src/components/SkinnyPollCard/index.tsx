import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    Pressable,
    Modal,
    TouchableWithoutFeedback,
    TextInput,
} from 'react-native';
import styles from './styles';
import {IChoice, IPoll} from '../../../types';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, isTablet} from '../../../assets/constants/theme';
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
import {resolveAkcruBadgeConfig} from '../ProfileUserBadges';
import EngagementStatRow from '../EngagementStatRow/EngagementStatRow';
import useAuthStore from '../../stores/auth.store';
import {navigateToCrummunitySendMIT} from '../../util/RootNavigation';
import InlineCommentComposer from '../InlineCommentComposer';

type PollWithLikeCount = IPoll & {likeCount?: number};

const getPollLikeCount = (poll: PollWithLikeCount): number =>
    poll._count?.pollLikes ?? poll.likeCount ?? 0;

type PollCardProps = {
    poll: IPoll;
    onVote: (pollId: string, choiceId: string) => void;
    currentUserID: string;
    akcruBadgeColor: string;
    akcruBadge?: string;
    openProfile: () => void;
    onDeletePoll: (postId: string) => void;
    onTogglePinPoll?: (pollId: string, isPinned: boolean) => void;
    showPinnedBadge?: boolean;
    profilePicture?: string;
    isAdmin?: boolean;
    onLikeOrUnlike: (pollId: string) => void;
    commentInputValue?: string;
    onCommentInputChange?: (value: string) => void;
    onCommentSend?: () => void;
    isCommentSending?: boolean;
    onCommentIconPress?: () => void;
    onFollow?: () => void;
    isFollowing?: boolean;
    reportUser?: () => void;
    onBlockUser?: () => void;
};

const PollCard = ({
    poll,
    onVote,
    currentUserID,
    akcruBadgeColor,
    akcruBadge,
    openProfile,
    onDeletePoll,
    onTogglePinPoll = () => {},
    showPinnedBadge = false,
    profilePicture,
    isAdmin = false,
    onLikeOrUnlike,
    commentInputValue = '',
    onCommentInputChange,
    onCommentSend,
    isCommentSending = false,
    onCommentIconPress,
    onFollow = () => {},
    isFollowing = false,
    reportUser = () => {},
    onBlockUser = () => {},
}: PollCardProps) => {
    const [selectedChoice, setSelectedChoice] = useState<string | null>(poll.selectedChoice || null);
    const [pollOptionsVisible, setPollOptionsVisible] = useState(false);
    const [isPollExpired, setIsPollExpired] = useState(new Date() > new Date(poll.expiresAt));
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [choices, setChoices] = useState<IChoice[]>(poll.choices);
    const [totalVotes, setTotalVotes] = useState<number>(poll.totalVotes);

    const isCurrentUserAuthor = poll.user?.id === currentUserID;
    const isPinned = !!(poll as any)?.isPinned;
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [debounce, setDebounce] = useState(false);

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);
    const commentInputRef = useRef<TextInput>(null);

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    const currentUserMITTickets = useAuthStore(s => s.user?.MITCount ?? 0);

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
        setVideoModalVisible(false);
    };

    const handleVideoError = () => {
        setVideoModalVisible(false);
    };

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
    };

    const handleModalVideoLoad = () => {
        setIsVideoLoaded(true);
        setShowSkipButton(true);
    };

    const handleSkipVideo = () => {
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
        setChoices(prevChoices =>
            prevChoices.map(choice => (choice.id === choiceId ? {...choice, voteCount: choice.voteCount + 1} : choice)),
        );
        setTotalVotes(prevTotalVotes => prevTotalVotes + 1);
        onVote(poll.id, choiceId);
    };

    const handleDeletePoll = () => {
        onDeletePoll(poll.id);
    };

    const handleTogglePinPoll = () => {
        closePollOptions();
        onTogglePinPoll(poll.id, !isPinned);
    };

    const openPollOptions = () => {
        setPollOptionsVisible(true);
    };

    const closePollOptions = () => {
        setPollOptionsVisible(false);
    };

    const renderOptionRow = (
        key: string,
        label: string,
        iconName: string,
        iconType: 'ionicon' | 'material-community' = 'ionicon',
        onPress?: () => void,
    ) => (
        <Pressable key={key} style={styles.optionRow} onPress={onPress}>
            <View style={styles.optionIconWrap}>
                <Icon name={iconName} type={iconType} color={COLORS.PURPLE} size={18} />
            </View>
            <Text style={styles.optionLabel}>{label}</Text>
        </Pressable>
    );

    const renderDeletePoll = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return renderOptionRow('delete', 'Delete Poll', 'trash-outline', 'ionicon', () => {
                closePollOptions();
                handleDeletePoll();
            });
        }
        return null;
    };

    const renderFollowUser = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow(
                'follow',
                isFollowing ? `Unfollow ${poll.user.username}` : `Follow ${poll.user.username}`,
                isFollowing ? 'person-remove-outline' : 'person-add-outline',
                'ionicon',
                () => {
                    onFollow();
                    closePollOptions();
                },
            );
        }
        return null;
    };

    const renderBlockUser = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow('block', `Block ${poll.user.username}`, 'hand-left-outline', 'ionicon', () => {
                onBlockUser();
                closePollOptions();
            });
        }
        return null;
    };

    const renderReportPoll = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow('report', `Report ${poll.user.username}`, 'flag-outline', 'ionicon', () => {
                reportUser();
                closePollOptions();
            });
        }
        return null;
    };

    const openProfileForTag = async (username: any) => {
        try {
        const taggedUser = await findAUser({username});
        if (taggedUser) {
            navigation.navigate('ViewUserScreen', {userID: taggedUser.id});
        } else {
            return;
        }
        } catch (error) {
            console.error('Error finding user:', error);
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

    const [likeCount, setLikeCount] = useState<number>(getPollLikeCount(poll));
    const [likedByCurrentUser, setLikedByCurrentUser] = useState<boolean>(!!poll.isLikedByCurrentUser);

    useEffect(() => {
        setLikeCount(getPollLikeCount(poll));
        setLikedByCurrentUser(!!poll.isLikedByCurrentUser);
    }, [poll.id, poll.isLikedByCurrentUser, poll._count?.pollLikes, (poll as PollWithLikeCount).likeCount]);

    const handleLikeOrUnlike = async () => {
        if (debounce) return;

        setDebounce(true);
        try {
            await onLikeOrUnlike(poll.id);
            setLikedByCurrentUser(!likedByCurrentUser);
            setLikeCount(likedByCurrentUser ? likeCount - 1 : likeCount + 1);
        } catch (error) {
            console.error('Failed to like/unlike poll:', error);
        } finally {
            setDebounce(false);
        }
    };

    const openCrummunityMIT = () => {
        if (isCurrentUserAuthor) {
            return;
        }
        navigateToCrummunitySendMIT({
            recipientId: String(poll.user.id),
            profilePicture: poll.user.profilePicture,
            firstName: poll.user.firstName,
            lastName: poll.user.lastName,
            username: poll.user.username,
            dateOfBirth: poll.user.dateOfBirth,
            location: poll.user.location,
            badge: poll.user.badge,
            influencerStatus: poll.user.influencerStatus,
            ownerStatus: poll.user.ownerStatus,
            postPreview: poll.question,
        });
    };

    const handleCommentFocus = () => {
        if (onCommentIconPress) {
            onCommentIconPress();
        }
        commentInputRef.current?.focus();
    };

    const userIcons = isTablet() ? 18 : 12;
    const badgeConfig = resolveAkcruBadgeConfig(poll.user?.badge);
    const displayName =
        [poll.user?.firstName, poll.user?.lastName].filter(Boolean).join(' ').trim() || poll.user?.username || '';
    const userHandle = poll.user?.username || '';

    return (
        <View style={styles.cardcontainer}>
            <LinearGradient colors={['#3498db', '#9b59b6', '#e056fd']} style={styles.gradientFrame}>
                <View style={styles.cardInner}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarColumn}>
                            <TouchableOpacity onPress={() => openProfile()}>
                                <HexAvatar
                                    source={{uri: profilePicture ?? poll.user?.profilePicture}}
                                    size={isTablet() ? 58 : 48}
                                    bordercolor={akcruBadgeColor}
                                    rotateFrameDegrees={90}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.metaColumn}>
                            <View style={styles.nameRow}>
                                <Text style={styles.displayName} numberOfLines={1}>
                                    {displayName}
                                </Text>
                                {(poll.user?.influencerStatus || poll.user?.ownerStatus) && (
                                    <Icon
                                        name="checkmark-circle"
                                        type="ionicon"
                                        color="#3498db"
                                        size={userIcons + 2}
                                        style={{marginLeft: 4}}
                                    />
                                )}
                                {poll.user?.ownerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.STARGOLD}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {poll.user?.companyStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {poll.user?.influencerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {poll.user?.blackCloakStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {poll.user?.isAdmin && (
                                    <CustomIcon
                                        name="police-badge"
                                        type="material-community"
                                        color={COLORS.STARGOLD}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {poll.user?.visionaryStatus && (
                                    <CustomIcon
                                        name="diamond-stone"
                                        type="material-community"
                                        color={COLORS.WHITE}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                            </View>
                            <Text style={styles.handleText}>@{userHandle}</Text>
                            {badgeConfig ? (
                                <LinearGradient
                                    colors={[`${badgeConfig.color}24`, `${badgeConfig.color}40`]}
                                    style={styles.badgePill}>
                                    <Text style={[styles.badgePillText, {color: badgeConfig.color}]}>
                                        {badgeConfig.label}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.badgeLegacyWrap}>
                                    <DisplayBadge akcruBadge={akcruBadge} />
                                </View>
                            )}
                        </View>
                        <View style={styles.actionWrap}>
                            {!isCurrentUserAuthor && (
                                <Pressable onPress={onFollow} style={styles.followBtn}>
                                    <Text style={styles.followBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
                                </Pressable>
                            )}
                            <View style={styles.optionWrap}>
                                {showPinnedBadge && isPinned ? (
                                    <Icon
                                        name="pin"
                                        type="material-community"
                                        color={COLORS.STARGOLD}
                                        size={18}
                                        style={{marginRight: 8}}
                                    />
                                ) : null}
                                <Pressable onPress={openPollOptions} hitSlop={8}>
                                    <Icon
                                        name="ellipsis-horizontal"
                                        type="ionicon"
                                        color="rgba(255,255,255,0.72)"
                                        size={isTablet() ? 28 : 22}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.timeText}>Poll started {timeSince(poll.createdAt)}</Text>
                    <Text style={styles.questionText}>{renderPollText(poll.question)}</Text>

                    {poll.imageUrl && (
                        <TouchableOpacity onPress={() => openModal(poll.imageUrl)}>
                            <Image source={{uri: poll.imageUrl}} style={styles.mediaImage} />
                        </TouchableOpacity>
                    )}

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

                    <View style={styles.choicesWrap}>
                        <FlatList
                            data={choices}
                            keyExtractor={choice => choice.id}
                            scrollEnabled={false}
                            renderItem={({item: choice}) => (
                                <TouchableOpacity
                                    style={[styles.pollChoice, selectedChoice === choice.id && styles.selectedPollChoice]}
                                    onPress={() => handleVote(choice.id)}
                                    disabled={selectedChoice !== null || isPollExpired || debounce}>
                                    {choice.imageUrl && <Image source={{uri: choice.imageUrl}} style={styles.choiceImage} />}
                                    <Text style={styles.choiceText}>{choice.text}</Text>
                                    {selectedChoice ? (
                                        <Text style={styles.choicePercentText}>
                                            {calculatePercentage(choice.voteCount, totalVotes)}
                                        </Text>
                                    ) : null}
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <View style={styles.pollMetaWrap}>
                        <Text style={styles.voterText}>{totalVotes} voters have participated in this poll</Text>
                        {selectedChoice && <Text style={styles.votedText}>You have already voted on this poll</Text>}
                        {!isPollExpired ? (
                            <Text style={styles.expiryText}>Time remaining: {timeRemaining}</Text>
                        ) : (
                            <Text style={styles.expiryText}>Sorry, this poll has expired</Text>
                        )}
                    </View>

                    <EngagementStatRow
                        likes={likeCount}
                        comments={poll._count?.comments || 0}
                        mitCount={currentUserMITTickets}
                        isLiked={likedByCurrentUser}
                        allowComments={true}
                        onLike={handleLikeOrUnlike}
                        onComment={handleCommentFocus}
                        onMit={openCrummunityMIT}
                    />
                    <InlineCommentComposer
                        inputRef={commentInputRef}
                        value={commentInputValue}
                        onChangeText={text => onCommentInputChange?.(text)}
                        onSend={onCommentSend}
                        isSending={isCommentSending}
                    />
                </View>
            </LinearGradient>
            <Modal visible={pollOptionsVisible} transparent={true} animationType="slide">
                <Pressable style={styles.sheetBackdrop} onPress={closePollOptions} />
                <LinearGradient
                    colors={['#4f46e5', '#7c3aed', '#ec4899']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.mediaSheetGradientBorder}>
                    <View style={styles.mediaSheet}>
                        <Text style={styles.mediaSheetTitle}>Poll options</Text>
                        <View style={styles.optionsList}>
                            {renderDeletePoll()}
                            {renderFollowUser()}
                            {renderBlockUser()}
                            {renderReportPoll()}
                        </View>
                    </View>
                </LinearGradient>
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
