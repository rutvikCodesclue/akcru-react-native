import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import styles from './styles';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { AkcruLogo } from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import {Icon} from '@rneui/base';
import Tos from './tos';
import useAuthStore from '../../../stores/auth.store';
import { appVersion } from '../../../../assets/constants/Data';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import LinearGradient from 'react-native-linear-gradient';
import { API } from '../../../clients/api.client';

const OnboardPhone = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Phone Number Validation
    const isPhoneValid = (phone: string) => {
        // Add your phone number validation logic here
        // Example: return true if phone number length is 10 digits
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
           // Replace the following line with your API call to send OTP
           const {data, error} = await API.post('/v1/auth/sentOTP', {phoneNumber: "1"+phone});

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
               // Navigate to otpVerification screen after showing the success message
               setTimeout(() => {
                   navigation.navigate('OTPVerificationSignup', {phoneNumber: phone});
               }, 3000); // 5 seconds delay
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
                <LinearGradient
                    // Background Linear Gradient
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
                        <TouchableOpacity onPress={() => navigation.navigate('Signin')} style={styles.backbutton}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back to Signin</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Welcome to Akcru first things first, lets verify you through your mobile number below.
                            </Text>
                        </View>
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
                                    // mask="+1-999-999-9999"
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
                            {phoneError && <Text style={styles.warningText}>Invalid mobile number</Text>}
                            <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.PINK}}>
                                You will be sent a one-time-password to this mobile number.
                            </Text>
                        </View>
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Send OTP'}
                                    onPress={() => SendOTP()}
                                    disabled={!isFormComplete}
                                />
                            </View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={COLORS.PINK}
                                    btnname={'Verify with email'}
                                    onPress={() => navigation.navigate('OnboardEmail')}
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
