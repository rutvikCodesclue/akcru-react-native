import {View, Text, ImageBackground, TouchableOpacity, Modal, Pressable, StyleSheet, Platform, TextInput, ActivityIndicator} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState} from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_BUTTON_THEME, AUTH_TEXT_THEME, AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/base';
import Svg, {Path} from 'react-native-svg';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {API} from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';
import {AkcruLogo} from '../../../../assets/svg';
import {isTablet} from '../../../../assets/constants/theme';

const smlIconSize = isTablet() ? 28 : 20;
const svgSize = isTablet() ? 200 : 150;
const lrgIconSize = isTablet() ? 110 : 80;
const iconMargin = isTablet() ? '5%' : '8%';

const PhoneForgotPassword = () => {
    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);


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

      const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

      //reset password modal
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

            const {data, error} = await API.post('/v1/user/sendOTP', {phoneNumber: phone});

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

                setTimeout(() => {
                    navigation.navigate('OTPVerification', {phoneNumber: phone});
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
                                            colors={[COLORS.AKCRUBACKGROUND, COLORS.TRANSPARENT, COLORS.AKCRUBACKGROUND]}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                height: SIZES.ScreenHeight,
                                            }}
                                        />
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
                    <View style={{flex: 1, alignItems: 'center', marginTop: '35%'}}>
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
                        <Text style={{...FONTS.Title1, color: COLORS.PINK, marginTop: 30}}>
                            Forgot your password?
                        </Text>
                        <Text style={{...FONTS.paragraph2, marginTop: 10}}>Enter your phone number below</Text>
                        <View style={{marginBottom: 10}}>
                            <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
                                <BlurView
                                    style={StyleSheet.absoluteFill}
                                    blurType="light"
                                    blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                    reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                />
                                <View style={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}>
                                    <Icon name="call" type="ionicon" size={smlIconSize} color={COLORS.LIGHTGREY} style={{marginRight: 8}} />
                                    <Text style={{...FONTS.paragraph2, color: COLORS.LIGHTGREY, marginRight: 4}}>+1</Text>
                                    <TextInput
                                        placeholder="234-456-7890"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={{...FONTS.paragraph2, color: COLORS.LIGHTGREY, flex: 1, paddingVertical: 0}}
                                        secureTextEntry={false}
                                        onChangeText={handlePhoneNumberChange}
                                        value={phone}
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        editable={true}
                                    />
                                </View>
                            </View>
                            {phoneError && <Text style={styles.warningText}>Invalid phone number</Text>}
                        </View>

                        <View style={{marginVertical: 10}}>
                            <TouchableOpacity
                                onPress={SendOTP}
                                disabled={!isFormComplete || loading}
                                style={{
                                    width: AUTH_BUTTON_THEME.width,
                                    height: AUTH_BUTTON_THEME.getHeight(),
                                    borderRadius: AUTH_BUTTON_THEME.borderRadius,
                                    overflow: 'hidden',
                                }}>
                                <LinearGradient
                                    colors={AUTH_BUTTON_THEME.colors}
                                    start={AUTH_BUTTON_THEME.start}
                                    end={AUTH_BUTTON_THEME.end}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: AUTH_BUTTON_THEME.borderRadius,
                                    }}>
                                    <Text style={AUTH_TEXT_THEME.buttonLabel}>
                                        Send OTP
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={{...FONTS.Title1, color: COLORS.PINK, marginTop: 20}}>
                                Enter your email instead
                            </Text>
                        </Pressable>
                    </View>
                    <Modal animationType="fade" transparent={true} visible={loading}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_50,
                            }}>
                            <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                            <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Sending OTP...</Text>
                        </View>
                    </Modal>
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
                </View>
            </ImageBackground>
        </View>
    );
};

export default PhoneForgotPassword;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
