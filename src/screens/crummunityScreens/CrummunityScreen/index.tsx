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
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { deletePost, getPosts, likePost, unlikePost } from '../../../lib/api/post.lib';
import { IPost, IUserProfile } from '../../../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import {blockUser, findAUser, followUser, getBlockedUsers, getUserFollowing, unblockUser, unfollowUser} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import HexShape from '../../../components/HexShape';
import { toggleFollow } from '../../../lib/api/user.lib';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';

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

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [likedPosts, setLikedPosts] = useState(new Set());

    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [blockedUsers, setBlockedUsers] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh posts or update state here
        });

        return unsubscribe;
    }, [navigation]);

    const fetchPostsAndFollowStatus = async (pageNumber: number) => {
        setLoading(true);
        try {
            // Fetch posts
            const fetchedPosts = await getPosts(pageNumber);

            // Initialize sets for following and blocked user IDs
            let followingIds = new Set();
            let blockedUserIds = new Set();

            if (currentUserID) {
                // Fetch following status
                const followingResponse = await getUserFollowing(currentUserID);
                followingIds = new Set(followingResponse?.following.map((user: { id: any; }) => user.id));

                // Fetch blocked users status
                const blockedResponse = await getBlockedUsers(); // Assuming this function exists and returns a list of blocked user IDs
                blockedUserIds = new Set(blockedResponse.blockedUsers?.map(user => user.id));
            }

            // Update posts with isFollowed and isBlocked status
            const updatedPosts = fetchedPosts.map((post: { author: { id: unknown; }; }) => ({
                ...post,
                author: {
                    ...post.author,
                    isFollowed: followingIds.has(post.author.id),
                    isBlocked: blockedUserIds.has(post.author.id), // Add blocked status
                },
            }));

            if (pageNumber === 1) {
                setPosts(updatedPosts);
            } else {
                setPosts(prevPosts => [...prevPosts, ...updatedPosts]);
            }

            setHasMore(fetchedPosts.length === 10);
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to fetch posts or follow/block status:', error);
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
            setLoadingPosts(false);
        }
    };


    useEffect(() => {
        const handleFocus = () => {
            console.log('Screen gained focus');
            fetchPostsAndFollowStatus(1); // Fetch the first page of posts along with follow status
        };

        const unsubscribeFocus = navigation.addListener('focus', handleFocus);

        // Initial fetch
        fetchPostsAndFollowStatus(1);

        return () => {
            unsubscribeFocus();
            console.log('Screen lost focus');
        };
    }, [navigation, currentUserID]); // Depend on currentUserID to refetch if it changes

    const loadMorePosts = async () => {
        if (!hasMore) return; // Do nothing if there are no more posts to load

        setIsLoadingMore(true);
        // Use the modified function to fetch more posts along with follow status
        await fetchPostsAndFollowStatus(page + 1);
        setIsLoadingMore(false);
    };



    const handlePostPress = (postId: number) => {
        const selectedPost = posts.find(post => +post.id === postId);

        if (selectedPost) {
            navigation2.navigate('PostScreen', {post: selectedPost});
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

const handleFollow = async (authorId: any | IUserProfile, isCurrentlyFollowing: undefined) => {
    console.log('handleFollow', authorId);
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


    const handleReportUser = (author: IUserProfile) => {
        // Navigate to the report screen, passing the authorId
        navigation2.navigate('ReportUser', {
            authorId: author.id,
            authorUsername: author.username,
            authorFirstName: author.firstName,
            authorProfilePicture: author.profilePicture,
            authorBadge: author.badge,
        });
        console.log('Report user screen opened:', author);
    };


const [blockUserModal, setBlockUserModal] = useState(false);
const [modalType, setModalType] = useState('');
const [blockUserMessage, setBlockUserMessage] = useState('');
const [iconName, setIconName] = useState('');

const closeModal = () => {
    setBlockUserModal(false);
};


const handleToggleBlockUser = async authorId => {
    // Since you won't need to check for unblocking on this screen,
    // we directly proceed with the blocking logic
    let response = await blockUser(authorId);

    if (response.success) {
        // Update the blockedUsers state by adding the newly blocked user
        // Note: You might need to adjust this part depending on the structure of your `response`
        setBlockedUsers(prev => [...prev, {id: authorId}]);

        // Optionally, remove the blocked user's posts from the view
        setPosts(prevPosts => prevPosts.filter(post => post.author.id !== authorId));

        // Alert.alert('Success', 'User blocked successfully.');
        setModalType('success');
        setBlockUserMessage('User successfully blocked');
        setBlockUserModal(true);
        setIconName('hand-back-left');
    } else {
        // Handle the error case
        Alert.alert('Error', 'Failed to block user.');
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
                                                    navigation2.navigate('ViewUserScreen', {userID: item.author?.id})
                                                }
                                                // onFollow={() => handleFollow(item.author)}
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
                                                onFollow={() => handleFollow(item.author.id, item.author.isFollowed)}
                                                onBlockUser={() =>
                                                    handleToggleBlockUser(
                                                        item.author.id,
                                                        item.author.isCurrentlyBlocked,
                                                    )
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
                    <Pressable style={styles.floatingbutton} onPress={() => navigation2.navigate('NewPost')}>
                        <View style={{position: 'relative'}}>
                            <HexShape size={55} color={COLORS.AKCRUBLUE} />
                            <View style={{position: 'absolute', top: '5%', right: '6%'}}>
                                <Icon name="add" type="ionicon" color={COLORS.LIGHTGREY} size={45} />
                            </View>
                        </View>
                    </Pressable>
                </View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={blockUserModal}
                    onRequestClose={() => {
                        setBlockUserModal(!blockUserModal);
                    }}>
                    <BlockUserResultModal closeModal={closeModal} type={modalType} resultMessage={blockUserMessage} iconName={iconName} />
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
};

export default CrummunityScreen;
