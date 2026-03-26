import * as React from 'react';
import { navigate } from '../../../util/RootNavigation';

import {
    View,
    useWindowDimensions,
    Text,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Modal,
    ActivityIndicator,
} from 'react-native';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import {
    UserProfileCruInvites,
    UserProfileDatesTab,
    UserProfileDetailsTab,
    UserProfileWalletTab,
} from '../UserProfileTabs';
import {SIZES, COLORS, FONTS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import imageindex from '../../../../assets/images/imageindex';
import {PressableAndroidRippleConfig} from 'react-native';
import {StyleProp} from 'react-native';
import {ViewStyle} from 'react-native';
import {TextStyle} from 'react-native';
import {Route} from 'react-native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect} from 'react';
import useAuthStore from '../../../stores/auth.store';
import {formatNumber, selectAvatarBorderColor} from '../../../util/util';
import {ICruInvite, ICruView, IMITInvite, IUserProfile} from '../../../../types';
import {getMyMITInvites} from '../../../lib/api/mit.lib';
import {getCRUInvites, getMyCRUViews} from '../../../lib/api/cru.lib';
import {isAfter, isBefore} from 'date-fns';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {getFollowers, upgradeCRUView} from '../../../lib/api/user.lib';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {isTablet, MULTISIZES} from '../../../../assets/constants/theme';
import AkcruButtons from '../../../components/akcruButtons';
import {newVisitUserProfile, newVisitUserProfileUpdate} from '../../../lib/api/userProfile.lib';
import Video from 'react-native-video';

type UserProfileScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'UserProfileScreen'>;

type UserProfileScreenRouteProp = RouteProp<UserProfileStackParams, 'UserProfileScreen'>;

type Props = {
    navigation: UserProfileScreenNavigationProp;
    route: UserProfileScreenRouteProp;
};

const FirstRoute = () => (
    <View>
        <UserProfileDetailsTab />
    </View>
);

const SecondRoute = () => <UserProfileDatesTab />;

const ThirdRoute = () => (
    <View>
        <UserProfileCruInvites />
    </View>
);

const FourthRoute = () => <UserProfileWalletTab />;

const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
    fourth: FourthRoute,
});

export default function UserProfileScreen({navigation, route}: Props) {
    const {user, hydrateUser} = useAuthStore();
    const [showMITEntryErr, setshowMITEntryErr] = useState(false);
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const {tabKey = 'first'} = route.params || {};
    const [index, setIndex] = React.useState(
        tabKey === 'first' ? 0 : tabKey === 'second' ? 1 : tabKey === 'third' ? 2 : 3,
    );

    const [inviteCount, setInviteCount] = React.useState<number>(0);
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite)[]>([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [loadingUpgrade, setLoadingUpgrade] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [upgradeResult, setUpgradeResult] = useState<'success' | 'error' | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            getRoomLimitRouteParam();

            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, []),
    );

    const getRoomLimitRouteParam = async () => {
        const isRoomTimeLimitCompleted = await AsyncStorage.getItem('isRoomTimeLimitCompleted');
        if (isRoomTimeLimitCompleted === 'true') {
            setshowMITEntryErr(true);
            AsyncStorage.removeItem('isRoomTimeLimitCompleted');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getMyMITInvites({pending: true}).then(mitInvites => {
                if (mitInvites) {
                    const mitInviteCount = mitInvites.length;

                    setInvites(
                        mitInvites.sort((a, b) => {
                            if (a.createdAt < b.createdAt) {
                                return 1;
                            }
                            if (a.createdAt > b.createdAt) {
                                return -1;
                            }
                            return 0;
                        }),
                    );

                    setIsLoaded(true);

                    setInviteCount(mitInviteCount);
                } else {
                    setIsLoaded(true);
                    setInviteCount(0);
                }
            });

            return () => {};
        }, []),
    );

    React.useEffect(() => {
        setInviteCount(invites.length);
    }, [invites]);

    const [pendingCRUInviteCount, setPendingCRUInviteCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            getCRUInvites({pending: true}).then(cruInvites => {
                if (cruInvites) {
                    const pendingCRUInvites = cruInvites.filter(
                        (invite: {status: string}) => invite.status !== 'ACCEPTED' && invite.status !== 'DECLINED',
                    );

                    setPendingCRUInviteCount(pendingCRUInvites.length);

                    setIsLoaded(true);
                }
            });

            return () => {};
        }, []),
    );

    const [eventCount, setEventCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            const fetchMyEvents = async () => {
                try {
                    const myCRUViews = await getMyCRUViews({upcoming: true});
                    const myMITs = await getMyMITInvites({accepted: true, me: true});

                    if (myCRUViews && myMITs) {
                        let events = [...myCRUViews, ...myMITs];

                        setEventCount(events.length);

                        setMyEvents(
                            events.sort((a, b) => {
                                let date1 = new Date(a.startDate);
                                let date2 = new Date(b.startDate);

                                if (isAfter(date1, date2)) {
                                    return 1;
                                }
                                if (isBefore(date1, date2)) {
                                    return -1;
                                }
                                return 0;
                            }),
                        );
                    }
                } catch (error) {
                    console.error('Error getting my Events:', error);
                }
            };
            fetchMyEvents();
        }, []),
    );

    const datesIndicatorCount = eventCount;
    const cruInvitesIndicatorCount = pendingCRUInviteCount;

    const renderTabBar = (
        props: JSX.IntrinsicAttributes &
            SceneRendererProps & {
                navigationState: NavigationState<Route>;
                scrollEnabled?: boolean | undefined;
                bounces?: boolean | undefined;
                activeColor?: string | undefined;
                inactiveColor?: string | undefined;
                pressColor?: string | undefined;
                pressOpacity?: number | undefined;
                getLabelText?: ((scene: Scene<Route>) => string | undefined) | undefined;
                getAccessible?: ((scene: Scene<Route>) => boolean | undefined) | undefined;
                getAccessibilityLabel?: ((scene: Scene<Route>) => string | undefined) | undefined;
                getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined;
                renderLabel?:
                    | ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode)
                    | undefined;
                renderIcon?: ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode) | undefined;
                renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined;
                renderIndicator?: ((props: TabBarIndicatorProps<Route>) => React.ReactNode) | undefined;
                renderTabBarItem?:
                    | ((
                          props: TabBarItemProps<Route> & {key: string},
                      ) => React.ReactElement<any, string | React.JSXElementConstructor<any>>)
                    | undefined;
                onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined;
                onTabLongPress?: ((scene: Scene<Route>) => void) | undefined;
                tabStyle?: StyleProp<ViewStyle>;
                indicatorStyle?: StyleProp<ViewStyle>;
                indicatorContainerStyle?: StyleProp<ViewStyle>;
                labelStyle?: StyleProp<TextStyle>;
                contentContainerStyle?: StyleProp<ViewStyle>;
                style?: StyleProp<ViewStyle>;
                gap?: number | undefined;
                testID?: string | undefined;
                android_ripple?: PressableAndroidRippleConfig | undefined;
            },
    ) => (
        <TabBar
            {...props}
            indicatorStyle={{backgroundColor: COLORS.PURPLE}}
            scrollEnabled={false}
            tabStyle={{width: SIZES.ScreenWidth / 4}}
            labelStyle={{...FONTS.Title2, color: COLORS.LIGHTGREY}}
            style={{
                backgroundColor: COLORS.AKCRUBACKGROUND,
                justifyContent: 'space-between',
            }}
            contentContainerStyle={{
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
            }}
            activeColor={COLORS.PURPLE}
            renderBadge={({route}) => {
                if (route.key === 'second' && datesIndicatorCount > 0) {
                    return <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.AKCRUBLUE}} />;
                } else if (route.key === 'third' && cruInvitesIndicatorCount > 0) {
                    return <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.AKCRUBLUE}} />;
                }
                return null;
            }}
        />
    );

    const layout = useWindowDimensions();

    const [routes] = React.useState([
        {key: 'first', title: 'Details'},
        {key: 'second', title: 'Dates'},
        {key: 'third', title: 'Cru Inv'},
        {key: 'fourth', title: 'Wallet'},
    ]);

    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);
    const [skipped, setSkipped] = useState(false); // ⬅️ moved above returns
    const [firstTimeVisit, setFirstTimeVisit] = useState<any>(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                if (user?.id) {
                    try {
                        const result = await getFollowers(user.id);
                        if (result && result.followers && Array.isArray(result.followers)) {
                            setFollowersData(result.followers);
                        }
                    } catch (error) {
                        console.error('Error fetching followers:', error);
                    }
                }
            };

            fetchData();

            return () => {};
        }, [user?.id]),
    );

    const followersCount = formatNumber(followersData.length);

    useEffect(() => {
        const loadData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false); // Data has loaded, set loading to false
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        async function checkFirstTimeVisit() {
            try {
                const isNewVisit = await newVisitUserProfile();
                setFirstTimeVisit(!!isNewVisit);
            } catch {
                setFirstTimeVisit(false);
            }
        }
        checkFirstTimeVisit();
    }, []);

    const handleNewVisitVideoEnd = React.useCallback(async () => {
        try {
            const updateResponse = await newVisitUserProfileUpdate();
            if (updateResponse.success) setFirstTimeVisit(false);
        } catch {}
    }, []);

    const showSpinner = loading || firstTimeVisit === null;
    const showIntro = !showSpinner && firstTimeVisit && !skipped;

    if (showSpinner) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (showIntro) {
        return (
            <TabContainer>
                <SafeAreaView>
                    <Video
                        source={{uri: 'https://d17ybuhl825fg.cloudfront.net/HelpVideo/Profile+Hub+Intro.mp4'}}
                        style={{height: '100%', width: '100%'}}
                        paused={false}
                        repeat={false}
                        resizeMode="cover"
                        onEnd={handleNewVisitVideoEnd}
                    />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 30,
                            right: 20,
                            backgroundColor: '#ffffff',
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 20,
                        }}
                        onPress={() => {
                            setSkipped(true);
                            handleNewVisitVideoEnd();
                        }}>
                        <Text style={{color: '#000', fontWeight: 'bold'}}>Skip</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </TabContainer>
        );
    }


    const handleUpgrade = async () => {
        try {
            setLoadingUpgrade(true);

            const res = await upgradeCRUView();

            if (res) {
                setUpgradeResult('success');
            } else {
                setUpgradeResult('error');
            }

            setShowUpgradeModal(false);
            setShowResultModal(true);
            hydrateUser();

            setTimeout(() => setShowResultModal(false), 2000);
        } catch (err) {
            setUpgradeResult('error');
            setShowUpgradeModal(false);
            setShowResultModal(true);
            setTimeout(() => setShowResultModal(false), 2000);
        } finally {
            setLoadingUpgrade(false);
        }
    };

    const iconSize = isTablet() ? 18 : 12;

    return (
        <TabContainer>
            <View style={{flex: 1}}>
                <SafeAreaView style={{flex: 1}}>
                    <View>
                        <View style={{height: SIZES.ScreenHeight / 2.9}}>
                            <View style={{zIndex: 20}}>
                                <Header />
                            </View>
                            <LinearGradient
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight / 2.9,
                                }}
                            />
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',

                                    marginHorizontal: 15,
                                }}>
                                {/* user profile pic, name, badges, */}
                                <View style={{flex: 1, maxWidth: '33%'}}>
                                    <View style={{marginRight: 8}}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('ViewUserScreen', {userID: user?.id})}>
                                            <HexAvatar
                                                source={{uri: user?.profilePicture}}
                                                size={MULTISIZES.Xlarge80}
                                                bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                                maxWidth: '100%',
                                            }}>
                                            <Text
                                                style={{...FONTS.Title1, flexShrink: 1}}
                                                numberOfLines={2}
                                                ellipsizeMode="tail">
                                                {user ? user?.username : 'Guest'}
                                            </Text>
                                            {user?.ownerStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.STARGOLD}
                                                    baseSize={iconSize}
                                                    style={{marginRight: 0}}
                                                />
                                            )}
                                            {user?.companyStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.WHITE}
                                                    baseSize={iconSize}
                                                    style={{marginRight: 0}}
                                                />
                                            )}
                                            {user?.influencerStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    baseSize={iconSize}
                                                    style={{marginRight: 0}}
                                                />
                                            )}
                                            {user?.blackCloakStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.BLACKCLOAK}
                                                    baseSize={iconSize}
                                                    style={{marginRight: 0}}
                                                />
                                            )}
                                            {user?.isAdmin && (
                                                <CustomIcon
                                                    name="police-badge"
                                                    type="material-community"
                                                    color={COLORS.STARGOLD}
                                                    baseSize={iconSize}
                                                    style={{marginRight: 0}}
                                                />
                                            )}
                                            {user?.visionaryStatus && (
                                                <CustomIcon
                                                    name="diamond-stone"
                                                    type="material-community"
                                                    color={COLORS.WHITE}
                                                    baseSize={iconSize}
                                                    style={{marginRight: 0}}
                                                />
                                            )}
                                        </View>
                                        {user?.firstName && (
                                            <Text
                                                style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}
                                                numberOfLines={1}
                                                ellipsizeMode="tail">
                                                {user.firstName}
                                            </Text>
                                        )}
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                                </View>

                                <View
                                    style={{
                                        marginTop: '2%',
                                        justifyContent: 'center',

                                        alignItems: 'center',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('FollowList')}
                                        style={{
                                            alignItems: 'center',
                                        }}>
                                        <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>{followersCount}</Text>
                                        <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>Followers</Text>
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={{
                                        marginTop: '2%',
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigate('NoBottomStack', {
                                                screen: 'UserMITHubScreen',
                                                params: {index: 0},
                                            })
                                        }
                                        style={{marginRight: '5%'}}>
                                        <View>
                                            <Image
                                                source={imageindex.LrgMIT}
                                                style={{width: isTablet() ? 85 : 55, height: isTablet() ? 42 : 25}}
                                            />
                                        </View>
                                        <View style={{position: 'absolute', right: 0, bottom: isTablet() ? 20 : 10}}>
                                            <View
                                                style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: COLORS.PURPLE,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 15,
                                                }}>
                                                <Text style={{...FONTS.Title2, color: COLORS.WHITE}}>
                                                    {inviteCount}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={{marginTop: '30%'}}>
                                        <AkcruButtons.XSmallButton
                                            btnname="Edit Profile"
onPress={() => navigate('NoBottomStack', { screen: 'EditProfile' })}
                                            color={COLORS.PINK}
                                            disabled={false}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{marginTop: '3%', marginHorizontal: 15}}>
                                <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                                    {user?.description ??
                                        (user
                                            ? 'Click Edit Profile to add a description'
                                            : 'Create an account and get started today')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={{marginTop: '2%'}} />
                    <TabView
                        navigationState={{index, routes}}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{width: layout.width}}
                        swipeEnabled={true}
                        renderTabBar={renderTabBar}
                    />
                </SafeAreaView>

                <Modal animationType="fade" transparent={true} visible={showMITEntryErr}>
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
                                {'Your party room time limit is over, I hope you enjoy your movie.'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setshowMITEntryErr(false);
                                }}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        marginBottom: 10,
                                        textAlign: 'center',
                                        color: COLORS.MIDORANGE,
                                    }}>
                                    {'Close'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Upgrade Confirmation Modal */}
                <Modal animationType="fade" transparent={true} visible={showUpgradeModal}>
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
                            <Text style={{...FONTS.Title3, marginBottom: 20, textAlign: 'center'}}>
                                {'Upgrade your audio CRU view to '}
                                <Text style={{color: COLORS.AKCRUBLUE}}>{'video'}</Text>
                                {' for 100 '}
                                <Image
                                    source={imageindex.AkcruHexLogo}
                                    style={{
                                        width: FONTS.Title3.fontSize,
                                        height: FONTS.Title3.fontSize,
                                        marginBottom: -3,
                                    }}
                                    resizeMode="contain"
                                />
                                {'? (This action is irreversible)'}
                            </Text>

                            {/* Buttons Row */}
                            <View style={{flexDirection: 'row', gap: 20}}>
                                <TouchableOpacity onPress={() => setShowUpgradeModal(false)} disabled={loadingUpgrade}>
                                    <Text style={{...FONTS.Title2, color: COLORS.LIGHTGREY}}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleUpgrade} disabled={loadingUpgrade}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            color: loadingUpgrade ? COLORS.MIDORANGE : COLORS.GREEN,
                                        }}>
                                        {loadingUpgrade ? 'Loading...' : 'Confirm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Upgrade Result Modal */}
                <Modal animationType="fade" transparent={true} visible={showResultModal}>
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
                            <Text style={{...FONTS.Title3, marginBottom: 10, textAlign: 'center'}}>
                                {upgradeResult === 'success'
                                    ? 'Upgrade successful!'
                                    : 'Upgrade failed. Please try again.'}
                            </Text>
                        </View>
                    </View>
                </Modal>
            </View>
        </TabContainer>
    );
}
