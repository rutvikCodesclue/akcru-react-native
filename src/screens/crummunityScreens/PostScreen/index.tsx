import { View, Text, SafeAreaView, TouchableWithoutFeedback, TouchableOpacity, ScrollView, FlatList, Pressable } from 'react-native'
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
import { IPost, IUserProfile } from '../../../../types'
import useAuthStore from '../../../stores/auth.store'
import PostCard from '../../../components/SkinnyPostCard'
import { deletePost, getPosts, likePost, unlikePost } from '../../../lib/api/post.lib'
import PostCommentCard from '../../../components/PostCommentCard'
import { getPostComments } from '../../../lib/api/post.lib'
import HexShape from '../../../components/HexShape'

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
    const [comments, setComments] = useState<IPost[]>([]);

    const currentUserID = user?.id;
    const author: IUserProfile | null = route.params?.author ?? null;
    const {post} = route.params;

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
        const fetchComments = async () => {
            console.log('fetchComments function called');
            if (post && post.id !== undefined) {
                console.log('Post:', post);
                try {
                    console.log('Fetching comments for post ID:', post.id);
                    const response = await getPostComments(post.id);
                    console.log('Response:', response);
                    if (response && response.success) {
                        setComments(response.comments); // Set only the comments array
                    }
                } catch (error) {
                    console.error('Failed to fetch comments:', error);
                    setError(error.message || 'Failed to fetch comments');
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

    // useEffect(() => {
    //     const fetchComments = async () => {
    //         console.log('fetchComments function called');
    //         if (post && post.id !== undefined) {
    //             console.log('Post:', post);
    //             try {
    //                 console.log('Fetching comments for post ID:', post.id);
    //                 const response = await getPostComments(post.id);
    //                 console.log('Response:', response);
    //                 if (response && response.success) {
    //                     setComments(response.comments); // Set only the comments array
    //                 }
    //             } catch (error) {
    //                 console.error('Failed to fetch comments:', error);
    //                 setError(error.message || 'Failed to fetch comments');
    //             }
    //         } else {
    //             console.log('Post or post.id is not defined');
    //         }
    //     };

    //     if (post && post.id !== undefined) {
    //         fetchComments();
    //     }
    // }, [post]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const fetchedPosts = await getPosts();
                if (fetchedPosts) {
                    setPosts(fetchedPosts);
                    // Reset likedPosts state, as we cannot determine likes from fetched data
                    setLikedPosts(new Set());
                } else {
                    console.log('No posts fetched');
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setError(error.message || 'Failed to fetch posts');
            } finally {
                setLoading(false);
            }
        };

        const handleFocus = () => {
            // Add this code to fetch and refresh data when the screen gains focus
            fetchPosts();
        };

        // Add a listener for the focus event
        const unsubscribeFocus = navigation.addListener('focus', handleFocus);

        // Fetch data when the component mounts
        fetchPosts();

        // Cleanup the listener when the component unmounts
        return () => {
            unsubscribeFocus();
        };
    }, [navigation]); // Include 'navigation' as a dependency

    const handleDeletePost = async postId => {
        try {
            await deletePost(postId); // Call the API to delete the post
            // After successful deletion, navigate back to the CrummunityScreen
            navigation.navigate('CrummunityScreen');
        } catch (error) {
            console.error('Failed to delete the post:', error);
            // Optionally handle the error (e.g., show an error message)
        }
    };

    const handleCommentPress = postId => {
        const selectedPost = posts.find(post => post.id === postId);

        if (selectedPost) {
            navigation.navigate('PostScreen', {post: selectedPost});
        } else {
            // Handle the case when the post is not found
            console.error('Error: Post not found');
        }
    };

    const onLike = async postId => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        _count: {...post._count, likes: (post._count?.likes || 0) + 1},
                    };
                }
                return post;
            }),
        );
        try {
            await likePost(postId);
            setLikedPosts(prevLikedPosts => new Set(prevLikedPosts).add(postId));
        } catch (error) {
            // Revert the optimistic update in case of an error
            console.error('Error liking the post:', error);
            setPosts(prevPosts =>
                prevPosts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            _count: {...post._count, likes: Math.max(0, (post._count?.likes || 0) - 1)},
                        };
                    }
                    return post;
                }),
            );
        }
    };

    const onUnlike = async postId => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        _count: {...post._count, likes: Math.max(0, (post._count?.likes || 0) - 1)},
                    };
                }
                return post;
            }),
        );
        try {
            await unlikePost(postId);
            setLikedPosts(prevLikedPosts => {
                const updatedLikedPosts = new Set(prevLikedPosts);
                updatedLikedPosts.delete(postId);
                return updatedLikedPosts;
            });
        } catch (error) {
            // Revert the optimistic update in case of an error
            console.error('Error unliking the post:', error);
            setPosts(prevPosts =>
                prevPosts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            _count: {...post._count, likes: (post._count?.likes || 0) + 1},
                        };
                    }
                    return post;
                }),
            );
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
                            deleteThePost={() => handleDeletePost(post.id)}
                            onLike={onLike}
                            onUnlike={onUnlike}
                            // onFollow={() => handleFollow(item.author.id)}
                            // onUnfollow={() => handleUnfollow(item.author.id)}
                            isPostLiked={likedPosts.has(post.id)}
                        />
                    </View>
                    <View style={{marginBottom: '30%'}}>
                        <FlatList
                            data={comments}
                            style={styles.postcontainer}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item}) => (
                                <View style={{marginBottom: 10}}>
                                    <PostCommentCard
                                        post={item}
                                        openProfile={() =>
                                            navigation.navigate('ViewUserScreen', {userID: item.author?.id})
                                        }
                                        onLike={onLike}
                                        onUnlike={onUnlike}
                                        // onFollow={() => handleFollow(item.author.id)}
                                        // onUnfollow={() => handleUnfollow(item.author.id)}
                                        isPostLiked={likedPosts.has(item.id)}
                                        onDeletePost={handleDeletePost}
                                        currentUserID={currentUserID}
                                    />
                                </View>
                            )}
                        />
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