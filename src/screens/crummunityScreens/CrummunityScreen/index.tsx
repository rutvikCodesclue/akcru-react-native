import {
    Text,
    View,
    ScrollView,
    TouchableWithoutFeedback,
    Modal,
    FlatList,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';

import React, {useEffect, useRef, useState} from 'react';
import Header from '../../../components/header';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {deletePost, getPosts, likePost, unlikePost} from '../../../lib/api/post.lib';
import {deletePoll, getPollById, getPolls, likePoll, unlikePoll, voteOnPoll} from '../../../lib/api/poll.lib';
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
import PollCard from '../../../components/CrummunityPoll';
import {newVisitCrum} from '../../../lib/api/post.lib';
import {newUserUpdate} from '../../../lib/api/post.lib';
import LoadingComponent from '../../../components/Loading';
import {isTablet} from '../../../../assets/constants/theme';
import {navigateToNewComment, navigateToNewPost, navigateToPostScreen} from '../../../util/RootNavigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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

const CrummunityScreen = ({navigation, route}: Props) => {
    const {user, hydrateUser} = useAuthStore();
    const currentUserID = user?.id;
    const pollCreator = user?.pollCreator;
    const author: IPost | null = route.params?.author ?? null;

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const insets = useSafeAreaInsets();

    const [likedPosts, setLikedPosts] = useState(new Set());

    const [posts, setPosts] = useState<(IPost | IPoll)[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPostIds, setLoadingPostIds] = useState<{[key: number]: boolean}>({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState('');
    const [debounce, setDebounce] = useState(false);

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const postLikedStatusTimer = useRef<Record<number, NodeJS.Timeout>>({});

    const [blockedUsers, setBlockedUsers] = useState([]);

    const [refreshing, setRefreshing] = useState(false);
    const [skipped, setSkipped] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPostsAndPolls(1, 'false');
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
                followingIds = new Set(followingResponse?.following.map(user => user.id));

                const blockedResponse = await getBlockedUsers();
                blockedUserIds = new Set(blockedResponse.blockedUsers?.map(user => user.id));
            }

            const updatedPosts = fetchedPosts.map(post => ({
                ...post,
                author: {
                    ...post.author,
                    isFollowed: followingIds.has(post.author.id),
                    isBlocked: blockedUserIds.has(post.author.id),
                },
                isLikedByCurrentUser: post.isLikedByCurrentUser ?? false,
            }));

            // Fetch additional poll details for each poll
            const pollsWithDetails = await Promise.all(
                fetchedPolls.map(async poll => {
                    const pollDetails = await getPollById(poll.id);
                    return {
                        ...poll,
                        ...pollDetails,
                        user: {
                            ...poll.user,
                            isFollowed: followingIds.has(poll.user.id),
                            isBlocked: blockedUserIds.has(poll.user.id),
                        },
                        type: 'poll',
                    };
                }),
            );

            const combinedItems = [...updatedPosts, ...pollsWithDetails].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

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

    const handleScroll = ({nativeEvent}) => {
        if (isCloseToBottom(nativeEvent)) {
            loadMorePosts();
        }
    };

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = contentSize.height * 0.25;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

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
            navigation2.navigate('PollScreen', {
                poll: selectedPoll,
                isLikedByCurrentUser: selectedPoll.isLikedByCurrentUser,
            });
        } else {
            console.error('Error: Poll not found');
        }
    };

    const onLikeOrUnlike = async (postId: number) => {
        if (postId in postLikedStatusTimer.current) {
            clearTimeout(postLikedStatusTimer.current[postId]);
        }
        const postIndex = posts.findIndex(post => +post.id === postId);
        if (postIndex === -1) {
            return;
        }

        const post = posts[postIndex];
        const isLiked = post.isLikedByCurrentUser;

        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
            ...post,
            isLikedByCurrentUser: !isLiked,
            _count: {
                ...post._count,
                likes: post._count.likes + (isLiked ? -1 : 1),
            },
        };
        setPosts(updatedPosts);

        postLikedStatusTimer.current[postId] = setTimeout(async () => {
            try {
                if (isLiked) {
                    await unlikePost(postId);
                } else {
                    await likePost(postId);
                }
            } catch (exception: unknown) {
                console.error('Error changing like status:', exception);

                updatedPosts[postIndex] = {
                    ...post,
                    isLikedByCurrentUser: isLiked,
                    _count: {
                        ...post._count,
                        likes: post._count.likes + (isLiked ? 1 : -1),
                    },
                };
                setPosts(updatedPosts);
            }
        }, 200);
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

    const handleVote = async (pollId: string, choiceId: string) => {
        try {
            await voteOnPoll(pollId, choiceId);
            fetchPostsAndPolls(1, 'false');
        } catch (error) {
            console.error('Error voting on poll:', error);
        }
    };

    const handleFollow = async (authorId: any | IUserProfile, isCurrentlyFollowing: undefined) => {
        const updatedStatus = await toggleFollow(authorId);
        if (updatedStatus !== undefined) {
            setPosts(prevPosts =>
                prevPosts.map(post => {
                    if (post.author.id === authorId) {
                        return {...post, author: {...post.author, isFollowed: !isCurrentlyFollowing}};
                    }
                    return post;
                }),
            );
        } else {
            console.error('Failed to update follow status');
        }
    };

    const handleReportUser = (author: IUserProfile) => {
        navigation2.navigate('ReportUser', {
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

            setPosts(prevPosts => prevPosts.filter(post => post.author.id !== authorId));

            setModalType('success');
            setBlockUserMessage('User successfully blocked');
            setBlockUserModal(true);
            setIconName('hand-back-left');
        } else {
            Alert.alert('Error', 'Failed to block user.');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPostsAndPolls(1, 'true');
        setRefreshing(false);
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
                        <ScrollView
                            style={{height: SIZES.ScreenHeight, backgroundColor: '#050508'}}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
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
                                                <Text style={{...FONTS.Title2, color: 'rgba(255,255,255,0.45)'}}>
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
                            <View style={{marginBottom: '23%'}}>
                                {loadingPosts ? (
                                    <View style={{marginTop: '25%'}}>
                                        <ActivityIndicator size="large" color={COLORS.PINK} />
                                    </View>
                                ) : posts.length === 0 ? (
                                    <View>
                                        <Text style={styles.noPostText}>No Post yet</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={posts}
                                        style={styles.postcontainer}
                                        keyExtractor={item => item.id}
                                        // refreshing={refreshing}
                                        // onRefresh={handleRefresh}
                                        renderItem={({item}) =>
                                            item.type === 'poll' ? (
                                                <Pressable
                                                    onPress={() => handlePollPress(item.id)}
                                                    style={{marginBottom: 10}}>
                                                    <PollCard
                                                        poll={item}
                                                        onVote={handleVote}
                                                        onDeletePoll={handleDeletePoll}
                                                        currentUserID={currentUserID || ''}
                                                        akcruBadge={item.user?.badge}
                                                        akcruBadgeColor={selectAvatarBorderColor(
                                                            item.user.badge ?? 'AKCRUIT',
                                                        )}
                                                        CommentOnPollButton={() =>
                                                            navigation2.navigate('NewPollComment', {
                                                                pollId: item.id,
                                                            })
                                                        }
                                                        onLikeOrUnlikePoll={() => onLikeOrUnlikePoll(item.id)}
                                                        openProfile={() =>
                                                            navigation2.navigate('ViewUserScreen', {
                                                                userID: item.user?.id,
                                                            })
                                                        }
                                                        isAdmin={user?.isAdmin}
                                                    />
                                                </Pressable>
                                            ) : (
                                                <Pressable
                                                    onPress={() => handlePostPress(+item.id)}
                                                    style={{marginBottom: 10}}>
                                                    <SkinnyPostCard
                                                        post={item}
                                                        loading={loadingPostIds[item.id] || false}
                                                        openProfile={() =>
                                                            navigation2.navigate('ViewUserScreen', {
                                                                userID: item.author?.id,
                                                            })
                                                        }
                                                        reportUser={() => handleReportUser(item.author)}
                                                        onDeletePost={handleDeletePost}
                                                        currentUserID={currentUserID || ''}
                                                        akcruBadge={item.author?.badge}
                                                        isPostLiked={item.isLikedByCurrentUser}
                                                        onLikeOrUnlike={() => onLikeOrUnlike(+item.id)}
                                                        CommentOnPostButton={() =>
                                                            navigateToNewComment(item.id)
                                                        }
                                                        isFollowing={item.author.isFollowed}
                                                        onFollow={() =>
                                                            handleFollow(item.author.id, item.author.isFollowed)
                                                        }
                                                        akcruBadgeColor={selectAvatarBorderColor(
                                                            item.author.badge ?? 'AKCRUIT',
                                                        )}
                                                        onBlockUser={() =>
                                                            handleToggleBlockUser(
                                                                item.author.id,
                                                                item.author.isCurrentlyBlocked,
                                                            )
                                                        }
                                                        isOwner={item.author.ownerStatus}
                                                        isPromo={item.author.promoUser}
                                                        isAdmin={user?.isAdmin} // Pass isAdmin prop
                                                        visionaryStatus={user?.visionaryStatus}
                                                    />
                                                </Pressable>
                                            )
                                        }
                                        ListFooterComponent={() =>
                                            hasMore && isLoadingMore ? <ActivityIndicator color={COLORS.PINK} /> : null
                                        }
                                    />
                                )}
                            </View>
                        </ScrollView>
                        <View
                            pointerEvents="box-none"
                            style={[
                                styles.floatingbutton,
                                {paddingBottom: Math.max(10, insets.bottom + 6)},
                            ]}>
                            {pollCreator && (
                                <Pressable onPress={() => navigation2.navigate('NewPoll')}>
                                    <View>
                                        <PollButton />
                                    </View>
                                </Pressable>
                            )}

                            <View>
                                <View>
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
