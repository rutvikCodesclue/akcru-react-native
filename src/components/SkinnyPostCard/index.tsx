import {View, Text, TouchableOpacity, Image, Modal, Pressable, ScrollView} from 'react-native';
import React, {useRef, useState} from 'react';
import styles from './styles';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
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
import CustomIcon from '../CustomIcon/CustomIcon';

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

    const likeIconColor = post.isLikedByCurrentUser ? COLORS.PURPLE : COLORS.AKCRUBLUE;

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

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
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Mute {post.author.username}</Text>
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
                            size={70}
                            bordercolor={akcruBadgeColor}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...FONTS.Username, marginRight: 2}}>{post.author?.username}</Text>
                        {post?.author.ownerStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.STARGOLD}
                                size={18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {post?.author.companyStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.WHITE}
                                size={18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {post.author.influencerStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                size={18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {post?.author.blackCloakStatus && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.BLACKCLOAK}
                                size={18}
                                style={{marginRight: 0}}
                            />
                        )}
                        {post?.author.isAdmin && (
                            <CustomIcon
                                name="police-badge"
                                type="material-community"
                                color={COLORS.STARGOLD}
                                baseSize={12}
                                style={{marginRight: 0}}
                            />
                        )}
                    </View>
                    <Text style={{...FONTS.paragraph1}}>{post.author?.firstName}</Text>

                    <DisplayBadge akcruBadge={akcruBadge} />
                </View>
                <View style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', marginTop: -4}}>
                    <Pressable onPress={openPostOptions}>
                        <Icon name="ellipsis-horizontal" type="ionicon" color={COLORS.AKCRUBLUE} size={20} />
                    </Pressable>
                </View>
                <Modal visible={isPostOptionsVisible} transparent={true} animationType="fade">
                    <Pressable style={styles.postoptioncontainer} onPress={closePostOptions}>
                        <View style={styles.postoptionsmodal}>
                            {renderFollowUser()}

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
                                repeat={true}
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
            </View>
            <View>
                <Text style={styles.footStats}>
                    {post._count?.comments || 0} Comments • {post._count?.likes || 0} Likes
                </Text>
            </View>
        </View>
    );
};

export default PostCard;
