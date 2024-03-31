import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants'
import React, {useState, useEffect, useCallback} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import { useFocusEffect, useNavigation} from '@react-navigation/native';
import { AuthStackParams } from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { AkcruLogo } from '../../../../assets/svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import { appVersion } from '../../../../assets/constants/Data';
import {Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';

const Welcome = () => {
    useEffect(() => {
        const _checkPermissions = async () => {
            // Check permissions for camera and microphone on Android
            if (Platform.OS === 'android') {
                // Request microphone permission
                const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
                if (audioResult !== RESULTS.GRANTED) {
                    const audioRequestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                    if (audioRequestResult === RESULTS.GRANTED) {
                        //console.log('Microphone permission granted');
                    }
                }

                //Request Contact permission
                const contactResult = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
                if (contactResult !== RESULTS.GRANTED) {
                    const contactResult = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
                    if (contactResult === RESULTS.GRANTED) {
                        console.log('contact permission granted');
                        console.log('contactResult =>', contactResult);
                    }
                }

                // PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
                //     .then((res) => {
                //         console.log('Permission: ', res);
                //         Contacts.getAll()
                //             .then((contacts) => {
                //                 // work with contacts
                //                 //console.log(contacts);
                //             })
                //             .catch((e) => {
                //                 console.log(e);
                //             });
                //     })
                //     .catch((error) => {
                //         console.error('Permission error: ', error);
                //     });

                // Request camera permission
                const cameraResult = await check(PERMISSIONS.ANDROID.CAMERA);
                if (cameraResult !== RESULTS.GRANTED) {
                    const cameraRequestResult = await request(PERMISSIONS.ANDROID.CAMERA);
                    if (cameraRequestResult === RESULTS.GRANTED) {
                        //console.log('Camera permission granted');
                    }
                }

                // Request READ_MEDIA_AUDIO permission
                const audioMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (audioMediaResult !== RESULTS.GRANTED) {
                    const audioMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (audioMediaRequestResult === RESULTS.GRANTED) {
                        //console.log('READ_MEDIA_AUDIO permission granted');
                    }
                }

                // Request READ_MEDIA_IMAGES permission
                const imagesMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (imagesMediaResult !== RESULTS.GRANTED) {
                    const imagesMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (imagesMediaRequestResult === RESULTS.GRANTED) {
                        //console.log('READ_MEDIA_IMAGES permission granted');
                    }
                }

                // Request READ_MEDIA_VIDEO permission
                const videoMediaResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                if (videoMediaResult !== RESULTS.GRANTED) {
                    const videoMediaRequestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    if (videoMediaRequestResult === RESULTS.GRANTED) {
                        //console.log('READ_MEDIA_VIDEO permission granted');
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
                        //console.log('Camera permission granted');
                    }
                }

                // Request microphone permission
                const micResult = await check(PERMISSIONS.IOS.MICROPHONE);
                if (micResult !== RESULTS.GRANTED) {
                    const micRequestResult = await request(PERMISSIONS.IOS.MICROPHONE);
                    if (micRequestResult === RESULTS.GRANTED) {
                        //console.log('Microphone permission granted');
                    }
                }

                // Request READ_MEDIA_AUDIO permission on iOS
                const audioMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (audioMediaResult !== RESULTS.GRANTED) {
                    const audioMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (audioMediaRequestResult === RESULTS.GRANTED) {
                        //console.log('READ_MEDIA_AUDIO permission granted');
                    }
                }

                // Request READ_MEDIA_IMAGES permission on iOS
                const imagesMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (imagesMediaResult !== RESULTS.GRANTED) {
                    const imagesMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (imagesMediaRequestResult === RESULTS.GRANTED) {
                        //console.log('READ_MEDIA_IMAGES permission granted');
                    }
                }

                // Request READ_MEDIA_VIDEO permission on iOS
                const videoMediaResult = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
                if (videoMediaResult !== RESULTS.GRANTED) {
                    const videoMediaRequestResult = await request(PERMISSIONS.IOS.MEDIA_LIBRARY);
                    if (videoMediaRequestResult === RESULTS.GRANTED) {
                        //console.log('READ_MEDIA_VIDEO permission granted');
                    }
                }
            }
        };

        // Call the permission checking function when the component mounts
        _checkPermissions();
    }, []);


    const authStore = useAuthStore();

 
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [showLoginError, setShowLoginError] = useState(false);

    const [loading, setLoading] = useState<boolean>(true);

    

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Add login status state

    useEffect(() => {
        const checkAuth = async () => {
            // console.log('Auth store', authStore);
            await authStore.hydrateAuth();
            const accessToken = await AsyncStorage.getItem('access_token');
            const isAuthed = authStore.getUser() !== null && authStore.getSession() !== null;
            const isLoggedInWithToken = isAuthed && accessToken !== null;

            setIsLoggedIn(isLoggedInWithToken); // Set login status based on actual auth check
        };
;
        checkAuth().catch(err => {
            console.error('Error checking auth', err);
        });
    }, []);

    

    async function handleLogout() {
        await AsyncStorage.removeItem('access_token'); // Remove the stored token
        await authStore.logout();
        navigation.navigate('Signin');
        setIsLoggedIn(false);
    }
// if (loading) {
//     // Render a loading spinner or any placeholder here until the check is complete
//     return (
//         <View style={styles.container}>
//             <Text>Loading...</Text>
//         </View>
//     );
// }

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
                                color={COLORS.PURPLE}
                                btnname="Enter Akcru"
                                onPress={() => navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'})}
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
                                                color: COLORS.PINK
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

export default Welcome;
