import {View, Text, ImageBackground, Modal, TouchableOpacity, Alert, ScrollView, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import Svg, {Path} from 'react-native-svg';
import Inputs from '../../../components/input';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import useAuthStore from '../../../stores/auth.store';
import { API } from '../../../clients/api.client';
import { AkcruLogo } from '../../../../assets/svg';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';


const OnboardPassword = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    // Retrieve both email and phoneNumber from route.params
    const email = route.params?.email;
    console.log('Email passed to pw screen:', email);
    const phoneNumber = route.params?.phoneNumber;
    console.log('Phone number passed pw screen:', phoneNumber);
  
    const user = useAuthStore(state => state.user);
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';

    const [loading, setLoading] = useState<boolean>(false);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordLengthError, setPasswordLengthError] = useState(false);
    const [showConfirmNewPasswordModal, setShowConfirmNewPasswordModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const [signupErrorMessage, setSignupErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePassword = (text: string) => {
        setPassword(text);
        setPasswordLengthError(text.length < 8);
    };

    const handleConfirmPassword = (text: string) => {
        setConfirmPassword(text);
    };

    const checkPasswordMatch = () => {
        if (password !== confirmPassword) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }
    };

    const checkFormCompletion = () => {
        if (email && phoneNumber && password && confirmPassword) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
        checkPasswordMatch();
    }, [password, confirmPassword, email, phoneNumber]);

    const attemptSignup = async () => {
        try {
            setIsLoading(true);

            setLoading(true);
            console.log('Attempting to Signup w/ Email/Password:', email, password);

            // Create an email signup
            const {user, error: signupError} = await useAuthStore.getState().signUpWithEmail(email, password);
            if (signupError) {
                throw new Error(signupError.message || 'Error during signup');
            }

            console.log('Signup Successful!', user);

            // Login through the API
            const {
                user: loggedInUser,
                session,
                error: loginError,
            } = await useAuthStore.getState().loginWithEmail(user.email, password);
            if (loginError || !loggedInUser || !session) {
                throw new Error(loginError.message || 'Error logging in after signup');
            }

            console.log('Login AFTER SIGNUP Successful!', session);
            await useAuthStore.getState().hydrateAuth();
            await useAuthStore.getState().hydrateUser();
            console.log('Hydrated auth and user after successful login and signup', session);

            // Navigate to the next screen on successful signup and login
            navigation.navigate('OnboardUsername', {phoneNumber: phoneNumber});
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error during signup:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    headers: error.response?.headers,
                });

                let userMessage = 'An unexpected error occurred during signup.';
                if (error.response?.status === 400) {
                    userMessage = error.response.data.message || 'Invalid request. Please check your input.';
                } else if (error.response?.status === 401) {
                    userMessage = 'Unauthorized. Please check your credentials.';
                }
                setSignupErrorMessage(userMessage); // Set the error message for the modal
                //  Alert.alert('Signup Error', userMessage);
            } else {
                setSignupErrorMessage('An unexpected error occurred during signup.');
                console.error('Non-Axios error during signup:', error);
                Alert.alert('Signup Error', 'An unexpected error occurred during signup.');
            }
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    // const handleConfirmSetPassword = async () => {
    //     if (!isFormComplete) {
    //         Alert.alert('Error', 'Please ensure all fields are correctly filled.');
    //         return;
    //     }

    //     if (password !== confirmPassword) {
    //         Alert.alert('Error', 'Passwords do not match.');
    //         return;
    //     }

    //     if (password.length < 8) {
    //         Alert.alert('Error', 'Password should be at least 8 characters long.');
    //         return;
    //     }

    //     setLoading(true);

    //     try {
    //         // Construct the payload based on what is available
    //         const payload = email ? {email} : {phoneNumber};
    //         navigation.navigate('OnboardUsername');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <ScrollView>
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
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                                Now that you've been verified, you can choose a new password. It is imperative that you
                                do not share this with anyone.
                            </Text>
                        </View>
                        <View style={{marginBottom: 10, alignItems: 'center'}}>
                            <Inputs
                                placeholdername={'Choose New Password'}
                                iconname={'lock-closed'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={true}
                                onChangeText={handlePassword}
                                value={password}
                                editable={!loading}
                            />
                            {passwordLengthError && (
                                <Text style={styles.warningText}>Password must be at least 8 characters long</Text>
                            )}
                            <Inputs
                                placeholdername={'Confirm New Password'}
                                iconname={'lock-closed'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={true}
                                onChangeText={handleConfirmPassword}
                                value={confirmPassword}
                                editable={!loading}
                            />
                            {passwordError && <Text style={styles.warningText}>Passwords do not match.</Text>}
                        </View>
                        <AkcruButtons.LrgButton
                            color={isFormComplete ? COLORS.AKCRUBLUE : COLORS.DARKGREY}
                            btnname={'Confirm'}
                            onPress={() => attemptSignup()}
                            disabled={!isFormComplete}
                        />
                    </View>
                    <Modal animationType="fade" transparent={true} visible={showConfirmNewPasswordModal}>
                        <ResetPasswordResultModal
                            closeModal={() => setShowConfirmNewPasswordModal(false)}
                            messageheader={resetResultType.messageheader}
                            messageheadercolor={resetResultType.messageheadercolor}
                            message={resetResultType.message}
                            iconname={resetResultType.iconname}
                            iconcolor={resetResultType.iconcolor}
                        />
                    </Modal>
                    <Modal animationType="fade" transparent={true} visible={!!signupErrorMessage}>
                        <ErrorModal
                            closeModal={() => setSignupErrorMessage('')}
                            message={signupErrorMessage}
                            iconcolor={COLORS.CATREDLGT}
                            iconname={'alert-circle'}
                        />
                    </Modal>
                    <Modal animationType="fade" transparent={true} visible={isLoading}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                            <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                            <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Signing up...</Text>
                        </View>
                    </Modal>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

export default OnboardPassword;
