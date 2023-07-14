import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Platform,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import { AkcruLogo } from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import {Icon} from '@rneui/base';
import {supabase} from '../../../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import Tos from './tos';


const TOSModal = ({visible, children}) => {

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
  
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  
  const [loading, setLoading] = useState<boolean>(false);

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const toggleDatePicker =()=>{
    setShowPicker(!showPicker);
  };

  const onChange = ({type}, selectedDate ) => {
    if (type == "set") {
      const currentDate = selectedDate; 
      setDate(currentDate);

      if (Platform.OS === 'android') {
        toggleDatePicker();
        setDob(currentDate.toDateString())
      }
    } else { toggleDatePicker()}
  };
 
  const handleUserNameChange = text => {
    setUserName(text);
  };

  const handleEmailChange = text => {
    setEmail(text);
    setEmailError(!isEmailValid(text));
  };

  const handleDobChange = text => {
    setDob(text);
  };

  const handlePasswordChange = text => {
    setPassword(text);
  };

  const handleConfirmPasswordChange = text => {
    setConfirmPassword(text);
  };

  const handleCheckboxChange = newValue => {
    setIsChecked(newValue);
  };

  const checkPasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const isEmailValid = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkFormCompletion = () => {
    if (
      userName &&
      email &&
      dob &&
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
    dob,
    password,
    confirmPassword,
    isChecked,
    userName,
  ]);

  const attemptSignup = async () => {
    // Calculate the minimum date for 18 years ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 18);

    // Check if the selected date of birth is valid
    if (date > minDate) {
      alert('You must be 18 years or older to sign up.');
      return;
    }

    setLoading(true);
    console.log(
      'Attempting to Signup w/ Email/Password:',
      email,
      password,
      userName,
    );

    const {error} = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) console.error(error.message);
    if (!error) {
      alert('Signup Successful!');

      setLoading(false);
      navigation.navigate('ClientTabNavigator');
      // FIXME: push to log in page
      // navigation.navigate("Signin");
    }
  };

  return (
    <SafeAreaView>
      <ImageBackground
        style={styles.bgimage}
        source={imageindex.BgImageSM}
        resizeMode={'cover'}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{flex: 1, marginBottom: 50}}>
          <ScrollView>
            <View style={styles.container}>
              <TouchableOpacity
                onPress={() => navigation.pop()}
                style={styles.backbutton}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Icon
                    name="chevron-back"
                    type="ionicon"
                    size={20}
                    color={COLORS.LIGHTGREY}
                  />
                  <Text style={{...FONTS.Title3, marginLeft: 5}}>
                    Back to Signin
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{alignItems: 'center', marginTop: 20}}>
                <AkcruLogo width={200} height={60} />
                <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                  Welcome to Akcru, please fill out the form below to enjoy your
                  favorite content while earning.
                </Text>
              </View>

              <View style={{alignItems: 'center', marginTop: 20}}>
                <Inputs
                  placeholdername={'User Name'}
                  iconname={''}
                  iconcolor={COLORS.LIGHTGREY}
                  secureTextEntry={false}
                  onChangeText={handleUserNameChange}
                  value={userName}
                />
                <Inputs
                  placeholdername={'Email'}
                  iconname={'mail'}
                  iconcolor={COLORS.LIGHTGREY}
                  secureTextEntry={false}
                  onChangeText={handleEmailChange}
                  value={email}
                />
                {emailError && (
                  <Text style={styles.warningText}>Invalid email format</Text>
                )}

                {showPicker && (
                  <DateTimePicker
                    display="spinner"
                    mode="date"
                    value={date}
                    onChange={onChange}
                  />
                )}

                {!showPicker && (
                  <Pressable onPress={toggleDatePicker}>
                    <Inputs
                      placeholdername={'DOB'}
                      iconname={'calendar'}
                      iconcolor={COLORS.LIGHTGREY}
                      secureTextEntry={false}
                      onChangeText={setDob}
                      value={dob}
                      editable={false}
                    />
                  </Pressable>
                )}

                <Inputs
                  placeholdername={'Choose Password'}
                  iconname={'lock-closed'}
                  iconcolor={COLORS.LIGHTGREY}
                  secureTextEntry={true}
                  onChangeText={handlePasswordChange}
                  value={password}
                />
                <Inputs
                  placeholdername={'Confirm Password'}
                  iconname={'lock-closed'}
                  iconcolor={COLORS.LIGHTGREY}
                  secureTextEntry={true}
                  onChangeText={handleConfirmPasswordChange}
                  value={confirmPassword}
                />
                {passwordError && (
                  <Text style={styles.warningText}>
                    Passwords do not match.
                  </Text>
                )}
              </View>

              <View>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    onPress={() => handleCheckboxChange(!isChecked)}>
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
                    <Text style={styles.checkboxText}>
                      I have read and I agree to the
                    </Text>
                    <Pressable onPress={() => setVisible(true)}>
                      <Text style={{...FONTS.Title2, marginLeft: 10}}>
                        terms and conditions
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <TOSModal visible={visible}>
                  <View>
                    <Pressable onPress={()=> setVisible(false)}>
                      <Icon name={'close'} color={COLORS.LIGHTGREY} />
                    </Pressable>
                  </View>
                  <ScrollView>
                    <Tos />
                  </ScrollView>
                  <View style={{height: 20 }}></View>
                </TOSModal>
                <View style={{alignItems: 'center', marginTop: 20}}>
                  <AkcruButtons.LrgButton
                    color={COLORS.AKCRUBLUE}
                    btnname={'Next'}
                    onPress={() => attemptSignup()}
                    disabled={!isFormComplete || passwordError || emailError}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Signup;
