import {View, Text, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, FlatList, Image} from 'react-native';
import React, {useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
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
import LinearGradient from 'react-native-linear-gradient';

const OnboardArchetype = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});

    const [archetypeModal, setArchetypeModal] = useState(false);

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
                            setTrinityModal(true);
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
                <View style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                        </View>

                        <Text style={{...FONTS.Title2, textAlign: 'center', marginHorizontal: 10}}>
                            At Akcru, your movie-watching preferences shape your unique archetype. This personalized
                            archetype guides us in curating the finest movie recommendations for you, as well as
                            connecting you with like-minded users who share similar tastes. At Akcru, we go beyond being
                            a simple streaming platform; we are a multifaceted streaming experience that caters to your
                            individuality.
                        </Text>
                        <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center', marginTop: 20}}>
                            Please choose 2 genres to get you started:
                        </Text>

                        <View style={{marginBottom: 20, marginHorizontal: 10}}>
                            <FlatList
                                data={filteredGenres}
                                horizontal={false}
                                numColumns={3}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View>
                                        <View style={styles.checkboxContainer2}>
                                            <TouchableOpacity onPress={() => handleCheckboxChange(item.id)}>
                                                <View style={styles.checkbox2}>
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
                                            </TouchableOpacity>
                                            <View>
                                                <Text style={styles.checkboxText2}>{item.genre}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
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
                        {/* {showSkipButton && (
                            <View style={{position: 'absolute', zIndex: 10, bottom: '3%', right: '50%', left: '33%'}}>
                                <AkcruButtons.SmallButton
                                    color={COLORS.PURPLE}
                                    btnname={'Skip'}
                                    onPress={handleSkipVideo}
                                    disabled={false}
                                />
                            </View>
                        )} */}

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
                                uri: 'https://d17ybuhl825fg.cloudfront.net/TrinityFAQ/Trinity%2Bintro%2Bvideo%2Bfor%2Bsite.mp4',
                            }}
                            resizeMode="cover"
                            onEnd={handleVideoEnd}
                            repeat={false}
                            onError={handleVideoError}
                            onLoad={handleVideoLoad}
                        />
                    </View>
                </Modal>
            </ImageBackground>
        </View>
    );
};

export default OnboardArchetype;
