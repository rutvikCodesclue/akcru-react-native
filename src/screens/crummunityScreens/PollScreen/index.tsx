import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, SafeAreaView, ScrollView, Pressable, ActivityIndicator, FlatList} from 'react-native';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {StackNavigationProp} from '@react-navigation/stack';
import {IComment, IPoll, IPollComment} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {
    deletePoll,
    getPollById,
    getPollComments,
    likePoll,
    likePollComment,
    unlikePoll,
    unlikePollComment,
    voteOnPoll,
} from '../../../lib/api/poll.lib';
import {selectAvatarBorderColor} from '../../../util/util';
import BackButton from '../../../components/General/backbutton';
import PollScreenCard from '../../../components/SkinnyPollCard';
import PollCommentCard from '../../../components/PollCommentCard';
import PostButton from '../../../components/AkcruPostButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';

type PollScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'PollScreen'>;
type PollScreenRouteProp = RouteProp<CrummunityStackParams, 'PollScreen'>;

type Props = {
    navigation: PollScreenNavigationProp;
    route: PollScreenRouteProp;
};

const PollScreen = ({navigation, route}: Props) => {
    const pollId = route.params?.poll.id;
    const isLikedByCurrentUser = route.params?.isLikedByCurrentUser;
    const {user} = useAuthStore();
    const [poll, setPoll] = useState<IPoll>({...route.params?.poll, isLikedByCurrentUser});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [comments, setComments] = useState<IPollComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [debounce, setDebounce] = useState(false);

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const currentUserID = user?.id;

    const fetchPollData = useCallback(async () => {
        if (pollId) {
            setLoading(true);
            try {
                const fetchedPoll = await getPollById(pollId);

                if (!fetchedPoll || !fetchedPoll.user) {
                    throw new Error('Incomplete poll data');
                }

                fetchedPoll.isLikedByCurrentUser = isLikedByCurrentUser;
                setPoll(fetchedPoll);
            } catch (error) {
                console.error('Failed to fetch poll:', error);
                setError(error.message || 'Failed to fetch poll');
            } finally {
                setLoading(false);
            }
        } else {
            console.log('Poll ID is not defined');
        }
    }, [pollId, isLikedByCurrentUser]);

    const fetchComments = useCallback(async () => {
        if (pollId) {
            setLoadingComments(true);
            try {
                const fetchedComments = await getPollComments(pollId);
                // Sort the comments from oldest to newest
                const sortedComments = fetchedComments.sort(
                    (a: IPollComment, b: IPollComment) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );

                setComments(sortedComments);
            } catch (error: any) {
                console.error('Failed to fetch comments:', error);
                setError(error.message || 'Failed to fetch comments');
            } finally {
                setLoadingComments(false);
            }
        }
    }, [pollId]);

    useFocusEffect(
        useCallback(() => {
            fetchPollData();
            fetchComments();
        }, [fetchPollData, fetchComments]),
    );

    const handleDeletePoll = async (pollId: string) => {
        try {
            await deletePoll(pollId);
            navigation.navigate('CrummunityScreen');
        } catch (error) {
            console.error('Error in deleting poll:', error);
        }
    };

    const onVote = async (pollId: string, choiceId: string) => {
        try {
            await voteOnPoll(pollId, choiceId);
            // Implement the vote logic here
        } catch (error) {
            console.error('Error voting on poll:', error);
        }
    };

    const handleLikeOrUnlike = async (pollId: string) => {
        if (debounce) return;

        setDebounce(true);

        try {
            let updatedPoll;
            if (poll.isLikedByCurrentUser) {
                await unlikePoll(pollId);
                updatedPoll = {
                    ...poll,
                    isLikedByCurrentUser: false,
                    likeCount: poll.likeCount - 1,
                };
            } else {
                await likePoll(pollId);
                updatedPoll = {
                    ...poll,
                    isLikedByCurrentUser: true,
                    likeCount: poll.likeCount + 1,
                };
            }
            setPoll(updatedPoll);
        } catch (error) {
            console.error('Failed to like/unlike poll:', error);
        } finally {
            setDebounce(false);
        }
    };

    if (!poll) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Text style={{...FONTS.Title2Orange}}>Error: Poll not found</Text>
            </View>
        );
    }

    const onLikeOrUnlikePollComment = async (commentId: string) => {
        try {
            const commentIndex = comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return;

            const comment = comments[commentIndex];
            const isLiked = comment.isLikedByCurrentUser;

            // Perform the like or unlike action
            if (isLiked) {
                await unlikePollComment(commentId); // Make sure this is awaited
            } else {
                await likePollComment(commentId); // Make sure this is awaited
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

    function handleEditComment(comment: IPollComment): void {
        navigation2.navigate('EditPollCommentScreen', {comment});
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
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.PINK} />
                    ) : poll && poll.user ? (
                        <View style={styles.postcontainer}>
                            <PollScreenCard
                                poll={poll}
                                openProfile={() => navigation.navigate('ViewUserScreen', {userID: poll.user.id})}
                                currentUserID={currentUserID || ''}
                                onDeletePoll={() => handleDeletePoll(poll.id)}
                                onVote={onVote}
                                akcruBadge={poll.user.badge}
                                akcruBadgeColor={selectAvatarBorderColor(poll.user.badge || 'AKCRUIT')}
                                profilePicture={poll.user.profilePicture}
                                onLikeOrUnlike={() => handleLikeOrUnlike(poll.id)}
                            />
                        </View>
                    ) : (
                        <Text style={{...FONTS.Title2Orange}}>Error: Poll not found</Text>
                    )}
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
                                        <PollCommentCard
                                            comment={item} // Ensure this prop is correctly named and passed
                                            openProfile={() =>
                                                navigation.navigate('ViewUserScreen', {userID: item.user?.id})
                                            }
                                            userName={item.user?.username}
                                            firstName={item.user?.firstName || ''}
                                            isCommentLiked={item.isLikedByCurrentUser}
                                            currentUserID={currentUserID || ''}
                                            akcruBadge={item.user?.badge}
                                            onLikeOrUnlike={() => onLikeOrUnlikePollComment(item.id)}
                                            likeCount={item?.likeCount || 0}
                                            isFollowing={item.user.isFollowed}
                                            akcruBadgeColor={selectAvatarBorderColor(item.user.badge ?? 'AKCRUIT')}
                                            onEditComment={() => handleEditComment(item)}
                                            isAdmin={user?.isAdmin || false}
                                        />
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </ScrollView>
                <View style={styles.floatingbuttonContainer}>
                    <PostButton onPress={() => navigation2.navigate('NewPollComment', {pollId: poll.id})} />
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default PollScreen;
