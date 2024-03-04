import {View, Text, ScrollView, Platform} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {SIZES} from '../../../../assets/constants';
import UserDatesCard from '../../../components/UserDateCard';
import {getMyCRUViews} from '../../../lib/api/cru.lib';
import {ICruView, IMITInvite} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';
import {formatMovieDuration} from '../../../util/util';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../../navigation/ClientStack';
import {getMyMITInvites} from '../../../lib/api/mit.lib';
import {isAfter, isBefore} from 'date-fns';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const UserProfileDatesTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    const user = useAuthStore.getState().user;
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite)[]>([]);

    const [cameraPermission, setCameraPermission] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<boolean>(false);

    const _checkPermissions = async () => {
        //check permissions for camera and microphone on android
        if (Platform.OS === 'android') {
            // Request microphone permission
            check(PERMISSIONS.ANDROID.RECORD_AUDIO)
                .then(audioResult => {
                    if (audioResult === RESULTS.GRANTED) {
                        // Microphone permission granted
                        //console.log('Microphone permission granted');
                    }
                })
                .catch(audioError => {
                    // Handle microphone permission request error
                    //console.log('Microphone permission request error:', audioError);
                });

            // Request camera permission
            check(PERMISSIONS.ANDROID.CAMERA)
                .then(cameraResult => {
                    if (cameraResult === RESULTS.GRANTED) {
                        // Camera permission granted
                        //console.log('Camera permission granted');
                    }
                })
                .catch(cameraError => {
                    // Handle camera permission request error
                    //console.log('Camera permission request error:', cameraError);
                });
        }
        // check permissions for camera and microphone on iOS
        if (Platform.OS === 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            //console.log('The camera is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            //console.log('The camera permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.IOS.CAMERA).then(result => {
                                // …
                                //console.log('Requested camera permission', result);
                                if (result === RESULTS.GRANTED) {
                                    setCameraPermission(true);
                                }
                            });
                            break;
                        case RESULTS.LIMITED:
                            //console.log('The camera permission is limited: some actions are possible');
                            break;
                        case RESULTS.GRANTED:
                            //console.log('The camera permission is granted', result);
                            setCameraPermission(true);
                            break;
                        case RESULTS.BLOCKED:
                            //console.log('The camera permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch(error => {
                    // display some error message for the user
                });

            check(PERMISSIONS.IOS.MICROPHONE)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            //console.log('The microphone is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            //console.log('The microphone permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.IOS.MICROPHONE).then(result => {
                                // …
                                //console.log('Requested microphone permission');
                                if (result === RESULTS.GRANTED) {
                                    setMicPermission(true);
                                }
                            });
                            break;
                        case RESULTS.LIMITED:
                            //console.log('The microphone permission is limited: some actions are possible');
                            break;
                        case RESULTS.GRANTED:
                            //console.log('The microphone permission is granted');
                            setMicPermission(true);
                            break;
                        case RESULTS.BLOCKED:
                            //console.log('The microphone permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch(error => {
                    // display some error message for the user
                });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            // get CRUViews and MITs and merge them
            const fetchMyEvents = async () => {
                try {
                    const myCRUViews = await getMyCRUViews({upcoming: true});
                    const myMITs = await getMyMITInvites({accepted: true, me: true}); // get accepted MITs & accepted created MITs (def upcoming)

                    if (myCRUViews && myMITs) {
                        let events = [...myCRUViews, ...myMITs];
                        // sort invites by date (newest to oldest) and set state
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
                }
            };
            fetchMyEvents();
        }, []),
    );

    const handleInviterPress = (creatorId: string) => {
        // Navigate to the ViewUserScreen with the user's ID
        navigation.navigate('ViewUserScreen', {userID: creatorId});
    };

    // render CRUViews and MITs (when MITs are implemented)
    const _renderMyEvents = () => {
        return myEvents.map(item => {
            if (item instanceof Object && 'cru' in item) {
                // item is a CRUView
                // scheduleWith  is either the CRU creator or yourself
                const scheduleWith =
                    item.cru.creatorId === user?.id ? 'your CRU' : `${item.cru.creator.username}'s CRU`;
                return (
                    <View key={item.id} style={{marginBottom: 10}}>
                        <UserDatesCard
                            id={item.id}
                            cruId={item.cru.id}
                            isHost={item.cru.creatorId === user?.id}
                            movieId={item.movie.id}
                            moviePoster={item.movie.portraitURL}
                            movieName={item.movie.title}
                            length={formatMovieDuration(item.movie.duration)} // FIXME: make this render in hours and minutes
                            movieYear={item.movie.year}
                            movieRated={item.movie.rated}
                            movieGenre={capitalizeFirstLetterOfString(item.movie.genres[0])}
                            movieRating={item.movie.rating}
                            scheduleDate={item.startDate}
                            scheduleTime={item.startDate}
                            scheduleWith={scheduleWith}
                            timezone={item.timezone}
                            type="CRUView"
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
            } else {
                // item is a MITInvite
                // scheduleWith  is either the MIT creator
                const scheduleWith =
                    item.creator.id === user?.id
                        ? ` ${item.invitee.username}`
                        : `${item.creator.username}`;
                const isHost = item.creator.id === user?.id;

                // pretty print item in the console
                // console.log(JSON.stringify(item, null, 2))

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
                            length={formatMovieDuration(item.movie.duration)} // FIXME: make this render in hours and minutes
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
                            onPress={() => handleInviterPress(item.creatorId)}
                        />
                    </View>
                );
            }
        });
    };

    return (
        <View style={{marginHorizontal: SIZES.marginhorizontal}}>
            <ScrollView>
                <View>
                    <Text style={styles.titleText1}>YOUR SCHEDULE</Text>
                </View>
                <View style={{marginBottom: 75}}>{_renderMyEvents()}</View>
            </ScrollView>
        </View>
    );
};

export default UserProfileDatesTab;
