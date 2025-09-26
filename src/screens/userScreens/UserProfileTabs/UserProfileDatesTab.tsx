import {View, Text, ScrollView, Platform, Modal, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import UserDatesCard from '../../../components/UserDateCard';
import {getMyCRUViews} from '../../../lib/api/cru.lib';
import {ICruView, IMITInvite, IVisionaryRoom} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {formatMovieDuration} from '../../../util/util';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {getMyMITInvites} from '../../../lib/api/mit.lib';
import {isAfter, isBefore} from 'date-fns';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {UseTabMenu} from '../../../context/TabContext';
import { getAttendingRooms, getMyVisionaryRooms } from '../../../lib/api/visionary.lib';
import { findAUser } from '../../../lib/api/user.lib';

const UserProfileDatesTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    const user = useAuthStore.getState().user;
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite | IVisionaryRoom)[]>([]);
    const {refetchDates, setRefetchDates} = UseTabMenu();
    const [cameraPermission, setCameraPermission] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<boolean>(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [ownershipMessage, setOwnershipMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const _checkPermissions = async () => {
        //check permissions for camera and microphone on android
        if (Platform.OS === 'android') {
            check(PERMISSIONS.ANDROID.RECORD_AUDIO)
                .then(audioResult => {
                    if (audioResult === RESULTS.GRANTED) {
                    }
                })
                .catch(audioError => {});

            check(PERMISSIONS.ANDROID.CAMERA)
                .then(cameraResult => {
                    if (cameraResult === RESULTS.GRANTED) {
                    }
                })
                .catch(cameraError => {});
        }

        if (Platform.OS === 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            break;
                        case RESULTS.DENIED:

                            request(PERMISSIONS.IOS.CAMERA).then(result => {
                                if (result === RESULTS.GRANTED) {
                                    setCameraPermission(true);
                                }
                            });
                            break;
                        case RESULTS.LIMITED:

                            break;
                        case RESULTS.GRANTED:

                            setCameraPermission(true);
                            break;
                        case RESULTS.BLOCKED:

                            break;
                    }
                })
                .catch(error => {});

            check(PERMISSIONS.IOS.MICROPHONE)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:

                            break;
                        case RESULTS.DENIED:
                            request(PERMISSIONS.IOS.MICROPHONE).then(result => {
                                if (result === RESULTS.GRANTED) {
                                    setMicPermission(true);
                                }
                            });
                            break;
                        case RESULTS.LIMITED:

                            break;
                        case RESULTS.GRANTED:

                            setMicPermission(true);
                            break;
                        case RESULTS.BLOCKED:

                            break;
                    }
                })
                .catch(error => {});
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchMyEvents = async () => {
                try {
                    setLoading(true);
                    const myCRUViews = await getMyCRUViews({upcoming: true}) ?? [];
                    const myMITs = await getMyMITInvites({accepted: true, me: true}) ?? [];
                    const myVisionaryRooms = await getAttendingRooms() ?? [];

                    if (myCRUViews && myMITs && myVisionaryRooms) {
                        let events = [...myCRUViews, ...myMITs, ...myVisionaryRooms];

                        setMyEvents(
                            events.sort((a, b) => {
                                let date1 = new Date(a.startDate);
                                let date2 = new Date(b.startDate);

                                if (isAfter(date1, date2)) {
                                    return 1;
                                }
                                if (isBefore(date1, date2)) {
                                    return -1;
                                }
                                return 0;
                            }),
                        );
                    }
                } catch (error) {
                    console.error('Error getting my Events:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchMyEvents();
            if (refetchDates) {
                setRefetchDates(false);
            }
        }, [refetchDates, setRefetchDates]),
    );

    const handleInviterPress = (creatorId: string) => {
        navigation.navigate('ViewUserScreen', {userID: creatorId});
    };

    const _renderMyEvents = () => {
        if (loading) {
            return (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={{ marginTop: 10, color: COLORS.DARKGREY }}>
                        Fetching your dates...
                    </Text>
                </View>
            );
        }
        if (myEvents.length === 0) {
            return (
                <View style={{alignItems: 'center'}}>
                    <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.DARKGREY}}>
                        No dates scheduled
                    </Text>
                </View>
            );
        } else {
            return myEvents.map(item => {
                if (item instanceof Object && 'cru' in item) {
                    const scheduleWith =
                        item.cru.creatorId === user?.id ? 'your CRU' : `${item.cru.creator?.username}'s CRU`;
                    return (
                        <View key={item.id} style={{marginBottom: 10}}>
                            <UserDatesCard
                                id={item.id}
                                cru={item.cru}
                                cruId={item.cru.id}
                                isHost={item.cru.creatorId === user?.id}
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
                                scheduleWith={scheduleWith}
                                timezone={item.timezone}
                                type="CRUView"
                                creatorId={item.cru.creatorId}
                                videoRoomPrivileges={item.videoRoomPrivileges}
                                onPressin={() =>
                                    navigation.navigate('ContentDetailScreen', {
                                        id: item.movie.id,
                                        movie: item.movie.title,
                                        _checkPermissions,
                                    })
                                }
                                onPress={() => handleInviterPress(item.cru.creatorId)}
                            />
                        </View>
                    );
                } else if (item instanceof Object && 'invitee' in item){
                    const scheduleWith =
                        item.creator.id === user?.id ? ` ${item.invitee.username}` : `${item.creator.username}`;
                    const isHost = item.creator.id === user?.id;

                    return (
                        <View key={item.id} style={{marginBottom: 10}}>
                            <UserDatesCard
                                type="MITInvite"
                                id={item.id}
                                isHost={isHost}
                                userId={isHost ? item.creator.id : item.invitee.id}
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
                                scheduleWith={scheduleWith}
                                timezone={item.timezone}
                                onPressin={() =>
                                    navigation.navigate('ContentDetailScreen', {
                                        id: item.movie.id,
                                        movie: item.movie.title,
                                        _checkPermissions,
                                    })
                                }
                                creator={item.creator}
                                creatorId={item.creator.id}
                                invitee={item.invitee}
                                onPress={() => handleInviterPress(item.creatorId)}
                            />
                        </View>
                    );
                } else {
                    const isHost = user?.id === item.hostId

                    return (
                        <View key={item.id} style={{marginBottom: 10}}>
                            <UserDatesCard
                                id={item.id}
                                creator={item.creator}
                                isHost={isHost}
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
                                scheduleWith={item.creator.username}
                                timezone={item.timezone}
                                type="VisionaryRoom"
                                creatorId={item.hostId}
                                onPressin={() =>
                                    navigation.navigate('ContentDetailScreen', {
                                        id: item.movie.id,
                                        movie: item.movie.title,
                                        _checkPermissions,
                                    })
                                }
                                onPress={() => handleInviterPress(item.hostId)}
                                setModalVisible={setModalVisible}
                                setOwnershipMessage={setOwnershipMessage}
                            />
                        </View>
                    );
                } 
                
            });
        }
    };

    return (
        <View style={{marginHorizontal: SIZES.marginhorizontal}}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <Text style={styles.titleText1}>YOUR SCHEDULE</Text>
                </View>
                <View style={{marginBottom: 75}}>{_renderMyEvents()}</View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}>
                    <View style={{
                        width: '80%',
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                        padding: 20,
                        borderRadius: 10,
                        alignItems: 'center'
                    }}>
                        <Text style={{...FONTS.Title2, marginBottom: 15}}>{ownershipMessage}</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{
                                backgroundColor: COLORS.AKCRUBLUE,
                                padding: 10,
                                borderRadius: 8
                            }}>
                            <Text style={{color: COLORS.WHITE}}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default UserProfileDatesTab;
