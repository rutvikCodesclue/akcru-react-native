import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  Animated,
  Alert
} from 'react-native';
import styles from './styles';
import React, {useEffect, useRef, useState} from 'react';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Avatar } from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { blockUser, findAUser, followUser, getBlockedUsers, getFollowers, getUserCurrentWatching, getUserFollowing, unblockUser, unfollowUser } from '../../../lib/api/user.lib';
import { IMovie, IUserProfile } from '../../../../types';
import { capitalizeFirstLetterOfString, selectAvatarBorderColor } from '../../../util/util';
import { checkUserMembership, createACRUInvite, getCruInviteStatus } from '../../../lib/api/cru.lib';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import ViewUserOptionModal from '../../../components/ViewUserOptionModal/ViewUserOptionModal';
import ComfirmationModal from '../../../components/ConfirmationModal';
import useAuthStore from '../../../stores/auth.store';
import { getWatchlist } from '../../../lib/api/movies.lib';
import WatchListCategory from '../../../components/WatchlistCategory';
import ViewUserWatchListCategory from '../../../components/ViewUserWatchlist';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import AkcruButtons from '../../../components/akcruButtons';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import { set } from 'lodash';

type ViewUserScreenNavigationProp = StackNavigationProp<
  NoBottomTabStackParams,
  'ViewUserScreen'
>;

type ViewUserScreenRouteProp = RouteProp<
  UserProfileStackParams,
  'ViewUserScreen'
>;

type Props = {
  navigation: ViewUserScreenNavigationProp;
  route: ViewUserScreenRouteProp;
};


const ViewUserwatchlist = Akcru_Content[6];

const MAX_STATUS_LENGTH = 17; // Maximum number of characters for the username

export default function ViewUserScreen({route, navigation}: Props) {
    const [follow, setFollow] = useState(false);
    //Get current user
    const currentuser = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();
    const userID: string | undefined = route.params?.userID ?? null;
    const id: string | undefined = route.params?.id;
    const userprofile: string | undefined = route.params?.userName ?? null;

    const userId = route.params?.userId;

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    const archetype = user?.archetype ? JSON.parse(user.archetype) : null;
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            console.log('ViewUserScreen focused [ViewUserScreen]');
            hydrateUser();

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('ViewUserScreen Screen unfocused [ViewUserScreen]');
            };
        }, []),
    );

    const [cruInviteStatus, setCruInviteStatus] = useState('');

    useEffect(() => {
        const fetchCruInviteStatus = async () => {
            const status = await getCruInviteStatus(userID); // Assuming userID is the ID of the profile being viewed
            setCruInviteStatus(status);
            console.log('Cru Invite Status', status);
            // Update component state with the fetched status
            // This state will then be used to determine the label and action of the CRU Invite button
        };

        fetchCruInviteStatus();
    }, [userID]);

    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (userID) {
                // Assuming `userID` is the ID of the user being viewed
                try {
                    // Directly call `checkUserMembership` with `userID` (the ID of the user being viewed)
                    const membershipStatus = await checkUserMembership(userID);
                    setIsMember(membershipStatus);
                    console.log('Membership Status:', membershipStatus);
                } catch (error) {
                    console.error('Failed to fetch membership status:', error);
                }
            }
        };

        fetchData();
    }, [userID]); // Dependency array now only needs to include userID since currentuser.id is no longer needed for the API call

    // Determine button label and disabled status
    let btnName = 'CRU INVITE';
    let btnDisabled = false;
    let btnColor = COLORS.AKCRUBLUE

    if (cruInviteStatus === 'PENDING') {
        btnName = 'PENDING';
        btnDisabled = true;
        btnColor = COLORS.DARKGREY;
    } else if (isMember) {
        btnName = 'CRU MEMBER';
        btnDisabled = true;
        btnColor = COLORS.MIDORANGE;
    }

    useFocusEffect(
        React.useCallback(() => {
            //Find and set the viewed user
            findAUser({id: userID}).then(user => {
                setUser(user);
            });

            getUserFollowing(currentuser?.id).then(response => {
                if (response && response.success) {
                    const isFollowing = response.following.some(followedUser => followedUser.id === userID);
                    setFollow(isFollowing);
                } else {
                    setFollow(false);
                }
            });

            return () => {
                // Cleanup code if needed
            };
        }, [userID, currentuser?.id]),
    );

    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getFollowers(userID);
            // console.log('Data received:', result);
            if (result && result.followers && Array.isArray(result.followers)) {
                setFollowersData(result.followers); // Set the 'following' array as your data
            }
        };

        fetchData();
    }, [userID]);

    const followersCount = followersData.length;

    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showCruInviteSent, setShowCruInviteSent] = useState(false);

    const [userOptionModal, setUserOptionModal] = useState(false);

    const handleSendCruInvite = async () => {
        try {
            // Assume currentuser.id is the sender's ID
            const senderId = currentuser?.id as string;
            const username = user?.username as string; // The username of the invitee
            const response = await createACRUInvite({username, senderId});

            // Check the response or handle success/failure accordingly
            if (response) {
                // The invite was sent successfully
                setShowCruInviteSent(true);
                setShowConfirmationModal(false);

                // Start a timer to hide the modal after a certain duration
                setTimeout(() => {
                    setShowCruInviteSent(false);
                }, 4000); // 4000 milliseconds = 4 seconds
            }
        } catch (error) {
            // Handle any errors that may occur during the invite creation
            console.error(error);
        }
    };

    console.log('ViewUserScreen render', {follow});

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        setLoading(true);
        const response = await getBlockedUsers();
        if (response.success) {
            setBlockedUsers(response.blockedUsers || []);
        } else {
            // Handle failure
        }
        setLoading(false);
    };

    const handleReportUser = () => {
        // Using navigation2 as per your provided code snippet for navigating
        navigation2.navigate('ReportUser', {userID: userID});
        setUserOptionModal(false);
    };

    const handleFollowPress = async () => {
        console.log(`Attempting to ${follow ? 'unfollow' : 'follow'} user with ID: ${userID}`);

        if (follow) {
            try {
                const success = await unfollowUser({userId: userID});
                if (success) {
                    setFollow(false);
                    setUserOptionModal(false);
                } else {
                    console.error('Unfollow failed');
                }
            } catch (error) {
                console.error('Error on unfollow:', error);
            }
        } else {
            try {
                const success = await followUser({userId: userID});
                if (success) {
                    setFollow(true);
                    setUserOptionModal(false);
                } else {
                    console.error('Follow failed');
                }
            } catch (error) {
                console.error('Error on follow:', error);
            }
        }
    };

    // const handleBlockUser = async () => {
    //     if (userID) {
    //         const blockedId = userID;
    //         const {success, message} = await blockUser(blockedId);
    //         if (success) {
    //             Alert.alert('User successfully blocked');
    //             // Optionally refresh the user's data or navigate away
    //         } else {
    //             Alert.alert(`Failed to block user: ${message}`);
    //         }
    //     }
    // };

    // const handleUnblockUser = async userId => {
    //     const userIdToUnblock = userId;
    //     const {success, message} = await unblockUser(userIdToUnblock);
    //     if (success) {
    //         Alert.alert('Success', 'User successfully unblocked');
    //         fetchBlockedUsers(); // Refresh the list of blocked users
    //     } else {
    //         Alert.alert('Error', `Failed to unblock user: ${message}`);
    //     }
    // };

    const isValidImageUrl = (url: string) => {
        return url && url.trim() !== '';
    };

    const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
    const selectedPhotoAnimatedOpacity = useRef(new Animated.Value(0)).current;

    const openPhoto = (photoUri: string) => {
        setSelectedPhotoUri(photoUri);
        Animated.timing(selectedPhotoAnimatedOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closePhoto = () => {
        Animated.timing(selectedPhotoAnimatedOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedPhotoUri(null));
    };

    const [isAvatarModalVisible, setAvatarModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleAvatarModal = () => {
        setAvatarModalVisible(!isAvatarModalVisible);
    };

    const [watchlist, setWatchlist] = useState<IMovie[]>([]); // State to store the watchlist data

    // Fetch the watchlist when the component is focused or when the user ID changes
    useFocusEffect(
        React.useCallback(() => {
            // ... (other code)

            const fetchWatchlist = async () => {
                try {
                    const userId = user?.id; // Get the current user's ID
                    if (userId) {
                        const watchlistMovies = await getWatchlist(userId);
                        setWatchlist(watchlistMovies);
                    }
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                }
            };

            fetchWatchlist();
        }, [user?.id]), // Re-run the effect if the user's ID changes
    );

    const [currentlyWatching, setCurrentlyWatching] = useState([]); // Adjust the initial state based on your data structure

    useFocusEffect(
        React.useCallback(() => {
            const fetchCurrentlyWatching = async () => {
                try {
                    const userId = user?.id; // Get the current user's ID
                    if (userId) {
                        const currentWatchingData = await getUserCurrentWatching(userId); // Replace with your actual API call
                        console.log('currentWatchingData', currentWatchingData);
                        setCurrentlyWatching(currentWatchingData);
                    }
                } catch (error) {
                    console.error('Error fetching currently watching:', error);
                }
            };

            fetchCurrentlyWatching();
        }, [user?.id]), // Re-run the effect if the user's ID changes
    );

    
        const isUserBlocked = blockedUsers.some(blockedUser => blockedUser.id === userID);

        const [blockUserModal, setBlockUserModal] = useState(false);
        const [modalType, setModalType] = useState('');
        const [blockUserMessage, setBlockUserMessage] = useState('');
        const [iconName, setIconName] = useState('');

        const closeModal = () => {
            setBlockUserModal(false);
        };


        const handleBlockUserPress = async () => {
            console.log(`Attempting to ${isUserBlocked ? 'unblock' : 'block'} user with ID: ${userID}`);

            if (isUserBlocked) {
                try {
                    const {success, message} = await unblockUser(userID); // Assuming userID is the ID of the user to unblock
                    if (success) {
                        // Alert.alert('User successfully unblocked');
                        setModalType('success');
                        setBlockUserMessage('User successfully unblocked');
                        setBlockUserModal(true);
                        setIconName('account-check');
                        // setIsUserBlocked(false); // Update state to reflect the change
                        fetchBlockedUsers(); // Optionally refresh the list of blocked users if you're maintaining such a list
                        setUserOptionModal(false); // Assuming this closes the modal where the block/unblock option is shown
                    } else {
                        // Alert.alert('Error', `Failed to unblock user: ${message}`);
                        setModalType('failed');
                        setBlockUserMessage('Failed to unblock user');
                        setIconName('alert-circle');
                        setBlockUserModal(true);
                    }
                } catch (error) {
                    console.error('Error on unblock:', error);
                    // Alert.alert('Error', 'An error occurred while trying to unblock the user.');
                    setModalType('error');
                    setBlockUserMessage('An error occurred while trying to unblock the user.');
                    setBlockUserModal(true);
                    setIconName('alert-circle');
                }
            } else {
                try {
                    const {success, message} = await blockUser(userID); // Assuming userID is the ID of the user to block
                    if (success) {
                        // Alert.alert('User successfully blocked');
                        setModalType('success');
                        setBlockUserMessage('User successfully blocked');
                        setBlockUserModal(true);
                        setIconName('hand-back-left');
                        // setIsUserBlocked(true); // Update state to reflect the change
                        fetchBlockedUsers(); // Optionally refresh the list of blocked users if you're maintaining such a list
                        setUserOptionModal(false); // Assuming this closes the modal where the block/unblock option is shown
                    } else {
                        // Alert.alert('Error', `Failed to block user: ${message}`);
                        setModalType('failed');
                        setBlockUserMessage('Failed to block user');
                        setIconName('alert-circle');
                        setBlockUserModal(true);
                    }
                } catch (error) {
                    console.error('Error on block:', error);
                    // Alert.alert('Error', 'An error occurred while trying to block the user.');
                    setModalType('error');
                    setBlockUserMessage('An error occurred while trying to block the user.');
                    setBlockUserModal(true);
                    setIconName('alert-circle');
                }
            }
        };

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>
                    <View style={{marginBottom: '5%'}}>
                        <ImageBackground
                            //   source={{uri: digitalpass ?? undefined}}
                            source={{uri: undefined}}
                            resizeMode="cover"
                            style={{height: SIZES.ScreenHeight / 3.7, marginTop: -60}}>
                            <LinearGradient
                                // Digitalpass Linear Gradient overlay
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight / 3.7,
                                }}
                            />
                            <View
                                style={{
                                    marginTop: 60,
                                    marginHorizontal: 15,
                                    marginBottom: 10,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
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
                                <TouchableOpacity onPress={() => setUserOptionModal(true)}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon
                                            name="ellipsis-vertical"
                                            type="ionicon"
                                            size={20}
                                            color={COLORS.LIGHTGREY}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginHorizontal: 15,
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{marginRight: 8}}>
                                        <Pressable onPress={toggleAvatarModal}>
                                            <HexAvatar
                                                source={{uri: user?.profilePicture}}
                                                size={60}
                                                bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                            />
                                        </Pressable>
                                        <Modal visible={isAvatarModalVisible} animationType="fade" transparent={true}>
                                            <Pressable
                                                onPress={toggleAvatarModal}
                                                style={{
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                }}>
                                                <TouchableWithoutFeedback>
                                                    <Image
                                                        source={
                                                            user?.profilePicture
                                                                ? {uri: user?.profilePicture}
                                                                : imageindex.Akcruplaceholder
                                                        }
                                                        style={{width: '95%', height: '50%'}}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableWithoutFeedback>
                                            </Pressable>
                                        </Modal>
                                    </View>
                                    <View style={{width: SIZES.ScreenWidth * 0.25}}>
                                        <View style={{flexDirection: 'row'}}>
                                            <Text style={{...FONTS.Title2, fontSize: 12}}>{user?.username}</Text>

                                            {/* {
                                  true && (
                                //   influencer && (
                                      <Icon
                                          name="ribbon"
                                          type="ionicon"
                                          color={COLORS.AKCRUBLUE}
                                          size={20}
                                          style={{marginLeft: 5}}
                                      />
                                  )} */}
                                        </View>
                                        {user?.firstName && (
                                            <Text style={{...FONTS.paragraph1, fontSize: 12, color: COLORS.LIGHTGREY}}>
                                                {user?.firstName ? user.firstName : ''}
                                            </Text>
                                        )}
                                        {user?.badge === 'AKCRUIT' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeAkcruit />
                                            </View>
                                        )}
                                        {user?.badge === 'GUARDIAN' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeGuardian />
                                            </View>
                                        )}
                                        {user?.badge === 'HERO' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeHero />
                                            </View>
                                        )}
                                        {user?.badge === 'SUPERHERO' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeSuperHero />
                                            </View>
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            borderLeftWidth: 2,
                                            borderRightWidth: 2,
                                            borderColor: COLORS.TRANSPURPLE,
                                            width: 100,
                                            height: 60,
                                            justifyContent: 'center',

                                            alignItems: 'center',
                                        }}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.navigate('ViewUserFollowList', {
                                                    userID: userID,
                                                })
                                            }
                                            style={{
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{...FONTS.Title3, fontSize: 14}}>{followersCount}</Text>
                                            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, fontSize: 12}}>
                                                Followers
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        height: 50,
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                    }}>
                                    <View
                                        style={{
                                            alignItems: 'center',
                                        }}>
                                        <TouchableOpacity
                                            style={{alignItems: 'center'}}
                                            onPress={() => {
                                                navigation.navigate('SendMITViewUser', {
                                                    userID,
                                                });
                                            }}>
                                            <Image source={imageindex.MITticket} style={{height: 40}} />
                                            <Text style={{color: 'white', fontSize: 10}}>Send User a MIT</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            {currentlyWatching?.length > 0 && currentlyWatching[0].finishedAt === null && (
                                <View style={{marginHorizontal: 15}}>
                                    <Text
                                        style={{
                                            ...FONTS.paragraph1,
                                            fontSize: 12,
                                            color: COLORS.PURPLE,
                                            textAlign: 'center',
                                        }}>
                                        {user?.username} is watching "{currentlyWatching[0].movie.title}"
                                    </Text>
                                </View>
                            )}
                        </ImageBackground>
                        <View
                            style={{
                                marginTop: -30,
                                marginHorizontal: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            {/* <Pressable
                                onPress={() =>
                                    navigation.navigate('ViewUserFollowList', {
                                        userID: userID,
                                    })
                                }
                                style={{
                                    width: 100,
                                    height: 30,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text style={{...FONTS.Title3, fontSize: 14}}>{followersCount}</Text>
                                <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Followers</Text>
                            </Pressable> */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: SIZES.ScreenWidth * 0.93,
                                    alignItems: 'center',
                                }}>
                                <AkcruButtons.FollowButton
                                    btnname={btnName}
                                    onPress={() => !btnDisabled && setShowConfirmationModal(true)}
                                    color={btnColor}
                                    disabled={btnDisabled}
                                />
                                {/* Cru Invite Confirmation Modal */}
                                <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                                    <ComfirmationModal
                                        confirmationText={`Are you sure you want to send "${user?.username}" a Cru invite?`}
                                        onPressYes={handleSendCruInvite}
                                        onPressNo={() => setShowConfirmationModal(false)}
                                    />
                                </Modal>
                                {/* Cru Invite Sent Modal */}
                                <Modal animationType="fade" transparent={true} visible={showCruInviteSent}>
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
                                                {`You have sent "${user?.username}" a Cru invite! You will be notified if they ACCEPT or DECLINE the invite`}
                                            </Text>
                                        </View>
                                    </View>
                                </Modal>

                                <Modal visible={userOptionModal} transparent={true} animationType="fade">
                                    <ViewUserOptionModal
                                        username={user?.username}
                                        closeModal={() => setUserOptionModal(false)}
                                        blockUser={() => {
                                            handleBlockUserPress();
                                            setUserOptionModal(false);
                                        }}
                                        reportUser={handleReportUser}
                                        followUser={() => {
                                            handleFollowPress();
                                            setUserOptionModal(false);
                                        }}
                                        followToggleIcon={follow ? 'person-subtract' : 'person-add'}
                                        followIconType={'ionicon'}
                                        followToggleText={follow ? 'Unfollow' : 'Follow'}
                                        cruInviteUser={() => setShowConfirmationModal(true)}
                                        blockToggleText={isUserBlocked ? 'Unblock' : 'Block'}
                                    />
                                </Modal>

                                <AkcruButtons.FollowButton
                                    btnname={follow ? 'UNFOLLOW' : 'FOLLOW'}
                                    onPress={handleFollowPress}
                                    color={follow ? COLORS.CATPURPDRK : COLORS.PURPLE}
                                    disabled={false}
                                />
                            </View>
                        </View>
                        {user?.private ? (
                            <View style={{marginHorizontal: 15, marginTop: SIZES.ScreenHeight / 7}}>
                                <Text style={{...FONTS.Title3, textAlign: 'center', marginBottom: 20}}>
                                    This account is private
                                </Text>
                                <Icon name="lock" type="material-community" color={COLORS.LIGHTGREY} size={65} />
                            </View>
                        ) : (
                            <View>
                                <View style={{marginHorizontal: 15, paddingTop: 20}}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            color: COLORS.LIGHTGREY,
                                            fontSize: 12,
                                        }}>
                                        {user?.description}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.desctext}>ARCHETYPE</Text>

                                    <View
                                        style={{
                                            justifyContent: 'center',
                                            paddingHorizontal: 10,
                                        }}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2,
                                                paddingBottom: 5,
                                                textAlign: 'center',
                                                color: COLORS.PURPLE,
                                            }}>
                                            {archetype ? archetype.name : 'No Archetype Selected'}
                                        </Text>
                                        <View style={{paddingBottom: 10, paddingRight: 10, alignItems: 'center'}}>
                                            {archetype && isValidImageUrl(archetype.image) && (
                                                <Pressable onPress={toggleModal}>
                                                    <Image
                                                        source={{uri: archetype ? archetype.image : ''}}
                                                        style={{
                                                            width: SIZES.ScreenWidth / 2.2,
                                                            height: SIZES.ScreenWidth / 2.2,
                                                            borderRadius: 5,
                                                        }}
                                                    />
                                                </Pressable>
                                            )}
                                        </View>
                                        {archetype && (
                                            <View>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        paddingBottom: 5,
                                                        justifyContent: 'center',
                                                    }}>
                                                    <Text style={styles.drawfonttag}>
                                                        {capitalizeFirstLetterOfString(
                                                            archetype ? archetype.genres[0] : '',
                                                        )}
                                                    </Text>
                                                    <Text style={styles.drawfonttag}>
                                                        {' '}
                                                        {capitalizeFirstLetterOfString(
                                                            archetype ? archetype.genres[1] : '',
                                                        )}
                                                    </Text>
                                                </View>
                                                <Text style={{...FONTS.Title2, fontSize: 12, textAlign: 'center'}}>
                                                    {archetype ? archetype.description : ''}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {user?.Cru?.name !== 'My Cru' && user?.Cru?.name !== null && (
                                        <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 10}}>
                                            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>CRU Name: </Text>
                                            <Text style={{...FONTS.Title2}}>{user?.Cru?.name}</Text>
                                        </View>
                                    )}

                                    {/* Create a modal to display the enlarged image */}
                                    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                                        <Pressable
                                            onPress={toggleModal}
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            }}>
                                            {/* Display the enlarged image */}
                                            <TouchableWithoutFeedback>
                                                <Image
                                                    source={{uri: archetype ? archetype.image : ''}}
                                                    style={{
                                                        width: '100%',
                                                        height: '50%',
                                                        borderRadius: 5,
                                                    }}
                                                />
                                            </TouchableWithoutFeedback>
                                        </Pressable>
                                    </Modal>
                                    <View style={styles.seperator} />
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            marginTop: 10,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>GALLERY</Text>
                                        <Icon
                                            name="images"
                                            type="ionicon"
                                            color={COLORS.LIGHTGREY}
                                            size={20}
                                            style={{marginLeft: 5}}
                                        />
                                    </View>
                                    <View style={styles.gallerycontainer}>
                                        <View style={styles.galleryImagesContainer}>
                                            {user?.gallery &&
                                                user.gallery.map((imageUri, index) => {
                                                    return (
                                                        <TouchableOpacity
                                                            key={index.toString()}
                                                            onPress={() => openPhoto(imageUri)}
                                                            activeOpacity={0.8}>
                                                            <Image
                                                                source={{uri: imageUri}}
                                                                style={styles.galleryImage}
                                                            />
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                        </View>
                                    </View>
                                    {watchlist.length > 0 && ( // Only render WatchListCategory if watchlist has movies
                                        <View style={styles.watchlistcontainer}>
                                            <Text style={styles.watchlisttext}>{user?.username}'s Watchlist</Text>
                                            <View>
                                                <ViewUserWatchListCategory
                                                    Akcru_Content={{
                                                        id: 'YourFavourite',
                                                        title: '',
                                                        movies: watchlist,
                                                    }}
                                                    updateWatchlist={() => ''}
                                                />
                                            </View>
                                        </View>
                                    )}
                                    {/* <View style={styles.seperator} />
                          <View style={styles.watchlistcontainer}>
                              <Text style={styles.watchlisttext}>{user?.username} Watchlist</Text>
                              <View style={{flexDirection: 'row', marginLeft: 15}}>
                                  <View style={{marginRight: 25}}>
                                      <TouchableOpacity>
                                          <Icon
                                              name="thumb-up-outline"
                                              type="material-community"
                                              color={'green'}
                                              size={SIZES.MedIcon}
                                          />
                                      </TouchableOpacity>
                                      <Text style={{...FONTS.Title2}}>I Like</Text>
                                  </View>
                                  <View>
                                      <TouchableOpacity>
                                          <Icon
                                              name="thumb-down-outline"
                                              type="material-community"
                                              color={'red'}
                                              size={SIZES.MedIcon}
                                          />
                                      </TouchableOpacity>
                                      <Text style={{...FONTS.Title2}}>Nah</Text>
                                  </View>
                              </View>
                          </View>

                          <View style={{marginBottom: 75, marginTop: -20}}>
                              <BasicListCategories Akcru_Content={ViewUserwatchlist} />
                          </View> */}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
                {selectedPhotoUri && (
                    <TouchableOpacity style={styles.selectedPhotoContainer} onPress={closePhoto} activeOpacity={1}>
                        <Animated.Image
                            source={{uri: selectedPhotoUri}}
                            resizeMode="contain"
                            style={[styles.selectedPhoto, {opacity: selectedPhotoAnimatedOpacity}]}
                        />
                    </TouchableOpacity>
                )}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={blockUserModal}
                    onRequestClose={() => {
                        setBlockUserModal(!blockUserModal);
                    }}>
                    <BlockUserResultModal closeModal={closeModal} type={modalType} resultMessage={blockUserMessage} iconName={iconName} />
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
}
