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

const Welcome = () => {
    useEffect(() => {
        const _checkPermissions = async () => {
            if (Platform.OS === 'android') {
                const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
                if (audioResult !== RESULTS.GRANTED) {
                    const audioRequestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                    if (audioRequestResult === RESULTS.GRANTED) {
                    }
                }

                const contactResult = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
                if (contactResult !== RESULTS.GRANTED) {
                    const contactResult = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
                    if (contactResult === RESULTS.GRANTED) {
                        console.log('contact permission granted');
                        console.log('contactResult =>', contactResult);
                    }
                }

                const cameraResult = await check(PERMISSIONS.ANDROID.CAMERA);
                if (cameraResult !== RESULTS.GRANTED) {
                    const cameraRequestResult = await request(PERMISSIONS.ANDROID.CAMERA);
                    if (cameraRequestResult === RESULTS.GRANTED) {
                    }
                }

                const audioMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (audioMediaResult !== RESULTS.GRANTED) {
                    const audioMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (audioMediaRequestResult === RESULTS.GRANTED) {
                    }
                }

                const imagesMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (imagesMediaResult !== RESULTS.GRANTED) {
                    const imagesMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (imagesMediaRequestResult === RESULTS.GRANTED) {
                    }
                }

                const videoMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (videoMediaResult !== RESULTS.GRANTED) {
                    const videoMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (videoMediaRequestResult === RESULTS.GRANTED) {
                    }
                }
            }

            if (Platform.OS === 'ios') {
                const cameraResult = await check(PERMISSIONS.IOS.CAMERA);
                if (cameraResult !== RESULTS.GRANTED) {
                    const cameraRequestResult = await request(PERMISSIONS.IOS.CAMERA);
                    if (cameraRequestResult === RESULTS.GRANTED) {
                    }
                }

                const micResult = await check(PERMISSIONS.IOS.MICROPHONE);
                if (micResult !== RESULTS.GRANTED) {
                    const micRequestResult = await request(PERMISSIONS.IOS.MICROPHONE);
                    if (micRequestResult === RESULTS.GRANTED) {
                    }
                }

                const audioMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (audioMediaResult !== RESULTS.GRANTED) {
                    const audioMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (audioMediaRequestResult === RESULTS.GRANTED) {
                    }
                }

                const imagesMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (imagesMediaResult !== RESULTS.GRANTED) {
                    const imagesMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (imagesMediaRequestResult === RESULTS.GRANTED) {
                    }
                }

                const videoMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (videoMediaResult !== RESULTS.GRANTED) {
                    const videoMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (videoMediaRequestResult === RESULTS.GRANTED) {
                    }
                }
            }
        };

        _checkPermissions();
    }, []);

    const authStore = useAuthStore();

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [showLoginError, setShowLoginError] = useState(false);

    const [loading, setLoading] = useState<boolean>(true);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const checkAuth = async () => {
            await authStore.hydrateAuth();
            const accessToken = await AsyncStorage.getItem('access_token');
            const isAuthed = authStore.getUser() !== null && authStore.getSession() !== null;
            const isLoggedInWithToken = isAuthed && accessToken !== null;
            if (isLoggedInWithToken) {
                navigation.navigate('NoBottomStack', {screen: 'ClientTabNavigator'});
            }
            setIsLoggedIn(isLoggedInWithToken);
        };
        checkAuth().catch(err => {
            console.error('Error checking auth', err);
        });
    }, []);

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token');
        await authStore.logout();
        navigation.navigate('Signin');
        setIsLoggedIn(false);
    }

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <LinearGradient
                    colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                    style={
                        {
                            // position: 'absolute',
                            // left: 0,
                            // right: 0,
                            // top: 0,
                            // height: SIZES.ScreenHeight,
                        }
                    }
                />
                <View style={styles.container}>
                    {isLoggedIn ? (
                        <View style={styles.container2}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title1, paddingBottom: 10}}>{`Welcome back, ${
                                authStore.user?.username || 'User'
                            }`}</Text>

                            <AkcruButtons.LrgButton
                                color={COLORS.PURPLE}
                                btnname="Enter Akcru"
                                onPress={() => navigation.navigate('NoBottomStack', {screen: 'ClientTabNavigator'})}
                                disabled={!loading}
                            />
                            <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 50}}>
                                <View
                                    style={{
                                        marginBottom: 25,
                                        flexDirection: 'row',
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2White,
                                            marginRight: 5,
                                        }}>
                                        {`You're not ${authStore.user?.username || 'User'}?`}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            handleLogout();
                                        }}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2Orange,
                                                color: COLORS.PINK,
                                            }}>
                                            Sign in here
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={{...FONTS.Title2White, textAlign: 'center'}}>
                                    version {appVersion[0].version}
                                </Text>
                            </View>
                        </View>
                    ) : (
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
                    )}
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
                                <Text
                                    style={{
                                        ...FONTS.Title3,
                                        marginBottom: 10,
                                        textAlign: 'center',
                                    }}>
                                    {'Login error, Please try again.'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowLoginError(false);
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
                </View>
            </ImageBackground>
        </View>
    );
};

export default Welcome;
