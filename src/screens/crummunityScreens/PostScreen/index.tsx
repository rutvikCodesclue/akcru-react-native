import {View, Text, SafeAreaView, ScrollView, FlatList, Pressable, ActivityIndicator, Platform} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {StackNavigationProp} from '@react-navigation/stack';
import {IComment, IPost, IUserProfile} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import PostCard from '../../../components/SkinnyPostCard';
import {
    deleteComment,
    deletePost,
    getPost,
    likeComment,
    likePost,
    unlikeComment,
    unlikePost,
} from '../../../lib/api/post.lib';
import PostCommentCard from '../../../components/PostCommentCard';
import {getPostComments} from '../../../lib/api/post.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {getBlockedUsers, getUserFollowing, toggleFollow} from '../../../lib/api/user.lib';
import {selectAvatarBorderColor} from '../../../util/util';
import PostButton from '../../../components/AkcruPostButton';
import BackButton from '../../../components/General/backbutton';

type PostScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'PostScreen'>;
type PostScreenRouteProp = RouteProp<CrummunityStackParams, 'PostScreen'>;

type Props = {
    navigation: PostScreenNavigationProp;
    route: PostScreenRouteProp;
};

const PostScreen = ({navigation, route}: Props) => {
    const postId = route.params?.post.id;
    const isLikedByCurrentUser = route.params?.isLikedByCurrentUser;
    const {user, hydrateUser} = useAuthStore();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [loadingPostIds, setLoadingPostIds] = useState<{ [key: number]: boolean }>({});
    const [error, setError] = useState('');
    const [comments, setComments] = useState<IComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [debounce, setDebounce] = useState(false);

    const currentUserID = user?.id;
    const author: IUserProfile | null = route.params?.author ?? null;
    const [post, setPost] = useState<IPost>({...route.params?.post, isLikedByCurrentUser});
    const [comment, setComment] = useState<IComment>(route.params?.comment);
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const fetchPostData = useCallback(async () => {
        if (postId) {
            setLoading(true);
            try {
                const fetchedPost = await getPost(postId);
                fetchedPost.isLikedByCurrentUser = isLikedByCurrentUser;
                setPost(fetchedPost);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch post:', error);
                setError(error.message || 'Failed to fetch post');
                setLoading(false);
            }
        } else {
            console.log('Post ID is not defined');
        }
    }, [postId, isLikedByCurrentUser]);

    const fetchCommentsAndStatuses = useCallback(async () => {
        if (post?.id) {
            setLoadingComments(true);
            try {
                const fetchedComments = await getPostComments(post.id);

                if (!fetchedComments || !fetchedComments.comments) {
                    console.error('No comments data received:', fetchedComments);
                    setError('Failed to load comments. Please try again.');
                    setLoadingComments(false);
                    return;
                }

                let followingIds = new Set();
                let blockedUserIds = new Set();

                if (currentUserID) {
                    const followingResponse = await getUserFollowing(currentUserID);
                    followingIds = new Set(followingResponse?.following.map(user => user.id));

                    const blockedResponse = await getBlockedUsers();
                    blockedUserIds = new Set(blockedResponse.blockedUsers?.map(user => user.id));
                }

                const sortedComments = fetchedComments.comments.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                );

                const updatedComments = sortedComments.map(comment => ({
                    ...comment,
                    author: {
                        ...comment.author,
                        isFollowed: followingIds.has(comment.author.id),
                        isBlocked: blockedUserIds.has(comment.author.id),
                    },
                }));

                setComments(updatedComments);
                setLoadingComments(false);
            } catch (error) {
                console.error('Failed to fetch comments or statuses:', error);
                setError(error.message || 'Failed to fetch comments');
                setLoadingComments(false);
            }
        } else {
            console.log('Post or post.id is not defined');
        }
    }, [post?.id, currentUserID]);

    useFocusEffect(
        useCallback(() => {
            fetchPostData();
            fetchCommentsAndStatuses();
        }, [fetchPostData, fetchCommentsAndStatuses]),
    );

    const handleDeletePost = async (postId: number) => {
        try {
            setLoadingPostIds(prev => ({ ...prev, [postId]: true }));
            // If the post is liked by the current user, unlike it first
            if (post.isLikedByCurrentUser) {
                await unlikePost(postId);
            }

            // Proceed to delete the post
            await deletePost(postId);

            // Navigate back to CrummunityScreen
            navigation.navigate('CrummunityScreen');
        } catch (error) {
            console.error('Error in deleting post:', error);
            // Handle error (e.g., show a message to the user)
        }
        finally {
            setLoadingPostIds(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            // Check if the comment is liked by the current user and unlike it if necessary
            // This step depends on your app's logic. If unliking before deleting is not needed, you can remove this part.
            const commentIndex = comments.findIndex(comment => +comment.id === commentId);
            if (commentIndex !== -1) {
                const comment = comments[commentIndex];
                if (comment.isLikedByCurrentUser) {
                    await unlikeComment(commentId);
                }
            }

            // Proceed to delete the comment
            await deleteComment(commentId);

            // Update local state to remove the comment from the UI
            setComments(prevComments => prevComments.filter(comment => +comment.id !== commentId));
        } catch (error) {
            console.error('Error in deleting comment:', error);
            // Handle error (e.g., show a message to the user)
        }
    };

    const handleFollow = async (authorId: any | IUserProfile, isCurrentlyFollowing: undefined) => {
        const updatedStatus = await toggleFollow(authorId); // Your toggleFollow function should return the new follow status
        if (updatedStatus !== undefined) {
            setPosts(prevPosts =>
                prevPosts.map(post => {
                    if (post.author.id === authorId) {
                        // Update the follow status
                        return {...post, author: {...post.author, isFollowed: !isCurrentlyFollowing}};
                    }
                    return post;
                }),
            );
        } else {
            console.error('Failed to update follow status');
        }
    };

    const onLikeOrUnlikePost = async (postId: number) => {
        if (debounce) return;
        const isLiked = post?.isLikedByCurrentUser;

        setPost(prevPost => {
            if (!prevPost) return prevPost;

            return {
                ...prevPost,
                isLikedByCurrentUser: !isLiked,
                _count: {
                    ...prevPost._count,
                    likes: prevPost._count.likes + (isLiked ? -1 : 1),
                },
            };
        });

        setDebounce(true);
        try {
            if (isLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }
        } catch (error) {
            console.error('Error changing like status:', error);
            setError(error.message || 'Failed to like/unlike the post');
            setPost(prevPost => {
                if (!prevPost) return prevPost; // Prevent updates if prevPost is null
    
                return {
                    ...prevPost,
                    isLikedByCurrentUser: isLiked,
                    _count: {
                        ...prevPost._count,
                        likes: prevPost._count.likes + (isLiked ? 1 : -1),
                    },
                };
            });
        } finally {
            setTimeout(() => {
                setDebounce(false);
            }, 200);
        }
    };

    const onLikeOrUnlikeComment = async (commentId: number) => {
        try {
            const commentIndex = comments.findIndex(c => +c.id === commentId);
            if (commentIndex === -1) return;

            const comment = comments[commentIndex];
            const isLiked = comment.isLikedByCurrentUser;

            // Perform the like or unlike action
            if (isLiked) {
                await unlikeComment(commentId); // Make sure this is awaited
            } else {
                await likeComment(commentId); // Make sure this is awaited
            }

            // Optimistically update the UI
            const updatedComments = [...comments];
            updatedComments[commentIndex] = {
                ...comment,
                isLikedByCurrentUser: !isLiked,
                likeCount: comment.likeCount + (isLiked ? -1 : 1), // Assuming likeCount holds the number of likes
            };

            setComments(updatedComments);
        } catch (error) {
            console.error('Error changing like status for comment:', error);
            // Optionally handle reversion or user notification here
        }
    };

    function handleToggleBlockUser(id: any, isCurrentlyBlocked: any) {
        throw new Error('Function not implemented.');
    }

    const handleEditComment = (comment: IComment) => {
        navigation2.navigate('EditCommentScreen', {comment});
    };

    if (!post) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Text style={{...FONTS.Title2Orange}}>Error: Post not found</Text>
            </View>
        );
    }

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]} style={{height: SIZES.ScreenHeight}}>
                    <View style={{zIndex: 100}}>
                        <View style={{zIndex: 101}}>
                            <Header />
                        </View>

                        <View
                            style={{
                                height: SIZES.ScreenHeight * 0.15,
                                marginTop: -68,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                            }}>
                            <LinearGradient
                                // Background Linear Gradient
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight * 0.15,
                                }}>
                                <View style={{marginHorizontal: 15, marginTop: Platform.OS === 'android' ? '15%' : 0}}>
                                    <BackButton navigation={navigation} />
                                </View>
                            </LinearGradient>
                        </View>
                    </View>

                    <View style={styles.postcontainer}>
                        <PostCard
                            post={post}
                            loading={loadingPostIds[postId] || false}
                            openProfile={() => navigation2.navigate('ViewUserScreen', {userID: post.author?.id})}
                            currentUserID={currentUserID ?? ''}
                            deleteThePost={() => handleDeletePost(+post.id)}
                            onDeletePost={handleDeletePost}
                            isPostLiked={post.isLikedByCurrentUser}
                            onLikeOrUnlike={() => onLikeOrUnlikePost(+post.id)}
                            akcruBadge={post.author?.badge}
                            CommentOnPostButton={() => navigation2.navigate('NewComment', {postId: post.id})}
                            onFollow={() => handleFollow(post.author.id, post.author.isFollowed)}
                            isFollowing={post.author.isFollowed}
                            akcruBadgeColor={selectAvatarBorderColor(post.author.badge ?? 'AKCRUIT')}
                            isAdmin={user?.isAdmin}
                        />
                    </View>
                    <View style={{marginBottom: '5%'}}>
                        {loadingComments ? (
                            <View style={{marginTop: '25%'}}>
                                <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                            </View>
                        ) : // You can customize the size and color
                        comments.length === 0 ? (
                            <View>
                                <Text style={styles.noCommentsText}>No comments yet</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={comments}
                                style={styles.postcontainer}
                                keyExtractor={item => item.id}
                                renderItem={({item}) => (
                                    <View style={{marginBottom: 10}}>
                                        <PostCommentCard
                                            post={item}
                                            openProfile={() =>
                                                navigation.navigate('ViewUserScreen', {userID: item.author?.id})
                                            }
                                            userName={item.author?.username}
                                            firstName={item.author?.firstName}
                                            isCommentLiked={item.isLikedByCurrentUser}
                                            onDeleteComment={() => handleDeleteComment(+item.id)}
                                            currentUserID={currentUserID || ''}
                                            akcruBadge={item.author?.badge}
                                            onLikeOrUnlike={() => onLikeOrUnlikeComment(+item.id)}
                                            likeCount={item.likeCount || 0}
                                            onFollow={() => handleFollow(item.author.id, item.author.isFollowed)}
                                            isFollowing={item.author.isFollowed}
                                            onBlockUser={() =>
                                                handleToggleBlockUser(item.author.id, item.author.isCurrentlyBlocked)
                                            }
                                            akcruBadgeColor={selectAvatarBorderColor(item.author.badge ?? 'AKCRUIT')}
                                            onEditComment={() => handleEditComment(item)}
                                            isAdmin={user?.isAdmin}
                                        />
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </ScrollView>

                <View style={styles.floatingbuttonContainer}>
                    <PostButton onPress={() => navigation2.navigate('NewComment', {postId: post.id})} />
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};
export default PostScreen;
