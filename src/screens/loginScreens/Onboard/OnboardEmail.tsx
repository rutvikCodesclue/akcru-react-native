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
    ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME, AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import {Icon} from '@rneui/base';
import Tos from './tos';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import ProgressBar from '../../../components/ProgressBar';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 7;
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

const OnboardEmail = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [emailError, setEmailError] = useState(false);
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

    const checkFormCompletion = () => {
        if (email && isEmailValid(email) && isChecked) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [email, isChecked]);

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

        setLoading(true);
        try {
            const {data, error} = await API.post('/v1/auth/sentOTP', {email});

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
                    navigation.navigate('OTPVerificationSignup', {email});
                }, 10);
            }


        } catch (error) {
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={styles.headerRow}>
                            <View style={styles.headerLeft}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                                </TouchableOpacity>
                                <Text style={AUTH_TEXT_THEME.stepIndicator}>
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
                        <View style={{alignItems: 'center'}}>
                            <View style={{width: '90%'}}>
                                <ProgressBar
                                    currentStep={CURRENT_STEP}
                                    totalSteps={TOTAL_STEPS}
                                    style={styles.progress}
                                />
                            </View>
                            <Text style={AUTH_TEXT_THEME.instruction}>
                                Welcome to Akcru first things first, lets verify you through your email below.
                            </Text>
                        </View>
                        <ScrollView
                            style={{flex: 1}}
                            contentContainerStyle={{flexGrow: 1, paddingTop: '20%', paddingBottom: 24, alignItems: 'center'}}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}>
                            <View style={{width: '90%', alignItems: 'center'}}>
                                <View style={[AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle(),{marginTop: 50}]}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <Inputs
                                        placeholdername={'Email'}
                                        iconname={'mail'}
                                        iconcolor={COLORS.LIGHTGREY}
                                        secureTextEntry={false}
                                        onChangeText={handleEmailChange}
                                        value={email}
                                        editable={!loading}
                                        containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                        keyboardType="email-address"
                                    />
                                </View>
                                {emailError && <Text style={AUTH_TEXT_THEME.error}>Invalid email format</Text>}
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
                                    />
                                </View>
                                <View style={{alignItems: 'center', marginTop: 20, width: '100%'}}>
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={COLORS.PINK}
                                        btnname={'Verify with mobile number'}
                                        onPress={() => {
                                        Keyboard.dismiss();
                                        navigation.navigate('OnboardPhone', {email});
                                    }}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        </ScrollView>
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
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
                <Modal animationType="fade" transparent={true} visible={loading}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}>
                        <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                        <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Sending OTP...</Text>
                    </View>
                </Modal>
            </ImageBackground>
        </View>
    );
};

export default OnboardEmail;
