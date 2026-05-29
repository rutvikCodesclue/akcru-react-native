import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    ScrollView,
    TouchableWithoutFeedback,
    Platform,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import React, {useRef, useState} from 'react';
import styles from './styles';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import HexAvatar from '../HexAvatar';
import {classifyPostContent, timeSince} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {IUserProfile} from '../../../types';
import CustomIcon from '../CustomIcon/CustomIcon';
import {isTablet, MULTISIZES} from '../../../assets/constants/theme';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';
import VideoPlayer from 'react-native-media-console';
import EngagementStatRow from '../EngagementStatRow/EngagementStatRow';
import {navigateToCrummunitySendMIT} from '../../util/RootNavigation';
import useAuthStore from '../../stores/auth.store';
import {resolveAkcruBadgeConfig} from '../ProfileUserBadges';
import InlineCommentComposer from '../InlineCommentComposer';
import PostImageCarousel from '../PostImageCarousel';

const neonIconWrap = (color: string) =>
    Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.95,
            shadowRadius: 10,
        },
        android: {elevation: 6},
    });

type ShareOptionProps = {
    iconname: string;
    sharename?: string | number;
    sharePress: () => void;
};

const ShareOptions = ({iconname, sharename, sharePress}: ShareOptionProps) => {
    return (
        <View style={{marginRight: 15}}>
            <View style={{alignItems: 'center'}}>
                <Pressable
                    onPress={sharePress}
                    style={{
                        backgroundColor: COLORS.AKCRUBLUE,
                        width: 50,
                        height: 50,
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Icon name={iconname} type="ionicon" color={COLORS.MIDORANGE} size={20} />
                </Pressable>
                <View style={{marginTop: 5, width: 70}}>
                    <Text style={{...FONTS.paragraph1, fontSize: 12, color: COLORS.MIDORANGE, textAlign: 'center'}}>
                        {sharename}
                    </Text>
                </View>
            </View>
        </View>
    );
};

type User = {
    id: string;
    username: string;
    image?: string;
    akcruBadge?: string;
    avatarbordercolor?: string;
    influencer?: string;
    profilePicture?: string;
    firstName: string;
    lastName: string;
    email: string;
};

type PostStats = {
    comments: number;
    likes: number;
    reposts: number;
};

type PostType = {
    id: string;
    content: string;
    allowComments?: boolean;
    author: IUserProfile;
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    likes?: number;
    impressions?: number;
    _count?: PostStats;
    updatedAt: string;
    edited: boolean;
    editedText: string;
    isLikedByCurrentUser?: boolean;
};

type PostProps = {
    post: PostType;
    loading?: boolean;
    openProfile: () => void;
    onFollow?: () => void;
    reportUser?: () => void;
    isFollowing?: boolean;
    onDeletePost: (postId: number) => void;
    onTogglePinPost?: (postId: number, isPinned: boolean) => void;
    showPinnedBadge?: boolean;
    currentUserID?: string;
    akcruBadge?: string;
    onLikeOrUnlike: (postId: number) => void;
    onCommentIconPress?: () => void;
    commentInputValue?: string;
    onCommentInputChange?: (value: string) => void;
    onCommentSend?: () => void;
    isCommentSending?: boolean;
    onBlockUser?: () => void;
    akcruBadgeColor: string;
    isAdmin?: boolean;
    visionaryStatus?: boolean;
    onOpenPost?: () => void;
};

const SkinnyPostCard = ({
    post,
    loading,
    openProfile,
    onFollow = () => {},
    reportUser = () => {},
    isFollowing = false,
    onDeletePost,
    onTogglePinPost = () => {},
    showPinnedBadge = false,
    currentUserID,
    akcruBadge,
    onLikeOrUnlike,
    onCommentIconPress,
    commentInputValue = '',
    onCommentInputChange,
    onCommentSend,
    isCommentSending = false,
    onBlockUser = () => {},
    akcruBadgeColor,
    isAdmin = false,
    onOpenPost,
}: PostProps) => {
    const commentInputRef = useRef<TextInput>(null);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [videoAspectRatio, setVideoAspectRatio] = useState(9 / 16); // Default to portrait

    const [isPostOptionsVisible, setPostOptionsVisible] = useState(false);

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);

    const [shareOptionsVisible, setShareOptionsVisible] = useState(false);

    const [isPaused, setIsPaused] = useState(true); // Track if the video is paused
    const [showVideoControls, setShowVideoControls] = useState(true); // Track visibility of controls
    const [currentVideoTime, setCurrentVideoTime] = useState(0); // Store current video time

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    // Check if the current user is the author of the post
    const isCurrentUserAuthor = post.author.id === currentUserID;

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const currentUserMITTickets = useAuthStore(s => s.user?.MITCount ?? 0);

    const handleDeletePost = () => {
        closePostOptions();
        onDeletePost(+post.id);
    };

    const isPinned = !!(post as any)?.isPinned;

    const handleTogglePinPost = () => {
        closePostOptions();
        onTogglePinPost(+post.id, !isPinned);
    };

    const openModal = (image: React.SetStateAction<string>) => {
        setSelectedImage(image);
        setImageModalVisible(true);
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

    const handleVideoLoad = (data: any) => {
        // Logic for when the video is loaded
        const {width, height} = data.naturalSize;

        if (width && height) {
            setVideoAspectRatio(width / height); // Calculate correct aspect ratio
        }
        setIsVideoLoaded(true);
    };

    // Function to handle video play
    const handlePlay = () => {
        setIsPaused(false); // Update paused state to false
    };

    // Function to handle video pause
    const handlePause = () => {
        setIsPaused(true); // Update paused state to true
    };

    const handleProgress = (data: any) => {
        setCurrentVideoTime(data.currentTime); // Save current time when video progresses
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

    const closeModal = () => {
        setImageModalVisible(false);
    };

    const closeVideoModal = () => {
        setVideoModalVisible(false);
    };

    const openPostOptions = () => {
        setPostOptionsVisible(true);
    };

    const closePostOptions = () => {
        setPostOptionsVisible(false);
    };

    const openShareOptions = () => {
        setShareOptionsVisible(true);
    };

    const closeShareOptions = () => {
        setShareOptionsVisible(false);
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

    // Conditional rendering of options in option modal
    const renderDeleteSkinny = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return renderOptionRow('delete', 'Delete Post', 'trash-outline', 'ionicon', handleDeletePost);
        }
        return null;
    };
    const renderPinSkinny = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return renderOptionRow(
                'pin',
                isPinned ? 'Unpin Post' : 'Pin Post',
                isPinned ? 'pin-outline' : 'pin',
                'ionicon',
                handleTogglePinPost,
            );
        }
        return null;
    };
    const renderMuteUser = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Icon name="volume-mute" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Mute {post.author.username}</Text>
                </Pressable>
            );
        }
        return null;
    };
    const renderBlockUser = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow('block', `Block ${post.author.username}`, 'hand-left-outline', 'ionicon', () => {
                onBlockUser();
                closePostOptions();
            });
        }
        return null;
    };
    const renderReportSkinny = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow('report', `Report ${post.author.username}`, 'flag-outline', 'ionicon', () => {
                reportUser();
                closePostOptions();
            });
        }
        return null;
    };
    const renderNotInterested = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Icon name="sad" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Not Interested in this Skinny</Text>
                </Pressable>
            );
        }
        return null;
    };

    const renderFollowUser = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow(
                'follow',
                isFollowing ? `Unfollow ${post.author.username}` : `Follow ${post.author.username}`,
                isFollowing ? 'person-remove-outline' : 'person-add-outline',
                'ionicon',
                () => {
                    onFollow();
                    closePostOptions();
                },
            );
        }
        return null;
    };

    const openProfileForTag = async username => {
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

    const renderPostText = text => {
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

    const renderEditPostScreen = () => {
        if (isCurrentUserAuthor) {
            return renderOptionRow('edit', 'Edit Post', 'create-outline', 'ionicon', () => {
                navigation.navigate('EditPostScreen', {post});
                closePostOptions();
            });
        }
        return null;
    };

    const {textContent, imageUrls, videoUrl} = classifyPostContent(post.content as any);
    const userIcons = isTablet() ? 15 : 12;
    const primaryText =
        post.edited && post.editedText ? String(post.editedText) : textContent ? String(textContent) : '';
    const strippedForLines = primaryText.replace(/#\w+/g, '').trim();
    const lines = strippedForLines
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
    const headline = lines[0] || '';
    const description = lines.slice(1).join('\n').trim();
    const hashTags = [...new Set(primaryText.match(/#\w+/g) || [])].slice(0, 6);
    const mitPreview =
        [headline, description].filter(Boolean).join('\n').trim() ||
        (primaryText ? primaryText.slice(0, 280) : '') ||
        '';
    const badgeConfig = resolveAkcruBadgeConfig(post.author?.badge);
    const displayName =
        [post.author?.firstName, post.author?.lastName].filter(Boolean).join(' ').trim() ||
        post.author?.username ||
        '';
    const userHandle = post.author?.username || '';

    const openCrummunityMIT = () => {
        if (isCurrentUserAuthor) {
            return;
        }
        navigateToCrummunitySendMIT({
            recipientId: String(post.author.id),
            profilePicture: post.author.profilePicture,
            firstName: post.author.firstName,
            lastName: post.author.lastName,
            username: post.author.username,
            dateOfBirth: post.author.dateOfBirth,
            location: post.author.location,
            badge: post.author.badge,
            influencerStatus: post.author.influencerStatus,
            ownerStatus: post.author.ownerStatus,
            postPreview: mitPreview,
        });
    };

    const handleCommentFocus = () => {
        if (onCommentIconPress) {
            onCommentIconPress();
            return;
        }
        commentInputRef.current?.focus();
    };

    return (
        <View style={styles.cardcontainer}>
            <LinearGradient
                colors={['#3498db', '#9b59b6', '#e056fd']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientFrame}>
                <View style={styles.cardInner}>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                        <View style={{marginRight: 10}}>
                            <View style={neonIconWrap('#3498db')}>
                                <TouchableOpacity onPress={() => openProfile()}>
                                    <HexAvatar
                                        source={{uri: post.author?.profilePicture}}
                                        size={isTablet() ? 58 : 48}
                                        bordercolor={akcruBadgeColor}
                                        rotateFrameDegrees={90}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{flex: 1, minWidth: 0}}>
                            <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
                                <Text style={styles.displayName} numberOfLines={1}>
                                    {displayName}
                                </Text>
                                {(post?.author.influencerStatus || post?.author.ownerStatus) && (
                                    <Icon
                                        name="checkmark-circle"
                                        type="ionicon"
                                        color="#3498db"
                                        size={userIcons + 2}
                                        style={{marginLeft: 4}}
                                    />
                                )}
                                {post?.author.ownerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.STARGOLD}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {post?.author.companyStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {post?.author.influencerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {post?.author.blackCloakStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {post?.author.isAdmin && (
                                    <CustomIcon
                                        name="police-badge"
                                        type="material-community"
                                        color={COLORS.STARGOLD}
                                        baseSize={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {post?.author.visionaryStatus && (
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
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 1}}
                                    style={styles.badgePill}>
                                    <Text style={[styles.badgePillText, {color: badgeConfig.color}]}>
                                        {badgeConfig.label}
                                    </Text>
                                </LinearGradient>
                            ) : null}
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {!isCurrentUserAuthor && (
                                <Pressable onPress={onFollow} style={styles.followBtn}>
                                    <Text style={styles.followBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
                                </Pressable>
                            )}
                            {showPinnedBadge && isPinned ? (
                                <Icon
                                    name="pin"
                                    type="material-community"
                                    color={COLORS.STARGOLD}
                                    size={18}
                                    style={{marginRight: 8}}
                                />
                            ) : null}
                            <Pressable onPress={openPostOptions} hitSlop={8}>
                                <Icon
                                    name="ellipsis-horizontal"
                                    type="ionicon"
                                    color={COLORS.OVERLAY_WHITE_70}
                                    size={isTablet() ? 28 : 22}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {imageUrls.length > 0 ? (
                        <PostImageCarousel
                            imageUrls={imageUrls}
                            onImagePress={openModal}
                            imageStyle={styles.mediaImage}
                            containerStyle={styles.mediaCarouselWrap}
                        />
                    ) : null}
                    <View>
                        {videoUrl && (
                            <TouchableOpacity>
                                <View
                                    style={[
                                        styles.postvideo,
                                        {
                                            aspectRatio: 4 / 5,
                                            marginTop: 12,
                                            borderTopLeftRadius: 12,
                                            borderTopRightRadius: 12,
                                            overflow: 'hidden',
                                        },
                                    ]}>
                                    <VideoPlayer
                                        videoRef={topVideoRef}
                                        videoStyle={styles.videoStyle}
                                        source={{uri: videoUrl}}
                                        resizeMode="contain"
                                        onEnd={handleVideoEnd}
                                        repeat={false}
                                        onError={handleVideoError}
                                        onLoad={handleVideoLoad}
                                        onPlay={handlePlay}
                                        onPause={handlePause}
                                        onProgress={handleProgress}
                                        paused={isPaused}
                                        tapAnywhereToPause={false}
                                        showOnStart={true}
                                        showOnEnd={true}
                                        disableVolume={true}
                                        disableBack={true}
                                        disableSeekButtons={true}
                                        disableOverlay={true}
                                        disableTimer={true}
                                        disableFullscreen={true}
                                        controlTimeoutDelay={isPaused ? 9999999 : 1500}
                                        onEnterFullscreen={() => openVideoModal(videoUrl)}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                        <Text style={{...FONTS.Username, color: COLORS.OVERLAY_WHITE_35, fontSize: 12}}>
                            {post.edited ? `Edited ${timeSince(post.updatedAt)}` : `Posted ${timeSince(post.createdAt)}`}
                        </Text>
                        {post.edited ? (
                            <Icon
                                name="create-outline"
                                type="ionicon"
                                color={COLORS.PURPLE}
                                size={16}
                                style={{marginLeft: 6}}
                            />
                        ) : null}
                    </View>

                    {headline ? (
                        onOpenPost ? (
                            <Pressable onPress={onOpenPost}>
                                <Text style={styles.headline}>{renderPostText(headline)}</Text>
                            </Pressable>
                        ) : (
                            <Text style={styles.headline}>{renderPostText(headline)}</Text>
                        )
                    ) : null}
                    {description ? (
                        onOpenPost ? (
                            <Pressable onPress={onOpenPost}>
                                <Text style={styles.descText}>{renderPostText(description)}</Text>
                            </Pressable>
                        ) : (
                            <Text style={styles.descText}>{renderPostText(description)}</Text>
                        )
                    ) : !headline && primaryText ? (
                        onOpenPost ? (
                            <Pressable onPress={onOpenPost}>
                                <Text style={styles.descText}>{renderPostText(primaryText)}</Text>
                            </Pressable>
                        ) : (
                            <Text style={styles.descText}>{renderPostText(primaryText)}</Text>
                        )
                    ) : null}

                    {hashTags.length > 0 ? (
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4}}>
                            {hashTags.map((tag, i) => (
                                <View
                                    key={`${tag}-${i}`}
                                    style={[
                                        styles.tagPill,
                                        {
                                            backgroundColor:
                                                i % 2 === 0 ? 'rgba(52, 152, 219, 0.28)' : 'rgba(155, 89, 182, 0.32)',
                                            borderWidth: 1,
                                            borderColor:
                                                i % 2 === 0 ? 'rgba(52, 152, 219, 0.5)' : 'rgba(155, 89, 182, 0.55)',
                                        },
                                    ]}>
                                    <Text
                                        style={{
                                            color: i % 2 === 0 ? '#5dade2' : '#bb8fce',
                                            fontWeight: '700',
                                            fontSize: 14,
                                        }}>
                                        #
                                    </Text>
                                    <Text style={styles.tagText}>{tag.startsWith('#') ? tag.slice(1) : tag}</Text>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    <EngagementStatRow
                        likes={post._count?.likes ?? 0}
                        comments={post._count?.comments ?? 0}
                        mitCount={currentUserMITTickets}
                        isLiked={!!post.isLikedByCurrentUser}
                        allowComments={post.allowComments !== false}
                        onLike={() => onLikeOrUnlike(+post.id)}
                        onComment={handleCommentFocus}
                        onMit={openCrummunityMIT}
                    />

                    {post.allowComments !== false ? (
                        <InlineCommentComposer
                            inputRef={commentInputRef}
                            value={commentInputValue}
                            onChangeText={text => onCommentInputChange?.(text)}
                            onSend={onCommentSend}
                            isSending={isCommentSending}
                            onPressIn={event => event.stopPropagation()}
                        />
                    ) : null}

                    <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 8}}>
                        {post.isSuggestedUser ? (
                            <Text style={{...FONTS.paragraph1, color: COLORS.PINK, marginRight: 8}}>Suggested</Text>
                        ) : null}
                        {post.author.promoUser ? (
                            <Text style={{...FONTS.paragraph1, color: COLORS.PINK, marginRight: 8}}>Promo</Text>
                        ) : null}
                    </View>

                    <Modal visible={isPostOptionsVisible} transparent={true} animationType="slide">
                        <Pressable style={styles.sheetBackdrop} onPress={closePostOptions} />
                        <LinearGradient
                            colors={['#4f46e5', '#7c3aed', '#ec4899']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.mediaSheetGradientBorder}>
                            <View style={styles.mediaSheet}>
                                <Text style={styles.mediaSheetTitle}>Post options</Text>
                                <View style={styles.optionsList}>
                                    {renderDeleteSkinny()}
                                    {renderPinSkinny()}
                                    {renderFollowUser()}
                                    {renderBlockUser()}
                                    {renderReportSkinny()}
                                    {renderEditPostScreen()}
                                </View>
                            </View>
                        </LinearGradient>
                    </Modal>
                    <Modal visible={shareOptionsVisible} transparent={true} animationType="slide">
                        <Pressable style={styles.postoptioncontainer} onPress={closeShareOptions}>
                            <View style={styles.postoptionsmodal}>
                                <View>
                                    <Text style={{...FONTS.Title2Orange, fontSize: 14, marginBottom: 15}}>Share post</Text>
                                </View>
                                <ScrollView horizontal={true}>
                                    <ShareOptions iconname={'link'} sharename={'Copy Link'} sharePress={() => {}} />
                                    <ShareOptions iconname={'bookmark'} sharename={'Bookmark'} sharePress={() => {}} />
                                    <ShareOptions
                                        iconname={'share-social'}
                                        sharename={'Share via...'}
                                        sharePress={() => {}}
                                    />
                                </ScrollView>
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    style={{paddingTop: 15}}>
                                    <ShareOptions iconname={'logo-whatsapp'} sharename={'WhatsApp'} sharePress={() => {}} />
                                    <ShareOptions
                                        iconname={'logo-instagram'}
                                        sharename={'Instagram Stories'}
                                        sharePress={() => {}}
                                    />
                                    <ShareOptions
                                        iconname={'chatbubble-ellipses'}
                                        sharename={'Messages'}
                                        sharePress={() => {}}
                                    />
                                    <ShareOptions
                                        iconname={'logo-facebook'}
                                        sharename={'News Feed'}
                                        sharePress={() => {}}
                                    />
                                    <ShareOptions iconname={'logo-linkedin'} sharename={'LinkedIn'} sharePress={() => {}} />
                                </ScrollView>
                            </View>
                        </Pressable>
                    </Modal>
                    <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
                        <Pressable
                            onPress={closeModal}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_90,
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
                </View>
            </LinearGradient>
            {loading && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: COLORS.OVERLAY_BLACK_60,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1,
                    }}>
                    <ActivityIndicator size="small" color={COLORS.AKCRUBLUE} />
                    <Text style={{...FONTS.Title1, marginTop: 8, color: COLORS.WHITE}}>Deleting post...</Text>
                </View>
            )}
        </View>
    );
};

export default SkinnyPostCard;
