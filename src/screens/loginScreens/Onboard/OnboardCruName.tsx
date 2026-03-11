import {View, Text, TouchableOpacity, ImageBackground, Modal, KeyboardAvoidingView, Alert, StyleSheet, Platform, Keyboard} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME, AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {ICru} from '../../../../types';
import {searchCRUs, updateCRUInfo} from '../../../lib/api/cru.lib';
import ProgressBar from '../../../components/ProgressBar';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import HexAvatar from '../../../components/HexAvatar';
import {updateUserProfilePicture} from '../../../lib/api/user.lib';
import {Image as CompressorImage} from 'react-native-compressor';
import {isTablet} from '../../../../assets/constants/theme';

const TOTAL_STEPS = 7;
const CURRENT_STEP = 6;
const profilePicture = isTablet() ? 150 : 100;

const OnboardCruName = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [, setCRU] = useState<ICru | undefined>(undefined);

    // Cru name
    const [cruName, setCruName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [userNameError, setUserNameError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    // Profile picture
    const [selectImage, setSelectImage] = useState('');
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    // Modal (kept for consistency with other onboarding screens)
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const isCruNameValid = (value: string) => value.length > 2;

    const checkFormCompletion = () => {
        if (cruName && isCruNameValid(cruName)) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [cruName]);

    const handleCruNameChange = (text: string) => {
        const trimmed = text.trim();
        setCruName(trimmed);
        setUserNameError(!isCruNameValid(trimmed));
    };

    const checkCruNameExists = async (name: string) => {
        try {
            const lowercaseCruName = name.toLowerCase();
            const response = await searchCRUs(lowercaseCruName);

            if (response && response.success) {
                const currentCruName = useAuthStore.getState().user?.Cru?.name.toLowerCase();
                const filteredCrus = response.data.filter(cru => cru.name.toLowerCase() !== currentCruName);
                const cruNameExists = filteredCrus.some(cru => cru.name.toLowerCase() === lowercaseCruName);
                return cruNameExists;
            }
            return false;
        } catch (error) {
            console.error('Error checking CRU name:', error);
            return false;
        }
    };

    const compressImage = async (imageUri: string) => {
        const compressedImagePath = await CompressorImage.compress(imageUri, {
            compressionMethod: 'auto',
        });

        return compressedImagePath;
    };

    const selectProfileImage = async () => {
        const options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'image',
            },
        };

        let callbackExecuted = false;

        launchImageLibrary(options, async response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) return;
                callbackExecuted = true;

                const asset = response.assets[0];
                if (!asset?.uri) return;

                const selectedImageUncomp = asset.uri;
                const selectedImage = await compressImage(selectedImageUncomp);

                const imageType = asset.type;
                const imageName = asset.fileName;
                const imageSizeInBytes = asset.fileSize;

                if (imageSizeInBytes !== undefined) {
                    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

                    if (imageSizeInBytes > maxSizeInBytes) {
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
                }
            }
        });
    };

    const ConfirmChangeCruName = async () => {
        if (!isCruNameValid(cruName)) {
            Alert.alert('Invalid CRU Name', 'Please enter a valid CRU name.');
            return;
        }

        setLoading(true);

        try {
            const cruNameExists = await checkCruNameExists(cruName);

            if (cruNameExists) {
                Alert.alert('CRU Name Taken', 'This CRU name is already in use. Please choose a different name.');
            } else {
                const updatedCRU = await updateCRUInfo({name: cruName});
                if (updatedCRU) {
                    setCRU(updatedCRU);
                    // Profile picture is already handled immediately on selection.
                    // Move straight to Archetype screen.
                    navigation.navigate('OnboardArchetype');
                } else {
                    Alert.alert('Update Failed', 'Failed to update CRU name. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error during CRU name confirmation:', error);
            Alert.alert('Error', 'An error occurred while checking the CRU name.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={styles.headerRow}>
                            <View style={styles.headerLeft}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                                </TouchableOpacity>
                                <Text style={AUTH_TEXT_THEME.stepIndicator}>
                                    {CURRENT_STEP}/{TOTAL_STEPS}
                                </Text>
                            </View>
                            <View style={styles.logoCenter}>
                                <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            </View>
                            <View style={[styles.backButton, {opacity: 0}]}>
                                <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                            </View>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <View style={{width: '90%'}}>
                                <ProgressBar
                                    currentStep={CURRENT_STEP}
                                    totalSteps={TOTAL_STEPS}
                                    style={styles.progress}
                                />
                            </View>
                            <Text style={AUTH_TEXT_THEME.instruction}>
                                Create your Cru name and add a profile picture.
                            </Text>
                        </View>

                        {/* Cru name input */}
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
                                <BlurView
                                    style={StyleSheet.absoluteFill}
                                    blurType="light"
                                    blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                    reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                />
                                <Inputs
                                    placeholdername={'Create a Cru name'}
                                    iconname={'person'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={handleCruNameChange}
                                    value={cruName}
                                    editable={!loading}
                                    containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                />
                            </View>
                            {userNameError && <Text style={AUTH_TEXT_THEME.error}>Invalid Username format</Text>}
                            <Text style={AUTH_TEXT_THEME.highlight}>
                                Your Cru name must be unique and at least 3 characters long.
                            </Text>
                        </View>

                        {/* Profile picture selection */}
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <HexAvatar
                                source={{uri: selectImage}}
                                size={profilePicture}
                                bordercolor={COLORS.AKCRUBLUE}
                            />
                        </View>
                        <View>
                            <TouchableOpacity onPress={selectProfileImage}>
                                <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 10}]}>
                                    Pick a profile photo
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Picture Size Error Modal */}
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
                                        Image is too large. Please select an image under 5MB.
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
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        {/* Generic modal (kept, but currently unused) */}
                        <Modal animationType="fade" transparent={true} visible={showEmailModal}>
                            <ResetPasswordResultModal
                                closeModal={() => setShowEmailModal(false)}
                                messageheader={resetResultType.messageheader}
                                messageheadercolor={resetResultType.messageheadercolor}
                                message={resetResultType.message}
                                iconname={resetResultType.iconname}
                                iconcolor={resetResultType.iconcolor}
                            />
                        </Modal>

                        {/* Next button */}
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={() => {
                                    Keyboard.dismiss();
                                    ConfirmChangeCruName();
                                }}
                                    disabled={!isFormComplete || loading}
                                />
                            </View>
                        </View>
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardCruName;
