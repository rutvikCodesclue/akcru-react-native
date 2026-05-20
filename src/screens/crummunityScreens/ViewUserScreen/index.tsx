import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Pressable,
    Modal,
    SafeAreaView,
    TouchableWithoutFeedback,
    Animated,
    useWindowDimensions,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import styles from './styles';
import React, {useEffect, useRef, useState} from 'react';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import {CommonActions, RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {
    blockUser,
    findAUser,
    followUser,
    getBlockedUsers,
    getFollowers,
    getUserCurrentWatching,
    getUserFollowing,
    unblockUser,
    unfollowUser,
} from '../../../lib/api/user.lib';
import {IPoll, IPost, IUserProfile} from '../../../../types';
import {formatNumber, selectAvatarBorderColor} from '../../../util/util';
import {checkUserMembership, createACRUInvite, getCruInviteStatus} from '../../../lib/api/cru.lib';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import ComfirmationModal from '../../../components/ConfirmationModal';
import useAuthStore from '../../../stores/auth.store';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import {isTablet} from '../../../../assets/constants/theme';
import GalleryPic from '../../../components/GalleryPic';
import BackButton from '../../../components/General/backbutton';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import type {PressableAndroidRippleConfig, StyleProp, ViewStyle, TextStyle} from 'react-native';
import {Route} from 'react-native';

// posts
import {getPost, getPostsByUser, likePost, unlikePost, deletePost, pinPost} from '../../../lib/api/post.lib';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';

// polls
import {
  commentOnPoll,
  getPollById,
  likePoll,
  unlikePoll,
  deletePoll,
  pinPoll,
  voteOnPoll,
  getPollsByUser,
} from '../../../lib/api/poll.lib';
import PollCard from '../../../components/SkinnyPollCard';
import {
    navigateToNewComment,
    navigateToPollScreen,
    navigateToPostScreen,
    navigateToReportUser,
} from '../../../util/RootNavigation';
import {subscribeFeedPollRefresh, subscribeFeedPostRefresh} from '../../../util/feedRefreshEvents';
import ArchetypeHorizontalDivider from '../../../components/ArchetypeHorizontalDivider';
import AkcruButtons from '../../../components/akcruButtons';
import ProfileMetricChip from '../../../components/ProfileMetricChip';
import ProfileUserBadges, {resolveAkcruBadgeConfig} from '../../../components/ProfileUserBadges';


type ViewUserScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'ViewUserScreen'>;

type ViewUserScreenRouteProp = RouteProp<UserProfileStackParams, 'ViewUserScreen'>;

type Props = {
    navigation: ViewUserScreenNavigationProp;
    route: ViewUserScreenRouteProp;
};

export default function ViewUserScreen({route, navigation}: Props) {
    const [follow, setFollow] = useState(false);

    const currentuser = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();
    const userID: string | undefined = route.params?.userID ?? null;

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    const archetype = user?.archetype ? JSON.parse(user.archetype) : null;
    const isPresenceVisible = (user as any)?.presence?.visibility === 'VISIBLE';
    const isPresenceActive = isPresenceVisible && (user as any)?.presence?.state === 'ACTIVE';
    const archetypeTags = React.useMemo(() => {
        if (!archetype) return [];

        if (Array.isArray(archetype?.tags)) {
            return archetype.tags.filter(Boolean).slice(0, 3);
        }

        if (Array.isArray(archetype?.genres)) {
            return archetype.genres.filter(Boolean).slice(0, 3);
        }

        if (typeof archetype?.genrePair === 'string' && archetype.genrePair.includes(',')) {
            return archetype.genrePair
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
                .slice(0, 3);
        }

        if (typeof archetype?.key === 'string' && archetype.key.includes(',')) {
            return archetype.key
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean)
                .slice(0, 3);
        }

        return [];
    }, [archetype]);
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const layout = useWindowDimensions();

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();

            return () => {};
        }, []),
    );

    useEffect(() => {
        const fetchCruInviteStatus = async () => {
            const status = await getCruInviteStatus(userID);
            if (status === 'PENDING') {
                setbtnName('PENDING');
                setbtnDisabled(true);
                setbtnColor(COLORS.DARKGREY);
            }
        };

        fetchCruInviteStatus();
    }, [userID]);

    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (userID) {
                try {
                    const membershipStatus = await checkUserMembership(userID);
                    setIsMember(membershipStatus);
                    if (membershipStatus) {
                        setbtnName('CRU MEMBER');
                        setbtnDisabled(true);
                        setbtnColor(COLORS.PINK);
                    }
                } catch (error) {
                    console.error('Failed to fetch membership status:', error);
                }
            }
        };

        fetchData();
    }, [userID]);
    const [btnName, setbtnName] = useState('CRU INVITE');
    const [btnDisabled, setbtnDisabled] = useState(false);
    const [btnColor, setbtnColor] = useState(COLORS.AKCRUBLUE);

    useFocusEffect(
        React.useCallback(() => {
            findAUser({id: userID}).then(responseUser => {
                const normalizedUser = ((responseUser as any)?.user ?? responseUser) as IUserProfile | undefined;
                setUser(normalizedUser);
            });

            getUserFollowing(currentuser?.id).then(response => {
                if (response && response.success) {
                    const isFollowing = response.following.some(followedUser => followedUser.id === userID);
                    setFollow(isFollowing);
                } else {
                    setFollow(false);
                }
            });

            return () => {};
        }, [userID, currentuser?.id]),
    );

    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);
    const [followingCount, setFollowingCount] = useState(0);
    const isOwnProfile = !!currentuser?.id && !!userID && currentuser.id === userID;

    useEffect(() => {
        const fetchData = async () => {
            const result = await getFollowers(userID);

            if (result && result.followers && Array.isArray(result.followers)) {
                setFollowersData(result.followers);
            }
        };

        fetchData();
    }, [userID]);

    useEffect(() => {
        const fetchFollowingData = async () => {
            if (!userID) return;
            const result: any = await getUserFollowing(userID);
            if (result?.following && Array.isArray(result.following)) {
                setFollowingCount(result.following.length);
            } else {
                setFollowingCount(0);
            }
        };

        fetchFollowingData();
    }, [userID]);

    const followersCount = followersData.length;
    const galleryImagesCount = (user as any)?.userGallery?.length ?? (user as any)?.gallery?.length ?? 0;
    const getAge = (dob?: string) => {
        if (!dob) return null;
        const dobPart = dob.includes('T') ? dob.split('T')[0] : dob;
        const parts = dobPart.split('-').map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
        const [year, month, day] = parts;
        const today = new Date();
        let age = today.getFullYear() - year;
        const monthDiff = today.getMonth() + 1 - month;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age -= 1;
        return age > 0 ? age : null;
    };
    const userAgeFromApiRaw = (user as any)?.age;
    const userAgeFromApi =
        typeof userAgeFromApiRaw === 'number'
            ? userAgeFromApiRaw
            : typeof userAgeFromApiRaw === 'string'
              ? Number(userAgeFromApiRaw)
              : NaN;
    const userAge = Number.isFinite(userAgeFromApi) && userAgeFromApi > 0 ? userAgeFromApi : getAge(user?.dateOfBirth);
    const metricItems = [
        {
                 key: 'gallery',
                 iconName: 'images-outline',
                 iconType: 'ionicon',
                 iconColor: '#CFADFF',
                 label: 'Gallery',
                 value: formatNumber(galleryImagesCount),
                 gradientColors: ['rgba(46, 28, 107, 0.9)', 'rgba(101, 62, 199, 0.9)'],
             },   {
            key: 'followers',
            iconName: 'heart',
            iconType: 'ionicon',
            iconColor: '#FF4DA6',
            label: 'Followers',
            value: formatNumber(followersCount),
            gradientColors: ['rgba(102, 23, 72, 0.9)', 'rgba(179, 40, 122, 0.9)'],
            onPress: () => navigation.navigate('ViewUserFollowList', {userID, tabKey: 'first'}),
        },
        {
            key: 'following',
            iconName: 'people-outline',
            iconType: 'ionicon',
            iconColor: '#FFD24D',
            label: 'Following',
            value: formatNumber(followingCount),
            gradientColors: ['rgba(88, 56, 10, 0.9)', 'rgba(167, 105, 15, 0.9)'],
            onPress: () => navigation.navigate('ViewUserFollowList', {userID, tabKey: 'second'}),
        },
        {
            key: 'watch-time',
            iconName: 'time-outline',
            iconType: 'ionicon',
            iconColor: '#6DE5FF',
            label: 'Watch Time',
            value: formatNumber((user as any)?.totalWatchTime ?? 0),
            gradientColors: ['rgba(14, 61, 79, 0.9)', 'rgba(26, 112, 145, 0.9)'],
        },
    ];
    const usernameFontSize = Number((FONTS.Title1 as any)?.fontSize) || 20;
    const badgeConfig = resolveAkcruBadgeConfig(user?.badge);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showCruInviteSent, setShowCruInviteSent] = useState(false);

    const [userOptionModal, setUserOptionModal] = useState(false);

    const handleSendCruInvite = async () => {
        try {
            const senderId = currentuser?.id as string;
            const username = user?.username as string;
            const response = await createACRUInvite({username, senderId});

            if (response) {
                setShowCruInviteSent(true);
                setShowConfirmationModal(false);
                setbtnName('PENDING');
                setbtnDisabled(true);
                setbtnColor(COLORS.DARKGREY);

                setTimeout(() => {
                    setShowCruInviteSent(false);
                }, 4000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        setLoading(true);
        const response = await getBlockedUsers();
        if (response.success) {
            setBlockedUsers(response.blockedUsers || []);
        } else {
        }
        setLoading(false);
    };

    const handleReportUser = () => {
        if (!userID) {
            return;
        }
        navigateToReportUser({userID});
        setUserOptionModal(false);
    };

    const handleFollowPress = async () => {
        if (follow) {
            try {
                const success = await unfollowUser({userId: userID});
                if (success) {
                    setFollow(false);
                    setUserOptionModal(false);
                } else {
                    console.error('Unfollow failed');
                }
            } catch (error) {
                console.error('Error on unfollow:', error);
            }
        } else {
            try {
                const success = await followUser({userId: userID});
                if (success) {
                    setFollow(true);
                    setUserOptionModal(false);
                } else {
                    console.error('Follow failed');
                }
            } catch (error) {
                console.error('Error on follow:', error);
            }
        }
    };

    const [selectedPhotoUri, setSelectedPhotoUri] = useState(route.params?.imageURL || null);
    const cruName =
        (user as any)?.Cru?.name ||
        (user as any)?.user?.Cru?.name ||
        (user as any)?.cru?.name ||
        (user as any)?.user?.cru?.name ||
        (user as any)?.cruName ||
        (user as any)?.cru_name ||
        (user as any)?.CruName ||
        '';
    const selectedPhotoAnimatedOpacity = useRef(new Animated.Value(0)).current;

    const openPhoto = (photoItem: any) => {
        setSelectedPhotoUri(photoItem.imageURL);
        Animated.timing(selectedPhotoAnimatedOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closePhoto = () => {
        Animated.timing(selectedPhotoAnimatedOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedPhotoUri(null));
    };

    const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

    const toggleAvatarModal = () => {
        setAvatarModalVisible(!isAvatarModalVisible);
    };

    const [currentlyWatching, setCurrentlyWatching] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchCurrentlyWatching = async () => {
                try {
                    const userId = user?.id;
                    if (userId) {
                        const currentWatchingData = await getUserCurrentWatching(userId);
                        setCurrentlyWatching(currentWatchingData);
                    }
                } catch (error) {
                    console.error('Error fetching currently watching:', error);
                }
            };

            fetchCurrentlyWatching();
        }, [user?.id]),
    );

    const isUserBlocked = blockedUsers.some(blockedUser => blockedUser.id === userID);

    const [blockUserModal, setBlockUserModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [blockUserMessage, setBlockUserMessage] = useState('');
    const [iconName, setIconName] = useState('');

    const closeModal = () => {
        setBlockUserModal(false);
    };

    const handleBlockUserPress = async () => {
        if (isUserBlocked) {
            try {
                const {success, message} = await unblockUser(userID);
                if (success) {
                    setModalType('success');
                    setBlockUserMessage('User successfully unblocked');
                    setBlockUserModal(true);
                    setIconName('account-check');

                    fetchBlockedUsers();
                    setUserOptionModal(false);
                } else {
                    setModalType('failed');
                    setBlockUserMessage('Failed to unblock user');
                    setIconName('alert-circle');
                    setBlockUserModal(true);
                }
            } catch (error) {
                console.error('Error on unblock:', error);

                setModalType('error');
                setBlockUserMessage('An error occurred while trying to unblock the user.');
                setBlockUserModal(true);
                setIconName('alert-circle');
            }
        } else {
            try {
                const {success, message} = await blockUser(userID);
                if (success) {
                    setUserOptionModal(false);
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'ClientTabNavigator',
                                    params: {
                                        screen: 'CrummunityStack',
                                        params: {
                                            screen: 'CrummunityScreen',
                                        },
                                    },
                                },
                            ],
                        }),
                    );
                } else {
                    setModalType('failed');
                    setBlockUserMessage('Failed to block user');
                    setIconName('alert-circle');
                    setBlockUserModal(true);
                }
            } catch (error) {
                console.error('Error on block:', error);

                setModalType('error');
                setBlockUserMessage('An error occurred while trying to block the user.');
                setBlockUserModal(true);
                setIconName('alert-circle');
            }
        }
    };

    const handleBlockUserFromActivity = React.useCallback(
        async (targetUserId?: string) => {
            if (!targetUserId) {
                return;
            }
            try {
                const {success} = await blockUser(targetUserId);
                if (success) {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'ClientTabNavigator',
                                    params: {
                                        screen: 'CrummunityStack',
                                        params: {
                                            screen: 'CrummunityScreen',
                                        },
                                    },
                                },
                            ],
                        }),
                    );
                    return;
                }
                setModalType('failed');
                setBlockUserMessage('Failed to block user');
                setIconName('alert-circle');
                setBlockUserModal(true);
            } catch (error) {
                console.error('Error on block from activity:', error);
                setModalType('error');
                setBlockUserMessage('An error occurred while trying to block the user.');
                setBlockUserModal(true);
                setIconName('alert-circle');
            }
        },
        [navigation],
    );

    const {tabKey = 'first'} = route.params || {};
    const [index, setIndex] = React.useState(tabKey === 'first' ? 0 : tabKey === 'second' ? 1 : 2);

    const [activity, setActivity] = useState<(IPost | IPoll)[]>([]);
    const [actLoading, setActLoading] = useState(true);
    const [actPage, setActPage] = useState(1);
    const [actHasMore, setActHasMore] = useState(true);
    const [actLoadingMore, setActLoadingMore] = useState(false);
    const [actRefreshing, setActRefreshing] = useState(false);
    const [pollCommentDrafts, setPollCommentDrafts] = useState<Record<string, string>>({});
    const [pollCommentSubmitting, setPollCommentSubmitting] = useState<Record<string, boolean>>({});
    const sortActivityPinnedFirst = React.useCallback((items: any[]) => {
        return [...items].sort((a: any, b: any) => {
            const aPinned = !!a?.isPinned;
            const bPinned = !!b?.isPinned;
            if (aPinned !== bPinned) {
                return aPinned ? -1 : 1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, []);

    const loadMoreActivity = async () => {
        if (!actHasMore || actLoadingMore) return;
        setActLoadingMore(true);
        await fetchActivity(actPage + 1);
        setActLoadingMore(false);
    };

    const refreshActivity = async () => {
        setActRefreshing(true);
        await fetchActivity(1);
        setActRefreshing(false);
    };

    const refreshActivityPost = React.useCallback(async (postId: number) => {
        try {
            const fetchedPost = await getPost(postId);
            setActivity(prev =>
                prev.map(item => {
                    if ('type' in item && (item as IPoll & {type?: string}).type === 'poll') {
                        return item;
                    }
                    if (+item.id !== postId) {
                        return item;
                    }
                    const existing = item as IPost;
                    return {
                        ...fetchedPost,
                        author: {
                            ...fetchedPost.author,
                            isFollowed: existing.author?.isFollowed,
                            isBlocked: existing.author?.isBlocked,
                        },
                        isLikedByCurrentUser:
                            fetchedPost.isLikedByCurrentUser ?? existing.isLikedByCurrentUser,
                    };
                }),
            );
        } catch (refreshError) {
            console.error('Failed to refresh profile activity post:', refreshError);
        }
    }, []);

    const refreshActivityPoll = React.useCallback(async (pollId: string) => {
        try {
            const pollDetails = await getPollById(pollId);
            setActivity(prev =>
                prev.map(item => {
                    if (!('type' in item) || (item as IPoll & {type?: string}).type !== 'poll' || item.id !== pollId) {
                        return item;
                    }
                    const existing = item as IPoll & {type?: string};
                    return {
                        ...existing,
                        ...pollDetails,
                        type: 'poll',
                        user: {
                            ...pollDetails.user,
                            isFollowed: existing.user?.isFollowed,
                            isBlocked: existing.user?.isBlocked,
                        },
                        isLikedByCurrentUser:
                            pollDetails.isLikedByCurrentUser ?? existing.isLikedByCurrentUser,
                    };
                }),
            );
        } catch (refreshError) {
            console.error('Failed to refresh profile activity poll:', refreshError);
        }
    }, []);

    useEffect(() => {
        const postSubscription = subscribeFeedPostRefresh(refreshActivityPost);
        const pollSubscription = subscribeFeedPollRefresh(refreshActivityPoll);
        return () => {
            postSubscription.remove();
            pollSubscription.remove();
        };
    }, [refreshActivityPost, refreshActivityPoll]);

    const openPost = (postId: number) => {
        const p = activity.find((it: any) => +it.id === postId);
        if (!p) return;
        navigateToPostScreen({post: p as IPost, isLikedByCurrentUser: (p as any).isLikedByCurrentUser});
    };

    const openPoll = (pollId: string) => {
        const p = activity.find(it => (it as any).id === pollId);
        if (!p) return;
        navigateToPollScreen({
            poll: p as IPoll,
            isLikedByCurrentUser: (p as IPoll).isLikedByCurrentUser,
        });
    };

    const onLikePostToggle = async (postId: number, isLiked: boolean) => {
        try {
            // optimistic
            setActivity(prev =>
                prev.map((it: any) =>
                    +it.id === postId
                        ? {
                              ...it,
                              isLikedByCurrentUser: !isLiked,
                              _count: {...it._count, likes: (it._count?.likes ?? 0) + (isLiked ? -1 : 1)},
                          }
                        : it,
                ),
            );
            await (isLiked ? unlikePost(postId) : likePost(postId));
        } catch {
            // revert
            setActivity(prev =>
                prev.map((it: any) =>
                    +it.id === postId
                        ? {
                              ...it,
                              isLikedByCurrentUser: isLiked,
                              _count: {...it._count, likes: (it._count?.likes ?? 0) + (isLiked ? 1 : -1)},
                          }
                        : it,
                ),
            );
        }
    };

    const onLikePollToggle = async (pollId: string, isLiked: boolean) => {
        try {
            // optimistic
            setActivity(prev =>
                prev.map((it: any) =>
                    it.id === pollId
                        ? {...it, isLikedByCurrentUser: !isLiked, likeCount: (it.likeCount ?? 0) + (isLiked ? -1 : 1)}
                        : it,
                ),
            );
            await (isLiked ? unlikePoll(pollId) : likePoll(pollId));
        } catch {
            // revert
            setActivity(prev =>
                prev.map((it: any) =>
                    it.id === pollId
                        ? {...it, isLikedByCurrentUser: isLiked, likeCount: (it.likeCount ?? 0) + (isLiked ? 1 : -1)}
                        : it,
                ),
            );
        }
    };

    const onDeletePost = async (postId: number) => {
        try {
            await deletePost(postId);
            setActivity(prev => prev.filter((it: any) => +it.id !== postId));
        } catch (e) {
            console.warn('deletePost failed', e);
        }
    };

    const onDeletePoll = async (pollId: string) => {
        try {
            await deletePoll(pollId);
            setActivity(prev => prev.filter((it: any) => it.id !== pollId));
        } catch (e) {
            console.warn('deletePoll failed', e);
        }
    };

    const onTogglePinPost = async (postId: number, isPinned: boolean) => {
        try {
            await pinPost(postId, isPinned);
            setActivity(prev => {
                const updated = prev.map((it: any) =>
                    +it.id === postId && it.type !== 'poll' ? {...it, isPinned} : it,
                );
                return sortActivityPinnedFirst(updated);
            });
        } catch (e) {
            console.warn('pinPost failed', e);
        }
    };

    const onTogglePinPoll = async (pollId: string, isPinned: boolean) => {
        try {
            await pinPoll(pollId, isPinned);
            setActivity(prev => {
                const updated = prev.map((it: any) => (it.id === pollId ? {...it, isPinned} : it));
                return sortActivityPinnedFirst(updated);
            });
        } catch (e) {
            console.warn('pinPoll failed', e);
        }
    };

    const onVote = async (pollId: string, choiceId: string) => {
        try {
            await voteOnPoll(pollId, choiceId);
            fetchActivity(1);
        } catch (e) {
            console.warn('voteOnPoll failed', e);
        }
    };

    const handlePollCommentInputChange = (pollId: string, value: string) => {
        setPollCommentDrafts(prev => ({
            ...prev,
            [pollId]: value,
        }));
    };

    const handleInlinePollCommentSend = async (pollId: string) => {
        const commentText = (pollCommentDrafts[pollId] ?? '').trim();
        if (!commentText || pollCommentSubmitting[pollId]) {
            return;
        }

        setPollCommentSubmitting(prev => ({
            ...prev,
            [pollId]: true,
        }));

        try {
            await commentOnPoll(pollId, 'POLL', [commentText]);
            setActivity(prev =>
                prev.map(item =>
                    item.id === pollId && 'type' in item && (item as IPoll & {type?: string}).type === 'poll'
                        ? {
                              ...item,
                              _count: {
                                  ...item._count,
                                  comments: (item._count?.comments ?? 0) + 1,
                              },
                          }
                        : item,
                ),
            );
            setPollCommentDrafts(prev => ({
                ...prev,
                [pollId]: '',
            }));
        } catch (e) {
            console.warn('commentOnPoll failed', e);
        } finally {
            setPollCommentSubmitting(prev => ({
                ...prev,
                [pollId]: false,
            }));
        }
    };

    const keyExtractor = React.useCallback(
        (item: any) => (item.type === 'poll' ? `poll:${item.id}` : `post:${item.id}`),
        [],
    );

    // Keep loadMore/refresh handlers stable
    const handleEndReached = React.useCallback(() => {
        if (!actHasMore || actLoadingMore) return;
        loadMoreActivity();
    }, [actHasMore, actLoadingMore, loadMoreActivity]);

    const FirstRoute = () => (
        <View style={{flex: 1}}>
            {user?.private ? (
                <View style={{marginHorizontal: 15, marginTop: SIZES.ScreenHeight / 7}}>
                    <Text style={{...FONTS.Title3, textAlign: 'center', marginBottom: 20}}>This account is private</Text>
                    <Icon name="lock" type="material-community" color={COLORS.LIGHTGREY} size={65} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[styles.refCardScroll, styles.refCardScrollWithPinnedFooter]}
                    showsVerticalScrollIndicator={false}>
                    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.refCard}>
                        <View style={styles.refTopRow}>
                            {!isOwnProfile && (
                                <TouchableOpacity onPress={handleFollowPress} style={styles.refFollowPill}>
                                    <Text style={styles.refFollowText}>{follow ? 'Following' : 'Follow'}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.refAvatarWrap}>
                            <View style={styles.refAvatarBadgeWrap}>
                                <Pressable onPress={toggleAvatarModal}>
                                    <HexAvatar
                                        source={{uri: user?.profilePicture}}
                                        size={112}
                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                        rotateFrameDegrees={90}
                                    />
                                </Pressable>
                                {user && isPresenceVisible ? (
                                    <View style={styles.activeStatusBadge}>
                                        <View
                                            style={[
                                                styles.activeStatusDot,
                                                {backgroundColor: isPresenceActive ? '#22C55E' : '#EF4444'},
                                            ]}
                                        />
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginBottom: badgeConfig ? 0 : 10,
                            }}>
                            <Icon name="heart" type="ionicon" color="#FF4DA6" size={usernameFontSize} style={{marginRight: 8}} />
                            <Text
                                style={[
                                    styles.refName,
                                    {marginBottom: 0, fontSize: usernameFontSize, flexShrink: 1, minWidth: 0},
                                ]}>
                                {user?.username || user?.firstName}
                                {user?.showAge && userAge ? `, ${userAge}` : ''}
                            </Text>
                            <ProfileUserBadges user={user} variant="inline" style={{marginLeft: 6, flexShrink: 0}} />
                        </View>

                        <View style={styles.refMetrics}>
                            {metricItems.map(item => (
                                <ProfileMetricChip
                                    key={item.key}
                                    iconName={item.iconName}
                                    iconType={item.iconType}
                                    iconColor={item.iconColor}
                                    emojiIcon={item.emojiIcon}
                                    label={item.label}
                                    value={item.value}
                                    gradientColors={item.gradientColors}
                                    onPress={item.onPress}
                                    style={{
                                        column: styles.refMetricColumn,
                                        label: styles.refMetricLabel,
                                        count: styles.refMetricCount,
                                    }}
                                />
                            ))}
                        </View>

                        {/* <View style={styles.refActionRow}>
                            <View style={styles.refTag}>
                                <Icon name="flame" type="ionicon" color="#FF8B2D" size={12} />
                                <Text style={styles.refTagText}>Hot Invite</Text>
                            </View>
                            <View style={styles.refTag}>
                                <Icon name="tv-outline" type="ionicon" color="#CFADFF" size={12} />
                                <Text style={styles.refTagText}>Active Watcher</Text>
                            </View>
                        </View> */}

                        {!isOwnProfile && (
                            <View style={styles.refMitButton}>
                                <AkcruButtons.SmallButton
                                    variant="auth"
                                    btnname="Send MIT"
                                    color={COLORS.AKCRUBLUE}
                                    onPress={() => navigation.navigate('SendMITViewUser', {userID, receiverUser: user})}
                                    authButtonWidth={SIZES.ScreenWidth - 84}
                                    authLeftImage={require('../../../../assets/images/mit_ticket_image.png')}
                                    authImagePosition="left"
                                    authImageSize={80}
                                />
                            </View>
                        )}

                        <View style={styles.refSection}>
                            <ArchetypeHorizontalDivider />
                            <Text style={styles.refSectionValue}>{archetype ? archetype.name : 'No Archetype Selected'}</Text>
                            {archetype?.image ? (
                                <TouchableOpacity onPress={() => openPhoto({imageURL: archetype.image})} activeOpacity={0.85}>
                                    <Image source={{uri: archetype.image}} style={styles.refArchetypeImage} />
                                </TouchableOpacity>
                            ) : null}
                            {archetypeTags.length > 0 && (
                                <View style={styles.refArchetypeTagRow}>
                                    {archetypeTags.map((tag: string, idx: number) => (
                                        <Text key={`arch-tag-${idx.toString()}`} style={styles.refArchetypeTag}>
                                            {tag}
                                        </Text>
                                    ))}
                                </View>
                            )}
                            {!!archetype?.description && (
                                <Text style={styles.refArchetypeDescription}>{archetype.description}</Text>
                            )}
                            <Text style={styles.refCruNameText}>
                                <Text style={styles.refCruNameLabel}>CRU Name: </Text>
                                {cruName || 'Not Available'}
                            </Text>
                        </View>

                        {user?.userGallery && user.userGallery.length > 0 && (
                            <View style={styles.refGalleryWrap}>
                                <ArchetypeHorizontalDivider
                                    title="Photo Gallery"
                                    titleStyle={styles.refSectionLabel}
                                    containerStyle={{marginBottom: 8}}
                                />
                                <View style={styles.refGalleryGridThreeCol}>
                                    {user.userGallery.map((item, idx) => (
                                        <TouchableOpacity
                                            key={`gallery-${idx.toString()}`}
                                            onPress={() => openPhoto(item)}
                                            activeOpacity={0.8}
                                            style={styles.refGalleryGridThreeColItem}>
                                            <Image source={{uri: item.imageURL}} style={styles.refGalleryGridThreeColImage} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                    </LinearGradient>
                </ScrollView>
            )}
            {!isOwnProfile && (
                <View style={styles.refPinnedFooterContainer}>
                    <View style={styles.refFooterActions}>
                        <TouchableOpacity style={styles.refFooterBtn} onPress={handleBlockUserPress}>
                            <Icon name="ban" type="font-awesome-5" color="#FF7698" size={12} />
                            <Text style={styles.refFooterBtnText}>{isUserBlocked ? 'Unblock User' : 'Block User'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.refFooterBtn} onPress={handleReportUser}>
                            <Icon name="warning" type="antdesign" color="#FFD24D" size={12} />
                            <Text style={styles.refFooterBtnText}>Report User</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    const renderActivityItem = React.useCallback(
        ({item}: {item: any}) =>
            item.type === 'poll' ? (
                <Pressable onPress={() => openPoll(item.id)} style={{marginBottom: 10}}>
                    <PollCard
                        poll={item}
                        onVote={onVote}
                        onDeletePoll={onDeletePoll}
                        onTogglePinPoll={onTogglePinPoll}
                        showPinnedBadge={true}
                        currentUserID={currentuser?.id || ''}
                        akcruBadge={item.user?.badge}
                        akcruBadgeColor={selectAvatarBorderColor(item.user?.badge ?? 'AKCRUIT')}
                        profilePicture={item.user?.profilePicture}
                        onLikeOrUnlike={() => onLikePollToggle(item.id, !!item.isLikedByCurrentUser)}
                        openProfile={() => navigation2.navigate('ViewUserScreen', {userID: item.user?.id})}
                        isAdmin={currentuser?.isAdmin}
                        onCommentIconPress={() => openPoll(item.id)}
                        commentInputValue={pollCommentDrafts[item.id] ?? ''}
                        onCommentInputChange={value => handlePollCommentInputChange(item.id, value)}
                        onCommentSend={() => handleInlinePollCommentSend(item.id)}
                        isCommentSending={pollCommentSubmitting[item.id] ?? false}
                        onBlockUser={() => handleBlockUserFromActivity(item.user?.id)}
                    />
                </Pressable>
            ) : (
                <View style={{marginBottom: 10}}>
                    <SkinnyPostCard
                        post={item}
                        loading={false}
                        openProfile={() => navigation2.navigate('ViewUserScreen', {userID: item.author?.id})}
                        reportUser={() => {
                            if (!item.author?.id) {
                                return;
                            }
                            navigateToReportUser({
                                authorId: item.author.id,
                                authorUsername: item.author.username,
                                authorFirstName: item.author.firstName,
                                authorProfilePicture: item.author.profilePicture,
                                authorBadge: item.author.badge,
                            });
                        }}
                        onDeletePost={() => onDeletePost(+item.id)}
                        onTogglePinPost={onTogglePinPost}
                        showPinnedBadge={true}
                        currentUserID={currentuser?.id || ''}
                        akcruBadge={item.author?.badge}
                        isPostLiked={item.isLikedByCurrentUser}
                        onLikeOrUnlike={() => onLikePostToggle(+item.id, !!item.isLikedByCurrentUser)}
                        CommentOnPostButton={() => navigateToNewComment(item.id)}
                        isFollowing={item.author?.isFollowed}
                        akcruBadgeColor={selectAvatarBorderColor(item.author?.badge ?? 'AKCRUIT')}
                        onBlockUser={() => handleBlockUserFromActivity(item.author?.id)}
                        isOwner={item.author?.ownerStatus}
                        isPromo={item.author?.promoUser}
                        isAdmin={currentuser?.isAdmin}
                        visionaryStatus={currentuser?.visionaryStatus}
                        onOpenPost={() => openPost(+item.id)}
                    />
                </View>
            ),
        [
            currentuser?.id,
            currentuser?.isAdmin,
            currentuser?.visionaryStatus,
            navigation2,
            openPoll,
            openPost,
            onVote,
            onDeletePoll,
            onTogglePinPoll,
            onLikePollToggle,
            onDeletePost,
            onTogglePinPost,
            onLikePostToggle,
            pollCommentDrafts,
            pollCommentSubmitting,
            handlePollCommentInputChange,
            handleInlinePollCommentSend,
            handleBlockUserFromActivity,
        ],
    );

    // Render the two scenes without SceneMap
    const renderScene = React.useCallback(
        ({route}: {route: {key: string}}) => {
            if (route.key === 'first') {
                return <FirstRoute />; // your FirstRoute as-is
            }
            // second tab
            return (
                <View style={{flex: 1}}>
                    {actLoading && activity.length === 0 ? (
                        <View style={{marginTop: '20%'}}>
                            <ActivityIndicator size="large" color={COLORS.PINK} />
                        </View>
                    ) : (
                        <FlatList
                            data={activity}
                            keyExtractor={keyExtractor}
                            style={{width: SIZES.ScreenWidth * 0.93, alignSelf: 'center'}}
                            contentContainerStyle={{paddingTop: 10}}
                            onEndReachedThreshold={0.4}
                            onEndReached={handleEndReached}
                            refreshing={actRefreshing}
                            onRefresh={refreshActivity}
                            renderItem={renderActivityItem}
                            ListEmptyComponent={
                                <View style={{paddingTop: 24}}>
                                    <Text style={{...FONTS.Title2, color: COLORS.DARKGREY, textAlign: 'center'}}>
                                        No activity yet
                                    </Text>
                                </View>
                            }
                            ListFooterComponent={
                                actHasMore && actLoadingMore ? <ActivityIndicator color={COLORS.PINK} /> : null
                            }
                            // optional: these help with large lists
                            windowSize={7}
                            initialNumToRender={10}
                            removeClippedSubviews
                        />
                    )}
                </View>
            );
        },
        [
            FirstRoute,
            actLoading,
            activity,
            keyExtractor,
            handleEndReached,
            actRefreshing,
            refreshActivity,
            renderActivityItem,
            actHasMore,
            actLoadingMore,
        ],
    );

    const renderTabBar = (
        props: JSX.IntrinsicAttributes &
            SceneRendererProps & {
                navigationState: NavigationState<Route>;
                scrollEnabled?: boolean | undefined;
                bounces?: boolean | undefined;
                activeColor?: string | undefined;
                inactiveColor?: string | undefined;
                pressColor?: string | undefined;
                pressOpacity?: number | undefined;
                getLabelText?: ((scene: Scene<Route>) => string | undefined) | undefined;
                getAccessible?: ((scene: Scene<Route>) => boolean | undefined) | undefined;
                getAccessibilityLabel?: ((scene: Scene<Route>) => string | undefined) | undefined;
                getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined;
                renderLabel?:
                    | ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode)
                    | undefined;
                renderIcon?: ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode) | undefined;
                renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined;
                renderIndicator?: ((props: TabBarIndicatorProps<Route>) => React.ReactNode) | undefined;
                renderTabBarItem?:
                    | ((
                          props: TabBarItemProps<Route> & {key: string},
                      ) => React.ReactElement<any, string | React.JSXElementConstructor<any>>)
                    | undefined;
                onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined;
                onTabLongPress?: ((scene: Scene<Route>) => void) | undefined;
                tabStyle?: StyleProp<ViewStyle>;
                indicatorStyle?: StyleProp<ViewStyle>;
                indicatorContainerStyle?: StyleProp<ViewStyle>;
                labelStyle?: StyleProp<TextStyle>;
                contentContainerStyle?: StyleProp<ViewStyle>;
                style?: StyleProp<ViewStyle>;
                gap?: number | undefined;
                testID?: string | undefined;
                android_ripple?: PressableAndroidRippleConfig | undefined;
            },
    ) => (
        <TabBar
            {...props}
            indicatorStyle={{backgroundColor: COLORS.PURPLE}}
            scrollEnabled={false}
            tabStyle={{width: SIZES.ScreenWidth / 2}}
            labelStyle={{...FONTS.Title2, color: COLORS.LIGHTGREY}}
            style={{
                backgroundColor: '#000000',
                justifyContent: 'space-between',
            }}
            contentContainerStyle={{
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
            }}
            activeColor={COLORS.PURPLE}
        />
    );

    const [routes] = React.useState([
        {key: 'first', title: 'Profile'},
        {key: 'second', title: 'Activity'},
    ]);

    // fetch
    const fetchActivity = async (pageNumber: number) => {
        if (!userID) return;
        setActLoading(pageNumber === 1);
        try {
            const [posts, polls] = await Promise.all([
                getPostsByUser(userID, pageNumber),
                getPollsByUser(userID, pageNumber),
            ]);

            const combined = sortActivityPinnedFirst([...posts, ...polls]);

            if (pageNumber === 1) {
                setActivity(combined);
            } else {
                setActivity(prev => sortActivityPinnedFirst([...prev, ...combined]));
            }

            setActHasMore(posts.length === 10 || polls.length === 10);
            setActPage(pageNumber);
        } finally {
            setActLoading(false);
        }
    };

    // load when Tab 2 becomes active
    useEffect(() => {
        if (index === 1) fetchActivity(1);
    }, [index, userID, sortActivityPinnedFirst]);

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1}}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>
                <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000000'}} />
                <View
                    style={{
                        marginTop: 2,
                        marginHorizontal: 14,
                        marginBottom: 4,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <BackButton navigation={navigation} />
                    {/* <TouchableOpacity onPress={() => setUserOptionModal(true)}>
                        <Icon name="ellipsis-vertical" type="ionicon" size={isTablet() ? 32 : 20} color={COLORS.LIGHTGREY} />
                    </TouchableOpacity> */}
                </View>
                <TabView
                    style={{flex: 1}}
                    sceneContainerStyle={{backgroundColor: '#000000'}}
                    initialLayout={{width: layout.width}}
                    navigationState={{index, routes}}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    swipeEnabled={true}
                    renderTabBar={renderTabBar}
                />
                <Modal visible={isAvatarModalVisible} animationType="fade" transparent={true}>
                    <Pressable
                        onPress={toggleAvatarModal}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        }}>
                        <TouchableWithoutFeedback>
                            <Image
                                source={user?.profilePicture ? {uri: user?.profilePicture} : imageindex.Akcruplaceholder}
                                style={{width: '95%', height: '50%'}}
                                resizeMode="contain"
                            />
                        </TouchableWithoutFeedback>
                    </Pressable>
                </Modal>
                <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                    <ComfirmationModal
                        confirmationText={`Are you sure you want to send "${user?.username}" a Cru invite?`}
                        onPressYes={handleSendCruInvite}
                        onPressNo={() => setShowConfirmationModal(false)}
                    />
                </Modal>
                <Modal animationType="fade" transparent={true} visible={showCruInviteSent}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                padding: 20,
                                borderRadius: 10,
                                alignItems: 'center',
                                marginHorizontal: 15,
                            }}>
                            <Text style={{...FONTS.Title3, marginBottom: 10, textAlign: 'center'}}>
                                {`You have sent "${user?.username}" a Cru invite! You will be notified if they ACCEPT or DECLINE the invite`}
                            </Text>
                        </View>
                    </View>
                </Modal>
                {/* <Modal visible={userOptionModal} transparent={true} animationType="fade">
                    <ViewUserOptionModal
                        username={user?.username}
                        closeModal={() => setUserOptionModal(false)}
                        blockUser={() => {
                            handleBlockUserPress();
                            setUserOptionModal(false);
                        }}
                        reportUser={handleReportUser}
                        followUser={() => {
                            handleFollowPress();
                            setUserOptionModal(false);
                        }}
                        followToggleIcon={follow ? 'person-subtract' : 'person-add'}
                        followIconType={'ionicon'}
                        followToggleText={follow ? 'Unfollow' : 'Follow'}
                        cruInviteUser={() => setShowConfirmationModal(true)}
                        blockToggleText={isUserBlocked ? 'Unblock' : 'Block'}
                    />
                </Modal> */}
                {selectedPhotoUri && (
                    <TouchableOpacity style={styles.selectedPhotoContainer} activeOpacity={1}>
                        <GalleryPic image={selectedPhotoUri} />
                        <View style={{marginTop: '10%'}}>
                            <TouchableOpacity onPress={closePhoto}>
                                <Text style={{...FONTS.Title2}}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={blockUserModal}
                    onRequestClose={() => {
                        setBlockUserModal(!blockUserModal);
                    }}>
                    <BlockUserResultModal
                        closeModal={closeModal}
                        type={modalType}
                        resultMessage={blockUserMessage}
                        iconName={iconName}
                    />
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
}
