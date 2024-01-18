import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Modal,
    FlatList,
    Pressable,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import {Icon} from '@rneui/base';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BasicListCategories from '../../../components/BasicListCategories';
import useAuthStore from '../../../stores/auth.store';
import {ICru, IMovie, IUserProfile} from '../../../../types';
import {findMovies} from '../../../lib/api/movies.lib';
import CruMemberPic from '../../../components/CruMemberPic';
import {getMyCRU} from '../../../lib/api/cru.lib';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {supabase} from '../../../../lib/supabase';
import {deleteUserGalleryImage, fetchUserGallery, updateUserGallery} from '../../../lib/api/user.lib';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import { set } from 'lodash';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';

const UserProfileDetailsTab = () => {
    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            hydrateUser();
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                hydrateUser();
            };
        }, []),
    );

    const [CRU, setCRU] = useState<ICru | undefined>(undefined); // CRU object from the API
    const [potentialMembers, setPotentialMembers] = useState<IUserProfile[] | []>([]); // Possible member list
    const [members, setMembers] = useState<IUserProfile[] | []>([]);
    const cruMembers = (): IUserProfile[] | [] => {
        return members;
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            getMyCRU().then(res => {
                // console.log('Data from getMyCRU:', res); // Log the data
                setCRU(res?.CRU);
                if (res?.CRU.members) {
                    setMembers(res.CRU.members);
                }
            });

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('Screen unfocused [EditCruScreen]');

                // cleanup (if app crashes or user leaves the screen unexpectedly)
            };
        }, []),
    );

    useEffect(() => {
        const fetchNewerYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by year in descending order
                const sortedMovies = allMovies.sort((a, b) => b.year - a.year);

                // Get the 5 oldest movies
                const Newer5Movies = sortedMovies.slice(0, 5);

                setNewerYearMovies(Newer5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };
        fetchNewerYearMovies();
    }, []);
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
    const [showImageCountErrorModal, setShowImageCountErrorModal] = useState(false);

    const [userPics, setUserPics] = useState<string[]>(user?.gallery || []);

    useEffect(() => {
        if (user?.gallery) {
            setUserPics(user.gallery);
        }
    }, [user]);

    // const selectGalleryImage = async () => {
    //     // Check if the user already has 6 images
    //     if (userPics.length >= 6) {
    //         setShowImageCountErrorModal(true);
    //         // Alert.alert('You cannot upload more than 6 images.');
    //         return; // Exit the function
    //     }
    //     let options = {
    //         mediaType: 'photo' as MediaType,
    //         storageOptions: {
    //             path: 'images',
    //         },
    //         selectionLimit: 6 - userPics.length, // Adjust the limit based on existing images
    //     };

    //     console.log('select picture button');

    //     launchImageLibrary(options, async response => {
    //         if (response && !response.didCancel && response.assets && response.assets.length) {
    //             console.log('Number of images selected:', response.assets.length);

    //             // Array to hold URIs of successfully uploaded images
    //             let uploadedImages = [];

    //             const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

    //             for (const asset of response.assets) {
    //                 console.log('uri:', asset.uri);
    //                 console.log('filesize:', asset.fileSize);
    //                 const size = asset.fileSize;
    //                 const selectedImage = asset.uri;
    //                 const imageType = asset.type;
    //                 const imageName = asset.fileName;

    //                 // Check the size of each selected image
    //                 if (size > maxSizeInBytes) {
    //                     // Show size error modal
    //                     setShowSizeErrorModal(true);
    //                     return; // Exit the function if any image is too large
    //                 } 
    //                 if (selectedImage) {
    //                     // Ensure asset.uri is not undefined before pushing
    //                     uploadedImages.push(asset.uri); // Add the new image URI to the array
    //                 } else {
    //                     // Call the API function to update the user's gallery
    //                     try {
    //                         const updatedUser = await updateUserGallery({
    //                             uri: selectedImage,
    //                             type: imageType,
    //                             name: imageName,
    //                         });

    //                         if (updatedUser) {
    //                             console.log('updatedUserProfileGallery:', updatedUser);
    //                             // Update user gallery state here
    //                             uploadedImages.push(asset.uri); // Add the new image URI to the array
    //                         } else {
    //                             console.log('Failed to update profile Gallery');
    //                         }
    //                     } catch (error) {
    //                         console.error('Error updating gallery:', error);
    //                         // Handle errors here
    //                     }
    //                 }
    //             }
    //             // Update the state to reflect the newly uploaded images
    //             if (uploadedImages.length > 0) {
    //                 // Combine new and existing images, but limit the total to 6
    //                 const newGallery = [...userPics, ...uploadedImages].slice(0, 6);
    //                 setUserPics(newGallery);
    //             }
    //         }
    //     });
    // };

 const selectGalleryImage = async () => {
     // Check if the user already has 6 images
     if (userPics.length >= 6) {
         setShowImageCountErrorModal(true);
         return; // Exit the function
     }

     let options = {
         mediaType: 'photo' as MediaType,
         storageOptions: {
             path: 'images',
         },
         selectionLimit: 6 - userPics.length, // Adjust the limit based on existing images
     };

     console.log('select picture button');

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
             console.log('Number of images selected:', response.assets.length);

             // Array to hold URIs of successfully uploaded images
             let uploadedImages = [];

             const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

             for (const asset of response.assets) {
                 console.log('uri:', asset.uri);
                 console.log('filesize:', asset.fileSize);
                 const selectedImage = asset.uri;
                 const imageType = asset.type;
                 const imageName = asset.fileName;

                 // Check the size of each selected image
                 if (asset.fileSize > maxSizeInBytes) {
                     // Show size error modal
                     setShowSizeErrorModal(true);
                     return; // Exit the function if any image is too large
                 } else {
                     if (selectedImage) {
                         // Ensure selectedImage is not undefined before attempting to upload
                         // Call the API function to update the user's gallery
                         try {
                             const updatedUser = await updateUserGallery({
                                 uri: selectedImage,
                                 type: imageType,
                                 name: imageName,
                             });

                             if (updatedUser) {
                                 console.log('updatedUserProfileGallery:', updatedUser);
                                         console.log('Addedtogallery called with image:', selectedImage);
                                 uploadedImages.push(selectedImage); // Add the new image URI to the array
                             } else {
                                 console.log('Failed to update profile Gallery');
                             }
                         } catch (error) {
                             console.error('Error updating gallery:', error);
                             // Handle errors here
                         }
                     }
                 }
             }

             // Filter out undefined values from uploadedImages just to be extra sure
             const filteredUploadedImages = uploadedImages.filter((image): image is string => !!image);

             // Update the state to reflect the newly uploaded images
             if (filteredUploadedImages.length > 0) {
                 // Combine new and existing images, but limit the total to 6
                 const newGallery = [...userPics, ...filteredUploadedImages].slice(0, 6);
                 setUserPics(newGallery);
             }
         }
     });
 };



    const removeFromGallery = async (image: string) => {
        console.log('removeFromGallery called with image:', image);
        try {
            const updatedUser = await deleteUserGalleryImage(image);
            if (updatedUser) {
                // Update local state to reflect changes
                setUserPics(updatedUser.gallery);
            } else {
                console.log('Failed to delete image from gallery');
                // Handle failure (e.g., show a notification to the user)
            }
        } catch (error) {
            console.error('Error removing image from gallery:', error);
            // Handle error (e.g., show a notification to the user)

        }
    };

    const [selectedImage, setSelectedImage] = useState(null); // State for the selected image

    // Function to handle image press
    const handleImageEnlarge = imageUri => {
        setSelectedImage(imageUri); // Set the selected image
        setEnlargeModalVisible(true); // Open the modal
    };

    const [enlargeModalVisible, setEnlargeModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleEnlargeModal = () => {
        setEnlargeModalVisible(!enlargeModalVisible);
    };

    return (
        <View>
            <View style={{marginHorizontal: SIZES.marginhorizontal}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                marginTop: 10,
                                marginBottom: 20,
                                textAlign: 'center',
                                fontSize: 14,
                                textDecorationLine: 'underline',
                            }}>
                            PROFILE DETAILS
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}>
                        <View style={{width: SIZES.ScreenWidth / 2}}>
                            <View>
                                <FlatList
                                    data={cruMembers()}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    scrollEnabled={false}
                                    keyExtractor={item => item.id}
                                    renderItem={({item, index}) => (
                                        <View style={{marginRight: index < cruMembers().length - 1 ? -16 : 0}}>
                                            <CruMemberPic userPicture={item.profilePicture} akcruBadge={item.badge} />
                                        </View>
                                    )}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditCru')}
                                style={{marginVertical: 20}}>
                                <View style={{flexDirection: 'row'}}>
                                    <Icon
                                        name="square-edit-outline"
                                        type="material-community"
                                        color={COLORS.MIDORANGE}
                                        size={15}
                                        style={{marginRight: 5}}
                                    />
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            color: COLORS.MIDORANGE,
                                            fontSize: 12,
                                        }}>
                                        Edit your CRU
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <View>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        fontSize: 12,
                                        color: COLORS.LIGHTGREY,
                                    }}>
                                    Schedule a CRU View through the CRU VIEW scheduler
                                </Text>
                            </View>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <View>
                                <Image
                                    source={imageindex.NewCru}
                                    style={{width: 120, height: 120}}
                                    resizeMode="cover"
                                />
                            </View>

                            <TouchableOpacity onPress={() => navigation.navigate('UserCruChatScreen')}>
                                <View
                                    style={{
                                        padding: 8,
                                        backgroundColor: COLORS.MIDORANGE,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 3,
                                        marginTop: 15,
                                        flexDirection: 'row',
                                    }}>
                                    <Text style={{...FONTS.Title2}}>CRU VIEW </Text>
                                    <Icon
                                        name="calendar"
                                        type="material-community"
                                        color={COLORS.WHITE}
                                        size={20}
                                        style={{marginRight: 5}}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={{
                            borderBottomWidth: 1.5,
                            borderColor: COLORS.DARKERGREY,
                            marginTop: 20,
                            marginBottom: 10,
                        }}
                    />
                    <TouchableOpacity
                        onPress={selectGalleryImage}
                        style={{
                            width: '95%',
                            height: 40,
                            alignSelf: 'center',
                            borderRadius: 5,
                            borderWidth: 1,
                            borderColor: COLORS.CATPURPLGT,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10,
                            marginTop: 10,
                        }}>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                color: COLORS.LIGHTGREY,
                                fontSize: 14,
                            }}>
                            Add to Gallery
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.gallerycontainer}>
                        <FlatList
                            data={userPics}
                            numColumns={3}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) => (
                                <View>
                                    <Pressable onPress={() => handleImageEnlarge(item)}>
                                        <Image source={{uri: item}} style={styles.galleryImage} />
                                    </Pressable>
                                    {/* <Pressable
                                        style={{position: 'absolute', top: 2, right: 2}}
                                        onPress={() => removeFromGallery(item)}>
                                        <Icon name="close-circle" type="ionicon" color={COLORS.MIDORANGE} size={30} />
                                    </Pressable> */}
                                </View>
                            )}
                        />
                    </View>
                    <View
                        style={{
                            borderBottomWidth: 1.5,
                            borderColor: COLORS.DARKERGREY,

                            marginBottom: 10,
                        }}
                    />

                    <View>
                        <View style={{marginBottom: 75}}>
                            <BasicListCategories
                                Akcru_Content={{
                                    id: 'recommendedForYou',
                                    title: 'Recommended for you',
                                    movies: newerYearMovies,
                                }}
                            />
                        </View>
                    </View>
                    <Modal animationType="fade" transparent={true} visible={!!showImageCountErrorModal}>
                        <ErrorModal
                            closeModal={() => setShowImageCountErrorModal(false)}
                            message={'You cannot upload more than 6 images.'}
                            iconcolor={COLORS.CATREDLGT}
                            iconname={'alert-circle'}
                        />
                    </Modal>
                    <Modal animationType="fade" transparent={true} visible={!!enlargeModalVisible}>
                        <EnlargeGalleryModal closeModal={toggleEnlargeModal} image={selectedImage} deleteImage={removeFromGallery}/>
                    </Modal>
                </ScrollView>
            </View>
        </View>
    );
};

export default UserProfileDetailsTab;
