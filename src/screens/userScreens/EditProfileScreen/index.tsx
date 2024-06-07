import {useState} from 'react';
import styles from './styles';
import {View, Alert, Text, ScrollView, Image, SafeAreaView, TextInput, Modal, Pressable, Platform} from 'react-native';
import {TouchableOpacity, TouchableHighlight} from 'react-native-gesture-handler';
import {Session} from '@supabase/supabase-js';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import {Icon} from '@rneui/base';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import React from 'react';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import {MOVIE_GENRES, appVersion} from '../../../../assets/constants/Data';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';
import {updateUserProfilePicture, updateUser, searchForUsers} from '../../../lib/api/user.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {selectAvatarBorderColor} from '../../../util/util';
import EnlargeImageModal from '../../../components/EnlargeImageModal/EnlargeImageModal';
import HelpModal from '../../../components/HelpModal/HelpModal';
import BackButton from '../../../components/General/backbutton';
import {Image as CompressorImage} from 'react-native-compressor';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {MULTISIZES} from '../../../../assets/constants/theme';

export default function EditProfile({session}: {session: Session}) {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const user = useAuthStore(state => state.user);
    const archetype = user?.archetype ? JSON.parse(user.archetype) : null;
    const logout = useAuthStore(state => state.logout);
    const {hydrateUser} = useAuthStore();

    const [, setLoading] = useState(false);

    const [userName, setUserName] = useState('');
    const [, setModifiedUserName] = useState('');
    const [usernameModalVisible, setUsernameModalVisible] = useState(false);

    const [description, setDescription] = useState('');
    const [, setModifiedDescription] = useState('');
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [, setIsLoggedIn] = useState<boolean>(false);

    const handleUsernameModalOpen = () => {
        setModifiedUserName(userName);
        setUsernameModalVisible(true);
    };

    const handleChangeUsername = () => {
        setUsernameModalVisible(false);
        setShowUpdateUsernameConfirmation(true);
    };

    const handleDescriptionModalOpen = () => {
        setModifiedDescription(description);
        setDescriptionModalVisible(true);
    };

    const handleChangeDescription = () => {
        setDescriptionModalVisible(false);

        setShowUpdateDescriptionConfirmation(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();

            return () => {};
        }, []),
    );

    const confirmDescriptionUpdate = async () => {
        try {
            setLoading(true);

            const updatedUser = await updateUser({
                description: description,
            });

            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;

                if (currentUser) {
                    currentUser.description = description;
                    useAuthStore.setState({user: currentUser});
                }
            }
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

            if (userName && userName !== user?.username) {
                const usernameExists = await checkUsernameExists(userName, user?.username);

                if (usernameExists) {
                    Alert.alert('Username is already taken', 'Please choose a different username.');
                    setLoading(false);
                    return;
                }
            }
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
            const lowercaseUsername = username.toLowerCase();
            const lowercaseCurrentUserUsername = currentUserUsername?.toLowerCase();

            const response = await searchForUsers(lowercaseUsername);

            const filteredResponse = response.filter(
                user => user.username.toLowerCase() !== lowercaseCurrentUserUsername,
            );

            const usernameExists = filteredResponse.some(user => user.username.toLowerCase() === lowercaseUsername);

            return usernameExists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    };

    const [selectImage, setSelectImage] = useState(user?.profilePicture || '');
    const compressImage = async image => {
        const compressedImagePath = await CompressorImage.compress(image, {
            compressionMethod: 'auto',
        });

        return compressedImagePath;
    };

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
    // const selectProfileImage = async () => {
    //     let options = {
    //         mediaType: 'photo' as MediaType,
    //         storageOptions: {
    //             path: 'image',
    //         },
    //     };

    //     let callbackExecuted = false;

    //     launchImageLibrary(options, async response => {
    //         if (response && !response.didCancel && response.assets) {
    //             if (callbackExecuted) {
    //                 return;
    //             }

    //             callbackExecuted = true;

    //             const selectedImageUncomp = response.assets[0].uri;
    //             const selectedImage = await compressImage(selectedImageUncomp);

    //             const imageType = response.assets[0].type;
    //             const imageName = response.assets[0].fileName;

    //             const imageSizeInBytes = response.assets[0].fileSize;
    //             const maxSizeInBytes = 5 * 1024 * 1024;

    //             if (imageSizeInBytes > maxSizeInBytes) {
    //                 setShowSizeErrorModal(true);
    //             } else {
    //                 const updatedUserProfilePicture = await updateUserProfilePicture({
    //                     uri: selectedImage,
    //                     type: imageType,
    //                     name: imageName,
    //                 });

    //                 if (updatedUserProfilePicture) {
    //                     setSelectImage(updatedUserProfilePicture.profilePicture || '');
    //                 }
    //             }
    //         }
    //     });
    // };

    const selectProfileImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'image',
            },
        };

        let callbackExecuted = false;

        launchImageLibrary(options, async response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;

                const selectedImageUncomp = response.assets[0].uri;
                const imageType = response.assets[0].type;
                const imageName = response.assets[0].fileName;

                const imageSizeInBytes = response.assets[0].fileSize;
                const maxSizeInBytes = 5 * 1024 * 1024;

                if (imageSizeInBytes > maxSizeInBytes) {
                    setShowSizeErrorModal(true);
                    return;
                }

                let selectedImage = selectedImageUncomp;

                // Check if the image is not a GIF before compressing
                if (imageType !== 'image/gif') {
                    selectedImage = await compressImage(selectedImageUncomp);
                }

                const updatedUserProfilePicture = await updateUserProfilePicture({
                    uri: selectedImage,
                    type: imageType,
                    name: imageName,
                });

                if (updatedUserProfilePicture) {
                    setSelectImage(updatedUserProfilePicture.profilePicture || '');
                }
            }
        });
    };

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token');
        await logout();
        setIsLoggedIn(false);
    }

    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});

    const [isArchetypeModalVisible, setArchetypeModalVisible] = useState(false);
    const [isHelpModalVisible, setHelpModalVisible] = useState(false);

    const toggleArchetypeModal = () => {
        setArchetypeModalVisible(!isArchetypeModalVisible);
    };

    const handleCheckboxChange = (genreId: string) => {
        if (checkedGenres[genreId]) {
            setCheckedGenres(prevState => ({
                ...prevState,
                [genreId]: false,
            }));
        } else {
            if (Object.values(checkedGenres).filter(Boolean).length < 2) {
                setCheckedGenres(prevState => ({
                    ...prevState,
                    [genreId]: true,
                }));
            } else {
            }
        }
    };

    const handleFinishButton = async () => {
        const selectedGenres = Object.keys(checkedGenres).filter(genreId => checkedGenres[genreId]);

        if (selectedGenres.length === 2) {
            const genreNames = selectedGenres.map(genreId => {
                const genreObject = MOVIE_GENRES.find(item => item.id === genreId);
                return genreObject ? genreObject.genre : '';
            });

            const newArchetypeKey = genreNames.sort().join(', ');

            const selectedArchetype = archetypeMapping[newArchetypeKey];

            if (selectedArchetype) {
                const archetypeData = JSON.stringify({
                    name: selectedArchetype.name,
                    image: selectedArchetype.image,
                    description: selectedArchetype.description,
                    genres: genreNames,
                });

                try {
                    const updatedUser = await updateUser({archetype: archetypeData});
                    if (updatedUser) {
                        useAuthStore.setState({user: updatedUser});
                    }
                } catch (error) {
                    console.error('Error updating archetype:', error);
                }
            }
        }
    };

    const filteredGenres = MOVIE_GENRES.filter(genre => genre.id !== '0');

    return (
        <TabContainer>
            <View>
                <ScrollView stickyHeaderIndices={[0]} style={styles.backbutton}>
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>
                    <View style={styles.container}>
                        <BackButton navigation={navigation} />
                        <View>
                            <Text style={styles.title}>EDIT PROFILE</Text>
                            <View style={{alignItems: 'center'}}>
                                <HexAvatar
                                    source={{uri: selectImage}}
                                    size={140}
                                    bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                />
                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        color: COLORS.PINK,
                                        marginTop: 10,
                                    }}>
                                    Select a photo or GIF
                                </Text>
                                <View>
                                    <TouchableOpacity
                                        style={{flexDirection: 'row', alignItems: 'center'}}
                                        onPress={() => {
                                            selectProfileImage();
                                        }}>
                                        <CustomIcon
                                            name="image"
                                            type="material-community"
                                            color={COLORS.PINK}
                                            baseSize={MULTISIZES.medium13}
                                        />

                                        <Text
                                            style={{
                                                ...FONTS.paragraph2,
                                                color: COLORS.PINK,
                                            }}>
                                            {' / '}
                                        </Text>

                                        <CustomIcon
                                            name="file-gif-box"
                                            type="material-community"
                                            color={COLORS.PINK}
                                            baseSize={MULTISIZES.large15}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

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

                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <Text style={styles.inputlabel}>Username</Text>
                            <View style={styles.input}>
                                {Platform.OS == 'ios' ? (
                                    <TouchableOpacity onPress={handleUsernameModalOpen}>
                                        <TextInput
                                            placeholder={user?.username}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => setModifiedUserName(text)}
                                            value={userName || ''}
                                            editable={false}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <Pressable onPress={handleUsernameModalOpen}>
                                        <TextInput
                                            placeholder={user?.username}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => setModifiedUserName(text)}
                                            value={userName || ''}
                                            editable={false}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        <Modal animationType="fade" transparent={false} visible={usernameModalVisible}>
                            <SafeAreaView
                                style={{
                                    flex: 1,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                    paddingTop: 20,
                                }}>
                                {Platform.OS == 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 20,
                                        }}>
                                        <TouchableOpacity onPress={handleChangeUsername}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setUsernameModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 20,
                                        }}>
                                        <Pressable onPress={handleChangeUsername}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </Pressable>
                                        <Pressable onPress={() => setUsernameModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                    </View>
                                )}

                                <Text style={styles.inputlabel}>Change Username (12 character max)</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={user?.username}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => {
                                            const formattedText = text.replace(/\s/g, '');

                                            if (formattedText.length <= 12) {
                                                setUserName(formattedText);
                                            }
                                        }}
                                        value={userName}
                                        editable={true}
                                    />
                                </View>
                            </SafeAreaView>
                        </Modal>

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
                                    {Platform.OS == 'ios' ? (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <TouchableOpacity
                                                onPress={() => setShowUpdateUsernameConfirmation(false)}
                                                style={{
                                                    backgroundColor: COLORS.PURPLE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={confirmUsernameUpdate}
                                                style={{
                                                    backgroundColor: COLORS.AKCRUBLUE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Update</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <Pressable
                                                onPress={() => setShowUpdateUsernameConfirmation(false)}
                                                style={{
                                                    backgroundColor: COLORS.PURPLE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Cancel</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={confirmUsernameUpdate}
                                                style={{
                                                    backgroundColor: COLORS.AKCRUBLUE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Update</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Modal>

                        <View style={{alignItems: 'center'}}>
                            <Text style={styles.inputlabel}>Bio</Text>
                            <View style={styles.input}>
                                {Platform.OS == 'ios' ? (
                                    <TouchableOpacity onPress={handleDescriptionModalOpen}>
                                        <TextInput
                                            placeholder={
                                                user?.description == '' || user?.description == null
                                                    ? 'Add a bio'
                                                    : user?.description
                                            }
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => setModifiedDescription(text)}
                                            value={description || ''}
                                            editable={false}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <Pressable onPress={handleDescriptionModalOpen}>
                                        <TextInput
                                            placeholder={
                                                user?.description == '' || user?.description == null
                                                    ? 'Add a bio'
                                                    : user?.description
                                            }
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => setModifiedDescription(text)}
                                            value={description || ''}
                                            editable={false}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        <Modal animationType="fade" transparent={false} visible={descriptionModalVisible}>
                            <SafeAreaView
                                style={{
                                    flex: 1,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                    paddingTop: 20,
                                }}>
                                {Platform.OS == 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 20,
                                        }}>
                                        <TouchableOpacity onPress={handleChangeDescription}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setDescriptionModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 20,
                                        }}>
                                        <Pressable onPress={handleChangeDescription}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </Pressable>
                                        <Pressable onPress={() => setDescriptionModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                    </View>
                                )}

                                <Text style={styles.inputlabel}>Change Bio (150 characters max)</Text>
                                <View style={styles.bioinput}>
                                    <TextInput
                                        placeholder={
                                            user?.description == '' || user?.description == null
                                                ? 'Add a bio'
                                                : user?.description
                                        }
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => {
                                            if (text.length <= 150) {
                                                setDescription(text);
                                            }
                                        }}
                                        value={description}
                                        multiline={true}
                                        maxLength={150}
                                        editable={true}
                                    />
                                </View>
                            </SafeAreaView>
                        </Modal>

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
                                    {Platform.OS == 'ios' ? (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <TouchableOpacity
                                                onPress={() => setShowUpdateDescriptionConfirmation(false)}
                                                style={{
                                                    backgroundColor: COLORS.PURPLE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={confirmDescriptionUpdate}
                                                style={{
                                                    backgroundColor: COLORS.AKCRUBLUE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Update</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <Pressable
                                                onPress={() => setShowUpdateDescriptionConfirmation(false)}
                                                style={{
                                                    backgroundColor: COLORS.PURPLE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Cancel</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={confirmDescriptionUpdate}
                                                style={{
                                                    backgroundColor: COLORS.AKCRUBLUE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Update</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Modal>

                        <View style={{alignItems: 'center'}}>
                            <Text style={styles.inputlabel}>Email</Text>
                            <View style={styles.input}>
                                <Pressable>
                                    <TextInput
                                        placeholder={user?.email}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        value={session?.user?.email}
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
                        <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center', marginTop: 20}}>
                            Please choose 2 genres to then press "FINISH":
                        </Text>
                        <View style={{flex: 1}}>
                            <View style={{marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 10}}>
                                {filteredGenres.map((item, index) => (
                                    <View key={item.id} style={{width: '33.33%', padding: 4}}>
                                        <View style={styles.checkboxContainer}>
                                            <TouchableHighlight onPress={() => handleCheckboxChange(item.id)}>
                                                <View style={styles.checkbox}>
                                                    {checkedGenres[item.id] && (
                                                        <Icon
                                                            name="checkmark-sharp"
                                                            type="ionicon"
                                                            size={18}
                                                            color={COLORS.AKCRUBLUE}
                                                            style={{marginTop: -3}}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableHighlight>
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
                                        color: COLORS.LIGHTGREY,
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
                                        color={COLORS.PURPLE}
                                        btnname={'Finish'}
                                        onPress={handleFinishButton}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        </View>

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
                                            color={COLORS.PINK}
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
                                            color={COLORS.PINK}
                                            size={20}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    handleLogout();

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
                                    setHelpModalVisible(false);
                                    navigation2.navigate('Help');
                                }}
                                bugReport={() => {
                                    setHelpModalVisible(false);
                                    navigation2.navigate('BugReport');
                                }}
                                suggestion={() => {
                                    setHelpModalVisible(false);
                                    navigation2.navigate('Suggestions');
                                }}
                                question={() => {
                                    setHelpModalVisible(false);
                                    navigation2.navigate('Questions');
                                }}
                            />
                        </Modal>
                    </View>
                </ScrollView>
            </View>
        </TabContainer>
    );
}
