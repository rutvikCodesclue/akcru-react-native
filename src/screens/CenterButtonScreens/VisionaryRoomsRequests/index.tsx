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
import {Icon} from '@rneui/base';
import {getPendingResponseRooms, getPendingRooms, requestDecision} from '../../../lib/api/visionary.lib';
import RoomCard from './RoomCard';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';

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
    const [selectedRoom, setSelectedRoom] = useState<VisionaryRoom | null>(null);
    
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accepted, setAccepted] = useState(false)
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionMessage, setDecisionMessage] = useState('');
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchPendingVisionaryRooms();
        }, []),
    );

    const fetchPendingVisionaryRooms = async () => {
        setLoadingRooms(true);
        try {
            const pendingRoomsResponse = await getPendingRooms();

            if (pendingRoomsResponse && pendingRoomsResponse.status === 200) {
                setRooms(pendingRoomsResponse.data.pendingRooms);
                console.log('room: ', pendingRoomsResponse.data.pendingRooms)
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

    const handleDecision = async (room: VisionaryRoom | null) => {
        if (room) {
            setDecisionLoading(true);
            try {
                const apiDecision = accepted ? 'ACCEPTED' : 'DECLINED';
    
                if (room.creator) {
                    const data = await requestDecision(room.creator.id, room.id, apiDecision);
    
                    if (data.success) {
                        setDecisionMessage(data.message || 'Success');
                    } else {
                        setDecisionMessage('Something went wrong');
                        console.error('There was an error in recording the decision');
                    }
                }
            } catch (err) {
                console.error('Failed to send decision:', err);
                setDecisionMessage('Request failed. Please try again.');
            } finally {
                setDecisionLoading(false);
                setShowDecisionModal(true);
                setTimeout(() => setShowDecisionModal(false), 3000);
                setSelectedRoom(null)
            }
        } else {
            console.log('No room was selected to make a decision on.')
        }
    };

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <ScrollView stickyHeaderIndices={[0]} style={{height: SIZES.ScreenHeight}} scrollEventThrottle={16}>
                        <View>
                            <View style={{zIndex: 100}}>
                                <Header />
                            </View>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => AKCRUButtonNav.navigate('VisionaryRooms')}>
                                <Icon name="chevron-back" type="ionicon" size={22} color={COLORS.LIGHTGREY} />
                                <Text style={styles.backText}>Back</Text>
                            </TouchableOpacity>
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
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>Visionary Rooms Requests</Text>
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
                                            acceptRequest={() => {
                                                setSelectedRoom(item)
                                                setAccepted(true)
                                                setShowConfirmModal(true)
                                            }}
                                            declineRequest={() => {
                                                setSelectedRoom(item)
                                                setAccepted(false)
                                                setShowConfirmModal(true)
                                            }}
                                        />
                                    )}
                                />
                            )}
                        </View>
                        {decisionLoading && (
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 10,
                                }}>
                                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                <Text style={{marginTop: 10}}>{accepted ? 'Accepting...' : 'Declining...'}</Text>
                            </View>
                        )}
                        {showConfirmModal && (
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <Text style={{ ...FONTS.Title2, color: COLORS.WHITE, textAlign: 'center' }}>
                                        {accepted
                                            ? 'Are you sure you want to accept this request?'
                                            : 'Are you sure you want to decline this request?'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                        <TouchableOpacity
                                            style={{ marginRight: 15 }}
                                            onPress={() => {
                                                setSelectedRoom(null)
                                                setShowConfirmModal(false)
                                            }}>
                                            <Text style={{ ...FONTS.Title3, color: COLORS.CATREDDRK, }}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            handleDecision(selectedRoom)
                                            setShowConfirmModal(false)
                                        }}>
                                            <Text style={{ ...FONTS.Title3, color: COLORS.AKCRUBLUE, }}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                        {showDecisionModal && (
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 20,
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                        padding: 20,
                                        borderRadius: 12,
                                        minWidth: '70%',
                                        alignItems: 'center',
                                    }}>
                                    <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.WHITE}}>
                                        {decisionMessage}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default VisionaryRoomsRequests;

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 60, // adjust for iOS/Android status bar
        left: 15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 200, // make sure it's above gradient
    },
    backText: {
        ...FONTS.Title3,
        marginLeft: 5,
        color: COLORS.LIGHTGREY,
    },
    title: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '30%',
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
