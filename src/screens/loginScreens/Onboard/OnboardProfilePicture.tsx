import {View, Text, TouchableOpacity, ImageBackground, Modal, KeyboardAvoidingView, Keyboard} from 'react-native';
import React, {useState} from 'react';
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
import {appVersion} from '../../../../assets/constants/Data';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import HexAvatar from '../../../components/HexAvatar';
import {updateUserProfilePicture} from '../../../lib/api/user.lib';
import {Image as CompressorImage} from 'react-native-compressor';
import ProgressBar from '../../../components/ProgressBar';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 11;
const CURRENT_STEP = 10;
const profilePicture = isTablet() ? 150 : 100;

const OnboardProfilePicture = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const compressImage = async image => {
        const compressedImagePath = await CompressorImage.compress(image, {
            compressionMethod: 'auto',
        });

        return compressedImagePath;
    };

    const PictureSet = async () => {
        navigation.navigate('OnboardArchetype');
    };

    const [selectImage, setSelectImage] = useState('');

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

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
                const selectedImage = await compressImage(selectedImageUncomp);

                const imageType = response.assets[0].type;
                const imageName = response.assets[0].fileName;

                const imageSizeInBytes = response.assets[0].fileSize;

                if (imageSizeInBytes !== undefined) {
                    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

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
                            setSelectImage(updatedUserProfilePicture.profilePicture || '');
                        }
                    }
                }
            }
        });
    };

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                          <LinearGradient
                                            colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                height: SIZES.ScreenHeight,
                                            }}
                                        />
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
                                Add a profile picture. Obscenity will not be tolerated and will be swiftly removed
                            </Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <HexAvatar
                                source={{uri: selectImage}}
                                size={profilePicture}
                                bordercolor={COLORS.AKCRUBLUE}
                            />
                        </View>
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    selectProfileImage();
                                }}>
                                <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 10}]}>
                                    Pick a profile photo
                                </Text>
                            </TouchableOpacity>
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
                                        {'Image is too large. Please select an image under 2MB.'}
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
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={COLORS.PURPLE}
                                    btnname={'Next'}
                                    onPress={() => {
                                    Keyboard.dismiss();
                                    PictureSet();
                                }}
                                    disabled={false}
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

export default OnboardProfilePicture;
