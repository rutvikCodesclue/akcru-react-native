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
  FlatList,
  Image
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
import { MOVIE_GENRES, appVersion } from '../../../../assets/constants/Data';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import { API } from '../../../clients/api.client';
import { capitalizeFirstLetterOfString } from '../../../util/util';
import Video from 'react-native-video';
import { updateUser } from '../../../lib/api/user.lib';
import {archetypeMapping} from '../../../../assets/constants/archetypeMapping';
import LinearGradient from 'react-native-linear-gradient';

const OnboardArchetype = () => {
 const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

 const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});

 const [archetypeModal, setArchetypeModal] = useState(false);

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
             //console.log('You can only select up to two genres.');
         }
     }
 };

 const [archetypeKey, setArchetypeKey] = useState('');
 const [archetypeName, setArchetypeName] = useState('');
 const [archetypeImage, setArchetypeImage] = useState<string | null>(null);
 const [archetypeDescription, setArchetypeDescription] = useState('');

 const handleFinishButton = async () => {
     const selectedGenres = Object.keys(checkedGenres).filter(genreId => checkedGenres[genreId]);
     //console.log('Selected Genres:', selectedGenres);

     if (selectedGenres.length === 2) {
         const genreNames = selectedGenres.map(genreId => {
             const genreObject = MOVIE_GENRES.find(item => item.id === genreId);
             return genreObject ? genreObject.genre : '';
         });

         const newArchetypeKey = genreNames.sort().join(', ');
         //console.log('Archetype Key:', newArchetypeKey);

         const selectedArchetype = archetypeMapping[newArchetypeKey];

         if (selectedArchetype) {
             // Set the archetype information in the state
             setArchetypeModal(true);
             const newArchetypeName = selectedArchetype.name;
             const newArchetypeImage = selectedArchetype.image; // Set the image here
             const newArchetypeDescription = selectedArchetype.description; // Set the description here
             //console.log('Selected Archetype:', newArchetypeName);
             setArchetypeName(newArchetypeName);
             setArchetypeImage(newArchetypeImage);
             setArchetypeDescription(newArchetypeDescription);

             // Serialize the archetype data including the genres
             const archetypeData = JSON.stringify({
                 name: selectedArchetype.name,
                 image: selectedArchetype.image,
                 description: selectedArchetype.description,
                 genres: genreNames, // Add the selected genre names
             });

             try {
                 // Update the user's archetype in the backend
                 const updatedUser = await updateUser({archetype: archetypeData});
                 if (updatedUser) {
                     //console.log('Archetype updated successfully:', updatedUser);

                     // Update the global state/context with the new user data
                     useAuthStore.setState({user: updatedUser});

                     // Optionally update local component state here

                     // Hide the archetype modal after 4 seconds and show the TrinityModal or navigate
                     setTimeout(() => {
                         setArchetypeModal(false); // Hide the archetype modal
                         setTrinityModal(true); // Show the TrinityModal
                         // navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
                     }, 4000); // 4 seconds
                 }
             } catch (error) {
                 console.error('Error updating archetype:', error);
             }
         } else {
             //console.log('No matching archetype found for the selected genres.');
         }
     } else {
         //console.log('Please select exactly 2 genres.');
     }
 };

 const filteredGenres = MOVIE_GENRES.filter(genre => genre.id !== '0');

 const [trinityModal, setTrinityModal] = useState(false);
 const [videoError, setVideoError] = useState(false);
 const [skipVideo, setSkipVideo] = useState(false);

 const [isVideoLoaded, setIsVideoLoaded] = useState(false);
 const [showSkipButton, setShowSkipButton] = useState(false);

 const handleVideoLoad = () => {
     // Set a timeout for 10 seconds
     const timeout = setTimeout(() => {
         // If the video still hasn't loaded after 10 seconds, show the skip button
         setShowSkipButton(true);
     }, 10000); // 10 seconds in milliseconds

     // Store the timeout ID in state
     setLoadingTimeout(timeout);

     // Callback when the video is loaded
     setIsVideoLoaded(true);
 };

 const handleVideoEnd = () => {
     setTrinityModal(false); // Hide the trinity modal after the video is played

     if (!videoError) {
         navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
     } else {
         //console.log('Error occurred during video playback.');
         // You can handle the error in other ways, e.g., show an error message to the user.
     }
 };

 const handleVideoError = () => {
     setVideoError(true);
     navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
 };

 // Function to handle video skip
 const handleSkipVideo = () => {
     // Clear the loading timeout if it exists
     if (loadingTimeout) {
         clearTimeout(loadingTimeout);
     }

     setSkipVideo(true);
     setTrinityModal(false); // Hide the trinity modal after skipping
     navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
 };
 const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

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
                      height:SIZES.ScreenHeight,
          
                  }}
              />
              <View style={{flex: 1, marginBottom: 50}}>
                  <View style={styles.container}>
                      <View style={{alignItems: 'center', marginTop: 20}}>
                          <AkcruLogo width={200} height={60} />
                      </View>

                      <Text style={{...FONTS.Title2, textAlign: 'center', marginHorizontal: 10}}>
                          At Akcru, your movie-watching preferences shape your unique archetype. This personalized
                          archetype guides us in curating the finest movie recommendations for you, as well as
                          connecting you with like-minded users who share similar tastes. At Akcru, we go beyond being a
                          simple streaming platform; we are a multifaceted streaming experience that caters to your
                          individuality.
                      </Text>
                      <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center', marginTop: 20}}>
                          Please choose 2 genres to get you started:
                      </Text>

                      <View style={{marginBottom: 20, marginHorizontal: 10}}>
                          <FlatList
                              data={filteredGenres}
                              horizontal={false}
                              numColumns={3}
                              showsHorizontalScrollIndicator={false}
                              keyExtractor={item => item.id}
                              renderItem={({item, index}) => (
                                  <View>
                                      <View style={styles.checkboxContainer2}>
                                          <TouchableOpacity onPress={() => handleCheckboxChange(item.id)}>
                                              <View style={styles.checkbox2}>
                                                  {checkedGenres[item.id] && (
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
                                          <View>
                                              <Text style={styles.checkboxText2}>{item.genre}</Text>
                                          </View>
                                      </View>
                                  </View>
                              )}
                          />
                      </View>
                  </View>
                  <View>
                      <View style={{alignItems: 'center'}}>
                          <AkcruButtons.XlLrgButton
                              color={COLORS.PURPLE}
                              btnname={'Finish'}
                              onPress={handleFinishButton}
                              disabled={false}
                          />
                      </View>
                  </View>
              </View>
              {/* Archetype Modal */}
              <Modal animationType="fade" transparent={true} visible={archetypeModal}>
                  <View
                      style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      }}>
                      <Text style={{...FONTS.Title1}}>Your Archetype is:</Text>

                      {archetypeName && (
                          <Text
                              style={{
                                  ...FONTS.Title3,
                                  textAlign: 'center',
                                  marginVertical: 10,
                                  color: COLORS.PURPLE,
                              }}>
                              "{archetypeName}"
                          </Text>
                      )}
                      <View>
                          {archetypeImage && (
                              <Image
                                  source={{uri: archetypeImage}}
                                  style={{
                                      width: SIZES.ScreenWidth / 1.2,
                                      height: SIZES.ScreenWidth / 1.2,
                                      borderRadius: 5,
                                      alignSelf: 'center',
                                  }}
                              />
                          )}
                      </View>

                      {archetypeDescription && (
                          <Text
                              style={{
                                  ...FONTS.paragraph1,
                                  textAlign: 'center',
                                  marginVertical: 10,
                                  marginHorizontal: 15,
                                  color: COLORS.MIDORANGE,
                              }}>
                              {archetypeDescription}
                          </Text>
                      )}
                  </View>
              </Modal>
              {/* Trinity Modal */}
              <Modal animationType="fade" transparent={true} visible={trinityModal}>
                  <View
                      style={{
                          flex: 1,
                          justifyContent: 'center',
                          backgroundColor: COLORS.AKCRUBACKGROUND,
                          width: '100%',
                      }}>
                      {showSkipButton && (
                          <View style={{position: 'absolute', zIndex: 10, bottom: '3%', right: '50%', left: '33%'}}>
                              <AkcruButtons.SmallButton
                                  color={COLORS.PURPLE}
                                  btnname={'Skip'}
                                  onPress={handleSkipVideo}
                                  disabled={false}
                              />
                          </View>
                      )}
                      {/* Display the loading indicator if the video is still loading */}
                      {!isVideoLoaded && (
                          <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '50%'}}>
                              <ActivityIndicator size="large" color={COLORS.PURPLE} />
                          </View>
                      )}
                      <Video
                          style={{
                              width: '100%',
                              height: '100%',
                          }}
                          source={{
                              uri: 'https://d17ybuhl825fg.cloudfront.net/TrinityFAQ/Trinity%2Bintro%2Bvideo%2Bfor%2Bsite.mp4',
                          }}
                          resizeMode="cover"
                          onEnd={handleVideoEnd} // Callback for when the video ends
                          repeat={false}
                          onError={handleVideoError}
                          onLoad={handleVideoLoad} // Callback when the video is loaded
                      />
                  </View>
              </Modal>
          </ImageBackground>
      </View>
  );
};

export default OnboardArchetype;
