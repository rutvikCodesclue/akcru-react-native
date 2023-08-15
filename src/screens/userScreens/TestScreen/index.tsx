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
import OtherCruChat from '../UserCruChatTabs/Bulletin';

type UserCruChatScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'UserCruChatScreen'>;

type UserCruChatScreenRouteProp = RouteProp<UserProfileStackParams, 'UserCruChatScreen'>;

type Props = {
    navigation: UserCruChatScreenNavigationProp;
    route: UserCruChatScreenRouteProp;
};

const FirstRoute = () => (
    <View>
        <UserCruChat />
    </View>
);

const SecondRoute = () => <OtherCruChat />;

const TestScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

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
        {key: 'second', title: `OTHER CHAT`},
    ]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    return (
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
    );
};

export default TestScreen;
