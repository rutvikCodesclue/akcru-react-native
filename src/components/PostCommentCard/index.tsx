import {View, Text, TouchableOpacity, Image, Modal, Pressable} from 'react-native';
import React, {useRef, useState} from 'react';
import styles from './styles';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';
import {classifyPostContent, timeSince} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {IUserProfile} from '../../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';
import {isTablet} from '../../../assets/constants/theme';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';
import {resolveAkcruBadgeConfig} from '../ProfileUserBadges';
import PostImageCarousel from '../PostImageCarousel';

type FooterIconsProps = {
    iconname: string;
    onPress: () => void;
    color: string;
};

const FooterIcons = ({iconname, onPress, color}: FooterIconsProps) => {
    return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={onPress}>
                <Icon name={iconname} type="ionicon" color={color} size={isTablet() ? 25 : 18} />
            </TouchableOpacity>
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
    content: string;
    author: IUserProfile;
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    likes?: number;
    impressions?: number;
    _count?: PostStats;
};

type CommentType = {
    id: string;
    content: string;
    author: IUserProfile;
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    likes?: number;
    impressions?: number;
    _count?: PostStats;
    isLikedByCurrentUser?: boolean;
};

type PostProps = {
    post: PostType;
    openProfile: () => void;
    onFollow: () => void;
    onUnfollow: () => void;
    isFollowing: boolean; // Add this to track follow status
    onDeleteComment: () => void;
    currentUserID?: string;
    akcruBadge?: string;
    onLikeOrUnlike: (postId: number) => void;
    CommentOnPostButton: any;
    handleDeletePost: (postId: number) => void;
    comment: any;
    likeCount: number;
    userName: string;
    firstName: string;
    akcruBadgeColor: string;
    onEditComment: () => void;
    isAdmin: boolean;
    isCommentLiked?: boolean;
    onBlockUser?: () => void;
};

const PostCommentCard = ({
    comment,
    post,
    openProfile,
    onFollow,
    onUnfollow,
    isFollowing,
    onDeleteComment,
    currentUserID,
    akcruBadge,
    onLikeOrUnlike,
    CommentOnPostButton,
    likeCount,
    userName,
    firstName,
    akcruBadgeColor,
    onEditComment,
    isAdmin,
}: PostProps) => {
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');

    const [isPostOptionsVisible, setPostOptionsVisible] = useState(false);

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);

    const isLiked = !!post.isLikedByCurrentUser;
    const likeIconColor = isLiked ? '#ff3b30' : COLORS.OVERLAY_WHITE_60;
    const author = post?.author ?? null;

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    // Check if the current user is the author of the post
    const isCurrentUserAuthor = post.author?.id === currentUserID;

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

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

    const renderDeleteComment = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return renderOptionRow('delete', 'Delete Comment', 'trash-outline', 'ionicon', onDeleteComment);
        }
        return null;
    };
    const renderReportSkinny = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow('report', `Report ${author?.username ?? 'user'}`, 'flag-outline', 'ionicon');
        }
        return null;
    };
    const renderFollowUser = () => {
        if (!isCurrentUserAuthor) {
            return renderOptionRow(
                'follow',
                isFollowing ? `Unfollow ${author?.username ?? 'user'}` : `Follow ${author?.username ?? 'user'}`,
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

    const renderEditCommentScreen = () => {
        if (isCurrentUserAuthor) {
            return renderOptionRow('edit', 'Edit Comment', 'create-outline', 'ionicon', () => {
                closePostOptions();
                onEditComment();
            });
        }
        return null;
    };

    const {textContent, imageUrls, videoUrl} = classifyPostContent(post.content);
    const badgeConfig = resolveAkcruBadgeConfig(author?.badge);

    return (
        <View style={styles.cardcontainer}>
            <LinearGradient colors={['rgba(16,20,30,0.95)', 'rgba(8,10,16,0.92)']} style={styles.cardGlow} />
            <View style={styles.headerRow}>
                <View style={styles.avatarWrap}>
                    <TouchableOpacity onPress={() => openProfile()}>
                        <HexAvatar
                            source={{uri: author?.profilePicture}}
                            size={isTablet() ? 62 : 46}
                            bordercolor={akcruBadgeColor}
                            rotateFrameDegrees={90}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerContent}>
                    <View style={styles.identityRow}>
                        <Text style={styles.userName}>{userName}</Text>
                        {(author?.influencerStatus || author?.ownerStatus) && (
                            <Icon
                                name="checkmark-circle"
                                type="ionicon"
                                color="#3498db"
                                size={isTablet() ? 16 : 14}
                                style={styles.roleIcon}
                            />
                        )}
                        {author?.ownerStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.STARGOLD}
                                baseSize={isTablet() ? 14 : 12}
                                style={styles.roleIcon}
                            />
                        )}
                        {author?.companyStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.WHITE}
                                baseSize={isTablet() ? 14 : 12}
                                style={styles.roleIcon}
                            />
                        )}
                        {author?.influencerStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                baseSize={isTablet() ? 14 : 12}
                                style={styles.roleIcon}
                            />
                        )}
                        {author?.blackCloakStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.BLACKCLOAK}
                                baseSize={isTablet() ? 14 : 12}
                                style={styles.roleIcon}
                            />
                        )}
                        {author?.isAdmin && (
                            <CustomIcon
                                name="police-badge"
                                type="material-community"
                                color={COLORS.STARGOLD}
                                baseSize={isTablet() ? 14 : 12}
                                style={styles.roleIcon}
                            />
                        )}
                        {author?.visionaryStatus && (
                            <CustomIcon
                                name="diamond-stone"
                                type="material-community"
                                color={COLORS.WHITE}
                                baseSize={isTablet() ? 14 : 12}
                                style={styles.roleIcon}
                            />
                        )}
                    </View>
                    {badgeConfig ? (
                        <LinearGradient
                            colors={[`${badgeConfig.color}24`, `${badgeConfig.color}40`]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.badgePill}>
                            <Text style={[styles.badgePillText, {color: badgeConfig.color}]}>{badgeConfig.label}</Text>
                        </LinearGradient>
                    ) : null}
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                            {post.edited
                                ? `Edited ${timeSince(post.updatedAt)}`
                                : `Posted ${timeSince(post.createdAt)}`}
                        </Text>
                        {post.edited && (
                            <Icon
                                name="create-outline"
                                type="ionicon"
                                color={COLORS.PURPLE}
                                size={16}
                                style={styles.metaIcon}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.menuWrap}>
                    <Pressable onPress={openPostOptions}>
                        <Icon name="ellipsis-horizontal" type="ionicon" color={COLORS.OVERLAY_WHITE_72} size={20} />
                    </Pressable>
                </View>
                <Modal visible={isPostOptionsVisible} transparent={true} animationType="slide">
                    <Pressable style={styles.sheetBackdrop} onPress={closePostOptions} />
                    <LinearGradient
                        colors={['#4f46e5', '#7c3aed', '#ec4899']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.mediaSheetGradientBorder}>
                        <View style={styles.mediaSheet}>
                            <Text style={styles.mediaSheetTitle}>Comment options</Text>
                            <View style={styles.optionsList}>
                                {renderFollowUser()}
                                {renderDeleteComment()}
                                {renderReportSkinny()}
                                {renderEditCommentScreen()}
                            </View>
                        </View>
                    </LinearGradient>
                </Modal>
            </View>

            {post.edited && post.editedText ? (
                <View style={styles.bodyWrap}>
                    <Text style={styles.post}>{renderPostText(post.editedText)}</Text>
                </View>
            ) : (
                textContent && (
                    <View style={styles.bodyWrap}>
                        <Text style={styles.post}>{renderPostText(textContent)}</Text>
                    </View>
                )
            )}

            {imageUrls.length > 0 ? (
                <PostImageCarousel
                    imageUrls={imageUrls}
                    onImagePress={openModal}
                    imageStyle={styles.postimage}
                    containerStyle={styles.mediaCarouselWrap}
                />
            ) : null}
            <View>
                {/* Render video if available */}
                {videoUrl && (
                    <TouchableOpacity onPress={() => openVideoModal(videoUrl)}>
                        <View style={styles.postvideo}>
                            <Video
                                ref={topVideoRef}
                                style={{width: '100%', height: '100%', borderRadius: 10}}
                                source={{uri: videoUrl}}
                                resizeMode="cover"
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
            {/* Image Modal */}
            <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: COLORS.OVERLAY_BLACK_90,
                    }}>
                    <Image source={{uri: selectedImage}} style={{width: '95%', height: '95%'}} resizeMode="contain" />
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={{color: COLORS.MIDORANGE, fontSize: 14, marginTop: 20}}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            {/* Video Modal */}
            <Modal visible={isVideoModalVisible} transparent={true} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: COLORS.OVERLAY_BLACK_90,
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
                                color={COLORS.MIDORANGE}
                                btnname={'Skip'}
                                onPress={handleSkipVideo}
                                disabled={false}
                            />
                        </View>
                    )}
                </View>
            </Modal>
            <View style={styles.footerRow}>
                <View style={styles.postfooter}>
                    <FooterIcons
                        iconname={isLiked ? 'heart' : 'heart-outline'}
                        onPress={() => onLikeOrUnlike(+post.id)}
                        color={likeIconColor}
                    />
                </View>
                <Text style={styles.footStats}>{likeCount} Likes</Text>
            </View>
        </View>
    );
};

export default PostCommentCard;
