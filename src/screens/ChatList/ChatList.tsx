import React, {useState, useEffect} from 'react';
import {ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import useAuthStore from '../../stores/auth.store';
import Header from '../../components/header';
import UserCruChatCard from '../../components/UserCruChatCard';
import {getUsers} from '../../lib/api/rooms.lib'; // Ensure this fetches your chat users
import {IChatUser} from '../../../types';
import {COLORS, SIZES} from '../../../assets/constants';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import BackButton from '../../components/General/backbutton';

const ChatList = () => {
    const [chatUsersData, setChatUsersData] = useState<IChatUser[]>([]);
    const [isListLoaded, setIsListLoaded] = useState(false);
    const {user} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const response = await getUsers();
                if (response) {
                    setChatUsersData(response);
                    setIsListLoaded(true);

                    response.forEach(item => {
                        const movieScheduledTime = new Date(item.startDate).getTime();
                        const currentTime = new Date().getTime();

                        const threeHoursInMs = 3 * 60 * 60 * 1000;
                        const timeToRemove = movieScheduledTime + threeHoursInMs - currentTime;

                        if (timeToRemove > 0) {
                            const timeoutId = setTimeout(() => {
                                setChatUsersData(prevChatUsersData => prevChatUsersData.filter(u => u.id !== item.id));
                            }, timeToRemove);

                            return () => clearTimeout(timeoutId);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching chat users:', error);
            }
        };

        fetchChatUsers();
    }, []);

    const renderItem = ({item}: {item: IChatUser}) => {
        const isCurrentUserCreator = user?.id === item.creatorId;
        const receiverUserId = isCurrentUserCreator ? item.inviteeId : item.creatorId;
        const receiverProfilePicture = isCurrentUserCreator
            ? item.invitee?.profilePicture
            : item.creator?.profilePicture;
        const receiverUsername = isCurrentUserCreator ? item.invitee?.username : item.creator?.username;

        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('ViewChat', {
                        mItInviteId: item.id,
                        userId: receiverUserId,
                        profilePicture: receiverProfilePicture,
                        username: receiverUsername,
                    });
                }}
                style={{marginHorizontal: 10, marginBottom: 10}}>
                <UserCruChatCard
                    userID={item.id}
                    userName={receiverUsername}
                    movie={item.movie.title}
                    moviePoster={item.movie.landscapeURL}
                    CruChatDate={new Date(item.lastMessageAt).toLocaleDateString()}
                    CruChatTime={new Date(item.lastMessageAt).toLocaleTimeString()}
                    CRUChat={item.lastMessage}
                    avatarbordercolor={''}
                    userPicture={receiverProfilePicture}
                />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            {isListLoaded ? (
                <FlatList
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={
                        <View>
                            <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                                <Header />
                            </View>
                            <View
                                style={{
                                    marginBottom: 10,
                                    zIndex: 21,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingBottom: 10,
                                }}>
                                <BackButton navigation={navigation} />
                            </View>
                        </View>
                    }
                    ListFooterComponent={<View style={{height: SIZES.ScreenHeight * 0.1}} />}
                    data={chatUsersData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                />
            ) : (
                <View
                    style={{
                        height: SIZES.ScreenHeight,
                        width: SIZES.ScreenWidth,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                </View>
            )}
        </SafeAreaView>
    );
};

export default ChatList;
