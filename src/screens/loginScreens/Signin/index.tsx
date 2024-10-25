import {View, Text, ImageBackground, TouchableOpacity, Alert, Modal, StyleSheet, TextInput} from 'react-native';
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

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    async function attemptLogin() {
        try {
            setLoading(true);

            const loginResponse = await authStore.loginWithEmail(email, password);
            const session = loginResponse?.session;
            const user = loginResponse?.user;

            if (!session || !user) {
                Alert.alert('Error Logging In');
                setShowLoginError(true);
                setLoading(false);
                return;
            }
            if (!loginResponse) {
                Alert.alert('Error Logging In. Please try again.');
                setShowLoginError(true);
                setLoading(false);
                return;
            }

            const accessToken = session.access_token;
            AsyncStorage.setItem('access_token', accessToken);
            try {
                await getPushToken(user.id);
            } catch (e) {
                console.log('Error getting push token:', e);
            }
            setLoading(false);
            navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
        } catch (error: any) {
            setShowLoginError(true);
            setLoading(false);
            if (error.response.data.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg(error.response);
            }
        }
    }

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
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title1, paddingBottom: 10}}>{`Welcome back, ${
                                authStore.user?.username || 'User'
                            }`}</Text>

                            <AkcruButtons.LrgButton
                                color={COLORS.PURPLE}
                                btnname="Enter Akcru"
                                onPress={() => navigation.navigate('NoBottomStack', {screen: 'ClientTabNavigator'})}
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
                                    onChangeText={(text: string) => setEmail(text.trim().toLowerCase())}
                                    value={email}
                                    editable={true}
                                />
                                <View style={styles1.inputContainer}>
                                    <Icon
                                        name="lock-closed"
                                        type="ionicon"
                                        size={20}
                                        color={COLORS.LIGHTGREY}
                                        style={{marginRight: 5}}
                                    />
                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={[styles1.input, {color: COLORS.LIGHTGREY}]}
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
                                            size={20}
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
                                                color: COLORS.PINK,
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
