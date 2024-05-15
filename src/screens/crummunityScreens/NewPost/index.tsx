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
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {extractUsernamesFromText, selectAvatarBorderColor} from '../../../util/util';
import AkcruLevels from '../../../components/akcruBadges';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {Image} from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {createPost, uploadPictures, uploadVideo} from '../../../lib/api/post.lib';
import CalculateVideoDuration from '../../../util/calculatevideoduration';
import Video from 'react-native-video';
import {findAUser, searchForUsers} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import UserTaggedCard from '../../../components/UserTaggedCard';
import {sendTagNotification} from '../../../lib/api/notify.lib';

const NewPost = () => {
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const {user} = useAuthStore();
    const [postText, setPostText] = useState('');

    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const [selectedVideo, setSelectedVideo] = useState('');

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const [isTagging, setIsTagging] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [suggestions, setSuggestions] = useState<IUserProfile[]>([]);

    const [isPosting, setIsPosting] = useState(false);
    const videoRef = useRef(null);

    const selectPostImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 3,
        };

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;

                const maxSizeInBytes = 5 * 1024 * 1024;
                let imagesForPost = [];

                for (const asset of response.assets) {
                    if (asset.fileSize && asset.fileSize > maxSizeInBytes) {
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

    const handleVideoDuration = (duration: React.SetStateAction<number>) => {
        setVideoDuration(duration);
    };

    <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />;

    const selectPostVideo = async () => {
        let options = {
            mediaType: 'video' as MediaType,
            quality: 1,
            selectionLimit: 1,
        };

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;
            } else if (response.errorCode) {
            } else if (response.assets) {
                const video = response.assets[0];

                const maxSizeInBytes = 100 * 1024 * 1024;
                if (video.fileSize > maxSizeInBytes) {
                    return;
                }

                setSelectedVideo(video.uri);

                if (postText) {
                    setSelectedImages([]);
                }
            }
        });
    };

    const determinePostType = () => {
        if (postText && (selectedImages.length > 0 || selectedVideo)) {
            return 'HYBRID';
        } else if (selectedImages.length > 0) {
            return 'IMAGE';
        } else if (selectedVideo) {
            return 'VIDEO';
        } else {
            return 'TEXT';
        }
    };

    const OnPostPress = async () => {
        setIsPosting(true);
        try {
            const postType = determinePostType();
            let content = [];

            if (postType === 'TEXT') {
                content = [postText];
            } else if (postType === 'IMAGE') {
                content = await uploadPictures(selectedImages);
                content = content.join(', ');
            } else if (postType === 'VIDEO') {
                const videoUrl = await uploadVideo(selectedVideo, 'video', videoDuration);
                content = [videoUrl];
            } else if (postType === 'HYBRID') {
                content.push(postText);
                const mediaUrls =
                    selectedImages.length > 0
                        ? await uploadPictures(selectedImages)
                        : await uploadVideo(selectedVideo, 'YourUploadType', videoDuration);
                content = content.concat(mediaUrls);
            }

            const result = await createPost(postType, content);
            if (result && result.id) {
                const newPostId = result.id;

                const taggedUsernames = extractUsernamesFromText(postText);

                await Promise.all(
                    taggedUsernames.map(async username => {
                        try {
                            const user = await findAUser({username});
                            if (user && user.id) {
                                const notificationType = 'UserTaggedOnPost';
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
                setIsPosting(false);
                navigation.goBack();
            } else {
            }
        } catch (error) {
            console.error('Error creating the post:', error);
            setIsPosting(false);
        }

        setPostText('');
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

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 100}}>
                        <Header />
                    </View>
                    <View
                        style={{
                            height: SIZES.ScreenHeight * 0.15,
                            marginTop: -68,
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                        }}>
                        <LinearGradient
                            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: SIZES.ScreenHeight * 0.15,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: '20%',
                                    marginHorizontal: 15,
                                }}>
                                <TouchableOpacity onPress={() => navigation.pop()}>
                                    <View>
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Cancel</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={OnPostPress} style={{marginLeft: 'auto'}}>
                                    <View>
                                        <Text style={styles.postButton}>Post</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                    <View style={{marginTop: '5%', marginHorizontal: 15}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{marginRight: 8}}>
                                <TouchableOpacity>
                                    <HexAvatar
                                        source={
                                            user?.profilePicture
                                                ? {uri: user.profilePicture}
                                                : imageindex.Akcruplaceholder
                                        }
                                        size={45}
                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={{...FONTS.Title2, fontSize: 12}}>{user ? user?.username : 'Guest'}</Text>
                                {user?.badge === 'AKCRUIT' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeAkcruit />
                                    </View>
                                )}
                                {user?.badge === 'GUARDIAN' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeGuardian />
                                    </View>
                                )}
                                {user?.badge === 'HERO' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeHero />
                                    </View>
                                )}
                                {user?.badge === 'SUPERHERO' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeSuperHero />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.input}>
                            <TextInput
                                placeholder={'Tell us the "skinny" in 200 characters or less'}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={text => {
                                    const parts = text.split(' ');
                                    const lastPart = parts[parts.length - 1];
                                    if (lastPart.startsWith('@')) {
                                        setIsTagging(true);
                                        setCurrentTag(lastPart.slice(1));
                                    } else {
                                        setIsTagging(false);
                                        setCurrentTag('');
                                    }

                                    if (text.length <= 200) {
                                        setPostText(text);
                                    }
                                }}
                                value={postText}
                                multiline={true}
                                maxLength={200}
                                editable={true}
                            />
                        </View>
                        {isTagging && suggestions.length > 0 && (
                            <FlatList
                                data={suggestions}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={true}
                                contentContainerStyle={{flexGrow: 1}}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <Pressable
                                        style={{marginVertical: 5}}
                                        onPress={() => {
                                            const newText =
                                                postText.substring(0, postText.lastIndexOf('@')) + `@${item.username} `;
                                            setPostText(newText);
                                            setIsTagging(false);
                                            setCurrentTag('');
                                        }}>
                                        <UserTaggedCard
                                            userPicture={item.profilePicture}
                                            userName={item.username}
                                            onPress={() => {
                                                const newText =
                                                    postText.substring(0, postText.lastIndexOf('@')) +
                                                    `@${item.username} `;
                                                setPostText(newText);
                                                setIsTagging(false);
                                                setCurrentTag('');
                                            }}
                                            userID={item.id}
                                            akcruBadge={item.badge}
                                            firstName={item.firstName}
                                        />
                                    </Pressable>
                                )}
                            />
                        )}
                        {!isTagging && (
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity style={{marginHorizontal: 10}} onPress={selectPostImage}>
                                    <Icon name="images" type="ionicon" color={COLORS.AKCRUBLUE} size={20} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{marginHorizontal: 8}} onPress={selectPostVideo}>
                                    <Icon
                                        name="video-account"
                                        type="material-community"
                                        color={COLORS.AKCRUBLUE}
                                        size={30}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}

                        {selectedVideo && (
                            <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />
                        )}
                        {!isTagging && (
                            <View style={{marginTop: 10}}>
                                <FlatList
                                    data={selectedImages}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({item}) => (
                                        <View>
                                            <Image
                                                source={{uri: item}}
                                                style={{
                                                    width: SIZES.ScreenWidth / 3.55,
                                                    height: SIZES.ScreenWidth / 2.35,
                                                    margin: 5,
                                                    borderRadius: 5,
                                                }}
                                            />
                                        </View>
                                    )}
                                />
                                {selectedVideo && (
                                    <View style={styles.postvideo}>
                                        <Video
                                            ref={videoRef}
                                            style={{width: '100%', height: '100%', borderRadius: 10}}
                                            source={{uri: selectedVideo}}
                                            resizeMode="cover"
                                            repeat={true}
                                            muted={true}
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        <Modal animationType="fade" transparent={true} visible={showSizeErrorModal}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                        padding: 20,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        marginHorizontal: 15,
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            marginBottom: 10,
                                            textAlign: 'center',
                                        }}>
                                        {'Image is too large. Please select an image under 5MB.'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowSizeErrorModal(false);
                                        }}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2,
                                                marginBottom: 10,
                                                textAlign: 'center',
                                                color: COLORS.MIDORANGE,
                                            }}>
                                            {'Close'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    {isPosting && (
                        <Modal transparent={true} visible={isPosting} animationType="fade">
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color={COLORS.PINK} />
                            </View>
                        </Modal>
                    )}
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default NewPost;
