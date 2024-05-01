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
import {getWatchlist} from '../../../lib/api/movies.lib';
import CruMemberPic from '../../../components/CruMemberPic';
import {getMyCRU, leaveCRU, removeAUserFromCRU} from '../../../lib/api/cru.lib';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {supabase} from '../../../../lib/supabase';
import {deleteUserGalleryImage, fetchUserGallery, updateUserGallery} from '../../../lib/api/user.lib';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import { set } from 'lodash';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';
import WatchListCategory from '../../../components/WatchlistCategory';
import AkcruButtons from '../../../components/akcruButtons';
import {listCrusForUser} from '../../../lib/api/cru.lib';
import { UseTabMenu } from '../../../context/TabContext';
import ConfirmationModal from '../../../components/ConfirmationModal';
import CruResultModal from '../../../components/CruResultModal/CruResultModal';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import HexAvatar from '../../../components/HexAvatar';
import { selectAvatarBorderColor } from '../../../util/util';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import { MULTISIZES } from '../../../../assets/constants/theme';
import {RealtimeChannel} from '@supabase/supabase-js';
import playMessageSound from '../../../util/playMessageSound';
import { getUnread, updateMessageStatus } from '../../../lib/api/rooms.lib';

const UserProfileDetailsTab = () => {
    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);

    // Function to toggle the modal's visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };


    const [crus, setCrus] = useState<ICru[]>([]);
    const [membercruIds, setMemberCruIds] = useState([])
    const [unreadcruIds, setUnreadCruIds] = useState([])
    


    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            return () => {
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

    useEffect(() => {
    }, [unreadcruIds]);
    useEffect(() => {
        getUnread(membercruIds).then(res=>{
            console.log(res)
            if(res?.success && res.unread != null){
                setUnreadCruIds(res.unread)
            }
        })
    }, [membercruIds]);

    useFocusEffect(
        React.useCallback(() => {
            const channelA = supabase.channel('parent-cru-chat');
        channelA
            .on('broadcast', {event: 'parent-cru-chat'}, payload => messageReceived(payload))
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannel(channelA);
                }
            });

        return () => {
            channelA.unsubscribe();
            setChannel(null);
        };
        
        }, []),
    );

   

    function messageReceived(payload: any) {
        if(user == null) return;
        if (payload.payload.senderId === user.id) return;

        const cruId = payload.payload.cruId;

        console.log('membercruIds', crus, payload.payload.cruId)
        const cruids = crus.map(cru => cru.id);
        if(CRU){cruids.push(CRU.id)}
        console.log('Cruids',cruids, unreadcruIds)

        setUnreadCruIds(prevUnreadCruIds => {
            if (!prevUnreadCruIds.includes(cruId)) {
                const updatedUnreadCruIds = [...prevUnreadCruIds, cruId];
                console.log('RECEIVED MESSAGE Parent', payload, updatedUnreadCruIds);
                playMessageSound()
                return updatedUnreadCruIds;
            }
            return prevUnreadCruIds;
        });

    }

    const [watchlist, setWatchlist] = useState<IMovie[]>([]); // State to store the watchlist data

    useFocusEffect(
        React.useCallback(() => {
            // ... (other code)

            const fetchWatchlist = async () => {
                try {
                    const watchlistMovies = await getWatchlist(user?.id);
                    setWatchlist(watchlistMovies);
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                }
            };

            fetchWatchlist();

            
        }, []),
    );

    const updateWatchlist = (updatedWatchlist: IMovie[]) => {
        setWatchlist(updatedWatchlist);
    };

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
    const [showImageCountErrorModal, setShowImageCountErrorModal] = useState(false);

    const [userPics, setUserPics] = useState<string[]>(user?.gallery || []);

    useEffect(() => {
        if (user?.gallery) {
            setUserPics(user.gallery);
        }
    }, [user]);

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
                //console.log('Number of images selected:', response.assets.length);

                // Array to hold URIs of successfully uploaded images
                let uploadedImages = [];

                const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

                for (const asset of response.assets) {
                    //console.log('uri:', asset.uri);
                    //console.log('filesize:', asset.fileSize);
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
                                    //console.log('updatedUserProfileGallery:', updatedUser);
                                    //console.log('Addedtogallery called with image:', selectedImage);
                                    uploadedImages.push(selectedImage); // Add the new image URI to the array
                                } else {
                                    //console.log('Failed to update profile Gallery');
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
        //console.log('removeFromGallery called with image:', image);
        try {
            const updatedUser = await deleteUserGalleryImage(image);
            if (updatedUser) {
                // Update local state to reflect changes
                setUserPics(updatedUser.gallery);
            } else {
                //console.log('Failed to delete image from gallery');
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

    const {refetchCrus, setRefetchCrus} = UseTabMenu();

    useFocusEffect(
        React.useCallback(() => {
          const fetchCrus = async () => {
            if (user?.id) {
              try {
                const fetchedCrus = await listCrusForUser(user.id);
                if (fetchedCrus) {
                  setCrus(fetchedCrus);
                  const ids = fetchedCrus.map(cru => cru.id);
                  const mycru = await getMyCRU();
                  setCRU(mycru?.CRU);
                  ids.push(mycru?.CRU.id);
                  if (mycru?.CRU.members) {
                    setMembers(mycru.CRU.members);
                  }
                  setMemberCruIds(ids);
                } else {
                  Alert.alert('Error', "Could not fetch the user's Cru details.");
                }
              } catch (error) {
                console.error(error);
              }
            }
          };
      
          fetchCrus();
          if (refetchCrus) {
            setRefetchCrus(false);
          }
        }, [user?.id, refetchCrus, setRefetchCrus])
      );

    const [confirmationModal, setConfirmationModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [cruResultModal, setCruResultModal] = useState(false);

    // const handleLeaveCRU = async (cruId: string) => {
    //     const userId = user?.id; // or however you obtain the user ID

    //     if (!userId) {
    //         Alert.alert('Error', 'User ID not found');
    //         return;
    //     }
    //     Alert.alert('Leave CRU', 'Are you sure you want to leave this CRU?', [
    //         {text: 'Cancel', style: 'cancel'},
    //         {
    //             text: 'Yes',
    //             onPress: async () => {
    //                 setIsLeaving(true);
    //                 try {
    //                     const response = await removeAUserFromCRU(userId, cruId);
    //                     if (response) {
    //                         setCrus(prevCrus => prevCrus.filter(cru => cru.id !== cruId));
    //                         Alert.alert('Success', 'You have left the CRU.');
    //                         setIsLeaving(false);
    //                     } else {
    //                         Alert.alert('Error', 'Unable to leave CRU. Please try again later.');
    //                         setIsLeaving(false);
    //                     }
    //                 } catch (error) {
    //                     console.error('Error leaving CRU:', error);
    //                     Alert.alert('Error', 'An error occurred while trying to leave the CRU.');
    //                 }
    //             },
    //         },
    //     ]);
    // };

    // State to control visibility of the confirmation and result modals
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [cruResultModalVisible, setCruResultModalVisible] = useState(false);

    // State to store the CRU ID for which the leave operation is initiated
    const [currentCruId, setCurrentCruId] = useState(null);

    // State to store result message and type for CruResultModal
    const [cruResultMessage, setCruResultMessage] = useState('');
    const [cruResultType, setCruResultType] = useState(''); // 'success' or 'error'
    const [cruIconName, setCruIconName] = useState('');
    const [cruIconColor, setCruIconColor] = useState('');

    // Adjusted handleLeaveCRU function
    const handleLeaveCRU = (cruId: string) => {
        setCurrentCruId(cruId);
        setConfirmationModal(true);
    };

    // Function to call when confirmation is received
    const confirmLeaveCRU = async () => {
        setConfirmationModal(false); // Close the confirmation modal
        setIsLeaving(true); // Assuming you have a loading state
        try {
            const response = await removeAUserFromCRU(user?.id, currentCruId);
            if (response) {
                setCrus(prevCrus => prevCrus.filter(cru => cru.id !== currentCruId));
                setMemberCruIds(prevCrus => prevCrus.filter(cruId => cruId !== currentCruId))
                setUnreadCruIds(prevCrus => prevCrus.filter(cruId => cruId !== currentCruId))
                setCruResultModal(true);
                setCruResultMessage('Successfully left the CRU.');
                setCruResultType('Success');
                setCruIconName('md-checkmark-circle');
                setCruIconColor(COLORS.AKCRUBLUE);
            } else {
                setCruResultModal(true);
                setCruResultMessage('Unable to leave CRU. Please try again later.');
                setCruResultType('Fail');
                setCruIconName('md-alert-circle');
                setCruIconColor('red');
            }
        } catch (error) {
            console.error('Error leaving CRU:', error);
            setCruResultModal(true);
            setCruResultMessage('An error occurred while trying to leave the CRU.');
            setCruResultType('Error');
            setCruIconName('md-error');
            setCruIconColor('red');
        } finally {
            setCruResultModal(true);
            setIsLeaving(false); // Stop loading state
            setCruResultModalVisible(true); // Show the result modal
        }
    };

    return (
        <View>
            <View style={{marginHorizontal: SIZES.marginhorizontal}}>
                <View style={styles.gallerycontainer}>
                    <FlatList
                        data={userPics}
                        numColumns={3}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => (
                            <View>
                                <Pressable onPress={() => handleImageEnlarge(item)}>
                                    <Image source={{uri: item}} style={styles.galleryImage} />
                                </Pressable>
                            </View>
                        )}
                        ListHeaderComponent={
                            <View>
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            marginTop: 10,
                                            marginBottom: 20,
                                            textAlign: 'center',

                                            textDecorationLine: 'underline',
                                        }}>
                                        PROFILE DETAILS
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        alignSelf: 'center',
                                        alignItems: 'center',
                                        width: '95%',
                                    }}>
                                    <View style={{alignContent: 'center', width: SIZES.ScreenWidth * 0.5}}>
                                        <View>
                                            <FlatList
                                                data={cruMembers()}
                                                horizontal={true}
                                                showsHorizontalScrollIndicator={false}
                                                scrollEnabled={false}
                                                keyExtractor={item => item.id}
                                                renderItem={({item, index}) => (
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            navigation.navigate('ViewUserScreen', {userID: item.id})
                                                        }>
                                                        <View
                                                            style={{
                                                                marginRight: index < cruMembers().length - 1 ? -16 : 0,
                                                            }}>
                                                            <CruMemberPic
                                                                userPicture={item.profilePicture}
                                                                akcruBadge={item.badge}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('EditCru')}
                                            style={{marginVertical: 15}}>
                                            <View style={{flexDirection: 'row'}}>
                                                <Icon
                                                    name="square-edit-outline"
                                                    type="material-community"
                                                    color={COLORS.PINK}
                                                    size={20}
                                                    style={{marginRight: 5}}
                                                />
                                                <Text
                                                    style={{
                                                        ...FONTS.Title2,
                                                        color: COLORS.PINK,
                                                    }}>
                                                    Edit your CRU
                                                </Text>
                                            </View>
                                        </TouchableOpacity>

                                        <View>
                                        {CRU&& unreadcruIds && unreadcruIds.includes(CRU.id) && (
                                                               <View
                                                               style={{
                                                                   width: 10,
                                                                   height: 10,
                                                                   borderRadius: 5,
                                                                   backgroundColor: COLORS.PINK,
                                                                   position: 'absolute',
                                                                   zIndex: 100,
                                                                   left: '63%',
                                                                   top: -3
                                                               }}
                                                           />
                                                          )}
                                            
                                            <AkcruButtons.SmallButton
                                                disabled={false}
                                                color={COLORS.PURPLE}
                                                btnname="CRU Chat"
                                                onPress={() =>{
                                                    const updatedCruids = unreadcruIds.filter(id => id !== CRU.id);
                                                    setUnreadCruIds(updatedCruids);
                                                    navigation.navigate('ViewGroupChat', {
                                                        isMyCruChat: true,
                                                    })}
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={{alignItems: 'center', width: SIZES.ScreenWidth * 0.35}}>
                                        <View>
                                            <Text
                                                style={{
                                                    ...FONTS.paragraph1,
                                                    textAlign: 'center',

                                                    color: COLORS.LIGHTGREY,
                                                }}>
                                                Schedule a CRU View through the CRU VIEW scheduler
                                            </Text>
                                        </View>
                                        <View style={{marginTop: 10}}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('CruViewSearchMovieScreen')}>
                                                <Icon
                                                    name="calendar-sharp"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    size={75}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {/* <View>
                                            <Image
                                                source={imageindex.NewCru}
                                                style={{width: 120, height: 120}}
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <View style={{marginTop: 15}}>
                                            <AkcruButtons.SmallButton
                                                disabled={false}
                                                color={COLORS.MIDORANGE}
                                                btnname="CRU View"
                                                onPress={() => navigation.navigate('UserCruChatScreen')}
                                            />
                                        </View> */}
                                    </View>
                                </View>
                                <View style={{marginTop: 10}}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            marginTop: 10,
                                            marginBottom: 15,
                                            textAlign: 'center',

                                            textDecorationLine: 'underline',
                                        }}>
                                        CRU AFFILIATIONS
                                    </Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <FlatList
                                        data={crus}
                                        keyExtractor={item => item.id}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={({item}) => {
                                            // Check if the current user is a member of this CRU
                                            const isCurrentUserAMember =
                                                item.members?.some(member => member.id === user?.id) ||
                                                item.creator.id === user?.id;

                                            return (
                                                <View
                                                    style={{
                                                        backgroundColor: COLORS.CATPURPDRK,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                        padding: 15,
                                                        marginBottom: 15,
                                                        marginHorizontal: 10,
                                                        width: SIZES.ScreenWidth * 0.75,
                                                    }}>
                                                    <LinearGradient
                                                        // Background Linear Gradient
                                                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                                        style={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            right: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            borderRadius: 5,
                                                        }}
                                                    />
                                                    <TouchableOpacity
                                                        style={{position: 'absolute', left: '8%', top: '5%'}}
                                                        onPress={() => {
                                                            {
                                                            const updatedCruids = unreadcruIds.filter(id => id !== item.id);
                                                            setUnreadCruIds(updatedCruids);
                                                            navigation.navigate('ViewGroupChat', {
                                                                isMyCruChat: false,
                                                                cru: item,
                                                            });
                                                        }
                                                        }}>
                                                        <View>
                                                            {unreadcruIds && unreadcruIds.includes(item.id) && (
                                                                <View
                                                                    style={{
                                                                        width: 10,
                                                                        height: 10,
                                                                        borderRadius: 5,
                                                                        backgroundColor: COLORS.CATREDLGT,
                                                                        position: 'absolute',
                                                                        zIndex: 100,
                                                                        right: 0,
                                                                    }}
                                                                />
                                                          )}
                                                        </View>
                                                        <CustomIcon
                                                            name="chatbox-ellipses"
                                                            type="ionicon"
                                                            color={COLORS.PURPLE}
                                                            baseSize={22}
                                                            style={{margin: 0}}
                                                        />
                                                    </TouchableOpacity>
                                                    <Text style={{...FONTS.Title2, paddingBottom: 10}}>
                                                        {item.name}
                                                    </Text>
                                                    {/* Optionally render the creator separately here */}
                                                    <TouchableOpacity
                                                        style={{alignItems: 'center', paddingBottom: 10}}
                                                        onPress={() =>{
                                                        
                                                            navigation.navigate('ViewUserScreen', {
                                                                userID: item.creator.id,
                                                            })
                                                        }
                                                            
                                                        }>
                                                        <HexAvatar
                                                            source={{uri: item.creator.profilePicture}}
                                                            size={70}
                                                            bordercolor={selectAvatarBorderColor(
                                                                item.creator.badge ?? 'AKCRUIT',
                                                            )}
                                                        />
                                                        <Text style={{...FONTS.paragraph1, textAlign: 'center'}}>
                                                            Cru Leader
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '100%', // Make sure this takes the full width
                                                        }}>
                                                        <ScrollView
                                                            horizontal={true}
                                                            showsHorizontalScrollIndicator={false}
                                                            contentContainerStyle={{
                                                                flexGrow: 1,
                                                                justifyContent: 'center', // This ensures content is centered within the scroll view if content is smaller than the screen
                                                                alignItems: 'center',
                                                            }}>
                                                            {item.members?.map(member => (
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        navigation.navigate('ViewUserScreen', {
                                                                            userID: member.id,
                                                                        })
                                                                    }
                                                                    key={member.id}>
                                                                    {/* Adjust spacing as needed */}
                                                                    <CruMemberPic
                                                                        userPicture={member.profilePicture}
                                                                        akcruBadge={member.badge}
                                                                    />
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    </View>
                                                    {/* <View style={{backgroundColor: 'red', width: '100%', flex: 1}}>
                                            <FlatList
                                                data={item.members}
                                                horizontal={true}
                                                showsHorizontalScrollIndicator={false}
                                                renderItem={({item: member}) => (
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            navigation.navigate('ViewUserScreen', {userID: member.id})
                                                        }
                                                        key={member.id}>
                                                        <CruMemberPic
                                                            userPicture={member.profilePicture}
                                                            akcruBadge={member.badge}
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                                keyExtractor={member => member.id}
                                            />
                                        </View> */}
                                                    <Text
                                                        style={{
                                                            ...FONTS.paragraph1,
                                                            textAlign: 'center',
                                                            paddingBottom: 15,
                                                        }}>
                                                        {'Member(s)'}
                                                    </Text>
                                                    {isCurrentUserAMember && (
                                                        <AkcruButtons.SmallButton
                                                            btnname="Leave CRU"
                                                            onPress={() => handleLeaveCRU(item.id)}
                                                            disabled={false}
                                                            color={COLORS.CATREDLGT}
                                                        />
                                                    )}
                                                </View>
                                            );
                                        }}
                                    />
                                </View>
                                <View
                                    style={{
                                        borderBottomWidth: 1.5,
                                        borderColor: COLORS.DARKERGREY,
                                        marginTop: 20,
                                        marginBottom: 10,
                                    }}
                                />
                                <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                                    <AkcruButtons.LrgButton
                                        btnname={'Add to Gallery'}
                                        onPress={selectGalleryImage}
                                        color={COLORS.PINK}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        }
                        ListFooterComponent={
                            <View>
                                <View style={{marginBottom: 75}}>
                                    {/* <View style={{marginBottom: 10}}>
                            <BasicListCategories
                                Akcru_Content={{
                                    id: 'recommendedForYou',
                                    title: 'Recommended for you',
                                    movies: newerYearMovies,
                                }}
                            />
                        </View> */}
                                    {watchlist.length > 0 && ( // Only render WatchListCategory if watchlist has movies
                                        <View>
                                            <WatchListCategory
                                                Akcru_Content={{
                                                    id: 'YourFavourite',
                                                    title: 'Your Favorites',
                                                    movies: watchlist,
                                                }}
                                                updateWatchlist={updateWatchlist}
                                            />
                                        </View>
                                    )}
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
                                    <EnlargeGalleryModal
                                        closeModal={toggleEnlargeModal}
                                        image={selectedImage}
                                        deleteImage={removeFromGallery}
                                    />
                                </Modal>
                                <Modal animationType="fade" transparent={true} visible={!!confirmationModal}>
                                    <ConfirmationModal
                                        confirmationText={'Are you sure you want to leave this CRU?'}
                                        onPressYes={() => confirmLeaveCRU()}
                                        onPressNo={() => setConfirmationModal(false)}
                                    />
                                </Modal>
                                <Modal animationType="fade" transparent={true} visible={!!cruResultModal}>
                                    <CruResultModal
                                        closeModal={() => setCruResultModal(false)}
                                        type={cruResultType}
                                        message={cruResultMessage}
                                        iconname={cruIconName}
                                        iconcolor={cruIconColor}
                                    />
                                </Modal>
                            </View>
                        }
                    />
                </View>
            </View>
        </View>
    );
};

export default UserProfileDetailsTab;
