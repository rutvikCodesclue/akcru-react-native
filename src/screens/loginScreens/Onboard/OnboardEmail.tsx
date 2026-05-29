import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    Modal,
    KeyboardAvoidingView,
    StyleSheet,
    Platform,
    Keyboard,
    TextInput,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
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
import Tos from './tos';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import StepperDots from '../../../components/StepperDots';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

const TOSModal = ({visible, children}: {visible: boolean; children: any}) => {
    const [showModal, setShowModal] = useState(visible);
    React.useEffect(() => {
        togglemode();
    }, [visible]);
    const togglemode = () => {
        if (visible) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    };

    return (
        <Modal transparent visible={showModal}>
            <View style={styles.tosmodal}>
                <View style={styles.tosmodalcontainer}>{children}</View>
            </View>
        </Modal>
    );
};

const iconSize = isTablet() ? 28 : 20;

const OnboardEmail = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordLengthError, setPasswordLengthError] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const [visible, setVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text.trim().toLowerCase());
        setEmailError(!isEmailValid(text));
    };

    const handlePassword = (text: string) => {
        setPassword(text);
        setPasswordLengthError(text.length > 0 && text.length < 8);
    };

    const handleConfirmPassword = (text: string) => {
        setConfirmPassword(text);
    };

    const checkPasswordMatch = () => {
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }
    };

    const checkFormCompletion = () => {
        const passwordValid = password.length >= 8 && password === confirmPassword;
        if (email && isEmailValid(email) && passwordValid && isChecked) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
        checkPasswordMatch();
    }, [email, password, confirmPassword, isChecked]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const SendOTP = async () => {
        if (loading) return;
        if (!isEmailValid(email)) {
            setEmailError(true);
            return;
        }
        if (password.length < 8) {
            setPasswordLengthError(true);
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError(true);
            return;
        }

        setLoading(true);
        try {
            const {data, error} = await API.post('/v1/auth/sentOTP', {email});
            console.log("SENT OTP API----",data);
            console.log("SENT OTP API----",error);
            if (error) {
                setResetResultType({
                    messageheader: 'Error',
                    messageheadercolor: COLORS.CATREDDRK,
                    message: error.message,
                    iconname: 'alert-circle',
                    iconcolor: COLORS.CATREDLGT,
                });
                setShowEmailModal(true);
            } else {
                setResetResultType({
                    messageheader: 'Success',
                    messageheadercolor: COLORS.CATGREENDRK,
                    message: 'OTP has been sent to your email.',
                    iconname: 'send',
                    iconcolor: COLORS.CATGREENLGT,
                });

                setTimeout(() => {
                    navigation.navigate('OTPVerificationSignup', {email, password});
                }, 10);
            }


        } catch (error) {

            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.BLACK,
                message: error.response.data.message || 'Error while sending OTP',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            setShowEmailModal(true);
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
                            Welcome to Akcru first things first, lets verify you through your email below.
                        </Text>
                                <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={10}

                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <View style={styles.inputRow}>
                                        <Icon
                                            name="mail"
                                            type="ionicon"
                                            size={isTablet() ? 28 : 20}
                                            color={COLORS.LIGHTGREY}
                                            style={{marginRight: 8}}
                                        />
                                        <TextInput
                                            placeholder="Email"
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={{
                                                                                               flex:1,
                                                                                               color:COLORS.WHITE,
                                                                                               fontSize:isTablet()?18:14
                                                                                               }}
                                            value={email}
                                            onChangeText={handleEmailChange}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!loading}

                                        />
                                    </View>
                                </View>
                                {emailError && <Text style={styles.errorText}>Invalid email format</Text>}
                                <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <View style={styles.inputRow}>
                                        <Icon
                                            name="lock-closed"
                                            type="ionicon"
                                            size={iconSize}
                                            color={COLORS.LIGHTGREY}
                                            style={{marginRight: 8}}
                                        />
                                        <TextInput
                                            placeholder="Choose password (min 8 characters)"
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={{flex: 1, color: COLORS.WHITE, fontSize: isTablet() ? 18 : 14}}
                                            value={password}
                                            onChangeText={handlePassword}
                                            secureTextEntry={!isPasswordVisible}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setPasswordVisible(!isPasswordVisible)}
                                            style={{padding: 8}}>
                                            <Icon
                                                name={isPasswordVisible ? 'eye' : 'eye-off'}
                                                type="ionicon"
                                                size={iconSize}
                                                color={COLORS.LIGHTGREY}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {passwordLengthError && (
                                    <Text style={styles.errorText}>Password must be at least 8 characters long</Text>
                                )}
                                <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <View style={styles.inputRow}>
                                        <Icon
                                            name="lock-closed"
                                            type="ionicon"
                                            size={iconSize}
                                            color={COLORS.LIGHTGREY}
                                            style={{marginRight: 8}}
                                        />
                                        <TextInput
                                            placeholder="Confirm password"
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={{flex: 1, color: COLORS.WHITE, fontSize: isTablet() ? 18 : 14}}
                                            value={confirmPassword}
                                            onChangeText={handleConfirmPassword}
                                            secureTextEntry={!isConfirmPasswordVisible}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                            style={{padding: 8}}>
                                            <Icon
                                                name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                                                type="ionicon"
                                                size={iconSize}
                                                color={COLORS.LIGHTGREY}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {passwordError && <Text style={styles.errorText}>Passwords do not match.</Text>}
                                <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 20}]}>
                                    You will be sent a one-time-password to this email address.
                                </Text>
                                <View style={[styles.checkboxContainer, {justifyContent: 'center', width: '100%'}]}>
                                    <TouchableOpacity onPress={() => handleCheckboxChange(!isChecked)}>
                                        <View style={styles.checkbox}>
                                            {isChecked && (
                                                <Icon
                                                    name="checkmark-sharp"
                                                    type="ionicon"
                                                    size={18}
                                                    color={COLORS.AKCRUBLUE}
                                                    style={{marginTop: -3}}
                                                />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={styles.checkboxText}>I have read and I agree to the</Text>
                                        <Pressable onPress={() => setVisible(true)}>
                                            <Text style={AUTH_TEXT_THEME.linkSmall}>terms and conditions</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                <TOSModal visible={visible}>
                                    <View>
                                        <Pressable onPress={() => setVisible(false)}>
                                            <Icon name={'close'} color={COLORS.LIGHTGREY} />
                                        </Pressable>
                                    </View>
                                    <ScrollView>
                                        <Tos />
                                    </ScrollView>
                                    <View style={{height: 20}} />
                                </TOSModal>
                                <View style={{alignItems: 'center', marginTop: 20, width: '100%'}}>
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                        btnname={'Send OTP'}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            SendOTP();
                                        }}
                                        disabled={!isFormComplete || loading}
                                        loading={loading}
                                    />
                                </View>

                            </View>
                        <Modal animationType="fade" transparent={true} visible={showEmailModal}>
                            <ResetPasswordResultModal
                                closeModal={() => setShowEmailModal(false)}
                                messageheader={resetResultType.messageheader}
                                messageheadercolor={resetResultType.messageheadercolor}
                                message={resetResultType.message}
                                iconname={resetResultType.iconname}
                                iconcolor={resetResultType.iconcolor}
                            />
                        </Modal>
                        <Text style={{...FONTS.paragraph2, color: COLORS.OVERLAY_WHITE_55, textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardEmail;
