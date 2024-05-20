import {useState, useEffect, useRef, useCallback} from 'react';
import {supabase} from '../../../../lib/supabase';
import styles from './styles';
import {
    View,
    Alert,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    TextInput,
    Button,
    Modal,
    FlatList,
    Pressable,
} from 'react-native';
import {Session} from '@supabase/supabase-js';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import {Icon, Avatar} from '@rneui/base';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import React from 'react';
import {ImagePickerResponse, launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import * as ImagePicker from "expo-image-picker";
import {API} from '../../../clients/api.client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import InputsLrg from '../../../components/inputLrg';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';
import imageindex from '../../../../assets/images/imageindex';
import {updateUserProfilePicture, updateUser, searchForUsers} from '../../../lib/api/user.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import BackButton from '../../../components/General/backbutton';

const gallery = FAKE_USER_PROFILES[0].gallery;

export default function EditProfile2({session}: {session: Session}) {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    // get user from auth store, also get the logout function
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const {hydrateUser} = useAuthStore();

    const [loading, setLoading] = useState(false);

    const [userName, setUserName] = useState('');
    const [modifiedUserName, setModifiedUserName] = useState('');
    const [usernameModalVisible, setUsernameModalVisible] = useState(false);

    const [description, setDescription] = useState('');
    const [modifiedDescription, setModifiedDescription] = useState('');
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState('');

    const [emailError, setEmailError] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Add login status state

    const handleUsernameModalOpen = () => {
        setModifiedUserName(userName);
        setUsernameModalVisible(true);
    };

    const handleChangeUsername = () => {
        setShowUpdateUsernameConfirmation(true);
    };

    const handleDescriptionModalOpen = () => {
        console.log('Description:', description);
        setModifiedDescription(description);
        setDescriptionModalVisible(true);
    };

    const handleChangeDescription = () => {
        setShowUpdateDescriptionConfirmation(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            console.log('Edit Profile Screen focused [EditProfileScreen]');
            hydrateUser();

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('Edit Profile Screen unfocused [EditProfileScreen]');
            };
        }, []),
    );

    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

    const handleUpdateProfile = () => {
        // Show the confirmation modal
        setShowUpdateConfirmation(true);
    };

    const confirmDescriptionUpdate = async () => {
        try {
            setLoading(true);

            // Call the updateUser function to send the updated data to the backend
            const updatedUser = await updateUser({
                description: description,
            });

            // Update the local user data with the new description
            if (updatedUser) {
                console.log('Profile updated successfully:', updatedUser);
                const currentUser = useAuthStore.getState().user;

                if (currentUser) {
                    // Update only the description
                    currentUser.description = description;
                    useAuthStore.setState({user: currentUser});
                }
            }
            // Navigate to the next screen or perform other actions
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateDescriptionConfirmation(false);
            setDescriptionModalVisible(false);
        }
    };

    const [showUpdateUsernameConfirmation, setShowUpdateUsernameConfirmation] = useState(false);

    const [showUpdateDescriptionConfirmation, setShowUpdateDescriptionConfirmation] = useState(false);

    const confirmUsernameUpdate = async () => {
        try {
            setLoading(true);

            // Check if userName is defined and not empty
            if (userName && userName !== user?.username) {
                const usernameExists = await checkUsernameExists(userName, user?.username);

                if (usernameExists) {
                    // Username is already taken by another user, show an error message
                    Alert.alert('Username is already taken', 'Please choose a different username.');
                    setLoading(false);
                    return; // Exit the function to prevent further execution
                }
            }

            // Call the updateUser function to send the updated data to the backend
            const updatedUser = await updateUser({
                username: userName || '', // Include the username even if it hasn't changed
            });

            // Update the local user data only if the current user's username is not the same as the updated username
            if (updatedUser && userName !== user?.username) {
                console.log('Profile updated successfully:', updatedUser);
                const currentUser = useAuthStore.getState().user;
            }
            // Navigate to the next screen or perform other actions
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateUsernameConfirmation(false);
            setUsernameModalVisible(false);
        }
    };

    const checkUsernameExists = async (username: string, currentUserUsername: string | undefined) => {
        try {
            // Convert both the provided username and existing usernames to lowercase
            const lowercaseUsername = username.toLowerCase();
            const lowercaseCurrentUserUsername = currentUserUsername?.toLowerCase();

            // You can implement logic here to check if the lowercase username exists in your database
            // For example, you can make an API request to check if the lowercase username is already in use
            // Exclude the current user's username from the search
            const response = await searchForUsers(lowercaseUsername); // Replace with your actual API call

            // Filter out the current user's username from the response
            const filteredResponse = response.filter(
                user => user.username.toLowerCase() !== lowercaseCurrentUserUsername,
            );

            // Check if any usernames in the filtered response match the provided lowercase username
            const usernameExists = filteredResponse.some(user => user.username.toLowerCase() === lowercaseUsername);

            return usernameExists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false; // Assume username doesn't exist in case of an error
        }
    };

    // Function to handle the image selection
    const selectProfileImage = () => {
        launchImageLibrary(
            {
                selectionLimit: 1,
                mediaType: 'photo',
                includeBase64: false,
            },
            handleImageUpload,
        );
    };

    // Function to handle image upload
    const handleImageUpload = async res => {
        if (res.assets) {
            const uri = res.assets[0].uri;
            const fileName = res.assets[0].fileName;
            const type = res.assets[0].type;

            if (uri && fileName && type) {
                try {
                    const result = await updateUserProfilePicture({
                        uri,
                        name: fileName,
                        type,
                    });

                    if (result) {
                        setAvatarUrl(result.profilePicture ?? '');
                    } else {
                        console.error('Failed to update profile picture.');
                        // Display an error message to the user
                    }
                } catch (error) {
                    console.error('Error updating profile picture:', error);
                    // Display an error message to the user
                }
            }
        }
    };

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token'); // Remove the stored token
        await logout();
        setIsLoggedIn(false);
    }

    return (
        <SafeAreaView>
            <ScrollView stickyHeaderIndices={[0]}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>
                <View style={styles.container}>
                    <BackButton navigation={navigation} />
                    <View>
                        <Text style={styles.title}>EDIT PROFILE</Text>
                        <View style={{alignItems: 'center'}}>
                            <Avatar
                                rounded
                                size={125}
                                source={user?.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder}
                                avatarStyle={{
                                    borderWidth: 2,
                                    borderColor: COLORS.AKCRUBLUE,
                                }}
                            />
                            <TouchableOpacity onPress={selectProfileImage}>
                                <Text
                                    style={{
                                        ...FONTS.Title2AkcruBlue,
                                        marginTop: 10,
                                        color: COLORS.MIDORANGE,
                                    }}>
                                    Edit profile photo
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Username */}
                    <View style={{alignItems: 'center', marginTop: 20}}>
                        <Text style={styles.inputlabel}>Username</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handleUsernameModalOpen}>
                                <TextInput
                                    placeholder={user?.username}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setModifiedUserName(text)}
                                    value={userName || ''} // Display the original value, not the modified one
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>
                    {/* Username Modal */}
                    <Modal animationType="fade" transparent={false} visible={usernameModalVisible}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangeUsername}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.GREEN} />
                                </Pressable>
                                <Pressable onPress={() => setUsernameModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.CATREDLGT} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>Change Username (12 character max)</Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.username}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => {
                                        // Remove spaces from the input text
                                        const formattedText = text.replace(/\s/g, '');

                                        // Enforce the 11-character limit
                                        if (formattedText.length <= 12) {
                                            setUserName(formattedText);
                                        }
                                    }}
                                    value={userName} // Use the modified value in the TextInput
                                    editable={true}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* Username Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdateUsernameConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 20,
                                    borderRadius: 10,
                                }}>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Update</Text>
                                    <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                                        Are you sure you want to update your Username?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdateUsernameConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: 'red',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmUsernameUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: 'green',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Description */}
                    <View style={{alignItems: 'center', marginTop: 20}}>
                        <Text style={styles.inputlabel}>Bio</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handleDescriptionModalOpen}>
                                <TextInput
                                    placeholder={user?.description}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setModifiedDescription(text)}
                                    value={description || ''} // Display the original value, not the modified one
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>
                    {/* Description Modal */}
                    <Modal animationType="fade" transparent={false} visible={descriptionModalVisible}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangeDescription}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.GREEN} />
                                </Pressable>
                                <Pressable onPress={() => setDescriptionModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.CATREDLGT} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>Change Bio (150 characters max)</Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.description}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => {
                                        // Limit the description to 150 characters
                                        if (text.length <= 150) {
                                            setDescription(text);
                                        }
                                    }}
                                    value={description} // Use the modified value in the TextInput
                                    multiline={true}
                                    maxLength={150} // Set the maximum character limit
                                    editable={true}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* Description Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdateDescriptionConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 20,
                                    borderRadius: 10,
                                }}>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Update</Text>
                                    <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                                        Are you sure you want to update your Bio?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdateDescriptionConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: 'red',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmDescriptionUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: 'green',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Email */}
                    <View style={{alignItems: 'center', marginTop: 20}}>
                        <Text style={styles.inputlabel}>Email</Text>
                        <View style={styles.input}>
                            <Pressable>
                                <TextInput
                                    placeholder={user?.email}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    value={session?.user?.email} // Display the original value, not the modified one
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* <View>
                        <Text style={styles.inputlabel}>Email</Text>
                        <View style={{alignItems: 'center'}}>
                            <InputsLrg
                                placeholdername={user?.email}
                                iconname={'mail'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                value={session?.user?.email}
                                editable={!loading}
                            />
                            {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                        </View>
                    </View> */}

                    <View style={{alignItems: 'center', marginVertical: 20}}>
                        <TouchableOpacity onPress={() => navigation.navigate('AccountSettings')}>
                            <Text style={styles.settingslabel}>Account Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                handleLogout();
                                // after logging out, navigate to the Signin screen
                                navigation2.navigate('Signin');
                            }}>
                            <Text style={[styles.settingslabel, styles.mt20]}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
