import {View, Text, ImageBackground, Modal, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import React, {useState} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path} from 'react-native-svg';
import {Icon} from '@rneui/base';
import CodeInput from '../../../components/CodeInput/CodeInput';
import ResendTimer from '../../../components/CodeResendTimer/ResendTimer';
import OTPResultModal from '../../../components/CodeModals/OTPResultModal';
import {API} from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';
import {isTablet} from '../../../../assets/constants/theme';
import {AkcruLogo} from '../../../../assets/svg';

const smlIconSize = isTablet() ? 28 : 20;
const svgSize = isTablet() ? 200 : 150;
const lrgIconSize = isTablet() ? 110 : 80;
const iconMargin = isTablet() ? '5%' : '8%';

const OTPVerification = ({route}) => {
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
    const [otpResultMessage, setOtpResultMessage] = useState('');

    const handleShowOTPModal = (modalType: string, message = '') => {
        setOtpResultMessage(message);
        setTypeOTPModal(modalType);
        setShowVerifiedModal(true);
    };

    const handleCloseOTPModal = () => {
        if (typeOTPModal === 'success') {
            //do something
        }
        setOtpResultMessage('');
        setShowVerifiedModal(false);
    };

    const resendEmail = async (triggerTimer: (targetTimeSeconds?: number) => void) => {
        setCode('');
        setPinReady(false);
        if (!email && !phoneNumber) {
            setResendStatus('Failed');
            return;
        }
        setResendingEmail(true);
        try {
            const payload = email ? {email} : {phoneNumber};
            const response = await API.post('/v1/user/sendOTP', payload);
            const data = response.data;

            if (data?.success === false) {
                setResendStatus('Failed');
            } else {
                setResendStatus('Sent');
                setActiveResend(false);
                triggerTimer();
            }
        } catch (error) {
            console.error('Resend OTP failed', error);
            setResendStatus('Failed');
        } finally {
            setResendingEmail(false);
        }
    };

    const handleOTPVerification = async () => {
        try {
            setVerify(true);

            const payload = email ? {email} : {phoneNumber};

            const response = await API.post('/v1/user/verifyOTP', {
                ...payload,
                otp: code,
            });
            console.log(response.data);

            const data = response.data;

            if (data.success) {
                setVerify(false);
                handleShowOTPModal('success');

                navigation.navigate('ResetPassword', {
                    email: email,
                    phoneNumber: phoneNumber,
                });
            } else {
                handleShowOTPModal('failed', data?.message || 'Verification failed');
                setVerify(false);
            }
        } catch (error) {
            console.error('Verification failed', error);
            setVerify(false);
            const errorMessage = error instanceof Error ? error.message : 'Verification failed';
            handleShowOTPModal('failed', errorMessage);
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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
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
                            contentContainerStyle={{flexGrow: 1, paddingTop: '8%', paddingBottom: 24, alignItems: 'center'}}
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
                                <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                                    Enter the 6-digit code sent to your email
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
                                        color={COLORS.MIDORANGE}
                                        btnname={'Verify'}
                                        onPress={handleOTPVerification}
                                        disabled={false}
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
                                        resendEmail={resendEmail}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        <Modal animationType="fade" transparent={true} visible={showVerifiedModal}>
                            <OTPResultModal closeModal={handleCloseOTPModal} type={typeOTPModal} message={otpResultMessage} />
                        </Modal>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OTPVerification;
