import {View, Text, TouchableOpacity, ImageBackground, Modal, Alert, StyleSheet, Platform, Keyboard, ScrollView, KeyboardAvoidingView, ActivityIndicator} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
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
import StepperDots from '../../../components/StepperDots';
import ImageCropPicker from 'react-native-image-crop-picker';
import HexAvatar from '../../../components/HexAvatar';
import {updateUserProfilePicture} from '../../../lib/api/user.lib';
import {Image as CompressorImage} from 'react-native-compressor';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 5;
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
    const [isSelectingImage, setIsSelectingImage] = useState(false);

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
                     setIsFormComplete(true);
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

    const ConfirmChangeCruName = async () => {
        navigation.navigate('NoBottomStack', {
            screen: 'ClientTabNavigator',
            params: {screen: 'FlickFlirtScreen'},
        });
        ///remove cruName
//         if (!isCruNameValid(cruName)) {
//             Alert.alert('Invalid CRU Name', 'Please enter a valid CRU name.');
//             return;
//         }
//
//         setLoading(true);
//
//         try {
//             const cruNameExists = await checkCruNameExists(cruName);
//
//             if (cruNameExists) {
//                 Alert.alert('CRU Name Taken', 'This CRU name is already in use. Please choose a different name.');
//             } else {
//                 const updatedCRU = await updateCRUInfo({name: cruName});
//                 if (updatedCRU) {
//                     setCRU(updatedCRU);
//                     // Profile picture is already handled immediately on selection.
//                     // Move straight to Archetype screen.
//                     navigation.navigate('OnboardArchetype');
//                 } else {
//                     Alert.alert('Update Failed', 'Failed to update CRU name. Please try again.');
//                 }
//             }
//         } catch (error) {
//             console.error('Error during CRU name confirmation:', error);
//             Alert.alert('Error', 'An error occurred while checking the CRU name.');
//         } finally {
//             setLoading(false);
//         }
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <LinearGradient
                    colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
                {/* Fixed Header Section */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                        <Text style={styles.stepIndicator}>
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
                <View style={{alignItems: 'center', marginBottom: 16}}>
                    <StepperDots
                        currentStep={CURRENT_STEP}
                        totalSteps={TOTAL_STEPS}
                    />
                </View>

                {/* Centered Content Section */}
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                <ScrollView contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 24,
                }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={{width: '90%', alignItems: 'center'}}>
                        <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>
                             Add a profile picture.
                        </Text>
                    {/* Cru name input */}

                        {/* Profile picture selection - tap HexAvatar to pick */}
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <TouchableOpacity
                                onPress={() => selectProfileImage()}
                                disabled={isSelectingImage}
                                style={{alignItems: 'center', justifyContent: 'center'}}
                                activeOpacity={0.8}>
                                <View style={{width: profilePicture, height: profilePicture, alignItems: 'center', justifyContent: 'center'}}>
                                    <HexAvatar
                                        source={{uri: selectImage}}
                                        size={profilePicture}
                                        bordercolor={COLORS.AKCRUBLUE}
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
                                                backgroundColor: COLORS.OVERLAY_BLACK_40,
                                                borderRadius: 8,
                                            }}>
                                            <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                        </View>
                                    )}
                                </View>
                                <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 10, opacity: isSelectingImage ? 0.6 : 1}]}>
                                    {isSelectingImage ? 'Opening...' : 'Tap to pick a profile photo'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Next button */}
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruButtons.LrgButton
                                variant="auth"
                                color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                btnname={'Finish'}
                                onPress={() => {
                                Keyboard.dismiss();
                                ConfirmChangeCruName();
                            }}
                                disabled={!isFormComplete || loading}
                                loading={loading}
                            />
                        </View>
                    </View>
                    <Modal animationType="fade" transparent={true} visible={showSizeErrorModal}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.OVERLAY_BLACK_55,
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
                    <Text style={{...FONTS.paragraph2, color: COLORS.OVERLAY_WHITE_55, textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardCruName;
