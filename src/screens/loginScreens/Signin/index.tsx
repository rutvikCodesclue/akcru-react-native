import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons'
import Inputs from '../../../components/input'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants'
import React, {useState, useEffect} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import { useNavigation} from '@react-navigation/native';
import { AuthStackParams } from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { AkcruLogo } from '../../../../assets/svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import { appVersion } from '../../../../assets/constants/Data';
import {Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import { getPushToken } from '../../../../lib/pushNotifications';


const Signin = () => {
    useEffect(() => {
        const _checkPermissions = async () => {
            // Check permissions for camera and microphone on Android
            if (Platform.OS === 'android') {
                // Request microphone permission
                const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
                if (audioResult !== RESULTS.GRANTED) {
                    const audioRequestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                    if (audioRequestResult === RESULTS.GRANTED) {
                        console.log('Microphone permission granted');
                    }
                }

                // Request camera permission
                const cameraResult = await check(PERMISSIONS.ANDROID.CAMERA);
                if (cameraResult !== RESULTS.GRANTED) {
                    const cameraRequestResult = await request(PERMISSIONS.ANDROID.CAMERA);
                    if (cameraRequestResult === RESULTS.GRANTED) {
                        console.log('Camera permission granted');
                    }
                }

                // Request READ_MEDIA_AUDIO permission
                const audioMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (audioMediaResult !== RESULTS.GRANTED) {
                    const audioMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (audioMediaRequestResult === RESULTS.GRANTED) {
                        console.log('READ_MEDIA_AUDIO permission granted');
                    }
                }

                // Request READ_MEDIA_IMAGES permission
                const imagesMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (imagesMediaResult !== RESULTS.GRANTED) {
                    const imagesMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (imagesMediaRequestResult === RESULTS.GRANTED) {
                        console.log('READ_MEDIA_IMAGES permission granted');
                    }
                }

                // Request READ_MEDIA_VIDEO permission
                const videoMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (videoMediaResult !== RESULTS.GRANTED) {
                    const videoMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (videoMediaRequestResult === RESULTS.GRANTED) {
                        console.log('READ_MEDIA_VIDEO permission granted');
                    }
                }
            }
            // Android 13 (API level 33) and above: Check POST_NOTIFICATIONS permission
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const notificationPermission = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                if (notificationPermission !== RESULTS.GRANTED) {
                    const requestResult = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                    if (requestResult === RESULTS.GRANTED) {
                        console.log('Post notifications permission granted');
                    }
                }
            }

            // Check permissions for camera and microphone on iOS
            if (Platform.OS === 'ios') {
                // Request camera permission
                const cameraResult = await check(PERMISSIONS.IOS.CAMERA);
                if (cameraResult !== RESULTS.GRANTED) {
                    const cameraRequestResult = await request(PERMISSIONS.IOS.CAMERA);
                    if (cameraRequestResult === RESULTS.GRANTED) {
                        console.log('Camera permission granted');
                    }
                }

                // Request microphone permission
                const micResult = await check(PERMISSIONS.IOS.MICROPHONE);
                if (micResult !== RESULTS.GRANTED) {
                    const micRequestResult = await request(PERMISSIONS.IOS.MICROPHONE);
                    if (micRequestResult === RESULTS.GRANTED) {
                        console.log('Microphone permission granted');
                    }
                }

                // Request READ_MEDIA_AUDIO permission on iOS
                const audioMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (audioMediaResult !== RESULTS.GRANTED) {
                    const audioMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (audioMediaRequestResult === RESULTS.GRANTED) {
                        console.log('READ_MEDIA_AUDIO permission granted');
                    }
                }

                // Request READ_MEDIA_IMAGES permission on iOS
                const imagesMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (imagesMediaResult !== RESULTS.GRANTED) {
                    const imagesMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (imagesMediaRequestResult === RESULTS.GRANTED) {
                        console.log('READ_MEDIA_IMAGES permission granted');
                    }
                }

                // Request READ_MEDIA_VIDEO permission on iOS
                const videoMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (videoMediaResult !== RESULTS.GRANTED) {
                    const videoMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (videoMediaRequestResult === RESULTS.GRANTED) {
                        console.log('READ_MEDIA_VIDEO permission granted');
                    }
                }
            }
        };

        // Call the permission checking function when the component mounts
        _checkPermissions();
    }, []);


    const authStore = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    // const showErrorAlert = () => {
    //     Alert.alert('Login error', 'Please try again.', [
    //         {text: 'OK', onPress: () => {}}, // You can add a callback function if needed
    //     ]);
    // };
    const [showLoginError, setShowLoginError] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Add login status state

    // useEffect(() => {
    //     const checkAuth = async () => {
    //         await authStore.hydrateAuth();
    //         const isAuthed = authStore.getUser() !== null && authStore.getSession() !== null;

    //         const accessToken = await AsyncStorage.getItem('access_token');
    //         const isLoggedInWithToken = isAuthed && accessToken !== null;

    //         setTimeout(() => {
    //             if (accessToken) {
    //                 setIsLoggedIn(true);
    //                 // navigation.navigate('NoBottomStack', {screen: 'UserProfileStack'});
    //             } else {
    //                 setIsLoggedIn(false);
    //             }
    //         }, 100); // Wait for 3 seconds before executing the code
    //     };

    //     checkAuth().catch(err => {
    //         console.error('Error checking auth', err);
    //     });
    // }, []);
    useEffect(() => {
        const checkAuth = async () => {
            await authStore.hydrateAuth();
            const isAuthed = authStore.getUser() !== null && authStore.getSession() !== null;

            const accessToken = await AsyncStorage.getItem('access_token');
            const isLoggedInWithToken = isAuthed && accessToken !== null;
            
            setIsLoggedIn(isLoggedInWithToken); // Set login status based on actual auth check
        };
;
        checkAuth().catch(err => {
            console.error('Error checking auth', err);
        });
    }, []);

    
    async function attemptLogin() {
        try {
            setLoading(true);
            console.log('Attempting to LOGIN w/ Email/Password:', email, password);
            // login through the API
            const loginResponse = await authStore.loginWithEmail(email, password);
            const session = loginResponse?.session;
            const user = loginResponse?.user;

            if (!session || !user) {
                Alert.alert('Error Logging In');
                setShowLoginError(true); // Display the error alert
                setLoading(false);
                return;
            }
            if (!loginResponse) {
                Alert.alert('Error Logging In. Please try again.');
                setShowLoginError(true); // Display the error alert
                setLoading(false);
                return;
            }

            // set the acces_token in local storage
            const accessToken = session.access_token;
            AsyncStorage.setItem('access_token', accessToken);
            console.log('LOGIN Successful. Access Token:', accessToken);
            console.log(`LOGIN Successful for user: ${authStore.getUser()?.email}`);
            await getPushToken(user.id); // or use another unique identifier like email
            setLoading(false);
            navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
        } catch (error) {
            setShowLoginError(true); // Display the error alert
            console.log('LOGIN Error:', error);
            setLoading(false);
        }
    }

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token'); // Remove the stored token
        await authStore.logout();
        setIsLoggedIn(false);
    }

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <LinearGradient
                    // Background Linear Gradient
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
                    {isLoggedIn ? ( // Display different content for logged-in and logged-out users
                        <View style={styles.container2}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title1, paddingBottom: 10}}>{`Welcome back, ${
                                authStore.user?.username || 'User'
                            }`}</Text>

                            <AkcruButtons.LrgButton
                                color={COLORS.AKCRUBLUE}
                                btnname="Enter Akcru"
                                onPress={() => navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'})}
                                disabled={loading}
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
                        <>
                            <AkcruLogo width={200} height={60} />
                            <View style={{marginBottom: 10}}>
                                <Text style={{...FONTS.Title1}}>Welcome back, sign in below</Text>
                            </View>
                            <View>
                                <Inputs
                                    placeholdername={'Email'}
                                    iconname={'mail'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={(text: React.SetStateAction<string>) => setEmail(text)}
                                    value={email}
                                    editable={true}
                                />
                                <Inputs
                                    placeholdername={'Password'}
                                    iconname={'lock-closed'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={true}
                                    onChangeText={(text: React.SetStateAction<string>) => setPassword(text)}
                                    value={password}
                                    editable={true}
                                />
                            </View>
                            <View style={{marginVertical: 10}}>
                                <AkcruButtons.LrgButton
                                    color={COLORS.AKCRUBLUE}
                                    btnname={'Login'}
                                    onPress={() => attemptLogin()}
                                    disabled={loading}
                                />
                            </View>
                            {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity>
                                    <Googlelogo
                                        width={42}
                                        height={42}
                                        onPress={() =>
                                            navigation.navigate('ClientTabNavigator', {screen: 'UserProfileStack'})
                                        }
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Fblogo
                                        width={40}
                                        height={40}
                                        style={{marginLeft: 25, marginRight: 25}}
                                        onPress={() => navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'})}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Applelogo width={50} height={50} onPress={() => {}} />
                                </TouchableOpacity>
                            </View> */}
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text
                                    style={{
                                        ...FONTS.Title2Orange,
                                        fontSize: 14,
                                        marginTop: 10,
                                    }}>
                                    Forgot your password?
                                </Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => navigation.navigate('OTPVerification')}>
                                <Text style={{...FONTS.Title1, color: COLORS.MIDORANGE}}>OTP Verification</Text>
                            </TouchableOpacity> */}
                            {/* <TouchableOpacity onPress={() => navigation.navigate('TestScreen')}>
                                <Text style={{...FONTS.Title1, color: COLORS.MIDORANGE}}>TestScreen</Text>
                            </TouchableOpacity> */}
                            {/* <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                                <Text style={{...FONTS.Title1, color: COLORS.MIDORANGE}}>ResetPassword</Text>
                            </TouchableOpacity> */}
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
                                        Not a subscriber?
                                    </Text>

                                    <TouchableOpacity onPress={() => navigation.navigate('OnboardEmail')}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2Orange,
                                            }}>
                                            Sign up here
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{...FONTS.Title2White, textAlign: 'center'}}>
                                    version {appVersion[0].version}
                                </Text>
                            </View>
                        </>
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
                                    {`Login error, Please try again.`}
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
                                        {`Close`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ImageBackground>
        </View>
    );
}

export default Signin;