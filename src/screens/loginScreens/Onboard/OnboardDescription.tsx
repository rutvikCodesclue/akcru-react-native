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
import { updateUser } from '../../../lib/api/user.lib';

const OnboardDescription = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const user = useAuthStore(state => state.user);
    const [description, setDescription] = useState('');

     const [loading, setLoading] = useState(false);

    const updateDescription = async () => {
        try {
            setLoading(true);

            // You can add any description validation logic here if needed

            // Call the updateUser function to send the updated data to the backend
            const updatedUser = await updateUser({
                description: description,
            });

            if (updatedUser) {
                console.log('Description updated successfully:', updatedUser);
                // Assuming useAuthStore is for state management
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    currentUser.description = description; // Update the description in the state
                    useAuthStore.setState({user: currentUser});
                }
                navigation.navigate('OnboardDOB'); // Replace 'NextScreen' with your actual next screen's name
            } else {
                Alert.alert('Failed to update description', 'Please try again later.');
            }
        } catch (error) {
            console.error('Error updating description:', error);
            Alert.alert('Error', 'An error occurred while updating your description.');
        } finally {
            setLoading(false);
        }
    };



const [showEmailModal, setShowEmailModal] = useState(false);
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
                      <View style={{alignItems: 'center', marginTop: 20}}>
                          <AkcruLogo width={200} height={60} />
                          <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                              Tell the crummunity a little about yourself.
                          </Text>
                      </View>
                      <View style={{alignItems: 'center', marginTop: 10}}>
                          <View style={styles.input}>
                              <TextInput
                                  placeholder={'Tell us about yourself...'}
                                  placeholderTextColor={COLORS.DARKGREY}
                                  style={styles.textinput}
                                  secureTextEntry={false}
                                  onChangeText={text => {
                                      // Limit the description to 150 characters
                                      if (text.length <= 250) {
                                          setDescription(text);
                                      }
                                  }}
                                  value={description} // Use the modified value in the TextInput
                                  multiline={true}
                                  maxLength={200} // Set the maximum character limit
                                  editable={true}
                              />
                          </View>
                          {/* <Inputs
                              placeholdername={'Email'}
                              iconname={'mail'}
                              iconcolor={COLORS.LIGHTGREY}
                              secureTextEntry={false}
                              onChangeText={handleEmailChange}
                              value={email}
                              editable={!loading}
                          /> */}
                      </View>
                      <View>
                          <View style={{alignItems: 'center', marginTop: 20}}>
                              <AkcruButtons.LrgButton
                                  color={COLORS.AKCRUBLUE}
                                  btnname={'Next'}
                                  onPress={() => updateDescription()}
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

export default OnboardDescription;
