import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, SafeAreaView, ScrollView, ActivityIndicator, Platform, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styles from './styles';
import {COLORS, FONTS, isTablet, SIZES} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {StackNavigationProp} from '@react-navigation/stack';
import {IComment, IPoll, IPollComment} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {
    commentOnPoll,
    deletePoll,
    deletePollComment,
    getPollById,
    getPollComments,
    likePoll,
    likePollComment,
    unlikePoll,
    unlikePollComment,
    voteOnPoll,
} from '../../../lib/api/poll.lib';
import {blockUser, toggleFollow} from '../../../lib/api/user.lib';
import {selectAvatarBorderColor} from '../../../util/util';
import BackButton from '../../../components/General/backbutton';
import PollCard from '../../../components/SkinnyPollCard';
import PostCommentCard from '../../../components/PostCommentCard';
import PostButton from '../../../components/AkcruPostButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {emitFeedPollRefresh} from '../../../util/feedRefreshEvents';
import {navigateToReportUser} from '../../../util/RootNavigation';

type PollScreenNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'PollScreen'>;
type PollScreenRouteProp = RouteProp<NoBottomTabStackParams, 'PollScreen'>;

type Props = {
    navigation: PollScreenNavigationProp;
    route: PollScreenRouteProp;
};

const PollScreen = ({navigation, route}: Props) => {
    const resolvedPollId = useMemo(() => {
        const raw = route.params?.pollId ?? route.params?.poll?.id;
        return raw != null ? String(raw) : undefined;
    }, [route.params?.pollId, route.params?.poll?.id]);
    const {user} = useAuthStore();
    const [poll, setPoll] = useState<IPoll | undefined>(route.params?.poll);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [comments, setComments] = useState<IPollComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [debounce, setDebounce] = useState(false);
    const [commentDraft, setCommentDraft] = useState('');
    const [isCommentSending, setIsCommentSending] = useState(false);

    const navigation2 = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const insets = useSafeAreaInsets();
    const scrollBottomPadding = Math.max(88, insets.bottom + 72);

    const currentUserID = user?.id;

    const fetchPollData = useCallback(async () => {
        if (!resolvedPollId) {
            setError('Poll ID is not defined');
            return;
        }

        setLoading(true);
        try {
            const fetchedPoll = await getPollById(resolvedPollId);

            if (!fetchedPoll || !fetchedPoll.user) {
                throw new Error('Incomplete poll data');
            }

            setPoll(fetchedPoll);
        } catch (fetchError: unknown) {
            const message = fetchError instanceof Error ? fetchError.message : 'Failed to fetch poll';
            console.error('Failed to fetch poll:', fetchError);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [resolvedPollId]);

    const fetchComments = useCallback(async () => {
        if (resolvedPollId) {
            setLoadingComments(true);
            try {
                const fetchedComments = await getPollComments(resolvedPollId);
                // Sort the comments from oldest to newest
                const sortedComments = fetchedComments.sort(
                    (a: IPollComment, b: IPollComment) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );

                setComments(sortedComments);
            } catch (fetchError: unknown) {
                const message =
                    fetchError instanceof Error ? fetchError.message : 'Failed to fetch comments';
                console.error('Failed to fetch comments:', fetchError);
                setError(message);
            } finally {
                setLoadingComments(false);
            }
        }
    }, [resolvedPollId]);

    const loadScreenData = useCallback(async () => {
        await fetchPollData();
        await fetchComments();
    }, [fetchPollData, fetchComments]);

    useFocusEffect(
        useCallback(() => {
            void loadScreenData();
        }, [loadScreenData]),
    );

    useEffect(() => {
        if (route.params?.poll) {
            setPoll(route.params.poll);
        }
        setComments([]);
        setCommentDraft('');
        setError('');
    }, [resolvedPollId, route.params?.poll]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            if (resolvedPollId) {
                emitFeedPollRefresh(resolvedPollId);
            }
        });
        return unsubscribe;
    }, [navigation, resolvedPollId]);

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
            const isLiked = poll?.isLikedByCurrentUser;

            if (isLiked) {
                await unlikePoll(pollId);
            } else {
                await likePoll(pollId);
            }

            if (poll) {
                setPoll(prevPoll => ({
                    ...prevPoll,
                    isLikedByCurrentUser: !isLiked,
                    _count: {
                        ...prevPoll._count,
                        pollLikes: prevPoll._count.pollLikes + (isLiked ? -1 : 1),
                    },
                }));
            }
        } catch (error) {
            console.error('Failed to like/unlike poll:', error);
            setError(error.message || 'Failed to like/unlike the post');
        } finally {
            setTimeout(() => {
                setDebounce(false);
            }, 2000);
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
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : 'Failed to update comment reaction.';
            Alert.alert('Action Failed', message);
        }
    };

    function handleEditComment(comment: IPollComment): void {
        navigation2.navigate('EditPollCommentScreen', {comment});
    }

    const handleSendComment = async () => {
        const trimmedComment = commentDraft.trim();
        if (!trimmedComment || isCommentSending || !poll?.id) {
            return;
        }
        setIsCommentSending(true);
        try {
            await commentOnPoll(poll.id, 'POLL', [trimmedComment]);
            setCommentDraft('');
            await fetchComments();
            setPoll(prev =>
                prev
                    ? {
                          ...prev,
                          _count: {
                              ...(prev._count ?? {comments: 0, pollLikes: 0, reposts: 0}),
                              comments: (prev._count?.comments ?? 0) + 1,
                          },
                      }
                    : prev,
            );
        } catch (error) {
            console.error('Failed to comment on poll:', error);
        } finally {
            setIsCommentSending(false);
        }
    };

    const handleToggleFollowForCommentUser = async (commentId: string, authorId?: string) => {
        if (!authorId) return;
        try {
            const updatedStatus = await toggleFollow(authorId);
            if (!updatedStatus?.success) {
                Alert.alert('Action Failed', updatedStatus?.message || 'Failed to update follow status.');
                return;
            }
            setComments(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? {
                              ...comment,
                              user: {
                                  ...comment.user,
                                  isFollowed: updatedStatus.isFollowing,
                              },
                          }
                        : comment,
                ),
            );
        } catch (error) {
            console.error('Failed to toggle follow status for poll comment user:', error);
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : 'Failed to update follow status.';
            Alert.alert('Action Failed', message);
        }
    };

    const handleToggleFollowPollAuthor = async () => {
        const authorId = poll?.user?.id;
        if (!authorId || !poll?.user) {
            return;
        }
        const isCurrentlyFollowing = !!poll.user.isFollowed;
        try {
            const updatedStatus = await toggleFollow(authorId);
            if (!updatedStatus?.success) {
                Alert.alert('Action Failed', updatedStatus?.message || 'Failed to update follow status.');
                return;
            }
            setPoll(prev =>
                prev
                    ? {
                          ...prev,
                          user: {
                              ...prev.user,
                              isFollowed: !isCurrentlyFollowing,
                          },
                      }
                    : prev,
            );
        } catch (error) {
            console.error('Failed to toggle follow status for poll author:', error);
        }
    };

    const handleReportPollAuthor = () => {
        if (!poll?.user?.id) {
            return;
        }
        navigateToReportUser({
            authorId: poll.user.id,
            authorUsername: poll.user.username,
            authorFirstName: poll.user.firstName,
            authorProfilePicture: poll.user.profilePicture,
            authorBadge: poll.user.badge,
        });
    };

    const handleBlockPollAuthor = async () => {
        if (!poll?.user?.id) {
            return;
        }
        try {
            const result = await blockUser(poll.user.id);
            if (!result?.success) {
                Alert.alert('Block User Failed', result?.message || 'Failed to block user.');
                return;
            }
            if (resolvedPollId) {
                emitFeedPollRefresh(resolvedPollId);
            }
            navigation.goBack();
        } catch (error) {
            console.error('Failed to block poll author:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deletePollComment(commentId);
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            setPoll(prev =>
                prev
                    ? {
                          ...prev,
                          _count: {
                              ...(prev._count ?? {comments: 0, pollLikes: 0, reposts: 0}),
                              comments: Math.max(0, (prev._count?.comments ?? 0) - 1),
                          },
                      }
                    : prev,
            );
            if (resolvedPollId) {
                emitFeedPollRefresh(resolvedPollId);
            }
        } catch (error) {
            console.error('Failed to delete poll comment:', error);
            const message =
                error instanceof Error && error.message
                    ? error.message
                    : 'Failed to delete poll comment';
            Alert.alert('Delete Comment Failed', message);
        }
    };

    const handleBlockCommentUser = async (commentId: string, authorId?: string) => {
        if (!authorId) return;
        try {
            const result = await blockUser(authorId);
            if (!result?.success) {
                Alert.alert('Block User Failed', result?.message || 'Failed to block user.');
                return;
            }
            if (resolvedPollId) {
                emitFeedPollRefresh(resolvedPollId);
            }
            navigation.goBack();
        } catch (error) {
            console.error('Failed to block user from poll comment card action:', error);
        }
    };

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1, backgroundColor: '#050508'}}>
                <View style={{flex: 1, backgroundColor: '#050508'}}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    style={{flex: 1, backgroundColor: '#050508'}}
                    contentContainerStyle={{paddingBottom: scrollBottomPadding}}
                    showsVerticalScrollIndicator={false}>
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
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.PINK} />
                    ) : poll && poll.user ? (
                        <View style={styles.postcontainer}>
                            <PollCard
                                poll={poll}
                                openProfile={() => navigation.navigate('ViewUserScreen', {userID: poll.user.id})}
                                currentUserID={currentUserID || ''}
                                onDeletePoll={() => handleDeletePoll(poll.id)}
                                onVote={onVote}
                                akcruBadge={poll.user.badge}
                                akcruBadgeColor={selectAvatarBorderColor(poll.user.badge || 'AKCRUIT')}
                                profilePicture={poll.user.profilePicture}
                                onLikeOrUnlike={() => handleLikeOrUnlike(poll.id)}
                                commentInputValue={commentDraft}
                                onCommentInputChange={setCommentDraft}
                                onCommentSend={handleSendComment}
                                isCommentSending={isCommentSending}
                                onFollow={handleToggleFollowPollAuthor}
                                isFollowing={!!poll.user.isFollowed}
                                reportUser={handleReportPollAuthor}
                                onBlockUser={handleBlockPollAuthor}
                            />
                        </View>
                    ) : (
                        <Text style={{...FONTS.Title2Orange}}>Error: Poll not found</Text>
                    )}
                    <View style={styles.commentsSection}>
                        {loadingComments ? (
                            <View style={styles.commentsLoader}>
                                <ActivityIndicator size="large" color="#9b59b6" />
                            </View>
                        ) : comments.length === 0 ? (
                            <View>
                                <Text style={[styles.noCommentsText, {color: COLORS.OVERLAY_WHITE_45}]}>
                                    No comments yet
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.postcontainer}>
                                {comments.map(item => (
                                    <View key={item.id} style={{marginBottom: 10}}>
                                        <PostCommentCard
                                            post={{
                                                id: item.id,
                                                content: item.content,
                                                author: item.user,
                                                createdAt: item.createdAt,
                                                updatedAt: item.updatedAt,
                                                edited: item.edited ?? false,
                                                editedText: item.editedText ?? '',
                                                isLikedByCurrentUser: item.isLikedByCurrentUser ?? false,
                                            }}
                                            comment={item}
                                            openProfile={() =>
                                                navigation.navigate('ViewUserScreen', {userID: item.user?.id})
                                            }
                                            userName={item.user?.username}
                                            firstName={item.user?.firstName || ''}
                                            currentUserID={currentUserID || ''}
                                            akcruBadge={item.user?.badge}
                                            onLikeOrUnlike={() => onLikeOrUnlikePollComment(item.id)}
                                            likeCount={item?.likeCount || 0}
                                            isFollowing={item.user.isFollowed}
                                            akcruBadgeColor={selectAvatarBorderColor(item.user.badge ?? 'AKCRUIT')}
                                            onEditComment={() => handleEditComment(item)}
                                            isAdmin={user?.isAdmin || false}
                                            onFollow={() => handleToggleFollowForCommentUser(item.id, item.user?.id)}
                                            onUnfollow={() => handleToggleFollowForCommentUser(item.id, item.user?.id)}
                                            onDeleteComment={() => handleDeleteComment(item.id)}
                                            CommentOnPostButton={() => {}}
                                            handleDeletePost={() => {}}
                                            onBlockUser={() => handleBlockCommentUser(item.id, item.user?.id)}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
                {poll?.id ? (
                    <View
                        style={[styles.floatingbutton, {paddingBottom: Math.max(12, insets.bottom)}]}
                        pointerEvents="box-none">
                        <PostButton
                            isSending={isCommentSending}
                            onPress={() => navigation2.navigate('NewPollComment', {pollId: poll.id})}
                        />
                    </View>
                ) : null}
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default PollScreen;
