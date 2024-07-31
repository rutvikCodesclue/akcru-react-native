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
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import {deletePoll, getPollById, getPolls, voteOnPoll} from '../../../lib/api/poll.lib';
import {IPost, IUserProfile, IPoll} from '../../../../types';
import {StackNavigationProp} from '@react-navigation/stack';
import {
    blockUser,
    findAUser,
    followUser,
    getBlockedUsers,
    getUserFollowing,
    unblockUser,
    unfollowUser,
} from '../../../lib/api/user.lib';
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

type CrummunityScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'ViewUserScreen'>;

type CrummunityScreenRouteProp = RouteProp<CrummunityStackParams, 'ViewUserScreen'>;

type Props = {
    navigation: CrummunityScreenNavigationProp;
    route: CrummunityScreenRouteProp;
};

const CrummunityScreen = ({navigation, route}: Props) => {
    const {user, hydrateUser} = useAuthStore();
    const currentUserID = user?.id;
    const pollCreator = user?.pollCreator;
    const author: IPost | null = route.params?.author ?? null;

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [likedPosts, setLikedPosts] = useState(new Set());

    const [posts, setPosts] = useState<(IPost | IPoll)[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [blockedUsers, setBlockedUsers] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPostsAndPolls(1);
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

    const fetchPostsAndPolls = async (pageNumber: number) => {
        setLoading(true);
        try {
            const [fetchedPosts, fetchedPolls] = await Promise.all([getPosts(pageNumber), getPolls(pageNumber)]);

            let followingIds = new Set();
            let blockedUserIds = new Set();

            if (currentUserID) {
                const followingResponse = await getUserFollowing(currentUserID);
                followingIds = new Set(followingResponse?.following.map((user: {id: any}) => user.id));

                const blockedResponse = await getBlockedUsers();
                blockedUserIds = new Set(blockedResponse.blockedUsers?.map(user => user.id));
            }

            const updatedPosts = fetchedPosts.map((post: {author: {id: unknown}}) => ({
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
        await fetchPostsAndPolls(page + 1);
        setIsLoadingMore(false);
    };

    const handlePostPress = (postId: number) => {
        const selectedPost = posts.find(post => +post.id === postId);

        if (selectedPost) {
            navigation2.navigate('PostScreen', {
                post: selectedPost,
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
        try {
            const postIndex = posts.findIndex(post => +post.id === postId);
            if (postIndex === -1) return;

            const post = posts[postIndex];
            const isLiked = post.isLikedByCurrentUser;

            if (isLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }

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
        } catch (error) {
            console.error('Error changing like status:', error);
        }
    };

    const handleDeletePost = async (postId: number) => {
        const postIndex = posts.findIndex(post => +post.id === postId);
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
            fetchPostsAndPolls(1);
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

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPostsAndPolls(1);
        setRefreshing(false);
    };

    return (
        <TabContainer>
            <SafeAreaView>
                <View>
                    <ScrollView
                        stickyHeaderIndices={[0]}
                        style={{height: SIZES.ScreenHeight}}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}>
                        <View>
                            <View style={{zIndex: 100}}>
                                <Header />
                            </View>
                            <View
                                style={{
                                    height: SIZES.ScreenHeight * 0.24,
                                    marginTop: -68,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                }}>
                                <LinearGradient
                                    colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        height: SIZES.ScreenHeight * 0.24,
                                    }}
                                />
                                <Text style={styles.screenTitle}>What's the Skinny?</Text>

                                <View style={{alignItems: 'center'}}>
                                    <TouchableWithoutFeedback
                                        onPress={() => {
                                            navigation.navigate('UserSearchResultScreen');
                                        }}>
                                        <View style={styles.searchinput}>
                                            <Icon
                                                name="magnify"
                                                type="material-community"
                                                color={COLORS.AKCRUBLUE}
                                                size={25}
                                                style={{marginRight: '2%'}}
                                            />
                                            <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Search users</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE, marginRight: 10}}>
                                        Crummunity Feed
                                    </Text>
                                    <CustomIcon
                                        name="account-group"
                                        type="material-community"
                                        color={COLORS.AKCRUBLUE}
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
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    renderItem={({item}) =>
                                        item.type === 'poll' ? (
                                            <View
                                                // onPress={() => handlePollPress(item.id)}
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
                                                    openProfile={() =>
                                                        navigation2.navigate('ViewUserScreen', {
                                                            userID: item.user?.id,
                                                        })
                                                    }
                                                    isAdmin={user?.isAdmin}
                                                />
                                            </View>
                                        ) : (
                                            <Pressable
                                                onPress={() => handlePostPress(+item.id)}
                                                style={{marginBottom: 10}}>
                                                <SkinnyPostCard
                                                    post={item}
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
                                                        navigation2.navigate('NewComment', {postId: item.id})
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
                    <View style={styles.floatingbutton}>
                        {pollCreator && (
                            <Pressable onPress={() => navigation2.navigate('NewPoll')}>
                                <View>
                                    <PollButton />
                                </View>
                            </Pressable>
                        )}

                        <View>
                            <View>
                                <PostButton onPress={() => navigation2.navigate('NewPost')} />
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
};

export default CrummunityScreen;
