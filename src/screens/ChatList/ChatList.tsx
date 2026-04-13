import React, {useState, useEffect} from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
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
import {useHideBottomTabBarWhileFocused} from '../ChatScreens/useHideBottomTabBarWhileFocused';
import {Icon} from '@rneui/base';
import HexAvatar from '../../components/HexAvatar';
import {selectAvatarBorderColor} from '../../util/util';
import {BlurView} from '@react-native-community/blur';

const ChatList = () => {
    const [chatUsersData, setChatUsersData] = useState<IChatUser[]>([]);
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const {user} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        navigation.navigate('ClientTabNavigator', {screen: 'CrummunityStack'});
    };

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

    const getReceiverInfo = (item: IChatUser) => {
        const isCurrentUserCreator = user?.id === item.creatorId;
        const receiverUserId = isCurrentUserCreator ? item.inviteeId : item.creatorId;
        const receiver = isCurrentUserCreator ? item.invitee : item.creator;
        return {receiverUserId, receiver};
    };

    const filteredChatUsers = chatUsersData.filter(item => {
        const {receiver} = getReceiverInfo(item);
        const receiverUsername = receiver?.username ?? '';
        const lastMessage = item.lastMessage ?? '';
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return true;
        }
        return receiverUsername.toLowerCase().includes(query) || lastMessage.toLowerCase().includes(query);
    });

    const renderItem = ({item, index}: {item: IChatUser; index: number}) => {
        const {receiverUserId, receiver} = getReceiverInfo(item);
        const receiverProfilePicture = receiver?.profilePicture;
        const receiverUsername = receiver?.username ?? 'User';
        const isLastRow = index === filteredChatUsers.length - 1;
        const lastAt = item.lastMessageAt ? new Date(item.lastMessageAt) : null;
        const timeLabel =
            lastAt != null && !Number.isNaN(lastAt.getTime())
                ? lastAt
                      .toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit', hour12: true})
                      .toLowerCase()
                : '';

        return (
            <View style={[styles.chatPanelBody, isLastRow && styles.chatPanelBodyLast]}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={5}
                    reducedTransparencyFallbackColor="rgba(28,30,72,0.55)"
                />
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('ViewChat', {
                            mItInviteId: item.id,
                            userId: receiverUserId,
                            profilePicture: receiverProfilePicture ?? '',
                            username: receiverUsername,
                        });
                    }}
                    style={styles.chatCardTouch}>
                    <UserCruChatCard
                        userName={receiverUsername}
                        movie={item.movie?.title ?? ''}
                        moviePoster={item.movie?.landscapeURL}
                        CruChatDate={lastAt ? lastAt.toLocaleDateString() : ''}
                        CruChatTime={timeLabel}
                        CRUChat={item.lastMessage}
                        userPicture={receiverProfilePicture}
                        badge={receiver?.badge}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground style={{flex: 1}} source={imageindex.FLickFlirt} resizeMode="cover">
                <LinearGradient
                    colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView style={{flex: 1}}>
                    {isListLoaded ? (
                        <View style={styles.screenContainer}>
                            <View style={styles.headerContainer}>
                                <View style={{zIndex: 20, backgroundColor: 'transparent'}}>
                                    <Header />
                                </View>
                                <View
                                    style={{
                                        marginBottom: 10,
                                        zIndex: 21,
                                        backgroundColor: 'transparent',
                                        paddingBottom: 10,
                                    }}>
                                    <BackButton navigation={navigation} onBack={handleBackPress} />
                                </View>
                                <View style={styles.searchWrap}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <View style={styles.searchRow}>
                                        <Icon
                                            name="search"
                                            type="ionicon"
                                            size={20}
                                            color={COLORS.LIGHTGREY}
                                            style={{marginRight: 8}}
                                        />
                                        <TextInput
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            placeholder="Search"
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.searchInput}
                                        />
                                    </View>
                                </View>
                                <FlatList
                                    horizontal
                                    data={filteredChatUsers}
                                    keyExtractor={item => `avatar-${item.id}`}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.avatarList}
                                    renderItem={({item}) => {
                                        const {receiverUserId, receiver} = getReceiverInfo(item);
                                        const receiverName = receiver?.username ?? 'User';
                                        return (
                                            <TouchableOpacity
                                                style={styles.avatarItem}
                                                onPress={() =>
                                                    navigation.navigate('ViewChat', {
                                                        mItInviteId: item.id,
                                                        userId: receiverUserId,
                                                        profilePicture: receiver?.profilePicture ?? '',
                                                        username: receiverName,
                                                    })
                                                }>
                                                <HexAvatar
                                                    source={{uri: receiver?.profilePicture}}
                                                    size={52}
                                                    bordercolor={selectAvatarBorderColor(receiver?.badge ?? 'AKCRUIT')}
                                                />
                                                <Text style={styles.avatarName} numberOfLines={1}>
                                                    {receiverName}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </View>

                            <View style={styles.chatPanelContainer}>
                                <View style={styles.chatPanel}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={5}
                                        reducedTransparencyFallbackColor="rgba(28,30,72,0.55)"
                                    />
                                    <Text style={styles.chatPanelTitle}>MIT Chats</Text>
                                </View>
                                {chatUsersData.length === 0 ? (
                                    <View style={styles.emptyChatState}>
                                        <Text style={styles.emptyChatTitle}>No chats yet</Text>
                                        <Text style={styles.emptyChatSubtitle}>
                                            Start a movie invite to begin your first MIT chat.
                                        </Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        style={styles.chatList}
                                        contentContainerStyle={styles.chatListContent}
                                        data={filteredChatUsers}
                                        keyExtractor={item => item.id}
                                        renderItem={renderItem}
                                        showsVerticalScrollIndicator={false}
                                        bounces={false}
                                        overScrollMode="never"
                                        nestedScrollEnabled
                                    />
                                )}
                            </View>
                        </View>
                    ) : (
                        <View
                            style={{
                                flex: 1,
                                width: SIZES.ScreenWidth,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <ActivityIndicator size="large" color={COLORS.CATPURPLGT} />
                        </View>
                    )}
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 10,
    },
    searchWrap: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        overflow: 'hidden',
        marginVertical: 8,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: {
        flex: 1,
        color: COLORS.WHITE,
        fontSize: 14,
    },
    avatarList: {
        paddingVertical: 6,
        paddingRight: 8,
    },
    avatarItem: {
        width: 70,
        marginRight: 8,
        alignItems: 'center',
    },
    avatarName: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        marginTop: 4,
    },
    chatPanel: {
        overflow: 'hidden',
        position: 'relative',
        borderBottomWidth: 0,
        borderColor: 'rgba(255,255,255,0.24)',
        backgroundColor: 'rgba(62,70,130,0.22)',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    chatPanelContainer: {
        flex: 1,
        minHeight: 0,
        marginTop: 10,
        marginHorizontal: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        backgroundColor: 'rgba(62,70,130,0.22)',
    },
    chatList: {
        flex: 1,
        minHeight: 0,
    },
    chatListContent: {
        paddingBottom: SIZES.ScreenHeight * 0.16,
    },
    chatPanelBody: {
        width: '100%',
        alignSelf: 'stretch',
        overflow: 'hidden',
        position: 'relative',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        backgroundColor: 'rgba(62,70,130,0.22)',
    },
    chatPanelBodyLast: {
        borderBottomWidth: 1,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingBottom: 8,
    },
    chatPanelTitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 32 / 2,
        fontWeight: '600',
    },
    chatCardTouch: {
        width: '100%',
        marginHorizontal: 0,
        marginTop: 8,
        marginBottom: 8,
    },
    emptyChatState: {
        flex: 1,
        minHeight: 180,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyChatTitle: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyChatSubtitle: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default ChatList;
