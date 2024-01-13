import {View, Text, SafeAreaView, TouchableOpacity, TextInput, Modal, Keyboard, TouchableWithoutFeedback} from 'react-native';
import React, { useState } from 'react';
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
import { createPost } from '../../../lib/api/post.lib';
import { commentOnPost } from '../../../lib/api/post.lib';
import { StackNavigationProp } from '@react-navigation/stack';

type NewCommentNavigationProp = StackNavigationProp<CrummunityStackParams, 'NewComment'>;

type NewCommentRouteProp = RouteProp<CrummunityStackParams, 'NewComment'>;

type Props = {
    navigation: NewCommentNavigationProp;
    route: NewCommentRouteProp;
};

const NewComment = ({navigation, route}: Props) => {
    const postId = route.params;
    // const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

    const {user, hydrateUser} = useAuthStore();
    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            hydrateUser();
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                hydrateUser();
            };
        }, []),
    );

    const [comment, setComment] = useState('');

    // const OnCommentPress = async () => {
    //     if (!comment && !selectImage) {
    //         console.log('No post content to submit');
    //         return;
    //     }

    //     try {
    //         const type = selectImage ? 'image' : 'text'; // Determine the type based on whether an image is selected
    //         const content = comment;

    //         // Call the createPost API function
    //         const result = await comment(type, content);
    //         if (result) {
    //             console.log('Comment created successfully', result);
    //             // Handle the post-creation logic, like navigating back or showing a success message
    //             navigation.goBack();
    //         } else {
    //             // Handle the error case
    //             console.log('Failed to create the comment');
    //         }
    //     } catch (error) {
    //         console.error('Error creating the c0mment:', error);
    //     }

    //     // Reset the state
    //     setSelectImage('');
    //     setComment('');
    // };

    const OnCommentPress = async () => {
        if (!comment) {
            console.log('No comment content to submit');
            return;
        }

        try {
            // Assuming post ID is passed via route params
            const postId = route.params.postId; // You need to pass the post ID when navigating to this screen

            // Call the commentOnPost API function
            const result = await commentOnPost(postId, comment);
            if (result) {
                console.log('Comment created successfully', result);
                // Handle the post-creation logic, like navigating back or showing a success message
                navigation.goBack();
            } else {
                // Handle the error case
                console.log('Failed to create the comment');
            }
        } catch (error) {
            console.error('Error creating the comment:', error);
        }

        // Reset the state
        setComment('');
    };

    const [selectImage, setSelectImage] = useState('');
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const selectCommentImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'image',
            },
        };

        // Flag to track whether the callback has been executed
        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                // Check if the response is defined, not canceled, and has assets
                if (callbackExecuted) {
                    return;
                }

                // Set the flag to true to indicate the callback has been executed
                callbackExecuted = true;

                // Check the size of the selected image
                const imageSizeInBytes = response.assets[0].fileSize;
                const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

                if (imageSizeInBytes > maxSizeInBytes) {
                    // Show size error modal
                    setShowSizeErrorModal(true);
                    setSelectImage('');
                } else {
                    setSelectImage(response.assets[0].uri);
                    console.log(response.assets[0].uri);
                }
            }
        });
        console.log('Select Image');
    };

    const selectAGIF = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'image',
            },
        };
        console.log('Select a GIF');
    };

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
                        <TouchableOpacity style={{marginHorizontal: 10}} onPress={selectCommentImage}>
                            <Icon name="images" type="ionicon" color={COLORS.MIDORANGE} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={selectAGIF}>
                            <Icon name="file-gif-box" type="material-community" color={COLORS.MIDORANGE} size={26} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginHorizontal: 8}}>
                            <Icon name="video-account" type="material-community" color={COLORS.MIDORANGE} size={30} />
                        </TouchableOpacity>
                    </View>
                    <View style={{marginTop: 10}}>
                        {selectImage && (
                            <View style={{marginHorizontal: 5}}>
                                <Image source={{uri: selectImage}} style={{width: 100, height: 100, borderRadius: 5}} />
                            </View>
                        )}
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
