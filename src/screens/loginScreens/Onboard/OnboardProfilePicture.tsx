import {
  View,
  Text,
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
import useAuthStore from '../../../stores/auth.store';
import { appVersion } from '../../../../assets/constants/Data';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import { API } from '../../../clients/api.client';
import { capitalizeFirstLetterOfString } from '../../../util/util';
import LinearGradient from 'react-native-linear-gradient';
import { MediaType, launchImageLibrary } from 'react-native-image-picker';
import HexAvatar from '../../../components/HexAvatar';
import { updateUserProfilePicture } from '../../../lib/api/user.lib';

const OnboardProfilePicture = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();

const [isFormComplete, setIsFormComplete] = useState(false);

  const PictureSet = async () => {
        navigation.navigate('OnboardArchetype');
      };

      const [selectImage, setSelectImage] = useState('');

      const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

      const selectProfileImage = async () => {
          let options = {
              mediaType: 'photo' as MediaType,
              storageOptions: {
                  path: 'image',
              },
          };

          //console.log('select picture button');

          // Add a flag to prevent multiple invocations
          let callbackExecuted = false;

          launchImageLibrary(options, async response => {
              if (response && !response.didCancel && response.assets) {
                  // Check if the response is defined, not canceled, and has assets
                  if (callbackExecuted) {
                      return;
                  }

                  // Set the flag to true to indicate the callback has been executed
                  callbackExecuted = true;
                  //console.log('uri:', response.assets[0].uri);
                  //console.log('filesize:', response.assets[0].fileSize);
                  const selectedImage = response.assets[0].uri;

                  // Get the type and name for the selected image
                  const imageType = response.assets[0].type;
                  const imageName = response.assets[0].fileName;

                  // Check the size of the selected image
                  const imageSizeInBytes = response.assets[0].fileSize;
                  const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

                  if (imageSizeInBytes !== undefined) {
                        const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

                  if (imageSizeInBytes > maxSizeInBytes) {
                      // Show size error modal
                      setShowSizeErrorModal(true);
                  } else {
                      // Call the API function to update the user's profile picture
                      const updatedUserProfilePicture = await updateUserProfilePicture({
                          uri: selectedImage,
                          type: imageType,
                          name: imageName,
                      });

                      if (updatedUserProfilePicture) {
                          // Set the new profile picture immediately
                          //console.log('updatedUserProfilePicture:', updatedUserProfilePicture);
                          setSelectImage(updatedUserProfilePicture.profilePicture || '');
                      } else {
                          // Handle failure or display an error message
                          //console.log('Failed to update profile picture');
                      }
                  }}
              }
          });
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
                          <Text style={{...FONTS.Title1, textAlign: 'center'}}>
                              Add a profile picture. Obscenity will not be tolerated and will be swiftly removed
                          </Text>
                      </View>
                      <View style={{alignItems: 'center', marginTop: 20}}>
                          <HexAvatar source={{uri: selectImage}} size={100} bordercolor={COLORS.AKCRUBLUE} />
                      </View>
                      <View>
                          <TouchableOpacity
                              onPress={() => {
                                  selectProfileImage();
                              }}>
                              <Text
                                  style={{
                                      ...FONTS.Title2AkcruBlue,
                                      marginTop: 10,
                                      color: COLORS.AKCRUBLUE,
                                      textAlign: 'center',
                                  }}>
                                  Pick a profile photo
                              </Text>
                          </TouchableOpacity>
                      </View>
                      {/* Picture Size Error Modal*/}
                      <Modal animationType="fade" transparent={true} visible={showSizeErrorModal}>
                          <View
                              style={{
                                  flex: 1,
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                              }}>
                              <View
                                  style={{
                                      backgroundColor: COLORS.AKCRUBACKGROUND,
                                      padding: 20,
                                      borderRadius: 10,
                                      alignItems: 'center',
                                      marginHorizontal: 15,
                                  }}>
                                  <Text
                                      style={{
                                          ...FONTS.Title3,
                                          marginBottom: 10,
                                          textAlign: 'center',
                                      }}>
                                      {`Image is too large. Please select an image under 2MB.`}
                                  </Text>
                                  <TouchableOpacity
                                      onPress={() => {
                                          setShowSizeErrorModal(false);
                                      }}>
                                      <Text
                                          style={{
                                              ...FONTS.Title2,
                                              marginBottom: 10,
                                              textAlign: 'center',
                                              color: COLORS.MIDORANGE,
                                          }}>
                                          {`Close`}
                                      </Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </Modal>
                      <View>
                          <View style={{alignItems: 'center', marginTop: 20}}>
                              <AkcruButtons.LrgButton
                                  color={COLORS.AKCRUBLUE}
                                  btnname={'Next'}
                                  onPress={() => PictureSet()}
                                  disabled={false}
                              />
                          </View>
                      </View>
                  </View>
                  <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
              </KeyboardAvoidingView>
          </ImageBackground>
      </View>
  );
};

export default OnboardProfilePicture;
