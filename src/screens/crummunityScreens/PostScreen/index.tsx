import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    FlatList,
    Pressable,
    ActivityIndicator,
    Platform,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import styles from './styles';
import {COLORS, FONTS, isTablet, SIZES} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {StackNavigationProp} from '@react-navigation/stack';
import {IComment, IPost, IUserProfile} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {
    deleteComment,
    deletePost,
    getPost,
    likeComment,
    likePost,
    unlikeComment,
    unlikePost,
    commentOnPost,
} from '../../../lib/api/post.lib';
import PostCommentCard from '../../../components/PostCommentCard';
import {getPostComments} from '../../../lib/api/post.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {blockUser, getBlockedUsers, getUserFollowing, toggleFollow} from '../../../lib/api/user.lib';
import {selectAvatarBorderColor} from '../../../util/util';
import BackButton from '../../../components/General/backbutton';
import CommonPostCard from '../../../components/CommonPostCard';

type PostScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'PostScreen'>;
type PostScreenRouteProp = RouteProp<CrummunityStackParams, 'PostScreen'>;

type Props = {
    navigation: PostScreenNavigationProp;
    route: PostScreenRouteProp;
};

const PostScreen = ({navigation, route}: Props) => {
    const postId = route.params?.post.id;
    const isLikedByCurrentUser = route.params?.isLikedByCurrentUser;
    const {user} = useAuthStore();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPostIds, setLoadingPostIds] = useState<{ [key: number]: boolean }>({});
    const [error, setError] = useState('');
    const [comments, setComments] = useState<IComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [debounce, setDebounce] = useState(false);

    const currentUserID = user?.id;
    const [post, setPost] = useState<IPost>({...route.params?.post, isLikedByCurrentUser});
    const [commentDraft, setCommentDraft] = useState('');
    const [isCommentSending, setIsCommentSending] = useState(false);
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
                    try {
                        const followingResponse = await getUserFollowing(currentUserID);
                        const followingList = Array.isArray((followingResponse as {following?: IUserProfile[]})?.following)
                            ? (followingResponse as {following?: IUserProfile[]}).following ?? []
                            : [];
                        followingIds = new Set(
                            followingList
                                .filter((follower): follower is IUserProfile => Boolean(follower?.id))
                                .map(follower => follower.id),
                        );
                    } catch (followingError) {
                        console.error('Failed to fetch following status for comments:', followingError);
                        followingIds = new Set();
                    }

                    try {
                        const blockedResponse = await getBlockedUsers();
                        const blockedList = Array.isArray(blockedResponse?.blockedUsers) ? blockedResponse.blockedUsers : [];
                        blockedUserIds = new Set(
                            blockedList
                                .filter((blockedUser): blockedUser is IUserProfile => Boolean(blockedUser?.id))
                                .map(blockedUser => blockedUser.id),
                        );
                    } catch (blockedError) {
                        console.error('Failed to fetch blocked status for comments:', blockedError);
                        blockedUserIds = new Set();
                    }
                }

                const sortedComments = fetchedComments.comments.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                );

                const updatedComments = sortedComments.map(comment => {
                    if (!comment.author) {
                        return {
                            ...comment,
                            author: null,
                        };
                    }

                    return {
                        ...comment,
                        author: {
                            ...comment.author,
                            isFollowed: followingIds.has(comment.author.id),
                            isBlocked: blockedUserIds.has(comment.author.id),
                        },
                    };
                });

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

    const handleFollow = async (authorId: string, isCurrentlyFollowing?: boolean) => {
        try {
            const updatedStatus = await toggleFollow(authorId);
            if (updatedStatus === undefined) {
                console.error('Failed to update follow status');
                return;
            }

            const nextIsFollowed =
                typeof updatedStatus === 'boolean' ? updatedStatus : !Boolean(isCurrentlyFollowing);

            setPost(prevPost => {
                if (!prevPost || prevPost.author?.id !== authorId) {
                    return prevPost;
                }
                return {
                    ...prevPost,
                    author: {
                        ...prevPost.author,
                        isFollowed: nextIsFollowed,
                    },
                };
            });

            setComments(prevComments =>
                prevComments.map(item =>
                    item.author?.id === authorId
                        ? {
                              ...item,
                              author: {
                                  ...item.author,
                                  isFollowed: nextIsFollowed,
                              },
                          }
                        : item,
                ),
            );
        } catch (error) {
            console.error('Failed to update follow status:', error);
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

    const handleToggleBlockUser = async (id: string) => {
        try {
            await blockUser(id);
            setPost(prevPost => {
                if (!prevPost || prevPost.author?.id !== id) {
                    return prevPost;
                }
                return {
                    ...prevPost,
                    author: {
                        ...prevPost.author,
                        isBlocked: true,
                    },
                };
            });
            setComments(prevComments =>
                prevComments.map(item =>
                    item.author?.id === id
                        ? {
                              ...item,
                              author: {
                                  ...item.author,
                                  isBlocked: true,
                              },
                          }
                        : item,
                ),
            );
        } catch (error) {
            console.error('Failed to block user:', error);
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

    const handleEditComment = (comment: IComment) => {
        navigation2.navigate('EditCommentScreen', {comment});
    };

    const handleInlineCommentSend = async () => {
        const commentText = commentDraft.trim();
        if (!post?.id || !commentText || isCommentSending) {
            return;
        }

        setIsCommentSending(true);
        try {
            await commentOnPost(+post.id, 'TEXT', [commentText]);

            setPost(prevPost => {
                if (!prevPost) {
                    return prevPost;
                }
                return {
                    ...prevPost,
                    _count: {
                        ...prevPost._count,
                        comments: (prevPost._count?.comments ?? 0) + 1,
                    },
                };
            });
            setCommentDraft('');
            await fetchCommentsAndStatuses();
        } catch (error) {
            console.error('Error creating inline comment:', error);
            setError(error.message || 'Failed to add comment');
        } finally {
            setIsCommentSending(false);
        }
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
            <SafeAreaView style={{flex: 1, backgroundColor: '#050508'}}>
                <ScrollView stickyHeaderIndices={[0]} style={{height: SIZES.ScreenHeight, backgroundColor: '#050508'}}>
                    <View style={{zIndex: 100}}>
                        <View style={{zIndex: 101}}>
                            <Header />
                        </View>

                        <View
                            style={{
                                height: SIZES.ScreenHeight * 0.15,
                                marginTop: isTablet() ? -150 : -68,
                                backgroundColor: '#050508',
                            }}>
                            <LinearGradient
                                colors={['#0a1628', '#0d0d18', '#050508']}
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
                        <CommonPostCard
                            post={post}
                            loading={loadingPostIds[postId] || false}
                            openProfile={() => navigation2.navigate('ViewUserScreen', {userID: post.author?.id})}
                            reportUser={() => handleReportUser(post.author)}
                            currentUserID={currentUserID ?? ''}
                            onDeletePost={handleDeletePost}
                            onLikeOrUnlike={() => onLikeOrUnlikePost(+post.id)}
                            commentInputValue={commentDraft}
                            onCommentInputChange={setCommentDraft}
                            onCommentSend={handleInlineCommentSend}
                            isCommentSending={isCommentSending}
                            onFollow={() => {
                                if (!post.author?.id) {
                                    return;
                                }
                                handleFollow(post.author.id, post.author.isFollowed);
                            }}
                            isFollowing={post.author?.isFollowed}
                            onBlockUser={() =>
                                post.author?.id
                                    ? handleToggleBlockUser(post.author.id)
                                    : undefined
                            }
                            akcruBadge={post.author?.badge}
                            akcruBadgeColor={selectAvatarBorderColor(post.author?.badge ?? 'AKCRUIT')}
                            isAdmin={user?.isAdmin}
                        />
                    </View>
                    <View style={{marginBottom: '5%', backgroundColor: '#050508'}}>
                        {loadingComments ? (
                            <View style={{marginTop: '25%'}}>
                                <ActivityIndicator size="large" color="#9b59b6" />
                            </View>
                        ) : // You can customize the size and color
                        comments.length === 0 ? (
                            <View>
                                <Text style={[styles.noCommentsText, {color: 'rgba(255,255,255,0.45)'}]}>
                                    No comments yet
                                </Text>
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
                                            onFollow={() => {
                                                if (!item.author?.id) {
                                                    return;
                                                }
                                                handleFollow(item.author.id, item.author.isFollowed);
                                            }}
                                            isFollowing={item.author?.isFollowed}
                                            onBlockUser={() =>
                                                item.author?.id
                                                    ? handleToggleBlockUser(item.author.id)
                                                    : undefined
                                            }
                                            akcruBadgeColor={selectAvatarBorderColor(item.author?.badge ?? 'AKCRUIT')}
                                            onEditComment={() => handleEditComment(item)}
                                            isAdmin={user?.isAdmin}
                                        />
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};
export default PostScreen;
