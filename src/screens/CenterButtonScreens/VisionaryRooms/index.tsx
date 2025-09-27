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
import React, {useCallback, useEffect, useState} from 'react';
import TabContainer from '../../../components/TabContainer/TabContainer';
import Header from '../../../components/header';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
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
import { getPendingResponseRooms, getPendingRooms, rsvpVisionaryRoom } from '../../../lib/api/visionary.lib';
import RoomCard from './RoomCard';

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

const VisionaryRooms = () => {
    const AKCRUButtonNav = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
    const clientStackNav = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const {user} = useAuthStore();

    const [rooms, setRooms] = useState<VisionaryRoom[]>([]);
    const [pendingRooms, setPendingRooms] = useState<VisionaryRoom[]>([])
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceMessage, setAtttendanceMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchVisionaryRooms();

                if (user.isAdmin) {
                    fetchPendingVisionaryRooms()
                }
            }
        }, []),
    );

    const fetchVisionaryRooms = async () => {
            setLoadingRooms(true);
            try {
                const roomsResponse = await getPendingResponseRooms();
                console.log('roomsRes: ', roomsResponse?.data)
                if (roomsResponse && roomsResponse.status === 200) {
                    setRooms(roomsResponse.data.rooms);
                } else {
                    setRooms([]);
                }
            } catch (error) {
                console.error('Failed to fetch pending response rooms:', error);
            } finally {
                setLoadingRooms(false);
            }
    };

    const fetchPendingVisionaryRooms = async () => {
            setLoadingRooms(true);
            try {
                const pendingRoomsResponse = await getPendingRooms();

                if (pendingRoomsResponse && pendingRoomsResponse.status === 200) {
                    setPendingRooms(pendingRoomsResponse.data.pendingRooms);
                } else {
                    setPendingRooms([]);
                }
            } catch (error) {
                console.error('Failed to fetch pending rooms:', error);
            } finally {
                setLoadingRooms(false);
            }
    };

    const handleViewRoomRequests = () => {
        AKCRUButtonNav.navigate('VisionaryRoomsRequests')
    }

    const handleInviterPress = (creatorId: string) => {
        clientStackNav.navigate('ViewUserScreen', {userID: creatorId});
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchVisionaryRooms();
        await fetchPendingVisionaryRooms();
        setRefreshing(false);
    };

    const handleAttendance = async (attending: boolean, roomId: string) => {
        setAttendanceLoading(true); 
        setAtttendanceMessage(attending ? "Marking attendance..." : "Declining attendance...");

        try {
            const status = attending ? "ACCEPTED" : "DECLINED";
            const result = await rsvpVisionaryRoom(roomId, status);

            console.log("RSVP Success:", result?.data.message);
            // Optionally show a toast/snackbar here
        } catch (err) {
            console.error("RSVP failed:", err);
            // Show error toast/snackbar here
        } finally {
            setAttendanceLoading(false);
            handleRefresh()
        }
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
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>Events</Text>
                            </View>
                        </View>
                        <View style={{marginBottom: '23%'}}>
                            {loadingRooms ? (
                                <View style={{marginTop: '25%'}}>
                                    <ActivityIndicator size="large" color={COLORS.PINK} />
                                </View>
                            ) : rooms.length === 0 ? (
                                <View>
                                    <Text style={styles.noPostText}>No events happening right now</Text>
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
                                                handleAttend={() => handleAttendance(true, item.id)}
                                                handleDecline={() => handleAttendance(false, item.id)}
                                            />
                                    )}
                                />
                            )}
                        </View>
                    </ScrollView>

                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={attendanceLoading}
                        onRequestClose={() => setAttendanceLoading(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <ActivityIndicator size="large" color={COLORS.PINK} />
                                <Text style={styles.modalText}>{attendanceMessage}</Text>
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Floating Button with Notification Dot */}
                {user && user.isAdmin && (
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={() => handleViewRoomRequests()}>
                        <View>
                            <Icon name="bell" type="material-community" size={28} color={COLORS.WHITE} />
                            {pendingRooms && pendingRooms.length > 0 && (
                                <View style={styles.notificationDot} />
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </TabContainer>
    );
};

export default VisionaryRooms;

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
