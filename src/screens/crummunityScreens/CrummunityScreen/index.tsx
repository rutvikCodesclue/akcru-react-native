import {
    Text,
    View,
    TouchableWithoutFeedback,
    Modal,
    FlatList,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';

import React, {useEffect, useRef, useState} from 'react';
import Header from '../../../components/header';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import CommonPostCard from '../../../components/CommonPostCard';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {commentOnPost, deletePost, getPost, getPosts, likePost, unlikePost} from '../../../lib/api/post.lib';
import {
    commentOnPoll,
    deletePoll,
    getPollById,
    getPolls,
    likePoll,
    unlikePoll,
    voteOnPoll,
} from '../../../lib/api/poll.lib';
import {IPost, IUserProfile, IPoll} from '../../../../types';
import {StackNavigationProp} from '@react-navigation/stack';
import {blockUser, getBlockedUsers, getUserFollowing} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {toggleFollow} from '../../../lib/api/user.lib';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {selectAvatarBorderColor} from '../../../util/util';
import PostButton from '../../../components/AkcruPostButton';
import PollButton from '../../../components/AkcruPollButton';
import PollCard from '../../../components/SkinnyPollCard';
import {newVisitCrum} from '../../../lib/api/post.lib';
import {newUserUpdate} from '../../../lib/api/post.lib';
import LoadingComponent from '../../../components/Loading';
import {isTablet} from '../../../../assets/constants/theme';
import {
    navigateToNewPoll,
    navigateToNewPost,
    navigateToPollScreen,
    navigateToPostScreen,
    navigateToReportUser,
} from '../../../util/RootNavigation';
import {
    subscribeFeedPollRefresh,
    subscribeFeedPostRefresh,
} from '../../../util/feedRefreshEvents';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CLIENT_TAB_NAVIGATOR_ID} from '../../../navigation/clientTabNavigatorId';
type CrummunityScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'ViewUserScreen'>;

type CrummunityScreenRouteProp = RouteProp<CrummunityStackParams, 'ViewUserScreen'>;

type Props = {
    navigation: [
        route: CrummunityScreenNavigationProp,
        // , CrummunitySearchNavigationProp
    ];
    route: [
        CrummunityScreenRouteProp,
        // , CrummunitySearchRouteProp
    ];
};

type FeedPoll = IPoll & {type: 'poll'};
type FeedItem = IPost | FeedPoll;

const isFeedPoll = (item: FeedItem): item is FeedPoll => 'type' in item && item.type === 'poll';

const CrummunityScreen = ({navigation, route}: Props) => {
    const {user, hydrateUser} = useAuthStore();
    const currentUserID = user?.id;
    const pollCreator = user?.pollCreator;
    const author: IPost | null = route.params?.author ?? null;

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const isCrummunityScreenFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();

    const [likedPosts, setLikedPosts] = useState(new Set());

    const [posts, setPosts] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPostIds, setLoadingPostIds] = useState<{[key: number]: boolean}>({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState('');
    const [debounce, setDebounce] = useState(false);

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const postLikeInFlightRef = useRef<Record<number, boolean>>({});

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [commentSubmitting, setCommentSubmitting] = useState<Record<number, boolean>>({});
    const [pollCommentDrafts, setPollCommentDrafts] = useState<Record<string, string>>({});
    const [pollCommentSubmitting, setPollCommentSubmitting] = useState<Record<string, boolean>>({});

    const [refreshing, setRefreshing] = useState(false);
    const [skipped, setSkipped] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setRefreshing(true);
            fetchPostsAndPolls(1, 'true').finally(() => {
                setRefreshing(false);
            });
        });

        return unsubscribe;
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            return () => {
                hydrateUser();
            };
        }, []),
    );

    const refreshFeedPost = React.useCallback(async (postId: number) => {
        try {
            const fetchedPost = await getPost(postId);
            setPosts(prev =>
                prev.map(item => {
                    if ('type' in item && item.type === 'poll') {
                        return item;
                    }
                    if (+item.id !== postId) {
                        return item;
                    }
                    const existing = item as IPost;
                    if (!fetchedPost?.id || !fetchedPost.author?.id) {
                        return item;
                    }
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
            console.error('Failed to refresh feed post:', refreshError);
        }
    }, []);

    const refreshFeedPoll = React.useCallback(async (pollId: string) => {
        try {
            const pollDetails = await getPollById(pollId);
            setPosts(prev =>
                prev.map(item => {
                    if (!('type' in item) || item.type !== 'poll' || item.id !== pollId) {
                        return item;
                    }
                    const existing = item as FeedPoll;
                    if (!pollDetails?.id || !pollDetails.user?.id) {
                        return item;
                    }
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
            console.error('Failed to refresh feed poll:', refreshError);
        }
    }, []);

    useEffect(() => {
        const postSubscription = subscribeFeedPostRefresh(refreshFeedPost);
        const pollSubscription = subscribeFeedPollRefresh(refreshFeedPoll);
        return () => {
            postSubscription.remove();
            pollSubscription.remove();
        };
    }, [refreshFeedPost, refreshFeedPoll]);

    const fetchPostsAndPolls = async (pageNumber: number, skipCache: string) => {
        setLoading(true);
        try {
            const [fetchedPosts, fetchedPolls] = await Promise.all([
                getPosts(pageNumber, skipCache),
                getPolls(pageNumber),
            ]);

            let followingIds = new Set();
            let blockedUserIds = new Set();

            if (currentUserID) {
                const followingResponse = await getUserFollowing(currentUserID);
                const followingList = Array.isArray(followingResponse?.following)
                    ? followingResponse.following
                    : [];
                followingIds = new Set(
                    followingList.filter((profile): profile is IUserProfile => Boolean(profile?.id)).map(profile => profile.id),
                );

                const blockedResponse = await getBlockedUsers();
                const blockedList = Array.isArray(blockedResponse?.blockedUsers)
                    ? blockedResponse.blockedUsers
                    : [];
                setBlockedUsers(blockedList);
                blockedUserIds = new Set(
                    blockedList.filter((profile): profile is IUserProfile => Boolean(profile?.id)).map(profile => profile.id),
                );
            }

            const updatedPosts: IPost[] = fetchedPosts
                .filter((post): post is IPost => Boolean(post?.id && post.author?.id))
                .map(post => ({
                    ...post,
                    author: {
                        ...post.author,
                        isFollowed: followingIds.has(post.author.id),
                        isBlocked: blockedUserIds.has(post.author.id),
                    },
                    isLikedByCurrentUser: post.isLikedByCurrentUser ?? false,
                }));

            const pollsWithDetails = (
                await Promise.all(
                    fetchedPolls
                        .filter((poll): poll is IPoll => Boolean(poll?.id && poll.user?.id))
                        .map(async poll => {
                            try {
                                const pollDetails = await getPollById(poll.id);
                                if (!pollDetails?.id || !pollDetails.user?.id) {
                                    return null;
                                }
                                return {
                                    ...poll,
                                    ...pollDetails,
                                    user: {
                                        ...pollDetails.user,
                                        isFollowed: followingIds.has(pollDetails.user.id),
                                        isBlocked: blockedUserIds.has(pollDetails.user.id),
                                    },
                                    type: 'poll' as const,
                                };
                            } catch {
                                return null;
                            }
                        }),
                )
            ).filter((poll): poll is FeedPoll => poll !== null);

            const combinedItems: FeedItem[] = [...updatedPosts, ...pollsWithDetails];

            if (pageNumber === 1) {
                setPosts(combinedItems);
            } else {
                setPosts(prevPosts => [...prevPosts, ...combinedItems]);
            }

            setHasMore(fetchedPosts.length === 10 || fetchedPolls.length === 10);
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to fetch posts or follow/block status:', error);
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
            setLoadingPosts(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPostsAndPolls(1, 'true');
        setRefreshing(false);
    };

    useEffect(() => {
        const parentTabs = navigation.getParent(CLIENT_TAB_NAVIGATOR_ID);
        if (!parentTabs) {
            return;
        }

        const unsubscribeTabPress = parentTabs.addListener('tabPress', () => {
            if (!isCrummunityScreenFocused) {
                return;
            }
            handleRefresh();
        });

        return unsubscribeTabPress;
    }, [navigation, isCrummunityScreenFocused, handleRefresh]);

    const loadMorePosts = async () => {
        if (!hasMore || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        await fetchPostsAndPolls(page + 1, 'false');
        setIsLoadingMore(false);
    };

    const handlePostPress = (postId: number) => {
        const selectedPost = posts.find(post => +post.id === postId);

        if (selectedPost) {
            navigateToPostScreen({
                post: selectedPost as IPost,
                isLikedByCurrentUser: selectedPost.isLikedByCurrentUser,
            });
        } else {
            console.error('Error: Post not found');
        }
    };

    const handlePollPress = (pollId: string) => {
        const selectedPoll = posts.find(poll => poll.id === pollId);

        if (selectedPoll) {
            navigateToPollScreen({
                poll: selectedPoll as IPoll,
                isLikedByCurrentUser: selectedPoll.isLikedByCurrentUser,
            });
        } else {
            console.error('Error: Poll not found');
        }
    };

    const onLikeOrUnlike = async (postId: number) => {
        if (postLikeInFlightRef.current[postId]) {
            return;
        }

        let previousLikedStatus = false;
        let canUpdate = false;

        setPosts(prevPosts => {
            const postIndex = prevPosts.findIndex(post => +post.id === postId);
            if (postIndex === -1) {
                return prevPosts;
            }

            const targetPost = prevPosts[postIndex];
            previousLikedStatus = !!targetPost.isLikedByCurrentUser;
            canUpdate = true;

            const updatedPosts = [...prevPosts];
            updatedPosts[postIndex] = {
                ...targetPost,
                isLikedByCurrentUser: !previousLikedStatus,
                _count: {
                    ...targetPost._count,
                    likes: (targetPost._count?.likes ?? 0) + (previousLikedStatus ? -1 : 1),
                },
            };
            return updatedPosts;
        });

        if (!canUpdate) {
            return;
        }

        postLikeInFlightRef.current[postId] = true;

        try {
            if (previousLikedStatus) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }
        } catch (exception: unknown) {
            console.error('Error changing like status:', exception);
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    +post.id === postId
                        ? {
                              ...post,
                              isLikedByCurrentUser: previousLikedStatus,
                              _count: {
                                  ...post._count,
                                  likes: (post._count?.likes ?? 0) + (previousLikedStatus ? 1 : -1),
                              },
                          }
                        : post,
                ),
            );
        } finally {
            postLikeInFlightRef.current[postId] = false;
        }
    };

    const onLikeOrUnlikePoll = async (pollId: string) => {
        if (debounce) return;

        setDebounce(true);
        try {
            const pollIndex = posts.findIndex(post => post.id === pollId);
            if (pollIndex === -1) return;

            const poll = posts[pollIndex];
            console.log('Poll', pollId);
            const isLiked = poll.isLikedByCurrentUser;

            if (isLiked) {
                console.log('unliking');
                await unlikePoll(pollId);
            } else {
                console.log('liking');
                await likePoll(pollId);
            }

            const updatedPosts = [...posts];
            updatedPosts[pollIndex] = {
                ...poll,
                isLikedByCurrentUser: !isLiked,
                likeCount: poll.likeCount + (isLiked ? -1 : 1),
            };
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Error changing like status:', error);
        } finally {
            setTimeout(() => {
                setDebounce(false);
            }, 2000);
        }
    };

    const handleDeletePost = async (postId: number) => {
        const postIndex = posts.findIndex(post => +post.id === postId);
        setLoadingPostIds(prev => ({...prev, [postId]: true}));
        if (postIndex === -1) return;

        const post = posts[postIndex];

        try {
            if (post.isLikedByCurrentUser) {
                await unlikePost(postId);
            }

            await deletePost(postId);

            setPosts(prevPosts => prevPosts.filter(post => +post.id !== postId));
        } catch (error) {
            console.error('Error in deleting post:', error);
        } finally {
            setLoadingPostIds(prev => ({...prev, [postId]: false}));
        }
    };

    const handleDeletePoll = async (pollId: string) => {
        try {
            await deletePoll(pollId);
            setPosts(prevPosts => prevPosts.filter(post => post.id !== pollId));
        } catch (error) {
            console.error('Error in deleting poll:', error);
        }
    };

    const handleCommentInputChange = (postId: number, value: string) => {
        setCommentDrafts(prev => ({
            ...prev,
            [postId]: value,
        }));
    };

    const handleInlineCommentSend = async (postId: number) => {
        const commentText = (commentDrafts[postId] ?? '').trim();
        if (!commentText || commentSubmitting[postId]) {
            return;
        }

        setCommentSubmitting(prev => ({
            ...prev,
            [postId]: true,
        }));

        try {
            await commentOnPost(postId, 'TEXT', [commentText]);

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    +post.id === postId
                        ? {
                              ...post,
                              _count: {
                                  ...post._count,
                                  comments: (post._count?.comments ?? 0) + 1,
                              },
                          }
                        : post,
                ),
            );

            setCommentDrafts(prev => ({
                ...prev,
                [postId]: '',
            }));
        } catch (error) {
            console.error('Error creating inline comment:', error);
        } finally {
            setCommentSubmitting(prev => ({
                ...prev,
                [postId]: false,
            }));
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

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === pollId && 'type' in post && post.type === 'poll'
                        ? {
                              ...post,
                              _count: {
                                  ...post._count,
                                  comments: (post._count?.comments ?? 0) + 1,
                              },
                          }
                        : post,
                ),
            );

            setPollCommentDrafts(prev => ({
                ...prev,
                [pollId]: '',
            }));
        } catch (error) {
            console.error('Error creating inline poll comment:', error);
        } finally {
            setPollCommentSubmitting(prev => ({
                ...prev,
                [pollId]: false,
            }));
        }
    };

    const handleVote = async (pollId: string, choiceId: string) => {
        try {
            await voteOnPoll(pollId, choiceId);
            fetchPostsAndPolls(1, 'false');
        } catch (error) {
            console.error('Error voting on poll:', error);
        }
    };

    const handleFollow = async (authorId: string, isCurrentlyFollowing?: boolean) => {
        const updatedStatus = await toggleFollow(authorId);
        if (updatedStatus !== undefined) {
            setPosts(prevPosts =>
                prevPosts.map(item => {
                    if (isFeedPoll(item)) {
                        if (item.user?.id !== authorId) {
                            return item;
                        }
                        return {
                            ...item,
                            user: {
                                ...item.user,
                                isFollowed: !isCurrentlyFollowing,
                            },
                        };
                    }
                    if (item.author?.id !== authorId) {
                        return item;
                    }
                    return {
                        ...item,
                        author: {
                            ...item.author,
                            isFollowed: !isCurrentlyFollowing,
                        },
                    };
                }),
            );
        } else {
            console.error('Failed to update follow status');
        }
    };

    const handleReportUser = (author?: IUserProfile) => {
        if (!author?.id) {
            return;
        }
        navigateToReportUser({
            authorId: author.id,
            authorUsername: author.username,
            authorFirstName: author.firstName,
            authorProfilePicture: author.profilePicture,
            authorBadge: author.badge,
        });
    };

    const [blockUserModal, setBlockUserModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [blockUserMessage, setBlockUserMessage] = useState('');
    const [iconName, setIconName] = useState('');
    const [firstTimeUser, setFirstTimeUser] = useState<any>(null);

    useEffect(() => {
        async function checkFirstTimeUser() {
            try {
                const isNewVisitCrum = await newVisitCrum();
                if (isNewVisitCrum) {
                    setFirstTimeUser(isNewVisitCrum);
                } else {
                    setFirstTimeUser(false);
                }
            } catch (error) {
                console.log(error);
            }
        }
        checkFirstTimeUser();
    }, []);

    const handleVideoEnd = async () => {
        try {
            const updateResponse = await newUserUpdate();
            if (updateResponse.success) {
                setFirstTimeUser(false);
            } else {
                console.log('Failed to update user status');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const closeModal = () => {
        setBlockUserModal(false);
    };

    const handleToggleBlockUser = async authorId => {
        let response = await blockUser(authorId);

        if (response.success) {
            setBlockedUsers(prev => [...prev, {id: authorId}]);

            setPosts(prevPosts =>
                prevPosts.filter(item => {
                    if (isFeedPoll(item)) {
                        return item.user?.id !== authorId;
                    }
                    return item.author?.id !== authorId;
                }),
            );

            setModalType('success');
            setBlockUserMessage('User successfully blocked');
            setBlockUserModal(true);
            setIconName('hand-back-left');
        } else {
            Alert.alert('Error', 'Failed to block user.');
        }
    };

    if (firstTimeUser === null) {
        return <LoadingComponent />;
    } else if (firstTimeUser && !skipped) {
        return (
            <TabContainer>
                <SafeAreaView>
                    <Video
                        source={{
                            uri: 'https://priymuscontent.s3.us-east-1.amazonaws.com/Intro+Videos/Crummuinty+feed-2.mp4',
                        }}
                        style={{height: '100%', width: '100%'}}
                        paused={false} // make it start
                        repeat={false}
                        resizeMode="cover"
                        onEnd={handleVideoEnd}
                    />

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => {
                            setSkipped(true);
                            handleVideoEnd();
                        }}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </TabContainer>
        );
    } else {
        return (
            <TabContainer>
                <SafeAreaView style={{flex: 1, backgroundColor: '#050508'}}>
                    <View style={{flex: 1, backgroundColor: '#050508'}}>
                        <FlatList
                            data={loadingPosts ? [] : posts}
                            style={{flex: 1, backgroundColor: '#050508'}}
                            contentContainerStyle={{paddingBottom: '23%'}}
                            keyExtractor={item =>
                                isFeedPoll(item) ? `poll-${item.id}` : `post-${item.id}`
                            }
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            onEndReached={loadMorePosts}
                            onEndReachedThreshold={0.25}
                            ListHeaderComponent={
                                <View>
                                    <View style={{zIndex: 100}}>
                                        <Header />
                                    </View>
                                    <View
                                        style={{
                                            height: SIZES.ScreenHeight * 0.26,
                                            marginTop: isTablet() ? -160 : -68,
                                            backgroundColor: '#050508',
                                        }}>
                                        <LinearGradient
                                            colors={['#0a1628', '#0d0d18', '#050508']}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                height: SIZES.ScreenHeight * 0.26,
                                            }}
                                        />
                                        <Text style={styles.screenTitle}>What's the Skinny?</Text>

                                        <View style={{alignItems: 'center'}}>
                                            <TouchableWithoutFeedback
                                                onPress={() => {
                                                    navigation.navigate('CrummunityStack', {
                                                        screen: 'UserSearchResultScreen',
                                                    });
                                                }}>
                                                <View style={styles.searchinput}>
                                                    <Icon
                                                        name="magnify"
                                                        type="material-community"
                                                        color="#9b59b6"
                                                        size={isTablet() ? 32 : 25}
                                                        style={{marginRight: '2%'}}
                                                    />
                                                    <Text style={{...FONTS.Title2, color: COLORS.OVERLAY_WHITE_45}}>
                                                        Search users
                                                    </Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={styles.feedLabel}>Crummunity Feed</Text>
                                            <CustomIcon
                                                name="account-group"
                                                type="material-community"
                                                color="#5dade2"
                                                baseSize={15}
                                            />
                                        </View>
                                    </View>
                                </View>
                            }
                            ListEmptyComponent={
                                loadingPosts ? (
                                    <View style={{marginTop: '25%'}}>
                                        <ActivityIndicator size="large" color={COLORS.PINK} />
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.noPostText}>No Post yet</Text>
                                    </View>
                                )
                            }
                            renderItem={({item}) => {
                                if (!item?.id) {
                                    return null;
                                }

                                if (isFeedPoll(item)) {
                                    if (!item.user?.id) {
                                        return null;
                                    }

                                    return (
                                    <View style={styles.postcontainer}>
                                        <Pressable onPress={() => handlePollPress(item.id)} style={{marginBottom: 10}}>
                                            <PollCard
                                                poll={item}
                                                onVote={handleVote}
                                                onDeletePoll={handleDeletePoll}
                                                currentUserID={currentUserID || ''}
                                                akcruBadge={item.user?.badge}
                                                akcruBadgeColor={selectAvatarBorderColor(item.user?.badge ?? 'AKCRUIT')}
                                                profilePicture={item.user?.profilePicture}
                                                onLikeOrUnlike={() => onLikeOrUnlikePoll(item.id)}
                                                openProfile={() =>
                                                    navigation2.navigate('ViewUserScreen', {
                                                        userID: item.user?.id,
                                                    })
                                                }
                                                isAdmin={user?.isAdmin}
                                                onCommentIconPress={() => handlePollPress(item.id)}
                                                commentInputValue={pollCommentDrafts[item.id] ?? ''}
                                                onCommentInputChange={value =>
                                                    handlePollCommentInputChange(item.id, value)
                                                }
                                                onCommentSend={() => handleInlinePollCommentSend(item.id)}
                                                isCommentSending={pollCommentSubmitting[item.id] ?? false}
                                            />
                                        </Pressable>
                                    </View>
                                    );
                                }

                                if (!item.author?.id) {
                                    return null;
                                }

                                return (
                                    <View style={[styles.postcontainer, {marginBottom: 10}]}>
                                        <CommonPostCard
                                            post={item}
                                            loading={loadingPostIds[item.id] || false}
                                            openProfile={() =>
                                                navigation2.navigate('ViewUserScreen', {
                                                    userID: item.author.id,
                                                })
                                            }
                                            reportUser={() => handleReportUser(item.author)}
                                            onDeletePost={handleDeletePost}
                                            currentUserID={currentUserID || ''}
                                            akcruBadge={item.author?.badge}
                                            isPostLiked={item.isLikedByCurrentUser}
                                            onLikeOrUnlike={() => onLikeOrUnlike(+item.id)}
                                            onCommentIconPress={() => handlePostPress(+item.id)}
                                            onOpenPost={() => handlePostPress(+item.id)}
                                            commentInputValue={commentDrafts[+item.id] ?? ''}
                                            onCommentInputChange={value => handleCommentInputChange(+item.id, value)}
                                            onCommentSend={() => handleInlineCommentSend(+item.id)}
                                            isCommentSending={commentSubmitting[+item.id] ?? false}
                                            isFollowing={item.author?.isFollowed}
                                            onFollow={() => handleFollow(item.author.id, item.author.isFollowed)}
                                            akcruBadgeColor={selectAvatarBorderColor(item.author?.badge ?? 'AKCRUIT')}
                                            onBlockUser={() =>
                                                handleToggleBlockUser(item.author.id, item.author.isCurrentlyBlocked)
                                            }
                                            isOwner={item.author?.ownerStatus}
                                            isPromo={item.author?.promoUser}
                                            isAdmin={user?.isAdmin}
                                            visionaryStatus={user?.visionaryStatus}
                                        />
                                    </View>
                                );
                            }}
                            ListFooterComponent={() =>
                                hasMore && isLoadingMore && !loadingPosts && posts.length > 0 ? (
                                    <ActivityIndicator color={COLORS.PINK} />
                                ) : null
                            }
                        />
                        <View
                            pointerEvents="box-none"
                            style={[
                                styles.floatingbutton,
                                {paddingBottom: Math.max(12, tabBarHeight + insets.bottom - 6)},
                            ]}>
                            <View style={styles.floatingStack}>
                                {pollCreator && (
                                    <Pressable
                                        onPress={navigateToNewPoll}
                                        style={[styles.floatingStackItem, styles.floatingStackItemGap]}>
                                        <PollButton />
                                    </Pressable>
                                )}

                                <View style={styles.floatingStackItem}>
                                    <PostButton onPress={navigateToNewPost} />
                                </View>
                            </View>
                        </View>
                    </View>
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
};
export default CrummunityScreen;
