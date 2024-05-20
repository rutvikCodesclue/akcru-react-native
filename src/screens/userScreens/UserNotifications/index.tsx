import {View, Text, TouchableOpacity, ScrollView, ImageBackground, Button, SafeAreaView} from 'react-native';
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
import BackButton from '../../../components/General/backbutton';

const UserNotifications = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                //console.log('Fetched Notifications:', fetchedNotifications);
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
            switch (notification.type) {
                case 'UserLikedComment':
                case 'UserLikedPost':
                case 'UserTaggedOnPost':
                case 'UserCommentedOnPost':
                case 'UserTaggedOnComment':
                case 'ADReceived':
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
                    const userId = notification.senderId;
                    //console.log('Notification Data:', notification)
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
            ADReceived: 'You just received AD',
        };

        return typeDisplayNames[type] || type;
    };

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
                notification.type === 'CruInviteReceived' ||
                notification.type === 'ADReceived'),
    );
    const sortedNotifications: INotification[] = filteredNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const handleMarkAsRead = async (notificationId: string, index: number) => {
        try {
            const updatedNotification = await markNotificationRead({id: notificationId});

            //console.log('API Response:', updatedNotification);

            if (updatedNotification) {
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
                const response = await batchMarkNotificationsRead(unreadNotificationIds);
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
        <TabContainer>
            <SafeAreaView style={{flex: 1}}>
                {isLoading ? (
                    <LoadingComponent />
                ) : (
                    <ScrollView stickyHeaderIndices={[0]} style={{marginBottom: 60}}>
                        <View>
                            <View style={{zIndex: 100}}>
                                <Header />
                            </View>

                            <View
                                style={{
                                    height: SIZES.ScreenHeight / 5,
                                    marginTop: -60,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                }}>
                                <LinearGradient
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
                                    <BackButton navigation={navigation} />
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            marginTop: 10,

                                            textAlign: 'center',
                                            fontSize: 13,
                                            textDecorationLine: 'underline',
                                        }}>
                                        NOTIFICATIONS
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={{marginHorizontal: 15}}>
                            {sortedNotifications.map((notification, index) => {
                                const {id, type, message, isRead, createdAt, user} = notification;
                                const displayName = getNotificationDisplayName(type);

                                return (
                                    <TouchableOpacity key={index} onPress={() => navigateToContent(notification)}>
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
                                    </TouchableOpacity>
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
        </TabContainer>
    );
};

export default UserNotifications;
