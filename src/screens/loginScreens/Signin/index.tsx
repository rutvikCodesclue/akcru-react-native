import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons'
import Inputs from '../../../components/input'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants'
import React, {useState, useEffect} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { AuthStackParams } from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/themed';
import { AkcruLogo, Applelogo, Googlelogo, Fblogo } from '../../../../assets/svg';
import { supabase } from "../../../../lib/supabase";
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { API } from '../../../clients/api.client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';


const Signin = () => {
    const authStore = useAuthStore();
    const logout = useAuthStore(state => state.logout);
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            console.log('Signin focused [SigninScreen]');
            console.log(
                'Is logged in w/ Email/Password:',
                email,
                password,
                // userName,
            );

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('Exiting Signin unfocused [ExitSigninScreen]');
            };
        }, []),
    );

    const showErrorAlert = () => {
        Alert.alert('Login error', 'Please try again.', [
            {text: 'OK', onPress: () => {}}, // You can add a callback function if needed
        ]);
    };

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Add login status state

    useEffect(() => {
        const checkAuth = async () => {
            await authStore.hydrateAuth();
            const isAuthed = authStore.user !== null && authStore.session !== null;
            const accessToken = await AsyncStorage.getItem('access_token');
            const isLoggedInWithToken = isAuthed && accessToken !== null;

            if (accessToken) {
                setIsLoggedIn(true);
                // navigation.navigate('NoBottomStack', {screen: 'UserProfileStack'});
            } else {
                setIsLoggedIn(false);
            }
        };

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
                showErrorAlert(); // Display the error alert
                setLoading(false);
                return null;
            }

            // set the acces_token in local storage
            const accessToken = session.access_token;
            AsyncStorage.setItem('access_token', accessToken);

            console.log(`LOGIN Successful for user: ${user.email}`);
            setLoading(false);
            navigation2.navigate('NoBottomStack', {screen: 'ContentSwipe'});
        } catch (error) {
            showErrorAlert(); // Display the error alert
            console.log('LOGIN Error:', error);
            setLoading(false);
        }
    }

    // Modify your logout logic
  
        async function handleLogout() {
            await AsyncStorage.removeItem('access_token'); // Remove the stored token
            await logout();
            setIsLoggedIn(false);
        }

    

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <View style={styles.container}>
                    {isLoggedIn ? ( // Display different content for logged-in and logged-out users
                        <View style={styles.container2}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title1, paddingBottom: 10}}>{`Welcome back, ${
                                authStore.user?.username || 'User'
                            }`}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'})}>
                                <AkcruButtons.LrgButton
                                    color={COLORS.AKCRUBLUE}
                                    btnname="Enter Akcru"
                                    onPress={() => navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'})}
                                    disabled={loading}
                                />
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
                                        {`You're not ${authStore.user?.username || 'User'}?`}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {handleLogout()}}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2Orange,
                                            }}>
                                            Sign in here
                                        </Text>
                                    </TouchableOpacity>
                                </View>
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

                                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2AkcruBlue,
                                            }}>
                                            Sign up here
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
}

export default Signin