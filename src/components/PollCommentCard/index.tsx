import {View, Text, TouchableOpacity, Image, Modal, Pressable} from 'react-native';
import React, {useRef, useState} from 'react';
import styles from './styles';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';
import HexAvatar from '../HexAvatar';
import {classifyPostContent, timeSince} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {IPoll, IPollComment} from '../../../types';
import DisplayBadge from '../General/akcrubadge';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';
import CustomIcon from '../CustomIcon/CustomIcon';
import { isTablet } from '../../../assets/constants/theme';

type FooterIconsProps = {
    iconname: string;
    onPress: () => void;
    color: string;
};

const FooterIcons = ({iconname, onPress, color}: FooterIconsProps) => (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity onPress={onPress}>
            <Icon name={iconname} type="ionicon" color={color} size={isTablet() ? 25 : 18} />
        </TouchableOpacity>
    </View>
);

type PollProps = {
    poll: IPoll;
    openProfile: () => void;
    onFollow: () => void;
    onUnfollow: () => void;
    isFollowing: boolean; // Add this to track follow status
    onDeleteComment: () => void;
    currentUserID?: string;
    akcruBadge?: string;
    onLikeOrUnlike: (pollId: string) => void;
    CommentOnPostButton: any;
    handleDeletePost: (pollId: string) => void;
    comment: IPollComment;
    likeCount: number;
    userName: string;
    firstName: string;
    akcruBadgeColor: string;
    onEditComment: () => void;
    isAdmin: boolean;
};

const PollCommentCard = ({
    comment,
    openProfile,
    onFollow,
    onUnfollow,
    isFollowing,
    onDeleteComment,
    currentUserID,
    akcruBadge,
    onLikeOrUnlike,
    likeCount,
    userName,
    firstName,
    akcruBadgeColor,
    onEditComment,
    isAdmin,
}: PollProps) => {
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

    const isCurrentUserAuthor = comment.user?.id === currentUserID;

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    // Determine the color for the "happy" icon based on whether the post is liked by the current user
    const likeIconColor = comment.isLikedByCurrentUser ? COLORS.PURPLE : COLORS.AKCRUBLUE;

    const openModal = image => {
        setSelectedImage(image);
        setImageModalVisible(true);
    };

    const openVideoModal = video => {
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

    const renderDeleteComment = () => {
        if (isCurrentUserAuthor || isAdmin) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={onDeleteComment}>
                    <Icon name="trash" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Delete Comment</Text>
                </Pressable>
            );
        }
        return null;
    };

    const renderMuteUser = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Icon
                        name="volume-mute"
                        type="ionicon"
                        color={COLORS.MIDORANGE}
                        size={20}
                        style={{marginLeft: 5}}
                    />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Mute {comment.user?.username}</Text>
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
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Block {comment.user?.username}</Text>
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
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Report {comment.user?.username}</Text>
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
                        onFollow();
                        closePostOptions();
                    }}>
                    <Icon name="person" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>
                        {isFollowing ? `Unfollow ${comment.user?.username}` : `Follow ${comment.user?.username}`}
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

    const renderEditCommentScreen = () => {
        if (isCurrentUserAuthor) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => {
                        closePostOptions();
                        onEditComment();
                    }}>
                    <Icon name="create" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Edit Comment</Text>
                </Pressable>
            );
        }
        return null;
    };

    const {textContent, imageUrls, videoUrl} = classifyPostContent(comment.content);

    return (
        <View style={styles.cardcontainer}>
            <LinearGradient
                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
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
                    <TouchableOpacity onPress={openProfile}>
                        <HexAvatar
                            source={{uri: comment.user?.profilePicture}}
                            size={isTablet() ? 75 : 58}
                            bordercolor={akcruBadgeColor}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...FONTS.Username, marginRight: 2}}>{userName}</Text>
                        {comment?.user.ownerStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.STARGOLD}
                                size={isTablet() ? 25 : 18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {comment?.user.companyStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.WHITE}
                                size={isTablet() ? 25 : 18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {comment?.user.influencerStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                size={isTablet() ? 25 : 18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {comment?.user.blackCloakStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.BLACKCLOAK}
                                size={isTablet() ? 25 : 18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {comment?.user.isAdmin && (
                            <CustomIcon
                                name="police-badge"
                                type="material-community"
                                color={COLORS.STARGOLD}
                                baseSize={isTablet() ? 18 : 12}
                                style={{marginRight: 0}}
                            />
                        )}
                        {comment?.user.visionaryStatus && (
                            <Icon
                                name="diamond-stone"
                                type="material-community"
                                color={COLORS.WHITE}
                                size={isTablet() ? 25 : 18}
                                style={{marginRight: 0}}
                            />
                        )}
                    </View>
                    <Text style={{...FONTS.paragraph1}}>{firstName}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <DisplayBadge akcruBadge={akcruBadge} />
                    </View>
                </View>
                <View style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginTop: -3}}>
                    <Pressable onPress={openPostOptions}>
                        <Icon
                            name="ellipsis-horizontal"
                            type="ionicon"
                            color={COLORS.AKCRUBLUE}
                            size={isTablet() ? 32 : 20}
                        />
                    </Pressable>
                </View>
                <Modal visible={isPostOptionsVisible} transparent={true} animationType="fade">
                    <Pressable style={styles.postoptioncontainer} onPress={closePostOptions}>
                        <View style={styles.postoptionsmodal}>
                            {renderFollowUser()}
                            {renderDeleteComment()}
                            {renderReportSkinny()}
                            {renderEditCommentScreen()}
                        </View>
                    </Pressable>
                </Modal>
            </View>
            <Text style={{...FONTS.Username, color: COLORS.TRANSAKCRUBLUE, marginRight: 10}}>
                {comment.edited ? `Edited ${timeSince(comment.updatedAt)}` : `Posted ${timeSince(comment.createdAt)}`}
                {comment.edited && <Text style={{...FONTS.Username, color: COLORS.PURPLE}}> (edited)</Text>}
            </Text>
            {comment.edited && comment.editedText ? (
                <View style={{marginTop: 10}}>
                    <Text style={styles.post}>{renderPostText(comment.editedText)}</Text>
                </View>
            ) : (
                textContent && (
                    <View style={{marginTop: 10}}>
                        <Text style={styles.post}>{renderPostText(textContent)}</Text>
                    </View>
                )
            )}

            <View>
                {imageUrls.map((url, index) => (
                    <TouchableOpacity key={index} onPress={() => openModal(url)}>
                        <Image source={{uri: url}} style={styles.postimage} />
                    </TouchableOpacity>
                ))}
            </View>
            <View>
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
                                color={COLORS.MIDORANGE}
                                btnname={'Skip'}
                                onPress={handleSkipVideo}
                                disabled={false}
                            />
                        </View>
                    )}
                </View>
            </Modal>
            <View style={styles.postfooter}>
                <FooterIcons iconname={'happy'} onPress={() => onLikeOrUnlike(comment.id)} color={likeIconColor} />
            </View>
            <View>
                <Text style={styles.footStats}>{likeCount} Likes</Text>
            </View>
        </View>
    );
};

export default PollCommentCard;
