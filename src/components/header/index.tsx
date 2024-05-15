import {View, Text, TouchableOpacity, Image, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
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

const Header = () => {
    const {user} = useAuthStore();

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

    const isFocused = useIsFocused();

    const fetchNotifications = async () => {
        try {
            const notifications = await getMyNotifications();
            if (notifications && notifications.length > 0) {
                const specificTypes = [
                    'MITReceived',
                    'MITAccepted',
                    'MITDeclined',
                    'CruInviteAccepted',
                    'CruInviteDeclined',
                    'UserFollowed',
                    'UserCommentedOnPost',
                    'UserLikedComment',
                    'UserTaggedOnPost',
                    'UserTaggedOnComment',
                    'UserLikedPost',
                    'CruInviteReceived',
                    'CruViewScheduled',
                    'CruViewStarted',
                    'ADReceived',
                ];
                const unreadNotifications = notifications.filter(
                    notification => !notification.isRead && specificTypes.includes(notification.type),
                );
                setUnreadCount(unreadNotifications.length.toString());
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchNotifications();
        }
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
                        <Image source={imageindex.AkcruLogo} style={{width: 90, height: 60}} resizeMode="contain" />
                    </Pressable>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{marginRight: 15}}>
                        <TouchableOpacity>
                            <Icon
                                name="magnify"
                                type="material-community"
                                color={COLORS.LIGHTGREY}
                                size={25}
                                onPress={() => navigation.navigate('SearchMovieScreen')}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation2.navigate('UserNotification')}>
                        <NotificationBadgeIcon
                            name="notifications-outline"
                            type="ionicon"
                            color={COLORS.LIGHTGREY}
                            size={SIZES.SmallIcon}
                            onPress={() => navigation2.navigate('UserNotification')}
                        />
                    </TouchableOpacity>
                    <View>
                        <Image
                            source={imageindex.AkcruHexLogo}
                            style={{width: 21, height: 21, marginRight: 8, marginLeft: 20}}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={{...FONTS.Title1}}>{user?.adAmount ?? 0}</Text>
                </View>
            </View>
        </View>
    );
};

export default Header;
