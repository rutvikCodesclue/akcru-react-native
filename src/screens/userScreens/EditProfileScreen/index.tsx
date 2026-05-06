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
    Switch,
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
import PreferenceChip from '../../../components/PreferenceChip';
import {isTablet, MULTISIZES} from '../../../../assets/constants/theme';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ArchetypeHorizontalDivider from '../../../components/ArchetypeHorizontalDivider';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {MITInvitePolicy} from '../../../util/mitInvitePolicy';

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
    const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
    const [showAge, setShowAge] = useState<boolean>(Boolean(user?.showAge));
    const [allowFollowersToSendMIT, setAllowFollowersToSendMIT] = useState<boolean>(
        (user as any)?.mitInvitePolicy === MITInvitePolicy.FOLLOWERS_ONLY,
    );
    const [showActiveStatus, setShowActiveStatus] = useState<boolean>(Boolean((user as any)?.showActiveStatus));

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
            setShowAge(Boolean(u?.showAge));
            setAllowFollowersToSendMIT((u as any)?.mitInvitePolicy === MITInvitePolicy.FOLLOWERS_ONLY);
            setShowActiveStatus(Boolean((u as any)?.showActiveStatus));
            return () => {};
        }, []),
    );

    const handleToggleShowAge = async (value: boolean) => {
        setShowAge(value);
        try {
            const updatedUser = await updateUser({showAge: value});
            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    currentUser.showAge = value;
                    useAuthStore.setState({user: currentUser});
                }
            }
        } catch (error) {
            setShowAge(prev => !prev);
            Alert.alert('Error', 'Failed to update age visibility setting.');
        }
    };

    const handleToggleFollowersCanSendMIT = async (value: boolean) => {
        setAllowFollowersToSendMIT(value);
        try {
            const policy = value ? MITInvitePolicy.FOLLOWERS_ONLY : MITInvitePolicy.EVERYONE;
            const updatedUser = await updateUser({mitInvitePolicy: policy});
            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    (currentUser as any).mitInvitePolicy = policy;
                    useAuthStore.setState({user: currentUser});
                }
            }
        } catch (error) {
            setAllowFollowersToSendMIT(prev => !prev);
            Alert.alert('Error', 'Failed to update MIT permission setting.');
        }
    };

    const handleToggleShowActiveStatus = async (value: boolean) => {
        setShowActiveStatus(value);
        try {
            const updatedUser = await updateUser({showActiveStatus: value});
            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    (currentUser as any).showActiveStatus = value;
                    useAuthStore.setState({user: currentUser});
                }
            }
        } catch (error) {
            setShowActiveStatus(prev => !prev);
            Alert.alert('Error', 'Failed to update active status visibility setting.');
        }
    };

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

    const FLICKFLIRT_TOP_GENRES_KEY = 'flickflirt_top_genres';

    useFocusEffect(
        React.useCallback(() => {
            let isMounted = true;
            (async () => {
                try {
                    const genreNames: string[] | null = (() => {
                        if (user?.archetype) {
                            try {
                                const parsed = JSON.parse(user.archetype);
                                if (Array.isArray(parsed?.genres) && parsed.genres.length >= 2) return parsed.genres;
                            } catch (_) {}
                        }
                        return null;
                    })();
                    if (!isMounted) return;
                    const namesToUse =
                        genreNames ??
                        (await AsyncStorage.getItem(FLICKFLIRT_TOP_GENRES_KEY).then(raw => {
                            if (!raw) return null;
                            try {
                                const arr = JSON.parse(raw);
                                return Array.isArray(arr) && arr.length >= 2 ? arr : null;
                            } catch {
                                return null;
                            }
                        }));
                    if (!isMounted || !namesToUse || namesToUse.length < 2) return;
                    const initial: Record<string, boolean> = {};
                    namesToUse.forEach(name => {
                        const item = MOVIE_GENRES.find(g => g.id !== '0' && g.genre.toLowerCase() === String(name).toLowerCase());
                        if (item) initial[item.id] = true;
                    });
                    if (Object.keys(initial).length > 0) setCheckedGenres(initial);
                } catch (e) {
                    console.warn('EditProfile: could not load default genres', e);
                }
            })();
            return () => {
                isMounted = false;
            };
        }, [user?.archetype]),
    );

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
            <View style={styles.screenRoot}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    style={styles.backbutton}
                    contentContainerStyle={styles.scrollContent}>
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>

                    <View style={styles.container}>
                        <BackButton
                            navigation={navigation2}
                            onBack={() => {
                                navigation2.navigate('ClientTabNavigator', {
                                    screen: 'UserProfileStack',
                                });
                            }}
                        />
                        <View>
                            <Text style={styles.title}>EDIT PROFILE</Text>
                            <View style={{alignItems: 'center'}}>
                                {/* Profile picture - tap HexAvatar to pick (same as OnboardCruName) */}
                                <TouchableOpacity
                                    onPress={() => selectProfileImage()}
                                    disabled={isSelectingImage}
                                    style={{alignItems: 'center', justifyContent: 'center'}}
                                    activeOpacity={0.8}>
                                    <View style={{width: isTablet() ? 140 : 100, height: isTablet() ? 140 : 100, alignItems: 'center', justifyContent: 'center'}}>
                                        <HexAvatar
                                            source={{uri: selectImage}}
                                            size={isTablet() ? 140 : 100}
                                            bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                        />
                                        {isSelectingImage && (
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                                    borderRadius: 8,
                                                }}>
                                                <ActivityIndicator size="large" color={COLORS.PINK} />
                                            </View>
                                        )}
                                    </View>
                                    <Text
                                        style={{
                                            ...FONTS.paragraph2,
                                            color: COLORS.PINK,
                                            marginTop: 10,
                                            opacity: isSelectingImage ? 0.6 : 1,
                                        }}>
                                        {isSelectingImage ? 'Opening...' : 'Tap to pick a profile photo'}
                                    </Text>
                                </TouchableOpacity>
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

                        <View style={styles.profileCard}>
                        <View style={styles.fieldGroup}>
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

                        {/* <View style={styles.fieldGroup}>
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
                        </View> */}

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

                        <View style={styles.fieldGroup}>
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

                        <View style={styles.fieldGroup}>
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
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Show age to other users?</Text>
                            <Switch
                                value={showAge}
                                onValueChange={handleToggleShowAge}
                                trackColor={{false: 'rgba(255,255,255,0.2)', true: 'rgba(52,152,219,0.45)'}}
                                thumbColor={showAge ? COLORS.AKCRUBLUE : COLORS.LIGHTGREY}
                            />
                        </View>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Allow followers to send MIT?</Text>
                            <Switch
                                value={allowFollowersToSendMIT}
                                onValueChange={handleToggleFollowersCanSendMIT}
                                trackColor={{false: 'rgba(255,255,255,0.2)', true: 'rgba(52,152,219,0.45)'}}
                                thumbColor={allowFollowersToSendMIT ? COLORS.AKCRUBLUE : COLORS.LIGHTGREY}
                            />
                        </View>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Is shows active status to other user ?</Text>
                            <Switch
                                value={showActiveStatus}
                                onValueChange={handleToggleShowActiveStatus}
                                trackColor={{false: 'rgba(255,255,255,0.2)', true: 'rgba(52,152,219,0.45)'}}
                                thumbColor={showActiveStatus ? COLORS.AKCRUBLUE : COLORS.LIGHTGREY}
                            />
                        </View>
                        </View>

                        <View style={styles.archetypeSection}>
                        <ArchetypeHorizontalDivider />
                        <Text style={styles.bodyCopy}>
                            At Akcru, your movie-watching preferences shape your unique archetype. This personalized
                            "Archetype" guides us in curating the finest movie recommendations for you, as well as
                            connecting you with like-minded users who share similar tastes. At Akcru, we go beyond being
                            a simple streaming platform; we are a multifaceted streaming experience that caters to your
                            individuality.
                        </Text>
                        <Text style={styles.headingCopy}>
                            Please choose 2 genres to then press "FINISH":
                        </Text>
                        <View style={{flex: 1}}>
                            <View style={[styles.chipContainer, {marginBottom: 20}]}>
                                {filteredGenres.map(item => (
                                    <PreferenceChip
                                        key={item.id}
                                        selected={Boolean(checkedGenres[item.id])}
                                        onPress={() => handleCheckboxChange(item.id)}
                                        label={item.genre}
                                    />
                                ))}
                            </View>

                            {archetype && (
                                <MaskedView
                                    style={styles.archetypeNameMask}
                                    maskElement={
                                        <Text style={styles.archetypeNameText}>
                                            {archetype ? archetype.name : 'No Archetype Selected'}
                                        </Text>
                                    }>
                                    <LinearGradient
                                        colors={['#FFF59D', COLORS.AKCRUBLUE, COLORS.PINK, '#C026D3']}
                                        locations={[0, 0.32, 0.68, 1]}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}>
                                        <Text style={[styles.archetypeNameText, {opacity: 0}]}>
                                            {archetype ? archetype.name : 'No Archetype Selected'}
                                        </Text>
                                    </LinearGradient>
                                </MaskedView>
                            )}
                            <Pressable
                                onPress={() => {
                                    toggleArchetypeModal();
                                }}>
                                {archetype && (
                                    <Image
                                        source={{uri: archetype ? archetype.image : ''}}
                                        style={styles.archetypePreview}
                                    />
                                )}
                            </Pressable>

                            {archetype && (
                                <Text style={styles.archetypeDescription}>
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

                        </View>

                        <View style={styles.settingsSection}>
                            <View style={styles.settingsRow}>
                                <TouchableOpacity
                                    style={styles.settingsItem}
                                    onPress={() => navigation2.navigate('AccountSettings')}>
                                    <View style={styles.settingsLabelGroup}>
                                        <Icon name="cog-outline" type="material-community" color={COLORS.PINK} size={20} />
                                        <Text style={styles.settingslabel}>Account Settings</Text>
                                    </View>
                                    <Text style={styles.settingsChevron}>{'>'}</Text>
                                </TouchableOpacity>
                                <View style={styles.settingsSeparator} />
                                <TouchableOpacity style={styles.settingsItem} onPress={() => setHelpModalVisible(true)}>
                                    <View style={styles.settingsLabelGroup}>
                                        <Icon name="help-circle-outline" type="material-community" color={COLORS.PINK} size={20} />
                                        <Text style={styles.settingslabel}>Help</Text>
                                    </View>
                                    <Text style={styles.settingsChevron}>{'>'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.settingsSeparator} />
                            <View style={styles.settingsRow}>
                                <TouchableOpacity
                                    style={styles.settingsItem}
                                    onPress={() => navigation2.navigate('BlockedUsers')}>
                                    <View style={styles.settingsLabelGroup}>
                                        <Icon name="account-cancel-outline" type="material-community" color={COLORS.PINK} size={20} />
                                        <Text style={styles.settingslabel}>Blocked Users</Text>
                                    </View>
                                    <Text style={styles.settingsChevron}>{'>'}</Text>
                                </TouchableOpacity>
                                <View style={styles.settingsDangerSeparator} />
                                <TouchableOpacity
                                    style={[styles.settingsItem, styles.settingsDangerItem]}
                                    onPress={() => setShowSignOutConfirmation(true)}>
                                    <View style={styles.settingsLabelGroup}>
                                        <Icon name="logout" type="material-community" color="#FF4D4F" size={20} />
                                        <Text style={styles.settingsDangerLabel}>Sign Out</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
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
                        <Modal animationType="fade" transparent visible={showSignOutConfirmation}>
                            <ConfirmationModal
                                onPressYes={async () => {
                                    setShowSignOutConfirmation(false);
                                    setIsLoggingOut(true);
                                    try {
                                        await handleLogout();
                                        resetNavigation({index: 0, routes: [{name: 'Welcome', params: {fromLogout: true}}]});
                                    } finally {
                                        setIsLoggingOut(false);
                                    }
                                }}
                                onPressNo={() => setShowSignOutConfirmation(false)}
                                variant="continueWatching"
                                yesLabel="Sign Out"
                                noLabel="Cancel"
                                confirmationText="Are you sure you want to sign out?"
                            />
                        </Modal>
                    </View>
                </ScrollView>
            </View>
        </TabContainer>
    );
}
