import {View, Text, TouchableOpacity, ScrollView, SafeAreaView, Pressable} from 'react-native';

import React, {useEffect, useState} from 'react';
import {COLORS, FONTS} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {batchMarkNotificationsRead, getMyNotifications, markNotificationRead} from '../../../lib/api/notify.lib';
import {INotification} from '../../../../types';
import {formatDatestamp, formatTimestampToAMPM} from '../../../util/util';
import AkcruButtons from '../../../components/akcruButtons';
import LoadingComponent from '../../../components/Loading';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {getPost} from '../../../lib/api/post.lib';
import {UseTabMenu} from '../../../context/TabContext';
import useAuthStore from '../../../stores/auth.store';
import {findAUser} from '../../../lib/api/user.lib';
import {listCrusForUser} from '../../../lib/api/cru.lib';

const Unread = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {setRefetchUnreadNotifications, setRefetchReadNotifications} = UseTabMenu();
    const userID = useAuthStore().user?.id;

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                setNotifications(fetchedNotifications || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchNotifications();
    }, []);

    const navigateToContent = async (notification: INotification) => {
        try {
            let postId;
            let userId;
            let currentUser;
            switch (notification.type) {
                case 'MITReceived':
                    navigation.navigate('UserMITHubScreen', {index: 0});
                    break;
                case 'MITAccepted':
                    navigation.navigate('UserProfileScreen', {index: 1});
                    break;
                case 'MITDeclined':
                    navigation.navigate('UserMITHubScreen', {index: 1});
                    break;
                case 'CruViewStarted':
                    navigation.navigate('UserProfileScreen', {index: 1});
                    break;
                case 'UserLikedGallery':
                    const galleryId = notification.galleryId;
                    await findAUser({id: userID}).then(user => {
                        currentUser = user;
                    });
                    const galleryItem = currentUser.userGallery.find(item => item.id === galleryId);
                    navigation.navigate('ViewUserScreen', {userID: userID, imageURL: galleryItem.imageURL});
                    break;
                case 'UserLikedComment':
                    postId = notification.postId;
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
                case 'UserLikedPost':
                    postId = notification.postId;
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
                case 'UserTaggedOnPost':
                    postId = notification.postId;
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
                case 'UserCommentedOnPost':
                    postId = notification.postId;
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
                case 'UserTaggedOnComment':
                    postId = notification.postId;
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
                case 'UserFollowed':
                    userId = notification.senderId;
                    if (userId) {
                        navigation.navigate('ViewUserScreen', {userID: userId});
                    } else {
                        console.error('User ID not found');
                    }
                    break;
                case 'CruInviteReceived':
                    navigation.navigate('UserProfileScreen', {index: 2});
                    break;
                case 'CruInviteAccepted':
                    navigation.navigate('UserProfileScreen', {index: 0});
                    break;
                case 'CruInviteDeclined':
                    navigation.navigate('UserProfileScreen', {index: 0});
                    break;
                case 'CruViewScheduled':
                    navigation.navigate('UserProfileScreen', {index: 1});
                    break;
                case 'ADReceived':
                    navigation.navigate('UserProfileScreen', {index: 3});
                    break;
                case 'GroupMessageReceived':
                    let userCrus = await listCrusForUser(userID);
                    let targetCruId = notification.cruId;
                    let targetCru = userCrus.find(item => item.id === targetCruId);
                    navigation.navigate('ViewGroupChat', {cru: targetCru});
                    break;
                case 'MsgRcvd':
                    let senderId = notification.senderId;
                    let mITId = notification.mITId;
                    await findAUser({id: senderId}).then(user => {
                        currentUser = user;
                    });
                    let senderProfilePicture = currentUser.profilePicture;
                    let senderUsername = currentUser.username;
                    navigation.navigate('ViewChat', {
                        mItInviteId: mITId,
                        userId: senderId,
                        profilePicture: senderProfilePicture,
                        username: senderUsername,
                    });
                    break;
                default:
                    console.warn('Unhandled notification type:', notification.type);
                    break;
            }
        } catch (error) {
            console.error('Error navigating to content:', error);
        }
    };

    const getNotificationDisplayName = (type: string) => {
        const typeDisplayNames: {[key: string]: string} = {
            MITReceived: 'You have received a MIT',
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
            GroupMessageReceived: 'New Group Message',
            MsgRcvd: 'New Message',
            ADReceived: 'You have received ACKRU Dollars',
            UserLikedGallery: 'New like on your photo',
        };

        return typeDisplayNames[type] || type;
    };

    const filteredNotifications = notifications.filter(
        notification =>
            !notification.isRead &&
            (notification.type === 'MITAccepted' ||
                notification.type === 'MITDeclined' ||
                notification.type === 'MITReceived' ||
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
                notification.type === 'CruInviteReceived' ||
                notification.type === 'ADReceived' ||
                notification.type === 'UserLikedGallery' ||
                notification.type === 'MsgRcvd' ||
                notification.type === 'GroupMessageReceived')
    );
    const sortedNotifications: INotification[] = filteredNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const updatedNotification = await markNotificationRead({id: notificationId});
            if (updatedNotification) {
                setRefetchReadNotifications(true);

                setRefetchUnreadNotifications(true);
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
        setIsLoading(true);
        const unreadNotificationIds = notifications.filter(notif => !notif.isRead).map(notif => notif.id);
        if (unreadNotificationIds.length > 0) {
            try {
                const response = await batchMarkNotificationsRead(unreadNotificationIds);
                if (response.success) {
                    setRefetchReadNotifications(prevState => !prevState);
                    setRefetchUnreadNotifications(prevState => !prevState);
                    setNotifications(notifications.map(notif => ({...notif, isRead: true})));
                } else {
                    console.error('Failed to mark all notifications as read');
                }
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const hasUnreadNotifications = notifications.some(notif => !notif.isRead);

    return (
        <SafeAreaView>
            {isLoading ? (
                <LoadingComponent />
            ) : (
                <ScrollView>
                    <View style={{marginHorizontal: 15}}>
                        {sortedNotifications.map((notification, index) => {
                            const {id, type, message, isRead, createdAt, user} = notification;

                            //console.log(`Notification ID: ${id}, isRead: ${isRead}`);
                            //console.log('User Data Notification:', notification);

                            const displayName = getNotificationDisplayName(type);

                            return (
                                <Pressable key={index} onPress={() => navigateToContent(notification)}>
                                    <View key={index} style={styles.cardcontainer}>
                                        <LinearGradient
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

                                        <Text style={{...FONTS.Title2}}>{`${message}`}</Text>
                                        <View style={{marginTop: '5%'}}>
                                            <TouchableOpacity
                                                onPress={() => handleMarkAsRead(id, index)}
                                                style={{alignSelf: 'flex-end', width: '40%'}}>
                                                <Text
                                                    style={{
                                                        ...FONTS.Title2,
                                                        color: COLORS.PINK,
                                                        textAlign: 'right',
                                                    }}>
                                                    {isRead ? 'Marked as Read' : 'Mark as Read'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                    {hasUnreadNotifications ? (
                        <View style={{alignItems: 'center', marginVertical: 10}}>
                            <AkcruButtons.LrgButton
                                btnname={'Mark All As Read'}
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
