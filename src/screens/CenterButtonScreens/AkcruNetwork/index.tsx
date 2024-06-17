import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TabContainer from '../../../components/TabContainer/TabContainer';
import Header from '../../../components/header';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruButtonStackParams} from '../../../navigation/AkcruButtonStack';
import {getPostsByUser, likePost, unlikePost, deletePost} from '../../../lib/api/post.lib';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import BackButton from '../../../components/General/backbutton';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import AkcruNetworkPost from '../../../components/AkcruNetworkPost';

const userId = 'f35b2f80-9d35-47d5-9f80-48984308cb57';

const AkcruNetworkScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchUserPosts(1);
    }, []);

    const fetchUserPosts = async (pageNumber: number) => {
        setLoadingPosts(true);
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
            setIsLoadingMore(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchUserPosts(page + 1);
    };

    const handlePostPress = (postId: number) => {
        const selectedPost = posts.find(post => +post.id === postId);
        if (selectedPost) {
            navigation.navigate('PostScreen', {post: selectedPost});
        } else {
            console.error('Error: Post not found');
        }
    };

    const renderFooterComponent = () => {
        if (isLoadingMore) {
            return <ActivityIndicator color={COLORS.PINK} />;
        }
        return null;
    };

    return (
        <TabContainer>
            <View>
                <SafeAreaView>
                    <Header />
                    {/* <BackButton navigation={navigation} /> */}
                    <View style={{justifyContent: 'center'}}>
                        <View style={styles.textcontainer}>
                            <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>"Akcru Network"</Text>
                            <Text style={[styles.title, {color: COLORS.PINK}]}>
                                Connecting you to the Pulse of Akcru
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
                    {loadingPosts ? (
                        <ActivityIndicator size="large" color={COLORS.PINK} />
                    ) : posts.length === 0 ? (
                        <Text style={styles.noPostText}>No Post yet</Text>
                    ) : (
                        <FlatList
                            data={posts}
                            keyExtractor={item => item.id.toString()}
                            style={styles.postcontainer}
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
                            onEndReached={loadMorePosts}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooterComponent}
                            contentContainerStyle={{paddingBottom: 20}}
                        />
                    )}
                </SafeAreaView>
            </View>
        </TabContainer>
    );
};

export default AkcruNetworkScreen;

const styles = StyleSheet.create({
    title: {
        ...FONTS.Title3,
        textAlign: 'center',
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
