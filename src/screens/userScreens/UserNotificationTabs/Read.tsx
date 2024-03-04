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

const LOAD_MORE_COUNT = 10; // Number of notifications to load each time

const Read = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [displayedNotifications, setDisplayedNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Initialize loading state to true

    // Fetch notifications when the component mounts
    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                const readNotifications = fetchedNotifications?.filter(notif => notif.isRead);
                setNotifications(readNotifications || []);
                setDisplayedNotifications(readNotifications.slice(0, LOAD_MORE_COUNT));
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchNotifications();
    }, []);

    const handleLoadMore = () => {
        // Calculate the next set of notifications to display
        const nextNotifications = notifications.slice(
            displayedNotifications.length,
            displayedNotifications.length + LOAD_MORE_COUNT,
        );

        // Update the list of displayed notifications
        setDisplayedNotifications(prevNotifications => [...prevNotifications, ...nextNotifications]);
    };

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
            notification.isRead &&
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

    const hasReadNotifications = notifications.some(notif => notif.isRead);

    return (
        <SafeAreaView>
            {isLoading ? (
                // Render LoadingComponent only when isLoading is true
                <LoadingComponent />
            ) : (
                <ScrollView>
                    <View style={{marginHorizontal: 15}}>
                        {/* Render user notifications */}
                        {displayedNotifications.map((notification, index) => {
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
                                        <View>
                                            <Text
                                                style={{
                                                    ...FONTS.Title2,
                                                    color: COLORS.MIDORANGE,
                                                    textAlign: 'right',
                                                }}>
                                                {isRead ? 'Marked as Read' : 'Mark as Read'}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                    {/* Conditionally render "Load More" button if there are more notifications to load */}
                        {displayedNotifications.length < notifications.length && (
                        <View style={{alignItems: 'center', marginVertical: 10}}>
                            <AkcruButtons.LrgButton
                                btnname={'Load More'}
                                onPress={handleLoadMore}
                                color={COLORS.PURPLE}
                                disabled={false}
                            />
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default Read;
