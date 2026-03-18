import {useState} from 'react';
import styles from './styles';
import {
    View,
    Alert,
    Text,
    ScrollView,
    Image,
    SafeAreaView,
    TextInput,
    Modal,
    Pressable,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import {TouchableOpacity, TouchableHighlight} from 'react-native-gesture-handler';
import {Session} from '@supabase/supabase-js';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import React from 'react';
import ImageCropPicker from 'react-native-image-crop-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import {MOVIE_GENRES, appVersion} from '../../../../assets/constants/Data';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';
import {updateUserProfilePicture, updateUser, searchForUsers, upgradeCRUView} from '../../../lib/api/user.lib';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import { AuthStackParams } from '../../../navigation/AuthNavigation'
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {selectAvatarBorderColor} from '../../../util/util';
import EnlargeImageModal from '../../../components/EnlargeImageModal/EnlargeImageModal';
import HelpModal from '../../../components/HelpModal/HelpModal';
import BackButton from '../../../components/General/backbutton';
import {reset as resetNavigation} from '../../../util/RootNavigation';
import {Image as CompressorImage} from 'react-native-compressor';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {isTablet, MULTISIZES} from '../../../../assets/constants/theme';

export default function EditProfile({session}: {session: Session}) {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const authNav = useNavigation<NativeStackNavigationProp<AuthStackParams>>()

    const user = useAuthStore(state => state.user);
    const canGrantAD = useAuthStore(state => state.user?.canGrantAD);
    const archetype = user?.archetype ? JSON.parse(user.archetype) : null;
    const logout = useAuthStore(state => state.logout);
    const walletBalance = useAuthStore(s => s.walletBalance);
    const {hydrateUser} = useAuthStore();

    const [_, setLoading] = useState(false);

    const [userName, setUserName] = useState('');
    const [, setModifiedUserName] = useState('');
    const [usernameModalVisible, setUsernameModalVisible] = useState(false);
    const [unlockModalVisible, setUnlockModalVisible] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [description, setDescription] = useState('');
    const [, setModifiedDescription] = useState('');
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [, setIsLoggedIn] = useState<boolean>(false);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [showUpdatePhoneConfirmation, setShowUpdatePhoneConfirmation] = useState(false);

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

    const handlePhoneModalOpen = () => {
        setPhoneNumber(user?.phoneNumber ?? '');
        setPhoneModalVisible(true);
    };

    const getPhoneDigits = (value: string) => (value ?? '').replace(/\D/g, '');

    const handleChangePhone = () => {
        const digits = getPhoneDigits(phoneNumber);
        if (digits.length > 0 && (digits.length < 10 || digits.length > 15)) {
            Alert.alert(
                'Invalid phone number',
                'Phone number must be between 10 and 15 digits.',
                [{text: 'OK'}],
            );
            return;
        }
        setPhoneModalVisible(false);
        setShowUpdatePhoneConfirmation(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            const u = useAuthStore.getState().user;
            if (u?.phoneNumber !== undefined) setPhoneNumber(u.phoneNumber ?? '');
            if (u?.description !== undefined) setDescription(u.description ?? '');
            if (u?.username !== undefined) setUserName(u.username ?? '');
            return () => {};
        }, []),
    );

    const confirmDescriptionUpdate = async () => {
        try {
            setLoading(true);
            setShowUpdateDescriptionConfirmation(false);

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
            setDescriptionModalVisible(false);
        }
    };

    const [showUpdateUsernameConfirmation, setShowUpdateUsernameConfirmation] = useState(false);

    const [showUpdateDescriptionConfirmation, setShowUpdateDescriptionConfirmation] = useState(false);

    const confirmUsernameUpdate = async () => {
        try {
            setLoading(true);
            setShowUpdateUsernameConfirmation(false);

            if (userName && userName !== user?.username) {
                const usernameExists = await checkUsernameExists(userName, user?.username);

                if (usernameExists) {
                    Alert.alert('Username is already taken', 'Please choose a different username.');
                    setLoading(false);
                    return;
                }
                await updateUser({
                    username: userName,
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setUsernameModalVisible(false);
        }
    };

    const confirmPhoneUpdate = async () => {
        try {
            setShowUpdatePhoneConfirmation(false);

            const digits = getPhoneDigits(phoneNumber);
            if (digits.length > 0 && (digits.length < 10 || digits.length > 15)) {
                Alert.alert(
                    'Invalid phone number',
                    'Phone number must be between 10 and 15 digits.',
                    [{text: 'OK'}],
                );
                return;
            }

            const trimmedPhone = digits;
            if (trimmedPhone !== (user?.phoneNumber ?? '')) {
                setLoading(true);
                const updatedUser = await updateUser({phone: trimmedPhone});
                if (updatedUser) {
                    const currentUser = useAuthStore.getState().user;
                    if (currentUser) {
                        currentUser.phoneNumber = trimmedPhone;
                        useAuthStore.setState({user: currentUser});
                    }
                }
            }
        } catch (error) {
            console.error('Error updating phone number:', error);
        } finally {
            setLoading(false);
            setPhoneModalVisible(false);
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
    const [isSelectingImage, setIsSelectingImage] = useState(false);

    const compressImage = async (imageUri: string) => {
        const compressedImagePath = await CompressorImage.compress(imageUri, {
            compressionMethod: 'auto',
        });
        return compressedImagePath;
    };

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const selectProfileImage = async () => {
        try {
            setIsSelectingImage(true);
            const image = await ImageCropPicker.openPicker({
                cropping: true,
                cropperCircleOverlay: true,
                width: 400,
                height: 400,
                mediaType: 'photo',
            });

            const selectedImageUncomp = image.path || (image as any).sourceURL || (image as any).uri;
            const selectedImage = await compressImage(selectedImageUncomp);

            const imageType = image.mime || 'image/jpeg';
            const imageName = image.filename || `profile_${Date.now()}.jpg`;
            const imageSizeInBytes = image.size;
            const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

            if (imageSizeInBytes !== undefined && imageSizeInBytes > maxSizeInBytes) {
                setShowSizeErrorModal(true);
            } else {
                const updatedUserProfilePicture = await updateUserProfilePicture({
                    uri: selectedImage,
                    type: imageType,
                    name: imageName,
                });

                if (updatedUserProfilePicture) {
                    setSelectImage(updatedUserProfilePicture.profilePicture || '');
                }
            }
        } catch (e: any) {
            if (e?.code !== 'E_PICKER_CANCELLED') {
                console.error('Profile image pick/crop error:', e);
            }
        } finally {
            setIsSelectingImage(false);
        }
    };

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token');
        await logout();
        setIsLoggedIn(false);
    }

    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});

    const [isArchetypeModalVisible, setArchetypeModalVisible] = useState(false);
    const [isHelpModalVisible, setHelpModalVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    const selectedGenresCount = Object.values(checkedGenres).filter(Boolean).length;
    const isFinishEnabled = selectedGenresCount === 2;

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
                                    size={isTablet() ? 140 : 100}
                                    bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                />
                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        color: COLORS.PINK,
                                        marginTop: 10,
                                        opacity: isSelectingImage ? 0.6 : 1,
                                    }}>
                                    {isSelectingImage ? 'Opening...' : 'Select a photo'}
                                </Text>
                                <View>
                                    <TouchableOpacity
                                        style={{flexDirection: 'row', alignItems: 'center'}}
                                        onPress={() => selectProfileImage()}
                                        disabled={isSelectingImage}>
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
                                        <Pressable onPress={() => setUsernameModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                        <Pressable onPress={handleChangeUsername}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
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
                                            // Convert text to lowercase, remove whitespace, and restrict input to allowed characters
                                            const formattedText = text
                                                .toLowerCase()
                                                .replace(/\s/g, '')
                                                .replace(/[^a-z0-9._]/g, '');

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

                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <Text style={styles.inputlabel}>Phone number</Text>
                            <View style={styles.input}>
                                {Platform.OS == 'ios' ? (
                                    <TouchableOpacity onPress={handlePhoneModalOpen}>
                                        <TextInput
                                            placeholder={user?.phoneNumber ? user.phoneNumber : 'Add phone number'}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            value={phoneNumber || ''}
                                            editable={false}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <Pressable onPress={handlePhoneModalOpen}>
                                        <TextInput
                                            placeholder={user?.phoneNumber ? user.phoneNumber : 'Add phone number'}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            value={phoneNumber || ''}
                                            editable={false}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        <Modal animationType="fade" transparent={false} visible={phoneModalVisible}>
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
                                        <TouchableOpacity onPress={handleChangePhone}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setPhoneModalVisible(false)}>
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
                                        <Pressable onPress={() => setPhoneModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                        <Pressable onPress={handleChangePhone}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </Pressable>
                                    </View>
                                )}

                                <Text style={styles.inputlabel}>Change phone number</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder="Add phone number"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        keyboardType="phone-pad"
                                        onChangeText={text => {
                                            const digits = text.replace(/\D/g, '').slice(0, 15);
                                            setPhoneNumber(digits);
                                        }}
                                        value={phoneNumber}
                                        maxLength={15}
                                        editable={true}
                                    />
                                </View>
                            </SafeAreaView>
                        </Modal>

                        <Modal animationType="fade" transparent={true} visible={showUpdatePhoneConfirmation}>
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
                                            Are you sure you want to update your phone number?
                                        </Text>
                                    </View>
                                    {Platform.OS == 'ios' ? (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <TouchableOpacity
                                                onPress={() => setShowUpdatePhoneConfirmation(false)}
                                                style={{
                                                    backgroundColor: COLORS.PURPLE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={confirmPhoneUpdate}
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
                                                onPress={() => setShowUpdatePhoneConfirmation(false)}
                                                style={{
                                                    backgroundColor: COLORS.PURPLE,
                                                    padding: 10,
                                                    borderRadius: 5,
                                                }}>
                                                <Text style={{...FONTS.Title3}}>Cancel</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={confirmPhoneUpdate}
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
                            <View style={styles.bioinput}>
                                {Platform.OS == 'ios' ? (
                                    <TouchableOpacity onPress={handleDescriptionModalOpen}>
                                        <TextInput
                                            placeholder={
                                                user?.description == '' || user?.description == null
                                                    ? 'Add a bio'
                                                    : user?.description
                                            }
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.biotextinput}
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
                                            style={styles.biotextinput}
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
                                        <Pressable onPress={() => setDescriptionModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                        <Pressable onPress={handleChangeDescription}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
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
                                        style={styles.biotextinput}
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
                            <View style={[styles.chipContainer, {marginBottom: 20}]}>
                                {filteredGenres.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => handleCheckboxChange(item.id)}
                                        style={checkedGenres[item.id] ? styles.chipSelected : styles.chip}>
                                        <Text style={checkedGenres[item.id] ? styles.chipTextSelected : styles.chipText}>
                                            {item.genre}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

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

                            <View style={{alignItems: 'center', width: '100%'}}>
                                <AkcruButtons.XlLrgButton
                                    variant="auth"
                                    color={isFinishEnabled ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Finish'}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        handleFinishButton();
                                    }}
                                    disabled={!isFinishEnabled}
                                />
                            </View>
                        </View>

                        <Modal animationType="fade" transparent={true} visible={showSuccessModal}>
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
                                        {'Success! You have upgraded to video CRU view!'}
                                    </Text>
                                </View>
                            </View>
                        </Modal>

                        <Modal animationType="fade" transparent={true} visible={isLoggingOut}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                }}>
                                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>
                                    Signing out...
                                </Text>
                            </View>
                        </Modal>

                        <Modal visible={isArchetypeModalVisible} animationType="fade" transparent={true}>
                            <EnlargeImageModal
                                image={archetype ? archetype.image : ''}
                                closeModal={toggleArchetypeModal}
                            />
                        </Modal>

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
                                    Alert.alert(
                                        'Sign Out',
                                        'Are you sure you want to sign out?',
                                        [
                                            {text: 'Cancel', style: 'cancel'},
                                            {
                                                text: 'Sign Out',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    setIsLoggingOut(true);
                                                    try {
                                                        await handleLogout();
                                                        resetNavigation({index: 0, routes: [{name: 'Welcome', params: {fromLogout: true}}]});
                                                    } finally {
                                                        setIsLoggingOut(false);
                                                    }
                                                },
                                            },
                                        ],
                                    );
                                }}>
                                <Text style={[styles.settingslabel, styles.mt20]}>Sign Out</Text>
                            </TouchableOpacity>
                            {canGrantAD && (
                                <TouchableOpacity onPress={() => navigation2.navigate('AdminGrantADScreen')}>
                                    <Text style={[styles.settingslabel, styles.mt20]}>System Wallet</Text>
                                </TouchableOpacity>
                            )}
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
