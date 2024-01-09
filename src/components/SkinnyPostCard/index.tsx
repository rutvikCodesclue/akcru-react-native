import {View, Text, TouchableOpacity, Image, Modal, Pressable, ScrollView} from 'react-native';
import React, {useRef, useState} from 'react';
import styles from './styles';
import {Avatar, Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';
import HexAvatar from '../HexAvatar';
import {timeSince} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {deletePost} from '../../lib/api/post.lib';

type FooterIconsProps = {
    iconname: string;
    onPress: () => void;
};

const FooterIcons = ({iconname, onPress}: FooterIconsProps) => {
    return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={onPress}>
                <Icon name={iconname} type="ionicon" color={COLORS.AKCRUBLUE} size={18} />
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
    content: string;
    author: User;
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    likes?: number;
    impressions?: number;
    _count?: PostStats;
};

type PostProps = {
    post: PostType;
    openProfile: () => void;
    onLike: (postId: string) => void;
    onUnlike: (postId: string) => void;
    onFollow: () => void;
    onUnfollow: () => void;
    isFollowing: boolean; // Add this to track follow status
    isPostLiked: boolean; // Add this to track like status
    onDeletePost: any;
    currentUserID: string;
    deleteThePost: () => void;
    akcruBadge?: string;
};

const PostCard = ({
    post,
    openProfile,
    onLike,
    onUnlike,
    onFollow,
    onUnfollow,
    isFollowing,
    isPostLiked,
    onDeletePost,
    currentUserID,
    deleteThePost,
    akcruBadge
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

    // Check if the current user is the author of the post
    const isCurrentUserAuthor = post.author.id === currentUserID;

    // const handleDeletePost = async () => {
    //     try {
    //         await deletePost(post.id);
    //         onDeletePost(post.id); // Inform parent component to remove the post from its state
    //     } catch (error) {
    //         console.error('Error deleting the post:', error);
    //     }
    // };

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

    const handleLikePress = () => {
        if (isPostLiked) {
            // Assuming `existingLike` is a field in your post object
            onUnlike(post.id);
        } else {
            onLike(post.id);
        }
    };

    // Conditional rendering of options in option modal
    const renderDeleteSkinny = () => {
        if (isCurrentUserAuthor) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={deleteThePost}>
                    <Icon name="trash" type="ionicon" color={COLORS.MIDORANGE} size={20} style={{marginLeft: 5}} />
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
                    <Icon name="flag" type="ionicon" color={COLORS.MIDORANGE} size={20} style={{marginLeft: 5}} />
                    <Text style={{...FONTS.Title2, paddingLeft: 12}}>Report Skinny</Text>
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

    const handleFollowPress = () => {
        if (isFollowing) {
            onUnfollow();
        } else {
            onFollow();
        }
    };

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
                            size={70}
                            bordercolor={COLORS.AKCRUBLUE}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...FONTS.Title2, fontSize: 12}}>{post.author?.username}</Text>
                        {post.author?.influencer && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                size={15}
                                style={{marginLeft: 5}}
                            />
                        )}
                    </View>
                    <Text style={{...FONTS.paragraph1, fontSize: 12}}>{post.author?.firstName}</Text>

                    {akcruBadge === 'AKCRUIT' && (
                        <View>
                            <AkcruLevels.AkcruBadgeAkcruit />
                        </View>
                    )}
                    {akcruBadge === 'HERO' && (
                        <View>
                            <AkcruLevels.AkcruBadgeGuardian />
                        </View>
                    )}
                    {akcruBadge === 'SUPERHERO' && (
                        <View>
                            <AkcruLevels.AkcruBadgeHero />
                        </View>
                    )}
                    {akcruBadge === 'GUARDIAN' && (
                        <View>
                            <AkcruLevels.AkcruBadgeSuperHero />
                        </View>
                    )}
                </View>
                {/* <View style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.MIDORANGE, marginRight: 10}}>
                        {timeSince(post.createdAt)}
                    </Text>
                    <Pressable onPress={openPostOptions}>
                        <Icon name="ellipsis-horizontal" type="ionicon" color={COLORS.MIDORANGE} size={20} />
                    </Pressable>
                </View> */}
                <Modal visible={isPostOptionsVisible} transparent={true} animationType="slide">
                    <Pressable style={styles.postoptioncontainer} onPress={closePostOptions}>
                        <View style={styles.postoptionsmodal}>
                            {renderNotInterested()}
                            {/* <Pressable
                                style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                                onPress={handleFollowPress}>
                                <Icon
                                    name="person"
                                    type="ionicon"
                                    color={COLORS.MIDORANGE}
                                    size={20}
                                    style={{marginLeft: 5}}
                                />
                                <Text style={{...FONTS.Title2, paddingLeft: 12}}>
                                    {isFollowing ? 'Unfollow' : 'Follow'} {post.author.username}
                                </Text>
                            </Pressable> */}
                            {renderMuteUser()}
                            {renderBlockUser()}
                            {renderDeleteSkinny()}
                            {renderReportSkinny()}
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
            <View style={{marginTop: 10}}>
                <Text style={styles.post}>{post.content}</Text>
            </View>

            <View>
                {post.image && (
                    <TouchableOpacity onPress={() => openModal(post.image)}>
                        <Image src={post.image} style={styles.postimage} />
                    </TouchableOpacity>
                )}
            </View>
            <View>
                {post.video && (
                    <TouchableOpacity onPress={() => openVideoModal(post.video)}>
                        <View style={styles.postvideo}>
                            <Video
                                ref={topVideoRef}
                                style={{width: '100%', height: '100%', borderRadius: 10}}
                                source={{uri: post.video}}
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
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}>
                    <Video
                        ref={modalVideoRef}
                        style={{width: '100%', height: '100%'}}
                        source={{uri: post.video}}
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
                <FooterIcons
                    iconname={'chatbox'}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons iconname={'happy'} onPress={handleLikePress} />
                <FooterIcons
                    iconname={'sync'}
                    onPress={() => {
                        ('');
                    }}
                />
                {/* <FooterIcons
                    iconname={'stats-chart'}
                    text={post.impressions || 0}
                    onPress={() => {
                        ('');
                    }}
                /> */}
                {/* <FooterIcons iconname={'share-social'} onPress={openShareOptions} /> */}
            </View>
            <View>
                <Text style={styles.footStats}>
                    {post._count?.comments || 0} Comments • {post._count?.likes || 0} Likes •{' '}
                    {post.numberOfReposts || 0} Repost
                </Text>
            </View>
        </View>
    );
};

export default PostCard;
