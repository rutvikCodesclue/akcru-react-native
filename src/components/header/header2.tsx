import {View, Text, TouchableOpacity, Image, Pressable} from 'react-native';
import React, { useEffect, useState } from 'react';
import {Icon, Badge, withBadge} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AuthNavigation';
import { ClientStackParams } from '../../navigation/ClientStack';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import useAuthStore from '../../stores/auth.store';
import { getMyNotifications } from '../../lib/api/notify.lib'; // Import the API function

const Header2 = () => {
    const {user} = useAuthStore();

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [unreadCount, setUnreadCount] = useState(''); // State to store unread notification count

    const isFocused = useIsFocused(); // Check if the screen is currently focused

    // Fetch notifications and calculate unread count when the component mounts
    const fetchNotifications = async () => {
        try {
            const notifications = await getMyNotifications();
            if (notifications && notifications.length > 0) {
                const specificTypes = ['MITAccepted', 'MITDeclined', 'CruInviteAccepted', 'CruInviteDeclined', 'UserFollowed'];
                const unreadNotifications = notifications.filter(
                    notification => !notification.isRead && specificTypes.includes(notification.type),
                );
                setUnreadCount(unreadNotifications.length.toString());
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Use useEffect to fetch notifications when the screen comes into focus
    useEffect(() => {
        if (isFocused) {
            fetchNotifications();
        }
    }, [isFocused]);

    const NotificationBadgeIcon = withBadge(unreadCount)(Icon);

    return (
        <View
            style={{
                width: SIZES.ScreenWidth,
            }}>
            <LinearGradient
                // Background Linear Gradient
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
                        <Image source={imageindex.AkcruLogo} style={{width: 100, height: 70}} resizeMode="contain" />
                    </Pressable>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* <View style={{marginRight: 15}}>
                        <TouchableOpacity>
                            <Icon
                                name="magnify"
                                type="material-community"
                                color={COLORS.LIGHTGREY}
                                size={28}
                                onPress={() => navigation.navigate('SearchMovieScreen')}
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('UserNotifications')}>
                        <NotificationBadgeIcon
                            name="notifications-outline"
                            type="ionicon"
                            color={COLORS.LIGHTGREY}
                            size={SIZES.SmallIcon}
                            onPress={() => navigation.navigate('UserNotifications')}
                        />
                    </TouchableOpacity> */}
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

export default Header2;
