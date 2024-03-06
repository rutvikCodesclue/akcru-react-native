import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    PressableAndroidRippleConfig,
    StyleProp,
    useWindowDimensions,
    ViewStyle,
    TextStyle,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Route} from 'react-native';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import FollowersTab from '../FollowListTabs/FollowersTab';
import FollowingTab from '../FollowListTabs/FollowingTab';
import { getFollowers, getUserFollowing } from '../../../lib/api/user.lib';
import { IUserProfile } from '../../../../types';
import useAuthStore from '../../../stores/auth.store';

type FollowListNavigationProp = StackNavigationProp<UserProfileStackParams, 'FollowList'>;

type FollowListRouteProp = RouteProp<UserProfileStackParams, 'FollowList'>;

type Props = {
    navigation: FollowListNavigationProp;
    route: FollowListRouteProp;
};

const FirstRoute = () => (
    <View style={{marginBottom: '20%'}}>
        <FollowersTab />
    </View>
);

const SecondRoute = () => (
    <View style={{marginBottom: '20%'}}>
        <FollowingTab />
    </View>
);

const FollowList = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const {user, hydrateUser} = useAuthStore();

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
            tabStyle={{width: SIZES.ScreenWidth / 2}}
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
        />
    );

    const layout = useWindowDimensions();
    
    const [followingData, setFollowingData] = useState<IUserProfile[]>([]);
    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([
        {key: 'first', title: 'Followers (0)'},
        {key: 'second', title: 'Following (0)'},
    ]);

     useEffect(() => {
         const fetchData = async () => {
             if (user?.id) {
                 try {
                     const result = await getUserFollowing(user.id);
                     if (result && result.following && Array.isArray(result.following)) {
                         setFollowingData(result.following); // Set the 'following' array as your data
                     }
                 } catch (error) {
                     console.error('Error fetching following:', error);
                     // Optionally, handle the error by showing a message to the user or taking other actions
                 }
             }
         };

         fetchData();
     }, [user?.id]);

     useEffect(() => {
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
     }, [user?.id]);

    useEffect(() => {
        const numberOfFollowers = followersData.length;
        const numberOfFollowing = followingData.length;

        setRoutes([
            {key: 'first', title: `Followers (${numberOfFollowers})`},
            {key: 'second', title: `Following (${numberOfFollowing})`},
        ]);
    }, [followingData, followersData]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    return (
        <View style={{flex: 1}}>
            <View>
                <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
                    <Header />
                    <TouchableOpacity style={{marginHorizontal: 15, marginBottom: 10}} onPress={() => navigation.pop()}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{width: layout.width}}
                swipeEnabled={true}
                renderTabBar={renderTabBar}
            />
        </View>
    );
};

export default FollowList;
