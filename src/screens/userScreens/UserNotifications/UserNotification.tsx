import {View, Text, ScrollView, SafeAreaView, Platform} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
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
import AkcruButtons from '../../../components/akcruButtons';
import NotificationMitStyleCard from '../../../components/NotificationMitStyleCard';
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
    const [visibleCount, setVisibleCount] = useState(LOAD_MORE_COUNT);
    const [isLoading, setIsLoading] = useState(true);
    const {setRefetchUnreadNotifications, setRefetchReadNotifications, syncNotificationBadgeCounts} = UseTabMenu();

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const fetchedNotifications = await getMyNotifications();
                setNotifications(fetchedNotifications || []);
                setVisibleCount(LOAD_MORE_COUNT);
                syncNotificationBadgeCounts(fetchedNotifications);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, sortedNotifications.length));
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
            VisionaryRoomRequested: 'Visionary Room request received',
            VisionaryRoomRequestAccepted: 'Visionary Room request accepted',
            VisionaryRoomRequestDeclined: 'Visionary Room request declined',
            VisionaryRoomInvite: 'Visionary Room invite',
        };
        return typeDisplayNames[type] || type;
    };

    const sortedNotifications: INotification[] = useMemo(
        () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [notifications],
    );
    const visibleNotifications = useMemo(
        () => sortedNotifications.slice(0, visibleCount),
        [sortedNotifications, visibleCount],
    );

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const updatedNotification = await markNotificationRead({id: notificationId});
            if (updatedNotification) {
                setRefetchReadNotifications(true);
                setRefetchUnreadNotifications(true);
                const updatedNotifications = notifications.map(notification =>
                    notification.id === notificationId ? {...notification, isRead: true} : notification,
                );
                setNotifications(updatedNotifications);
                syncNotificationBadgeCounts(updatedNotifications);
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
                    const updatedNotifications = notifications.map(notif => ({...notif, isRead: true}));
                    setNotifications(updatedNotifications);
                    syncNotificationBadgeCounts(updatedNotifications);
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
                setVisibleCount(Math.min(LOAD_MORE_COUNT, remainingNotifications.length));
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
    const showBulkActions = hasUnreadNotifications || hasReadNotifications;
    const bothBulkActions = hasUnreadNotifications && hasReadNotifications;
    const bulkActionBtnWidth = bothBulkActions ? (SIZES.ScreenWidth - 30 - 8) / 2 : undefined;

    const handleNotificationPress = async (notification: INotification) => {
        await handleMarkAsRead(notification.id);
        NotificationNavigation(notification, userID);
    };

    return (
        <View style={{flex: 1, ...styles.backbutton}}>
            <View style={{flex: 1}}>
                <View style={{zIndex: 100}}>
                    <Header />
                </View>
                <View
                    style={{
                        flex: 1,
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
                    <SafeAreaView style={{flex: 1}}>
                        {isLoading ? (
                            <LoadingComponent />
                        ) : (
                            <>
                                <ScrollView
                                    style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND}}
                                    contentContainerStyle={{
                                        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
                                    }}>
                                    <View style={{marginHorizontal: 10, marginTop: 10}}>
                                        <View style={styles.chatListPanel}>
                                            {visibleNotifications.map((notification, index) => {
                                                const {id, type, message, isRead, createdAt} = notification;
                                                const displayName = getNotificationDisplayName(type);
                                                const isLast = index === visibleNotifications.length - 1;

                                                return (
                                                    <NotificationMitStyleCard
                                                        key={id}
                                                        displayName={displayName}
                                                        message={message}
                                                        createdAt={createdAt}
                                                        isRead={isRead}
                                                        isLast={isLast}
                                                        onPressCard={() => handleNotificationPress(notification)}
                                                        onPressDelete={() => handleDeleteNotification(id)}
                                                    />
                                                );
                                            })}
                                        </View>
                                    </View>
                                    {visibleNotifications.length < sortedNotifications.length && (
                                        <View
                                            style={{
                                                alignItems: 'center',
                                                marginVertical: 10,
                                                marginBottom: Platform.OS === 'ios' ? 24 : 16,
                                            }}>
                                            <AkcruButtons.LrgButton
                                                variant="auth"
                                                btnname={'Load More'}
                                                onPress={handleLoadMore}
                                                color={COLORS.PURPLE}
                                                disabled={false}
                                            />
                                        </View>
                                    )}
                                </ScrollView>
                                {showBulkActions ? (
                                    <View style={styles.bulkActionsBar}>
                                        <View
                                            style={[
                                                styles.bulkActionsRow,
                                                bothBulkActions ? styles.bulkActionsRowSplit : styles.bulkActionsRowSingle,
                                            ]}>
                                            {hasUnreadNotifications ? (
                                                <AkcruButtons.LrgButton
                                                    variant="auth"
                                                    authButtonWidth={bulkActionBtnWidth}
                                                    btnname={'Mark All As Read'}
                                                    onPress={handleMarkAllAsRead}
                                                    color={COLORS.PURPLE}
                                                    disabled={isLoading}
                                                />
                                            ) : null}
                                            {hasReadNotifications ? (
                                                <AkcruButtons.LrgButton
                                                    variant="auth"
                                                    authButtonWidth={bulkActionBtnWidth}
                                                    btnname={'Delete All Read'}
                                                    onPress={handleDeleteAllReadNotifications}
                                                    color={COLORS.PURPLE}
                                                    disabled={isLoading}
                                                />
                                            ) : null}
                                        </View>
                                    </View>
                                ) : null}
                            </>
                        )}
                    </SafeAreaView>
                </View>
            </View>
        </View>
    );
};

export default UserNotification;
