import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform,
    type PressableStateCallbackType,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Icon} from '@rneui/base';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {BottomTabBar, createBottomTabNavigator, BottomTabBarButtonProps} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';
import BottomSheet, {BottomSheetBackdrop, BottomSheetView} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';

import {COLORS, SIZES} from '../../assets/constants';

import {clientTabBarStyle} from './clientTabBarStyle';
import {CLIENT_TAB_NAVIGATOR_ID} from './clientTabNavigatorId';
import {ClientStack} from './ClientStack';
import {CrummunityStack} from './CrummunityStack';
import {UserProfileStack} from './UserProfileStack';
import AkcruCenterButton from '../components/AkcruCenterButton/AkcruCenterButton';
import {UseTabMenu} from '../context/TabContext';
import AkcruButtonStack from './AkcruButtonStack';
import FlickFlirtScreen from '../screens/CenterButtonScreens/FlickFlirt';
import {API} from '../clients/api.client';
import {DeviceEventEmitter} from 'react-native';
import {isTablet} from '../../assets/constants/theme';
import {logTabBarTouch} from '../debug/tabBarTouchDebug';
import {navigate} from '../util/RootNavigation';

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

/**
 * Center hex: one press target for the whole tab slot (avoids nested Pressable vs inner Touchable fighting).
 * Tapping only toggles the satellite hex menu + big-hex animation — does not switch tabs or navigate (e.g. MIT Hub).
 */
type CenterHexTabBarButtonProps = BottomTabBarButtonProps & {
    onCenterPress: () => void;
};

function CenterHexTabBarButton({
    children,
    style,
    onPress: _tabDefaultOnPress,
    onCenterPress,
    ...rest
}: CenterHexTabBarButtonProps) {
    const navStyle = style as
        | StyleProp<ViewStyle>
        | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
        | undefined;
    return (
        <Pressable
            {...rest}
            onPress={e => {
                logTabBarTouch('centerHex onPress', {
                    hasPreventDefault: typeof e?.preventDefault === 'function',
                });
                e?.preventDefault?.();
                onCenterPress();
            }}
            onPressIn={() => logTabBarTouch('centerHex onPressIn')}
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
            logTabBarTouch('ClientTabBar render null', {
                reason: 'UserProfileStack + ViewChat',
            });
            return null;
        }
    }
    if (active?.name === 'ClientStack' || active?.name === 'AkcruButtonStack') {
        const nestedFocused = getFocusedRouteNameFromRoute(active);
        if (nestedFocused === 'PurchaseAdScreen' || nestedFocused === 'UnlockingMatches') {
            logTabBarTouch('ClientTabBar render null', {
                reason: 'PurchaseAdScreen or UnlockingMatches',
                stack: active?.name,
                nestedFocused,
            });
            return null;
        }
    }
    return <BottomTabBar {...props} />;
}

export default function ClientTabNavigator() {
    const {opened, toggleOpened} = UseTabMenu();
    const [hasMatches, setHasMatches] = useState(false);
    const centerSheetRef = useRef<BottomSheet>(null);
    const centerSheetSnapPoints = useMemo(() => ['70%'], []);
    const [selectedCenterAction, setSelectedCenterAction] = useState<'invite' | 'purchase' | 'match' | 'solo' | null>(null);
    const centerActionNavTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const CENTER_ACTION_NAV_DELAY_MS = 500;

    const fetchMatches = useCallback(() => {
        API.get('/v1/flickflirt/matches')
            .then(res => {
                // normalize payload
                const payload = res?.data ?? res;
                const ok: boolean = !!payload.success;
                const matches: any[] = Array.isArray(payload.matches) ? payload.matches : [];
                setHasMatches(ok && matches.length > 0);
            })
            .catch(err => {
                console.error('fetchMatches error:', err);
                setHasMatches(false);
            });
    }, []);
    // fetch once on mount
    useEffect(fetchMatches, [fetchMatches]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('matchesUpdated', fetchMatches);
        return () => sub.remove();
    }, [fetchMatches]);

    useEffect(() => {
        logTabBarTouch('ClientTabNavigator mounted (debug tap logging active)');
    }, []);

    useEffect(() => {
        return () => {
            if (centerActionNavTimeoutRef.current) {
                clearTimeout(centerActionNavTimeoutRef.current);
            }
        };
    }, []);

    /** Close the hex menu when switching tabs; do not call `preventDefault` — that blocked navigation so the first tap only closed the menu. */
    const closeCenterButtonIfOpen = () => {
        if (opened) {
            logTabBarTouch('closeCenterButtonIfOpen: toggling menu closed');
            toggleOpened();
        }
    };

    const openCenterHexSheet = () => {
        if (opened) {
            toggleOpened();
        }
        centerSheetRef.current?.snapToIndex(0);
    };

    const closeCenterHexSheet = () => {
        centerSheetRef.current?.close();
    };

    const scheduleCenterCircleNavigation = useCallback(
        (action: 'invite' | 'purchase' | 'match' | 'solo', runNavigation: () => void) => {
            setSelectedCenterAction(action);
            if (centerActionNavTimeoutRef.current) {
                clearTimeout(centerActionNavTimeoutRef.current);
            }
            centerActionNavTimeoutRef.current = setTimeout(() => {
                centerActionNavTimeoutRef.current = null;
                closeCenterHexSheet();
                runNavigation();
            }, CENTER_ACTION_NAV_DELAY_MS);
        },
        [closeCenterHexSheet],
    );

    const handlePressSendInvite = () => {
        scheduleCenterCircleNavigation('invite', () => {
            navigate('NoBottomStack', {
                screen: 'ClientStack',
                params: {
                    screen: 'HomeScreen',
                },
            });
        });
    };

    const handlePressPurchaseCrewDollars = () => {
        scheduleCenterCircleNavigation('purchase', () => {
            navigate('NoBottomStack', {
                screen: 'ClientTabNavigator',
                params: {
                    screen: 'AkcruButtonStack',
                    params: {
                        screen: 'PurchaseAdScreen',
                    },
                },
            });
        });
    };

    const handlePressFindMatch = () => {
        scheduleCenterCircleNavigation('match', () => {
            navigate('NoBottomStack', {
                screen: 'ClientTabNavigator',
                params: {
                    screen: 'FlickFlirtScreen',
                },
            });
        });
    };

    const handlePressSoloSession = () => {
        scheduleCenterCircleNavigation('solo', () => {
            navigate('NoBottomStack', {
                screen: 'ClientStack',
                params: {
                    screen: 'HomeScreen',
                },
            });
        });
    };

    const renderCenterSheetBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.55}
                pressBehavior="close"
            />
        ),
        [],
    );

    return (
        <>
            <ClientTabs.Navigator
                id={CLIENT_TAB_NAVIGATOR_ID}
                tabBar={(tabBarProps) => <ClientTabBar {...tabBarProps} />}
                sceneContainerStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
                initialRouteName="CrummunityStack"
                screenListeners={({route}) => ({
                    tabPress: e => {
                        logTabBarTouch('screenListeners tabPress', {
                            routeName: route.name,
                            defaultPrevented: e.defaultPrevented,
                        });
                    },
                })}
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
                    tabBarBackground: () => (
                        <View style={styles.tabBarBlurPill} pointerEvents="none">
                            <BlurView
                                pointerEvents="none"
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
                        overflow: 'visible',
                    },
                    headerShown: false,
                    tabBarLabel: () => null,
                    tabBarButton: props => <CenterHexTabBarButton {...props} onCenterPress={openCenterHexSheet} />,
                    tabBarIcon: () => (
                        <View style={styles.centerHexTabIconWrap} pointerEvents="box-none" collapsable={false}>
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

            <BottomSheet
                ref={centerSheetRef}
                index={-1}
                snapPoints={centerSheetSnapPoints}
                enablePanDownToClose={true}
                backdropComponent={renderCenterSheetBackdrop}
                backgroundStyle={styles.centerSheetBackground}
                handleIndicatorStyle={styles.centerSheetIndicator}
                style={styles.centerSheetContainer}>
                <BottomSheetView style={styles.centerSheetContent}>
                    <View style={styles.sheetHeaderWrap}>
                        <Text style={styles.sheetHeaderTitle}>What do you want to do?</Text>
                        <Pressable style={styles.sheetCloseButton} onPress={closeCenterHexSheet}>
                            <Icon name="close" type="material-community" color={COLORS.WHITE} size={18} />
                        </Pressable>
                    </View>

                    <View style={styles.actionsGrid}>
                        <Pressable
                            style={[
                                styles.actionCard,
                                selectedCenterAction === 'invite' ? styles.actionCardSelected : undefined,
                            ]}
                            onPress={handlePressSendInvite}>
                            <Icon
                                name="ticket-confirmation-outline"
                                type="material-community"
                                color={COLORS.WHITE}
                                size={34}
                            />
                            <Text style={[styles.actionTitle, selectedCenterAction === 'invite' ? styles.actionTitleSelected : undefined]}>
                                Send an Invite
                            </Text>
                            <Text
                                style={[
                                    styles.actionSubtitle,
                                    selectedCenterAction === 'invite' ? styles.actionSubtitleSelected : undefined,
                                ]}>
                                Pick a movie to send a match
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.actionCard,
                                selectedCenterAction === 'purchase' ? styles.actionCardSelected : undefined,
                            ]}
                            onPress={handlePressPurchaseCrewDollars}>
                            <Icon name="wallet-outline" type="material-community" color={COLORS.WHITE} size={34} />
                            <Text
                                style={[
                                    styles.actionTitle,
                                    selectedCenterAction === 'purchase' ? styles.actionTitleSelected : undefined,
                                ]}>
                                Purchase Crew Dollars
                            </Text>
                            <Text
                                style={[
                                    styles.actionSubtitle,
                                    selectedCenterAction === 'purchase' ? styles.actionSubtitleSelected : undefined,
                                ]}>
                                Buy credits and unlock new perks
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.actionsGrid}>
                        <Pressable
                            style={[
                                styles.actionCard,
                                selectedCenterAction === 'match' ? styles.actionCardSelected : undefined,
                            ]}
                            onPress={handlePressFindMatch}>
                            <Icon name="magnify" type="material-community" color={COLORS.WHITE} size={34} />
                            <Text style={[styles.actionTitle, selectedCenterAction === 'match' ? styles.actionTitleSelected : undefined]}>
                                Find a Match
                            </Text>
                            <Text
                                style={[
                                    styles.actionSubtitle,
                                    selectedCenterAction === 'match' ? styles.actionSubtitleSelected : undefined,
                                ]}>
                                Jump into FlickFlirt
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.actionCard,
                                selectedCenterAction === 'solo' ? styles.actionCardSelected : undefined,
                            ]}
                            onPress={handlePressSoloSession}>
                            <Icon name="play-circle-outline" type="material-community" color={COLORS.WHITE} size={34} />
                            <Text style={[styles.actionTitle, selectedCenterAction === 'solo' ? styles.actionTitleSelected : undefined]}>
                                Solo Session
                            </Text>
                            <Text
                                style={[
                                    styles.actionSubtitle,
                                    selectedCenterAction === 'solo' ? styles.actionSubtitleSelected : undefined,
                                ]}>
                                Watch something on your own
                            </Text>
                        </Pressable>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </>
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
    centerSheetContainer: {
        zIndex: 120,
    },
    centerSheetBackground: {
        backgroundColor: '#0E0A1A',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        borderWidth: 1,
        borderColor: 'rgba(190, 146, 255, 0.4)',
    },
    centerSheetIndicator: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        width: 52,
    },
    centerSheetContent: {
        paddingHorizontal: 16,
        paddingBottom: 26,
        gap: 14,
    },
    sheetHeaderWrap: {
        marginBottom: 2,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 30,
    },
    sheetHeaderTitle: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    sheetCloseButton: {
        position: 'absolute',
        top: -2,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(176, 132, 255, 0.55)',
        backgroundColor: 'rgba(24, 16, 44, 0.92)',
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161029',
        borderWidth: 1,
        borderColor: 'rgba(176, 132, 255, 0.34)',
    },
    actionCardSelected: {
        borderColor: '#C78BFF',
        borderWidth: 2,
        backgroundColor: '#1D1332',
        shadowColor: '#BB77FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 18,
        elevation: 12,
    },
    actionTitle: {
        marginTop: 8,
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    actionTitleSelected: {
        color: '#F4E8FF',
    },
    actionSubtitle: {
        marginTop: 4,
        color: 'rgba(255,255,255,0.75)',
        fontSize: 11,
        textAlign: 'center',
    },
    actionSubtitleSelected: {
        color: '#DAB5FF',
    },
    redDot: {
        position: 'absolute',
        top: 0,
        right: 20,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
    },
});
