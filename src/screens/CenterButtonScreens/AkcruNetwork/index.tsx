import {SafeAreaView, StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import TabContainer from '../../../components/TabContainer/TabContainer';
import Header from '../../../components/header';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruButtonStackParams} from '../../../navigation/AkcruButtonStack';
import {getPostsByUser, likePost, unlikePost, deletePost} from '../../../lib/api/post.lib';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import AkcruNetworkPost from '../../../components/AkcruNetworkPost';
import LinearGradient from 'react-native-linear-gradient';

const userId = 'f35b2f80-9d35-47d5-9f80-48984308cb57';

const AkcruNetworkScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUserPosts(1);
    }, []);

    const fetchUserPosts = async (pageNumber: number) => {
        try {
            const fetchedPosts = await getPostsByUser(userId, pageNumber);
            if (pageNumber === 1) {
                setPosts(fetchedPosts);
            } else {
                setPosts(prevPosts => [...prevPosts, ...fetchedPosts]);
            }
            setHasMore(fetchedPosts.length === 10);
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to fetch user posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchUserPosts(page + 1);
        setIsLoadingMore(false);
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

    const handlePostPress = (postId: number) => {
        const selectedPost = posts.find(post => +post.id === postId);
        if (selectedPost) {
            navigation.navigate('PostScreen', {post: selectedPost});
        } else {
            console.error('Error: Post not found');
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUserPosts(1);
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
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>Akcru Network</Text>
                                <Text style={[styles.title2, {color: COLORS.PINK}]}>
                                    Connecting you to the pulse of AKCRU
                                </Text>
                                <CustomIcon
                                    name="bullhorn"
                                    type="material-community"
                                    color={COLORS.WHITE}
                                    baseSize={25}
                                    style={{marginVertical: 10}}
                                />
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
                                    keyExtractor={item => item.id.toString()}
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    renderItem={({item}) => (
                                        <Pressable style={{marginBottom: 10}}>
                                            <AkcruNetworkPost
                                                post={item}
                                                openProfile={() =>
                                                    navigation.navigate('ViewUserScreen', {userID: item.author?.id})
                                                }
                                                onDeletePost={() => deletePost(item.id)}
                                                currentUserID={userId}
                                                akcruBadge={item.author?.badge}
                                                isPostLiked={item.isLikedByCurrentUser}
                                                onLikeOrUnlike={() => likePost(item.id)}
                                                onUnlike={() => unlikePost(item.id)}
                                            />
                                        </Pressable>
                                    )}
                                    ListFooterComponent={() =>
                                        hasMore && isLoadingMore ? <ActivityIndicator color={COLORS.PINK} /> : null
                                    }
                                />
                            )}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default AkcruNetworkScreen;

const styles = StyleSheet.create({
    title: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '20%',
        alignSelf: 'center',
    },
    title2: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 0,
        alignSelf: 'center',
    },
    textcontainer: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        alignSelf: 'center',
        width: SIZES.ScreenWidth * 0.93,
        borderRadius: 5,
    },
    paragraph: {
        ...FONTS.Title2,
        fontSize: 12,
        textAlign: 'center',
    },
    noPostText: {
        ...FONTS.Title2,
        color: COLORS.DARKGREY,
        textAlign: 'center',
        marginTop: '20%',
    },

    postcontainer: {
        width: SIZES.ScreenWidth * 0.93,
        alignSelf: 'center',
        marginBottom: 5,
    },
});
