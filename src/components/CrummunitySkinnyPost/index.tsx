import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    ScrollView,
    TouchableWithoutFeedback,
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
import {IUserProfile} from '../../../types';
import CustomIcon from '../CustomIcon/CustomIcon';
import {MULTISIZES} from '../../../assets/constants/theme';
import DisplayBadge from '../General/akcrubadge';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {findAUser} from '../../lib/api/user.lib';
import {useNavigation} from '@react-navigation/native';

type FooterIconsProps = {
    iconname: string;
    onPress: () => void;
    color: string;
};

const FooterIcons = ({iconname, onPress, color}: FooterIconsProps) => {
    return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={onPress}>
                <Icon name={iconname} type="ionicon" color={color} size={18} />
            </TouchableOpacity>
        </View>
    );
};

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
};

type PostProps = {
    post: PostType;
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
};

const SkinnyPostCard = ({
    post,
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
}: PostProps) => {
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');

    const [isPostOptionsVisible, setPostOptionsVisible] = useState(false);

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);

    const [shareOptionsVisible, setShareOptionsVisible] = useState(false);

    const likeIconColor = post.isLikedByCurrentUser ? COLORS.PURPLE : COLORS.AKCRUBLUE;

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    // Check if the current user is the author of the post
    const isCurrentUserAuthor = post.author.id === currentUserID;

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const handleDeletePost = () => {
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

    const openShareOptions = () => {
        setShareOptionsVisible(true);
    };

    const closeShareOptions = () => {
        setShareOptionsVisible(false);
    };

    // Conditional rendering of options in option modal
    const renderDeleteSkinny = () => {
        if (isCurrentUserAuthor) {
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

    const openProfileForTag = async (username) => {
        const taggedUser = await findAUser({username});
        if (taggedUser) {
            navigation.navigate('ViewUserScreen', {userID: taggedUser.id});
        } else {
            return;
        }
    };

    const renderPostText = (text) => {
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

    const {textContent, imageUrls, videoUrl} = classifyPostContent(post.content);

    return (
        <View style={styles.cardcontainer}>
            <LinearGradient
                // Background Linear Gradient
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
                    <TouchableOpacity onPress={() => openProfile()}>
                        <HexAvatar
                            source={{uri: post.author?.profilePicture}}
                            size={MULTISIZES.Xlarge60}
                            bordercolor={akcruBadgeColor}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...FONTS.Username}}>{post.author?.username}</Text>
                        {post?.author.ownerStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.STARGOLD}
                                baseSize={12}
                                style={{marginRight: 5}}
                            />
                        )}
                        {post?.author.companyStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.WHITE}
                                baseSize={12}
                                style={{marginRight: 5}}
                            />
                        )}
                        {post?.author.influencerStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                baseSize={12}
                                style={{marginRight: 5}}
                            />
                        )}
                        {post?.author.blackCloakStatus && (
                            <CustomIcon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.BLACKCLOAK}
                                baseSize={12}
                                style={{marginRight: 5}}
                            />
                        )}
                    </View>
                    <Text style={{...FONTS.paragraph1}}>{post.author?.firstName}</Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <DisplayBadge akcruBadge={akcruBadge} />
                    </View>
                </View>
                <View style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginTop: -3}}>
                    <Pressable onPress={openPostOptions}>
                        <Icon name="ellipsis-horizontal" type="ionicon" color={COLORS.AKCRUBLUE} size={20} />
                    </Pressable>
                </View>
                <Modal visible={isPostOptionsVisible} transparent={true} animationType="fade">
                    <Pressable style={styles.postoptioncontainer} onPress={closePostOptions}>
                        <View style={styles.postoptionsmodal}>
                            {renderFollowUser()}
                            {/* {renderMuteUser()} */}
                            {renderBlockUser()}
                            {renderDeleteSkinny()}
                            {renderReportSkinny()}
                            {renderEditPostScreen()}
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
            </View>
            <Text style={{...FONTS.Username, color: COLORS.TRANSAKCRUBLUE, marginRight: 10}}>
                {/* {timeSince(post.createdAt)} */}
                {post.edited ? `Edited ${timeSince(post.updatedAt)}` : `Posted ${timeSince(post.createdAt)}`}
                {post.edited && <Text style={{...FONTS.Username, color: COLORS.PURPLE}}> (edited)</Text>}
            </Text>
            {/* Render text if available */}
            {/* {textContent && (
                <View style={{marginTop: 10}}>
                    <Text style={styles.post}>{renderPostText(textContent)}</Text>
                </View>
            )} */}
            {post.edited && post.editedText ? (
                <View style={{marginTop: 10}}>
                    <Text style={styles.post}>{renderPostText(post.editedText)}</Text>
                </View>
            ) : (
                textContent && (
                    <View style={{marginTop: 10}}>
                        <Text style={styles.post}>{renderPostText(textContent)}</Text>
                    </View>
                )
            )}

            <View>
                {/* Render images */}
                {imageUrls.map((url, index) => (
                    <TouchableOpacity key={index} onPress={() => openModal(url)}>
                        <Image source={{uri: url}} style={styles.postimage} />
                    </TouchableOpacity>
                ))}
            </View>
            <View>
                {/* Render video if available */}
                {videoUrl && (
                    <TouchableOpacity onPress={() => openVideoModal(videoUrl)}>
                        <View style={styles.postvideo}>
                            <Video
                                ref={topVideoRef}
                                style={styles.videoStyle}
                                source={{uri: videoUrl}}
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
                        source={{uri: videoUrl}}
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
            <View style={styles.postfooter}>
                <FooterIcons iconname={'chatbox'} onPress={CommentOnPostButton} color={COLORS.AKCRUBLUE} />
                {/* <FooterIcons iconname={'happy'} onPress={handleLikePress} /> */}
                <FooterIcons iconname={'happy'} onPress={() => onLikeOrUnlike(+post.id)} color={likeIconColor} />
                {/* <FooterIcons
                    iconname={'sync'}
                    onPress={() => {
                        ('');
                    }}
                    color={COLORS.AKCRUBLUE}
                /> */}
                {/* <FooterIcons
                    iconname={'stats-chart'}
                    text={post.impressions || 0}
                    onPress={() => {
                        ('');
                    }}
                /> */}
                {/* <FooterIcons iconname={'share-social'} onPress={openShareOptions} /> */}
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={styles.footStats}>
                    {post._count?.comments || 0} Comments • {post._count?.likes || 0} Likes
                    {/* •{' '}{post.numberOfReposts || 0} Repost */}
                </Text>

                {post.isSuggestedUser && <Text style={{...FONTS.paragraph1, color: COLORS.PINK}}>Suggested User</Text>}
                {post.author.ownerStatus && (
                    <Text style={{...FONTS.paragraph1, color: COLORS.PINK}}>Suggested User</Text>
                )}
                {post.author.promoUser && <Text style={{...FONTS.paragraph1, color: COLORS.PINK}}>Promo</Text>}
            </View>
        </View>
    );
};

export default SkinnyPostCard;
