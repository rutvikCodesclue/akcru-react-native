import {View, Text, ImageBackground, Modal, Alert, ScrollView, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import imageindex from '../../../../assets/images/imageindex';
import Inputs from '../../../components/input';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import useAuthStore from '../../../stores/auth.store';
import {AkcruLogo} from '../../../../assets/svg';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import {getPushToken} from '../../../../lib/pushNotifications';

const OnboardPassword = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const email = route.params?.email;

    const phoneNumber = route.params?.phoneNumber;

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

            const {user, error: signupError} = await useAuthStore.getState().signUpWithEmail(email, password);
            if (signupError) {
                throw new Error(signupError.message || 'Error during signup');
            }

            const {
                user: loggedInUser,
                session,
                error: loginError,
            } = await useAuthStore.getState().loginWithEmail(user.email, password);
            if (loginError || !loggedInUser || !session) {
                throw new Error(loginError.message || 'Error logging in after signup');
            }

            await useAuthStore.getState().hydrateAuth();
            await useAuthStore.getState().hydrateUser();

            getPushToken(email);

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
                setSignupErrorMessage(userMessage);
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

    return (
        <ScrollView>
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
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
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
                            color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
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
