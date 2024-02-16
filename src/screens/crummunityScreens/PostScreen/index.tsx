import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from './styles'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants/theme'
import LinearGradient from 'react-native-linear-gradient'
import { Icon } from '@rneui/base'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { CrummunityStackParams } from '../../../navigation/CrummunityStack'
import Header from '../../../components/header'
import TabContainer from '../../../components/TabContainer/TabContainer'
import { StackNavigationProp } from '@react-navigation/stack'
import { IComment, IPost, IUserProfile } from '../../../../types'
import useAuthStore from '../../../stores/auth.store'
import PostCard from '../../../components/SkinnyPostCard'
import { deleteComment, deletePost, getPosts, likeComment, likePost, unlikeComment, unlikePost } from '../../../lib/api/post.lib'
import PostCommentCard from '../../../components/PostCommentCard'
import { getPostComments } from '../../../lib/api/post.lib'
import HexShape from '../../../components/HexShape'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack'

type PostScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'PostScreen'>;

type PostScreenRouteProp = RouteProp<CrummunityStackParams, 'PostScreen'>;

type Props = {
    navigation: PostScreenNavigationProp;
    route: PostScreenRouteProp;
};

const PostScreen = ({navigation, route}: Props) => {
    const {user, hydrateUser} = useAuthStore();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [likedPosts, setLikedPosts] = useState(new Set());
    // console.log('user', user?.username);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [comments, setComments] = useState<IComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);

    const currentUserID = user?.id;
    const author: IUserProfile | null = route.params?.author ?? null;
    // const {post} = route.params;
    const [post, setPost] = useState<IPost>(route.params?.post); // Use state for the specific post
    const [comment, setComment] = useState<IComment>(route.params?.comment); // Use state for the specific post
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

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

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh posts or update state here
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const fetchComments = async () => {
            console.log('fetchComments function called');
            if (post && post.id !== undefined) {
                console.log('Post:', post);
                try {
                    const fetchedComments = await getPostComments(+post.id);
                    console.log('Fetched Comments:', JSON.stringify(fetchedComments, null, 2));
                    if (fetchedComments && fetchedComments.success) {
                        setComments(fetchedComments.comments); // Set only the comments array
                    }
                    setLoadingComments(false);
                } catch (error) {
                    console.error('Failed to fetch comments:', error);
                    setError(error.message || 'Failed to fetch comments');
                    setLoadingComments(false);
                }
            } else {
                console.log('Post or post.id is not defined');
            }
        };

        const handleFocus = () => {
            if (post && post.id !== undefined) {
                fetchComments();
            }
        };

        // Add a listener for the focus event
        const unsubscribeFocus = navigation.addListener('focus', handleFocus);

        // Fetch data when the component mounts or when the post object changes
        fetchComments();

        // Cleanup the listener when the component unmounts
        return () => {
            unsubscribeFocus();
        };
    }, [post, navigation]); // Include navigation in the dependency array

    const handleDeletePost = async (postId: number) => {
        try {
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

    const onLikeOrUnlikePost = async (postId: number) => {
        try {
            const isLiked = post.isLikedByCurrentUser;

            // Perform the like or unlike action
            if (isLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }

            // Optimistically update the UI
            setPost({
                ...post,
                isLikedByCurrentUser: !isLiked,
                _count: {
                    ...post._count,
                    likes: post._count.likes + (isLiked ? -1 : 1),
                },
            });
        } catch (error) {
            console.error('Error changing like status:', error);
            // Optionally handle reversion or user notification here
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
                                <TouchableOpacity onPress={() => navigation.pop()}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: '20%',
                                            marginHorizontal: 15,
                                        }}>
                                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                    </View>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>

                    <View style={styles.postcontainer}>
                        <PostCard
                            post={post}
                            openProfile={() => navigation.navigate('ViewUserScreen', {userID: post.author?.id})}
                            currentUserID={currentUserID ?? ''}
                            deleteThePost={() => handleDeletePost(+post.id)}
                            // onFollow={() => handleFollow(item.author.id)}
                            // onUnfollow={() => handleUnfollow(item.author.id)}
                            onDeletePost={handleDeletePost}
                            isPostLiked={post.isLikedByCurrentUser}
                            onLikeOrUnlike={() => onLikeOrUnlikePost(+post.id)}
                            akcruBadge={post.author?.badge}
                            CommentOnPostButton={() => navigation2.navigate('NewComment', {postId: post.id})}
                        />
                    </View>
                    <View style={{marginBottom: '30%'}}>
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
                                            // onFollow={() => handleFollow(item.author.id)}
                                            // onUnfollow={() => handleUnfollow(item.author.id)}
                                            isCommentLiked={item.isLikedByCurrentUser}
                                            onDeleteComment={() => handleDeleteComment(+item.id)}
                                            currentUserID={currentUserID || ''}
                                            akcruBadge={item.author?.badge}
                                            onLikeOrUnlike={() => onLikeOrUnlikeComment(+item.id)}
                                            likeCount={item.likeCount || 0}
                                        />
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </ScrollView>
                <Pressable
                    style={styles.floatingbuttonContainer}
                    onPress={() => navigation.navigate('NewComment', {postId: post.id})}>
                    <View style={{position: 'relative'}}>
                        <HexShape size={55} color={COLORS.AKCRUBLUE} />
                        <View style={{position: 'absolute', top: '5%', right: '6%'}}>
                            <Icon name="add" type="ionicon" color={COLORS.LIGHTGREY} size={45} />
                        </View>
                    </View>
                </Pressable>
            </SafeAreaView>
        </TabContainer>
    );
};
export default PostScreen;