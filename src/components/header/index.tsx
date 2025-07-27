import {View, Text, TouchableOpacity, Image, Pressable, AppState, AppStateStatus} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Icon, withBadge} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParams} from '../../navigation/AuthNavigation';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import useAuthStore from '../../stores/auth.store';
import {getMyNotifications} from '../../lib/api/notify.lib';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {UseTabMenu} from '../../context/TabContext';
import {getUserWallet} from '../../lib/api/wallet.lib';
import {isTablet} from '../../../assets/constants/theme';

const Header = ({searchScreen = 'SearchMovieScreen'}) => {
    const {user} = useAuthStore();
    const isFocused = useIsFocused();
    const walletBalance = useAuthStore(s => s.walletBalance);
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        getUserWallet()
            .then(b => {
                if (b !== undefined) {
                    setWalletBalance(b);
                }
            })
            .catch(e => console.error('wallet fetch failed', e));
    }, [isFocused, setWalletBalance]);

    const {
        refetchReadNotifications,
        refetchUnreadNotifications,
        deletedNotifications,
        setRefetchReadNotifications,
        setRefetchUnreadNotifications,
        setDeletedNotifications,
    } = UseTabMenu();

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [unreadCount, setUnreadCount] = useState('');

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef(AppState.currentState); // Track the app state (active, background, etc.)

    const fetchNotifications = async () => {
        try {
            const notifications = await getMyNotifications();
            if (notifications && notifications.length > 0) {
                const specificTypes = [
                    'MITReceived',
                    'MITAccepted',
                    'MITDeclined',
                    'MITCanceled',
                    'CruViewStarted',
                    'CRUViewCanceled',
                    'UserLikedGallery',
                    'UserLikedComment',
                    'UserLikedPost',
                    'UserTaggedOnPost',
                    'UserCommentedOnPost',
                    'UserTaggedOnComment',
                    'UserFollowed',
                    'CruInviteReceived',
                    'CruInviteAccepted',
                    'CruInviteDeclined',
                    'CruViewScheduled',
                    'ADReceived',
                    'GroupMessageReceived',
                    'MsgRcvd',
                ];
                const unreadNotifications = notifications.filter(
                    notification => !notification.isRead && specificTypes.includes(notification.type),
                );
                notifications.length ? setUnreadCount(unreadNotifications.length.toString()) : setUnreadCount('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Function to set the polling interval
    const startPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
        pollingInterval.current = setInterval(() => {
            fetchNotifications();
        }, 60000); // polling every 30 seconds
    };

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App is coming to the foreground
                if (isFocused) {
                    fetchNotifications(); // Fetch notifications when app comes to foreground
                    startPolling();
                }
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current); // Clean up interval on unmount
            }
            subscription.remove(); // Remove app state listener on unmount
        };
    }, [isFocused]); // Depend on isFocused

    // isFocused useEffect for normal navigation events
    useEffect(() => {
        if (isFocused) {
            fetchNotifications();
            startPolling();
        }
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [isFocused]);

    useEffect(() => {
        if (refetchReadNotifications || refetchUnreadNotifications || deletedNotifications) {
            fetchNotifications();

            setRefetchReadNotifications(false);
            setRefetchUnreadNotifications(false);
            setDeletedNotifications(false);
        }
    }, [refetchReadNotifications, refetchUnreadNotifications, deletedNotifications]);

    const NotificationBadgeIcon = withBadge(unreadCount)(Icon);

    return (
        <View
            style={{
                width: SIZES.ScreenWidth,
            }}>
            <LinearGradient
                colors={[COLORS.AKCRUBACKGROUND, 'transparent']}
                style={{position: 'absolute', left: 0, right: 0, top: 0, height: 65}}
            />
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: 15,
                }}>
                <View>
                    <Pressable onPress={() => navigation.navigate('ClientTabNavigator')}>
                        <Image
                            source={imageindex.AkcruLogo}
                            style={{width: isTablet() ? 120 : 90, height: isTablet() ? 90 : 60}}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{marginRight: 15}}>
                        <TouchableOpacity>
                            <Icon
                                name="magnify"
                                type="material-community"
                                color={COLORS.LIGHTGREY}
                                size={isTablet() ? 32 : 25}
                                onPress={() => navigation.navigate(searchScreen)}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation2.navigate('UserNotification')}>
                        <NotificationBadgeIcon
                            name="notifications-outline"
                            type="ionicon"
                            color={COLORS.LIGHTGREY}
                            size={isTablet() ? SIZES.MedIcon : SIZES.SmallIcon}
                            onPress={() => navigation2.navigate('UserNotification')}
                        />
                    </TouchableOpacity>
                    <View>
                        <Image
                            source={imageindex.AkcruHexLogo}
                            style={{
                                width: isTablet() ? 28 : 21,
                                height: isTablet() ? 28 : 21,
                                marginRight: 8,
                                marginLeft: 20,
                            }}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={{...FONTS.Title1}}>{walletBalance ?? '0'}</Text>
                </View>
            </View>
        </View>
    );
};

export default Header;
