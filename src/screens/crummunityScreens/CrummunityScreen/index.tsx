import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useNavigation} from '@react-navigation/native';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { deletePost, getPosts, likePost, unlikePost } from '../../../lib/api/post.lib';
import { IPost, IUserProfile } from '../../../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import {followUser, unfollowUser} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import HexShape from '../../../components/HexShape';

type CrummunityScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'ViewUserScreen'>;

type CrummunityScreenRouteProp = RouteProp<CrummunityStackParams, 'ViewUserScreen'>;

type Props = {
    navigation: CrummunityScreenNavigationProp;
    route: CrummunityScreenRouteProp;
};


const CrummunityScreen = ({navigation, route}: Props) => {
    const {user, hydrateUser} = useAuthStore();
    // console.log('user', user?.username);
    const currentUserID = user?.id;
    const author: IPost | null = route.params?.author ?? null;

    const [likedPosts, setLikedPosts] = useState(new Set());

    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh posts or update state here
        });

        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const fetchedPosts = await getPosts(1); // Fetch the first page
    
                if (fetchedPosts && fetchedPosts.length > 0) {
                    setPosts(fetchedPosts);
                    setHasMore(fetchedPosts.length === 10); // Assuming 10 posts per page
                    setPage(1);
                    const newLikedPosts = new Set();
                    fetchedPosts.forEach(post => {
                        if (post.isLikedCurrentUser) {
                            newLikedPosts.add(post.id);
                        }
                    });
                    setLikedPosts(newLikedPosts);
                } else {
                    console.log('No posts fetched');
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setError(error.message || 'Failed to fetch posts');
            } finally {
                setLoading(false);
                setLoadingPosts(false);
            }
        };

        const handleFocus = () => {
            console.log('Screen gained focus');
            fetchPosts(); // Call fetchPosts when screen gains focus
        };

        const unsubscribeFocus = navigation.addListener('focus', handleFocus);

        fetchPosts(); // Initial fetch

        return () => {
            unsubscribeFocus();
            console.log('Screen lost focus');
        };
    }, [navigation, currentUserID]);


    const loadMorePosts = async () => {
        if (!hasMore) return; // Do nothing if there are no more posts to load

        setIsLoadingMore(true);
        try {
            const additionalPosts = await getPosts(page + 1);
            if (additionalPosts.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...additionalPosts]);
                setPage(page + 1); // Increment the page number
            } else {
                setHasMore(false); // No more posts to load
            }
        } catch (error) {
            console.error('Failed to load more posts:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handlePostPress = (postId: number) => {
        const selectedPost = posts.find(post => +post.id === postId);

        if (selectedPost) {
            navigation.navigate('PostScreen', {post: selectedPost});
        } else {
            // Handle the case when the post is not found
            console.error('Error: Post not found');
        }
    };

    

const onLikeOrUnlike = async (postId: number) => {
    try {
        // Find the post in the current state
        const postIndex = posts.findIndex(post => +post.id === postId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const isLiked = post.isLikedByCurrentUser;

        // Perform the like or unlike action
        if (isLiked) {
            await unlikePost(postId);
        } else {
            await likePost(postId);
        }

        // Optimistically update the UI
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
        // Optionally handle reversion or user notification here
    }
};

const handleDeletePost = async (postId: number) => {
    // Find the post in the current state
    const postIndex = posts.findIndex(post => +post.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];

    try {
        // If the post is liked by the current user, unlike it first
        if (post.isLikedByCurrentUser) {
            await unlikePost(postId);
        }

        // Proceed to delete the post
        await deletePost(postId);

        // Update the local state to remove the post
        setPosts(prevPosts => prevPosts.filter(post => +post.id !== postId));
    } catch (error) {
        console.error('Error in deleting post:', error);
        // Handle error (e.g., show a message to the user)
    }
};

    // Function to handle follow action
    const handleFollow = async (userId: string) => {
        try {
            const success = await followUser({userId});
            if (success) {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.author.id === userId ? {...post, author: {...post.author, isFollowed: true}} : post,
                    ),
                );
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    // Function to handle unfollow action
    const handleUnfollow = async (userId: string) => {
        try {
            const success = await unfollowUser({userId});
            if (success) {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.author.id === userId ? {...post, author: {...post.author, isFollowed: false}} : post,
                    ),
                );
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    return (
        <TabContainer>
            <SafeAreaView>
                <View>
                    <ScrollView stickyHeaderIndices={[0]} style={{height: SIZES.ScreenHeight}}>
                        <View>
                            <View style={{zIndex: 100}}>
                                <Header />
                            </View>
                            <View
                                style={{
                                    height: SIZES.ScreenHeight * 0.26,
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
                                        height: SIZES.ScreenHeight * 0.26,
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
                                                size={28}
                                                style={{marginRight: 10}}
                                            />
                                            <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Search users</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE, marginRight: 10}}>
                                        Crummunity Feed
                                    </Text>
                                    <Icon
                                        name="account-group"
                                        type="material-community"
                                        color={COLORS.AKCRUBLUE}
                                        size={25}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{marginBottom: '30%'}}>
                            {loadingPosts ? (
                                <View style={{marginTop: '25%'}}>
                                    <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                                </View>
                            ) : // You can customize the size and color
                            posts.length === 0 ? (
                                <View>
                                    <Text style={styles.noPostText}>No Post yet</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={posts}
                                    style={styles.postcontainer}
                                    keyExtractor={item => item.id}
                                    renderItem={({item}) => (
                                        <Pressable onPress={() => handlePostPress(+item.id)} style={{marginBottom: 10}}>
                                            <SkinnyPostCard
                                                post={item}
                                                openProfile={() =>
                                                    navigation.navigate('ViewUserScreen', {userID: item.author?.id})
                                                }
                                                // onLike={onLike}
                                                // onUnlike={onUnlike}
                                                // onFollow={() => handleFollow(item.author.id)}
                                                // onUnfollow={() => handleUnfollow(item.author.id)}
                                                onDeletePost={handleDeletePost}
                                                currentUserID={currentUserID || ''}
                                                akcruBadge={item.author?.badge}
                                                isPostLiked={item.isLikedByCurrentUser}
                                                onLikeOrUnlike={() => onLikeOrUnlike(+item.id)}
                                                CommentOnPostButton={() =>
                                                    navigation.navigate('NewComment', {postId: item.id})
                                                }
                                            />
                                        </Pressable>
                                    )}
                                    ListFooterComponent={() =>
                                        hasMore ? (
                                            <TouchableOpacity onPress={loadMorePosts}>
                                                {isLoadingMore ? (
                                                    <ActivityIndicator color={COLORS.MIDORANGE} />
                                                ) : (
                                                    <Text
                                                        style={{
                                                            textAlign: 'center',
                                                            margin: 10,
                                                            ...FONTS.Title2,
                                                            color: COLORS.MIDORANGE,
                                                        }}>
                                                        Load More
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        ) : null
                                    }
                                />
                            )}
                        </View>
                    </ScrollView>
                    <Pressable style={styles.floatingbutton} onPress={() => navigation.navigate('NewPost')}>
                        <View style={{position: 'relative'}}>
                            <HexShape size={55} color={COLORS.AKCRUBLUE} />
                            <View style={{position: 'absolute', top: '5%', right: '6%'}}>
                                <Icon name="add" type="ionicon" color={COLORS.LIGHTGREY} size={45} />
                            </View>
                        </View>
                    </Pressable>
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default CrummunityScreen;
