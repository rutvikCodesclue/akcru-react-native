import {View, Text, TouchableOpacity, ScrollView, ImageBackground, Button, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {DIGITAL_PASS, FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {getMyNotifications, markNotificationRead} from '../../../lib/api/notify.lib';
import {INotification} from '../../../../types';
import { formatDatestamp, formatTimestampToAMPM } from '../../../util/util';



const UserNotifications = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const [notifications, setNotifications] = useState<INotification[]>([]);

    // Fetch notifications when the component mounts
    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                setNotifications(fetchedNotifications || []);
            } catch (error) {
                console.error(error);
            }
        }

        fetchNotifications();
    }, []);

    // Filter notifications based on specific types and unread status
    const filteredNotifications = notifications.filter(
        notification =>
            !notification.isRead &&
            (notification.type === 'MITAccepted' ||
                notification.type === 'MITDeclined' ||
                notification.type === 'CruInviteAccepted' ||
                notification.type === 'CruInviteDeclined'),
    );

    
    const handleMarkAsRead = async (notificationId: string, index: number) => {
        try {
            // Call the API to mark the notification as read
            const updatedNotification = await markNotificationRead({id: notificationId});

            console.log('API Response:', updatedNotification);

            if (updatedNotification) {
                // Update the local state to mark the notification as read
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === notificationId ? {...notification, isRead: true} : notification,
                    ),
                );
            } else {
                console.error(`Failed to mark notification ${notificationId} as read.`);
            }
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
        }
    };


    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView stickyHeaderIndices={[0]} style={{marginBottom: 60}}>
                <View>
                    <View style={{zIndex: 100}}>
                        <Header />
                    </View>

                    <View                   
                        style={{height: SIZES.ScreenHeight / 5, marginTop: -60}}>
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
                                    fontSize: 14,
                                    textDecorationLine: 'underline',
                                }}>
                                NOTIFICATIONS
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{marginHorizontal: 15}}>
                    {/* Render user notifications */}
                    {filteredNotifications.map((notification, index) => {
                        const {id, type, message, isRead, createdAt, user} = notification;

                        // Console.log the isRead property
                        console.log(`Notification ID: ${id}, isRead: ${isRead}`);
                        console.log("User Data:", filteredNotifications[0].user?.username);

                        return (
                            <View key={index} style={styles.cardcontainer}>
                                <LinearGradient
                                    // Background Linear Gradient
                                    colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        borderRadius: 5,
                                    }}
                                />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>{`${type}:`}</Text>
                                    <Text style={{...FONTS.Title2, color: COLORS.PURPLE}}>
                                        {formatDatestamp(createdAt)}
                                    </Text>
                                </View>
                                <Text style={{...FONTS.Title2, color: COLORS.DARKGREY, textAlign: 'right'}}>
                                    {formatTimestampToAMPM(createdAt)}
                                </Text>
                                {/* <Text style={{...FONTS.Title2}}>{`${user?.username}`}</Text> */}
                                <Text style={{...FONTS.Title2}}>{`${message}`}</Text>
                                <TouchableOpacity onPress={() => handleMarkAsRead(id, index)}>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            color: COLORS.MIDORANGE,
                                            textAlign: 'right',
                                        }}>
                                        {isRead ? 'Marked as Read' : 'Mark as Read'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserNotifications;
