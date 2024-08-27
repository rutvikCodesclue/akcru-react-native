import {View, Text, ImageBackground, TouchableOpacity, Modal} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons';
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
import {Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import AkcruAppOpener from '../../../components/AkcruAppOpener';

const Welcome = params => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const authStore = useAuthStore();

    const [showLoginError, setShowLoginError] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showOpener, setShowOpener] = useState<boolean>(true);

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
            const isLoggedInWithToken = isAuthed && accessToken !== null;

            //  const navigateTo = isLoggedInWithToken ? 'ClientTabNavigator' : 'Signin';
            await handleAnimation();

            if (isLoggedInWithToken) {
                navigation.navigate('NoBottomStack', {
                    screen: params.route.params.params.screenName,
                    params: params.route.params.params.params,
                    isLoggedIn,
                });
            }
        } catch (err) {
            console.error('Error checking auth', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnimation = () => {
        return new Promise(resolve => {
            setShowOpener(true);
            setTimeout(() => {
                setLoading(false);
                setShowOpener(false);
                resolve();
            }, 3400);
        });
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('access_token');
            await authStore.logout();
            navigation.navigate('Signin');
        } catch (err) {
            console.error('Error during logout', err);
        } finally {
            setIsLoggedIn(false);
        }
    };

    if (loading) {
        return (
            <View>
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
                <View style={styles.container}>
                    <View>
                        <View style={{alignItems: 'center'}}>
                            <AkcruLogo width={200} height={60} />
                        </View>
                        <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 50}}>
                            <View style={{marginBottom: '15%'}}>
                                <View style={{marginVertical: 15}}>
                                    <AkcruButtons.LrgButton
                                        color={COLORS.AKCRUBLUE}
                                        btnname={'Sign in'}
                                        onPress={() => navigation.navigate('Signin')}
                                        disabled={false}
                                    />
                                </View>
                                <View>
                                    <AkcruButtons.LrgButton
                                        color={COLORS.PURPLE}
                                        btnname={'Create Account'}
                                        onPress={() => navigation.navigate('OnboardEmail')}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                            <Text style={{...FONTS.Title2White, textAlign: 'center'}}>
                                version {appVersion[0].version}
                            </Text>
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
