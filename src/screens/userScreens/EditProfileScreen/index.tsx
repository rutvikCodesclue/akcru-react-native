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
import {ImagePickerResponse, MediaType, launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import * as ImagePicker from "expo-image-picker";
import {API} from '../../../clients/api.client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import InputsLrg from '../../../components/inputLrg';
import {MOVIE_GENRES, appVersion} from '../../../../assets/constants/Data';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';
import imageindex from '../../../../assets/images/imageindex';
import {updateUserProfilePicture, updateUser, searchForUsers} from '../../../lib/api/user.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import { selectAvatarBorderColor } from '../../../util/util';
import EnlargeImageModal from '../../../components/EnlargeImageModal/EnlargeImageModal';
import HelpModal from '../../../components/HelpModal/HelpModal';


const gallery = FAKE_USER_PROFILES[0].gallery;

export default function EditProfile({session}: {session: Session}) {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    // get user from auth store, also get the logout function
    const user = useAuthStore(state => state.user);
    const archetype = user?.archetype ? JSON.parse(user.archetype) : null;
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
        setModifiedDescription(description);
        setDescriptionModalVisible(true);
    };

    const handleChangeDescription = () => {
        setShowUpdateDescriptionConfirmation(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            //console.log('Edit Profile Screen focused [EditProfileScreen]');
            hydrateUser();

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                //console.log('Edit Profile Screen unfocused [EditProfileScreen]');
            };
        }, []),
    );

    // const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

    // const handleUpdateProfile = () => {
    //     // Show the confirmation modal
    //     setShowUpdateConfirmation(true);
    // };

    const confirmDescriptionUpdate = async () => {
        try {
            setLoading(true);

            // Call the updateUser function to send the updated data to the backend
            const updatedUser = await updateUser({
                description: description,
            });

            // Update the local user data with the new description
            if (updatedUser) {
                //console.log('Profile updated successfully:', updatedUser);
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
                //console.log('Profile updated successfully:', updatedUser);
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

    const [selectImage, setSelectImage] = useState(user?.profilePicture || '');

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
    const selectProfileImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'image',
            },
        };

        //console.log('select picture button');

        // Add a flag to prevent multiple invocations
        let callbackExecuted = false;

        launchImageLibrary(options, async response => {
            if (response && !response.didCancel && response.assets) {
                // Check if the response is defined, not canceled, and has assets
                if (callbackExecuted) {
                    return;
                }

                // Set the flag to true to indicate the callback has been executed
                callbackExecuted = true;
                //console.log('uri:', response.assets[0].uri);
                //console.log('filesize:', response.assets[0].fileSize);
                const selectedImage = response.assets[0].uri;

                // Get the type and name for the selected image
                const imageType = response.assets[0].type;
                const imageName = response.assets[0].fileName;

                // Check the size of the selected image
                const imageSizeInBytes = response.assets[0].fileSize;
                const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

                if (imageSizeInBytes > maxSizeInBytes) {
                    // Show size error modal
                    setShowSizeErrorModal(true);
                } else {
                    // Call the API function to update the user's profile picture
                    const updatedUserProfilePicture = await updateUserProfilePicture({
                        uri: selectedImage,
                        type: imageType,
                        name: imageName,
                    });

                    if (updatedUserProfilePicture) {
                        // Set the new profile picture immediately
                        //console.log('updatedUserProfilePicture:', updatedUserProfilePicture);
                        setSelectImage(updatedUserProfilePicture.profilePicture || '');
                    } else {
                        // Handle failure or display an error message
                        //console.log('Failed to update profile picture');
                    }
                }
            }
        });
    };

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token'); // Remove the stored token
        await logout();
        setIsLoggedIn(false);
    }

    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});
    const [archetypeKey, setArchetypeKey] = useState('');

    const [archetypeName, setArchetypeName] = useState('');
    const [archetypeImage, setArchetypeImage] = useState<string | null>(null);
    const [archetypeDescription, setArchetypeDescription] = useState('');

    const [isArchetypeModalVisible, setArchetypeModalVisible] = useState(false); // State to control modal visibility
    const [isHelpModalVisible, setHelpModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleArchetypeModal = () => {
        setArchetypeModalVisible(!isArchetypeModalVisible);
    };

    const handleCheckboxChange = (genreId: string) => {
        // Check if the genre is already selected
        if (checkedGenres[genreId]) {
            // If it's selected, unselect it
            setCheckedGenres(prevState => ({
                ...prevState,
                [genreId]: false,
            }));
        } else {
            // Check if the limit of two genres is reached
            if (Object.values(checkedGenres).filter(Boolean).length < 2) {
                // If not reached, select the genre
                setCheckedGenres(prevState => ({
                    ...prevState,
                    [genreId]: true,
                }));
            } else {
                // If limit is reached, show a message or perform an action
                //console.log('You can only select up to two genres.');
            }
        }
    };

    const handleFinishButton = async () => {
        const selectedGenres = Object.keys(checkedGenres).filter(genreId => checkedGenres[genreId]);
        //console.log('Selected Genres:', selectedGenres);

        if (selectedGenres.length === 2) {
            const genreNames = selectedGenres.map(genreId => {
                const genreObject = MOVIE_GENRES.find(item => item.id === genreId);
                return genreObject ? genreObject.genre : '';
            });

            const newArchetypeKey = genreNames.sort().join(', ');
            //console.log('Archetype Key:', newArchetypeKey);

            const selectedArchetype = archetypeMapping[newArchetypeKey];

            if (selectedArchetype) {
                // Serialize the archetype data including the genres
                const archetypeData = JSON.stringify({
                    name: selectedArchetype.name,
                    image: selectedArchetype.image,
                    description: selectedArchetype.description,
                    genres: genreNames, // Add the selected genre names
                });

                try {
                    // Update the user's archetype in the backend
                    const updatedUser = await updateUser({archetype: archetypeData});
                    if (updatedUser) {
                        //console.log('Archetype updated successfully:', updatedUser);

                        // Update the global state/context with the new user data
                        useAuthStore.setState({user: updatedUser});

                        // Optionally update local component state here
                    }
                } catch (error) {
                    console.error('Error updating archetype:', error);
                }
            } else {
                //console.log('No matching archetype found for the selected genres.');
            }
        } else {
            //console.log('Please select exactly 2 genres.');
        }
    };

    const filteredGenres = MOVIE_GENRES.filter(genre => genre.id !== '0');

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>
                    <View style={styles.container}>
                        <TouchableOpacity onPress={() => navigation.pop()}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.title}>EDIT PROFILE</Text>
                            <View style={{alignItems: 'center'}}>
                                <HexAvatar
                                    source={{uri: selectImage}}
                                    size={140}
                                    bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                />

                                <TouchableOpacity
                                    onPress={() => {
                                        selectProfileImage();
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.paragraph2,
                                            marginTop: 10,
                                            color: COLORS.MIDORANGE,
                                        }}>
                                        Edit profile photo
                                    </Text>
                                </TouchableOpacity>
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
                        <View style={{alignItems: 'center'}}>
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
                                <View style={styles.bioinput}>
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
                        <View style={{alignItems: 'center'}}>
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

                        <Text style={{...FONTS.paragraph2, textAlign: 'center'}}>
                            At Akcru, your movie-watching preferences shape your unique archetype. This personalized
                            "Archetype" guides us in curating the finest movie recommendations for you, as well as
                            connecting you with like-minded users who share similar tastes. At Akcru, we go beyond being
                            a simple streaming platform; we are a multifaceted streaming experience that caters to your
                            individuality.
                        </Text>
                        <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, textAlign: 'center', marginTop: 20}}>
                            Please choose 2 genres to then press "FINISH":
                        </Text>
                        <View style={{flex: 1}}>
                            <View style={{marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 10}}>
                                {filteredGenres.map((item, index) => (
                                    <View key={item.id} style={{width: '33.33%', padding: 4}}>
                                        <View style={styles.checkboxContainer}>
                                            <TouchableOpacity onPress={() => handleCheckboxChange(item.id)}>
                                                <View style={styles.checkbox}>
                                                    {checkedGenres[item.id] && (
                                                        <Icon
                                                            name="checkmark-sharp"
                                                            type="ionicon"
                                                            size={18}
                                                            color={COLORS.MIDORANGE}
                                                            style={{marginTop: -3}}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                            <View>
                                                <Text style={styles.checkboxText}>{item.genre}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            {/* <Text
                                style={{
                                    ...FONTS.Title3,
                                    textAlign: 'center',
                                    marginVertical: 10,
                                    color: COLORS.PURPLE,
                                }}>
                                "{archetype && archetype.genres ? archetype.genres.join(', ') : 'No Genres Selected'}"
                            </Text> */}

                            {archetype && (
                                <Text
                                    style={{
                                        ...FONTS.Title3,
                                        textAlign: 'center',
                                        marginVertical: 10,
                                        color: COLORS.PURPLE,
                                    }}>
                                    "{archetype ? archetype.name : 'No Archetype Selected'}"
                                </Text>
                            )}
                            <Pressable
                                onPress={() => {
                                    toggleArchetypeModal();
                                }}>
                                {archetype && (
                                    <Image
                                        source={{uri: archetype ? archetype.image : ''}}
                                        style={{
                                            width: SIZES.ScreenWidth / 2.2,
                                            height: SIZES.ScreenWidth / 2.2,
                                            borderRadius: 5,
                                            alignSelf: 'center',
                                        }}
                                    />
                                )}
                            </Pressable>

                            {archetype && (
                                <Text style={{...FONTS.paragraph2, textAlign: 'center', marginVertical: 10}}>
                                    {archetype ? archetype.description : 'No Archetype Selected'}
                                </Text>
                            )}

                            <View>
                                <View style={{alignItems: 'center'}}>
                                    <AkcruButtons.XlLrgButton
                                        color={COLORS.MIDORANGE}
                                        btnname={'Finish'}
                                        onPress={handleFinishButton}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Create a modal to display the enlarged image */}
                        <Modal visible={isArchetypeModalVisible} animationType="fade" transparent={true}>
                            <EnlargeImageModal
                                image={archetype ? archetype.image : ''}
                                closeModal={toggleArchetypeModal}
                            />
                        </Modal>

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
                            <TouchableOpacity onPress={() => navigation2.navigate('AccountSettings')}>
                                <Text style={styles.settingslabel}>Account Settings</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setHelpModalVisible(true)}>
                                <View style={{flexDirection: 'row', marginTop: 5}}>
                                    <Text style={styles.settingslabel}>Help</Text>
                                    <View style={{marginLeft: 5}}>
                                        <Icon
                                            name="help-rhombus"
                                            type="material-community"
                                            color={COLORS.MIDORANGE}
                                            size={20}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation2.navigate('BlockedUsers')}>
                                <View style={{flexDirection: 'row', marginTop: 5}}>
                                    <Text style={styles.settingslabel}>Blocked Users</Text>
                                    <View style={{marginLeft: 5}}>
                                        <Icon
                                            name="account-cancel"
                                            type="material-community"
                                            color={COLORS.MIDORANGE}
                                            size={20}
                                        />
                                    </View>
                                </View>
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
                        <Text style={{...FONTS.Title2White, textAlign: 'center', fontSize: 12}}>
                            version {appVersion[0].version}
                        </Text>
                        <Modal visible={isHelpModalVisible} animationType="fade" transparent={true}>
                            <HelpModal
                                closeModal={() => setHelpModalVisible(false)}
                                faq={() => {
                                    setHelpModalVisible(false); // Close the modal first
                                    navigation2.navigate('Help');
                                }}
                                bugReport={() => {
                                    setHelpModalVisible(false); // Close the modal first
                                    navigation2.navigate('BugReport');
                                }}
                                suggestion={() => {
                                    setHelpModalVisible(false); // Close the modal first
                                    navigation2.navigate('Suggestions');
                                }}
                                question={() => {
                                    setHelpModalVisible(false); // Close the modal first
                                    navigation2.navigate('Questions');
                                }}
                            />
                        </Modal>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
}
