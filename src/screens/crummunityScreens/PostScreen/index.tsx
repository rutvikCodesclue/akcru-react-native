import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Pressable,
    ActivityIndicator,
    Platform,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
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
    getPosts,
    likeComment,
    likePost,
    unlikeComment,
    unlikePost,
} from '../../../lib/api/post.lib';
import PostCommentCard from '../../../components/PostCommentCard';
import {getPostComments} from '../../../lib/api/post.lib';
import HexShape from '../../../components/HexShape';
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
    const postId = route.params?.postId;
    const {user, hydrateUser} = useAuthStore();
    const [post, setPost] = useState<IPost | null>(route.params?.postId || null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingComments, setLoadingComments] = useState(true);
    const [error, setError] = useState('');

    const currentUserID = user?.id;
    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const fetchPostData = async () => {
        try {
            setLoading(true);
            const fetchedPost = await getPost(+postId);
            setPost(fetchedPost);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch post:', error);
            setError(error.message || 'Failed to fetch post');
            setLoading(false);
        }
    };

    const fetchCommentsAndStatuses = async () => {
        if (post && post.id) {
            setLoadingComments(true);
            try {
                const fetchedComments = await getPostComments(+post.id);
                let followingIds = new Set();
                let blockedUserIds = new Set();

                if (currentUserID) {
                    const followingResponse = await getUserFollowing(currentUserID);
                    followingIds = new Set(followingResponse?.following.map(user => user.id));

                    const blockedResponse = await getBlockedUsers();
                    blockedUserIds = new Set(blockedResponse.blockedUsers?.map(user => user.id));
                }

                const sortedComments = fetchedComments?.comments.sort(
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
    };

    useFocusEffect(
        useCallback(() => {
            fetchPostData();
            fetchCommentsAndStatuses();
            hydrateUser();
        }, [navigation]),
    );

    const handleDeletePost = async (postId: number) => {
        try {
            if (post.isLikedByCurrentUser) {
                await unlikePost(postId);
            }
            await deletePost(postId);
            navigation.navigate('CrummunityScreen');
        } catch (error) {
            console.error('Error in deleting post:', error);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            const commentIndex = comments.findIndex(comment => +comment.id === commentId);
            if (commentIndex !== -1) {
                const comment = comments[commentIndex];
                if (comment.isLikedByCurrentUser) {
                    await unlikeComment(commentId);
                }
            }
            await deleteComment(commentId);
            setComments(prevComments => prevComments.filter(comment => +comment.id !== commentId));
        } catch (error) {
            console.error('Error in deleting comment:', error);
        }
    };

    const handleFollow = async (authorId: any | IUserProfile, isCurrentlyFollowing: undefined) => {
        const updatedStatus = await toggleFollow(authorId);
        if (updatedStatus !== undefined) {
            setPost(prevPost => ({
                ...prevPost,
                author: {
                    ...prevPost.author,
                    isFollowed: !isCurrentlyFollowing,
                },
            }));
        } else {
            console.error('Failed to update follow status');
        }
    };

    const onLikeOrUnlikePost = async (postId: number) => {
        try {
            const isLiked = post.isLikedByCurrentUser;

            if (isLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }

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
        }
    };

    const onLikeOrUnlikeComment = async (commentId: number) => {
        try {
            const commentIndex = comments.findIndex(c => +c.id === commentId);
            if (commentIndex === -1) return;

            const comment = comments[commentIndex];
            const isLiked = comment.isLikedByCurrentUser;

            if (isLiked) {
                await unlikeComment(commentId);
            } else {
                await likeComment(commentId);
            }

            const updatedComments = [...comments];
            updatedComments[commentIndex] = {
                ...comment,
                isLikedByCurrentUser: !isLiked,
                likeCount: comment.likeCount + (isLiked ? -1 : 1),
            };

            setComments(updatedComments);
        } catch (error) {
            console.error('Error changing like status for comment:', error);
        }
    };

    function handleToggleBlockUser(id: any, isCurrentlyBlocked: any) {
        throw new Error('Function not implemented.');
    }

    const handleEditComment = (comment: IComment) => {
        navigation.navigate('EditCommentScreen', {comment});
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
                            openProfile={() => navigation.navigate('ViewUserScreen', {userID: post.author?.id})}
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
                            isEdited={post.edited}
                            updatedAt={post.updatedAt}
                        />
                    </View>
                    <View style={{marginBottom: '5%'}}>
                        {loadingComments ? (
                            <View style={{marginTop: '25%'}}>
                                <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                            </View>
                        ) : comments.length === 0 ? (
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
                    <View>
                        <PostButton />
                    </View>
                </Pressable>
            </SafeAreaView>
        </TabContainer>
    );
};
export default PostScreen;
