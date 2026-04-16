import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    Image,
    ImageBackground,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Modal,
    Animated,
    Easing,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import {
    COLORS,
    FLICK_FLIRT_BG_BASE_COLORS,
    FLICK_FLIRT_IMAGE_OVERLAY_BOTTOM_COLORS,
    FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS,
    FONTS,
    SIZES,
} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import onboardStyles from '../../../loginScreens/Onboard/styles';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {updateUser} from '../../../../lib/api/user.lib';
import useAuthStore from '../../../../stores/auth.store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AkcruButtons from '../../../../components/akcruButtons';
import {useBackNavigatesToClientTab} from '../../../../hooks/useBackNavigatesToClientTab';

const FLICKFLIRT_TOP_GENRES_KEY = 'flickflirt_top_genres';

/** Archetype title — matches brand pink */
const ARCHETYPE_NAME_COLOR = '#dc1cd3';

type FlickFlirtArchetypeResultNavProp = NativeStackNavigationProp<NoBottomTabStackParams, 'FlickFlirtArchetypeResult'>;
type FlickFlirtArchetypeResultRouteProp = RouteProp<NoBottomTabStackParams, 'FlickFlirtArchetypeResult'>;

const FlickFlirtArchetypeResult = () => {
    const navigation = useNavigation<FlickFlirtArchetypeResultNavProp>();
    const goHome = useBackNavigatesToClientTab();
    const route = useRoute<FlickFlirtArchetypeResultRouteProp>();
    const {name, image, description, genres, fromOnboardArchetypeStandalone} = route.params ?? {};
    const [isSaving, setIsSaving] = useState(true);
    /** Remote archetype art must be ready before UI + reveal (no fixed delay). */
    const [isImageReady, setIsImageReady] = useState(!image);
    const showLoader = isSaving || !isImageReady;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const revealAnim = useRef(new Animated.Value(0)).current;
    const [showRevealFx, setShowRevealFx] = useState(false);

    useEffect(() => {
        if (!image || typeof image !== 'string' || !image.trim()) {
            setIsImageReady(true);
            return;
        }
        let cancelled = false;
        Image.prefetch(image)
            .then(() => {
                if (!cancelled) {
                    setIsImageReady(true);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setIsImageReady(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [image]);

    useEffect(() => {
        if (!name || !genres?.length) {
            navigation.goBack();
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                await AsyncStorage.setItem(FLICKFLIRT_TOP_GENRES_KEY, JSON.stringify(genres));
            } catch (e) {
                console.warn('Could not save FlickFlirt genres to local storage', e);
            }
            if (fromOnboardArchetypeStandalone) {
                // Archetype already saved on OnboardArchetypeStandalone
                if (!cancelled) {
                    setIsSaving(false);
                }
                return;
            }
            try {
                const archetypeData = JSON.stringify({
                    name,
                    image,
                    description,
                    genres,
                });
                const updatedUser = await updateUser({archetype: archetypeData});
                if (!cancelled && updatedUser) {
                    useAuthStore.setState({user: updatedUser});
                }
            } catch (error) {
                console.error('Error updating archetype:', error);
            } finally {
                if (!cancelled) {
                    setIsSaving(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [name, image, description, genres, navigation, fromOnboardArchetypeStandalone]);

    useEffect(() => {
        if (showLoader) {
            return;
        }
        const loopAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1100,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1100,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        );
        loopAnim.start();
        return () => {
            loopAnim.stop();
        };
    }, [showLoader, glowAnim]);

    useEffect(() => {
        if (showLoader) {
            return;
        }
        setShowRevealFx(true);
        revealAnim.setValue(0);
        Animated.sequence([
            Animated.delay(280),
            Animated.timing(revealAnim, {
                toValue: 1,
                duration: 4200,
                easing: Easing.bezier(0.22, 0.12, 0.18, 1),
                useNativeDriver: true,
            }),
        ]).start(() => setShowRevealFx(false));
    }, [showLoader, revealAnim]);

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.98, 1.04],
    });
    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.95],
    });
    const revealWashOpacity = revealAnim.interpolate({
        inputRange: [0, 0.1, 0.78, 1],
        outputRange: [0, 0.82, 0.4, 0],
    });
    /** Hold compact glow so viewers read the beat, then expand */
    const centerGlowScale = revealAnim.interpolate({
        inputRange: [0, 0.38, 0.52, 0.92, 1],
        outputRange: [0.42, 0.5, 0.62, 1.12, 1.28],
    });
    const centerGlowOpacity = revealAnim.interpolate({
        inputRange: [0, 0.25, 0.82, 1],
        outputRange: [0.95, 0.82, 0.45, 0],
    });
    const cardRise = revealAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [28, 0],
    });
    const cardsOpacity = revealAnim.interpolate({
        inputRange: [0, 0.12, 0.82, 1],
        outputRange: [0, 1, 1, 0],
    });
    const cardsScale = revealAnim.interpolate({
        inputRange: [0, 0.38, 0.52, 0.88, 1],
        outputRange: [0.84, 0.9, 0.92, 1, 1.02],
    });

    const goToUserMatchModesScreen = () => {
        navigation.navigate('ClientTabNavigator', {
            screen: 'UserProfileStack',
            params: {screen: 'UserMatchModesScreen'},
        });
    };

    const goToPreferencesAll = () => {
        if (fromOnboardArchetypeStandalone) {
            goToUserMatchModesScreen();
        } else {
            navigation.navigate('FlickFlirtPrefAll');
        }
    };

    const goToPreferencesSteps = () => {
        if (fromOnboardArchetypeStandalone) {
            goToUserMatchModesScreen();
        } else {
            navigation.navigate('FlickFlirtPrefAll');
        }
    };
    return (
        <View style={{flex: 1}}>
            <LinearGradient
                colors={[...FLICK_FLIRT_BG_BASE_COLORS]}
                style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}
            />
            <ImageBackground
                source={showLoader ? imageindex.BgImageSM : image ? {uri: image} : imageindex.FLickFlirt}
                resizeMode={showLoader ? 'cover' : 'contain'}
                imageStyle={
                    showLoader
                        ? undefined
                        : {
                              width: SIZES.ScreenWidth,
                              height: SIZES.ScreenHeight,
                              alignSelf: 'center',
                              top: -(SIZES.ScreenHeight * 0.15),
                          }
                }
                style={
                    showLoader
                        ? [onboardStyles.bgimage, onboardStyles.standaloneBgFill]
                        : {width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}
                }>
                <SafeAreaView style={{flex: 1}}>

                    {showRevealFx && (
                        <Animated.View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                zIndex: 20,
                                opacity: revealWashOpacity,
                            }}>
                            <LinearGradient
                                colors={['rgba(16,16,22,0.96)', 'rgba(8,8,12,0.88)', 'rgba(10,10,14,0.96)']}
                                style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}
                            />
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    width: SIZES.ScreenWidth * 0.9,
                                    height: SIZES.ScreenWidth * 0.9,
                                    borderRadius: (SIZES.ScreenWidth * 0.9) / 2,
                                    alignSelf: 'center',
                                    top: '32%',
                                    backgroundColor: 'rgba(135,74,255,0.55)',
                                    shadowColor: '#9B5CFF',
                                    shadowOffset: {width: 0, height: 0},
                                    shadowRadius: 32,
                                    shadowOpacity: 1,
                                    opacity: centerGlowOpacity,
                                    transform: [{scale: centerGlowScale}],
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: '33%',
                                    alignItems: 'center',
                                }}>
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        width: SIZES.ScreenWidth * 0.6,
                                        height: SIZES.ScreenWidth * 0.7,
                                        borderRadius: 18,
                                        overflow: 'hidden',
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.32)',
                                        opacity: cardsOpacity,
                                        transform: [{translateY: cardRise}, {scale: cardsScale}],
                                    }}>
                                    <ImageBackground source={image ? {uri: image} : imageindex.FLickFlirt} resizeMode="cover" style={{flex: 1}}>
                                        <LinearGradient colors={['rgba(120,67,255,0.6)', 'rgba(120,67,255,0.25)', 'rgba(0,0,0,0.35)']} style={{flex: 1}} />
                                    </ImageBackground>
                                </Animated.View>
                            </View>
                        </Animated.View>
                    )}
                    {!showLoader && (
                        <>
                            <Header />

                            <ScrollView
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    paddingTop: 24,
                                    paddingBottom: 100,
                                    paddingHorizontal: 16,
                                }}
                                keyboardShouldPersistTaps="handled">
                                <View style={{width: '90%', maxWidth: SIZES.ScreenWidth * 0.9, paddingBottom: 32}}>
                                    <Text style={{...FONTS.Title1, textAlign: 'center', color: COLORS.WHITE}}>Your Archetype is</Text>
                                    {name ? (
                                        <Animated.View
                                            style={{
                                                alignSelf: 'center',
                                                marginTop: 8,
                                                marginBottom: 16,
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 14,
                                                borderWidth: 1,
                                                borderColor: '#dc1cd3',
                                                backgroundColor: 'rgba(0, 189, 244, 0.08)',
                                                shadowColor: COLORS.AKCRUBLUE,
                                                shadowOffset: {width: 0, height: 0},
                                                shadowRadius: 16,
                                                shadowOpacity: 0.9,
                                                transform: [{scale: glowScale}],
                                                opacity: glowOpacity,
                                            }}>
                                            <Text
                                                style={[
                                                    FONTS.HeroTitle,
                                                    {
                                                        textAlign: 'center',
                                                        color: ARCHETYPE_NAME_COLOR,
                                                        textShadowColor: 'rgba(0,0,0,0.55)',
                                                        textShadowOffset: {width: 0, height: 1},
                                                        textShadowRadius: 10,
                                                    },
                                                ]}>
                                                &quot;{name}&quot;
                                            </Text>
                                        </Animated.View>
                                    ) : null}
                                    {description ? (
                                        <Text style={[FONTS.paragraph1, {textAlign: 'center', marginBottom: 16, color: COLORS.WHITE}]}>
                                            {description}
                                        </Text>
                                    ) : null}
                                    <View style={{alignItems: 'center', marginTop: 8, width: '100%'}}>
                                        <AkcruButtons.LrgButton
                                            variant="auth"
                                            color={showLoader ? COLORS.DARKGREY : COLORS.PURPLE}
                                            btnname="Continue"
                                            onPress={goToPreferencesAll}
                                            disabled={showLoader}
                                        />
                                    </View>

                                </View>
                            </ScrollView>
                        </>
                    )}
                </SafeAreaView>
            </ImageBackground>

            <Modal animationType="fade" transparent visible={showLoader}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10, textAlign: 'center', paddingHorizontal: 24}}>
                        {isSaving ? 'Analyzing Your Movie Taste...' : 'Loading archetype...'}
                    </Text>
                </View>
            </Modal>
        </View>
    );
};

export default FlickFlirtArchetypeResult;
