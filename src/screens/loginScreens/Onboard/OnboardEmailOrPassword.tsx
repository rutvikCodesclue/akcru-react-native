import {
    View,
    Text,
    ImageBackground,
    Modal,
    TextInput,
    Alert,
    TouchableOpacity,
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
import Inputs from '../../../components/input';
import {Icon} from '@rneui/base';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import {AxiosError} from 'axios';
import StepperDots from '../../../components/StepperDots';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
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
                        {email && !phoneNumber && (
                            <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>
                                Enter your mobile number below.
                            </Text>
                        )}
                        {!email && phoneNumber && (
                            <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>Enter your email below.</Text>
                        )}
                    {email && !phoneNumber && (
                            <View style={{alignItems: 'center', marginTop: 10}}>
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
                                {phoneError && <Text style={styles.errorText}>Invalid mobile number</Text>}
                            </View>
                        )}

                        {!email && phoneNumber && (
                            <View style={{alignItems: 'center', marginTop: 10}}>
                                <View style={styles.blurInputWrapper}>
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
                                        containerStyle={styles.inputRow}
                                    />
                                </View>
                                {emailError && <Text style={styles.errorText}>Invalid email format</Text>}
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
                                                setIsLoading(true);
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
                                                navigation.navigate('OnboardUsername', {
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
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        disabled={phoneError || !phone}
                                        loading={isLoading}
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
                                            navigation.navigate('OnboardUsername', {
                                                email: Email,
                                                phoneNumber: phoneNumber,
                                            });
                                        }}
                                        disabled={emailError || !Email}
                                        loading={isLoading}
                                />
                            </View>
                        )}
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

export default OnboardEmailOrPassword;
