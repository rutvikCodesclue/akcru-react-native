import {View, Text, ImageBackground, TouchableOpacity, ScrollView, Modal, Alert, TextInput} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/base';
import Svg, {Path} from 'react-native-svg';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import { API } from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';

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
                 setShowPasswordResetModal(true);
                
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
        <ScrollView>
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
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{flex: 1, alignItems: 'center', marginTop: '45%'}}>
                        <View>
                            <Svg
                                height={150}
                                width={150}
                                viewBox={`0 0 270 234`}
                                style={{position: 'absolute', bottom: 0, alignSelf: 'center'}}>
                                <Path d={hexagonPath} fill={COLORS.AKCRUBLUE} />
                            </Svg>
                            <Icon
                                name="key"
                                type="ionicon"
                                size={80}
                                color={COLORS.LIGHTGREY}
                                style={{marginBottom: '8%'}}
                            />
                        </View>
                        <Text style={{...FONTS.Title2, color: COLORS.PINK}}>Forgot your password?</Text>
                        <Text style={{...FONTS.Title2, marginBottom: '5%'}}>Enter your phone number below</Text>
                        <View style={{marginTop: 10, marginBottom: 20}}>
                            <View style={styles.input}>
                                <Icon
                                    name={'call'}
                                    type="ionicon"
                                    size={20}
                                    color={COLORS.LIGHTGREY}
                                    style={{marginRight: 5}}
                                />
                                    <Text style={styles.textinputprefix}>+1</Text>
                                {/* <TextInput
                                    
                                    placeholder="1-234-456-7890"
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={handlePhoneNumberChange}
                                    value={phone}
                                    keyboardType="phone-pad"
                                    editable={true}
                                /> */}
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
                            {phoneError && <Text style={styles.warningText2}>Invalid phone number</Text>}
                        </View>

                        <AkcruButtons.LrgButton
                            color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                            btnname={'Send OTP'}
                            onPress={SendOTP}
                            disabled={!isFormComplete || loading}
                        />
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
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

export default PhoneForgotPassword;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
