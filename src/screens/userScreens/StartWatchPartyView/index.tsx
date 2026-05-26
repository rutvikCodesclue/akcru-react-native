import {View, Platform, SafeAreaView, StyleSheet} from 'react-native';
import React from 'react';
import WatchPartyHeader from '../../../components/WatchPartyHeader/WatchPartyHeader';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useState, useRef, useEffect} from 'react';
import {findMovieById} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {supabaseRealtime} from '../../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import {
    HMSConfig,
    HMSException,
    HMSPeer,
    HMSPeerUpdate,
    HMSRoom,
    HMSSDK,
    HMSTrack,
    HMSTrackType,
    HMSTrackUpdate,
    HMSUpdateListenerActions,
    HMSTrackSettings,
    HMSAudioTrackSettings,
    HMSVideoTrackSettings,
    HMSTrackSettingsInitState,
    HMSAudioDevice,
    HMSAudioMode,
} from '@100mslive/react-native-hms';
import useAuthStore from '../../../stores/auth.store';
import Orientation from 'react-native-orientation-locker';
import {VideoRef} from 'react-native-video';
import {IUserProfile} from '../../../../types';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {checkRoomTime} from '../../../util/checkRoomTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import {supabase} from '../../../../lib/supabase';
import WatchPartyDocker from '../../../components/WatchPartyDocker';
import MovieScreen from './MovieScreen';
import UserVideos from './UserVideos';
import UserControls from './UserControls';
import TopContainer from './TopContainer';
import {completeMITAttendance, updateMITHostId} from '../../../lib/api/mit.lib';
import {updateCruViewHostId} from '../../../lib/api/cru.lib';
import {VolumeManager} from 'react-native-volume-manager';
import {MemberInfo, PeerTrackNode, WatchPartyViewProps} from './WatchPartyProps';
import {
    _updateNode,
    _updateNodeWithPeer,
    removeNodeWithPeerId,
    updateHost,
    updateMembersList,
} from './PeersAndUserManagement';

const StartWatchPartyView = ({navigation, route}: WatchPartyViewProps) => {
    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);

    const viewId: string | null = route.params?.inviteId ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const creatorID = route.params?.creatorId ?? null;
    const inviteeId: IUserProfile | null = route.params?.invitee?.id ?? null;

    const movieId = route.params?.movieId;
    const roomId = route.params?.roomId;
    const roomAuthToken = route.params?.roomAuthToken;
    const micInitialState = route.params?.micInitialState;
    const cameraInitialState = route.params?.cameraInitialState;
    const timezone = route.params?.Timezone;
    const movieTime = route.params?.Movietime;
    const viewtype = route.params?.type;
    const videoRoomPrivileges = viewtype === "CRUView" ? route.params?.videoRoomPrivileges : true; // give video room priveleges if its a MIT

    const [movie, setMovie] = useState<IMovie | null>(null);
    const [peerTrackNodes, setPeerTrackNodes] = useState<PeerTrackNode[] | []>([]);

    const [isStreamOpen, setIsStreamOpen] = useState(false);
    const [isMoviePlaying, setIsMoviePlaying] = useState(false);
    const [isMicOn, setIsMicOn] = useState<boolean>(micInitialState);
    const [isUserVideoOn, setIsUserVideoOn] = useState(cameraInitialState);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<number | undefined>(undefined);
    const [expandedVideo, setExpandedVideo] = useState<PeerTrackNode | null>(null);
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const [members, setMembers] = useState<MemberInfo[] | []>([]);
    const [peersMuteStatus, setPeersMuteStatus] = useState<{[key: string]: boolean | undefined}>({});
    const [Timezone] = useState<string>(timezone);
    const [Movietime] = useState<string>(movieTime);

    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    const syncChannelRef = useRef<RealtimeChannel | null>(null);
    const roomChannelRef = useRef<RealtimeChannel | null>(null);
    const videoPlayerRef = useRef<VideoRef | null>(null);
    const isSyncedWithHost = useRef<boolean | null>(null);

    const isFocused = useIsFocused();
    const {startTimer, pauseTimer, resetTimer} = useWatchTimeStore();
    const {user} = useAuthStore();
    const isCurrentUserCreator = user?.id === creatorID;
    const receiverUserId = isCurrentUserCreator ? inviteeId : creatorID;
    const receiverProfilePicture = isCurrentUserCreator ? user?.profilePicture : creator?.profilePicture;
    const receiverUsername = isCurrentUserCreator ? invitee?.username : creator?.username;
    const [requestingUser, setRequestingUser] = useState<IUserProfile | undefined>(undefined);
    const [showUnmuteModal, setShowUnmuteModal] = useState(false);
    const [currentRoomHost, setCurrentRoomHost] = useState<string | undefined>(undefined);
    const currentRoomHostRef = useRef(currentRoomHost);
    const currentTimeRef = useRef(currentTime);
    const membersRef = useRef(members);
    const channelllRef = useRef(channelll);
    const isMoviePlayingRef = useRef(isMoviePlaying);
    const hasSubmittedMitAttendanceRef = useRef(false);

    route.params = {
        ...route.params,
        additionalParam: 'Additional Value',
        mItInviteId: movieId,
        userId: receiverUserId,
        profilePicture: receiverProfilePicture,
        username: receiverUsername,
    };

    useEffect(() => {
        currentRoomHostRef.current = currentRoomHost;
    }, [currentRoomHost]);

    useEffect(() => {
        currentTimeRef.current = currentTime;
    }, [currentTime]);

    useEffect(() => {
        membersRef.current = members;
    }, [members]);

    useEffect(() => {
        channelllRef.current = channelll;
    }, [channelll]);

    useEffect(() => {
        isMoviePlayingRef.current = isMoviePlaying;
    }, [isMoviePlaying]);

    useEffect(() => {
        const inviteId = typeof viewId === 'string' ? viewId : '';
        const bothParticipantsPresent = members.length >= 2;
        const hasWatchedTenMinutes = (currentTime ?? 0) >= 600;

        if (
            viewtype !== 'MITInvite' ||
            !inviteId ||
            hasSubmittedMitAttendanceRef.current ||
            !bothParticipantsPresent ||
            !hasWatchedTenMinutes
        ) {
            return;
        }

        const storageKey = `mit_attendance_submitted_${inviteId}`;
        let isCancelled = false;

        const submitAttendanceOnce = async () => {
            try {
                const alreadySubmitted = await AsyncStorage.getItem(storageKey);
                if (alreadySubmitted === '1') {
                    hasSubmittedMitAttendanceRef.current = true;
                    return;
                }

                hasSubmittedMitAttendanceRef.current = true;
                const success = await completeMITAttendance(inviteId);

                if (isCancelled) {
                    return;
                }

                if (success) {
                    await AsyncStorage.setItem(storageKey, '1');
                } else {
                    hasSubmittedMitAttendanceRef.current = false;
                }
            } catch (error) {
                if (!isCancelled) {
                    hasSubmittedMitAttendanceRef.current = false;
                }
            }
        };

        submitAttendanceOnce();

        return () => {
            isCancelled = true;
        };
    }, [currentTime, members.length, viewId, viewtype]);

    useEffect(() => {
        const channelA = supabase.channel(roomId);
        channelA
            .on('broadcast', {event: 'mute-all'}, payload => muteLocalPeer(payload))
            .on('broadcast', {event: 'guest-mic-unmute'}, payload => handleUnmuteRequest(payload))
            .on('broadcast', {event: 'host-change'}, payload => syncHost(payload))
            .on('broadcast', {event: 'terminate-room'}, payload => leaveTheRoom(payload))
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setChannel(channelA);
                }
            });

        return () => {
            channelA.unsubscribe();
            setChannel(null);
        };
    }, [roomId, currentRoomHost, isMicOn, hmsInstanceRef]);

    const muteLocalPeer = async (payload: any) => {
        if (payload.payload.muteAll) {
            const localPeer = await hmsInstanceRef.current?.getLocalPeer();
            localPeer?.localAudioTrack()?.setMute(true);
            setIsMicOn(false);
        }
    };

    const handleUnmuteRequest = async (payload: any) => {
        if (currentRoomHost === user?.id && payload.payload.permissionType! === 'request') {
            setRequestingUser(payload.payload.requestedBy);
            setShowUnmuteModal(true);
        }
        if (
            currentRoomHost !== user?.id &&
            payload.payload.permissionType === 'reqans' &&
            payload.payload.requestedBy.id === user?.id
        ) {
            if (payload.payload.unmutePermissionGiven) {
                const localPeer = await hmsInstanceRef.current?.getLocalPeer();
                if (localPeer) {
                    localPeer?.localAudioTrack()?.setMute(false);
                    setIsMicOn(true);
                }
            }
        }
    };

    const syncHost = async (payload: any) => {
        if (payload.payload.hostChanged) {
            await updateHost(3, viewtype, viewId, setCurrentRoomHost);
        } else {
            return;
        }
    };

    const updateHostId = async (newHostId: string | undefined) => {
        if (viewtype === 'CRUView') {
            const hostChangeSuccess = await updateCruViewHostId(viewId, newHostId);
            return hostChangeSuccess;
        }

        if (viewtype === 'MITInvite') {
            const hostChangeSuccess = await updateMITHostId(viewId, newHostId);
            return hostChangeSuccess;
        }
    };

    const onHostSelect = async (newHostId: string | undefined) => {
        const hostChangeSuccess = await updateHostId(newHostId);

        if (hostChangeSuccess) {
            // inform everyone that you changed the host and everyone should update their host
            if (channelll === null) {
                console.log('Channel not found: ', user?.username);
                return;
            }

            channelll.send({
                type: 'broadcast',
                event: 'host-change',
                payload: {hostChanged: true},
            });
            console.log('Broadcast sent for host change by: ', user?.username);

            // update who the host is on your end
            await updateHost(3, viewtype, viewId, setCurrentRoomHost);
        }
    };

    useEffect(() => {
        RestrictPartyRoom();
        const joinRoom = async () => {
            await _join100msRoom();
            console.log('Join room');
            await _setupRoomChannels();
            if (Platform.OS === 'ios') {
                await VolumeManager.setMode('VideoChat');
            }
        };

        async function onMount() {
            await joinRoom(); // Initial room join

            const res = await findMovieById(movieId);
            if (res) {
                setMovie(res);
                setIsLoading(false);
            }
        }
        onMount();
        updateHost(3, viewtype, viewId, setCurrentRoomHost);
    }, [movieId, viewId, viewtype, currentRoomHost]);

    useEffect(() => {
        (async function updateVolumeModeIOS() {
            if (Platform.OS !== 'ios') {
                return;
            } else if (isMicOn) {
                await VolumeManager.setMode('VideoChat');
            } else if (isMoviePlaying) {
                await VolumeManager.setMode('MoviePlayback');
            }
        })();
    }, [isMicOn, isMoviePlaying]);

    useFocusEffect(
        React.useCallback(() => {
            const navChain: any[] = [];
            let cursor: any = navigation.getParent?.();
            while (cursor) {
                navChain.push(cursor);
                cursor = cursor.getParent?.();
            }
            navChain.forEach(nav => {
                nav?.setOptions?.({
                    tabBarStyle: {display: 'none'},
                });
            });

            if (isMoviePlaying) {
                startTimer();
            }

            return () => {
                navChain.forEach(nav => {
                    nav?.setOptions?.({
                        tabBarStyle: undefined,
                    });
                });

                if (isFocused) {
                    console.log('pausing timer...');
                    pauseTimer();
                } else {
                    console.log('resetting timer...');

                    resetTimer();
                }
            };
        }, [isMoviePlaying, isFocused, pauseTimer, resetTimer, startTimer]),
    );

    useEffect(() => {
        updateMembersList(peerTrackNodes, setMembers);
    }, [peerTrackNodes]);

    const RestrictPartyRoom = () => {
        const room_time_limit = checkRoomTime(Timezone, Movietime);
        if (room_time_limit) {
            AsyncStorage.setItem('isRoomTimeLimitCompleted', 'true');
            navigation.navigate('ClientTabNavigator', {screen: 'UserProfileScreen', params: {tabKey: 2}});
        } else {
            setTimeout(() => {
                RestrictPartyRoom();
            }, Number(ROOM_VALIDATION_CHECK_TIME));
        }
    };

    const _setupRoomChannels = async () => {
        let roomChannel: RealtimeChannel | null = null;
        let syncChannel: RealtimeChannel | null = null;

        if (roomId) {
            roomChannel = supabaseRealtime.channel(`room-${roomId}`, {
                config: {
                    broadcast: {},
                },
            });
            syncChannel = supabaseRealtime.channel(`room-${roomId}/sync`, {
                config: {
                    presence: {},
                },
            });

            roomChannelRef.current = roomChannel;
            syncChannelRef.current = syncChannel;

            __handleRoomChannelEventsAndSubscribe();
        }
    };

    const _join100msRoom = async () => {
        let hmsInstance: HMSSDK | null = null;

        if (hmsInstanceRef.current == null) {
            let audioSettings = new HMSAudioTrackSettings({
                initialState: micInitialState ? HMSTrackSettingsInitState.UNMUTED : HMSTrackSettingsInitState.MUTED,
            });

            let videoSettings = new HMSVideoTrackSettings({
                initialState: cameraInitialState ? HMSTrackSettingsInitState.UNMUTED : HMSTrackSettingsInitState.MUTED,
            });

            const trackSettings = new HMSTrackSettings({
                video: videoSettings,
                audio: audioSettings,
            });

            hmsInstance = await HMSSDK.build({
                trackSettings,
            });

            hmsInstanceRef.current = hmsInstance;
        }

        hmsInstance = hmsInstanceRef.current;

        if (roomId && roomAuthToken) {
            await hmsInstance.switchAudioOutput(HMSAudioDevice.SPEAKER_PHONE);
            await hmsInstance?.setAudioMode(HMSAudioMode.MODE_NORMAL);

            if (hmsInstance) {
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, __onErrorListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, __onJoinListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, __onPeerListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, __onTrackListener);

                if (roomAuthToken && user) {
                    let config = new HMSConfig({
                        authToken: roomAuthToken,
                        username: user.username,
                    });

                    hmsInstance.join(config);
                }
            }
        }
    };

    const leaveTheRoom = async (payload: any) => {
        if (payload.payload.terminate) {
            await handleRoomLeaving();
        }
    };

    const sendRoomTermination = () => {
        if (channelll === null) {
            console.log('Channel not found');
            return;
        }

        channelll.send({
            type: 'broadcast',
            event: 'terminate-room',
            payload: {terminate: true},
        });
    };

    const handleEndRoom = async () => {
        if (hmsInstanceRef.current) {
            const hostUpdateSuccess = await updateHostId(creatorID);

            if (hostUpdateSuccess) {
                sendRoomTermination();
                await handleRoomLeaving();
            }
        }
    };

    const handleRoomLeaving = async () => {
        console.log('Nav start');
        Orientation.lockToPortrait();
        navigation.navigate('ClientTabNavigator', {screen: 'UserProfileScreen', params: {tabKey: 4}});
        console.log('Nav end');
        if (hmsInstanceRef.current) {
            console.log('Leaving the watchparty room [StartWatchPartyView]...');
            hmsInstanceRef.current.leave();

            console.log('Destroying hmsInstance [StartWatchPartyView]...');
            hmsInstanceRef.current.destroy();
        }

        hmsInstanceRef.current = null;

        resetTimer();
    };

    const __handleRoomChannelEventsAndSubscribe = () => {
        type ISyncObject = {
            newCurrentTime: number;
            timestamp: string;
            isMoviePlaying: boolean;
        };

        if (syncChannelRef.current) {
            syncChannelRef.current
                .on('presence', {event: 'sync'}, () => {
                    try {
                        if (syncChannelRef.current) {
                            let newSyncState = syncChannelRef.current.presenceState();
                            let syncObject: any = Object.values(newSyncState)[0];
                            if (syncObject) {
                                syncObject = syncObject as [ISyncObject];
                                const newCurrentTime = syncObject[0].currentTime;
                                const isMoviePlayingFromHost = syncObject[0].isMoviePlaying;
                                if (currentRoomHost !== user?.id) {
                                    if (videoPlayerRef.current) {
                                        const currentPlayBackTime = currentTimeRef.current ?? 0;
                                        const timeDifference = Math.abs(newCurrentTime - currentPlayBackTime);
                                        if (timeDifference > 1.5 || !currentTimeRef.current) {
                                            // Sync if the difference is greater than 5 seconds
                                            videoPlayerRef.current?.seek(newCurrentTime); // Seek guest's player to host's time
                                            setCurrentTime(newCurrentTime);
                                            setIsMoviePlaying(isMoviePlayingFromHost);
                                            isSyncedWithHost.current = true;
                                        } else {
                                            // console.log(`Guest is in sync. No action needed. Time difference: ${timeDifference} seconds.`);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error('error syncing:', error);
                    }
                })
                .subscribe();
        }

        if (roomChannelRef.current) {
            roomChannelRef.current
                .on('broadcast', {event: 'start-movie'}, () => {
                    if (currentRoomHost !== user?.id && videoPlayerRef.current) {
                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'play-movie'}, () => {
                    if (currentRoomHost !== user?.id && videoPlayerRef.current) {
                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'pause-movie'}, () => {
                    if (currentRoomHost !== user?.id && videoPlayerRef.current) {
                        setIsMoviePlaying(false);
                    }
                })
                .on('broadcast', {event: 'seek-movie'}, payload => {
                    if (currentRoomHost !== user?.id && videoPlayerRef.current) {
                        videoPlayerRef.current.seek(Number(payload.payload.seekTime));
                    }
                })
                .on('broadcast', {event: 'close-movie'}, payload => {
                    console.log(payload);
                })
                .on('broadcast', {event: 'exit-movie'}, () => {
                    if (currentRoomHost !== user?.id && videoPlayerRef.current) {
                        setIsFullscreen(false);
                        Orientation.lockToPortrait();
                    }
                })
                .on('broadcast', {event: 'mute-peer'}, async payload => {
                    const {peerID, isMuted} = payload.payload;
                    const localPeer = await hmsInstanceRef.current?.getLocalPeer();

                    setPeersMuteStatus(prevStatus => ({
                        ...prevStatus,
                        [peerID]: isMuted,
                    }));

                    if (localPeer && peerID === localPeer.peerID) {
                        setIsMicOn(!isMuted);
                    }
                })
                .subscribe();
        }
    };

    /*
        100ms Event Listeners
    */

    const __onErrorListener = (data: HMSException) => {
        // console.log('=== 100ms Error ===:', data);

        if (data.code === 1003 || data.code === 4005) {
            console.log('User failed to reconnect...');
            handleRoomLeaving();
        }
    };

    const __onJoinListener = async (data: {room: HMSRoom}) => {
        const {localPeer, peers} = data.room;

        if (localPeer) {
            setPeerTrackNodes(prevPeerTrackNodes =>
                _updateNode({
                    nodes: prevPeerTrackNodes,
                    peer: localPeer,
                    track: localPeer.videoTrack,
                    createNew: true,
                }),
            );
        } else {
            console.log('localPeer is null');
        }

        peers.forEach(peer => {
            if (peer.peerID !== localPeer.peerID) {
                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNode({
                        nodes: prevPeerTrackNodes,
                        peer: peer,
                        track: peer.videoTrack,
                        createNew: true,
                    }),
                );

                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNode({
                        nodes: prevPeerTrackNodes,
                        peer: peer,
                        track: peer.audioTrack,
                        createNew: true,
                    }),
                );
            }
        });

        await updateHost(3, viewtype, viewId, setCurrentRoomHost);
    };

    const __onPeerListener = async ({peer, type}: {peer: HMSPeer; type: HMSPeerUpdate}) => {
        if (type === HMSPeerUpdate.PEER_JOINED) {
            setPeerTrackNodes(prevPeerTrackNodes =>
                _updateNode({
                    nodes: prevPeerTrackNodes,
                    peer,
                    track: peer.videoTrack,
                    createNew: true,
                }),
            );

            setPeerTrackNodes(prevPeerTrackNodes =>
                _updateNode({
                    nodes: prevPeerTrackNodes,
                    peer,
                    track: peer.audioTrack,
                    createNew: true,
                }),
            );

            return;
        }

        if (type === HMSPeerUpdate.PEER_LEFT) {
            setPeerTrackNodes(prevPeerTrackNodes => removeNodeWithPeerId(prevPeerTrackNodes, peer.peerID));
            const userThatLeft = membersRef.current.find(member => member.peerID === peer.peerID);
            console.log('User That Left: ', userThatLeft?.name);
            if (userThatLeft?.user.id === currentRoomHost) {
                const peersInRoom = (await hmsInstanceRef.current?.getRoom())?.peers;
                if (peersInRoom && peersInRoom.length > 0) {
                    const newHost = membersRef.current.find(member => member.peerID === peersInRoom[0].peerID);
                    if (newHost?.user.id === user?.id) {
                        onHostSelect(user?.id);
                    }
                }
            }
            return;
        }

        if (peer.isLocal) {
            setPeerTrackNodes(prevPeerTrackNodes =>
                _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
            );
            return;
        }
    };

    const __onTrackListener = ({track, peer, type}: {track: HMSTrack; peer: HMSPeer; type: HMSTrackUpdate}) => {
        if (track.type === HMSTrackType.VIDEO) {
            if (type === HMSTrackUpdate.TRACK_ADDED) {
                if (!peer.isLocal) {
                    setPeerTrackNodes(prevPeerTrackNodes =>
                        _updateNode({
                            nodes: prevPeerTrackNodes,
                            peer,
                            track,
                            createNew: true,
                        }),
                    );
                }
            }

            if (
                type === HMSTrackUpdate.TRACK_MUTED ||
                type === HMSTrackUpdate.TRACK_UNMUTED ||
                type === HMSTrackUpdate.TRACK_RESTORED ||
                type === HMSTrackUpdate.TRACK_DEGRADED
            ) {
                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
                );
            }
        } else if (track.type === HMSTrackType.AUDIO) {
            if (type === HMSTrackUpdate.TRACK_ADDED) {
                if (!peer.isLocal) {
                    setPeerTrackNodes(prevPeerTrackNodes =>
                        _updateNodeWithPeer({
                            nodes: prevPeerTrackNodes,
                            peer,
                            createNew: true,
                        }),
                    );
                }
            }

            if (type === HMSTrackUpdate.TRACK_MUTED) {
                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
                );
            }
            if (type === HMSTrackUpdate.TRACK_UNMUTED) {
                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
                );
            }

            if (type === HMSTrackUpdate.TRACK_MUTED || type === HMSTrackUpdate.TRACK_UNMUTED) {
                const isMuted = track.isMute();
                if (isMuted !== undefined) {
                    setPeersMuteStatus(prevStatus => ({
                        ...prevStatus,
                        [peer.peerID]: isMuted,
                    }));
                }
                if (peer.isLocal) {
                    setIsMicOn(!isMuted);
                }
            }
        }
    };
    return (
        <SafeAreaView style={[styles.safeArea, isFullscreen && styles.safeAreaFullscreen]}>
            {!isFullscreen && (
                <View style={styles.headerLayer}>
                    <WatchPartyHeader />
                </View>
            )}

            <View style={styles.contentWrap}>
                {!isFullscreen && (
                    <View style={styles.topContainerWrap}>
                        <TopContainer
                            currentRoomHost={currentRoomHost}
                            user={user}
                            members={members}
                            handleRoomLeaving={handleRoomLeaving}
                            handleEndRoom={handleEndRoom}
                            handleChangeHost={onHostSelect}
                        />
                    </View>
                )}

                <View style={styles.movieStageWrap}>
                    <MovieScreen
                        currentRoomHost={currentRoomHost}
                        user={user}
                        isStreamOpen={isStreamOpen}
                        movie={movie}
                        isSyncedWithHost={isSyncedWithHost}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                        isMoviePlaying={isMoviePlaying}
                        setIsMoviePlaying={setIsMoviePlaying}
                        hasLottieFirstLoopCompleted={hasLottieFirstLoopCompleted}
                        setHasLottieFirstLoopCompleted={setHasLottieFirstLoopCompleted}
                        setCurrentTime={setCurrentTime}
                        roomChannelRef={roomChannelRef}
                        videoPlayerRef={videoPlayerRef}
                        syncChannelRef={syncChannelRef}
                        videoRoomPrivileges={videoRoomPrivileges}
                    />
                </View>

                {currentRoomHost ? (
                    !isFullscreen ? (
                        <View style={styles.userVideosWrap}>
                            <UserVideos
                                currentHmsInstance={hmsInstanceRef.current}
                                peerTrackNodes={peerTrackNodes}
                                expandedVideo={expandedVideo}
                                setExpandedVideo={setExpandedVideo}
                                peersMuteStatus={peersMuteStatus}
                                currentRoomHost={currentRoomHost}
                                members={members}
                                videoRoomPrivileges={videoRoomPrivileges}
                            />
                        </View>
                    ) : (
                        <View style={styles.dockerWrap}>
                            <WatchPartyDocker
                                members={members}
                                hmsInstanceRef={hmsInstanceRef}
                                peersMuteStatus={peersMuteStatus}
                                currentRoomHost={currentRoomHost}
                                peerTrackNodes={peerTrackNodes}
                                videoRoomPrivileges={videoRoomPrivileges}
                            />
                        </View>
                    )
                ) : null}

                {currentRoomHost && !isFullscreen ? (
                    <View style={styles.controlsWrap}>
                        <UserControls
                            channel={channelll}
                            currentRoomHost={currentRoomHost}
                            members={members}
                            user={user}
                            requestingUser={requestingUser}
                            showUnmuteModal={showUnmuteModal}
                            setShowUnmuteModal={setShowUnmuteModal}
                            isUserVideoOn={isUserVideoOn}
                            setIsUserVideoOn={setIsUserVideoOn}
                            isMicOn={isMicOn}
                            setIsMicOn={setIsMicOn}
                            currentHmsInstance={hmsInstanceRef.current}
                            videoRoomPrivileges={videoRoomPrivileges}
                        />
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
};

export default StartWatchPartyView;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#050508',
    },
    safeAreaFullscreen: {
        backgroundColor: '#000000',
    },
    headerLayer: {
        zIndex: 20,
    },
    contentWrap: {
        flex: 1,
    },
    topContainerWrap: {
        zIndex: 15,
    },
    movieStageWrap: {
        flex: 1,
    },
    userVideosWrap: {
        zIndex: 10,
    },
    dockerWrap: {
        zIndex: 25,
    },
    controlsWrap: {
        zIndex: 12,
    },
});
