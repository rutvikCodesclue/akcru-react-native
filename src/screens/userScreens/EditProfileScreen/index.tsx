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
  FlatList,
  ImageBackground,
} from 'react-native';
import {Session} from '@supabase/supabase-js';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import {Icon, Avatar} from '@rneui/base';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';

import React from 'react';
import {ImagePickerResponse, launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import * as ImagePicker from "expo-image-picker";
import { API } from "../../../clients/api.client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../../../stores/auth.store";
import InputsLrg from '../../../components/inputLrg';
import { MOVIE_GENRES } from '../../../../assets/constants/Data';
import { archetypeMapping } from '../../../../assets/constants/archetypeMapping';
import imageindex from '../../../../assets/images/imageindex';
import { updateUserProfilePicture } from '../../../lib/api/user.lib';

const gallery = FAKE_USER_PROFILES[0].gallery;

const handleImageUpload = async (res: ImagePickerResponse) => {
    // console.log('Image Upload Response:', res);
    
    if (res.assets) {
        const uri = res.assets[0].uri 
        const fileName = res.assets[0].fileName 
        const type = res.assets[0].type 

        if (uri && fileName && type) {
            // call the api to upload the file for profile picture
            const result = await updateUserProfilePicture({ 
                uri, 
                name: fileName, 
                type 
            })

            if (result) {
                console.log('Image Upload Result:', result);
            }
        }
    }
}

export default function EditProfile({session}: {session: Session}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  // get user from auth store, also get the logout function
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { hydrateUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [desc, setDesc] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gallery, setGallery] = useState(FAKE_USER_PROFILES[0].gallery);
  const [emailError, setEmailError] = useState(false);
  const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});


    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            console.log('Edit Profile Screen focused [EditProfileScreen]');
            hydrateUser();

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('Edit Profile Screen unfocused [EditProfileScreen]');
            };
        }, [])
    );

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

  const handleConfirmUpdate = async () => {
      // Hide the confirmation modal
      setShowUpdateConfirmation(false);

      // Call the UpdateProfile function to update the profile information
      UpdateProfile({userName, desc});

      // Get the current user from the auth store
      const currentUser = useAuthStore.getState().user;

      // Update the username in the user's profile in the store
      if (currentUser) {
          currentUser.username = userName;
          useAuthStore.getState().setUser(currentUser);
      }
  };

  const handleCheckboxChange = (genreId: string) => {
      // Check if the genre is already selected
      if (checkedGenres[genreId]) {
          // If it's selected, unselect it
          setCheckedGenres(prevState => ({
              ...prevState,
              [genreId]: false,
          }));
      } else {
          // Check if the limit of two genres is reached
          if (Object.values(checkedGenres).filter(Boolean).length < 2) {
              // If not reached, select the genre
              setCheckedGenres(prevState => ({
                  ...prevState,
                  [genreId]: true,
              }));
          } else {
              // If limit is reached, show a message or perform an action
              console.log('You can only select up to two genres.');
          }
      }
  };

  const handleFinishButton = () => {
      const selectedGenres = Object.keys(checkedGenres).filter(genreId => checkedGenres[genreId]);

      console.log('Selected Genres:', selectedGenres);

      if (selectedGenres.length === 2) {
          const genreNames = selectedGenres.map(genreId => {
              const genreObject = MOVIE_GENRES.find(item => item.id === genreId);
              return genreObject ? genreObject.genre : '';
          });

          const archetypeKey = genreNames.sort().join(', ');

          console.log('Archetype Key:', archetypeKey);

          const selectedArchetype = archetypeMapping[archetypeKey];

          if (selectedArchetype) {
              console.log('Selected Archetype:', selectedArchetype);
              // You can also navigate or perform any other action here
         
          } else {
              console.log('No matching archetype found for the selected genres.');
          }
      } else {
          console.log('Please select exactly 2 genres.');
      }
  };

  const filteredGenres = MOVIE_GENRES.filter(genre => genre.id !== '0');


  return (
      <SafeAreaView>
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
                          <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                          <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                      </View>
                  </TouchableOpacity>
                  <View>
                      <Text style={styles.title}>EDIT PROFILE</Text>
                      <View style={{alignItems: 'center'}}>
                          <Avatar
                              rounded
                              size={125}
                              source={user?.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder}
                              avatarStyle={{
                                  borderWidth: 2,
                                  borderColor: COLORS.AKCRUBLUE,
                              }}
                          />
                          {/* <TouchableOpacity onPress={() => setShowImagePickerModal(true)}> */}
                          <TouchableOpacity onPress={
                            () => {
                                launchImageLibrary(
                                    {
                                        selectionLimit: 1,
                                        mediaType: 'photo',
                                        includeBase64: false,
                                    },
                                    handleImageUpload
                                );
                            }
                          }>
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
                      <Modal animationType="fade" transparent={true} visible={showImagePickerModal}>
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
                                  <View
                                      style={{
                                          flexDirection: 'row-reverse',
                                          justifyContent: 'space-between',
                                          alignContent: 'center',
                                          marginBottom: 10,
                                      }}>
                                      <TouchableOpacity onPress={() => setShowImagePickerModal(false)}>
                                          <Icon name="close-circle" type="ionicon" color={COLORS.CATREDLGT} size={25} />
                                      </TouchableOpacity>
                                      <Text style={{...FONTS.Title3}}>Select Profile Photo</Text>
                                  </View>

                                  <ScrollView
                                      horizontal
                                      showsHorizontalScrollIndicator={false}
                                      contentContainerStyle={{flexDirection: 'row'}}>
                                      {gallery.map((imageUri, index) => {
                                          return (
                                              <TouchableOpacity key={index} onPress={() => handleSelectImage(imageUri)}>
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
                                      <Image source={{uri: imageUri}} style={styles.galleryImage} />
                                      <TouchableOpacity
                                          style={{
                                              position: 'absolute',
                                              right: 8,
                                              top: -3,
                                              zIndex: 20,
                                          }}
                                          onPress={() => deleteImage(index)}>
                                          <Icon name="close-circle" type="ionicon" color={COLORS.CATREDLGT} size={25} />
                                      </TouchableOpacity>
                                  </View>
                              );
                          })}
                      </ScrollView>

                      <Modal animationType="fade" transparent={true} visible={showDeleteConfirmation}>
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
                                      <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Deletion</Text>
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
                          onPress={
                              () => setShowImagePickerModal(true)
                          }>
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

                  <View style={{alignItems: 'center', marginTop: 20}}>
                      <Text style={styles.inputlabel}>Username</Text>
                      <InputsLrg
                          placeholdername={user?.username}
                          iconname={'person'}
                          iconcolor={COLORS.LIGHTGREY}
                          secureTextEntry={false}
                          onChangeText={text => setUserName(text)}
                          value={userName || ''}
                          editable={!loading}
                      />
                  </View>
                  <View>
                      <Text style={styles.inputlabel}>Email</Text>
                      <View style={{alignItems: 'center'}}>
                          <InputsLrg
                              placeholdername={user?.email}
                              iconname={'mail'}
                              iconcolor={COLORS.LIGHTGREY}
                              secureTextEntry={false}
                              value={session?.user?.email}
                              editable={!loading}
                          />
                          {emailError && <Text style={styles.warningText}>Invalid email format</Text>}
                      </View>
                  </View>
                  <Text style={styles.inputlabel}>Description</Text>
                  <View style={styles.descinput}>
                      <TextInput
                          placeholder={user?.description}
                          placeholderTextColor={COLORS.DARKGREY}
                          style={styles.textinput}
                          onChangeText={text => setDesc(text)}
                          secureTextEntry={false}
                          value={desc || ''}
                      />
                  </View>
                  

                  <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE, textAlign: 'center', marginTop: 20}}>
                      Update your Archetype here ( Choose 2 genres ) :
                  </Text>

                  <View style={{marginBottom: 20}}>
                      <FlatList
                          data={filteredGenres}
                          horizontal={false}
                          numColumns={3}
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={item => item.id}
                          renderItem={({item, index}) => (
                              <View>
                                  <View style={styles.checkboxContainer}>
                                      <TouchableOpacity onPress={() => handleCheckboxChange(item.id)}>
                                          <View style={styles.checkbox}>
                                              {checkedGenres[item.id] && (
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
                                          <Text style={styles.checkboxText}>{item.genre}</Text>
                                      </View>
                                  </View>
                              </View>
                          )}
                      />
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
                  <Modal animationType="fade" transparent={true} visible={showUpdateConfirmation}>
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
                                  <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Update</Text>
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
                      <TouchableOpacity onPress={() => navigation.navigate('AccountSettings')}>
                          <Text style={styles.settingslabel}>Account Settings</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          onPress={async () => {
                              await logout();
                              // after logging out, navigate to the Signin screen
                              navigation.navigate('Signin');
                          }}>
                          <Text style={[styles.settingslabel, styles.mt20]}>Sign Out</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </ScrollView>
      </SafeAreaView>
  );
}