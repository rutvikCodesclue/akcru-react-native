import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform,
    BackHandler,
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
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView} from '@gorhom/bottom-sheet';
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
import {navigate, navigateToUserNotificationScreen} from '../util/RootNavigation';
import {getNotifyMePayload, markNotificationRead} from '../lib/api/notify.lib';
import {NotificationNavigation} from '../screens/userScreens/UserNotificationTabs/NotificationNavigation';
import useAuthStore from '../stores/auth.store';
import type {INotification} from '../../types';
import {formatDatestamp} from '../util/util';
import SoloVibeSheetContent, {type SoloVibeOption} from './SoloVibeSheetContent';
import {setSoloSessionVibe} from '../lib/api/soloSession.lib';
import {resolveSoloSessionVibe} from '../types/SoloSessionVibe';

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
type CenterSheetStep = 'main' | 'soloVibe';

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

/** Deepest focused route in a tab (for reading params on nested stacks). */
function getFocusedLeafRoute(route: {state?: {index?: number; routes?: unknown[]}; name?: string; params?: object} | null): {
    name?: string;
    params?: Record<string, unknown>;
} | null {
    if (!route) {
        return null;
    }
    if (!route.state || !Array.isArray(route.state.routes)) {
        return {name: route.name, params: route.params as Record<string, unknown> | undefined};
    }
    const idx = route.state.index ?? 0;
    const child = route.state.routes[idx] as (typeof route);
    return getFocusedLeafRoute(child);
}

/** `setOptions({ tabBarStyle })` from nested screens is unreliable; hide bar from real navigation state. */
function ClientTabBar(props: TabBarProps) {
    const {state} = props;
    const active = state.routes[state.index];
    if (active?.name === 'UserProfileStack') {
        const nestedFocused = getFocusedRouteNameFromRoute(active);
        if (
            nestedFocused === 'WatchPartyPreview' ||
            nestedFocused === 'StartWatchPartyView' ||
            nestedFocused === 'VisionaryWatchParty' ||
            nestedFocused === 'PpvScreen' ||
            nestedFocused === 'PpvMovieScreen' ||
            nestedFocused === 'PpvPurchaseScreen' ||
            nestedFocused === 'PpvThankYouScreen'
        ) {
            logTabBarTouch('ClientTabBar render null', {
                reason: `UserProfileStack + ${nestedFocused}`,
            });
            return null;
        }
        if (nestedFocused === 'ViewChat') {
            logTabBarTouch('ClientTabBar render null', {
                reason: 'UserProfileStack + ViewChat',
            });
            return null;
        }
        if (nestedFocused === 'ContentDetailScreen') {
            const leaf = getFocusedLeafRoute(active as Parameters<typeof getFocusedLeafRoute>[0]);
            if (leaf?.params?.hideTabBar === true) {
                logTabBarTouch('ClientTabBar render null', {
                    reason: 'UserProfileStack + ContentDetailScreen (hideTabBar)',
                });
                return null;
            }
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

function getLatestNotificationPreview(n: INotification): string {
    const m = n.message?.trim();
    if (m) {
        return m.length > 96 ? `${m.slice(0, 93)}…` : m;
    }
    return n.type;
}

export default function ClientTabNavigator() {
    const {
        opened,
        toggleOpened,
        syncNotificationBadgeCounts,
        setRefetchReadNotifications,
        setRefetchUnreadNotifications,
    } = UseTabMenu();
    const userID = useAuthStore(state => state.user?.id);
    const [hasMatches, setHasMatches] = useState(false);
    const [centerSheetLatestNotification, setCenterSheetLatestNotification] = useState<INotification | null>(null);
    const [isCenterSheetLatestNotificationLoading, setIsCenterSheetLatestNotificationLoading] = useState(false);
    const centerSheetRef = useRef<BottomSheet>(null);
    /** 90% when a latest notification is shown; 70% with no notification (or while loading) so the sheet stays compact. */
    const centerSheetSnapPoints = useMemo(() => {
        if (isCenterSheetLatestNotificationLoading) {
            return ['70%'];
        }
        return centerSheetLatestNotification ? ['90%'] : ['70%'];
    }, [isCenterSheetLatestNotificationLoading, centerSheetLatestNotification]);
    const [selectedCenterAction, setSelectedCenterAction] = useState<'invite' | 'purchase' | 'match' | 'solo' | null>(null);
    const [centerSheetStep, setCenterSheetStep] = useState<CenterSheetStep>('main');
    const [selectedSoloVibeId, setSelectedSoloVibeId] = useState<string | null>(null);
    const centerActionNavTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const CENTER_ACTION_NAV_DELAY_MS = 500;
    const SOLO_VIBE_OPTIONS: SoloVibeOption[] = useMemo(
        () => [
            {id: 'browsing', emoji: '🍿', title: 'Just browsing'},
            {id: 'chill', emoji: '😌', title: 'Chill & relax'},
            {id: 'vibes', emoji: '🔥', title: 'Late night vibes'},
            {id: 'something', emoji: '🎬', title: 'Something good'},
            {id: 'invite', emoji: '💞', title: 'Might invite someone'},
        ],
        [],
    );

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

    const loadCenterSheetLatestNotification = useCallback(async () => {
        setIsCenterSheetLatestNotificationLoading(true);
        try {
            const payload = await getNotifyMePayload();
            const list = payload?.notifications ?? [];
            syncNotificationBadgeCounts(list);
            if (list.length === 0) {
                setCenterSheetLatestNotification(null);
                return;
            }
            const sorted = [...list].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
            setCenterSheetLatestNotification(sorted[0] ?? null);
        } catch (e) {
            console.error('loadCenterSheetLatestNotification', e);
            setCenterSheetLatestNotification(null);
        } finally {
            setIsCenterSheetLatestNotificationLoading(false);
        }
    }, [syncNotificationBadgeCounts]);

    const onCenterSheetIndexChange = useCallback(
        (index: number) => {
            if (index === 0) {
                void loadCenterSheetLatestNotification();
            }
        },
        [loadCenterSheetLatestNotification],
    );

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
        setCenterSheetStep('main');
        setSelectedSoloVibeId(null);
        setSelectedCenterAction(null);
        centerSheetRef.current?.close();
    };

    const handlePressSeeAllNotifications = useCallback(() => {
        centerSheetRef.current?.close();
        navigateToUserNotificationScreen();
    }, []);

    const handlePressCenterSheetNotification = useCallback(
        async (notification: INotification) => {
            centerSheetRef.current?.close();
            try {
                const updated = await markNotificationRead({id: notification.id});
                if (updated) {
                    setRefetchReadNotifications(true);
                    setRefetchUnreadNotifications(true);
                    const payload = await getNotifyMePayload();
                    syncNotificationBadgeCounts(payload?.notifications);
                }
            } catch (e) {
                console.error('markNotificationRead from center sheet', e);
            }
            await NotificationNavigation(notification, userID);
        },
        [
            userID,
            setRefetchReadNotifications,
            setRefetchUnreadNotifications,
            syncNotificationBadgeCounts,
        ],
    );

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
        setSelectedCenterAction('solo');
        setCenterSheetStep('soloVibe');
    };

    const handlePressSoloSessionBack = useCallback(() => {
        setCenterSheetStep('main');
        setSelectedSoloVibeId(null);
    }, []);

    const handlePressStartSoloSession = (selectedVibeId?: string) => {
        // Persist the selected vibe in parallel with the navigation animation so the
        // user is never blocked on the network. Failures are surfaced via console only;
        // the screen still opens so the experience is not interrupted.
        if (selectedVibeId) {
            const apiVibe = resolveSoloSessionVibe(selectedVibeId);
            if (apiVibe) {
                void setSoloSessionVibe(apiVibe);
            } else {
                console.warn('handlePressStartSoloSession: unknown vibe id', selectedVibeId);
            }
        }

        scheduleCenterCircleNavigation('solo', () => {
            navigate('NoBottomStack', {
                screen: 'ClientStack',
                params: {
                    screen: 'SoloSessionScreen',
                    params: {
                        vibeId: selectedVibeId,
                    },
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

    useEffect(() => {
        if (centerSheetStep !== 'soloVibe') {
            return;
        }
        const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
            handlePressSoloSessionBack();
            return true;
        });
        return () => backSubscription.remove();
    }, [centerSheetStep, handlePressSoloSessionBack]);

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
                style={styles.centerSheetContainer}
                onChange={onCenterSheetIndexChange}>
                <BottomSheetScrollView
                    style={styles.centerSheetScroll}
                    contentContainerStyle={styles.centerSheetContent}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled">
                    {centerSheetStep === 'main' ? (
                        <>
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

                            {!isCenterSheetLatestNotificationLoading && centerSheetLatestNotification ? (
                                <View style={styles.latestNotificationBlock}>
                                    <View style={styles.latestNotificationHeaderRow}>
                                        <Text style={styles.latestNotificationBlockTitle}>Latest notification</Text>
                                        <Pressable
                                            onPress={handlePressSeeAllNotifications}
                                            hitSlop={8}
                                            style={({pressed}) => [
                                                styles.latestNotificationSeeAll,
                                                pressed && styles.latestNotificationSeeAllPressed,
                                            ]}>
                                            <Text style={styles.latestNotificationSeeAllText}>See all</Text>
                                        </Pressable>
                                    </View>
                                    <Pressable
                                        onPress={() => {
                                            void handlePressCenterSheetNotification(centerSheetLatestNotification);
                                        }}
                                        style={({pressed}) => [
                                            styles.latestNotificationRow,
                                            !centerSheetLatestNotification.isRead && styles.latestNotificationRowUnread,
                                            pressed && styles.latestNotificationRowPressed,
                                        ]}>
                                        <Icon
                                            name="bell-outline"
                                            type="material-community"
                                            color={COLORS.WHITE}
                                            size={22}
                                            style={styles.latestNotificationIcon}
                                        />
                                        <View style={styles.latestNotificationTextCol}>
                                            <Text style={styles.latestNotificationPreview} numberOfLines={2}>
                                                {getLatestNotificationPreview(centerSheetLatestNotification)}
                                            </Text>
                                            <Text style={styles.latestNotificationDate}>
                                                {formatDatestamp(centerSheetLatestNotification.createdAt)}
                                            </Text>
                                        </View>
                                        <Icon name="chevron-right" type="material-community" color={COLORS.OVERLAY_WHITE_50} size={22} />
                                    </Pressable>
                                </View>
                            ) : null}
                        </>
                    ) : (
                        <SoloVibeSheetContent
                            selectedSoloVibeId={selectedSoloVibeId}
                            soloVibeOptions={SOLO_VIBE_OPTIONS}
                            onSelectSoloVibe={setSelectedSoloVibeId}
                            onBack={handlePressSoloSessionBack}
                            onClose={closeCenterHexSheet}
                            onStartSession={handlePressStartSoloSession}
                        />
                    )}
                </BottomSheetScrollView>
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
        backgroundColor: COLORS.OVERLAY_WHITE_50,
        width: 52,
    },
    centerSheetScroll: {
        flex: 1,
    },
    centerSheetContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 32,
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
        color: COLORS.OVERLAY_WHITE_75,
        fontSize: 11,
        textAlign: 'center',
    },
    actionSubtitleSelected: {
        color: '#DAB5FF',
    },
    latestNotificationBlock: {
        marginTop: 4,
        gap: 8,
    },
    latestNotificationHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    latestNotificationBlockTitle: {
        flex: 1,
        color: COLORS.OVERLAY_WHITE_85,
        fontSize: 13,
        fontWeight: '600',
    },
    latestNotificationSeeAll: {
        paddingVertical: 2,
        paddingLeft: 8,
    },
    latestNotificationSeeAllPressed: {
        opacity: 0.75,
    },
    latestNotificationSeeAllText: {
        color: '#C78BFF',
        fontSize: 13,
        fontWeight: '600',
    },
    latestNotificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(22, 16, 40, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(176, 132, 255, 0.3)',
    },
    latestNotificationRowUnread: {
        borderLeftWidth: 3,
        borderLeftColor: '#C78BFF',
        paddingLeft: 9,
    },
    latestNotificationRowPressed: {
        opacity: 0.9,
    },
    latestNotificationIcon: {
        marginRight: 10,
    },
    latestNotificationTextCol: {
        flex: 1,
    },
    latestNotificationPreview: {
        color: COLORS.WHITE,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    latestNotificationDate: {
        marginTop: 4,
        color: COLORS.OVERLAY_WHITE_55,
        fontSize: 11,
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
