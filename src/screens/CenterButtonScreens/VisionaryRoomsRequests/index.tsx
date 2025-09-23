import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    Pressable,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
    Modal,
} from 'react-native';
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
import {IMovie, IUserProfile} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {capitalizeFirstLetterOfString, formatMovieDuration} from '../../../util/util';
import {ClientStackParams} from '../../../navigation/ClientStack';
import UserDatesCard from '../../../components/UserDateCard';
import { Icon } from '@rneui/base';
import { getPendingResponseRooms, getPendingRooms } from '../../../lib/api/visionary.lib';
import RoomCard from './RoomCard';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';

type VisionaryRoom = {
    id: string;
    movieId: string;
    movie: IMovie;
    startDate: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
    hostId: string;
    creator?: IUserProfile;
    invitees: IUserProfile[];
    status: string;
};

const VisionaryRoomsRequests = () => {
    const AKCRUButtonNav = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
    const clientStackNav = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    const noBottomStackNav = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const {user} = useAuthStore();

    const [rooms, setRooms] = useState<VisionaryRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceMessage, setAtttendanceMessage] = useState('');

    useEffect(() => {
        fetchPendingVisionaryRooms();
    }, []);

    const fetchPendingVisionaryRooms = async () => {
            setLoadingRooms(true);
            try {
                const pendingRoomsResponse = await getPendingRooms();

                if (pendingRoomsResponse && pendingRoomsResponse.status === 200) {
                    setRooms(pendingRoomsResponse.data.rooms);
                } else {
                    setRooms([]);
                }
            } catch (error) {
                console.error('Failed to fetch pending rooms:', error);
            } finally {
                setLoadingRooms(false);
            }
    };

    const handleInviterPress = (creatorId: string) => {
        clientStackNav.navigate('ViewUserScreen', {userID: creatorId});
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPendingVisionaryRooms();
        setRefreshing(false);
    };

    const handleViewRequest = async (room: VisionaryRoom) => {
        noBottomStackNav.navigate('VisionaryRoomRequest', {room})
    };

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <ScrollView
                        stickyHeaderIndices={[0]}
                        style={{height: SIZES.ScreenHeight}}
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
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>Visionary Rooms</Text>
                            </View>
                        </View>
                        <View style={{marginBottom: '23%'}}>
                            {loadingRooms ? (
                                <View style={{marginTop: '25%'}}>
                                    <ActivityIndicator size="large" color={COLORS.PINK} />
                                </View>
                            ) : rooms.length === 0 ? (
                                <View>
                                    <Text style={styles.noPostText}>No Visionary Rooms found yet</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={rooms}
                                    style={styles.postcontainer}
                                    keyExtractor={item => item.id.toString()}
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    renderItem={({item}) => (
                                            <RoomCard
                                                movieId={item.movie.id}
                                                moviePoster={item.movie.portraitURL}
                                                movieName={item.movie.title}
                                                length={formatMovieDuration(item.movie.duration)}
                                                movieYear={item.movie.year}
                                                movieRated={item.movie.rated}
                                                movieGenre={capitalizeFirstLetterOfString(item.movie.genres[0])}
                                                movieRating={item.movie.rating}
                                                scheduleDate={item.startDate}
                                                scheduleTime={item.startDate}
                                                scheduleWith={item.creator?.username ?? ''}
                                                timezone={item.timezone}
                                                seeMovie={() =>
                                                    clientStackNav.navigate('ContentDetailScreen', {
                                                        id: item.movie.id,
                                                        movie: item.movie.title,
                                                    })
                                                }
                                                visitCreator={() => handleInviterPress(item.hostId)}
                                                viewRequest={() => handleViewRequest(item)}
                                            />
                                    )}
                                />
                            )}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default VisionaryRoomsRequests;

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
    floatingButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 12, // keep it square with slightly rounded corners
        backgroundColor: COLORS.AKCRUBACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
        notificationDot: {
        position: 'absolute',
        top: 3,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '70%',
    },
    modalText: {
        marginTop: 10,
        ...FONTS.Title3,
        color: COLORS.WHITE,
        textAlign: 'center',
    },
});
