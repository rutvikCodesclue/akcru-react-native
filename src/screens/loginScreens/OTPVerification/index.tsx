import {View, Text, ImageBackground, TouchableOpacity, Alert, Modal, TextInput} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import React, {useState, useEffect} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import Svg, {Path} from 'react-native-svg';
import {Icon} from '@rneui/base';
import CodeInput from '../../../components/CodeInput/CodeInput';
import ResendTimer from '../../../components/CodeResendTimer/ResendTimer';
import OTPResultModal from '../../../components/CodeModals/OTPResultModal';
import { supabase } from '../../../../lib/supabase';
import { API } from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../../../components/General/backbutton';


const OTPVerification = ({route}) => {
    const authStore = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); 

    

    
    const email = route.params?.email;
    const phoneNumber = route.params?.phoneNumber;

    const [otp, setOTP] = useState<string>('');

    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    //code length
    const MAX_CODE_LENGTH = 6;
    const [code, setCode] = useState('');
    const [pinReady, setPinReady] = useState(false);
    const [verify, setVerify] = useState(false);

    //email resend
    const [activeResend, setActiveResend] = useState(false);
    const [resendStatus, setResendStatus] = useState('Resend');
    const [resendingEmail, setResendingEmail] = useState(false);
    //OTP Modal
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const [typeOTPModal, setTypeOTPModal] = useState('');

    const handleShowOTPModal = (typeOTPModal: React.SetStateAction<string>) => {
        setTypeOTPModal(typeOTPModal);
        setShowVerifiedModal(true);
    };

    const handleCloseOTPModal = () => {
        if (typeOTPModal === 'success') {
            //do something
        }
        setShowVerifiedModal(false);
    };

    const resendEmail = async triggerTimer => {
        try {
            setResendingEmail(true);

            //make request to backend
            //update setResendStatus() to 'Failed' or 'Sent'

            setResendingEmail(false);
            //hold briefly
            setTimeout(() => {
                setResendStatus('Resent');
                setActiveResend(false);
                triggerTimer();
            }, 5000);
        } catch (error) {
            setResendingEmail(false);
            setResendStatus('Failed');
            Alert.error.message;
        }
    };

    const handleOTPVerification = async () => {
        try {
            setVerify(true);

            
            
            const payload = email ? {email} : {phoneNumber};

            
            const response = await API.post('/v1/user/verifyOTP', {
                ...payload,
                otp: code,
                
            });
            console.log(response.data)

            const data = response.data;

            if (data.success) {
                //console.log('Verification successful', data);
                setVerify(false);
                handleShowOTPModal('success');

                
                
                navigation.navigate('ResetPassword', {
                    email: email,
                    phoneNumber: phoneNumber,
                });
            } else {
                
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification failed', error);
            setVerify(false);
            handleShowOTPModal('failed');
        }
    };

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
                <View style={styles.container}>
                    <BackButton navigation={navigation} />
                    <View style={{flex: 1, alignItems: 'center', marginTop: '30%'}}>
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
                                color={COLORS.LIGHTGREY}
                                style={{marginBottom: '8%'}}
                            />
                        </View>
                        <View style={{marginBottom: 10, marginHorizontal: '5%'}}>
                            <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                                Enter the 6-digit code sent to your email/phone
                            </Text>
                        </View>
                        <View style={{marginVertical: '15%'}}>
                            <CodeInput
                                maxLength={MAX_CODE_LENGTH}
                                code={code}
                                setCode={setCode}
                                setPinReady={setPinReady}
                            />
                        </View>
                        <View>
                            {!verify && pinReady && (
                                <AkcruButtons.LrgButton
                                    color={COLORS.MIDORANGE}
                                    btnname={'Verify'}
                                    onPress={handleOTPVerification}
                                    disabled={false}
                                />
                            )}
                            {!verify && !pinReady && (
                                <AkcruButtons.LrgButton
                                    color={COLORS.DARKGREY}
                                    btnname={'Verify'}
                                    onPress={() => ''}
                                    disabled={true}
                                />
                            )}
                            <View>
                                <ResendTimer
                                    setActiveResend={setActiveResend}
                                    activeResend={activeResend}
                                    resendStatus={resendStatus}
                                    resendingEmail={resendingEmail}
                                    resendEmail={resendEmail}
                                />
                            </View>
                        </View>
                    </View>
                    <Modal animationType="fade" transparent={true} visible={showVerifiedModal}>
                        <OTPResultModal closeModal={handleCloseOTPModal} type={typeOTPModal} />
                    </Modal>
                </View>
            </ImageBackground>
        </View>
    );
};

export default OTPVerification;
