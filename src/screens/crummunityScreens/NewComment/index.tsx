import {View, Text, SafeAreaView, TouchableOpacity, TextInput, Modal, Keyboard, TouchableWithoutFeedback, FlatList} from 'react-native';
import React, { useRef, useState } from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {Avatar, Icon} from '@rneui/base';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import { selectAvatarBorderColor } from '../../../util/util';
import AkcruLevels from '../../../components/akcruBadges';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import { MediaType, launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import { createPost, uploadPictures, uploadVideo } from '../../../lib/api/post.lib';
import { commentOnPost } from '../../../lib/api/post.lib';
import { StackNavigationProp } from '@react-navigation/stack';
import CalculateVideoDuration from '../../../util/calculatevideoduration';
import Video from 'react-native-video';

type NewCommentNavigationProp = StackNavigationProp<CrummunityStackParams, 'NewComment'>;

type NewCommentRouteProp = RouteProp<CrummunityStackParams, 'NewComment'>;

type Props = {
    navigation: NewCommentNavigationProp;
    route: NewCommentRouteProp;
};

const NewComment = ({navigation, route}: Props) => {
    const postId = route.params;
    // const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const {user} = useAuthStore();
    const [comment, setComment] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const videoRef = useRef(null);
    // const {user, hydrateUser} = useAuthStore();
    // useFocusEffect(
    //     React.useCallback(() => {
    //         // This code will run when the screen comes into focus (e.g., when navigating to this screen)
    //         hydrateUser();
    //         return () => {
    //             // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
    //             hydrateUser();
    //         };
    //     }, []),
    // );
    const selectPostImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 3, // Limit to 3 images for a post
        };

        console.log('Selecting post image');

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;
                console.log('Number of images selected:', response.assets.length);

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

    const [videoDuration, setVideoDuration] = useState(0);

    const handleVideoDuration = duration => {
        setVideoDuration(duration);
    };

    const selectPostVideo = async () => {
        let options = {
            mediaType: 'video' as MediaType,
            quality: 1,
            selectionLimit: 1, // Only allows 1 video
        };

        console.log('Selecting post video');

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;
                console.log('User cancelled video picker');
            } else if (response.errorCode) {
                console.log('VideoPicker Error: ', response.errorMessage);
            } else if (response.assets) {
                const video = response.assets[0];

                // Check if the video file size is within limits
                const maxSizeInBytes = 15 * 1024 * 1024; // Example: 15 MB limit
                if (video.fileSize > maxSizeInBytes) {
                    console.log('Video file is too large.');
                    // Handle the error (e.g., show an error message)
                    return;
                }

                setSelectedVideo(video.uri);

                // TODO: Calculate video duration if necessary
                // const videoDuration = CalculateVideoDuration(video.uri);
                // You might need to implement CalculateVideoDuration or find another way to get the video duration

                // Reset selected images if HYBRID post
                if (comment) {
                    setSelectedImages([]);
                }
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

    const OnCommentPress = async () => {
        try {
            const postType = determinePostType();
            let content = [];

            if (postType === 'TEXT') {
                content = [comment];
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
                content.push(comment);
                const mediaUrls =
                    selectedImages.length > 0
                        ? await uploadPictures(selectedImages)
                        : await uploadVideo(selectedVideo, 'YourUploadType', videoDuration);
                content = content.concat(mediaUrls);
            }
            const postId = route.params.postId;
            // Call the createPost API function
            const result = await commentOnPost(postType, content, postId);
            
            if (result) {
                console.log('Comment created successfully', result);
                navigation.goBack();
            } else {
                console.log('Failed to create the comment');
            }
        } catch (error) {
            console.error('Error creating the comment:', error);
        }

        // Reset the state
        setComment('');
        setSelectedImages([]);
        setSelectedVideo('');
    };

    // const OnCommentPress = async () => {
    //     if (!comment) {
    //         console.log('No comment content to submit');
    //         return;
    //     }

    //     try {
    //         // Assuming post ID is passed via route params
    //         const postId = route.params.postId; // You need to pass the post ID when navigating to this screen

    //         // Call the commentOnPost API function
    //         const result = await commentOnPost(postId, comment);
    //         if (result) {
    //             console.log('Comment created successfully', result);
    //             // Handle the post-creation logic, like navigating back or showing a success message
    //             navigation.goBack();
    //         } else {
    //             // Handle the error case
    //             console.log('Failed to create the comment');
    //         }
    //     } catch (error) {
    //         console.error('Error creating the comment:', error);
    //     }

    //     // Reset the state
    //     setComment('');
    // };

    const [selectImage, setSelectImage] = useState('');
    

    // const selectCommentImage = async () => {
    //     let options = {
    //         mediaType: 'photo' as MediaType,
    //         storageOptions: {
    //             path: 'image',
    //         },
    //     };

    //     // Flag to track whether the callback has been executed
    //     let callbackExecuted = false;

    //     launchImageLibrary(options, response => {
    //         if (response && !response.didCancel && response.assets) {
    //             // Check if the response is defined, not canceled, and has assets
    //             if (callbackExecuted) {
    //                 return;
    //             }

    //             // Set the flag to true to indicate the callback has been executed
    //             callbackExecuted = true;

    //             // Check the size of the selected image
    //             const imageSizeInBytes = response.assets[0].fileSize;
    //             const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

    //             if (imageSizeInBytes > maxSizeInBytes) {
    //                 // Show size error modal
    //                 setShowSizeErrorModal(true);
    //                 setSelectImage('');
    //             } else {
    //                 setSelectImage(response.assets[0].uri);
    //                 console.log(response.assets[0].uri);
    //             }
    //         }
    //     });
    //     console.log('Select Image');
    // };

    return (
        <TabContainer>
            <SafeAreaView>
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
                            <TouchableOpacity onPress={OnCommentPress} style={{marginLeft: 'auto'}}>
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
                                        user?.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder
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
                            placeholder={'Tell us the "skinny" in 150 characters or less'}
                            placeholderTextColor={COLORS.DARKGREY}
                            style={styles.textinput}
                            secureTextEntry={false}
                            onChangeText={text => {
                                // Limit the description to 150 characters
                                if (text.length <= 200) {
                                    setComment(text);
                                }
                            }}
                            value={comment} // Use the modified value in the TextInput
                            multiline={true}
                            maxLength={200} // Set the maximum character limit
                            editable={true}
                        />
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity style={{marginHorizontal: 10}} onPress={selectPostImage}>
                            <Icon name="images" type="ionicon" color={COLORS.MIDORANGE} size={20} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={selectAGIF}>
                            <Icon name="file-gif-box" type="material-community" color={COLORS.MIDORANGE} size={26} />
                        </TouchableOpacity> */}
                        <TouchableOpacity style={{marginHorizontal: 8}} onPress={selectPostVideo}>
                            <Icon name="video-account" type="material-community" color={COLORS.MIDORANGE} size={30} />
                        </TouchableOpacity>
                    </View>
                    {/* Conditional rendering of CalculateVideoDuration */}
                    {selectedVideo && (
                        <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />
                    )}
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
                    </View>

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
                <View></View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default NewComment;
