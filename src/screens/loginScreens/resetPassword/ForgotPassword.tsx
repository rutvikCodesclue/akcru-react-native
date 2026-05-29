import {View, Text, ImageBackground, TouchableOpacity, Modal, Pressable, StyleSheet, Platform, ScrollView, KeyboardAvoidingView} from 'react-native';
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
                    colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
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
                </View>
                <View style={{width: '90%', alignItems: 'center',marginBottom:100}}>
                    <View style={{marginTop: 40, marginBottom: 30}}>
                        <Svg
                            height={svgSize}
                            width={svgSize}
                            viewBox={`0 0 270 234`}
                            style={{position: 'absolute', bottom: 0, alignSelf: 'center'}}>
                            <Path d={hexagonPath} fill={COLORS.AKCRUBLUE} />
                        </Svg>
                        <Icon
                            name="key"
                            type="ionicon"
                            size={lrgIconSize}
                            color={COLORS.WHITE}
                            style={{marginBottom: iconMargin}}
                        />
                    </View>
                    <Text style={{
                        ...FONTS.Title1,
                        color: COLORS.PINK,
                        marginBottom: 10,
                        textAlign: 'center',
                    }}>Forgot your password?</Text>
                    <Text style={{
                        ...FONTS.paragraph2,
                        marginBottom: 20,
                        textAlign: 'center',
                        color: COLORS.OVERLAY_WHITE_90,
                    }}>Enter your email below</Text>
                    <View style={{marginBottom: 10, width: '100%'}}>
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
                                editable={!loading}
                                containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                            />
                        </View>
                        {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                    </View>

                    <AkcruButtons.LrgButton
                        variant="auth"
                        btnname="Send OTP"
                        onPress={() => SendOTP()}
                        disabled={!isFormComplete}
                        loading={loading}
                        color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
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
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default ForgotPassword;
