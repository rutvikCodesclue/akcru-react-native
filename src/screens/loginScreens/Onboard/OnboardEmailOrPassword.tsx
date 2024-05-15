import {View, Text, ImageBackground, Modal, KeyboardAvoidingView, ActivityIndicator, TextInput} from 'react-native';
import React, {useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
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
import LinearGradient from 'react-native-linear-gradient';

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
        setEmail(text.toLowerCase());
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
                <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                            {email && !phoneNumber && (
                                <View>
                                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                        Enter your mobile number below.
                                    </Text>
                                </View>
                            )}
                            {!email && phoneNumber && (
                                <View>
                                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>Enter your email below.</Text>
                                </View>
                            )}
                        </View>
                        {email && !phoneNumber && (
                            <View style={{alignItems: 'center', marginTop: 10}}>
                                <View style={styles.phoneinput}>
                                    <Icon
                                        name={'call'}
                                        type="ionicon"
                                        size={20}
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
                                {phoneError && <Text style={styles.warningText}>Invalid mobile number</Text>}
                            </View>
                        )}

                        {!email && phoneNumber && (
                            <View style={{alignItems: 'center', marginTop: 10}}>
                                <Inputs
                                    placeholdername={'Email'}
                                    iconname={'mail'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={handleEmailChange}
                                    value={Email}
                                    editable={!loading}
                                />
                                {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                            </View>
                        )}
                        <View>
                            {email && !phoneNumber && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.LrgButton
                                        color={COLORS.PURPLE}
                                        btnname={'Confirm your mobile number'}
                                        onPress={() => {
                                            console.log('phone =>', '1' + phone);
                                            navigation.navigate('OnboardPassword', {email: email, phoneNumber: phone});
                                        }}
                                        disabled={phoneError || !phone}
                                    />
                                </View>
                            )}
                            {!email && phoneNumber && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.LrgButton
                                        color={COLORS.PURPLE}
                                        btnname={'Confirm your email'}
                                        onPress={() =>
                                            navigation.navigate('OnboardPassword', {
                                                email: Email,
                                                phoneNumber: phoneNumber,
                                            })
                                        }
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
