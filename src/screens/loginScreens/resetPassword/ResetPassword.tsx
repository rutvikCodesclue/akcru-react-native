import {
    View,
    Text,
    ImageBackground,
    Modal,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    StyleSheet,
    TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {BlurView} from '@react-native-community/blur';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS} from '../../../../assets/constants';
import styles from './styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import Svg, {Path} from 'react-native-svg';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';
import {isTablet} from '../../../../assets/constants/theme';
import {AkcruLogo} from '../../../../assets/svg';

const smlIconSize = isTablet() ? 28 : 20;
const iconSize = smlIconSize;

const ResetPassword = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const route = useRoute<RouteProp<AuthStackParams, 'ResetPassword'>>();

    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';

    const [loading, setLoading] = useState<boolean>(false);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordLengthError, setPasswordLengthError] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [showConfirmNewPasswordModal, setShowConfirmNewPasswordModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const email = route.params?.email;
    const phoneNumber = route.params?.phoneNumber;

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setPasswordLengthError(text.length > 0 && text.length < 8);
    };

    const handleConfirmPasswordChange = (text: string) => {
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
        if (passwordValid) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
        checkPasswordMatch();
    }, [password, confirmPassword]);

    const handleConfirmNewPassword = async () => {
        if (!isFormComplete) {
            return;
        }

        if (password !== confirmPassword) {
            return;
        }

        if (password.length < 8) {
            return;
        }

        setLoading(true);

        try {
            const payload = email ? {email} : {phoneNumber};

            const response = await API.post('/v1/user/resetPassword', {
                ...payload,
                password,
                confirmPassword,
            });

            const data = response.data;

            if (data.success) {
                setResetResultType({
                    messageheader: 'Success',
                    messageheadercolor: COLORS.CATGREENDRK,
                    message: 'Password reset successfully.',
                    iconname: 'happy',
                    iconcolor: COLORS.CATGREENLGT,
                });
                setShowConfirmNewPasswordModal(true);

                setTimeout(() => {
                    navigation.navigate('Signin');
                }, 3000);
            } else {
                setResetResultType({
                    messageheader: 'Failed',
                    messageheadercolor: COLORS.CATREDDRK,
                    message: data.message || 'Failed to reset password.',
                    iconname: 'alert-circle',
                    iconcolor: COLORS.CATREDLGT,
                });
                console.error('Error resetting password', data.message);
                setShowConfirmNewPasswordModal(true);
            }
        } catch (error: any) {
            console.error('Error resetting password:', error);
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
                message: error?.response?.data?.message || 'An error occurred while resetting the password.',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            console.error('Error resetting password', error?.response?.data?.message);
            setShowConfirmNewPasswordModal(true);
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
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={{flex: 1}}>
                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1,
                                paddingBottom: 24,
                            }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}>
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
                            <View style={styles.container}>
                                <View style={{flex: 1, alignItems: 'center', marginTop: '22%', width: '100%'}}>
                                <View>
                                    <Svg
                                        height={150}
                                        width={150}
                                        viewBox={`0 0 270 234`}
                                        style={{position: 'absolute', bottom: 0, alignSelf: 'center'}}>
                                        <Path d={hexagonPath} fill={COLORS.AKCRUBLUE} />
                                    </Svg>
                                    <Icon
                                        name="lock-open"
                                        type="ionicon"
                                        size={80}
                                        color={COLORS.MIDORANGE}
                                        style={{marginBottom: '8%'}}
                                    />
                                </View>
                                <Text style={{...FONTS.Title2, marginBottom: '5%', textAlign: 'center', paddingHorizontal: 16}}>
                                    Let's reset your password below
                                </Text>
                                <View style={{width: '90%', alignItems: 'center'}}>
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
                                                placeholder="Choose new password (min 8 characters)"
                                                placeholderTextColor={COLORS.DARKGREY}
                                                style={{
                                                    flex: 1,
                                                    color: COLORS.WHITE,
                                                    fontSize: isTablet() ? 18 : 14,
                                                }}
                                                value={password}
                                                onChangeText={handlePasswordChange}
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
                                                placeholder="Confirm new password"
                                                placeholderTextColor={COLORS.DARKGREY}
                                                style={{
                                                    flex: 1,
                                                    color: COLORS.WHITE,
                                                    fontSize: isTablet() ? 18 : 14,
                                                }}
                                                value={confirmPassword}
                                                onChangeText={handleConfirmPasswordChange}
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
                                    <View style={{alignItems: 'center', marginTop: 12, width: '100%'}}>
                                        <AkcruButtons.LrgButton
                                            variant="auth"
                                            color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                            btnname={'Confirm'}
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                handleConfirmNewPassword();
                                            }}
                                            disabled={!isFormComplete || loading}
                                            loading={loading}
                                        />
                                    </View>
                                </View>
                                </View>
                            </View>
                        </ScrollView>
                        <Modal animationType="fade" transparent={true} visible={showConfirmNewPasswordModal}>
                            <ResetPasswordResultModal
                                closeModal={() => setShowConfirmNewPasswordModal(false)}
                                messageheader={resetResultType.messageheader}
                                messageheadercolor={resetResultType.messageheadercolor}
                                message={resetResultType.message}
                                iconname={resetResultType.iconname}
                                iconcolor={resetResultType.iconcolor}
                            />
                        </Modal>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default ResetPassword;
