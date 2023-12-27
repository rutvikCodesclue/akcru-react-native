import {View, Text, ImageBackground, TouchableOpacity, ScrollView, Modal, Alert} from 'react-native';
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

    const handleEmailChange = text => {
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
    const SendResetPassword = async () => {
        if (!isEmailValid(email)) {
            setEmailError(true);
            return;
        }

        setLoading(true);
        try {
            const {data, error} = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo:'akcruapp://reset-password',
            });
            // const {error} = await supabase.auth.signInWithOtp({
            //     email: email,
            //     options: {
            //         emailRedirectTo: 'akcruapp://otp-verification',
            //     },
            // });
                console.log(email);
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
                    message: 'Password reset instructions have been sent to your email.',
                    iconname: 'send',
                    iconcolor: COLORS.CATGREENLGT,
                });
            }

            setShowPasswordResetModal(true);

            // Set a timer to navigate after 5 seconds
            setTimeout(() => {
                navigation.navigate('Signin');
            }, 5000);
        } catch (error) {
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
                message: 'An error occurred while resetting the password.',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            setShowPasswordResetModal(true);
        } finally {
            setLoading(false);
        }
    };


    // async function resetPassword() {
    //     setLoading(true);
    //     // FIXME: get rid of this console.log
    //     console.log('Attempting to Reset Password w/ Email:', email);
    //     setShowPasswordResetModal(true);
    //     const {error} = await supabase.auth.resetPasswordForEmail(email, {
    //         redirectTo: 'https://ackru.com/update-password',
    //     });

    //     if (error) console.error(error.message);
    //     if (!error) {
    //         alert(' Successful, password reset instructions have been sent to your email.');
    //         setLoading(false);
    //         // FIXME: push to check email page / trigger set email state
    //         navigation.navigate('Signin');
    //     }
    // }

    return (
        <ScrollView>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
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
                            btnname={'Reset Password'}
                            onPress={() => SendResetPassword()}
                            disabled={!isFormComplete}
                        />
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
