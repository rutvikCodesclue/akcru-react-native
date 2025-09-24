import {View, Text, ScrollView, TouchableOpacity, SafeAreaView, Pressable, Platform} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {RouteProp} from '@react-navigation/native';
import {INotification} from '../../../../types';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import BackButton from '../../../components/General/backbutton';
import LoadingComponent from '../../../components/Loading';
import {formatDatestamp, formatTimestampToAMPM} from '../../../util/util';
import AkcruButtons from '../../../components/akcruButtons';
import {
    batchMarkNotificationsRead,
    getMyNotifications,
    markNotificationRead,
    deleteAllReadNotifications,
    deleteNotification,
} from '../../../lib/api/notify.lib';
import useAuthStore from '../../../stores/auth.store';
import {UseTabMenu} from '../../../context/TabContext';
import {NotificationNavigation} from '../UserNotificationTabs/NotificationNavigation';
import {StackNavigationProp} from '@react-navigation/stack';
import { isTablet } from '../../../../assets/constants/theme';

type ViewUserFollowListNavigationProp = StackNavigationProp<UserProfileStackParams, 'ViewUserFollowList'>;
type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewUserFollowList'>;
type Props = {
    navigation: ViewUserFollowListNavigationProp;
    route: ViewUserFollowListRouteProp;
};

const LOAD_MORE_COUNT = 10;

const UserNotification = ({route}: Props) => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID = useAuthStore().user?.id;
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [displayedNotifications, setDisplayedNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {setRefetchUnreadNotifications, setRefetchReadNotifications} = UseTabMenu();

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                setNotifications(fetchedNotifications || []);
                setDisplayedNotifications(fetchedNotifications.slice(0, LOAD_MORE_COUNT));
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const handleLoadMore = () => {
        const nextNotifications = notifications.slice(
            displayedNotifications.length,
            displayedNotifications.length + LOAD_MORE_COUNT,
        );
        setDisplayedNotifications(prevNotifications => [...prevNotifications, ...nextNotifications]);
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
            UserTaggedOnPoll: 'You were tagged in poll',
            UserTaggedOnPollComment: 'You were tagged in poll comment',
        };
        return typeDisplayNames[type] || type;
    };

    const sortedNotifications: INotification[] = notifications.sort(
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
        try {
            const response = await deleteNotification(notificationId);
            if (response.success) {
                setNotifications(prevNotifications =>
                    prevNotifications.filter(notification => notification.id !== notificationId),
                );
                setRefetchReadNotifications(prevState => !prevState);
                setRefetchUnreadNotifications(prevState => !prevState);
            } else {
                console.error(`Failed to delete notification ${notificationId}: ${response.message}`);
            }
        } catch (error) {
            console.error(`Error deleting notification ${notificationId}:`, error);
        }
    };

    const hasUnreadNotifications = notifications.some(notif => !notif.isRead);
    const hasReadNotifications = notifications.some(notif => notif.isRead);

    const handleNotificationPress = async (notification: INotification) => {
        await handleMarkAsRead(notification.id);
        NotificationNavigation(notification, userID);
    };

    return (
        <View style={{flex: 1, ...styles.backbutton}}>
            <View>
                <View style={{zIndex: 100}}>
                    <Header />
                </View>
                <View
                    style={{
                        marginTop: isTablet() ? -100 : -60,
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
                        <View
                            style={{
                                marginTop: Platform.OS === 'android' ? '13%' : 0,
                                marginHorizontal: 15,
                            }}>
                            <BackButton navigation={navigation} />
                        </View>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                marginVertical: 15,
                                textAlign: 'center',
                                textDecorationLine: 'underline',
                            }}>
                            NOTIFICATIONS
                        </Text>
                    </View>
                    <SafeAreaView>
                        {isLoading ? (
                            <LoadingComponent />
                        ) : (
                            <ScrollView>
                                <View style={{marginHorizontal: 15, marginTop: 10, marginBottom: '95%'}}>
                                    {sortedNotifications.map((notification, index) => {
                                        const {id, type, message, isRead, createdAt} = notification;
                                        const displayName = getNotificationDisplayName(type);

                                        return (
                                            <Pressable
                                                key={index}
                                                onPress={() => handleNotificationPress(notification)}>
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
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                        <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                                            {displayName}
                                                        </Text>
                                                        <Text style={{...FONTS.Title2, color: COLORS.PURPLE}}>
                                                            {formatDatestamp(createdAt)}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={{
                                                            ...FONTS.Title2,
                                                            color: COLORS.DARKGREY,
                                                            textAlign: 'right',
                                                        }}>
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
                                                                    color: isRead ? COLORS.PURPLE : COLORS.PINK, // Different color for read/unread
                                                                }}>
                                                                {isRead ? 'Read' : 'Unread'}
                                                            </Text>
                                                        </View>
                                                        <TouchableOpacity onPress={() => handleDeleteNotification(id)}>
                                                            <Text style={{...FONTS.Title2, color: COLORS.PINK}}>
                                                                Delete Notification
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                {hasUnreadNotifications && (
                                    <View style={{alignItems: 'center', marginVertical: 10}}>
                                        <AkcruButtons.LrgButton
                                            btnname={'Mark All As Read'}
                                            onPress={handleMarkAllAsRead}
                                            color={COLORS.PURPLE}
                                            disabled={false}
                                        />
                                    </View>
                                )}
                                {hasReadNotifications && (
                                    <View style={{alignItems: 'center', marginVertical: 10}}>
                                        <AkcruButtons.LrgButton
                                            btnname={'Delete All Read'}
                                            onPress={handleDeleteAllReadNotifications}
                                            color={COLORS.PURPLE}
                                            disabled={false}
                                        />
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
                </View>
            </View>
        </View>
    );
};

export default UserNotification;
