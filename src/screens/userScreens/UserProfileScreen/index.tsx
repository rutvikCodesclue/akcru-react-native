import * as React from 'react';
import {View, useWindowDimensions, Text, TouchableOpacity, Image, SafeAreaView, Modal} from 'react-native';
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
import {useState} from 'react';
import useAuthStore from '../../../stores/auth.store';
import {formatNumber, selectAvatarBorderColor} from '../../../util/util';
import {ICruInvite, ICruView, IMITInvite, IUserProfile} from '../../../../types';
import {getMyMITInvites} from '../../../lib/api/mit.lib';
import {getCRUInvites, getMyCRUViews} from '../../../lib/api/cru.lib';
import {isAfter, isBefore} from 'date-fns';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {getFollowers} from '../../../lib/api/user.lib';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {MULTISIZES} from '../../../../assets/constants/theme';
import AkcruButtons from '../../../components/akcruButtons';

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
    const [index, setIndex] = useState(route.params?.index || 0);

    const [inviteCount, setInviteCount] = React.useState<number>(0);
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite)[]>([]);

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

    //console.log('User Id:', user?.id);

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
                                <View>
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
                                        <View style={{flexDirection: 'row'}}>
                                            <View>
                                                <Text style={{...FONTS.Title1}}>{user ? user?.username : 'Guest'}</Text>
                                                {user?.firstName && (
                                                    <Text style={{...FONTS.paragraph1, color: COLORS.LIGHTGREY}}>
                                                        {user?.firstName ? user.firstName : ''}
                                                    </Text>
                                                )}
                                            </View>

                                            {user?.ownerStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.STARGOLD}
                                                    baseSize={12}
                                                    style={{marginRight: 5}}
                                                />
                                            )}
                                            {user?.companyStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.WHITE}
                                                    baseSize={12}
                                                    style={{marginRight: 5}}
                                                />
                                            )}
                                            {user?.influencerStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    baseSize={12}
                                                    style={{marginRight: 5}}
                                                />
                                            )}
                                            {user?.blackCloakStatus && (
                                                <CustomIcon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.BLACKCLOAK}
                                                    baseSize={12}
                                                    style={{marginRight: 5}}
                                                />
                                            )}
                                        </View>
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
                                        onPress={() => navigation.navigate('UserMITHubScreen')} //Navigate to MITHub
                                        style={{marginRight: '5%'}}>
                                        <View>
                                            <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                                        </View>
                                        <View style={{position: 'absolute', right: 0, bottom: 10}}>
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
                                    {/* <View style={{marginTop: '30%'}}>
                                        <AkcruButtons.XSmallButton
                                            btnname="Contacts"
                                            onPress={() => navigation.navigate('ContactList')}
                                            color={COLORS.PURPLE}
                                            disabled={false}
                                        />
                                    </View> */}
                                    <View style={{marginTop: '30%'}}>
                                        <AkcruButtons.XSmallButton
                                            btnname="Edit Profile"
                                            onPress={() => navigation.navigate('EditProfile')}
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
            </View>
        </TabContainer>
    );
}
