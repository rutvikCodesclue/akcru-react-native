import {
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    Image,
    ScrollView,
    Pressable,
    Modal,
    SafeAreaView,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import styles from './styles';
import React, {useEffect, useRef, useState} from 'react';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {
    blockUser,
    findAUser,
    followUser,
    getBlockedUsers,
    getFollowers,
    getUserCurrentWatching,
    getUserFollowing,
    unblockUser,
    unfollowUser,
} from '../../../lib/api/user.lib';
import {IMovie, IUserProfile} from '../../../../types';
import {capitalizeFirstLetterOfString, formatNumber, selectAvatarBorderColor} from '../../../util/util';
import {checkUserMembership, createACRUInvite, getCruInviteStatus} from '../../../lib/api/cru.lib';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import ViewUserOptionModal from '../../../components/ViewUserOptionModal/ViewUserOptionModal';
import ComfirmationModal from '../../../components/ConfirmationModal';
import useAuthStore from '../../../stores/auth.store';
import {getViewedUserWatchlist} from '../../../lib/api/movies.lib';
import ViewUserWatchListCategory from '../../../components/ViewUserWatchlist';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import AkcruButtons from '../../../components/akcruButtons';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {MULTISIZES} from '../../../../assets/constants/theme';
import GalleryPic from '../../../components/GalleryPic';
import BackButton from '../../../components/General/backbutton';

type ViewUserScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ViewUserScreen'>;

type ViewUserScreenRouteProp = RouteProp<UserProfileStackParams, 'ViewUserScreen'>;

type Props = {
    navigation: ViewUserScreenNavigationProp;
    route: ViewUserScreenRouteProp;
};

export default function ViewUserScreen({route, navigation}: Props) {
    const [follow, setFollow] = useState(false);

    const currentuser = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();
    const userID: string | undefined = route.params?.userID ?? null;

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    const archetype = user?.archetype ? JSON.parse(user.archetype) : null;
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();

            return () => {};
        }, []),
    );

    const [cruInviteStatus, setCruInviteStatus] = useState('');

    const [watchlist, setWatchlist] = useState<IMovie[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchWatchlist = async () => {
                if (userID) {
                    try {
                        const watchlistMovies = await getViewedUserWatchlist(userID);
                        setWatchlist(watchlistMovies);
                    } catch (error) {
                        console.error('Error fetching watchlist:', error);
                    }
                }
            };

            fetchWatchlist();
        }, [userID]),
    );

    useEffect(() => {
        const fetchCruInviteStatus = async () => {
            const status = await getCruInviteStatus(userID);
            setCruInviteStatus(status);
            if (status === 'PENDING') {
                setbtnName('PENDING')
                setbtnDisabled(true)
                setbtnColor(COLORS.DARKGREY)
            } 
        };

        fetchCruInviteStatus();
    }, [userID]);

    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (userID) {
                try {
                    const membershipStatus = await checkUserMembership(userID);
                    setIsMember(membershipStatus);
                    if (membershipStatus) {
                        setbtnName('CRU MEMBER')
                        setbtnDisabled(true)
                        setbtnColor(COLORS.PINK)
                    }
                } catch (error) {
                    console.error('Failed to fetch membership status:', error);
                }
            }
        };

        fetchData();
    }, [userID]);
    const [btnName, setbtnName] = useState('CRU INVITE');
    const [btnDisabled, setbtnDisabled] = useState(false);
    const [btnColor, setbtnColor] = useState(COLORS.AKCRUBLUE);


   

    useFocusEffect(
        React.useCallback(() => {
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

            return () => {};
        }, [userID, currentuser?.id]),
    );

    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getFollowers(userID);

            if (result && result.followers && Array.isArray(result.followers)) {
                setFollowersData(result.followers);
            }
        };

        fetchData();
    }, [userID]);

    const followersCount = followersData.length;

    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showCruInviteSent, setShowCruInviteSent] = useState(false);

    const [userOptionModal, setUserOptionModal] = useState(false);

    const handleSendCruInvite = async () => {
        try {
            const senderId = currentuser?.id as string;
            const username = user?.username as string;
            const response = await createACRUInvite({username, senderId});

            if (response) {
                setShowCruInviteSent(true);
                setShowConfirmationModal(false);
                setbtnName('PENDING')
                setbtnDisabled(true)
                setbtnColor(COLORS.DARKGREY)

                setTimeout(() => {
                    setShowCruInviteSent(false);
                }, 4000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        setLoading(true);
        const response = await getBlockedUsers();
        if (response.success) {
            setBlockedUsers(response.blockedUsers || []);
        } else {
        }
        setLoading(false);
    };

    const handleReportUser = () => {
        navigation2.navigate('ReportUser', {userID: userID});
        setUserOptionModal(false);
    };

    const handleFollowPress = async () => {
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

    const isValidImageUrl = (url: string) => {
        return url && url.trim() !== '';
    };

    const [selectedPhotoUri, setSelectedPhotoUri] = useState(route.params?.imageURL || null);
    const selectedPhotoAnimatedOpacity = useRef(new Animated.Value(0)).current;

    const openPhoto = (photoItem: any) => {
        setSelectedPhotoUri(photoItem.imageURL);
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

    const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

    const toggleAvatarModal = () => {
        setAvatarModalVisible(!isAvatarModalVisible);
    };

    const [currentlyWatching, setCurrentlyWatching] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchCurrentlyWatching = async () => {
                try {
                    const userId = user?.id;
                    if (userId) {
                        const currentWatchingData = await getUserCurrentWatching(userId);
                        setCurrentlyWatching(currentWatchingData);
                    }
                } catch (error) {
                    console.error('Error fetching currently watching:', error);
                }
            };

            fetchCurrentlyWatching();
        }, [user?.id]),
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
        if (isUserBlocked) {
            try {
                const {success, message} = await unblockUser(userID);
                if (success) {
                    setModalType('success');
                    setBlockUserMessage('User successfully unblocked');
                    setBlockUserModal(true);
                    setIconName('account-check');

                    fetchBlockedUsers();
                    setUserOptionModal(false);
                } else {
                    setModalType('failed');
                    setBlockUserMessage('Failed to unblock user');
                    setIconName('alert-circle');
                    setBlockUserModal(true);
                }
            } catch (error) {
                console.error('Error on unblock:', error);

                setModalType('error');
                setBlockUserMessage('An error occurred while trying to unblock the user.');
                setBlockUserModal(true);
                setIconName('alert-circle');
            }
        } else {
            try {
                const {success, message} = await blockUser(userID);
                if (success) {
                    setModalType('success');
                    setBlockUserMessage('User successfully blocked');
                    setBlockUserModal(true);
                    setIconName('hand-back-left');

                    fetchBlockedUsers();
                    setUserOptionModal(false);
                } else {
                    setModalType('failed');
                    setBlockUserMessage('Failed to block user');
                    setIconName('alert-circle');
                    setBlockUserModal(true);
                }
            } catch (error) {
                console.error('Error on block:', error);

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
                        <View style={{ marginTop: -60}}>
                            <LinearGradient
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight / 2.3,
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
                                <BackButton navigation={navigation} />
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
                                                size={MULTISIZES.Xlarge80}
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
                                </View>
                                <View
                                    style={{
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
                                        <Text style={{...FONTS.Title1, color: COLORS.AKCRUBLUE}}>
                                            {formatNumber(followersCount)}
                                        </Text>
                                        <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>Followers</Text>
                                    </TouchableOpacity>
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
                                            <Text style={{color: 'white', ...FONTS.chart}}>Send User a MIT</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: SIZES.ScreenWidth, marginHorizontal: 15}}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{...FONTS.Title2, marginRight: 2}}>{user?.username}</Text>
                                    {user?.ownerStatus && (
                                        <CustomIcon
                                            name="ribbon"
                                            type="ionicon"
                                            color={COLORS.STARGOLD}
                                            baseSize={MULTISIZES.small11}
                                            style={{marginRight: 0}}
                                        />
                                    )}
                                    {user?.companyStatus && (
                                        <CustomIcon
                                            name="ribbon"
                                            type="ionicon"
                                            color={COLORS.WHITE}
                                            baseSize={12}
                                            style={{marginRight: 0}}
                                        />
                                    )}
                                    {user?.influencerStatus && (
                                        <CustomIcon
                                            name="ribbon"
                                            type="ionicon"
                                            color={COLORS.AKCRUBLUE}
                                            baseSize={12}
                                            style={{marginRight: 0}}
                                        />
                                    )}
                                    {user?.blackCloakStatus && (
                                        <CustomIcon
                                            name="ribbon"
                                            type="ionicon"
                                            color={COLORS.BLACKCLOAK}
                                            baseSize={12}
                                            style={{marginRight: 0}}
                                        />
                                    )}
                                    {user?.isAdmin && (
                                        <CustomIcon
                                            name="police-badge"
                                            type="material-community"
                                            color={COLORS.STARGOLD}
                                            baseSize={12}
                                            style={{marginRight: 0}}
                                        />
                                    )}
                                </View>

                                {user?.firstName && (
                                    <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                                        {user?.firstName ? user.firstName : ''}
                                    </Text>
                                )}
                                <View style={{flexDirection: 'row'}}>
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
                            </View>
                            <View style={{marginHorizontal: 15, paddingTop: '2%'}}>
                                <Text
                                    style={{
                                        ...FONTS.paragraph1,
                                        color: COLORS.LIGHTGREY,
                                    }}>
                                    {user?.description}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                marginTop: 10,
                                marginHorizontal: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
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

                                <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                                    <ComfirmationModal
                                        confirmationText={`Are you sure you want to send "${user?.username}" a Cru invite?`}
                                        onPressYes={handleSendCruInvite}
                                        onPressNo={() => setShowConfirmationModal(false)}
                                    />
                                </Modal>

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
                                {/* {currentlyWatching?.length > 0 && currentlyWatching[0].finishedAt === null && (
                                    <View style={{marginHorizontal: 15, marginTop: '5%'}}>
                                        <Text
                                            style={{
                                                ...FONTS.paragraph1,

                                                color: COLORS.LIGHTGREY,
                                                textAlign: 'center',
                                            }}>
                                            {user?.username} is watching "{currentlyWatching[0].movie.title}"
                                        </Text>
                                    </View>
                                )} */}
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
                                                <Text style={{...FONTS.paragraph1, textAlign: 'center'}}>
                                                    {archetype ? archetype.description : ''}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {user?.Cru?.name !== 'My Cru' && user?.Cru?.name !== null && (
                                        <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 10}}>
                                            <Text style={{...FONTS.Title2, color: COLORS.PINK}}>CRU Name: </Text>
                                            <Text style={{...FONTS.Title2}}>{user?.Cru?.name}</Text>
                                        </View>
                                    )}

                                    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                                        <Pressable
                                            onPress={toggleModal}
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            }}>
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
                                    {watchlist.length > 0 && (
                                        <>
                                            <View style={styles.seperator} />
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
                                        </>
                                    )}
                                    {user?.userGallery && user.userGallery.length > 0 && (
                                        <>
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
                                                    {user?.userGallery &&
                                                        user.userGallery.map((item, index) => {
                                                            return (
                                                                <TouchableOpacity
                                                                    key={index.toString()}
                                                                    onPress={() => openPhoto(item)}
                                                                    activeOpacity={0.8}>
                                                                    <Image
                                                                        source={{uri: item.imageURL}}
                                                                        style={styles.galleryImage}
                                                                    />
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                </View>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
                {selectedPhotoUri && (
                    <TouchableOpacity style={styles.selectedPhotoContainer} activeOpacity={1}>
                        <GalleryPic image={selectedPhotoUri} />
                        <View style={{marginTop: '10%'}}>
                            <TouchableOpacity onPress={closePhoto}>
                                <Text style={{...FONTS.Title2}}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <Animated.Image
                            source={{uri: selectedPhotoUri}}
                            resizeMode="contain"
                            style={[styles.selectedPhoto, {opacity: selectedPhotoAnimatedOpacity}]}
                        /> */}
                    </TouchableOpacity>
                )}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={blockUserModal}
                    onRequestClose={() => {
                        setBlockUserModal(!blockUserModal);
                    }}>
                    <BlockUserResultModal
                        closeModal={closeModal}
                        type={modalType}
                        resultMessage={blockUserMessage}
                        iconName={iconName}
                    />
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
}
