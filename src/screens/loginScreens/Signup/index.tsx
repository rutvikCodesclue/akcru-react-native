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

const TOSModal = ({visible, children}: {visible: boolean, children: any}) => {

  const [showModal, setShowModal] = useState(visible);
  React.useEffect(()=>{
    togglemode()
  }, [visible]);
  const togglemode =()=>{
    if (visible) {
      setShowModal(true)
    }else{
      setShowModal(false)
    }
  };

 return (
   <Modal transparent visible={showModal}>
     <View style={styles.tosmodal}>
       <View style={styles.tosmodalcontainer}>
         {children}
       </View>
     </View>
   </Modal>
 );
};

const Signup = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();

  const [visible, setVisible] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordLengthError, setPasswordLengthError] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const [signupErrorMessage, setSignupErrorMessage] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(!isEmailValid(text));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordLengthError(text.length < 8);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const handleCheckboxChange = (newValue: boolean)=> {
    setIsChecked(newValue);
  };

  const checkPasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkFormCompletion = () => {
    if (
      email &&
      password &&
      confirmPassword &&
      isChecked &&
      isEmailValid(email) // Check email format
    ) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  };

  useEffect(() => {
    checkFormCompletion();
    checkPasswordMatch();
  }, [
    email,
    password,
    confirmPassword,
    isChecked,
  ]);

   const attemptSignup = async () => {
       try {
           setIsLoading(true);

           setLoading(true);
           console.log('Attempting to Signup w/ Email/Password:', email, password);

           // Create an email signup
           const {user, error: signupError} = await useAuthStore.getState().signUpWithEmail(email, password);
           if (signupError) {
               throw new Error(signupError.message || 'Error during signup');
           }

           console.log('Signup Successful!', user);

           // Login through the API
           const {
               user: loggedInUser,
               session,
               error: loginError,
           } = await useAuthStore.getState().loginWithEmail(user.email, password);
           if (loginError || !loggedInUser || !session) {
               throw new Error(loginError.message || 'Error logging in after signup');
           }

           console.log('Login AFTER SIGNUP Successful!', session);
           await useAuthStore.getState().hydrateAuth();
           await useAuthStore.getState().hydrateUser();
           console.log('Hydrated auth and user after successful login and signup', session);

           // Navigate to the next screen on successful signup and login
           navigation.navigate('OnBoard1');
       } catch (error) {
           if (axios.isAxiosError(error)) {
               console.error('Axios error during signup:', {
                   message: error.message,
                   response: error.response?.data,
                   status: error.response?.status,
                   headers: error.response?.headers,
               });

               let userMessage = 'An unexpected error occurred during signup.';
               if (error.response?.status === 400) {
                   userMessage = error.response.data.message || 'Invalid request. Please check your input.';
               } else if (error.response?.status === 401) {
                   userMessage = 'Unauthorized. Please check your credentials.';
               }
               setSignupErrorMessage(userMessage); // Set the error message for the modal
              //  Alert.alert('Signup Error', userMessage);
           } else {
              setSignupErrorMessage('An unexpected error occurred during signup.');
               console.error('Non-Axios error during signup:', error);
               Alert.alert('Signup Error', 'An unexpected error occurred during signup.');
           }
       } finally {
           setLoading(false);
           setIsLoading(false);
       }

   };

  return (
      <View>
          <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
              <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                  <View style={styles.container}>
                      <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
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
                              Welcome to Akcru, please fill out the form below to enjoy your favorite content while
                              earning.
                          </Text>
                      </View>
                      <View style={{alignItems: 'center', marginTop: 20}}>
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

                          <Inputs
                              placeholdername={'Choose Password'}
                              iconname={'lock-closed'}
                              iconcolor={COLORS.LIGHTGREY}
                              secureTextEntry={true}
                              onChangeText={handlePasswordChange}
                              value={password}
                              editable={!loading}
                          />
                          {passwordLengthError && (
                              <Text style={styles.warningText}>Password must be at least 8 characters long</Text>
                          )}
                          <Inputs
                              placeholdername={'Confirm Password'}
                              iconname={'lock-closed'}
                              iconcolor={COLORS.LIGHTGREY}
                              secureTextEntry={true}
                              onChangeText={handleConfirmPasswordChange}
                              value={confirmPassword}
                              editable={!loading}
                          />
                          {passwordError && <Text style={styles.warningText}>Passwords do not match.</Text>}
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
                                              color={COLORS.MIDORANGE}
                                              style={{marginTop: -3}}
                                          />
                                      )}
                                  </View>
                              </TouchableOpacity>
                              <View>
                                  <Text style={styles.checkboxText}>I have read and I agree to the</Text>
                                  <Pressable onPress={() => setVisible(true)}>
                                      <Text style={{...FONTS.Title2, marginLeft: 10}}>terms and conditions</Text>
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
                          <View style={{alignItems: 'center', marginTop: 20}}>
                              <AkcruButtons.LrgButton
                                  color={COLORS.AKCRUBLUE}
                                  btnname={'Next'}
                                  onPress={() => attemptSignup()}
                                  disabled={!isFormComplete || passwordError || emailError || password.length < 8}
                              />
                          </View>
                      </View>
                      <Modal animationType="fade" transparent={true} visible={!!signupErrorMessage}>
                          <ErrorModal
                              closeModal={() => setSignupErrorMessage('')}
                              message={signupErrorMessage}
                              iconcolor={COLORS.CATREDLGT}
                              iconname={'alert-circle'}
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

export default Signup;
