import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import React, {useRef, useState} from 'react';
import styles from './styles';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';
import HexAvatar from '../HexAvatar';
import {classifyPostContent, timeSince} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import DisplayBadge from '../General/akcrubadge';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';
import {navigateToCrummunitySendMIT} from '../../util/RootNavigation';
import CustomIcon from '../CustomIcon/CustomIcon';
import {isTablet} from '../../../assets/constants/theme';
import EngagementStatRow from '../EngagementStatRow/EngagementStatRow';
import {IUserProfile} from '../../../types';

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
};

type PostStats = {
    comments: number;
    likes: number;
    reposts: number;
};

type PostType = {
    id: string;
    content: any;
    author: User;
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    likes?: number;
    impressions?: number;
    _count?: PostStats;
    edited: boolean;
    editedText: string;
    updatedAt: string;
    isLikedByCurrentUser: boolean;
};

type PostProps = {
    post: PostType;
    loading?: boolean;
    openProfile: () => void;
    onFollow: () => void;
    onUnfollow: () => void;
    isFollowing: boolean;
    onDeletePost: (postId: number) => void;
    currentUserID: string;
    akcruBadge?: string;
    onLikeOrUnlike: (postId: number) => void;
    CommentOnPostButton: any;
    handleDeletePost: (postId: number) => void;
    isLikedByCurrentUser?: boolean;
    akcruBadgeColor: string;
    isAdmin: boolean;
};

const PostCard = ({
    post,
    loading,
    openProfile,
    onFollow,
    onUnfollow,
    isFollowing,
    onDeletePost,
    currentUserID,
    akcruBadge,
    onLikeOrUnlike,
    CommentOnPostButton,
    akcruBadgeColor,
    isAdmin,
}: PostProps) => {
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');

    const [isPostOptionsVisible, setPostOptionsVisible] = useState(false);

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);

    const [shareOptionsVisible, setShareOptionsVisible] = useState(false);

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    const isCurrentUserAuthor = post.author.id === currentUserID;

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

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

    const renderBlockUser = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Icon name="hand-left" type="ionicon" color={COLORS.MIDORANGE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Block {post.author.username}</Text>
                </Pressable>
            );
        }
        return null;
    };

    const renderReportSkinny = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Icon name="flag" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Report {post.author.username}</Text>
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
                        onFollow();
                        closePostOptions();
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
            }
        } catch (error) {
            console.error('Error finding user:', error);
        }
    };

    const renderPostText = text => {
        const parts = text.split(/(@[\w._-]+)/g);
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

    const auth = post.author as any;

    const {textContent, imageUrls, videoUrl} = classifyPostContent(post.content);
    const userIcons = isTablet() ? 25 : 18;
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
        [post.author?.firstName, auth.lastName].filter(Boolean).join(' ').trim() || post.author?.username || '';
    const userHandle = post.author?.username || '';

    const openCrummunityMIT = () => {
        if (isCurrentUserAuthor) {
            return;
        }
        const a = auth as Record<string, unknown>;
        navigateToCrummunitySendMIT({
            recipientId: String(post.author.id),
            profilePicture: post.author.profilePicture,
            firstName: post.author.firstName,
            lastName: typeof a.lastName === 'string' ? a.lastName : undefined,
            username: post.author.username,
            dateOfBirth: typeof a.dateOfBirth === 'string' ? a.dateOfBirth : undefined,
            location: typeof a.location === 'string' ? a.location : undefined,
            badge: typeof a.badge === 'string' ? (a.badge as IUserProfile['badge']) : undefined,
            influencerStatus: a.influencerStatus,
            ownerStatus: a.ownerStatus,
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
                                {(auth.influencerStatus || auth.ownerStatus) && (
                                    <Icon
                                        name="checkmark-circle"
                                        type="ionicon"
                                        color="#3498db"
                                        size={userIcons + 2}
                                        style={{marginLeft: 4}}
                                    />
                                )}
                                {auth.ownerStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.STARGOLD}
                                        size={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {auth.companyStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        size={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {auth.influencerStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        size={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {auth.blackCloakStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        size={userIcons}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {auth.isAdmin && (
                                    <CustomIcon
                                        name="police-badge"
                                        type="material-community"
                                        color={COLORS.STARGOLD}
                                        baseSize={isTablet() ? 18 : 12}
                                        style={{marginLeft: 2}}
                                    />
                                )}
                                {auth.visionaryStatus && (
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
                            <TouchableOpacity onPress={() => openVideoModal(videoUrl)}>
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
                                    <Video
                                        ref={topVideoRef}
                                        style={styles.videoStyle}
                                        source={{uri: videoUrl}}
                                        resizeMode="cover"
                                        onEnd={handleVideoEnd}
                                        repeat={true}
                                        onError={handleVideoError}
                                        onLoad={handleVideoLoad}
                                        muted={true}
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
                        mitCount={(post as any).mitCount ?? (post as any).impressions ?? 0}
                        isLiked={!!post.isLikedByCurrentUser}
                        onLike={() => onLikeOrUnlike(+post.id)}
                        onComment={CommentOnPostButton}
                        onMit={openCrummunityMIT}
                    />

                    <Pressable onPress={CommentOnPostButton} style={styles.commentBar}>
                        <Text style={styles.commentPlaceholder}>Add a comment...</Text>
                        <Icon name="send" type="ionicon" color="#9b59b6" size={22} />
                    </Pressable>

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
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            }}>
                            <Image source={{uri: selectedImage}} style={{width: '95%', height: '95%'}} resizeMode="contain" />
                            <TouchableOpacity onPress={closeModal}>
                                <Text style={{color: COLORS.MIDORANGE, fontSize: 14, marginTop: 20}}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>

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
                                source={{uri: videoUrl}}
                                resizeMode="cover"
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
                    <Text style={{marginTop: 8, color: COLORS.WHITE, fontSize: 16}}>Deleting post...</Text>
                </View>
            )}
        </View>
    );
};

export default PostCard;
