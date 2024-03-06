import {View, Text, SafeAreaView, TouchableOpacity, TextInput, Modal, Keyboard, TouchableWithoutFeedback, FlatList, Pressable, ScrollView} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {Avatar, Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import { extractUsernamesFromText, selectAvatarBorderColor } from '../../../util/util';
import AkcruLevels from '../../../components/akcruBadges';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import { MediaType, launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import { createPost, uploadPictures, uploadVideo } from '../../../lib/api/post.lib';
import CalculateVideoDuration from '../../../util/calculatevideoduration';
import Video from 'react-native-video';
import { findAUser, searchForUsers } from '../../../lib/api/user.lib';
import { IUserProfile } from '../../../../types';
import UserTaggedCard from '../../../components/UserTaggedCard';
import { sendTagNotification } from '../../../lib/api/notify.lib';

const NewPost = () => {
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const {user} = useAuthStore();
    const [postText, setPostText] = useState('');
    //console.log('Post Text:', postText);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    //console.log('Selected Images:', selectedImages);
    const [selectedVideo, setSelectedVideo] = useState('');
    //console.log('Selected Video:', selectedVideo);
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const [isTagging, setIsTagging] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [suggestions, setSuggestions] = useState<IUserProfile[]>([]);

    const [isTagModalVisible, setIsTagModalVisible] = useState(false);


    const videoRef = useRef(null);

    const selectPostImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 3, // Limit to 3 images for a post
        };

        //console.log('Selecting post image');

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;
                //console.log('Number of images selected:', response.assets.length);

                const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
                let imagesForPost = [];

                for (const asset of response.assets) {
                    if (asset.fileSize > maxSizeInBytes) {
                        setShowSizeErrorModal(true);
                        return;
                    } else {
                        if (asset.uri) {
                            imagesForPost.push(asset.uri); // Collect URIs of selected images
                        }
                    }
                }

                // Update the state with selected images
                setSelectedImages(imagesForPost);
            }
        });
    };

    // In your component where you handle video selection
    const [videoDuration, setVideoDuration] = useState(0);

    const handleVideoDuration = (duration: React.SetStateAction<number>) => {
        setVideoDuration(duration);
    };

    // Render the CalculateVideoDuration component somewhere in your return statement
    // Make sure to pass the selected video URI and the function to handle the duration
    <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />;

    const selectPostVideo = async () => {
        let options = {
            mediaType: 'video' as MediaType,
            quality: 1,
            selectionLimit: 1, // Only allows 1 video
        };

        //console.log('Selecting post video');

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;
                //console.log('User cancelled video picker');
            } else if (response.errorCode) {
                //console.log('VideoPicker Error: ', response.errorMessage);
            } else if (response.assets) {
                const video = response.assets[0];

                // Check if the video file size is within limits
                const maxSizeInBytes = 100 * 1024 * 1024; // Example: 100 MB limit
                if (video.fileSize > maxSizeInBytes) {
                    //console.log('Video file is too large.');
                    // Handle the error (e.g., show an error message)
                    return;
                }

                setSelectedVideo(video.uri);

                // TODO: Calculate video duration if necessary
                // const videoDuration = CalculateVideoDuration(video.uri);
                // You might need to implement CalculateVideoDuration or find another way to get the video duration

                // Reset selected images if HYBRID post
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
        try {
            const postType = determinePostType();
            let content = [];

            if (postType === 'TEXT') {
                content = [postText];
            } else if (postType === 'IMAGE') {
                // If images are selected, upload them and get URLs
                content = await uploadPictures(selectedImages);
                content = content.join(', '); // Convert array of URLs to a comma-separated string
            } else if (postType === 'VIDEO') {
                // If a video is selected, upload it and get URL
                const videoUrl = await uploadVideo(selectedVideo, 'video', videoDuration);
                content = [videoUrl];
            } else if (postType === 'HYBRID') {
                // If hybrid post, handle both text and media
                content.push(postText);
                const mediaUrls =
                    selectedImages.length > 0
                        ? await uploadPictures(selectedImages)
                        : await uploadVideo(selectedVideo, 'YourUploadType', videoDuration);
                content = content.concat(mediaUrls);
            }

            //console.log('Post type:', postType);
            //console.log('Content:', content);

            // Call the createPost API function
            const result = await createPost(postType, content);
            if (result && result.id) {
                //console.log('Result.postId:', result.id);
                //console.log('Post created successfully', result);
                const newPostId = result.id;

                // Extract tagged usernames from postText
                const taggedUsernames = extractUsernamesFromText(postText);

                // Process each tagged username to find their user ID and send a tag notification
                // Using Promise.all to handle multiple async operations in parallel
                await Promise.all(
                    taggedUsernames.map(async username => {
                        try {
                            // Use findAUser to get the user profile
                            const user = await findAUser({username});
                            if (user && user.id) {
                                // Now that you have the userId, send the tag notification
                                const notificationType = 'UserTaggedOnPost'; // Adjust as needed
                                const success = await sendTagNotification(user.id, notificationType, newPostId);
                                if (success) {
                                    //console.log(`Notification sent to ${username}`);
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
                navigation.goBack();
            } else {
                //console.log('Failed to create the post');
            }
        } catch (error) {
            console.error('Error creating the post:', error);
        }

        // Reset the state
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
                            // Background Linear Gradient
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
                                    // Start or continue tagging
                                    const parts = text.split(' ');
                                    const lastPart = parts[parts.length - 1];
                                    if (lastPart.startsWith('@')) {
                                        setIsTagging(true);
                                        setCurrentTag(lastPart.slice(1)); // Extract current tag without '@'
                                    } else {
                                        setIsTagging(false);
                                        setCurrentTag('');
                                    }

                                    // Update post text ensuring it doesn't exceed 200 characters
                                    if (text.length <= 200) {
                                        setPostText(text);
                                    }
                                }}
                                value={postText}
                                multiline={true}
                                maxLength={200} // Enforce the character limit
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
                                            // Handle the selection of a suggested user
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
                                                // Handle the selection of a suggested user
                                                const newText =
                                                    postText.substring(0, postText.lastIndexOf('@')) +
                                                    `@${item.username} `;
                                                setPostText(newText);
                                                setIsTagging(false);
                                                setCurrentTag('');
                                            }}
                                            // influencer={item.influencer} // TODO: handle this
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
                                    <Icon name="images" type="ionicon" color={COLORS.MIDORANGE} size={20} />
                                </TouchableOpacity>

                                {/* <TouchableOpacity onPress={selectAGIF}>
                                <Icon
                                    name="file-gif-box"
                                    type="material-community"
                                    color={COLORS.MIDORANGE}
                                    size={26}
                                />
                            </TouchableOpacity> */}
                                <TouchableOpacity style={{marginHorizontal: 8}} onPress={selectPostVideo}>
                                    <Icon
                                        name="video-account"
                                        type="material-community"
                                        color={COLORS.MIDORANGE}
                                        size={30}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        {/* Conditional rendering of CalculateVideoDuration */}
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
                                            // onEnd={handleVideoEnd}
                                            repeat={true}
                                            // onError={handleVideoError}
                                            // onLoad={handleVideoLoad}
                                            muted={true}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                        {/* Picture Size Error Modal*/}
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
                                        {`Image is too large. Please select an image under 2MB.`}
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
                                            {`Close`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default NewPost;
