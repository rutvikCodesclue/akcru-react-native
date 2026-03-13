import {View, Text, ImageBackground, TouchableOpacity, Modal, TextInput, ActivityIndicator, Keyboard, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
import React, {useState, useEffect} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path} from 'react-native-svg';
import {Icon} from '@rneui/base';
import CodeInput from '../../../components/CodeInput/CodeInput';
import ResendTimer from '../../../components/CodeResendTimer/ResendTimer';
import OTPResultModal from '../../../components/CodeModals/OTPResultModal';
import {API} from '../../../clients/api.client';
import {AkcruLogo} from '../../../../assets/svg';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const smlIconSize = isTablet() ? 28 : 20;
const svgSize = isTablet() ? 200 : 150;
const lrgIconSize = isTablet() ? 110 : 80;
const iconMargin = isTablet() ? '5%' : '8%';

const OTPVerificationSignup = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const email = route.params?.email;

    const phoneNumber = route.params?.phoneNumber;

    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    //code length
    const MAX_CODE_LENGTH = 6;
    const [code, setCode] = useState('');
    const [pinReady, setPinReady] = useState(false);
    const [verify, setVerify] = useState(false);

    //email resend
    const [activeResend, setActiveResend] = useState(false);
    const [resendStatus, setResendStatus] = useState('Resend');
    const [resendingEmail, setResendingEmail] = useState(false);
    //OTP Modal
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const [typeOTPModal, setTypeOTPModal] = useState('');
    const [loading, setLoading] = useState(false);

    const handleShowOTPModal = (typeOTPModal: React.SetStateAction<string>) => {
        setTypeOTPModal(typeOTPModal);
        setShowVerifiedModal(true);
    };

    const handleCloseOTPModal = () => {
        if (typeOTPModal === 'success') {
            //do something
        }
        setShowVerifiedModal(false);
    };

    const resendOTP = async triggerTimer => {
        setResendingEmail(true);
        try {
            const payload = email ? {email} : {phoneNumber: '1' + phoneNumber};
            const {data, error} = await API.post('/v1/auth/sentOTP', payload);

            if (error) {
                setResendStatus('Failed');
            } else {
                setResendStatus('Sent');
                setActiveResend(false);
                triggerTimer();
            }
        } catch (err) {
            setResendStatus('Failed');
        } finally {
            setResendingEmail(false);
        }
    };

    const handleOTPVerification = async () => {
        if (loading) return;
        Keyboard.dismiss();
        setLoading(true);
        setVerify(true);
        try {
            const payload = email ? {email} : {phoneNumber};

            const response = await API.post('/v1/auth/verify', {
                ...payload,
                otp: code,
            });

            const data = response.data;

            if (data.success) {
                setVerify(false);
                handleShowOTPModal('success');

                navigation.navigate('OnboardEmailOrPassword', {
                    email: email,
                    phoneNumber: phoneNumber,
                });
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification failed', error);
            setVerify(false);
            handleShowOTPModal('failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground style={[styles.bgimage, {flex: 1}]} source={imageindex.BgImageSM} resizeMode={'cover'}>
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{flex: 1}}>
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
                        <ScrollView
                            style={{flex: 1}}
                            contentContainerStyle={{flexGrow: 1, paddingTop: '15%', paddingBottom: 24, alignItems: 'center'}}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}>
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
                            <View style={{marginBottom: 10, marginHorizontal: '5%'}}>
                                <Text style={AUTH_TEXT_THEME.instruction}>
                                    Enter the 6-digit code sent to your email/phone
                                </Text>
                            </View>
                            <View style={{marginVertical: '15%'}}>
                                <CodeInput
                                    maxLength={MAX_CODE_LENGTH}
                                    code={code}
                                    setCode={setCode}
                                    setPinReady={setPinReady}
                                />
                            </View>
                            <View>
                                {!verify && pinReady && (
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={COLORS.PURPLE}
                                        btnname={'Verify'}
                                        onPress={handleOTPVerification}
                                        disabled={loading}
                                    />
                                )}
                                {!verify && !pinReady && (
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={COLORS.DARKGREY}
                                        btnname={'Verify'}
                                        onPress={() => ''}
                                        disabled={true}
                                    />
                                )}
                                <View>
                                    <ResendTimer
                                        targetTimeInSec={30}
                                        setActiveResend={setActiveResend}
                                        activeResend={activeResend}
                                        resendStatus={resendStatus}
                                        resendingEmail={resendingEmail}
                                        resendEmail={resendOTP}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        <Modal animationType="fade" transparent={true} visible={loading}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                }}>
                                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Verifying...</Text>
                            </View>
                        </Modal>
                        <Modal animationType="fade" transparent={true} visible={showVerifiedModal}>
                            <OTPResultModal closeModal={handleCloseOTPModal} type={typeOTPModal} />
                        </Modal>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OTPVerificationSignup;
