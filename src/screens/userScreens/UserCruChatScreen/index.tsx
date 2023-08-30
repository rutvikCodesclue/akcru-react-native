import {
    Text,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    FlatList,
    SafeAreaView,
    StyleProp,
    ViewStyle,
    TextStyle,
    PressableAndroidRippleConfig,
    Pressable,
    useWindowDimensions,
} from 'react-native';
import styles from './styles';
import React, {useState} from 'react';
import UserCruChatCard from '../../../components/UserCruChatCard';
import Header from '../../../components/header';
import AkcruButtons from '../../../components/akcruButtons';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {DIGITAL_PASS} from '../../../../assets/constants/Mockusers';
import {AkcruDollarAmount} from '../../../../assets/constants/Mockusers';
import {Avatar, Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import {useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Route} from 'react-native';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import UserCruChat from '../UserCruChatTabs/UserCruChat';
import Bulletin from '../UserCruChatTabs/Bulletin';
import useAuthStore from '../../../stores/auth.store';

type UserCruChatScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'UserCruChatScreen'>;

type UserCruChatScreenRouteProp = RouteProp<UserProfileStackParams, 'UserCruChatScreen'>;

type Props = {
    navigation: UserCruChatScreenNavigationProp;
    route: UserCruChatScreenRouteProp;
};

const FirstRoute = () => (

        <UserCruChat />
    
);

const SecondRoute = () => <Bulletin />;

const UserCruChatScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const { user } = useAuthStore();

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
            indicatorStyle={{backgroundColor: COLORS.DARKORANGE}}
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
            activeColor={COLORS.MIDORANGE}
        />
    );

    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'first', title: `YOUR CRU CHAT`},
        {key: 'second', title: `BULLETIN`},
    ]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView stickyHeaderIndices={[0, 3]}>
                <ImageBackground
                    source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                    resizeMode="cover"
                    style={{height: SIZES.ScreenHeight / 3.3}}>
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>
                    <View style={{marginHorizontal: 15, marginBottom: 10, zIndex: 21}}>
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
                    </View>
                    <LinearGradient
                        // Background Linear Gradient
                        colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: SIZES.ScreenHeight / 3.3,
                        }}
                    />
                    <View style={styles.topContainer}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{marginRight: 8}}>
                                <Avatar
                                    rounded
                                    size={70}
                                    source={
                                        user?.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder
                                    }
                                    avatarStyle={{
                                        borderWidth: 2,
                                        borderColor: FAKE_USER_PROFILES[0].avatarbordercolor,
                                    }}
                                />
                            </View>
                            <View>
                                <Text style={{...FONTS.Title2}}>
                                    {/* {FAKE_USER_PROFILES[0].userName} */}
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
                            </View>
                        </View>
                        <Pressable onPress={() => navigation.navigate('FollowList')}>
                            <View
                                style={{
                                    borderLeftWidth: 2,
                                    borderRightWidth: 2,
                                    borderColor: COLORS.DARKGREY,
                                    width: 100,
                                    height: 60,
                                    justifyContent: 'center',
                                    paddingLeft: 10,
                                    alignItems: 'center',
                                }}>
                                <Text style={{...FONTS.Title3, fontSize: 14}}>
                                    {user?.followerCount ?? 0}
                                    {/* {FAKE_USER_PROFILES[0].userFollowerAmount} */}
                                </Text>
                                <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Followers</Text>
                            </View>
                        </Pressable>

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
                                            backgroundColor: COLORS.WHITE,
                                            width: 20,
                                            height: 20,
                                            borderRadius: 15,
                                        }}>
                                        <Text>5</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{marginTop: 20, marginHorizontal: 15}}>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                color: COLORS.LIGHTGREY,
                                fontSize: 12,
                            }}>
                            {FAKE_USER_PROFILES[0].userDesc}
                        </Text>
                    </View>
                </ImageBackground>

                <View>
                    <View style={{marginBottom: -10}}>
                        <Text style={styles.titleText1}>CRU View Scheduler</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('CruViewSearchMovieScreen')}>
                        <Icon name="calendar-sharp" type="ionicon" color={COLORS.LIGHTGREY} size={75} />
                    </TouchableOpacity>
                </View>
                <View style={styles.CruImageContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('EditCru')}>
                        <View style={{flexDirection: 'row', marginTop: 10}}>
                            <Icon
                                name="square-edit-outline"
                                type="material-community"
                                color={COLORS.DARKGREY}
                                size={15}
                                style={{marginRight: 5}}
                            />
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    color: COLORS.LIGHTGREY,
                                    fontSize: 12,
                                }}>
                                Edit Your CRU
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{flex: 1}}>
                    <TabView
                        navigationState={{index, routes}}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{width: layout.width}}
                        swipeEnabled={true}
                        renderTabBar={renderTabBar}
                    />
                </View>
                <View>
                    {index == 0 && <UserCruChat />}
                    {index == 1 && (
                        <View>
                            <Bulletin />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserCruChatScreen;
