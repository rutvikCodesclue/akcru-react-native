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
  ActivityIndicator
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
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();
const [email, setEmail] = useState<string>('');
const [loading, setLoading] = useState<boolean>(false);
const [emailError, setEmailError] = useState(false);
const [isFormComplete, setIsFormComplete] = useState(false);

const [visible, setVisible] = useState(false);
const [isChecked, setIsChecked] = useState(false);

const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Toggle the checked state
};

// Enhanced Email Validation
const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(!isEmailValid(text));
};

const checkFormCompletion = () => {
    if (
        email &&
        isEmailValid(email) && // Check email format
        isChecked // Check if the terms and conditions checkbox is checked
    ) {
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
  
  const [isLoading, setIsLoading] = useState(false);

  const [signupErrorMessage, setSignupErrorMessage] = useState('');

  const SendOTP = async () => {
      if (!isEmailValid(email)) {
          setEmailError(true);
          return;
      }

      setLoading(true);
      try {
          // Replace the following line with your API call to send OTP
          const {data, error} = await API.post('/v1/auth/sentOTP', {email});

          if (error) {
              setResetResultType({
                  messageheader: 'Error',
                  messageheadercolor: COLORS.CATREDDRK,
                  message: error.message,
                  iconname: 'alert-circle',
                  iconcolor: COLORS.CATREDLGT,
              });
          } else {
              setResetResultType({
                  messageheader: 'Success',
                  messageheadercolor: COLORS.CATGREENDRK,
                  message: 'OTP has been sent to your email.',
                  iconname: 'send',
                  iconcolor: COLORS.CATGREENLGT,
              });

              // Navigate to otpVerification screen after showing the success message
              setTimeout(() => {
                  navigation.navigate('OTPVerificationSignup', {email});
              }, 3000); // 5 seconds delay
          }

          setShowEmailModal(true);
      } catch (error) {
          setResetResultType({
              messageheader: 'Error',
              messageheadercolor: COLORS.CATREDDRK,
              message: error.response.data.message || 'Error while sending OTP' ,
              iconname: 'alert-circle',
              iconcolor: COLORS.CATREDLGT,
          });
          setShowEmailModal(true);
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
                              Welcome to Akcru first things first, lets verify you through your email below.
                          </Text>
                      </View>
                      <View style={{alignItems: 'center', marginTop: 10}}>
                          <Inputs
                              placeholdername={'Email'}
                              iconname={'mail'}
                              iconcolor={COLORS.LIGHTGREY}
                              secureTextEntry={false}
                              onChangeText={handleEmailChange}
                              value={email}
                              editable={!loading}
                          />
                          {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                          <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.PINK}}>
                              You will be sent a one-time-password to this email address.
                          </Text>
                      </View>
                      <View>
                          <View style={styles.checkboxContainer}>
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
                                      <Text style={{...FONTS.Title2, color: COLORS.PINK}}>terms and conditions</Text>
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
                              <View style={{height: 20}}></View>
                          </TOSModal>
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
                                  btnname={'Verify with mobile number'}
                                  onPress={() => navigation.navigate('OnboardPhone', {email})}
                                  disabled={false}
                              />
                          </View>
                      </View>
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
          </ImageBackground>
      </View>
  );
};

export default OnboardEmail;
