import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    Pressable,
    Platform,
    Alert,
    Linking,
} from 'react-native';
import React, {useRef} from 'react';
import Header from '../../../components/header';
import {FONTS, COLORS} from '../../../../assets/constants';
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
import {joinARoom, joinMITRoom, joinMyMITRoom, joinMyRoom, joinMyVisionaryRoom, joinVisionaryRoom} from '../../../lib/api/rooms.lib';
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
    type: 'MITInvite' | 'CRUView' | 'VisionaryRoom';
    creator: any;
    creatorId: any;
    invitee?: any;
    cru?: any;
};

const WatchPartyPreview = ({navigation, route}: Props) => {
    const inviteId = route.params?.id;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const creatorId = route.params?.creatorId ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const cruId = route.params?.cruId;
    const cru = route.params?.cru;
    const viewtype = route.params?.type;

    const userId = route.params?.userId;
    const isHost = route.params?.isHost;
    const type = route.params?.type;
    const movieId = route.params?.movieId;
    const movieTime = route.params?.scheduleTime;
    const timezone = route.params?.timezone;
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [cameraPermission, setCameraPermission] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<boolean>(false);
    const [isUserVideoOn, setIsUserVideoOn] = useState(true);
    const [canJoinRoom, setCanJoinRoom] = useState(false);
    const [roomIdFrom100ms, setRoomIdFrom100ms] = useState<string | null>(null);
    const [previewVideoTrack, setPreviewVideoTrack] = useState<HMSTrack | undefined>(undefined);
    const [roomAuthToken, setAuthRoomToken] = useState<string | null>(null);
    const [Timezone] = useState<string>(timezone);
    const [Movietime] = useState<string>(movieTime);
    const {user} = useAuthStore();
    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    const navigateToRouteInHierarchy = (routeName: string, params: Record<string, any>) => {
        let cursor: any = navigation;

        while (cursor) {
            const routeNames: string[] = cursor.getState?.().routeNames ?? [];
            if (routeNames.includes(routeName) && cursor.navigate) {
                cursor.navigate(routeName as never, params as never);
                return true;
            }
            cursor = cursor.getParent?.();
        }

        return false;
    };

    const videoRoomPrivileges =
    viewtype === 'MITInvite'
        ? true
        : viewtype === 'VisionaryRoom'
        ? user?.visionaryStatus
        : route.params?.videoRoomPrivileges;

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
            const parentNav = navigation.getParent?.();
            parentNav?.setOptions?.({
                tabBarStyle: {display: 'none'},
            });

            console.log('Screen focused [WatchPartyPreviewScreen]');
            console.log('Starting room preview...');
            _startRoomPreview();

            return () => {
                parentNav?.setOptions?.({
                    tabBarStyle: undefined,
                });

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
            } else if (type === 'VisionaryRoom') {
                console.log('Generating auth token for room as HOST... [VisionaryRoom]')
                authTokenForRoom = await joinMyVisionaryRoom()
                setAuthRoomToken(authTokenForRoom)
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
            } else if (type === 'VisionaryRoom') {
                console.log('Generating auth token for room as MEMBER... [VisionaryRoom]')
                authTokenForRoom = await joinVisionaryRoom(creatorId)
                setAuthRoomToken(authTokenForRoom)
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
            console.log('joining the room');
            const leaveRoomSuccessful = await _handleRoomLeave();

            if (leaveRoomSuccessful) {
                const commonParams = {
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
                };
                if (type === 'VisionaryRoom') {
                    const didNavigate = navigateToRouteInHierarchy('VisionaryWatchParty', commonParams);
                    if (!didNavigate) {
                        console.warn('VisionaryWatchParty route not found in current/parent navigator');
                    }
                } else {
                    const didNavigate = navigateToRouteInHierarchy('StartWatchPartyView', commonParams);
                    if (!didNavigate) {
                        console.warn('StartWatchPartyView route not found in current/parent navigator');
                    }
                }
            }
        }
        console.log('joining the rooooooom');
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

    const toggleVideo = () => {
        console.log('movie: ', movie?.description)
        setIsUserVideoOn((prevState: boolean) => !prevState);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />

            <View style={styles.topcontainer}>
                <BackButton navigation={navigation} />
            </View>

            <LinearGradient colors={['#090611', '#120A26', '#08050F']} style={styles.contentBg}>
                <View style={styles.contentWrap}>
                    <View style={styles.movieCard}>
                        <LinearGradient
                            colors={[COLORS.OVERLAY_WHITE_08, COLORS.OVERLAY_WHITE_02]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.movieCardOverlay}
                        />

                        <View style={styles.moviecontainer}>
                            <Image source={{uri: movie?.portraitURL}} style={styles.poster} />
                            <View style={styles.movieMeta}>
                                <Text style={styles.movieTitle}>{movie?.title ?? 'Loading...'}</Text>
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaText}>{movie?.year || '—'}</Text>
                                    <Text style={styles.metaDot}>•</Text>
                                    <Text style={styles.metaText}>
                                        {movie?.duration ? formatMovieDuration(movie?.duration) : '...'}
                                    </Text>
                                </View>

                                <View style={styles.tagWrap}>
                                    {!!movie?.rated && <Text style={styles.drawfonttag}>{movie?.rated}</Text>}
                                    {movie?.genres?.slice(0, 2).map((g, i) => (
                                        <Text key={i} style={styles.drawfonttag}>
                                            {capitalizeFirstLetterOfString(g)}
                                        </Text>
                                    ))}
                                    {!!movie?.rating && <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>}
                                </View>
                            </View>
                        </View>

                        <Text style={styles.movieDescription}>
                            {capitalizeFirstLetterOfString(movie?.description || '')}
                        </Text>
                    </View>

                    <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                            <Text style={styles.previewLabel}>Camera Preview</Text>
                            <View
                                style={[
                                    styles.previewStatePill,
                                    isUserVideoOn ? styles.previewStatePillOn : styles.previewStatePillOff,
                                ]}>
                                <Text style={styles.previewStateText}>{isUserVideoOn ? 'Camera On' : 'Camera Off'}</Text>
                            </View>
                        </View>

                        <View style={styles.previewFrame}>
                            {videoRoomPrivileges ? (
                                hmsInstanceRef.current && previewVideoTrack ? (
                                    isUserVideoOn ? (
                                        <hmsInstanceRef.current.HmsView
                                            trackId={previewVideoTrack.trackId}
                                            scaleType={HMSVideoViewMode.ASPECT_FILL}
                                            style={styles.previewVideo}
                                            mirror={true}
                                        />
                                    ) : (
                                        <Text style={styles.previewFallbackText}>Camera Off</Text>
                                    )
                                ) : (
                                    <Text style={styles.previewFallbackText}>Loading preview...</Text>
                                )
                            ) : (
                                <Image source={{uri: user?.profilePicture}} style={styles.previewVideo} resizeMode="cover" />
                            )}
                        </View>
                    </View>

                    <View style={styles.controlsArea}>
                        {videoRoomPrivileges && (
                            <Pressable onPress={toggleVideo} style={styles.videoToggleButton}>
                                <Icon
                                    name={isUserVideoOn ? 'video' : 'video-off'}
                                    type="material-community"
                                    size={28}
                                    color={isUserVideoOn ? COLORS.CATPURPLGT : COLORS.CATREDLGT}
                                />
                                <Text style={styles.videoToggleText}>
                                    {isUserVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
                                </Text>
                            </Pressable>
                        )}
                        <AkcruButtons.XlLrgButton
                            disabled={!canJoinRoom}
                            onPress={_handleJoinRoom}
                            btnname="Join Room"
                            color={COLORS.AKCRUBLUE}
                            variant="auth"
                        />
                    </View>
                </View>
            </LinearGradient>

            <Recommendations />
        </SafeAreaView>
    );
};

export default WatchPartyPreview;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#07040E',
    },
    contentBg: {
        flex: 1,
    },
    contentWrap: {
        flex: 1,
        paddingHorizontal: 15,
        paddingBottom: 12,
    },
    topcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    poster: {
        width: 74,
        height: 108,
        borderRadius: 8,
    },
    movieCard: {
        padding: 12,
        backgroundColor: COLORS.SURFACE_ELEVATED,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_12,
    },
    movieCardOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    moviecontainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    movieMeta: {
        flex: 1,
        marginLeft: 12,
    },
    movieTitle: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    metaText: {
        ...FONTS.Title2,
        fontSize: 12,
        color: '#D8D2E9',
    },
    metaDot: {
        color: '#8A7BAA',
        marginHorizontal: 8,
        fontSize: 14,
        lineHeight: 14,
    },
    tagWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 6,
        marginBottom: 6,
        borderRadius: 6,
        textAlign: 'center',
    },
    movieDescription: {
        ...FONTS.paragraph1,
        fontSize: 12,
        color: '#D3CDE4',
        marginTop: 10,
    },
    previewCard: {
        marginTop: 14,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_16,
        backgroundColor: '#0B0715',
        flex: 1,
        minHeight: 240,
    },
    previewHeader: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    previewLabel: {
        ...FONTS.Title2,
        color: '#F5EEFF',
    },
    previewStatePill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    previewStatePillOn: {
        backgroundColor: 'rgba(80, 215, 126, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(80, 215, 126, 0.5)',
    },
    previewStatePillOff: {
        backgroundColor: 'rgba(255, 99, 99, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 99, 99, 0.5)',
    },
    previewStateText: {
        ...FONTS.Title2,
        fontSize: 11,
        color: COLORS.WHITE,
    },
    previewFrame: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewVideo: {
        width: '100%',
        height: '100%',
    },
    previewFallbackText: {
        ...FONTS.Title2,
        color: '#E8E2F7',
    },
    controlsArea: {
        paddingTop: 14,
        paddingBottom: 12,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    videoToggleButton: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: COLORS.OVERLAY_WHITE_08,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_16,
    },
    videoToggleText: {
        ...FONTS.Title2,
        color: '#ECE6FF',
        marginLeft: 10,
    },
});
