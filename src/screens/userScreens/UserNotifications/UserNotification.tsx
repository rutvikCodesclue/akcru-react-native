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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Route} from 'react-native';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import {getFollowers, getUserFollowing} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import Unread from '../UserNotificationTabs/Unread';
import Read from '../UserNotificationTabs/Read';
import LinearGradient from 'react-native-linear-gradient';
import UserNotifications from '.';
import styles from './styles';

type ViewUserFollowListNavigationProp = StackNavigationProp<UserProfileStackParams, 'ViewUserFollowList'>;

type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewUserFollowList'>;

type Props = {
    navigation: ViewUserFollowListNavigationProp;
    route: ViewUserFollowListRouteProp;
};

const FirstRoute = () => (
    <View >
        <Unread />
    </View>
);

const SecondRoute = () => (
    <View >
        <Read />
    </View>
);

const UserNotification = ({route}: Props) => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userID ?? null;

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


    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([
        {key: 'first', title: 'Unread'},
        {key: 'second', title: 'Read'},
    ]);

    const renderScene = ({route}) => {
        switch (route.key) {
            case 'first':
                return <FirstRoute  />;
            case 'second':
                return <SecondRoute />;
            default:
                return null;
        }
    };

    return (
        <View style={{flex: 1, ...styles.backbutton}}>
            <View>
                <View>
                    <View style={{zIndex: 100}}>
                        <Header />
                    </View>
                    <View
                        style={{
                            height: SIZES.ScreenHeight / 5,
                            marginTop: -60,
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                        }}>
                        <LinearGradient
                            // Background Linear Gradient
                            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: SIZES.ScreenHeight / 5,
                            }}
                        />
                        <View>
                            <TouchableOpacity
                                style={{marginHorizontal: 15, marginBottom: 10, paddingTop: 60}}
                                onPress={() => navigation.pop()}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                </View>
                            </TouchableOpacity>
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    marginTop: 10,

                                    textAlign: 'center',
                                    fontSize: 13,
                                    textDecorationLine: 'underline',
                                }}>
                                NOTIFICATIONS
                            </Text>
                        </View>
                    </View>
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

export default UserNotification;
