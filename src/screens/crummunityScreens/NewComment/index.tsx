import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Platform,
    StyleSheet,
    Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES, isTablet} from '../../../../assets/constants/theme';
import {Icon} from '@rneui/base';
import {RouteProp} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {extractUsernamesFromText, selectAvatarBorderColor} from '../../../util/util';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {Image} from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {uploadPictures, uploadVideo} from '../../../lib/api/post.lib';
import {commentOnPost} from '../../../lib/api/post.lib';
import {StackNavigationProp} from '@react-navigation/stack';
import CalculateVideoDuration from '../../../util/calculatevideoduration';
import Video from 'react-native-video';
import {IUserProfile} from '../../../../types';
import {findAUser, searchForUsers} from '../../../lib/api/user.lib';
import {sendTagNotification} from '../../../lib/api/notify.lib';
import {Image as CompressorImage, Video as VideoCompressor} from 'react-native-compressor';
import {ProgressView} from '@react-native-community/progress-view';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import ProfileUserBadges from '../../../components/ProfileUserBadges';
import AkcruButtons from '../../../components/akcruButtons';
import {emitPostCommentCountDelta} from '../../../util/feedRefreshEvents';
import DisplayBadge from '../../../components/General/akcrubadge';
type NewCommentNavigationProp = StackNavigationProp<CrummunityStackParams, 'NewComment'>;

type NewCommentRouteProp = RouteProp<CrummunityStackParams, 'NewComment'>;

type Props = {
    navigation: NewCommentNavigationProp;
    route: NewCommentRouteProp;
};

const MAX_COMMENT_LENGTH = 200;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 1000 * 1024 * 1024;

const NewComment = ({navigation, route}: Props) => {
    const {user} = useAuthStore();
    const [comment, setComment] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const [isTagging, setIsTagging] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [suggestions, setSuggestions] = useState<IUserProfile[]>([]);
    const [isCompress, setIsCompress] = useState(false);
    const [progressVal, setProgress] = useState(0);
    const [isCommenting, setIsCommenting] = useState(false);
    const [cancelidVideo, setcancelidVideo] = useState('');

    const videoRef = useRef(null);

    const onCancelVideo = async () => {
        await VideoCompressor.cancelCompression(cancelidVideo);
        setIsCompress(false);
        setcancelidVideo('');
        setProgress(0);
    };
    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeSelectedVideo = () => {
        setSelectedVideo('');
        setVideoDuration(0);
    };

    const updateTagState = (text: string) => {
        const parts = text.split(' ');
        const lastPart = parts[parts.length - 1];
        if (lastPart.startsWith('@')) {
            setIsTagging(true);
            setCurrentTag(lastPart.slice(1));
            return;
        }
        setIsTagging(false);
        setCurrentTag('');
    };

    const applyTaggedUserToComment = (username: string) => {
        const newText = comment.substring(0, comment.lastIndexOf('@')) + `@${username} `;
        setComment(newText);
        setIsTagging(false);
        setCurrentTag('');
    };

    const splitGifAndNonGifImages = (images: string[]) => {
        const gifs = images.filter(image => image.toLowerCase().endsWith('.gif'));
        const otherImages = images.filter(image => !image.toLowerCase().endsWith('.gif'));
        return {gifs, otherImages};
    };
    const selectPostImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 3,
        };

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                let imagesForPost = [];

                for (const asset of response.assets) {
                    if (asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
                        setShowSizeErrorModal(true);
                        return;
                    } else {
                        if (asset.uri) {
                            imagesForPost.push(asset.uri);
                        }
                    }
                }

                setSelectedImages(imagesForPost);
            }
        });
    };

    const [videoDuration, setVideoDuration] = useState(0);

    const handleVideoDuration = duration => {
        setVideoDuration(duration);
    };

    const selectPostVideo = async () => {
        let options = {
            mediaType: 'video' as MediaType,
            quality: 1,
            selectionLimit: 1,
        };

        launchImageLibrary(options, response => {
            if (response.didCancel || response.errorCode || !response.assets) {
                return;
            }

            const video = response.assets[0];
            if (video.fileSize > MAX_VIDEO_SIZE_BYTES) {
                return;
            }
            setSelectedVideo(video.uri);

            if (comment) {
                setSelectedImages([]);
            }
        });
    };

    const determinePostType = () => {
        if (comment && (selectedImages.length > 0 || selectedVideo)) {
            return 'HYBRID';
        } else if (selectedImages.length > 0) {
            return 'IMAGE';
        } else if (selectedVideo) {
            return 'VIDEO';
        } else {
            return 'TEXT';
        }
    };

    const compressAndUploadImages = async selectedImages => {
        const compressedImages = [];

        for (let image of selectedImages) {
            const compressedImagePath = await CompressorImage.compress(image, {
                compressionMethod: 'auto',
            });
            compressedImages.push(compressedImagePath);
        }
        return compressedImages;
    };

    const uploadSelectedImages = async (images: string[]) => {
        const {gifs, otherImages} = splitGifAndNonGifImages(images);
        let imageUrls = [];
        let gifUrls = [];

        if (otherImages.length > 0) {
            const compressedImages = await compressAndUploadImages(otherImages);
            imageUrls = await uploadPictures(compressedImages);
        }

        if (gifs.length > 0) {
            gifUrls = await uploadPictures(gifs);
        }

        return [...imageUrls, ...gifUrls];
    };

    const compressAndUploadSelectedVideo = async () => {
        setIsCompress(true);
        const compressedVideoPath = await VideoCompressor.compress(
            selectedVideo,
            {
                compressionMethod: 'auto',
                getCancellationId: cancellationId => {
                    setcancelidVideo(cancellationId);
                },
                progressDivider: 10,
            },
            progress => {
                setProgress(progress);
            },
        );
        setIsCompress(false);
        setIsCommenting(true);
        return uploadVideo(compressedVideoPath, 'video', videoDuration);
    };

    const handleCommentPress = async () => {
        try {
            const postType = determinePostType();
            let content = [];

            if (postType === 'TEXT') {
                setIsCommenting(true);
                content = [comment];
            } else if (postType === 'IMAGE') {
                setIsCommenting(true);
                const imageUrls = await uploadSelectedImages(selectedImages);
                content = imageUrls.join(', ');
            } else if (postType === 'VIDEO') {
                const videoUrl = await compressAndUploadSelectedVideo();
                content = [videoUrl];
            } else if (postType === 'HYBRID') {
                if (!selectedVideo) {
                    setIsCommenting(true);
                }
                content.push(comment);
                const imageUrls = await uploadSelectedImages(selectedImages);

                let videoUrl = null;
                if (selectedVideo) {
                    videoUrl = await compressAndUploadSelectedVideo();
                }

                const mediaUrls = [...imageUrls];
                if (videoUrl) {
                    mediaUrls.push(videoUrl);
                }

                content = content.concat(mediaUrls);
            }

            const postId = route.params.postId;

            const result = await commentOnPost(postId, postType, content);
            if (result && result.id) {
                emitPostCommentCountDelta(postId, 1);
                const newPostId = result.id;

                const taggedUsernames = extractUsernamesFromText(comment);
                if (taggedUsernames.includes('followers')) {
                    const notificationType = 'UserTaggedOnComment';
                    const success = await sendTagNotification(user?.id, notificationType, newPostId, '@followers');
                    if (!success) {
                        console.error(`Failed to send notification to followers`);
                    }
                }

                await Promise.all(
                    taggedUsernames.map(async username => {
                        if (username === 'followers') return; // Skip the followers tag here
                        try {
                            const user = await findAUser({username});
                            if (user && user.id) {
                                const notificationType = 'UserTaggedOnComment';
                                const success = await sendTagNotification(user.id, notificationType, newPostId);
                                if (success) {
                                } else {
                                    console.error(`Failed to send notification to ${username}`);
                                }
                            } else {
                                console.error(`User not found for username: ${username}`);
                            }
                        } catch (error) {
                            console.error(`Error processing tag for username: ${username}`, error);
                        }
                    }),
                );
                setIsCommenting(false);
                navigation.goBack();
            } else {
            }
        } catch (error) {
            console.error('Error creating the post:', error);
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : 'Failed to add comment';
            Alert.alert('Action Failed', message);
            setIsCommenting(false);
        }

        setComment('');
        setSelectedImages([]);
        setSelectedVideo('');
    };

    useEffect(() => {
        const fetchUserSuggestions = async () => {
            if (isTagging && currentTag) {
                try {
                    const suggestions = await searchForUsers(currentTag);
                    setSuggestions(suggestions);
                } catch (error) {
                    console.error('Error fetching user suggestions:', error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchUserSuggestions();
    }, [currentTag, isTagging]);
    const canComment = comment.trim().length > 0 || selectedImages.length > 0 || !!selectedVideo;

    return (
        <TabContainer>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    contentContainerStyle={styles.scrollContent}
                    scrollEnabled={!isTagging}>
                    <View style={styles.headerContainer}>
                        <Header />
                    </View>
                    <View style={[styles.gradientWrapper, isTablet() && styles.gradientWrapperTablet]}>
                        <LinearGradient
                            colors={['#0a1628', '#0d0d18', '#050508']}
                            style={[styles.gradient, isTablet() && styles.gradientTablet]}>
                            <View style={styles.actionRow}>
                                <TouchableOpacity onPress={() => navigation.pop()}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                    <View style={styles.contentContainer}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatarContainer}>
                                <TouchableOpacity>
                                    <HexAvatar
                                        source={
                                            user?.profilePicture
                                                ? {uri: user.profilePicture}
                                                : imageindex.Akcruplaceholder
                                        }
                                        size={isTablet() ? 65 : 45}
                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                        rotateFrameDegrees={90}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.authorMeta}>
                                <Text style={styles.usernameText}>{user ? user?.username : 'Guest'}</Text>
                                <ProfileUserBadges user={user} variant="inline" style={styles.inlineBadge} />
                            </View>
                        </View>
                        <View style={styles.inputAreaWrap}>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={'Tell us the "skinny" in 200 characters or less'}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => {
                                        updateTagState(text);
                                        if (text.length <= MAX_COMMENT_LENGTH) {
                                            setComment(text);
                                        }
                                    }}
                                    value={comment}
                                    multiline={true}
                                    maxLength={MAX_COMMENT_LENGTH}
                                    editable={true}
                                />
                            </View>
                            {isTagging && suggestions.length > 0 && (
                                <View style={styles.suggestionPanel}>
                                    <FlatList
                                        data={suggestions}
                                        horizontal={false}
                                        showsVerticalScrollIndicator={true}
                                        showsHorizontalScrollIndicator={false}
                                        scrollEnabled={true}
                                        nestedScrollEnabled={true}
                                        keyExtractor={item => item.id}
                                        style={styles.suggestionList}
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({item}) => (
                                            <Pressable
                                                style={styles.mentionRow}
                                                onPress={() => applyTaggedUserToComment(item.username)}>
                                                <HexAvatar
                                                    source={
                                                        item.profilePicture
                                                            ? {uri: item.profilePicture}
                                                            : imageindex.Akcruplaceholder
                                                    }
                                                    size={38}
                                                    bordercolor={selectAvatarBorderColor(item.badge ?? 'AKCRUIT')}
                                                    rotateFrameDegrees={90}
                                                />
                                                <View style={styles.mentionMeta}>
                                                    <View style={styles.mentionNameRow}>
                                                        <Text style={styles.mentionUsername}>@{item.username}</Text>
                                                        {!!item.firstName && (
                                                            <Text style={styles.mentionFirstName}>{item.firstName}</Text>
                                                        )}
                                                    </View>
                                                    <View style={styles.mentionBadgeWrap}>
                                                        <DisplayBadge akcruBadge={item.badge} />
                                                    </View>
                                                </View>
                                            </Pressable>
                                        )}
                                    />
                                </View>
                            )}
                        </View>
                        <Text style={styles.charCount}>{comment.length}/200</Text>
                        <View style={styles.mediaActionsRow}>
                            <TouchableOpacity style={styles.mediaIconButton} onPress={selectPostImage}>
                                <Icon
                                    name="images"
                                    type="ionicon"
                                    color={COLORS.AKCRUBLUE}
                                    size={isTablet() ? 32 : 20}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mediaIconButtonVideo} onPress={selectPostVideo}>
                                <Icon
                                    name="video-account"
                                    type="material-community"
                                    color={COLORS.AKCRUBLUE}
                                    size={isTablet() ? 50 : 30}
                                />
                            </TouchableOpacity>
                        </View>

                        {selectedVideo && (
                            <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />
                        )}
                        <View style={styles.mediaPreviewContainer}>
                            <FlatList
                                data={selectedImages}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) => (
                                    <View style={styles.previewItemWrap}>
                                        <TouchableOpacity
                                            style={styles.removeMediaButton}
                                            onPress={() => removeSelectedImage(index)}>
                                            <Icon
                                                name="close"
                                                type="material-community"
                                                color={COLORS.WHITE}
                                                size={16}
                                            />
                                        </TouchableOpacity>
                                        <Image source={{uri: item}} style={styles.selectedImage} />
                                    </View>
                                )}
                            />
                            {selectedVideo && (
                                <View style={styles.postvideo}>
                                    <TouchableOpacity
                                        style={styles.removeVideoButton}
                                        onPress={removeSelectedVideo}>
                                        <Icon
                                            name="close"
                                            type="material-community"
                                            color={COLORS.WHITE}
                                            size={16}
                                        />
                                    </TouchableOpacity>
                                    <Video
                                        ref={videoRef}
                                        style={styles.video}
                                        source={{uri: selectedVideo}}
                                        resizeMode="cover"
                                        repeat={true}
                                        muted={true}
                                    />
                                </View>
                            )}
                        </View>

                        <Modal animationType="fade" transparent={true} visible={showSizeErrorModal}>
                            <View style={styles.modalBackdrop}>
                                <View style={styles.sizeModalCard}>
                                    <Text style={styles.sizeModalText}>
                                        {'Image is too large. Please select an image under 5MB.'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowSizeErrorModal(false);
                                        }}>
                                        <Text style={styles.sizeModalClose}>
                                            {'Close'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
                <View style={styles.bottomActionBar}>
                    <AkcruButtons.LrgButton
                        btnname="Comment"
                        onPress={handleCommentPress}
                        color={COLORS.AKCRUBLUE}
                        variant="auth"
                        authButtonWidth={SIZES.ScreenWidth - 32}
                        disabled={!canComment}
                    />
                </View>
                <Modal visible={isCompress} transparent={true} animationType="fade">
                    <View style={stylesProgress.modalBackground}>
                        <View style={stylesProgress.modalContainer}>
                            <Text style={stylesProgress.progressText}>{`Loading: ${Math.round(
                                progressVal * 100,
                            )}% & Uploading`}</Text>
                            {Platform.OS === 'android' ? (
                                <ProgressBar
                                    styleAttr="Horizontal"
                                    indeterminate={false}
                                    progress={progressVal}
                                    color={COLORS.PINK}
                                    style={stylesProgress.progressBar}
                                />
                            ) : (
                                <ProgressView
                                    progress={progressVal}
                                    progressTintColor={COLORS.PINK}
                                    style={stylesProgress.progressBar}
                                />
                            )}
                            <TouchableOpacity onPress={onCancelVideo}>
                                <View>
                                    <Text style={styles.cancelButton}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal transparent={true} visible={isCommenting} animationType="fade">
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.PINK} />
                    </View>
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
};

export default NewComment;

const stylesProgress = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.OVERLAY_BLACK_50,
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        marginBottom: 10,
        ...FONTS.Title2,
    },
    progressBar: {
        width: '100%',
        height: 20,
    },
});
