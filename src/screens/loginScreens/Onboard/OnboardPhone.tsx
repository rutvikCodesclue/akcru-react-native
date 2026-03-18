import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    Modal,
    TextInput,
    StyleSheet,
    Platform,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import {Icon} from '@rneui/base';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import StepperDots from '../../../components/StepperDots';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const iconSize = isTablet() ? 28 : 20;

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

const OnboardPhone = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isPhoneValid = (phone: string) => {
        return /^\d{10}$/.test(phone);
    };

    const handlePhoneNumberChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setPhone(numericText);
        setPhoneError(!isPhoneValid(numericText));
        checkFormCompletion(numericText);
    };

    const checkFormCompletion = (phoneNumber: string) => {
        setIsFormComplete(isPhoneValid(phoneNumber));
    };

    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const SendOTP = async () => {
        if (!isFormComplete) {
            setPhoneError(true);
            return;
        }

        setLoading(true);
        try {
            const {data, error} = await API.post('/v1/auth/sentOTP', {phoneNumber: '1' + phone});

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
                    message: 'OTP has been sent to your phone.',
                    iconname: 'send',
                    iconcolor: COLORS.CATGREENLGT,
                });
                setShowPasswordResetModal(true);

                setTimeout(() => {
                    navigation.navigate('OTPVerificationSignup', {phoneNumber: phone});
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
                {/* Fixed Header Section */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                        <Text style={styles.stepIndicator}>
                            {CURRENT_STEP}/{TOTAL_STEPS}
                        </Text>
                    </View>
                    <View style={styles.logoCenter}>
                        <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                    </View>
                    <View style={[styles.backButton, {opacity: 0}]}>
                        <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                    </View>
                </View>
                <View style={{alignItems: 'center', marginBottom: 16}}>
                    <StepperDots
                        currentStep={CURRENT_STEP}
                        totalSteps={TOTAL_STEPS}
                    />
                </View>

                {/* Centered Content Section */}
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 24,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={{width: '90%', alignItems: 'center'}}>
                        <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>
                            Welcome to Akcru first things first, lets verify you through your mobile number below.
                        </Text>
                        <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <View style={styles.inputRow}>
                                        <Icon
                                            name={'call'}
                                            type="ionicon"
                                            size={iconSize}
                                            color={COLORS.LIGHTGREY}
                                            style={{marginRight: 5}}
                                        />
                                        <Text style={styles.textinputprefix}>+1</Text>
                                        <TextInput
                                            placeholder="123-456-7890"
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.phonenuminput}
                                            secureTextEntry={false}
                                            onChangeText={handlePhoneNumberChange}
                                            value={phone}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            editable={true}
                                        />
                                    </View>
                                </View>
                                {phoneError && <Text style={styles.errorText}>Invalid mobile number</Text>}
                                <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 12}]}>
                                    You will be sent a one-time-password to this mobile number.
                                </Text>
                            <View style={{alignItems: 'center', marginTop: 20, width: '100%'}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Send OTP'}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        SendOTP();
                                    }}
                                    disabled={!isFormComplete}
                                    loading={loading}
                                />
                            </View>
                            <View style={{alignItems: 'center', marginTop: 12, width: '100%'}}>
                                <TouchableOpacity
                                    style={{
                                        width: SIZES.ScreenWidth * 0.9,
                                        height: isTablet() ? 60 : 50,
                                        borderRadius: 12,
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.18)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        navigation.navigate('OnboardEmail');
                                    }}>
                                    <Text style={{...FONTS.Title1, color: COLORS.WHITE}}>Verify with email</Text>
                                    </TouchableOpacity>
                                </View>
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
                    <Text style={{...FONTS.paragraph2, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardPhone;
