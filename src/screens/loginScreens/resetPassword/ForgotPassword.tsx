import {View, Text, ImageBackground, TouchableOpacity, ScrollView, Modal, Alert, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {supabase} from '../../../../lib/supabase';
import {Icon} from '@rneui/base';
import Svg, {Path} from 'react-native-svg';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import { API } from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';

const ForgotPassword = () => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    // Enhanced Email Validation
    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        setEmailError(!isEmailValid(text));
    };

    const checkFormCompletion = () => {
        if (
            email &&
            isEmailValid(email) // Check email format
        ) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [email]);

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    //reset password modal

    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    // Reset Password Function with Email Existence Check
    const SendOTP = async () => {
        if (!isEmailValid(email)) {
            setEmailError(true);
            return;
        }

        setLoading(true);
        try {
            // Replace the following line with your API call to send OTP
            const {data, error} = await API.post('/v1/user/sendOTP', {email});

            if (error) {
                setResetResultType({
                    messageheader: 'Error',
                    messageheadercolor: COLORS.CATREDDRK,
                    message: error.message,
                    iconname: 'alert-circle',
                    iconcolor: COLORS.CATREDLGT,
                });
            } else {
                setResetResultType({
                    messageheader: 'Success',
                    messageheadercolor: COLORS.CATGREENDRK,
                    message: 'OTP has been sent to your email.',
                    iconname: 'send',
                    iconcolor: COLORS.CATGREENLGT,
                });

                // Navigate to otpVerification screen after showing the success message
                setTimeout(() => {
                    navigation.navigate('OTPVerification', {email});
                }, 3000); // 5 seconds delay
            }

            setShowPasswordResetModal(true);
        } catch (error) {
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
                message: 'An error occurred while sending the OTP.',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            setShowPasswordResetModal(true);
        } finally {
            setLoading(false);
        }
    };

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
                    <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back to Signin</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{flex: 1, alignItems: 'center', marginTop: '45%'}}>
                        <View>
                            <Svg
                                height={150}
                                width={150}
                                viewBox={`0 0 270 234`}
                                style={{position: 'absolute', bottom: 0, alignSelf: 'center'}}>
                                <Path d={hexagonPath} fill={COLORS.AKCRUBLUE} />
                            </Svg>
                            <Icon
                                name="key"
                                type="ionicon"
                                size={80}
                                color={COLORS.MIDORANGE}
                                style={{marginBottom: '8%'}}
                            />
                        </View>
                        <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Forgot your password?</Text>
                        <Text style={{...FONTS.Title2, marginBottom: '5%'}}>Enter your email below</Text>
                        <View style={{marginBottom: 10}}>
                            <Inputs
                                placeholdername={'Enter Your Email'}
                                iconname={'mail'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleEmailChange}
                                value={email}
                                editable={true}
                            />
                            {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                        </View>

                        <AkcruButtons.LrgButton
                            color={isFormComplete ? COLORS.MIDORANGE : COLORS.DARKGREY}
                            btnname={'Send OTP'}
                            onPress={SendOTP}
                            disabled={!isFormComplete || loading}
                        />
                        <Pressable onPress={() => navigation.navigate('PhoneForgotPassword')}>
                            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, marginTop: '5%'}}>
                                Enter your phone number
                            </Text>
                        </Pressable>
                    </View>
                    <Modal animationType="fade" transparent={true} visible={showPasswordResetModal}>
                        <ResetPasswordResultModal
                            closeModal={() => setShowPasswordResetModal(false)}
                            messageheader={resetResultType.messageheader}
                            messageheadercolor={resetResultType.messageheadercolor}
                            message={resetResultType.message}
                            iconname={resetResultType.iconname}
                            iconcolor={resetResultType.iconcolor}
                        />
                    </Modal>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

export default ForgotPassword;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
