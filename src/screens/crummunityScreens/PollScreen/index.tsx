import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, SafeAreaView, ScrollView, Pressable, ActivityIndicator} from 'react-native';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {StackNavigationProp} from '@react-navigation/stack';
import {IComment, IPoll} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {deletePoll, getPollById} from '../../../lib/api/poll.lib';
import PollCard from '../../../components/SkinnyPollCard';
import {selectAvatarBorderColor} from '../../../util/util';
import BackButton from '../../../components/General/backbutton';
import PollScreenCard from '../../../components/SkinnyPollCard';

type PollScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'PollScreen'>;
type PollScreenRouteProp = RouteProp<CrummunityStackParams, 'PollScreen'>;

type Props = {
    navigation: PollScreenNavigationProp;
    route: PollScreenRouteProp;
};

const PollScreen = ({navigation, route}: Props) => {
    const pollId = route.params?.poll.id;
    console.log('PollScreen pollId:', pollId);
    const isLikedByCurrentUser = route.params?.isLikedByCurrentUser;
    const {user} = useAuthStore();
    console.log('PollScreen user:', user);
    const [poll, setPoll] = useState<IPoll>({...route.params?.poll, isLikedByCurrentUser});
    console.log('PollScreen poll:', poll);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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


    useFocusEffect(
        useCallback(() => {
            fetchPollData();
        }, [fetchPollData]),
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
            // Implement the vote logic here
        } catch (error) {
            console.error('Error voting on poll:', error);
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
                            />
                        </View>
                    ) : (
                        <Text style={{...FONTS.Title2Orange}}>Error: Poll not found</Text>
                    )}
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default PollScreen;
