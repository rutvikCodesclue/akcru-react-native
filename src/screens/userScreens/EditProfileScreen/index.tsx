import {useState, useEffect, useRef, useCallback} from 'react';
import {supabase} from '../../../../lib/supabase';
import styles from './styles';
import {
  View,
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Button,
  Modal,
} from 'react-native';
import {Session} from '@supabase/supabase-js';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import {Icon, Avatar} from '@rneui/base';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import * as ImagePicker from "expo-image-picker";
import { API } from "../../../clients/api.client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../../../stores/auth.store";

const gallery = FAKE_USER_PROFILES[0].gallery;

export default function EditProfile({session}: {session: Session}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [desc, setDesc] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gallery, setGallery] = useState(FAKE_USER_PROFILES[0].gallery);
  const [username, setUsername]= useState("")

  const getUserInfo = async () => {

    // get access token from local storage
    const accessToken = await AsyncStorage.getItem("access_token")
    // console.log("Access Token:", accessToken);
    
    // make authenticated request to get user info
    const getUserInfoRequest = await API.get("/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    // 
    setUsername(getUserInfoRequest.data.user.username)
    // setAvatar(getUserInfoRequest.data.user.avatar)

    
  }

  const [response, setResponse] = React.useState<any>(null);

  console.log('Attempting to Signup w/ Email/Password userName:', userName);
  useEffect(() => {
    getUserInfo()
    // if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      let {data, error, status} = await supabase
        .from('profiles')
        .select(`userName, desc, avatar_url`)
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUserName(data.userName);
        setDesc(data.desc);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function UpdateProfile({
    userName,
    desc,
  }: {
    userName: string;
    desc: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        userName,
        desc,

        updated_at: new Date(),
      };

      let {error} = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }

      // update the user profile and set the new username
      const updatedUsername = updateUser.data.user.username;
      setUsername(updatedUsername.data.user.username)
      getProfile()

    } catch (error) {

    } finally {
      setLoading(false);
    }
  }

  const [image, setImage] = useState(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState(null);

  const deleteImage = index => {
    setImageToDeleteIndex(index);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteImage = () => {
    // Delete the image at the specified index
    const updatedGallery = [...gallery];
    updatedGallery.splice(imageToDeleteIndex, 1);
    setGallery(updatedGallery);

    // Hide the confirmation modal
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    // Hide the confirmation modal
    setShowDeleteConfirmation(false);
  };

  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSelectImage = imageUri => {
    setSelectedImage(imageUri);
    setAvatarUrl(imageUri); // Set the selected image URI to avatarUrl
    setShowImagePickerModal(false);
  };

   const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

   const handleUpdateProfile = () => {
     // Show the confirmation modal
     setShowUpdateConfirmation(true);
   };

   const handleConfirmUpdate = () => {
     // Hide the confirmation modal
     setShowUpdateConfirmation(false);

     // Call the UpdateProfile function to update the profile information
     UpdateProfile({userName, desc});
   };

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View style={{zIndex: 20}}>
          <Header />
        </View>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.pop()}>
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
              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>EDIT PROFILE</Text>
            <View style={{alignItems: 'center'}}>
              <Avatar
                rounded
                size={125}
                source={{
                  uri: avatarUrl || FAKE_USER_PROFILES[0].userPicture,
                }}
                avatarStyle={{
                  borderWidth: 2,
                  borderColor: FAKE_USER_PROFILES[0].avatarbordercolor,
                }}
              />
              <TouchableOpacity onPress={() => setShowImagePickerModal(true)}>
                <Text
                  style={{
                    ...FONTS.Title2AkcruBlue,
                    marginTop: 10,
                    color: COLORS.MIDORANGE,
                  }}>
                  Edit profile photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modal to Select Profile Photo */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={showImagePickerModal}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View
                  style={{
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    padding: 15,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}>
                    <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between', alignContent: 'center', marginBottom: 10}}>
                       <TouchableOpacity
                    onPress={() => setShowImagePickerModal(false)}
                    >
                    <Icon
                      name="close-circle"
                      type="ionicon"
                      color={COLORS.CATREDLGT}
                      size={25}
                    />
                  </TouchableOpacity>
                  <Text style={{...FONTS.Title3}}>
                    Select Profile Photo
                  </Text>
                    </View>
                 
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{flexDirection: 'row'}}>
                    {gallery.map((imageUri, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectImage(imageUri)}>
                          <Image
                            source={{uri: imageUri}}
                            style={[
                              styles.galleryImage,
                              selectedImage === imageUri && {
                                borderColor: COLORS.AKCRUBLUE,
                                borderWidth: 2,
                              },
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
          <View style={styles.gallerycontainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryImagesContainer}
              bounces={false}>
              {gallery.map((imageUri, index) => {
                return (
                  <View style={{flexDirection: 'row'}} key={index}>
                    <Image
                      source={{uri: imageUri}}
                      style={styles.galleryImage}
                    />
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: -3,
                        zIndex: 20,
                      }}
                      onPress={() => deleteImage(index)}>
                      <Icon
                        name="close-circle"
                        type="ionicon"
                        color={COLORS.CATREDLGT}
                        size={25}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            <Modal
              animationType="fade"
              transparent={true}
              visible={showDeleteConfirmation}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View
                  style={{
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    padding: 20,
                    borderRadius: 10,
                  }}>
                  <View style={{alignItems: 'center'}}>
                    <Text style={{...FONTS.Title3, marginBottom: 10}}>
                      Confirm Deletion
                    </Text>
                    <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                      Are you sure you want to delete this picture?
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      onPress={handleCancelDelete}
                      style={{
                        backgroundColor: 'red',
                        padding: 10,
                        borderRadius: 5,
                      }}>
                      <Text style={{...FONTS.Title3}}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteImage}
                      style={{
                        backgroundColor: 'green',
                        padding: 10,
                        borderRadius: 5,
                      }}>
                      <Text style={{...FONTS.Title3}}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              onPress={() => {
                launchImageLibrary(
                  {
                    selectionLimit: 0,
                    mediaType: 'photo',
                    includeBase64: false,
                  },
                  setResponse,
                );
              }}>
              <Text
                style={{
                  ...FONTS.Title2AkcruBlue,
                  marginTop: 15,
                  textAlign: 'center',
                  color: COLORS.MIDORANGE,
                }}>
                Upload a picture from your phone
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.inputlabel}>Username</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={username}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                onChangeText={text => setUserName(text)}
                value={userName || ''}
              />
            </View>
          </View>

          <View>
            <Text style={styles.inputlabel}>Description</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={FAKE_USER_PROFILES[0].userDesc}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                onChangeText={text => setDesc(text)}
                value={desc || ''}
              />
            </View>
          </View>

          <View>
            <Text style={styles.inputlabel}>Email</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={FAKE_USER_PROFILES[0].email}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                value={session?.user?.email}
              />
            </View>
          </View>

          <View style={{alignItems: 'center', marginTop: 20}}>
            <AkcruButtons.LrgButton
              btnname={loading ? 'Loading ...' : 'Update'}
              disabled={false}
              color={COLORS.AKCRUBLUE}
              onPress={handleUpdateProfile} // Show the confirmation modal
            />
          </View>

          {/* Confirmation Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showUpdateConfirmation}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <View
                style={{
                  backgroundColor: COLORS.AKCRUBACKGROUND,
                  padding: 20,
                  borderRadius: 10,
                }}>
                <View style={{alignItems: 'center'}}>
                  <Text style={{...FONTS.Title3, marginBottom: 10}}>
                    Confirm Update
                  </Text>
                  <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                    Are you sure you want to update your profile?
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    onPress={() => setShowUpdateConfirmation(false)} // Hide the confirmation modal
                    style={{
                      backgroundColor: 'red',
                      padding: 10,
                      borderRadius: 5,
                    }}>
                    <Text style={{...FONTS.Title3}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmUpdate} // Confirm the update
                    style={{
                      backgroundColor: 'green',
                      padding: 10,
                      borderRadius: 5,
                    }}>
                    <Text style={{...FONTS.Title3}}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <View style={{alignItems: 'center', marginVertical: 20}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountSettings')}>
              <Text style={styles.settingslabel}>Account Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              logout()
              navigation.navigate("Signin")
            }}>
              <Text style={[styles.settingslabel, styles.mt20]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
