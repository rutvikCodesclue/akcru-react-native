
import {View, Text, TouchableOpacity, ScrollView, ImageBackground, Button, SafeAreaView, Pressable} from 'react-native';

import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {batchMarkNotificationsRead, getMyNotifications, markNotificationRead} from '../../../lib/api/notify.lib';
import {INotification} from '../../../../types';
import {formatDatestamp, formatTimestampToAMPM} from '../../../util/util';
import TabContainer from '../../../components/TabContainer/TabContainer';
import AkcruButtons from '../../../components/akcruButtons';
import LoadingComponent from '../../../components/Loading';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {getPost} from '../../../lib/api/post.lib';

const Unread = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Initialize loading state to true

    // Fetch notifications when the component mounts
    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                //console.log('Fetched Notifications:', fetchedNotifications);
                setNotifications(fetchedNotifications || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false); // End loading, regardless of the outcome
            }
        }

        fetchNotifications();
    }, []);

    // Example function to handle navigation based on notification
    const navigateToContent = async (notification: INotification) => {
        try {
            switch (notification.type) {
                case 'UserLikedComment':
                case 'UserLikedPost':
                case 'UserTaggedOnPost':
                case 'UserCommentedOnPost':
                case 'UserTaggedOnComment':
                    // Fetch the post data before navigating
                    const postId = notification.postId;
                    if (postId) {
                        const numericPostId = parseInt(postId, 10);
                        const post = await getPost(numericPostId);
                        if (post) {
                            navigation.navigate('PostScreen', {post: post});
                        } else {
                            console.error('Post not found');
                        }
                    }
                    break;
                // Handle other cases as needed
                default:
                    console.warn('Unhandled notification type:', notification.type);
                    break;
                case 'UserFollowed':
                case 'CruInviteReceived':
                case 'CruInviteAccepted':
                case 'CruInviteDeclined':
                case 'CruViewScheduled':
                    // Assuming the notification includes the user ID of the follower
                    const userId = notification.senderId; // Adjust this to match your notification structure
                    //console.log('Notification Data:', notification);
                    if (userId) {
                        navigation.navigate('ViewUserScreen', {userID: userId});
                    } else {
                        console.error('User ID not found');
                    }
                    break;
            }
        } catch (error) {
            console.error('Error navigating to content:', error);
        }
    };

    const getNotificationDisplayName = (type: string) => {
        const typeDisplayNames: {[key: string]: string} = {
            MITAccepted: 'Your MIT was Accepted',
            MITDeclined: 'Your MIT was Declined',
            CruInviteAccepted: 'Your Cru Invite was Accepted',
            CruInviteDeclined: 'Your Cru Invite was Declined',
            UserFollowed: 'New follower',
            UserCommentedOnPost: 'New comment on your post',
            UserLikedComment: 'New like on your comment',
            UserLikedPost: 'New like on your post',
            UserTaggedOnPost: 'You were tagged in post',
            UserTaggedOnComment: 'You were tagged in comment',
            CruViewScheduled: 'A Cru View was scheduled',
            CruViewStarted: 'A Cru View was started',
            CruInviteReceived: 'A Cru Invite was received',
            // Add more mappings as needed
        };

        return typeDisplayNames[type] || type; // Return the original type if not found in the map
    };

    // Filter notifications based on specific types and unread status
    const filteredNotifications = notifications.filter(
        notification =>
            !notification.isRead &&
            (notification.type === 'MITAccepted' ||
                notification.type === 'MITDeclined' ||
                notification.type === 'CruInviteAccepted' ||
                notification.type === 'CruInviteDeclined' ||
                notification.type === 'UserFollowed' ||
                notification.type === 'UserCommentedOnPost' ||
                notification.type === 'UserLikedComment' ||
                notification.type === 'UserTaggedOnPost' ||
                notification.type === 'UserTaggedOnComment' ||
                notification.type === 'UserLikedPost' ||
                notification.type === 'CruViewScheduled' ||
                notification.type === 'CruViewStarted' ||
                notification.type === 'CruInviteReceived'),
    );
    const sortedNotifications: INotification[] = filteredNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const handleMarkAsRead = async (notificationId: string, index: number) => {
        try {
            // Call the API to mark the notification as read
            const updatedNotification = await markNotificationRead({id: notificationId});

            //console.log('API Response:', updatedNotification);

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

    const handleMarkAllAsRead = async () => {
        const unreadNotificationIds = notifications.filter(notif => !notif.isRead).map(notif => notif.id);

        if (unreadNotificationIds.length > 0) {
            try {
                const response = await batchMarkNotificationsRead(unreadNotificationIds); // Implement this function
                if (response.success) {
                    setNotifications(notifications.map(notif => ({...notif, isRead: true})));
                    //console.log('All notifications marked as read');
                } else {
                    console.error('Failed to mark all notifications as read');
                }
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        }
    };

    const hasUnreadNotifications = notifications.some(notif => !notif.isRead);

    return (
        <SafeAreaView>
            {isLoading ? (
                // Render LoadingComponent only when isLoading is true
                <LoadingComponent />
            ) : (
                <ScrollView>
                    <View style={{marginHorizontal: 15}}>
                        {/* Render user notifications */}
                        {sortedNotifications.map((notification, index) => {
                            const {id, type, message, isRead, createdAt, user} = notification;

                            // Console.log the isRead property
                            //console.log(`Notification ID: ${id}, isRead: ${isRead}`);
                            //console.log('User Data Notification:', notification);

                            // Use the mapping function to get the display name
                            const displayName = getNotificationDisplayName(type);

                            return (
                                <Pressable key={index} onPress={() => navigateToContent(notification)}>
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
                                            <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                                {displayName}
                                            </Text>
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
                                </Pressable>
                            );
                        })}
                    </View>
                    {hasUnreadNotifications ? (
                        <View style={{alignItems: 'center', marginVertical: 10}}>
                            <AkcruButtons.LrgButton
                                btnname={'Mark All as Read'}
                                onPress={handleMarkAllAsRead}
                                color={COLORS.PURPLE}
                                disabled={false}
                            />
                        </View>
                    ) : (
                        <View style={{alignItems: 'center', marginVertical: 20}}>
                            <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>
                                No new notifications available
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>

    );
};

export default Unread;
