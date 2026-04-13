import {
    View,
    StyleSheet,
    Pressable,
    Platform,
    type PressableStateCallbackType,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import React from 'react';

import {Icon} from '@rneui/base';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {BottomTabBar, createBottomTabNavigator, BottomTabBarButtonProps} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';

import {COLORS} from '../../assets/constants';

import {clientTabBarStyle} from './clientTabBarStyle';
import {CLIENT_TAB_NAVIGATOR_ID} from './clientTabNavigatorId';
// import {ClientStack} from './ClientStack';
import {CrummunityStack} from './CrummunityStack';
import {UserProfileStack} from './UserProfileStack';
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';
import {UseTabMenu} from '../context/TabContext';
import AkcruButtonStack from './AkcruButtonStack';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import {isTablet} from '../../assets/constants/theme';

/** Selected tab only: gradient disk + glow; inactive tabs show icon only (no circle) */
const ICON_FOCUSED_GRADIENT = ['rgba(232,205,255,0.96)', 'rgba(255,200,232,0.88)', 'rgba(118,95,145,1)'];

const TAB_ICON_SELECTED = COLORS.CATPURPLGT;
const TAB_ICON_INACTIVE = COLORS.WHITE;

type SideTabIconProps = {
    focused: boolean;
    name: string;
    type?: 'ionicon' | 'material-community';
};

function SideTabBarIcon({focused, name, type = 'ionicon'}: SideTabIconProps) {
    return (
        <View style={styles.tabIconContainer}>
            <View style={styles.tabIconHitCircle} collapsable={false}>
                {focused ? (
                    <LinearGradient
                        colors={ICON_FOCUSED_GRADIENT}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={[styles.iconGradientWrap, styles.iconGradientCircle, styles.iconFocusedGlow]}>
                        <View pointerEvents="none">
                            <Icon name={name} type={type} color={TAB_ICON_SELECTED} size={19} />
                        </View>
                    </LinearGradient>
                ) : (
                    <View style={[styles.iconGradientWrap, styles.iconGradientCircle]} pointerEvents="none">
                        <Icon name={name} type={type} color={TAB_ICON_INACTIVE} size={19} />
                    </View>
                )}
            </View>
        </View>
    );
}

export type ClientTabsParams = {
    UserProfileStack: any;
    ClientStack: any;
    MITChatStack: any;
    CruChewStack: any;
    CrummunityStack: any;
    PurchaseMITScreen: any;
    AkcruButtonStack: any;
    TabContainer: any;
    AkcruCenterButton: any;
    ShowTestScreen: any;
    CrusaderStack: any;
    FlickFlirtScreen: any;
};

const ClientTabs = createBottomTabNavigator<ClientTabsParams>();

type TabBarProps = React.ComponentProps<typeof BottomTabBar>;

/** Circular tap / ripple so the control reads as the gradient disk, not the icon glyph alone */
function TabBarCircleButton({children, style, ...rest}: BottomTabBarButtonProps) {
    const navStyle = style as
        | StyleProp<ViewStyle>
        | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
        | undefined;
    return (
        <Pressable
            {...rest}
            android_ripple={
                Platform.OS === 'android'
                    ? {
                          borderless: true,
                          radius: 26,
                          color: 'rgba(255, 255, 255, 0.22)',
                      }
                    : undefined
            }
            style={state => [
                styles.tabBarCircleButton,
                typeof navStyle === 'function' ? navStyle(state) : navStyle,
            ]}>
            {children}
        </Pressable>
    );
}

/** `setOptions({ tabBarStyle })` from nested screens is unreliable; hide bar from real navigation state. */
function ClientTabBar(props: TabBarProps) {
    const {state} = props;
    const active = state.routes[state.index];
    if (active?.name === 'UserProfileStack') {
        const nestedFocused = getFocusedRouteNameFromRoute(active);
        if (nestedFocused === 'ViewChat') {
            return null;
        }
    }
    if (active?.name === 'ClientStack' || active?.name === 'AkcruButtonStack') {
        const nestedFocused = getFocusedRouteNameFromRoute(active);
        if (nestedFocused === 'PurchaseAdScreen' || nestedFocused === 'UnlockingMatches') {
            return null;
        }
    }
    return <BottomTabBar {...props} />;
}

export default function ClientTabNavigator() {
    const {opened, toggleOpened} = UseTabMenu();

    const closeCenterButtonIfOpen = (e: any) => {
        if (opened) {
            e.preventDefault();
            toggleOpened();
        }
    };

    return (
        <ClientTabs.Navigator
            id={CLIENT_TAB_NAVIGATOR_ID}
            tabBar={(tabBarProps) => <ClientTabBar {...tabBarProps} />}
            sceneContainerStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
            initialRouteName="CrummunityStack"
            screenOptions={{
                tabBarStyle: clientTabBarStyle,
                /** RN adds safe-area padding inside the bar; we already offset the whole pill via `bottom` */
                // @ts-expect-error tabBarSafeAreaInsets is valid in bottom-tabs; types are incomplete
                tabBarSafeAreaInsets: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                tabBarContentContainerStyle: {
                    flex: 1,
                    alignItems: 'center',
                    overflow: 'visible',
                },
                tabBarButton: props => <TabBarCircleButton {...props} />,
                tabBarBackground: () => (
                    <View style={styles.tabBarBlurPill} pointerEvents="none">
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType={Platform.OS === 'ios' ? 'regular' : 'dark'}
                            blurAmount={Platform.OS === 'ios' ? 10 : 12}
                            reducedTransparencyFallbackColor="rgba(22, 18, 38, 0.72)"
                        />
                        <View style={styles.tabBarBlurTint} pointerEvents="none" />
                        <LinearGradient
                            pointerEvents="none"
                            colors={[
                                'rgba(255, 255, 255, 0.16)',
                                'rgba(255, 255, 255, 0.04)',
                                'rgba(255, 255, 255, 0)',
                                'rgba(8, 4, 18, 0.22)',
                            ]}
                            locations={[0, 0.22, 0.55, 1]}
                            start={{x: 0.5, y: 0}}
                            end={{x: 0.5, y: 1}}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                ),
                tabBarActiveTintColor: COLORS.WHITE,
                tabBarInactiveTintColor: COLORS.WHITE,
                tabBarShowLabel: true,
                tabBarItemStyle: {
                    flex: 1,
                    flexDirection: 'column',
                    paddingVertical: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarIconStyle: {
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 0,
                    marginBottom: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 8,
                    lineHeight: 9,
                    paddingTop: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    fontWeight: '700',
                    letterSpacing: 0.15,
                    color: COLORS.WHITE,
                    includeFontPadding: false,
                    textAlign: 'center',
                },
            }}>
            {/* <ClientTabs.Screen
                name="ClientStack"
                component={ClientStack}
                options={{
                    tabBarItemStyle: {},
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <View style={styles.tabIconContainer}>
                            <Icon
                                name="home-outline"
                                type="ionicon"
                                color={color}
                                size={22}
                            />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
                }}
            /> */}
            <ClientTabs.Screen
                name="FlickFlirtScreen"
                component={FlickFlirtScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'FlickFlirt',
                    tabBarIcon: ({focused}) => (
                        <SideTabBarIcon focused={focused} name="heart-multiple-outline" type="material-community" />
                    ),
                }}
            />
            <ClientTabs.Screen
                name="CrummunityStack"
                component={CrummunityStack}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Crummunity',
                    tabBarIcon: ({focused}) => <SideTabBarIcon focused={focused} name="people-outline" />,
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
                }}
            />
            <ClientTabs.Screen
                name="AkcruButtonStack"
                component={AkcruButtonStack}
                options={{
                    tabBarItemStyle: {
                        height: 0,
                        overflow: 'visible',
                        zIndex: 100,
                    },
                    headerShown: false,
                    tabBarLabel: () => null,
                    tabBarIcon: () => (
                        <View style={styles.centerHexTabIconWrap} collapsable={false}>
                            <View style={styles.centerHexLift} collapsable={false}>
                                <AkcruCenterButton opened={opened} toggleOpened={toggleOpened} />
                            </View>
                        </View>
                    ),
                }}
            />
            <ClientTabs.Screen
                name="MITChatStack"
                component={UserProfileStack}
                initialParams={{screen: 'ChatList'}}
                options={{
                    headerShown: false,
                    tabBarLabel: 'MIT Chat',
                    tabBarIcon: ({focused}) => (
                        <SideTabBarIcon focused={focused} name="chatbox-ellipses-outline" />
                    ),
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
                }}
            />
            <ClientTabs.Screen
                name="UserProfileStack"
                component={UserProfileStack}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({focused}) => <SideTabBarIcon focused={focused} name="person-outline" />,
                }}
                listeners={{
                    tabPress: closeCenterButtonIfOpen,
                }}
            />
        </ClientTabs.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarCircleButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    /** Blur only inside the rounded pill; clipping avoids full-screen blur when the center menu opens */
    tabBarBlurPill: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        overflow: 'hidden',
    },
    /** Base tint + slight cool lift so blur reads as frosted glass, not flat grey */
    tabBarBlurTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(32, 26, 52, 0.38)',
    },
    /** Pre-tab-bar-layout: center hex only (side tabs use `tabIconContainer`) */
    centerHexTabIconWrap: {
        position: 'absolute',
        top: isTablet() ? 20 : 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: isTablet() ? '120%' : '95%',
        overflow: 'visible',
        zIndex: 100,
    },
    centerHexLift: {
        marginTop: isTablet() ? -20 : -15,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    /** Min. circular hit zone around the 34px gradient so taps target the disk, not only the glyph */
    tabIconHitCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconGradientWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconGradientCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    iconFocusedGlow: {
        shadowColor: '#FF5FA2',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 17,
        elevation: 14,
    },
});
