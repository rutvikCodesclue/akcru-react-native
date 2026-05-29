import {View, Text, TouchableOpacity, ImageBackground, Modal, Keyboard, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image} from 'react-native';
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
import {appVersion, MOVIE_GENRES} from '../../../../assets/constants/Data';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import HexAvatar from '../../../components/HexAvatar';
import {updateUserProfilePicture, updateUser} from '../../../lib/api/user.lib';
import {Image as CompressorImage} from 'react-native-compressor';
import StepperDots from '../../../components/StepperDots';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import useAuthStore from '../../../stores/auth.store';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 5;
const profilePicture = isTablet() ? 150 : 100;

const OnboardProfilePicture = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const compressImage = async (image: string) => {
        const compressedImagePath = await CompressorImage.compress(image, {
            compressionMethod: 'auto',
        });

        return compressedImagePath;
    };

    const goToMainApp = () => {
        navigation.navigate('NoBottomStack', {
            screen: 'ClientTabNavigator',
            params: {screen: 'FlickFlirtScreen'},
        });
    };

    const PictureSet = () => {
        Keyboard.dismiss();
        goToMainApp();
    };

    const [selectImage, setSelectImage] = useState('');
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});
    const [archetypeModal, setArchetypeModal] = useState(false);
    const [isUpdatingArchetype, setIsUpdatingArchetype] = useState(false);
    const [archetypeName, setArchetypeName] = useState('');
    const [archetypeImage, setArchetypeImage] = useState<string | null>(null);
    const [archetypeDescription, setArchetypeDescription] = useState('');

    const handleCheckboxChange = (genreId: string) => {
        if (checkedGenres[genreId]) {
            setCheckedGenres(prev => ({...prev, [genreId]: false}));
        } else if (Object.values(checkedGenres).filter(Boolean).length < 2) {
            setCheckedGenres(prev => ({...prev, [genreId]: true}));
        }
    };

    const handleFinishButton = async () => {
        const selectedGenres = Object.keys(checkedGenres).filter(id => checkedGenres[id]);
        if (selectedGenres.length !== 2) return;
        const genreNames = selectedGenres
            .map(id => MOVIE_GENRES.find(item => item.id === id)?.genre ?? '')
            .filter(Boolean);
        const newArchetypeKey = genreNames.sort().join(', ');
        const selectedArchetype = archetypeMapping[newArchetypeKey];
        if (!selectedArchetype) return;
        setArchetypeModal(true);
        setIsUpdatingArchetype(true);
        setArchetypeName(selectedArchetype.name);
        setArchetypeImage(selectedArchetype.image);
        setArchetypeDescription(selectedArchetype.description);
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
                setIsUpdatingArchetype(false);
                setTimeout(() => {
                    setArchetypeModal(false);
                    goToMainApp();
                }, 4000);
            }
        } catch (e) {
            console.error('Error updating archetype:', e);
            setIsUpdatingArchetype(false);
        }
    };

    const filteredGenres = MOVIE_GENRES.filter(g => g.id !== '0');
    const selectedGenresCount = Object.values(checkedGenres).filter(Boolean).length;
    const isFinishEnabled = selectedGenresCount === 2;

    const selectProfileImage = async () => {
        const options = {
            mediaType: 'photo' as MediaType,
            storageOptions: { path: 'image' },
        };

        let callbackExecuted = false;

        launchImageLibrary(options, async response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) return;
                callbackExecuted = true;

                const selectedImageUncomp = response.assets[0].uri;
                if (!selectedImageUncomp) return;
                const selectedImage = await compressImage(selectedImageUncomp);
                const imageType = response.assets[0].type;
                const imageName = response.assets[0].fileName;
                const imageSizeInBytes = response.assets[0].fileSize;

                if (imageSizeInBytes !== undefined) {
                    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
                    if (imageSizeInBytes > maxSizeInBytes) {
                        setShowSizeErrorModal(true);
                    } else {
                        const updatedUserProfilePicture = await updateUserProfilePicture({
                            uri: selectedImage,
                            type: imageType ?? 'image/jpeg',
                            name: imageName ?? 'image.jpg',
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
                            Add a profile picture. Obscenity will not be tolerated and will be swiftly removed
                        </Text>
                    <View style={{alignItems: 'center', marginTop: 20}}>
                            <HexAvatar
                                source={{uri: selectImage}}
                                size={profilePicture}
                                bordercolor={COLORS.AKCRUBLUE}
                            />
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => selectProfileImage()}>
                                <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 10}]}>
                                    Pick a profile photo
                                </Text>
                            </TouchableOpacity>
                        </View>
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
                        <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 24, marginBottom: 12, textAlign: 'center'}]}>
                            Or choose 2 genres to get your archetype:
                        </Text>
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
                        <View style={{alignItems: 'center', width: '100%', marginBottom: 24}}>
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
                    {/* Picture Size Error Modal*/}
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
                    <Modal animationType="fade" transparent={true} visible={archetypeModal}>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.OVERLAY_BLACK_55}}>
                            <Text style={{...FONTS.Title1}}>Your Archetype is:</Text>
                            {archetypeName ? (
                                <Text style={{...FONTS.Title3, textAlign: 'center', marginVertical: 10, color: COLORS.PURPLE}}>
                                    "{archetypeName}"
                                </Text>
                            ) : null}
                            <View>
                                {archetypeImage ? (
                                    <Image
                                        source={{uri: archetypeImage}}
                                        style={{width: SIZES.ScreenWidth / 1.2, height: SIZES.ScreenWidth / 1.2, borderRadius: 5, alignSelf: 'center'}}
                                    />
                                ) : null}
                            </View>
                            {archetypeDescription ? (
                                <Text style={{...FONTS.paragraph1, textAlign: 'center', marginVertical: 10, marginHorizontal: 15, color: COLORS.LIGHTGREY}}>
                                    {archetypeDescription}
                                </Text>
                            ) : null}
                            {isUpdatingArchetype ? (
                                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                                    <ActivityIndicator size="small" color={COLORS.PINK} />
                                    <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY, marginLeft: 10}}>Saving your archetype...</Text>
                                </View>
                            ) : null}
                        </View>
                    </Modal>
                    <Text style={{...FONTS.paragraph2, color: COLORS.OVERLAY_WHITE_55, textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardProfilePicture;
