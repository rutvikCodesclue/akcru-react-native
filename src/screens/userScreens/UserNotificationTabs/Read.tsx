import {View, Text, TouchableOpacity, ScrollView, SafeAreaView, Pressable, Platform} from 'react-native';

import React, {useEffect, useState} from 'react';
import {COLORS, FONTS} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {deleteAllReadNotifications, getMyNotifications} from '../../../lib/api/notify.lib';
import {INotification} from '../../../../types';
import {formatDatestamp, formatTimestampToAMPM} from '../../../util/util';
import AkcruButtons from '../../../components/akcruButtons';
import LoadingComponent from '../../../components/Loading';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {getPost} from '../../../lib/api/post.lib';
import {deleteReadNotification} from '../../../lib/api/notify.lib';

import {UseTabMenu} from '../../../context/TabContext';

const LOAD_MORE_COUNT = 10;

const Read = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [displayedNotifications, setDisplayedNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {refetchReadNotifications, setRefetchReadNotifications} = UseTabMenu();

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
    }, [refetchReadNotifications]);

    const handleLoadMore = () => {
        const nextNotifications = notifications.slice(
            displayedNotifications.length,
            displayedNotifications.length + LOAD_MORE_COUNT,
        );

        setDisplayedNotifications(prevNotifications => [...prevNotifications, ...nextNotifications]);
    };

    const navigateToContent = async (notification: INotification) => {
        try {
            switch (notification.type) {
                case 'MITReceived':
                    navigation.navigate('UserMITHubScreen');
                    break;

                case 'MITAccepted':
                case 'MITDeclined':
                case 'CruViewStarted':
                    navigation.navigate('UserProfileScreen');
                    break;
                case 'UserLikedComment':
                case 'UserLikedPost':
                case 'UserTaggedOnPost':
                case 'UserCommentedOnPost':
                case 'UserTaggedOnComment':
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

                default:
                    console.warn('Unhandled notification type:', notification.type);
                    break;
                case 'UserFollowed':
                case 'CruInviteReceived':
                case 'CruInviteAccepted':
                case 'CruInviteDeclined':
                case 'CruViewScheduled':
                    const userId = notification.senderId;
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
            MsgRcvd: 'New Message',
        };

        return typeDisplayNames[type] || type;
    };

    const filteredNotifications = notifications.filter(
        notification =>
            notification.isRead &&
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
                notification.type === 'CruInviteReceived'),
    );
    const sortedNotifications: INotification[] = filteredNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const hasReadNotifications = notifications.some(notif => notif.isRead);

    const handleDeleteAllReadNotifications = async () => {
        setIsLoading(true);
        try {
            const {success, message} = await deleteAllReadNotifications();
            if (success) {
                const remainingNotifications = notifications.filter(notif => !notif.isRead);
                setNotifications(remainingNotifications);
                setDisplayedNotifications(remainingNotifications.slice(0, LOAD_MORE_COUNT));
                console.log('All read notifications deleted successfully:', message);
                setRefetchReadNotifications(prevState => !prevState);
            } else {
                console.error('Failed to delete all read notifications:', message);
            }
        } catch (error) {
            console.error('Error deleting all read notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        if (!notificationId) {
            return;
        }

        const {success, message} = await deleteReadNotification(notificationId);
        console.log('Noitifciation ID:', notificationId);
        if (success) {
            const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
            setNotifications(updatedNotifications);
            setRefetchReadNotifications(prevState => !prevState);

            console.log('Notification deleted successfully:', message);
        } else {
            console.error('Failed to delete the notification:', message);
        }
    };

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
                                        <View
                                            style={{
                                                marginTop: '5%',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <View>
                                                <Text
                                                    style={{
                                                        ...FONTS.Title2,
                                                        color: COLORS.PURPLE,
                                                    }}>
                                                    {isRead ? 'Marked as Read' : 'Mark as Read'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => handleDeleteNotification(id)}>
                                                <Text style={{...FONTS.Title2, color: COLORS.PINK}}>
                                                    {isRead ? 'Delete Notification' : 'Mark as Read'}
                                                </Text>
                                            </TouchableOpacity>
                                            {/* <TouchableOpacity>
                                                <Text
                                                    style={{
                                                        ...FONTS.Title2,
                                                        color: COLORS.PINK,
                                                    }}>
                                                    {isRead ? 'Delete Notification' : 'Mark as Read'}
                                                </Text>
                                            </TouchableOpacity> */}
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                    {hasReadNotifications ? (
                        <View style={{alignItems: 'center', marginVertical: 10}}>
                            <AkcruButtons.LrgButton
                                btnname={'Delete All Read'}
                                onPress={handleDeleteAllReadNotifications}
                                color={COLORS.PURPLE}
                                disabled={false}
                            />
                        </View>
                    ) : (
                        <View style={{alignItems: 'center', marginVertical: 20}}>
                            <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>
                                No notifications marked as read
                            </Text>
                        </View>
                    )}

                    {displayedNotifications.length < notifications.length && (
                        <View
                            style={{
                                alignItems: 'center',
                                marginVertical: 10,
                                marginBottom: Platform.OS == 'ios' ? 50 : 0,
                            }}>
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
