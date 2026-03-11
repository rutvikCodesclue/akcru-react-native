import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    Modal,
    KeyboardAvoidingView,
    ActivityIndicator,
    TextInput,
    StyleSheet,
    Platform,
    Keyboard,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME, AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';
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
import ProgressBar from '../../../components/ProgressBar';
import {isTablet} from '../../../../assets/constants/theme';

const iconSize = isTablet() ? 28 : 20;

const TOTAL_STEPS = 11;

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
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                            </TouchableOpacity>
                            <View style={styles.logoCenter}>
                                <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            </View>
                            <View style={[styles.backButton, {opacity: 0}]}>
                                <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                            </View>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <View style={{width: '90%'}}>
                                <Text style={{...FONTS.Title2}}>1/{TOTAL_STEPS}</Text>
                                <ProgressBar currentStep={1} totalSteps={TOTAL_STEPS} style={styles.progress} />
                            </View>
                            <Text style={AUTH_TEXT_THEME.instruction}>
                                Welcome to Akcru first things first, lets verify you through your mobile number below.
                            </Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
                                <BlurView
                                    style={StyleSheet.absoluteFill}
                                    blurType="light"
                                    blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                    reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                />
                                <View style={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}>
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
                            {phoneError && <Text style={AUTH_TEXT_THEME.error}>Invalid mobile number</Text>}
                            <Text style={AUTH_TEXT_THEME.highlight}>
                                You will be sent a one-time-password to this mobile number.
                            </Text>
                        </View>
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Send OTP'}
                                    onPress={() => {
                                    Keyboard.dismiss();
                                    SendOTP();
                                }}
                                    disabled={!isFormComplete}
                                />
                            </View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={COLORS.PINK}
                                    btnname={'Verify with email'}
                                    onPress={() => {
                                    Keyboard.dismiss();
                                    navigation.navigate('OnboardEmail');
                                }}
                                    disabled={false}
                                />
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
                        <Modal animationType="fade" transparent={true} visible={isLoading}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                }}>
                                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>
                                    Signing up...
                                </Text>
                            </View>
                        </Modal>
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardPhone;
