import {
    View,
    Text,
    ImageBackground,
    Modal,
    KeyboardAvoidingView,
    ActivityIndicator,
    TextInput,
    Alert,
    TouchableOpacity,
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
import Inputs from '../../../components/input';
import {Icon} from '@rneui/base';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import {AxiosError} from 'axios';
import ProgressBar from '../../../components/ProgressBar';
import {isTablet} from '../../../../assets/constants/theme';

const TOTAL_STEPS = 7;
const CURRENT_STEP = 2;
const iconSize = isTablet() ? 28 : 20;

const OnboardEmailOrPassword = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const email = route.params?.email;

    const phoneNumber = route.params?.phoneNumber;

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [, setIsFormComplete] = useState(false);
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

    const [emailError, setEmailError] = useState(false);
    const [Email, setEmail] = useState<string>('');

    const isEmailValid = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text.trim().toLowerCase());
        setEmailError(!isEmailValid(text));
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

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
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
                            {email && !phoneNumber && (
                                <View>
                                    <Text style={AUTH_TEXT_THEME.instruction}>
                                        Enter your mobile number below.
                                    </Text>
                                </View>
                            )}
                            {!email && phoneNumber && (
                                <View>
                                    <Text style={AUTH_TEXT_THEME.instruction}>Enter your email below.</Text>
                                </View>
                            )}
                        </View>
                        {email && !phoneNumber && (
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
                                            placeholder="234-456-7890"
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={handlePhoneNumberChange}
                                            value={phone}
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            editable={true}
                                        />
                                    </View>
                                </View>
                                {phoneError && <Text style={AUTH_TEXT_THEME.error}>Invalid mobile number</Text>}
                            </View>
                        )}

                        {!email && phoneNumber && (
                            <View style={{alignItems: 'center', marginTop: 10}}>
                                <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
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
                                        value={Email}
                                        editable={!loading}
                                        containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                    />
                                </View>
                                {emailError && <Text style={AUTH_TEXT_THEME.error}>Invalid email format</Text>}
                            </View>
                        )}
                        <View>
                            {email && !phoneNumber && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={COLORS.PURPLE}
                                        btnname={'Confirm your mobile number'}
                                        onPress={async () => {
                                            Keyboard.dismiss();
                                            try {
                                                type CheckPhoneResponse = {success: true; message: string};
                                                const response = await API.post<CheckPhoneResponse>(
                                                    '/v1/user/check-phone',
                                                    {
                                                        phoneNumber: phone,
                                                    },
                                                );
                                                if (response instanceof AxiosError) {
                                                    // as error cases are handled to return as response by the interceptor
                                                    throw response;
                                                }
                                                if (!response.data.success) {
                                                    throw new Error("Couldn't verify phone number");
                                                }
                                                navigation.navigate('OnboardPassword', {
                                                    email: email,
                                                    phoneNumber: phone,
                                                });
                                            } catch (error) {
                                                if (error instanceof AxiosError && error.response?.status === 400) {
                                                    Alert.alert(
                                                        'Duplicate Phone Number',
                                                        'Phone number is already in use.',
                                                    );
                                                } else {
                                                    Alert.alert(
                                                        'Something went wrong',
                                                        'Unable to verify the phone number, please try again later.',
                                                    );
                                                }
                                            }
                                        }}
                                        disabled={phoneError || !phone}
                                    />
                                </View>
                            )}
                            {!email && phoneNumber && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={COLORS.PURPLE}
                                        btnname={'Confirm your email'}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            navigation.navigate('OnboardPassword', {
                                                email: Email,
                                                phoneNumber: phoneNumber,
                                            });
                                        }}
                                        disabled={emailError || !Email}
                                    />
                                </View>
                            )}
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

export default OnboardEmailOrPassword;
