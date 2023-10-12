
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    Platform,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    FlatList,
    Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import { Avatar } from '@rneui/base';
import InputsLrg from '../../../components/inputLrg';
import {Icon} from '@rneui/base';

import {API} from '../../../clients/api.client';
import {supabase} from '../../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker';
import useAuthStore from '../../../stores/auth.store';
import {searchForUsers, updateUser, updateUserProfilePicture} from '../../../lib/api/user.lib';

const OnBoard2 = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();

    const [userName, setUserName] = useState('');
    const [desc, setDesc] = useState(user?.description);
    const [description, setDescription] = useState(user?.description);
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState('');

    const [profilePicture, setProfilePicture] = useState<{uri: string} | null>(null);

    const [response, setResponse] = React.useState<any>(null);

    const [isFormComplete, setIsFormComplete] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            console.log('OnBoard2 Screen focused [OnBoard2]');
            hydrateUser();

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('OnBoard2 Screen unfocused [OnBoard2]');
            };
        }, []),
    );

    // const handleUserNameChange = (text: string) => {
    //     setUserName(text);
    // };

    // const checkFormCompletion = () => {
    //     if (userName ) {
    //         setIsFormComplete(true);
    //     } else {
    //         setIsFormComplete(false);
    //     }
    // };

    // useEffect(
    //     () => {
    //         checkFormCompletion();
    //     },
    //     [
    //         // dob,
    //     ],
    // );

    const [selectImage, setSelectImage] = useState('');

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
    const selectProfileImage = async () => {
        let options = {
            mediaType: 'photo',
            selectionLimit: 1,
            includeBase64: false,
            storageOptions: {
                path: 'image',
            },
        };

        console.log('select picture button');
        launchImageLibrary(options, async response => {
            if (!response.didCancel) {
                const selectedImage = response.assets[0].uri;

                // Get the type and name for the selected image
                const imageType = 'image/jpeg'; // Adjust the type as needed
                const imageName = 'profile.jpg'; // Adjust the filename as needed

                // Call the API function to update the user's profile picture
                const updatedUserProfile = await updateUserProfilePicture({
                    uri: selectedImage,
                    type: imageType,
                    name: imageName,
                });

                if (updatedUserProfile) {
                    // Handle success, maybe update your local state with the new profile picture
                    setSelectImage(updatedUserProfile.profilePicture || '');
                } else {
                    // Handle failure or display an error message
                    console.log('Failed to update profile picture');
                }
            }
        });
    };

    const confirmUpdate = async () => {
        try {
            setLoading(true);

            // Convert the provided username to lowercase for comparison
            const lowercaseUserName = userName.toLowerCase();

            // Check if the lowercase username is already taken
            const usernameExists = await checkUsernameExists(lowercaseUserName);

            if (usernameExists) {
                // Username is already taken, show an error message
                Alert.alert('Username is already taken', 'Please choose a different username.');
            } else if (lowercaseUserName.includes(' ')) {
                // Username contains spaces, show an error message
                Alert.alert('Username contains spaces', 'Please remove spaces from your username.');
            } else {
                // Call the updateUser function to send the updated data to the backend
                const updatedUser = await updateUser({
                    username: userName, // Use the provided username as is
                    description: description,
                });

                if (updatedUser) {
                    console.log('Profile updated successfully:', updatedUser);
                    const currentUser = useAuthStore.getState().user;

                    if (currentUser) {
                        currentUser.username = userName; // Update the username without converting to lowercase
                        currentUser.description = description;
                        // Update the profile picture URI if it has changed
                        useAuthStore.setState({user: currentUser});
                    }
                    navigation.navigate('OnBoard3');
                } else {
                    console.error('Failed to update profile.');
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUsernameExists = async (username: string) => {
        try {
            // Convert the username to lowercase before checking
            const lowercaseUsername = username.toLowerCase();

            // Get the current user's username from the user state
            const currentUserUsername = useAuthStore.getState().user?.username.toLowerCase();

            // You can implement logic here to check if the lowercase username exists in your database
            // For example, you can make an API request to check if the lowercase username is already in use
            const response = await searchForUsers(lowercaseUsername); // Replace with your actual API call

            // Filter out the current user's username from the response
            const filteredResponse = response.filter(user => user.username.toLowerCase() !== currentUserUsername);

            // Check if the filtered response contains the exact lowercase username
            const usernameExists = filteredResponse.some(user => user.username.toLowerCase() === lowercaseUsername);

            return usernameExists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false; // Assume username doesn't exist in case of an error
        }
    };

    return (
        <View>
            <ScrollView>
                <ImageBackground style={styles.bgimage} source={imageindex.AkcruonboardBG} resizeMode={'cover'}>
                    <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                        <View style={styles.container}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        alignItems: 'flex-end',
                                    }}>
                                    <Text style={{...FONTS.Title3, marginRight: 20}}>2/3</Text>
                                </View>
                            </View>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruLogo width={200} height={60} />
                            </View>
                            <View style={{alignItems: 'center', flexDirection: 'row', marginBottom: 20}}>
                                <View style={{marginRight: 10}}>
                                    <Avatar
                                        rounded
                                        size={75}
                                        source={selectImage ? {uri: selectImage} : imageindex.Akcruplaceholder}
                                        avatarStyle={{
                                            borderWidth: 2,
                                            borderColor: COLORS.AKCRUBLUE,
                                        }}
                                    />
                                </View>

                                <View>
                                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                        Begin by choosing an avatar photo
                                    </Text>
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                selectProfileImage();
                                            }}>
                                            <Text
                                                style={{
                                                    ...FONTS.Title2AkcruBlue,
                                                    marginTop: 10,
                                                    color: COLORS.MIDORANGE,
                                                }}>
                                                Pick a profile photo
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
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

                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Now let's select a username that will be visible to other users. Additionally, provide
                                us with a brief description about yourself. This will help others get to know you better
                                and create meaningful connections within the community.
                            </Text>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <InputsLrg
                                    placeholdername={'Choose a username'}
                                    iconname={'person'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={text => {
                                        // Remove spaces from the input text
                                        const formattedText = text.replace(/\s/g, '');

                                        // Enforce the 11-character limit
                                        if (formattedText.length <= 12) {
                                            setUserName(formattedText);
                                        }
                                    }}
                                    value={userName || ''}
                                    editable={!loading}
                                />
                            </View>
                            <View style={styles.descinput}>
                                <TextInput
                                    placeholder={'Tell our crummunity about yourself...'}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    onChangeText={text => {
                                        // Limit the description to 150 characters
                                        if (text.length <= 150) {
                                            setDescription(text);
                                        }
                                    }}
                                    multiline={true}
                                    maxLength={150} // Set the maximum character limit
                                    secureTextEntry={false}
                                    value={description || ''}
                                />
                            </View>

                            <View>
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.XlLrgButton
                                        color={COLORS.AKCRUBLUE}
                                        btnname={'Next'}
                                        onPress={confirmUpdate}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ImageBackground>
            </ScrollView>
        </View>
    );
};

export default OnBoard2;
