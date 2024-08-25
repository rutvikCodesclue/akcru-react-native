import {View, SafeAreaView, StatusBar} from 'react-native';
import React from 'react';
import WatchPartyHeader from '../../../components/WatchPartyHeader/WatchPartyHeader';
import {SIZES} from '../../../../assets/constants';
import {RouteProp, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useState, useRef, useEffect} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
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
    HMSRoomUpdate,
    HMSSDK,
    HMSTrack,
    HMSTrackSource,
    HMSTrackType,
    HMSTrackUpdate,
    HMSUpdateListenerActions,
    HMSVideoViewMode,
    HMSSpeaker,
    HMSMessage,
    HMSTrackSettings,
    HMSAudioTrackSettings,
    HMSVideoTrackSettings,
    HMSTrackSettingsInitState,
} from '@100mslive/react-native-hms';
import useAuthStore from '../../../stores/auth.store';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import Orientation from 'react-native-orientation-locker';
import Video, {OnProgressData, OnSeekData} from 'react-native-video';
import {IUserProfile} from '../../../../types';
import {findAUser} from '../../../lib/api/user.lib';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {checkRoomTime} from '../../../util/checkRoomTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import {supabase} from '../../../../lib/supabase';
import UnmutePermissionPopup from './unmutepermpopup';
import ErrorModal from './ErrorModal';
import WatchPartyDocker from '../../../components/WatchPartyDocker';
import MovieScreen from './MovieScreen';
import UserVideos from './UserVideos';
import UserControls from './UserControls';
import HostOptionsModal from './HostOptionsModal';
import HostTransferModal from './HostTransferModal';
import TerminateRoomModal from './TerminateRoomModal';
import HostLeaveRoomModal from './HostLeaveRoomModal';
import LeaveRoomModal from './LeaveRoomModal';
import TopContainer from './TopContainer';
import HostNotFoundModal from './HostNotFoundModal';
import AwaitingMicPermModal from './AwaitingMicPermModal';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';
import {getMITHostId, updateMITHostId} from '../../../lib/api/mit.lib';
import {getCruViewHostId, updateCruViewHostId} from '../../../lib/api/cru.lib';
import {VolumeManager} from 'react-native-volume-manager';

type StartWatchPartyViewNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'StartWatchPartyView'>;

type StartWatchPartyViewRouteProp = RouteProp<NoBottomTabStackParams, 'StartWatchPartyView'>;

type Props = {
    navigation: StartWatchPartyViewNavigationProp;
    route: StartWatchPartyViewRouteProp;
    movieName: string;
    movieId: string;
    roomId: string;
    roomAuthToken: string;
    micInitialState: boolean;
    cameraInitialState: boolean;
    isHost: boolean;
    inviteId: any;
    creator: any;
    invitee: any;
    Timezone: string;
    Movietime: string;
    cru: any;
    type: any;
};

type PeerTrackNode = {
    id: string;
    peer: HMSPeer;
    track: HMSTrack | undefined;
};

type MemberInfo = {
    peerID: string | undefined;
    role: string | undefined;
    name: string | undefined;
    isLocal: boolean | undefined;
    user: IUserProfile;
};

const StartWatchPartyView = ({navigation, route}: Props) => {
    const [channelll, setChannel] = useState<RealtimeChannel | null>(null);

    const viewId: string | null = route.params?.inviteId ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const creatorID = route.params?.creatorId ?? null;
    const inviteeId: IUserProfile | null = route.params?.invitee?.id ?? null;

    let isHost = route.params?.isHost;
    const movieId = route.params?.movieId;
    const roomId = route.params?.roomId;
    const roomAuthToken = route.params?.roomAuthToken;
    const micInitialState = route.params?.micInitialState;
    const cameraInitialState = route.params?.cameraInitialState;
    const timezone = route.params?.Timezone;
    const movieTime = route.params?.Movietime;
    const cru = route.params?.cru;
    const viewtype = route.params?.type;

    const [movie, setMovie] = useState<IMovie | null>(null);
    const [peerTrackNodes, setPeerTrackNodes] = useState<PeerTrackNode[] | []>([]);

    const [isStreamOpen, setIsStreamOpen] = useState(false);
    const [isMoviePlaying, setIsMoviePlaying] = useState(false);
    const [isMicOn, setIsMicOn] = useState(micInitialState);
    const [isUserVideoOn, setIsUserVideoOn] = useState(cameraInitialState);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<number | undefined>(undefined);
    const [expandedVideo, setExpandedVideo] = useState<Video | null>(null);
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const [terminateRoom, setTerminateRoom] = useState(false);
    const [leaveRoom, setLeaveRoom] = useState(false);
    const [members, setMembers] = useState<MemberInfo[] | []>([]);
    const [showTransferConfirmation, setShowTransferConfirmation] = useState(false);
    const [peersMuteStatus, setPeersMuteStatus] = useState({});
    const [isStreamHost, setIsStreamHost] = useState(false);
    const [selectedMemberForHost, setSelectedMemberForHost] = useState<any>();
    const [Timezone] = useState<string>(timezone);
    const [Movietime] = useState<string>(movieTime);
    const [showDockerToHost, setShowDockerToHost] = useState(false);
    const [optionModalVisible, setOptionModalVisible] = useState(false);

    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    const syncChannelRef = useRef<RealtimeChannel | null>(null);
    const roomChannelRef = useRef<RealtimeChannel | null>(null);
    const videoPlayerRef = useRef<Video | null>(null);
    const isSyncedWithHost = useRef<boolean | null>(null);

    const isFocused = useIsFocused();
    const {startTimer, pauseTimer, resetTimer} = useWatchTimeStore();
    const {user} = useAuthStore();
    const isCurrentUserCreator = user?.id === creatorID;
    const receiverUserId = isCurrentUserCreator ? inviteeId : creatorID;
    const receiverProfilePicture = isCurrentUserCreator ? user?.profilePicture : creator?.profilePicture;
    const receiverUsername = isCurrentUserCreator ? invitee?.username : creator?.username;
    const [unmutePermPopup, setUnmutePermissionPopup] = useState(false);
    const [userRequest, setUserRequest] = useState(null);
    const [popupErr, setPopupErr] = useState(false);
    const [popupErrMsg, setPopupErrMsg] = useState('');
    const [hostNotFound, setHostNotFound] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRoomHost, setCurrentRoomHost] = useState<string | undefined>(undefined);
    const isStreamHostRef = useRef(isStreamHost);
    const currentRoomHostRef = useRef(currentRoomHost);
    const currentTimeRef = useRef(currentTime);
    const membersRef = useRef(members);
    const channelllRef = useRef(channelll);

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
        isStreamHostRef.current = isStreamHost;
    }, [isStreamHost]);

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
        const getTheVolume = async () => {
            await VolumeManager.setVolume(1.0);
            const {volume} = await VolumeManager.getVolume();
            console.log('VOLUME MANAGER: ', volume);
        };

        getTheVolume();
    }, []);

    useEffect(() => {
        console.log('Channel UseEffect triggered');
        setShowDockerToHost(isStreamHost);
        const channelA = supabase.channel(roomId);
        channelA
            .on('broadcast', {event: 'movie_room'}, payload => askForPermission(payload))
            .on('broadcast', {event: 'host-change'}, payload => syncHost(payload))
            .on('broadcast', {event: 'mute-all'}, payload => muteLocalPeer(payload))
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
    }, []);

    async function askForPermission(payload: any) {
        if (isStreamHostRef.current == true && payload.payload.permtype! === 'request') {
            setUserRequest(payload.payload.userReq!);
            setUnmutePermissionPopup(true);
        }
        if (isStreamHost != true && payload.payload.permtype! == 'reqans' && payload.payload.userReq.id! == user.id) {
            const perm = payload.payload.micunmuteperm;
            if (perm == true) {
                const localPeer = await hmsInstanceRef.current?.getLocalPeer();
                if (localPeer) {
                    localPeer?.localAudioTrack()?.setMute(!perm);
                    setIsMicOn(perm);
                    setModalVisible(false);
                }
            }
        }
    }

    const showAwaitingMicPermModal = () => {
        setModalVisible(true);
        setTimeout(() => {
            setModalVisible(false);
        }, 3000); // Modal will disappear after 3 seconds
    };

    const onSend = (permGrant, userid, permtype, userReq) => {
        if (channelll === null) {
            console.log('Channel not found');
            return;
        }

        if (permtype === 'request' && isStreamHost === true) {
            return;
        }
        channelll.send({
            type: 'broadcast',
            event: 'movie_room',
            payload: {micunmuteperm: permGrant, senderId: userid, permtype: permtype, userReq: userReq},
        });
        if (permtype === 'reqans' && isStreamHost === true) {
            setUnmutePermissionPopup(false);
        }
    };

    const updateHostId = async (newHostId: string) => {
        if (viewtype === 'CRUView') {
            const hostChangeSuccess = await updateCruViewHostId(viewId, newHostId);
            return hostChangeSuccess;
        }

        if (viewtype === 'MITInvite') {
            const hostChangeSuccess = await updateMITHostId(viewId, newHostId);
            return hostChangeSuccess;
        }
    };

    const onHostSelect = async (newHostId: string) => {
        const hostChangeSuccess = await updateHostId(newHostId);

        if (hostChangeSuccess) {
            // inform everyone that you changed the host and everyone should update their host
            if (channelllRef.current === null) {
                console.log('Channel not found');
                return;
            }

            channelllRef.current.send({
                type: 'broadcast',
                event: 'host-change',
                payload: {hostChanged: true},
            });

            // update who the host is on your end
            await updateHost();
        }

        setOptionModalVisible(false);
    };

    const syncHost = async (payload: any) => {
        if (payload.payload.hostChanged) {
            console.log('Broadcast received to change the host!');
            await updateHost();
        } else {
            return;
        }
    };

    useEffect(() => {
        RestrictPartyRoom();

        _join100msRoom().then(() => {
            _setupRoomChannels();
        });

        findMovieById(movieId).then(res => {
            if (res) {
                setMovie(res);
                setIsLoading(false);
            }
        });
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (isMoviePlaying) {
                startTimer();
            }

            return () => {
                if (isFocused) {
                    console.log('pausing timer...');
                    pauseTimer();
                } else {
                    console.log('resetting timer...');

                    resetTimer();
                }
            };
        }, [isMoviePlaying]),
    );

    useEffect(() => {
        console.log('peerTrackNodes changed...');
        console.log(
            'Current track ids:',
            peerTrackNodes.map(node => node.track?.trackId),
        );

        const updateMembersList = async () => {
            console.log('updating members lists');
            const membersWithInfo = await getAvailableMembers();

            setMembers(membersWithInfo);
        };

        updateMembersList();
    }, [peerTrackNodes]);

    /*
        ROOM HANDLERS
    */

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

    const muteLocalPeer = async (payload: any) => {
        if (payload.payload.muteAll) {
            const localPeer = await hmsInstanceRef.current?.getLocalPeer();
            console.log('muting personal audio track...');
            localPeer?.localAudioTrack()?.setMute(true);
            setIsMicOn((prevState: boolean) => !prevState);
        }
    };

    const muteAllPeers = async () => {
        if (isStreamHostRef.current) {
            try {
                await hmsInstanceRef.current?.remoteMuteAllAudio();
                if (channelll === null) {
                    console.log('Channel not found');
                    return;
                }

                channelll.send({
                    type: 'broadcast',
                    event: 'mute-all',
                    payload: {muteAll: true},
                });
                console.log('Broadcasted mute-all event');
            } catch (error) {
                console.error('Failed to mute all peers or broadcast: ', error);
            }
        }
    };

    function isHostAvailable() {
        const hostInRoom = members ? members.find(member => member.user.id === currentRoomHost) : undefined;
        if (hostInRoom) {
            return true;
        } else {
            return false;
        }
    }

    const toggleMic = async () => {
        const localPeer = await hmsInstanceRef.current?.getLocalPeer();
        if (localPeer) {
            if (isMicOn) {
                console.log('muting personal audio track...');
                localPeer?.localAudioTrack()?.setMute(true);
                setIsMicOn((prevState: boolean) => !prevState);
            } else {
                if (isStreamHost) {
                    console.log('unmuting personal audio track...');
                    localPeer?.localAudioTrack()?.setMute(false);
                    setIsMicOn((prevState: boolean) => !prevState);
                } else {
                    const isHostAva = isHostAvailable();
                    if (isHostAva) {
                        onSend(null, null, 'request', user);
                        showAwaitingMicPermModal();
                    } else {
                        setPopupErr(true);
                        setPopupErrMsg('Host not available. Please wait for the host to join!');
                    }
                }
            }
        }
    };

    const toggleVideo = async () => {
        const localPeer = await hmsInstanceRef.current?.getLocalPeer();
        if (localPeer) {
            if (isUserVideoOn) {
                console.log('muting personal video track...');
                localPeer?.localVideoTrack()?.setMute(true);
                setIsUserVideoOn(true);
            } else {
                console.log('unmuting personal video track...');
                localPeer?.localVideoTrack()?.setMute(false);
                setIsUserVideoOn(false);
            }
        }

        setIsUserVideoOn((prevState: boolean) => !prevState);
    };

    /**
     * ADDITIONAL METHODS
     */

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
            console.log('Created room and sync channels');

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
            if (hmsInstance) {
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, __onErrorListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, __onJoinListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, __onPeerListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, __onTrackListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ROOM_UPDATE, __onRoomListener);
                hmsInstance.addEventListener(
                    HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM,
                    __onRemovedFromRoomListener,
                );
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_SPEAKER, __onSpeakerListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_MESSAGE, __onMessageListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.RECONNECTED, __onReconnectedListener);
                hmsInstance.addEventListener(HMSUpdateListenerActions.RECONNECTING, __onReconnectingListener);

                if (roomAuthToken && user) {
                    let config = new HMSConfig({
                        authToken: roomAuthToken,
                        username: user.username,
                    });

                    console.log('Joining the call...');

                    hmsInstance.join(config);
                }
            }
        }
    };

    const leaveTheRoom = async (payload: any) => {
        if (payload.payload.terminate) {
            await _handleRoomLeave();
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

    const _handleTerminateRoom = async () => {
        if (hmsInstanceRef.current) {
            try {
                await hmsInstanceRef?.current.endRoom('Host Terminated Watchparty Session', false);
            } catch (error) {
                console.error('An error occurred:', error);
            }
            console.log('End Room Success');

            // this condition caters to host users who are not the host according to 100ms (original)
            if (currentRoomHostRef.current !== creatorID) {
                const hostUpdateSuccess = await updateHostId(creatorID);

                if (hostUpdateSuccess) {
                    sendRoomTermination();
                }
            }

            await _handleRoomLeave();
        }
    };

    const _handleRoomLeave = async () => {
        if (hmsInstanceRef.current) {
            console.log('Leaving the watchparty room [StartWatchPartyView]...');
            hmsInstanceRef.current.leave();

            console.log('Destroying hmsInstance [StartWatchPartyView]...');
            hmsInstanceRef.current.destroy();
        }

        hmsInstanceRef.current = null;

        resetTimer();

        navigation.reset({
            index: 0,
            routes: [{name: 'UserProfileScreen'}],
        });
        navigation.navigate('UserProfileStack', {
            screen: 'UserProfileScreen',
        });
    };

    const _handleCloseMovie = async () => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.dismissFullscreenPlayer();
            setIsFullscreen(false);
        }
        setIsStreamOpen(true);
    };

    const _handleStartMovie = async () => {
        console.log('Starting the movie...');

        if (isStreamHost && videoPlayerRef.current) {
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'start-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
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
                                if (!isStreamHostRef.current) {
                                    if (videoPlayerRef.current) {
                                        // console.log('New Current Time: ', newCurrentTime);
                                        // console.log('My current time: ', currentTimeRef.current);
                                        const timeDifference = Math.abs(newCurrentTime - currentTimeRef.current);
                                        if (timeDifference > 1.5 || !currentTimeRef.current) { // Sync if the difference is greater than 5 seconds
                                            // console.log(
                                            //     `SYNC State [${isSyncedWithHost.current}]: Guest is out of sync by ${timeDifference} seconds. Syncing video player to ${newCurrentTime} seconds... host play status [${isMoviePlayingFromHost}]`,
                                            // );
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
                .on('broadcast', {event: 'start-movie'}, payload => {
                    if (!isStreamHostRef.current && videoPlayerRef.current) {
                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'play-movie'}, payload => {
                    if (!isStreamHostRef.current && videoPlayerRef.current) {
                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'pause-movie'}, payload => {
                    if (!isStreamHostRef.current && videoPlayerRef.current) {
                        setIsMoviePlaying(false);
                    }
                })
                .on('broadcast', {event: 'seek-movie'}, payload => {
                    if (!isStreamHostRef.current && videoPlayerRef.current) {
                        videoPlayerRef.current.seek(Number(payload.payload.seekTime));
                    }
                })
                .on('broadcast', {event: 'close-movie'}, payload => {
                    console.log(payload);
                })
                .on('broadcast', {event: 'exit-movie'}, payload => {
                    if (!isStreamHostRef.current && videoPlayerRef.current) {
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

            console.log('Subscribed to room channel');
        }
    };

    const getPeerTrackNodeId = (peer: HMSPeer, track: HMSTrack | undefined) => {
        return peer.peerID + (track?.source ?? HMSTrackSource.REGULAR);
    };

    const createPeerTrackNode = (peer: HMSPeer, track?: HMSTrack | undefined): PeerTrackNode => {
        let isVideoTrack = false;
        if (track && track?.type === HMSTrackType.VIDEO) {
            isVideoTrack = true;
        }
        const videoTrack = isVideoTrack ? track : undefined;
        return {
            id: getPeerTrackNodeId(peer, track),
            peer: peer,
            track: videoTrack,
        };
    };

    const removeNodeWithPeerId = (nodes: PeerTrackNode[], peerID: string) => {
        return nodes.filter(node => node.peer.peerID !== peerID);
    };

    const _updateNode = (data: {
        nodes: PeerTrackNode[];
        peer: HMSPeer;
        track: HMSTrack | undefined;
        createNew?: boolean;
    }): PeerTrackNode[] => {
        const {nodes, peer, track, createNew = false} = data;

        const uniqueId = getPeerTrackNodeId(peer, track);

        const nodeExists = nodes.some(node => node.id === uniqueId);

        if (nodeExists) {
            return nodes.map(node => {
                if (node.id === uniqueId) {
                    return {...node, peer, track};
                }
                return node;
            });
        }

        if (!createNew) {
            return nodes;
        }

        if (peer.isLocal) {
            return [createPeerTrackNode(peer, track), ...nodes];
        }

        return [...nodes, createPeerTrackNode(peer, track)];
    };

    const _updateNodeWithPeer = (data: {nodes: PeerTrackNode[]; peer: HMSPeer; createNew?: boolean}) => {
        const {nodes, peer, createNew = false} = data;

        const peerExists = nodes.some(node => node.peer.peerID === peer.peerID);

        if (peerExists) {
            return nodes.map(node => {
                if (node.peer.peerID === peer.peerID) {
                    return {...node, peer};
                }
                return node;
            });
        }

        if (!createNew) {
            return nodes;
        }

        if (peer.isLocal) {
            return [createPeerTrackNode(peer), ...nodes];
        }

        return [...nodes, createPeerTrackNode(peer)];
    };

    /*
        100ms Event Listeners
    */

    const __onErrorListener = (data: HMSException) => {
        console.log('=== 100ms Error ===:', data);

        if (data.code === 1003 || data.code === 4005) {
            console.log('User failed to reconnect...');
            _handleRoomLeave();
        }
    };

    const __onJoinListener = async (data: {room: HMSRoom}) => {
        const {localPeer, peers} = data.room;

        if (localPeer) {
            console.log(`OWN video track Added [__onJoin]: ${localPeer.videoTrack?.trackId}`);
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

        await updateHost();
    };

    const getHostId = async () => {
        if (viewtype === 'CRUView') {
            const hostId = await getCruViewHostId(viewId);
            return hostId;
        }

        if (viewtype === 'MITInvite') {
            const hostId = await getMITHostId(viewId);
            return hostId;
        }
    };

    const updateHost = async (maxRetries = 3) => {
        let attempts = 0;

        while (attempts < maxRetries) {
            const hostId = await getHostId();

            if (hostId) {
                setCurrentRoomHost(hostId);

                if (hostId === user?.id) {
                    setIsStreamHost(true);
                } else {
                    setIsStreamHost(false);
                }

                return;
            } else {
                console.log('No host ID was found. Retrying...');
                attempts++;
            }
        }

        setHostNotFound(true);
    };

    const __onPeerListener = async ({peer, type}: {peer: HMSPeer; type: HMSPeerUpdate}) => {
        console.log('HMS Peer Update: ', type);

        if (type === HMSPeerUpdate.ROLE_CHANGED) {
            console.log(`Peer ${peer.name} role changed to ${peer.role.name}`);
            // Update your state management to reflect the new role
            setMembers(prevMembers =>
                prevMembers.map(member => (member.peerID === peer.peerID ? {...member, role: peer.role.name} : member)),
            );

            return;
        }

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
            if (userThatLeft.user.id === currentRoomHostRef.current) {
                const peersInRoom = (await hmsInstanceRef.current?.getRoom()).peers;
                const newHost = membersRef.current.find(member => member.peerID === peersInRoom[0].peerID);
                if (newHost?.user.id === user?.id) {
                    onHostSelect(user?.id);
                }
            }
            return;
        }

        if (
            type === HMSPeerUpdate.ROLE_CHANGED ||
            type === HMSPeerUpdate.METADATA_CHANGED ||
            type === HMSPeerUpdate.NAME_CHANGED ||
            type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
        ) {
            console.log('Peer Role, Metadata, Name or Network Quality changed for peer:', peer.name);

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

            if (type === HMSTrackUpdate.TRACK_REMOVED) {
                console.log(`${peer.name}s' video track Removed: ${track.trackId}`);
                console.log(`Remove HMSView rendering trackId: ${track.trackId}`);
            }

            if (
                type === HMSTrackUpdate.TRACK_MUTED ||
                type === HMSTrackUpdate.TRACK_UNMUTED ||
                type === HMSTrackUpdate.TRACK_RESTORED ||
                type === HMSTrackUpdate.TRACK_DEGRADED
            ) {
                console.log(`Update UI to show Muted/Unmuted/Degraded/Restored updates: ${track.trackId}`);
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

            if (type === HMSTrackUpdate.TRACK_REMOVED) {
                console.log(`${peer.name}s' audio track Removed: ${track.trackId}`);
                console.log(`Remove Audio Track playing trackId: ${track.trackId}`);
            }

            if (type === HMSTrackUpdate.TRACK_MUTED) {
                console.log(`Update UI to show Audio Muted updates: ${track.trackId}`);
                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
                );
            }
            if (type === HMSTrackUpdate.TRACK_UNMUTED) {
                console.log(`Update UI to show Audio Unmuted updates: ${track.trackId}`);
                setPeerTrackNodes(prevPeerTrackNodes =>
                    _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
                );
            }

            if (type === HMSTrackUpdate.TRACK_RESTORED || type === HMSTrackUpdate.TRACK_DEGRADED) {
                console.log(`Update UI to show Audio Muted/Unmuted updates: ${track.trackId}`);
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

    const __onRoomListener = ({room, type}: {room: HMSRoom; type: HMSRoomUpdate}) => {};
    const __onRemovedFromRoomListener = async (data: any) => {
        console.log('onRemovedFromRoomListener triggered');

        if (data?.roomEnded) {
            await setIsMoviePlaying(false);

            await _handleCloseMovie();

            await _handleRoomLeave();
        }
    };

    const __onMessageListener = (data: HMSMessage) => {};
    const __onSpeakerListener = (data: HMSSpeaker[]) => {};
    const __onReconnectedListener = (data: any) => {};
    const __onReconnectingListener = (data: any) => {};

    /*
        WatchParty Video Player Sync Methods
    */

    const ___onPlay = () => {
        if (isStreamHost && videoPlayerRef.current) {
            setIsMoviePlaying(true);

            StatusBar.setHidden(true);
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'play-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };

    const ___onPause = () => {
        if (isStreamHost && videoPlayerRef.current) {
            setIsMoviePlaying(false);

            StatusBar.setHidden(false);
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'pause-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };

    const ___onSeek = (data: OnSeekData) => {
        if (isStreamHost && videoPlayerRef.current) {
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'seek-movie',
                payload: {
                    currentTime: data.currentTime,
                    seekTime: data.seekTime,
                    timestamp: new Date().toISOString(),
                },
            });
        }

        resetTimer();
        startTimer();
    };

    const ___onProgress = async (data: OnProgressData) => {
        if (isStreamHostRef.current && Number(data.currentTime.toFixed(1)) % 5 === 0) {
            await syncChannelRef.current?.track({
                isMoviePlaying: true,
                currentTime: data.currentTime,
                timestamp: new Date().toISOString(),
            });
        }

        setCurrentTime(data.currentTime);
    };

    const ___onEnterFullscreen = () => {
        setIsFullscreen(true);

        StatusBar.setHidden(true);
        Orientation.lockToLandscape();

        hideNavigationBar();
        if (videoPlayerRef.current && !isMoviePlaying) {
            if (isStreamHost) {
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost.current) {
                    setIsMoviePlaying(true);
                }
            }
        }

        // setTimeout(() => {
        //     if (videoPlayerRef.current && currentTime) {
        //         console.log(' you clicked enter FS... seeking to:', currentTime);
        //         videoPlayerRef.current.seek(currentTime);
        //     }
        // }, 2000);
    };

    const ___onExitFullScreen = () => {
        setIsFullscreen(false);
        StatusBar.setHidden(false);
        Orientation.lockToPortrait();

        showNavigationBar();
        // setTimeout(() => {
        //     if (videoPlayerRef.current && currentTime) {
        //         console.log(' you clicked exit FS... seeking to:', currentTime);
        //         videoPlayerRef.current.seek(currentTime);
        //     }
        // }, 2000);

        if (videoPlayerRef.current && !isMoviePlaying) {
            if (isStreamHost) {
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost.current) {
                    setIsMoviePlaying(true);
                }
            }
        }
    };
    
    //open options Modal
    const handleOptionModal = () => {
        setOptionModalVisible(true);
    };

    const confirmOptions = () => {
        setOptionModalVisible(false);
        setLeaveRoom(false);
    };

    const getAvailableMembers = async () => {
        let membersWithInfo: MemberInfo[] = [];
        const memberUserNames: {name: string; peer: HMSPeer}[] = [];
        await Promise.all(
            peerTrackNodes.map(async ({id, peer, track}) => {
                if (!memberUserNames.includes({name: peer.name, peer})) {
                    memberUserNames.push({name: peer.name, peer});
                }
            }),
        );

        await Promise.all(
            memberUserNames.map(async ({name, peer}) => {
                const userInfoFromDB = await findAUser({username: name});

                if (userInfoFromDB) {
                    membersWithInfo.push({
                        peerID: peer.peerID,
                        role: peer.role?.name,
                        name: peer.name,
                        isLocal: peer.isLocal,
                        user: userInfoFromDB,
                    });
                }
            }),
        );

        return membersWithInfo;
    };

    const handleCancelTransfer = () => {
        setShowTransferConfirmation(false);
    };

    const handleTransfer = async () => {
        setShowTransferConfirmation(false);
        if (isStreamHost) {
            const newHostId = selectedMemberForHost.user.id;
            onHostSelect(newHostId);
        }
    };

    const handleCancelRoomTermination = () => {
        setTerminateRoom(false);
    };
    const handleRoomTermination = async () => {
        if (hmsInstanceRef.current) {
            console.log('CLOSE ROOM AS HOST');
            confirmOptions();

            setTerminateRoom(true);
            setIsMoviePlaying(false);
        }
    };

    const handleCancelLeaveRoom = () => {
        setLeaveRoom(false);
    };

    const handleLeaveRoom = async () => {
        setLeaveRoom(true);
    };

    const sayhi = () => {
        if (viewtype == 'CRUView') {
            navigation.navigate('ViewGroupChat', {
                isMyCruChat: false,
                cru: cru,
            });
        } else {
            const isCurrentUserCreator = user?.id === creatorID;
            const receiverUserId = isCurrentUserCreator ? inviteeId : creatorID;
            const receiverProfilePicture = isCurrentUserCreator ? invitee?.profilePicture : creator?.profilePicture;
            const receiverUsername = isCurrentUserCreator ? invitee?.username : creator?.username;
            console.log('Watch Party', {
                mItInviteId: mitId,
                userId: receiverUserId,
                profilePicture: receiverProfilePicture,
                username: receiverUsername,
            });
            navigation.navigate('ViewChat', {
                mItInviteId: mitId,
                userId: receiverUserId,
                profilePicture: receiverProfilePicture,
                username: receiverUsername,
            });
        }
    };

    const handleCloseError = () => {
        setPopupErrMsg('');
        setPopupErr(false);
    };

    const watchPartyView = () => {
        return (
            <View style={{marginBottom: SIZES.ScreenHeight / 12}}>
                {!isFullscreen && (
                    <View style={{zIndex: 20}}>
                        <WatchPartyHeader />
                    </View>
                )}

                {!isFullscreen && (
                    <TopContainer
                        handleLeaveRoom={handleLeaveRoom} 
                        isStreamOpen={isStreamOpen} 
                        isHost={isStreamHost} 
                        handleOptionModal={handleOptionModal}
                    />
                )}

                <MovieScreen 
                    onPress={_handleStartMovie}
                    isStreamOpen={isStreamOpen}
                    isHost={isStreamHost}
                    movie={movie}
                    roomChannelRef={roomChannelRef}
                    hasLottieFirstLoopCompleted={hasLottieFirstLoopCompleted}
                    isFullscreen={isFullscreen}
                    videoPlayerRef={videoPlayerRef}
                    isMoviePlaying={isMoviePlaying}
                    onProgress={___onProgress}
                    onPlay={___onPlay}
                    onPause={___onPause}
                    onSeek={___onSeek}
                    onEnterFullScreen={___onEnterFullscreen}
                    onExitFullScreen={___onExitFullScreen}
                    setHasLottieFirstLoopCompleted={setHasLottieFirstLoopCompleted}
                />

                <UserVideos
                    hmsInstanceRef={hmsInstanceRef}
                    peerTrackNodes={peerTrackNodes}
                    expandedVideo={expandedVideo}
                    setExpandedVideo={setExpandedVideo}
                    peersMuteStatus={peersMuteStatus}
                    currentRoomHost={currentRoomHost}
                    members={members}
                />

                <UserControls 
                    toggleVideo={toggleVideo}
                    isUserVideoOn={isUserVideoOn} 
                    toggleMic={toggleMic} 
                    isMicOn={isMicOn} 
                    isHost={isStreamHost}
                    muteAllPeers={muteAllPeers} 
                    sayhi={sayhi}
                />

                <HostOptionsModal
                    optionModalVisible={optionModalVisible}
                    members={members} 
                    setShowTransferConfirmation={setShowTransferConfirmation} 
                    isHost={isStreamHost} 
                    handleRoomTermination={handleRoomTermination}
                    confirmOptions={confirmOptions}
                    setSelectedMemberForHost={setSelectedMemberForHost}
                    currentRoomHost={currentRoomHost}
                />

                <HostTransferModal
                    showTransferConfirmation={showTransferConfirmation}
                    selectedMemberForHost={selectedMemberForHost} 
                    handleCancelTransfer={handleCancelTransfer} 
                    handleTransfer={handleTransfer}
                />

                <TerminateRoomModal
                    terminateRoom={terminateRoom} 
                    _handleTerminateRoom={_handleTerminateRoom} 
                    handleCancelRoomTermination={handleCancelRoomTermination}
                />

                {isStreamHost ? (
                    <HostLeaveRoomModal
                        leaveRoom={leaveRoom} 
                        handleOptionModal={handleOptionModal}
                        handleRoomTermination={handleRoomTermination} 
                        handleCancelLeaveRoom={handleCancelLeaveRoom}
                    />
                ) : (
                    <LeaveRoomModal
                        leaveRoom={leaveRoom} 
                        _handleRoomLeave={_handleRoomLeave} 
                        handleCancelLeaveRoom={handleCancelLeaveRoom}
                    />
                )}

                {hostNotFound ? <HostNotFoundModal setHostNotFound={setHostNotFound} /> : null}

                {modalVisible ? <AwaitingMicPermModal /> : null}

                {unmutePermPopup ? (
                    <UnmutePermissionPopup
                        handleCancel={() => onSend(false, userRequest.id, 'reqans', userRequest)}
                        handleUnmute={() => onSend(true, userRequest.id, 'reqans', userRequest)}
                        userdata={userRequest}
                    />
                ) : null}
                {popupErr ? <ErrorModal errorMessage={popupErrMsg} onClose={handleCloseError} /> : null}
            </View>
        );
    };

    return isFullscreen ? (
        <View>
            {watchPartyView()}
            <WatchPartyDocker
                members={peerTrackNodes}
                hmsInstanceRef={hmsInstanceRef}
                isExpanded={expandedVideo}
                HMSVideoViewMode={HMSVideoViewMode}
                peersMuteStatus={peersMuteStatus}
            />
        </View>
    ) : (
        <SafeAreaView>{isLoading ? null : watchPartyView()}</SafeAreaView>
    );
};

export default StartWatchPartyView;
