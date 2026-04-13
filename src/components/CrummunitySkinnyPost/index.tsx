import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    ScrollView,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Platform,
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
import DisplayBadge from '../General/akcrubadge';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';
import VideoPlayer from 'react-native-media-console';
import EngagementStatRow from '../EngagementStatRow/EngagementStatRow';
import {navigateToCrummunitySendMIT} from '../../util/RootNavigation';
import useAuthStore from '../../stores/auth.store';

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
    onFollow: () => void;
    onUnfollow: () => void;
    reportUser: () => void;
    isFollowing: boolean; // Add this to track follow status
    onDeletePost: (postId: number) => void;
    currentUserID?: string;
    akcruBadge?: string;
    onLikeOrUnlike: (postId: number) => void;
    CommentOnPostButton: any;
    handleDeletePost: (postId: number) => void;
    isLikedByCurrentUser?: boolean; // Assuming this property exists
    isSuggestedUser: boolean;
    isPromo: boolean;
    isOwner: boolean;
    onBlockUser: () => void;
    akcruBadgeColor: string;
    isAdmin: boolean; // Add this to check if the user is an admin
    visionaryStatus: boolean;
};

const SkinnyPostCard = ({
    post,
    loading,
    openProfile,
    onFollow,
    onUnfollow,
    reportUser,
    isFollowing,
    onDeletePost,
    currentUserID,
    akcruBadge,
    onLikeOrUnlike,
    CommentOnPostButton,
    isSuggestedUser,
    isPromo,
    isOwner,
    onBlockUser,
    akcruBadgeColor,
    isAdmin,
    isLikedByCurrentUser,
    visionaryStatus,
}: PostProps) => {
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

    // Conditional rendering of options in option modal
    const renderDeleteSkinny = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={handleDeletePost}>
                    <Icon name="trash" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Delete Skinny</Text>
                </Pressable>
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
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => {
                        onBlockUser();
                        closePostOptions(); // Close the modal
                    }}>
                    <Icon name="hand-left" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Block {post.author.username}</Text>
                </Pressable>
            );
        }
        return null;
    };
    const renderReportSkinny = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => {
                        reportUser(); // Call the report user function
                        closePostOptions(); // Close the modal
                    }}>
                    <Icon name="flag" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Report {post.author.username}</Text>
                </Pressable>
            );
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
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => {
                        onFollow(); // Call the report user function
                        closePostOptions(); // Close the modal
                    }}>
                    <Icon name="person" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>
                        {isFollowing ? `Unfollow ${post.author.username}` : `Follow ${post.author.username}`}
                    </Text>
                </Pressable>
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
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => {
                        // Navigate to the edit screen or open the edit modal
                        navigation.navigate('EditPostScreen', {post});
                        closePostOptions();
                    }}>
                    <Icon name="create" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Edit Post</Text>
                </Pressable>
            );
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
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                                <DisplayBadge akcruBadge={akcruBadge} />
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {!isCurrentUserAuthor && (
                                <Pressable onPress={onFollow} style={styles.followBtn}>
                                    <Text style={styles.followBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
                                </Pressable>
                            )}
                            <Pressable onPress={openPostOptions} hitSlop={8}>
                                <Icon
                                    name="ellipsis-horizontal"
                                    type="ionicon"
                                    color="rgba(255,255,255,0.7)"
                                    size={isTablet() ? 28 : 22}
                                />
                            </Pressable>
                        </View>
                    </View>

                    <View>
                        {imageUrls.map((url, index) => (
                            <TouchableOpacity key={index} onPress={() => openModal(url)}>
                                <Image source={{uri: url}} style={styles.mediaImage} />
                            </TouchableOpacity>
                        ))}
                    </View>
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

                    <Text style={{...FONTS.Username, color: 'rgba(255,255,255,0.35)', marginTop: 10, fontSize: 12}}>
                        {post.edited ? `Edited ${timeSince(post.updatedAt)}` : `Posted ${timeSince(post.createdAt)}`}
                        {post.edited && <Text style={{color: COLORS.PURPLE}}> (edited)</Text>}
                    </Text>

                    {headline ? (
                        <Text style={styles.headline}>{renderPostText(headline)}</Text>
                    ) : null}
                    {description ? (
                        <Text style={styles.descText}>{renderPostText(description)}</Text>
                    ) : !headline && primaryText ? (
                        <Text style={styles.descText}>{renderPostText(primaryText)}</Text>
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
                        onLike={() => onLikeOrUnlike(+post.id)}
                        onComment={CommentOnPostButton}
                        onMit={openCrummunityMIT}
                    />

                    <Pressable onPress={CommentOnPostButton} style={styles.commentBar}>
                        <Text style={styles.commentPlaceholder}>Add a comment...</Text>
                        <Icon name="send" type="ionicon" color="#9b59b6" size={22} />
                    </Pressable>

                    <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 8}}>
                        {post.isSuggestedUser ? (
                            <Text style={{...FONTS.paragraph1, color: COLORS.PINK, marginRight: 8}}>Suggested</Text>
                        ) : null}
                        {post.author.promoUser ? (
                            <Text style={{...FONTS.paragraph1, color: COLORS.PINK, marginRight: 8}}>Promo</Text>
                        ) : null}
                    </View>

                    <Modal visible={isPostOptionsVisible} transparent={true} animationType="fade">
                        <Pressable style={styles.postoptioncontainer} onPress={closePostOptions}>
                            <View style={styles.postoptionsmodal}>
                                {renderFollowUser()}
                                {renderBlockUser()}
                                {renderReportSkinny()}
                                {renderEditPostScreen()}
                                {renderDeleteSkinny()}
                            </View>
                        </Pressable>
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
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
