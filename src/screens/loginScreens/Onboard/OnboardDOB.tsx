import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Platform
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
import DateTimePicker from '@react-native-community/datetimepicker';
import {Icon} from '@rneui/base';
import useAuthStore from '../../../stores/auth.store';
import { appVersion } from '../../../../assets/constants/Data';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import LinearGradient from 'react-native-linear-gradient';
import { updateUser } from '../../../lib/api/user.lib';

const OnboardDOB = () => {

const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

const user = useAuthStore(state => state.user);
const {hydrateUser, hydrateAuth} = useAuthStore();

const [showPicker, setShowPicker] = useState(false);

const [date, setDate] = useState<Date>(new Date());
const [dob, setDob] = useState(user?.dateOfBirth);
const [dobModified, setDobModified] = useState('');

const formatDateToDayMonthYear = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', {month: 'long'});
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};

const toggleDatePicker = () => {
    setShowPicker(!showPicker);
};

const onChange = ({type}: {type: string}, selectedDate: Date) => {
    if (type === 'set') {
        const currentDate = new Date(selectedDate);
        currentDate.setHours(0, 0, 0, 0); // Set the time to midnight
        setDate(currentDate);
        //console.log('DOB setDate:', currentDate);

        if (Platform.OS === 'android') {
            toggleDatePicker();
            setDob(currentDate.toISOString()); // Convert to ISO string format with midnight time
            //console.log('DOB setDate to string:', currentDate);
        }
    } else {
        toggleDatePicker();
    }
};

const confirmIOSDate = ({type}: {type: string}, selectedDate: Date) => {
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight
    setDob(currentDate.toISOString()); // Convert to ISO string format with midnight time
    toggleDatePicker();
};

const [userNameError, setUserNameError] = useState(false);
const [isFormComplete, setIsFormComplete] = useState(false);

const checkFormCompletion = () => {
    if (
        dob
    ) {
        setIsFormComplete(true);
    } else {
        setIsFormComplete(false);
    }
};

useEffect(() => {
    checkFormCompletion();
}, [dob]);

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

const calculateAge = (dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const DOBSet = async () => {
    if (!dob) {
        setUserNameError(true);
        return;
    }

    const age = calculateAge(new Date(dob));
    if (age < 17) {
        Alert.alert('Age Requirement', 'You must be at least 17 years old to use this app.');
        return;
    }

    try {
        setIsLoading(true);
        const updatedUser = await updateUser({dob: dob});
        if (updatedUser) {
            //console.log('DOB updated successfully:', updatedUser);
            useAuthStore.setState({user: updatedUser});
            navigation.navigate('OnboardContactList'); // Replace with your next screen
        } else {
            Alert.alert('Update Failed', 'Failed to update date of birth.');
        }
    } catch (error) {
        console.error('Error updating DOB:', error);
        Alert.alert('Error', 'An error occurred while updating your date of birth.');
    } finally {
        setIsLoading(false);
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
                      <View style={{alignItems: 'center', marginTop: 20}}>
                          <AkcruLogo width={200} height={60} />
                          <Text style={{...FONTS.Title2, textAlign: 'center'}}>Enter your date of birth.</Text>
                      </View>
                      <View style={{alignItems: 'center', marginTop: 10}}>
                          {showPicker && (
                              <DateTimePicker
                                  display="spinner"
                                  mode="date"
                                  value={date}
                                  onChange={onChange}
                                  style={styles.datepicker}
                              />
                          )}
                          {showPicker && Platform.OS === 'ios' && (
                              <View
                                  style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-around',
                                  }}>
                                  <TouchableOpacity
                                      style={[styles.iosbutton, styles.iospickerbutton]}
                                      onPress={toggleDatePicker}>
                                      <Text style={{...FONTS.paragraph1, color: COLORS.BLACK}}>Cancel</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                      style={[styles.iosbutton, styles.iospickerbutton]}
                                      onPress={confirmIOSDate}>
                                      <Text style={{...FONTS.paragraph1, color: COLORS.BLACK}}>Confirm</Text>
                                  </TouchableOpacity>
                              </View>
                          )}
                          {!showPicker && (
                              <Pressable onPress={toggleDatePicker}>
                                  <Inputs
                                      placeholdername={'DOB'}
                                      iconname={'calendar'}
                                      iconcolor={COLORS.LIGHTGREY}
                                      secureTextEntry={false}
                                      onChangeText={(text: string) => {
                                          //console.log('Input Changed:', text); // Log input changes
                                          setDob(text); // Call handleDobChange
                                      }}
                                      value={dob ? formatDateToDayMonthYear(new Date(dob)) : 'Select date'}
                                      editable={false}
                                      onPress={toggleDatePicker}
                                  />
                              </Pressable>
                          )}
                          <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.PINK}}>
                              You must be atleast 17 years old to use this app.
                          </Text>
                      </View>
                      <View>
                          <View style={{alignItems: 'center', marginTop: 20}}>
                              <AkcruButtons.LrgButton
                                  color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                  btnname={'Next'}
                                  onPress={() => DOBSet()}
                                  disabled={!isFormComplete}
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

export default OnboardDOB;
