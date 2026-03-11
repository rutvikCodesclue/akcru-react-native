import {View, Text, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, Image, ScrollView, Keyboard} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import {Icon} from '@rneui/base';
import useAuthStore from '../../../stores/auth.store';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import Video from 'react-native-video';
import {updateUser} from '../../../lib/api/user.lib';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';
import {getHelpVideoById} from '../../../lib/api/helpvideo.lib';
import ProgressBar from '../../../components/ProgressBar';
import {isTablet} from '../../../../assets/constants/theme';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';

const buttonMargin = isTablet() ? '20%' : '15%';

const TOTAL_STEPS = 7;
const CURRENT_STEP = 7;

const OnboardArchetype = () => {

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});

    const [archetypeModal, setArchetypeModal] = useState(false);
    const [showSkip, setShowSkip] = useState(true);

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

    const [archetypeKey, setArchetypeKey] = useState('');
    const [archetypeName, setArchetypeName] = useState('');
    const [archetypeImage, setArchetypeImage] = useState<string | null>(null);
    const [archetypeDescription, setArchetypeDescription] = useState('');

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
                setArchetypeModal(true);
                const newArchetypeName = selectedArchetype.name;
                const newArchetypeImage = selectedArchetype.image;
                const newArchetypeDescription = selectedArchetype.description;

                setArchetypeName(newArchetypeName);
                setArchetypeImage(newArchetypeImage);
                setArchetypeDescription(newArchetypeDescription);

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

                        setTimeout(() => {
                            setArchetypeModal(false);
                            // setTrinityModal(true);
                            navigation.navigate('NoBottomStack', {
                                screen: 'ClientTabNavigator',
                                params: {screen: 'FlickFlirtScreen'},
                            });
                        }, 4000);
                    }
                } catch (error) {
                    console.error('Error updating archetype:', error);
                }
            } else {
            }
        } else {
        }
    };

    const filteredGenres = MOVIE_GENRES.filter(genre => genre.id !== '0');

    const [trinityModal, setTrinityModal] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [skipVideo, setSkipVideo] = useState(false);

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [showSkipButton, setShowSkipButton] = useState(false);

    const handleVideoLoad = () => {
        const timeout = setTimeout(() => {
            setShowSkipButton(true);
        }, 10000);

        setLoadingTimeout(timeout);

        setIsVideoLoaded(true);
    };

    const handleVideoEnd = () => {
        setTrinityModal(false);

        if (!videoError) {
            navigation.navigate('OnboardBuildCru');
        } else {
        }
    };

    const handleVideoError = () => {
        setVideoError(true);
        navigation.navigate('OnboardBuildCru');
    };

    const handleSkipVideo = () => {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }

        setSkipVideo(true);
        setTrinityModal(false);
        navigation.navigate('OnboardBuildCru');
    };
    const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

    const [videoURL, setVideoURL] = useState('');

    useEffect(() => {
        const fetchHelpVideo = async () => {
            const video = await getHelpVideoById('a5e441f8-89b1-4e9a-ab70-66a8b5971513'); // Replace 'your_video_id' with the actual ID
            if (video) {
                setVideoURL(video.videoURL);
            }
        };

        fetchHelpVideo();
    }, []);

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <View style={{flex: 1, marginBottom: 50}}>
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
                        </View>

                        <ScrollView
                            style={{flex: 1}}
                            contentContainerStyle={{paddingBottom: 20}}
                            showsVerticalScrollIndicator={false}>
                            <Text style={[AUTH_TEXT_THEME.instruction, {marginHorizontal: 10}]}>
                                At Akcru, your movie-watching preferences shape your unique archetype. This personalized
                                archetype guides us in curating the finest movie recommendations for you, as well as
                                connecting you with like-minded users who share similar tastes. At Akcru, we go beyond being
                                a simple streaming platform; we are a multifaceted streaming experience that caters to your
                                individuality.
                            </Text>
                            <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 20}]}>
                                Please choose 2 genres to get you started:
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
                        </ScrollView>
                    </View>
                    <View>
                        <View style={{alignItems: 'center', marginBottom: buttonMargin}}>
                            <AkcruButtons.XlLrgButton
                                variant="auth"
                                color={COLORS.PURPLE}
                                btnname={'Finish'}
                                onPress={() => {
                                Keyboard.dismiss();
                                handleFinishButton();
                            }}
                                disabled={false}
                            />
                        </View>
                    </View>
                </View>

                <Modal animationType="fade" transparent={true} visible={archetypeModal}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        }}>
                        <Text style={{...FONTS.Title1}}>Your Archetype is:</Text>

                        {archetypeName && (
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    textAlign: 'center',
                                    marginVertical: 10,
                                    color: COLORS.PURPLE,
                                }}>
                                "{archetypeName}"
                            </Text>
                        )}
                        <View>
                            {archetypeImage && (
                                <Image
                                    source={{uri: archetypeImage}}
                                    style={{
                                        width: SIZES.ScreenWidth / 1.2,
                                        height: SIZES.ScreenWidth / 1.2,
                                        borderRadius: 5,
                                        alignSelf: 'center',
                                    }}
                                />
                            )}
                        </View>

                        {archetypeDescription && (
                            <Text
                                style={{
                                    ...FONTS.paragraph1,
                                    textAlign: 'center',
                                    marginVertical: 10,
                                    marginHorizontal: 15,
                                    color: COLORS.LIGHTGREY,
                                }}>
                                {archetypeDescription}
                            </Text>
                        )}
                    </View>
                </Modal>

                <Modal animationType="fade" transparent={true} visible={trinityModal}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                            width: '100%',
                        }}>
                        {!isVideoLoaded && (
                            <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '50%'}}>
                                <ActivityIndicator size="large" color={COLORS.PURPLE} />
                            </View>
                        )}
                        <Video
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            source={{
                                uri: videoURL,
                            }}
                            resizeMode="cover"
                            onEnd={handleVideoEnd}
                            repeat={false}
                            onError={handleVideoError}
                            onLoad={handleVideoLoad}
                        />
                        {showSkip && (
                            <TouchableOpacity style={styles.skipButton} onPress={handleSkipVideo}>
                                <Text style={styles.skipButtonText}>Skip</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Modal>
            </ImageBackground>
        </View>
    );
};

export default OnboardArchetype;
