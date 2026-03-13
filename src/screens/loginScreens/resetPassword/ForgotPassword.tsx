import {View, Text, ImageBackground, TouchableOpacity, Modal, Pressable, StyleSheet, Platform} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import Inputs from '../../../components/input';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/base';
import Svg, {Path} from 'react-native-svg';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import {isTablet} from '../../../../assets/constants/theme';
import {AkcruLogo} from '../../../../assets/svg';
import AkcruButtons from '../../../components/akcruButtons';
import {AUTH_TEXT_THEME, AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';
import LinearGradient from 'react-native-linear-gradient';

const smlIconSize = isTablet() ? 28 : 20;
const svgSize = isTablet() ? 200 : 150;
const lrgIconSize = isTablet() ? 110 : 80;
const iconMargin = isTablet() ? '5%' : '8%';

const ForgotPassword = () => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text.toLowerCase());
        setEmailError(!isEmailValid(text));
    };

    const checkFormCompletion = () => {
        if (email && isEmailValid(email)) {
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


    const SendOTP = async () => {
        if (!isEmailValid(email)) {
            setEmailError(true);
            return;
        }

        setLoading(true);
        try {

            const {data, error} = await API.post('/v1/user/sendOTP', {email});
            if (error) {
                setResetResultType({
                    messageheader: 'Error',
                    messageheadercolor: COLORS.CATREDDRK,
                    message: error.message,
                    iconname: 'alert-circle',
                    iconcolor: COLORS.CATREDLGT,
                });
                setShowPasswordResetModal(true);

            } else {
                setResetResultType({
                    messageheader: 'Success',
                    messageheadercolor: COLORS.CATGREENDRK,
                    message: 'OTP has been sent to your email.',
                    iconname: 'send',
                    iconcolor: COLORS.CATGREENLGT,
                });


                setTimeout(() => {
                    navigation.navigate('OTPVerification', {email});
                }, 3000);
            }

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
        <View style={{flex: 1}}>
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
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.pop()} style={styles.backButton}>
                            <Icon name="chevron-back" type="ionicon" size={smlIconSize} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                        <View style={styles.logoCenter}>
                            <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                        </View>
                        <View style={[styles.backButton, {opacity: 0}]}>
                            <Icon name="chevron-back" type="ionicon" size={smlIconSize} color={COLORS.LIGHTGREY} />
                        </View>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', marginTop: '35%'}}>
                        <View>
                            <Svg
                                height={svgSize}
                                width={svgSize}
                                viewBox={`0 0 270 234`}
                                style={{position: 'absolute', bottom: 0, alignSelf: 'center', opacity: 0.9}}>
                                <Path d={hexagonPath} fill={COLORS.AKCRUBLUE} />
                            </Svg>
                            <Icon
                                name="key"
                                type="ionicon"
                                size={lrgIconSize}
                                color={COLORS.LIGHTGREY}
                                style={{marginBottom: iconMargin, opacity: 0.9}}
                            />
                        </View>
                        <Text  style={{
                                                                          ...FONTS.Title1,
                                                                          color: COLORS.PINK,
                                                                          marginTop: 30,
                                                                      }}>Forgot your password?</Text>
                        <Text  style={{...FONTS.paragraph2,marginTop: 10,}}>Enter your email below</Text>
                        <View style={{marginBottom: 10}}>
                            <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
                                <BlurView
                                    style={StyleSheet.absoluteFill}
                                    blurType="light"
                                    blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                    reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                />
                                <Inputs
                                    placeholdername={'Enter Your Email'}
                                    iconname={'mail'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={handleEmailChange}
                                    value={email}
                                    editable={true}
                                    containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                />
                            </View>
                            {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                        </View>

                        <AkcruButtons.LrgButton
                            variant="auth"
                            btnname="Send OTP"
                            onPress={() => SendOTP()}
                            disabled={!isFormComplete || loading}
                            color={COLORS.PURPLE}
                        />
                        <Pressable onPress={() => navigation.navigate('PhoneForgotPassword')}>
                            <Text style={AUTH_TEXT_THEME.link}>
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
        </View>
    );
};

export default ForgotPassword;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
