import {View, Text, ImageBackground, TouchableOpacity, Modal, StatusBar, Dimensions, Platform, StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import React, {useState, useEffect} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruLogo} from '../../../../assets/svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import AkcruAppOpener from '../../../components/AkcruAppOpener';
import { isTablet } from '../../../../assets/constants/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('screen');

const loginButtonHeight = isTablet() ? 60 : 45;

const Welcome = params => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const authStore = useAuthStore();
    const insets = useSafeAreaInsets();

    const [showLoginError, setShowLoginError] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showOpener, setShowOpener] = useState<boolean>(true);

    // Defer permission requests so they don't run before the opener is shown (Android can skip welcome if we request here on mount)
    useEffect(() => {
        const _checkPermissions = async () => {
            if (Platform.OS === 'android') {
                const permissions = [
                    PERMISSIONS.ANDROID.RECORD_AUDIO,
                    PERMISSIONS.ANDROID.READ_CONTACTS,
                    PERMISSIONS.ANDROID.CAMERA,
                    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                ];

                for (let permission of permissions) {
                    const result = await check(permission);
                    if (result !== RESULTS.GRANTED) {
                        await request(permission);
                    }
                }
            }

            if (Platform.OS === 'ios') {
                const permissions = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.MEDIA_LIBRARY];

                for (let permission of permissions) {
                    const result = await check(permission);
                    if (result !== RESULTS.GRANTED) {
                        await request(permission);
                    }
                }
            }
        };

        _checkPermissions();
    }, []);

    const checkAuth = async () => {
        try {
            await authStore.hydrateAuth();
            const accessToken = await AsyncStorage.getItem('access_token');
            const isAuthed = authStore.getUser() !== null && authStore.getSession() !== null;
            return isAuthed && accessToken !== null;
        } catch (err) {
            console.error('Error checking auth', err);
            return false;
        }
    };

    const handleAnimation = () => {
        return new Promise<void>(resolve => {
            setShowOpener(true);
            setTimeout(() => {
                setShowOpener(false);
                resolve();
            }, 10000);
        });
    };

    useEffect(() => {
        let cancelled = false;
        const initiateLoading = async () => {
            const authCheckPromise = checkAuth();
            const animationPromise = handleAnimation();

            try {
                const [isLoggedIn] = await Promise.all([authCheckPromise, animationPromise]);
                if (cancelled) return;

                if (isLoggedIn) {
                    const routeParams = params?.route?.params?.params;
                    if (routeParams?.screenName) {
                        navigation.navigate('NoBottomStack', {
                            screen: routeParams.screenName,
                            params: routeParams.params ?? {},
                        });
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Welcome initiateLoading error:', err);
                if (!cancelled) setLoading(false);
            }
        };

        initiateLoading();
        return () => {
            cancelled = true;
        };
    }, [navigation, params]);

    // Full-screen video under status bar: translucent status bar + extend container into inset area
    useEffect(() => {
        if (!loading || !showOpener) return;
        if (Platform.OS === 'android') {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor('transparent');
        }
        return () => {
            if (Platform.OS === 'android') {
                StatusBar.setTranslucent(false);
                StatusBar.setBackgroundColor(COLORS.AKCRUBACKGROUND);
            }
        };
    }, [loading, showOpener]);

    if (loading) {
        return (
            <View
                style={[
                    styles.loadingFullScreen,
                    {
                        marginTop: -insets.top,
                        height: SCREEN_HEIGHT + insets.top,
                        width: SCREEN_WIDTH,
                    },
                ]}>
                {showOpener && (
                    <AkcruAppOpener
                        onAnimationFinish={() => {
                            setShowOpener(false);
                        }}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
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
                <View style={styles.container}>
                    <View style={styles.logoCenterWrapper}>
                        <View style={styles.logoContainer}>
                            <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            <Text style={styles.tagline}>Connect through what you watch.</Text>
                        </View>
                    </View>
                    <View style={styles.buttonsBottomWrapper}>
                        <View style={[styles.buttonsInner, {marginBottom: Math.max(32, 70 + insets.bottom)}]}>
                            <View style={{marginVertical: 10}}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Signin')}
                                    style={[styles.welcomeButton, {height: loginButtonHeight}]}
                                    activeOpacity={0.9}>
                                    <LinearGradient
                                        colors={[COLORS.PURPLE, COLORS.PINK]}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 0}}
                                        style={styles.welcomeButtonGradient}>
                                        <Text style={{...FONTS.Title1, textAlign: 'center', color: COLORS.WHITE}}>
                                            Sign In
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            <View style={{marginVertical: 10}}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('OnboardEmail')}
                                    style={[styles.welcomeButton, {height: loginButtonHeight}]}
                                    activeOpacity={0.9}>
                                    <LinearGradient
                                        colors={[COLORS.PURPLE, COLORS.PINK]}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 0}}
                                        style={styles.welcomeButtonGradient}>
                                        <Text style={{...FONTS.Title1, textAlign: 'center', color: COLORS.WHITE}}>
                                            Create Account
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={true} visible={showLoginError}>
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
                                <Text style={{...FONTS.Title3, marginBottom: 10, textAlign: 'center'}}>
                                    {'Login error, Please try again.'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowLoginError(false)}>
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
                </View>
            </ImageBackground>
        </View>
    );
};

export default Welcome;
