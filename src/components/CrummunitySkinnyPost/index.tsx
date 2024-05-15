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
import AkcruLevels from '../akcruBadges';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';
import HexAvatar from '../HexAvatar';
import {classifyPostContent, timeSince} from '../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import {IUserProfile} from '../../../types';
import CustomIcon from '../CustomIcon/CustomIcon';
import {MULTISIZES} from '../../../assets/constants/theme';

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

type PostStats = {
    comments: number;
    likes: number;
    reposts: number;
};

type PostType = {
    isSuggestedUser: React.JSX.Element;
    isLikedByCurrentUser: any;
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

type PostProps = {
    post: PostType;
    openProfile: () => void;
    onFollow: () => void;
    onUnfollow: () => void;
    reportUser: () => void;
    isFollowing: boolean;
    onDeletePost: (postId: number) => void;
    currentUserID?: string;
    akcruBadge?: string;
    onLikeOrUnlike: (postId: number) => void;
    CommentOnPostButton: any;
    handleDeletePost: (postId: number) => void;
    isLikedByCurrentUser?: boolean;
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
    reportUser,
    isFollowing,
    onDeletePost,
    currentUserID,
    akcruBadge,
    onLikeOrUnlike,
    CommentOnPostButton,
    onBlockUser,
    akcruBadgeColor,
}: PostProps) => {
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);

    const [isPostOptionsVisible, setPostOptionsVisible] = useState(false);

    const [showSkipButton, setShowSkipButton] = useState(false);

    const [shareOptionsVisible, setShareOptionsVisible] = useState(false);

    const likeIconColor = post.isLikedByCurrentUser ? COLORS.PURPLE : COLORS.AKCRUBLUE;

    const topVideoRef = useRef(null);
    const modalVideoRef = useRef(null);

    const isCurrentUserAuthor = post.author.id === currentUserID;

    const handleDeletePost = () => {
        onDeletePost(+post.id);
    };

    const openModal = (image: React.SetStateAction<string>) => {
        setSelectedImage(image);
        setImageModalVisible(true);
    };

    const openVideoModal = () => {
        setVideoModalVisible(true);
    };

    const handleVideoEnd = () => {
        setVideoModalVisible(false);
    };

    const handleVideoError = () => {
        setVideoModalVisible(false);
    };

    const handleModalVideoLoad = () => {
        setShowSkipButton(true);
    };

    const handleSkipVideo = () => {
        setVideoModalVisible(false);
    };

    const closeModal = () => {
        setImageModalVisible(false);
    };

    const openPostOptions = () => {
        setPostOptionsVisible(true);
    };

    const closePostOptions = () => {
        setPostOptionsVisible(false);
    };

    const closeShareOptions = () => {
        setShareOptionsVisible(false);
    };

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

    const renderBlockUser = () => {
        if (!isCurrentUserAuthor) {
            return (
                <Pressable
                    style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}
                    onPress={() => {
                        onBlockUser();
                        closePostOptions();
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
                        reportUser();
                        closePostOptions();
                    }}>
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

    const {textContent, imageUrls, videoUrl} = classifyPostContent([post.content]);

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
                    </View>
                    <Text style={{...FONTS.paragraph1}}>{post.author?.firstName}</Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {akcruBadge === 'AKCRUIT' && (
                            <View>
                                <AkcruLevels.AkcruBadgeAkcruit />
                            </View>
                        )}
                        {akcruBadge === 'HERO' && (
                            <View>
                                <AkcruLevels.AkcruBadgeHero />
                            </View>
                        )}
                        {akcruBadge === 'SUPERHERO' && (
                            <View>
                                <AkcruLevels.AkcruBadgeSuperHero />
                            </View>
                        )}
                        {akcruBadge === 'GUARDIAN' && (
                            <View>
                                <AkcruLevels.AkcruBadgeGuardian />
                            </View>
                        )}
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
            <Text style={{...FONTS.Username, color: COLORS.TRANSAKCRUBLUE, marginRight: 10}}>
                {timeSince(post.createdAt)}
            </Text>

            {textContent && (
                <View style={{marginTop: 10}}>
                    <Text style={styles.post}>{textContent}</Text>
                </View>
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
                    <TouchableOpacity onPress={() => openVideoModal()}>
                        <View style={styles.postvideo}>
                            <Video
                                ref={topVideoRef}
                                style={{width: '100%', height: '100%', borderRadius: 10}}
                                source={{uri: videoUrl}}
                                resizeMode="cover"
                                onEnd={handleVideoEnd}
                                repeat={false}
                                onError={handleVideoError}
                                muted={true}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

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
                            style={{width: '95%', height: '70%'}}
                            resizeMode="contain"
                        />
                    </TouchableWithoutFeedback>
                </Pressable>
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
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={styles.footStats}>
                    {post._count?.comments || 0} Comments • {post._count?.likes || 0} Likes
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
