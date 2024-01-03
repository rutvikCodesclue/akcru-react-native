import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  ImageBackground,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import AkcruButtons from '../../../components/akcruButtons';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useNavigation} from '@react-navigation/native';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { getPosts, likePost, unlikePost } from '../../../lib/api/post.lib';
import { IPost, IUserProfile } from '../../../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import {followUser, unfollowUser} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';

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
    // const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handlePostPress = postId => {
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

const handleDeletePost = postId => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
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
                                    <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, marginRight: 10}}>
                                        Crummunity Feed
                                    </Text>
                                    <Icon
                                        name="account-group"
                                        type="material-community"
                                        color={COLORS.MIDORANGE}
                                        size={25}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{marginBottom: '30%'}}>
                            <FlatList
                                data={posts}
                                style={styles.postcontainer}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({item}) => (
                                    <Pressable onPress={() => handlePostPress(item.id)} style={{marginBottom: 10}}>
                                        <SkinnyPostCard
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
                                    </Pressable>
                                )}
                            />
                        </View>
                    </ScrollView>
                    <Pressable style={styles.floatingbutton} onPress={() => navigation.navigate('NewPost')}>
                        <Icon name="add" type="ionicon" color={COLORS.MIDORANGE} size={45} />
                    </Pressable>
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default CrummunityScreen;
