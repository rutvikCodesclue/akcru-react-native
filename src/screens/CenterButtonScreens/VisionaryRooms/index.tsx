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
    const [page, setPage] = useState(1);

    const [loadingRooms, setLoadingRooms] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [ownershipMessage, setOwnershipMessage] = useState('');

    useEffect(() => {
        fetchVisionaryRooms(1);
    }, []);

    const fetchVisionaryRooms = async (pageNumber: number) => {
        if (user && pageNumber) {
            setLoadingRooms(true);

            try {
                const roomsResponse = await getPostsByUser(user?.id, pageNumber);

                if (roomsResponse.status === 200) {
                    const fetchedRooms = roomsResponse.data;

                    if (pageNumber === 1) {
                        setRooms(fetchedRooms);
                    } else {
                        setRooms(prevRooms => [...prevRooms, ...fetchedRooms]);
                    }

                    setPage(pageNumber);
                    setHasMore(fetchedRooms.length === 10);
                } else {
                    setPage(1);
                    setRooms([]);
                }
            } catch (error) {
                console.error('Failed to fetch user posts:', error);
            } finally {
                setLoadingRooms(false);
            }
        }
    };

    // fetch visionary room requests here if user is an admin
    // copy this screen and edit accordingly
    // show the red dot on requests button if a list is returned
    // send list to the above mentioned screen via props and display
    // use UserDateCard except tapping on it will lead to the Accept/Decline visionary room screen
    

    const loadMoreRooms = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchVisionaryRooms(page + 1);
        setIsLoadingMore(false);
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isCloseToBottom(event.nativeEvent)) {
            loadMoreRooms();
            console.log('load more rooms');
        }
    };

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
        const paddingToBottom = contentSize.height * 0.25;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    const handleInviterPress = (creatorId: string) => {
        clientStackNav.navigate('ViewUserScreen', {userID: creatorId});
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchVisionaryRooms(1);
        setRefreshing(false);
    };

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1}}>
                <View style={{flex: 1}}>
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
                                    <Text style={styles.noPostText}>No Visionary Rooms created yet</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={rooms}
                                    style={styles.postcontainer}
                                    keyExtractor={item => item.id.toString()}
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    renderItem={({item}) => (
                                        <Pressable style={{marginBottom: 10}}>
                                            <UserDatesCard
                                                id={item.id}
                                                creator={item.creator}
                                                isHost={user?.id === item.hostId}
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
                                                type="VisionaryRoom"
                                                creatorId={item.hostId}
                                                onPressin={() =>
                                                    clientStackNav.navigate('ContentDetailScreen', {
                                                        id: item.movie.id,
                                                        movie: item.movie.title,
                                                        _checkPermissions,
                                                    })
                                                }
                                                onPress={() => handleInviterPress(item.hostId)}
                                                setModalVisible={setModalVisible}
                                                setOwnershipMessage={setOwnershipMessage}
                                            />
                                            <>Show your rooms here as movie dates components</>
                                        </Pressable>
                                    )}
                                    ListFooterComponent={() =>
                                        hasMore && isLoadingMore ? <ActivityIndicator color={COLORS.PINK} /> : null
                                    }
                                />
                            )}
                        </View>
                    </ScrollView>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                            }}>
                            <View
                                style={{
                                    width: '80%',
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 20,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                }}>
                                <Text style={{...FONTS.Title2, marginBottom: 15}}>{ownershipMessage}</Text>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={{
                                        backgroundColor: COLORS.AKCRUBLUE,
                                        padding: 10,
                                        borderRadius: 8,
                                    }}>
                                    <Text style={{color: COLORS.WHITE}}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>

                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => console.log('floating button clicked')}
                >
                    <View>
                        <Icon name="bell" type='material-community' size={28} color={COLORS.WHITE} />
                        {true && ( // conditionally show dot
                            <View style={styles.notificationDot} />
                        )}
                    </View>
                </TouchableOpacity>
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
});
