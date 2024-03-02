import * as React from "react";
import {
  View,
  useWindowDimensions,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  SafeAreaView
} from "react-native";
import { TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps } from "react-native-tab-view";
import {
  UserProfileCruInvites,
  UserProfileDatesTab,
  UserProfileDetailsTab,
  UserProfileWalletTab
} from "../UserProfileTabs";
import { SIZES, COLORS, FONTS, AKCRUBADGES } from "../../../../assets/constants";
import LinearGradient from "react-native-linear-gradient";
import { Avatar, Icon } from "@rneui/themed";
import Header from "../../../components/header";
import AkcruLevels from "../../../components/akcruBadges";
import imageindex from "../../../../assets/images/imageindex";
import { PressableAndroidRippleConfig } from "react-native";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";
import { TextStyle } from "react-native";
import { Route } from "react-native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { NavigationState, Scene, SceneRendererProps } from "react-native-tab-view/lib/typescript/src/types";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { API } from "../../../clients/api.client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import useAuthStore from "../../../stores/auth.store";
import { selectAvatarBorderColor } from "../../../util/util";
import { ICruInvite, ICruView, IMITInvite, IUserProfile } from "../../../../types";
import { getMyMITInvites } from "../../../lib/api/mit.lib";
import { getCRUInvites, getMyCRUViews } from "../../../lib/api/cru.lib";
import {isAfter, isBefore} from 'date-fns';
import TabContainer from "../../../components/TabContainer/TabContainer";
import HexAvatar from "../../../components/HexAvatar";
import { getFollowers, getUserFollowing } from "../../../lib/api/user.lib";


type UserProfileScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "UserProfileScreen"
>;

type UserProfileScreenRouteProp = RouteProp<
  UserProfileStackParams,
  "UserProfileScreen"
>;

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

const FourthRoute = () => <UserProfileWalletTab/>;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
  fourth: FourthRoute
});

export default function UserProfileScreen({navigation, route}: Props) {
    const {user, hydrateUser} = useAuthStore();
    const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    // Add a state to keep track of the invite count
    const [inviteCount, setInviteCount] = React.useState<number>(0);
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite)[]>([]);

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

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            // console.log('User Profile Cru Invite Tab focused');

            // Get the MITS for the user
            getMyMITInvites({pending: true}).then(mitInvites => {
                // console.log("mitInvites: ", JSON.stringify(mitInvites, null, 3));

                if (mitInvites) {
                    // Count the number of MIT invites
                    const mitInviteCount = mitInvites.length;

                    // sort invites by date (newest to oldest) and set state
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
                    // Call setInviteCount with the total count of MIT invites
                    setInviteCount(mitInviteCount);
                } else {
                    // If there are no MIT invites, set the count to 0
                    setIsLoaded(true);
                    setInviteCount(0);
                }
            });

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                // console.log('User Profile Cru Invite Tab unfocused');
            };
        }, []),
    );

    React.useEffect(() => {
        // When the invites change, update the invite count
        setInviteCount(invites.length);
    }, [invites]);

    // Define your state variable to hold the count of pending CRU invites
    const [pendingCRUInviteCount, setPendingCRUInviteCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            getCRUInvites({pending: true}).then(cruInvites => {
                // Check if cruInvites is not null or undefined
                if (cruInvites) {
                    // Filter the cruInvites to keep only the pending ones
                    const pendingCRUInvites = cruInvites.filter(
                        (invite: {status: string}) => invite.status !== 'ACCEPTED' && invite.status !== 'DECLINED',
                    );

                    // Set the filtered pending CRU invites to your state variable
                    setPendingCRUInviteCount(pendingCRUInvites.length);

                    // Set any other state or perform additional actions if necessary
                    setIsLoaded(true);
                }
            });

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                // You can perform cleanup or reset state if needed when the screen is unfocused
            };
        }, []),
    );

    const [eventCount, setEventCount] = useState(0); // Initialize the event count state

    useFocusEffect(
        React.useCallback(() => {
            // get CRUViews and MITs and merge them
            const fetchMyEvents = async () => {
                try {
                    const myCRUViews = await getMyCRUViews({upcoming: true});
                    const myMITs = await getMyMITInvites({accepted: true, me: true});

                    if (myCRUViews && myMITs) {
                        let events = [...myCRUViews, ...myMITs];
                        // Set the event count state
                        setEventCount(events.length);

                        // sort invites by date (newest to oldest) and set state
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

    const datesIndicatorCount = eventCount; // Replace this with your actual count
    const cruInvitesIndicatorCount = pendingCRUInviteCount; // Replace this with your actual count

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
                    return <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.PURPLE}} />;
                } else if (route.key === 'third' && cruInvitesIndicatorCount > 0) {
                    return <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.PURPLE}} />;
                }
                return null;
            }}
        />
    );

    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        {key: 'first', title: 'Details'},
        {key: 'second', title: 'Dates'},
        {key: 'third', title: 'Cru Inv'},
        {key: 'fourth', title: 'Wallet'},
    ]);

    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);

    // Fetch followers data when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                if (user?.id) {
                    try {
                        const result = await getFollowers(user.id);
                        if (result && result.followers && Array.isArray(result.followers)) {
                            setFollowersData(result.followers); // Set the 'following' array as your data
                        }
                    } catch (error) {
                        console.error('Error fetching followers:', error);
                        // Optionally, handle the error by showing a message to the user or taking other actions
                    }
                }
            };

            fetchData();

            // Optional: Return a cleanup function if needed
            return () => {
                // For example: reset followers data
                // setFollowersData([]);
            };
        }, [user?.id]), // Only re-run the effect if user.id changes
    );

    const followersCount = followersData.length;

    console.log('User Id:', user?.id);

    return (
        <TabContainer>
            <View style={{flex: 1}}>
                <SafeAreaView style={{flex: 1}}>
                    <View>
                        <View
                            // source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                            // resizeMode="cover"
                            style={{height: SIZES.ScreenHeight / 3.7}}>
                            <View style={{zIndex: 20}}>
                                <Header />
                            </View>
                            <LinearGradient
                                // Background Linear Gradient
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
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',

                                    marginHorizontal: 15,
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{marginRight: 8}}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('ViewUserScreen', {userID: user?.id})}>
                                            <HexAvatar
                                                source={{uri: user?.profilePicture}}
                                                size={70}
                                                bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <Text style={{...FONTS.Username}}>
                                            {user ? user?.username : 'Guest'}
                                        </Text>
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
                                        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                                            <View style={{flexDirection: 'row'}}>
                                                <Icon
                                                    name="square-edit-outline"
                                                    type="material-community"
                                                    color={COLORS.DARKGREY}
                                                    size={15}
                                                    style={{marginRight: 5}}
                                                />
                                                <Text
                                                    style={{
                                                        ...FONTS.Username,
                                                        color: COLORS.LIGHTGREY,
                                                 
                                                    }}>
                                                    Edit Profile
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
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
                                        onPress={() => navigation.navigate('FollowList')}
                                        style={{
                                            alignItems: 'center',
                                        }}>
                                        <Text style={{...FONTS.Title3}}>{followersCount}</Text>
                                        <Text style={{...FONTS.Username, color: COLORS.MIDORANGE}}>
                                            Followers
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={{
                                        height: 50,
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('UserMITHubScreen')} //Navigate to MITHub
                                    >
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
                                </View>
                            </View>
                            <View style={{marginTop: 20, marginHorizontal: 15}}>
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
            </View>
        </TabContainer>
    );
}
