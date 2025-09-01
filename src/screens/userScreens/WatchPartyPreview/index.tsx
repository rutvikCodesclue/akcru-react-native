import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Pressable,
    Platform,
    Alert,
    Linking,
    Modal,
} from 'react-native';
import React, {useRef} from 'react';
import Header from '../../../components/header';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useState, useEffect} from 'react';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {StackNavigationProp} from '@react-navigation/stack';
import {findMovieById} from '../../../lib/api/movies.lib';
import {IMovie, IUserProfile} from '../../../../types';
import {formatMovieDuration} from '../../../util/util';
import {joinARoom, joinMITRoom, joinMyMITRoom, joinMyRoom} from '../../../lib/api/rooms.lib';
import {
    HMSConfig,
    HMSException,
    HMSRoom,
    HMSSDK,
    HMSTrack,
    HMSTrackSource,
    HMSTrackType,
    HMSUpdateListenerActions,
    HMSVideoViewMode,
} from '@100mslive/react-native-hms';
import useAuthStore from '../../../stores/auth.store';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import AkcruButtons from '../../../components/akcruButtons';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {checkRoomTime} from '../../../util/checkRoomTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import BackButton from '../../../components/General/backbutton';
import {Recommendations} from './Recommendations';

type RoomPreviewNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'WatchPartyPreview'>;

type RoomPreviewRouteProp = RouteProp<UserProfileStackParams, 'WatchPartyPreview'>;

type Props = {
    navigation: RoomPreviewNavigationProp;
    route: RoomPreviewRouteProp;
    movieName: string;
    movieId: string;
    isHost: boolean;
    cruId?: string;
    userId?: string;
    id?: string;
    movieTime?: any;
    timezone?: any;
    type: 'MITInvite' | 'CRUView';
    creator: any;
    creatorId: any;
    invitee: any;
    cru: any;
};

const WatchPartyPreview = ({navigation, route}: Props) => {
    const inviteId = route.params?.id;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const creatorId = route.params?.creatorId ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const cruId = route.params?.cruId;
    const cru = route.params?.cru;
    const videoRoomPrivileges = route.params?.videoRoomPrivileges

    const userId = route.params?.userId;
    const isHost = route.params?.isHost;
    const type = route.params?.type;
    const movieId = route.params?.movieId;
    const movieTime = route.params?.scheduleTime;
    const timezone = route.params?.timezone;
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [cameraPermission, setCameraPermission] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<boolean>(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isUserVideoOn, setIsUserVideoOn] = useState(true);
    const [canJoinRoom, setCanJoinRoom] = useState(false);
    const [roomIdFrom100ms, setRoomIdFrom100ms] = useState<string | null>(null);
    const [previewVideoTrack, setPreviewVideoTrack] = useState<HMSTrack | undefined>(undefined);
    const [roomAuthToken, setAuthRoomToken] = useState<string | null>(null);
    const [Timezone] = useState<string>(timezone);
    const [Movietime] = useState<string>(movieTime);
    const {user} = useAuthStore();
    const hmsInstanceRef = useRef<HMSSDK | null>(null);

    // const hasVideoPrivileges = true; // get this from backend, this should be associated with a cru view, whether video is allowed for that room or not
    // isVideoEnabled will be originally set when the host (with video privileges) creates the cru view

    useEffect(() => {
        RestrictPartyRoom();

        findMovieById(movieId).then(res => {
            if (res) {
                setMovie(res);
            }
        });
    }, []);

    const RestrictPartyRoom = () => {
        const room_time_limit = checkRoomTime(Timezone, Movietime);
        if (room_time_limit) {
            AsyncStorage.setItem('isRoomTimeLimitCompleted', 'true');
            navigation.navigate('UserProfileScreen');
        } else {
            setTimeout(() => {
                RestrictPartyRoom();
            }, Number(ROOM_VALIDATION_CHECK_TIME));
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            console.log('Screen focused [WatchPartyPreviewScreen]');
            console.log('Starting room preview...');
            _startRoomPreview();

            return () => {
                console.log('Screen unfocused [WatchPartyPreviewScreen]');
                console.log('Leaving room preview...');

                if (hmsInstanceRef.current) {
                    _handleRoomLeave();
                }
            };
        }, []),
    );

    const _checkPermissions = async () => {
        //check permissions for camera and microphone on android
        if (Platform.OS === 'android') {
            check(PERMISSIONS.ANDROID.RECORD_AUDIO)
                .then(audioResult => {
                    if (audioResult === RESULTS.GRANTED) {
                        console.log('Microphone permission granted');
                    } else if (audioResult === RESULTS.DENIED) {
                        // If permission is denied, request it again
                        request(PERMISSIONS.ANDROID.RECORD_AUDIO)
                            .then(audioRequestResult => {
                                if (audioRequestResult === RESULTS.GRANTED) {
                                    console.log('Microphone permission granted after request');
                                } else {
                                    Alert.alert(
                                        'Microphone Permission Blocked',
                                        'You have permanently denied the microphone permission. Please enable it in the app settings to use this feature.',
                                        [
                                            {
                                                text: 'Open Settings',
                                                onPress: () => {
                                                    Linking.openSettings(); // Opens the app settings
                                                },
                                            },
                                        ],
                                    );
                                    console.log('Microphone permission denied again');
                                }
                            })
                            .catch(audioError => {
                                console.log('Error requesting microphone permission:', audioError);
                            });
                    } else if (audioResult === RESULTS.BLOCKED) {
                        // Permission is blocked; show an alert to open app settings
                        Alert.alert(
                            'Microphone Permission Blocked',
                            'You have permanently denied the microphone permission. Please enable it in the app settings to use this feature.',
                            [
                                {
                                    text: 'Open Settings',
                                    onPress: () => {
                                        Linking.openSettings(); // Opens the app settings
                                    },
                                },
                            ],
                        );
                    }
                })
                .catch(audioError => {
                    console.log('Error checking microphone permission:', audioError);
                });

            check(PERMISSIONS.ANDROID.CAMERA)
                .then(cameraResult => {
                    if (cameraResult === RESULTS.GRANTED) {
                        console.log('Camera permission granted');
                    } else if (cameraResult === RESULTS.DENIED) {
                        // If permission is denied, request it again
                        request(PERMISSIONS.ANDROID.CAMERA)
                            .then(cameraRequestResult => {
                                if (cameraRequestResult === RESULTS.GRANTED) {
                                    console.log('Camera permission granted after request');
                                } else {
                                    Alert.alert(
                                        'Camera Permission Blocked',
                                        'You have permanently denied the camera permission. Please enable it in the app settings to use this feature.',
                                        [
                                            {
                                                text: 'Open Settings',
                                                onPress: () => {
                                                    Linking.openSettings(); // Opens the app settings
                                                },
                                            },
                                        ],
                                    );
                                    console.log('Camera permission denied again');
                                }
                            })
                            .catch(cameraError => {
                                console.log('Error requesting camera permission:', cameraError);
                            });
                    } else if (cameraResult === RESULTS.BLOCKED) {
                        // Permission is blocked; show an alert to open app settings
                        Alert.alert(
                            'Camera Permission Blocked',
                            'You have permanently denied the camera permission. Please enable it in the app settings to use this feature.',
                            [
                                {
                                    text: 'Open Settings',
                                    onPress: () => {
                                        Linking.openSettings(); // Opens the app settings
                                    },
                                },
                            ],
                        );
                    }
                })
                .catch(cameraError => {
                    console.log('Error checking camera permission:', cameraError);
                });
        }

        if (Platform.OS === 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('The camera is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The camera permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.IOS.CAMERA).then(result => {
                                console.log('Requested camera permission', result);
                                if (result === RESULTS.GRANTED) {
                                    setCameraPermission(true);
                                }
                            });
                            break;
                        case RESULTS.LIMITED:
                            console.log('The camera permission is limited: some actions are possible');
                            break;
                        case RESULTS.GRANTED:
                            console.log('The camera permission is granted', result);
                            setCameraPermission(true);
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The camera permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch(error => {});

            check(PERMISSIONS.IOS.MICROPHONE)
                .then(result => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('The microphone is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The microphone permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.IOS.MICROPHONE).then(result => {
                                console.log('Requested microphone permission');
                                if (result === RESULTS.GRANTED) {
                                    setMicPermission(true);
                                }
                            });
                            break;
                        case RESULTS.LIMITED:
                            console.log('The microphone permission is limited: some actions are possible');
                            break;
                        case RESULTS.GRANTED:
                            console.log('The microphone permission is granted');
                            setMicPermission(true);
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The microphone permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch(error => {});
        }
    };

    const __onError = (error: HMSException) => {
        console.log('Error previewing room', error);
    };
    const __onPreview = (data: {room: HMSRoom; previewTracks: HMSTrack[]}) => {
        setRoomIdFrom100ms(data.room.id);

        const regularVideoTrack = data.previewTracks.find(previewTrack => {
            return previewTrack.source === HMSTrackSource.REGULAR && previewTrack.type === HMSTrackType.VIDEO;
        });

        setPreviewVideoTrack(regularVideoTrack);

        setCanJoinRoom(true);
    };

    const _startRoomPreview = async () => {
        const hmsInstance = await HMSSDK.build();

        hmsInstanceRef.current = hmsInstance;

        console.log('Joining room preview [WatchPartyPreviewScreen]...');

        let authTokenForRoom;
        if (isHost) {
            if (type === 'CRUView') {
                authTokenForRoom = await joinMyRoom();
                setAuthRoomToken(authTokenForRoom);
                console.log('Generating auth token for room as HOST... [CRUView]');
            } else if (type === 'MITInvite') {
                console.log('Generating auth token for room as HOST... [MITInvite]');
                authTokenForRoom = await joinMyMITRoom();
                setAuthRoomToken(authTokenForRoom);
            }
        } else {
            if (type === 'CRUView') {
                authTokenForRoom = await joinARoom(cruId);
                setAuthRoomToken(authTokenForRoom);
                console.log('Generating auth token for room as MEMBER... [CRUView]');
            } else if (type === 'MITInvite') {
                console.log('Generating auth token for room as MEMBER... [MITInvite]');
                authTokenForRoom = await joinMITRoom(inviteId);
                setAuthRoomToken(authTokenForRoom);
            }
        }

        await _checkPermissions();

        if (hmsInstance && authTokenForRoom) {
            console.log('Registering Room Preview Event Listeners [WatchPartyPreviewScreen]...');

            hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, __onError);
            hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PREVIEW, __onPreview);

            let config = new HMSConfig({
                authToken: authTokenForRoom,
                username: user?.username ?? 'Anonymous',
            });

            hmsInstance.preview(config);
        } else {
            console.error('=== Permissions not granted or no hmsInstance ===');
        }
    };

    const _handleJoinRoom = async () => {
        if (roomIdFrom100ms && roomAuthToken) {
            const leaveRoomSuccessful = await _handleRoomLeave();

            if (leaveRoomSuccessful) {
                navigation.navigate('StartWatchPartyView', {
                    type,
                    movieId,
                    roomId: roomIdFrom100ms,
                    roomAuthToken,
                    micInitialState: false,
                    cameraInitialState: isUserVideoOn,
                    isHost,
                    inviteId,
                    creator,
                    creatorId,
                    invitee,
                    Timezone,
                    Movietime,
                    cru,
                    videoRoomPrivileges,
                });
            }
        }
    };

    const _handleRoomLeave = async () => {
        try {
            const hmsInstance = hmsInstanceRef.current;

            if (!hmsInstance) {
                return Promise.reject('HMSSDK instance is null');
            }

            hmsInstance.removeAllListeners();
            console.log('All listeners removed [WatchPartyPreviewScreen]');

            /**
             * Leave Room. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/leave | Leave Room}
             */
            const leaveResult = await hmsInstance.leave();
            console.log('Leave Success [WatchPartyPreviewScreen]:', leaveResult);

            /**
             * Free/Release Resources. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/release-resources | Release Resources}
             */
            const destroyResult = await hmsInstance.destroy();
            console.log('Destroy Success [WatchPartyPreviewScreen]:', destroyResult);

            hmsInstanceRef.current = null;

            return true;
        } catch (error) {
            console.log('Leave or Destroy Error: ', error);
            return false;
        }
    };

    const toggleMic = () => {
        setIsMicOn((prevState: boolean) => !prevState);
    };
    const toggleVideo = () => {
        setIsUserVideoOn((prevState: boolean) => !prevState);
    };

    return (
        <SafeAreaView>
            <View style={{height: '100%'}}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>

                <View style={styles.topcontainer}>
                    <BackButton navigation={navigation} />
                </View>

                <View style={{flex: 1}}>
                    {/* Top: Movie Info */}
                    <View style={{flex: 1, marginBottom: 15}}>
                        <View style={styles.movieview}>
                            <LinearGradient
                                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                style={StyleSheet.absoluteFill}
                            />

                            <View style={styles.moviecontainer}>
                                {/* Poster */}
                                <View style={{marginRight: 10}}>
                                    <Image source={{uri: movie?.portraitURL}} style={styles.poster} />
                                </View>

                                {/* Title & Info */}
                                <View style={{flex: 1}}>
                                    <Text style={{...FONTS.Title3}}>{movie?.title ?? 'Loading...'}</Text>

                                    <View style={{flexDirection: 'row', marginVertical: 8, alignItems: 'center'}}>
                                        <Text style={{...FONTS.Title2, fontSize: 12}}>{movie?.year}</Text>
                                        <Text style={{...FONTS.Title2, fontSize: 12, marginHorizontal: 10}}>
                                            {movie?.duration ? formatMovieDuration(movie?.duration) : '...'}
                                        </Text>
                                    </View>

                                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                        <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                        {movie?.genres?.slice(0, 2).map((g, i) => (
                                            <Text key={i} style={styles.drawfonttag}>
                                                {capitalizeFirstLetterOfString(g)}
                                            </Text>
                                        ))}
                                        <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={{...FONTS.paragraph1, fontSize: 12, marginTop: 8}}>{movie?.description}</Text>
                        </View>
                    </View>

                    {/* Middle: Preview Video */}
                    {user?.hasVideoPrivileges && (
                        <View style={{flex: 2, margin: 15, borderRadius: 8, overflow: 'hidden'}}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: '#000',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {hmsInstanceRef.current && previewVideoTrack ? (
                                    isUserVideoOn ? (
                                        <hmsInstanceRef.current.HmsView
                                            trackId={previewVideoTrack.trackId}
                                            scaleType={HMSVideoViewMode.ASPECT_FILL}
                                            style={{width: '100%', height: '100%'}}
                                            mirror={true}
                                            />
                                        ) : (
                                            <Text style={{color: '#fff'}}>Camera Off</Text>
                                        )
                                    ) : (
                                        <Text style={{color: '#fff'}}>Loading....</Text>
                                    )}
                            </View>
                        </View>
                    )}

                    {/* Bottom Controls */}
                    {user?.hasVideoPrivileges && (
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Pressable onPress={toggleVideo}>
                                {isUserVideoOn ? (
                                    <Icon name="video" type="material-community" size={40} color={COLORS.CATPURPLGT} />
                                ) : (
                                    <Icon
                                        name="video-off"
                                        type="material-community"
                                        size={40}
                                        color={COLORS.CATREDLGT}
                                    />
                                )}
                            </Pressable>
                        </View>
                    )}
                    
                    {/* Join Button */}
                    <View style={{flex: 1, marginTop: user?.hasVideoPrivileges ? 0 : 400, alignItems: 'center', justifyContent: 'center'}}>
                        <AkcruButtons.XlLrgButton
                            disabled={!canJoinRoom}
                            onPress={_handleJoinRoom}
                            btnname="Join Room"
                            color={COLORS.AKCRUBLUE}
                        />
                    </View>

                </View>
            </View>
            <Recommendations />
        </SafeAreaView>
    );
};

export default WatchPartyPreview;

const styles = StyleSheet.create({
    topcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    poster: {
        width: 60,
        height: 90,
        borderRadius: 5,
    },
    movieview: {
        // marginTop: 0,
        marginHorizontal: 15,
        padding: 10,
        backgroundColor: '#1C202A',
        borderRadius: 5,
    },
    moviecontainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 4,
        borderRadius: 4,
        textAlign: 'center',
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignItems: 'center',
        height: 35,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    videocontain: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'center',
    },
    videoplayer: {
        alignSelf: 'center',
        aspectRatio: 16 / 9,
        width: '100%',
    },
    bottombtn: {
        position: 'absolute',
        flex: 1,
        bottom: '5%',
        width: '100%',
        marginBottom: 100,
    },
});
