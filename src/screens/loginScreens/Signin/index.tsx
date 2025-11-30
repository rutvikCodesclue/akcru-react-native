import {View, Text, ImageBackground, TouchableOpacity, Alert, Modal, StyleSheet, TextInput, ActivityIndicator} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
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
import {getPushToken} from '../../../../lib/pushNotifications';
import {isTablet} from '../../../../assets/constants/theme';
import SessionManagementModal from '../../../components/SessionManagementModal';
import messaging from '@react-native-firebase/messaging';
import * as RootNavigation from '../../../util/RootNavigation';

const iconSize = isTablet() ? 28 : 20;
const inputHeight = isTablet() ? 60 : 50;

const Signin = () => {
    useEffect(() => {
        const _checkPermissions = async () => {
            if (Platform.OS === 'android') {
                const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
                if (audioResult !== RESULTS.GRANTED) {
                    const audioRequestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                    if (audioRequestResult === RESULTS.GRANTED) {
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

                //Request Contact permission
                const contactResult = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
                if (contactResult !== RESULTS.GRANTED) {
                    const contactResult = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
                    if (contactResult === RESULTS.GRANTED) {
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

            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const notificationPermission = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                if (notificationPermission !== RESULTS.GRANTED) {
                    const requestResult = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                    if (requestResult === RESULTS.GRANTED) {
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
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Logging in...');
    const [loadingSubMessage, setLoadingSubMessage] = useState<string>('Please wait while we verify your credentials');

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Session management states
    const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
    const [otherSessionsCount, setOtherSessionsCount] = useState<number>(0);
    const [sessionModalLoading, setSessionModalLoading] = useState<boolean>(false);
    const [pendingLoginData, setPendingLoginData] = useState<{
        user: any;
        accessToken: string;
    } | null>(null);

    async function attemptLogin() {
        // Set loading immediately when button is clicked
        setLoading(true);
        setLoadingMessage('Validating...');
        setLoadingSubMessage('Checking your credentials');
        
        // Early validation
        if (!email.trim() || !password.trim()) {
            setShowLoginError(true);
            setErrorMsg('Email and password are required');
            setLoading(false);
            return;
        }

        try {
            setLoadingMessage('Checking sessions...');
            setLoadingSubMessage('Verifying device access');

            // First check for existing sessions
            const sessionCheck = await authStore.checkSessions(email, password);
            if (!sessionCheck?.user) {
                setShowLoginError(true);
                setLoading(false);
                setErrorMsg('Invalid credentials');
                return;
            }

            const hasOtherSessions = sessionCheck.hasOtherSessions;
            const otherSessionsCount = sessionCheck.otherSessionsCount || 0;
            // Check if there are other sessions
            if (hasOtherSessions && otherSessionsCount > 0) {
                // Store login data temporarily and show session management modal
                setPendingLoginData({
                    user: sessionCheck.user,
                    accessToken: sessionCheck.user.access_token,
                });
                setOtherSessionsCount(otherSessionsCount);
                setShowSessionModal(true);
                setLoading(false);
                return;
            }

            // No other sessions, proceed with actual login
            setLoadingMessage('Authenticating...');
            setLoadingSubMessage('Logging you in');

            const loginResponse = await authStore.loginWithEmail(email, password);
            
            if (!loginResponse?.session || !loginResponse?.user) {
                setShowLoginError(true);
                setLoading(false);
                setErrorMsg('Error Logging In');
                return;
            }

            const accessToken = loginResponse.session.access_token;

            // Complete login
            setLoadingMessage('Finalizing...');
            setLoadingSubMessage('Setting up your session');
            await completeLogin(loginResponse.session, loginResponse.user, accessToken);
        } catch (error: any) {
            setShowLoginError(true);
            setLoading(false);
            if (error.response?.data.message) {
                setErrorMsg(error.response?.data.message);
            } else {
                setErrorMsg('Error Logging In');
            }
        }
    }

    const completeLogin = async (session: any, user: any, accessToken: string) => {
        try {
            setLoadingMessage('Almost done...');
            setLoadingSubMessage('Saving your session');
            
            await AsyncStorage.setItem('access_token', accessToken);
            
            setLoadingMessage('Success!');
            setLoadingSubMessage('Welcome back! Redirecting...');
            
            // Small delay to show success message
            setTimeout(() => {
                setLoading(false);
                // After login, reset the navigation state and open the main tab navigator
                // with the Crummunity tab selected so login ALWAYS lands on Crummunity.
                RootNavigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'NoBottomStack',
                            params: {
                                screen: 'ClientTabNavigator',
                                params: {screen: 'CrummunityStack'},
                            },
                        },
                    ],
                });
            }, 1000);
        } catch (error) {
            console.error('Error completing login:', error);
            setShowLoginError(true);
            setErrorMsg('Error completing login');
            setLoading(false);
        }
    };

    const handleCloseOtherSessions = async () => {
        if (!pendingLoginData) return;

        setSessionModalLoading(true);
        setShowSessionModal(false); // Hide session modal
        setLoading(true); // Show main loading modal
        setLoadingMessage('Logging out other devices...');
        setLoadingSubMessage('Closing sessions on other devices');
        
        try {
            // Get current device token
            const deviceToken = await messaging().getToken();
            
            // Close other sessions
            const success = await authStore.closeOtherSessions(
                pendingLoginData.user.id,
                deviceToken
            );

            if (success) {
                setLoadingMessage('Completing login...');
                setLoadingSubMessage('Logging you in');
                
                // Now perform the actual login after closing other sessions
                const loginResponse = await authStore.loginWithEmail(email, password);
                
                if (!loginResponse?.session || !loginResponse?.user) {
                    setLoading(false);
                    Alert.alert('Error', 'Failed to complete login after closing sessions.');
                    return;
                }

                const accessToken = loginResponse.session.access_token;
                
                setLoadingMessage('Finalizing...');
                setLoadingSubMessage('Setting up your session');
                
                await completeLogin(
                    loginResponse.session,
                    loginResponse.user,
                    accessToken
                );
            } else {
                setLoading(false);
                Alert.alert('Error', 'Failed to close other sessions. Please try again.');
            }
        } catch (error) {
            console.error('Error closing other sessions:', error);
            setLoading(false);
            Alert.alert('Error', 'Failed to close other sessions. Please try again.');
        } finally {
            setSessionModalLoading(false);
        }
    };

    const handleCancelLogin = () => {
        // Reset all login-related states
        setShowSessionModal(false);
        setPendingLoginData(null);
        setLoading(false);
        setSessionModalLoading(false);
        
        // Clear the form
        setEmail('');
        setPassword('');
        
        // Show a message that login was cancelled
        setErrorMsg('Login cancelled. Please close other sessions first or contact support.');
        setShowLoginError(true);
    };

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token');
        await authStore.logout();
        setIsLoggedIn(false);
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
                    {isLoggedIn ? (
                        <View style={styles.container2}>
                            <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            <Text style={{...FONTS.Title1, paddingBottom: 10}}>{`Welcome back, ${
                                authStore.user?.username || 'User'
                            }`}</Text>

                            <AkcruButtons.LrgButton
                                color={COLORS.PURPLE}
                                btnname="Enter Akcru"
                                onPress={() =>
                                    navigation.navigate('NoBottomStack', {
                                        screen: 'ClientTabNavigator',
                                        params: {screen: 'CrummunityStack'},
                                    })
                                }
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
                                                color: COLORS.PINK,
                                            }}>
                                            Sign in here
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <>
                            <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            <View style={{marginBottom: 10}}>
                                <Text style={{...FONTS.Title1}}>Welcome back, sign in below</Text>
                            </View>
                            <View>
                                <Inputs
                                    placeholdername={'Email'}
                                    iconname={'mail'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={(text: string) => setEmail(text.trim().toLowerCase())}
                                    value={email}
                                    editable={true}
                                />
                                <View style={styles1.inputContainer}>
                                    <Icon
                                        name="lock-closed"
                                        type="ionicon"
                                        size={iconSize}
                                        color={COLORS.LIGHTGREY}
                                        style={{marginRight: 5}}
                                    />
                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={[
                                            styles1.input,
                                            {color: COLORS.LIGHTGREY, fontSize: isTablet() ? 18 : 14},
                                        ]}
                                        secureTextEntry={!isPasswordVisible}
                                        onChangeText={text => setPassword(text)}
                                        value={password}
                                        editable={true}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setPasswordVisible(!isPasswordVisible)}
                                        style={styles1.iconContainer}>
                                        <Icon
                                            name={isPasswordVisible ? 'eye' : 'eye-off'}
                                            type="ionicon"
                                            size={iconSize}
                                            color={COLORS.LIGHTGREY}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{marginVertical: 10}}>
                                <AkcruButtons.LrgButton
                                    color={COLORS.PURPLE}
                                    btnname={'Login'}
                                    onPress={() => attemptLogin()}
                                    disabled={loading}
                                />
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text
                                    style={{
                                        ...FONTS.Title2Orange,
                                        color: COLORS.PINK,
                                        marginTop: 10,
                                    }}>
                                    Forgot your password?
                                </Text>
                            </TouchableOpacity>

                            <View style={{flex: 1, justifyContent: 'center', marginBottom: 50}}>
                                <View
                                    style={{
                                        marginBottom: 0,
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
                                                color: COLORS.PINK,
                                            }}>
                                            Sign up here
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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
                                    {errorMsg}
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
                                            color: COLORS.PINK,
                                        }}>
                                        {'Close'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Loading Modal */}
                    <Modal animationType="fade" transparent={true} visible={loading}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 40,
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    marginHorizontal: 20,
                                    minWidth: 250,
                                    borderWidth: 1,
                                    borderColor: COLORS.PURPLE,
                                }}>
                                <View style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    backgroundColor: COLORS.PURPLE + '20',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                }}>
                                    <ActivityIndicator 
                                        size="large" 
                                        color={COLORS.PURPLE}
                                    />
                                </View>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        textAlign: 'center',
                                        color: COLORS.WHITE,
                                        marginBottom: 10,
                                        fontWeight: 'bold',
                                    }}>
                                    {loadingMessage}
                                </Text>
                                <Text
                                    style={{
                                        ...FONTS.Title3,
                                        textAlign: 'center',
                                        color: COLORS.LIGHTGREY,
                                        opacity: 0.8,
                                    }}>
                                    {loadingSubMessage}
                                </Text>
                            </View>
                        </View>
                    </Modal>

                    <SessionManagementModal
                        visible={showSessionModal}
                        onClose={() => {}}
                        onCloseOtherSessions={handleCloseOtherSessions}
                        onCancel={handleCancelLogin}
                        otherSessionsCount={otherSessionsCount}
                        loading={sessionModalLoading}
                    />
                </View>
            </ImageBackground>
        </View>
    );
};

export default Signin;

const styles1 = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: COLORS.TRANSDARKGREY,
        height: inputHeight,
    },
    input: {
        flex: 1, // Takes up the remaining space inside the container
        paddingVertical: 10,
        color: COLORS.WHITE,
        paddingRight: 40, // Ensure space for the icon
    },
    iconContainer: {
        position: 'absolute',
        right: 5, // Align the icon inside the input field on the right
    },
});
