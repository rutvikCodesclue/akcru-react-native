import {View, Text, ImageBackground, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard} from 'react-native';
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
import StepperDots from '../../../components/StepperDots';
import useAuthStore from '../../../stores/auth.store';
const TOTAL_STEPS = 5;
const CURRENT_STEP = 2; // Verify OTP is step 2 in onboard flow

const smlIconSize = isTablet() ? 28 : 20;
const svgSize = isTablet() ? 200 : 150;
const lrgIconSize = isTablet() ? 110 : 80;
const iconMargin = isTablet() ? '5%' : '8%';

const OTPVerificationSignup = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const email = route.params?.email;
    const password = route.params?.password;
    const phoneNumber = route.params?.phoneNumber;

    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    //code length
    const MAX_CODE_LENGTH = 6;
    const [code, setCode] = useState('');
    const [pinReady, setPinReady] = useState(false);

    //email resend
    const [activeResend, setActiveResend] = useState(false);
    const [resendStatus, setResendStatus] = useState('Resend');
    const [resendingEmail, setResendingEmail] = useState(false);
    //OTP Modal
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const [typeOTPModal, setTypeOTPModal] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingAfterSuccess, setPendingAfterSuccess] = useState<'navigate_username' | 'navigate_email_or_password' | null>(null);

    const handleShowOTPModal = (typeOTPModal: React.SetStateAction<string>) => {
        setTypeOTPModal(typeOTPModal);
        setShowVerifiedModal(true);
    };

    const handleCloseOTPModal = () => {
        setShowVerifiedModal(false);
        if (typeOTPModal === 'success' && pendingAfterSuccess === 'navigate_username') {
            setPendingAfterSuccess(null);
            navigation.navigate('OnboardUsername', {phoneNumber: phoneNumber});
        } else if (typeOTPModal === 'success' && pendingAfterSuccess === 'navigate_email_or_password') {
            setPendingAfterSuccess(null);
            navigation.navigate('OnboardEmailOrPassword', {
                email: email,
                phoneNumber: phoneNumber,
            });
        } else {
            setPendingAfterSuccess(null);
        }
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

    const attemptSignup = async (signupEmail: string, signupPassword: string) => {
        const {response, user} = await useAuthStore.getState().signUpWithEmail(signupEmail, signupPassword);
        if (!user || (response && response.status >= 400)) {
            const message = response?.data?.message || 'Error during signup';
            throw new Error(message);
        }
        console.log('attemptSignup:', user);
    };

    const handleOTPVerification = async () => {
        if (loading) return;
        Keyboard.dismiss();
        setLoading(true);
        try {
            const payload = email ? {email} : {phoneNumber};

            const response = await API.post('/v1/auth/verify', {
                ...payload,
                otp: code,
            });

            const data = response.data;

            if (data.success) {
                if (email && password) {
                    try {
                        await attemptSignup(email, password);
                        setPendingAfterSuccess('navigate_username');
                        handleShowOTPModal('success');
                    } catch (error) {
                        handleShowOTPModal('failed');
                    }
                } else {
                    setPendingAfterSuccess('navigate_email_or_password');
                    handleShowOTPModal('success');
                }
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification failed', error);
            handleShowOTPModal('failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
               <LinearGradient
                    colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: SIZES.ScreenHeight,
                    }}
                />
                {/* Fixed Header Section - same as OnboardEmail */}
                <View style={styles.headerRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity onPress={() => navigation.pop()} style={styles.backButton}>
                            <Icon name="chevron-back" type="ionicon" size={smlIconSize} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                        <Text style={{...FONTS.Title2, color: 'rgba(255,255,255,0.7)', marginLeft: 8}}>
                            {CURRENT_STEP}/{TOTAL_STEPS}
                        </Text>
                    </View>
                    <View style={styles.logoCenter}>
                        <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                    </View>
                    <View style={[styles.backButton, {opacity: 0}]}>
                        <Icon name="chevron-back" type="ionicon" size={smlIconSize} color={COLORS.LIGHTGREY} />
                    </View>
                </View>
                <View style={{alignItems: 'center', marginBottom: 16}}>
                    <StepperDots
                        currentStep={CURRENT_STEP}
                        totalSteps={TOTAL_STEPS}
                    />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{flex: 1}}>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <View style={{width: '90%', alignItems: 'center'}}>
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
                            <View style={{marginBottom: 30, paddingHorizontal: 16}}>
                                <Text style={[AUTH_TEXT_THEME.instruction, {textAlign: 'center', color: 'rgba(255,255,255,0.9)'}]}>
                                    Enter the 6-digit code sent to your email/phone
                                </Text>
                            </View>
                            <View style={{marginBottom: 30, width: '100%'}}>
                                <CodeInput
                                    maxLength={MAX_CODE_LENGTH}
                                    code={code}
                                    setCode={setCode}
                                    setPinReady={setPinReady}
                                />
                            </View>
                            <View style={{width: '100%', alignItems: 'center', marginBottom: 40}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={pinReady ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Verify'}
                                    onPress={handleOTPVerification}
                                    disabled={!pinReady}
                                    loading={loading}
                                />
                                <View style={{marginTop: 20,marginBottom:100}}>
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
                        </View>
                        <Modal animationType="fade" transparent={true} visible={showVerifiedModal}>
                            <OTPResultModal closeModal={handleCloseOTPModal} type={typeOTPModal} />
                        </Modal>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OTPVerificationSignup;
