import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback,
    Pressable,
    FlatList,
    ActivityIndicator,
    Modal,
    StatusBar,
} from 'react-native';
import React from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {RouteProp, useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useState, useRef, useEffect, useCallback} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {StackNavigationProp} from '@react-navigation/stack';
import VideoPlayer from 'react-native-media-console';
import {findMovieById} from '../../../lib/api/movies.lib';
import {IMovie} from '../../../../types';
import {capitalizeFirstLetterOfString, formatMovieDuration, selectAvatarBorderColor} from '../../../util/util';
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
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video, {LoadError, OnBufferData, OnProgressData, OnSeekData} from 'react-native-video';
import {IUserProfile} from '../../../../types';
import SmlMemberCard from '../../../components/SmlMemberCard';
import {findAUser} from '../../../lib/api/user.lib';
import useWatchTimeStore from '../../../stores/watchTime.store';
import {checkRoomTime} from '../../../util/checkRoomTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROOM_VALIDATION_CHECK_TIME} from '../../../util/config';
import {supabase} from '../../../../lib/supabase';
import UnmutePermissionPopup from './unmutepermpopup';
import ErrorModal from './ErrorModal';
import WatchPartyDocker from '../../../components/WatchPartyDocker';
import {hideNavigationBar, showNavigationBar} from 'react-native-navigation-bar-color';

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

    const creator: IUserProfile | null = route.params?.creator ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const creatorID: IUserProfile | null = route.params?.creator?.id ?? null;
    const inviteeId: IUserProfile | null = route.params?.invitee?.id ?? null;
    const mitId: IUserProfile | null = route.params?.inviteId ?? null;

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
    const [isChatOpen, setIsChatOpen] = useState(false);
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
    const [IsStreamHost, setIsStreamHost] = useState(isHost);
    const [selectedMemeberForHost, setSelectedMemeberForHost] = useState<any>();
    const [isAllMuteOff, setIsAllMuteOff] = useState(true);
    const [Timezone] = useState<string>(timezone);
    const [Movietime] = useState<string>(movieTime);
    const [showDockerToHost, setShowDockerToHost] = useState(false);

    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    const sheetRef = useRef<BottomSheet>(null); //Pop up chat
    const syncChannelRef = useRef<RealtimeChannel | null>(null);
    const roomChannelRef = useRef<RealtimeChannel | null>(null);
    const videoPlayerRef = useRef<Video | null>(null);
    const isSyncedWithHost = useRef<boolean | null>(null);

    const isFocused = useIsFocused();
    const {startTimer, pauseTimer, resetTimer} = useWatchTimeStore();
    const {user} = useAuthStore();
    const snapPoints = ['1', '40'];
    const isCurrentUserCreator = user?.id === creatorID;
    const receiverUserId = isCurrentUserCreator ? inviteeId : creatorID;
    const receiverProfilePicture = isCurrentUserCreator ? user?.profilePicture : creator?.profilePicture;
    const receiverUsername = isCurrentUserCreator ? invitee?.username : creator?.username;
    const [unmutePermPopup, setUnmutePermissionPopup] = useState(false);
    const [userRequest, setUserRequest] = useState(null);
    const [popupErr, setPopupErr] = useState(false);
    const [popupErrMsg, setPopupErrMsg] = useState('');
    const myuserid = user.id;
    const [isDockerOpen, setIsDockerOpen] = useState(false);

    route.params = {
        ...route.params,
        additionalParam: 'Additional Value',
        mItInviteId: movieId,
        userId: receiverUserId,
        profilePicture: receiverProfilePicture,
        username: receiverUsername,
    };

    useEffect(() => {
        setShowDockerToHost(isHost);
        const channelA = supabase.channel(roomId);
        channelA
            .on('broadcast', {event: 'movie_room'}, payload => askForPermission(payload))
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
        if (isHost == true && payload.payload.permtype! == 'request') {
            console.log('userReq', payload.payload.userReq!);
            setUserRequest(payload.payload.userReq!);
            setUnmutePermissionPopup(true);
        }
        if (isHost != true && payload.payload.permtype! == 'reqans' && payload.payload.userReq.id! == user.id) {
            const perm = payload.payload.micunmuteperm;
            if (perm == true) {
                const localPeer = await hmsInstanceRef.current?.getLocalPeer();
                if (localPeer) {
                    localPeer?.localAudioTrack()?.setMute(!perm);
                    setIsMicOn(perm);
                }
            }
        }
    }

    const onSend = (permGrant, userid, permtype, userReq) => {
        console.log('User id on send', userid);
        if (channelll === null) {
            console.log('Channel not found');
            return;
        }

        if (permtype == 'request' && isHost == true) {
            return;
        }
        channelll.send({
            type: 'broadcast',
            event: 'movie_room',
            payload: {micunmuteperm: permGrant, senderId: user.id, permtype: permtype, userReq: userReq},
        });
        if (permtype == 'reqans' && isHost == true) {
            setUnmutePermissionPopup(false);
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

    const handleMic = async (peer: HMSPeer) => {
        console.log('Handling the mic now');
        const localPeer = await hmsInstanceRef.current?.getLocalPeer();
        if (localPeer && isHost) {
            const audioTrack = peer.audioTrack;
            if (audioTrack) {
                const isMuted = audioTrack.isMute();
                const newMuteStatus = !isMuted;

                await hmsInstanceRef.current?.changeTrackState(audioTrack, newMuteStatus);

                roomChannelRef.current?.send({
                    type: 'broadcast',
                    event: 'mute-peer',
                    payload: {
                        peerID: peer.peerID,
                        isMuted: newMuteStatus,
                    },
                });
            }
        }
    };

    const muteAllPeers = async () => {
        console.log('about to enter the if');
        if (isHost) {
            console.log('Went into mute all before try');
            try {
                await hmsInstanceRef.current?.remoteMuteAllAudio();
                console.log('Broadcasted mute-all event');
            } catch (error) {
                console.error('Failed to mute all peers or broadcast: ', error);
            }
        }
    };

    const transferHostControl = async (targetPeerId: string) => {
        if (!targetPeerId) {
            console.error('Target peer ID is not valid.');
            return;
        }

        const roles = await hmsInstanceRef.current?.getRoles();
        console.log(roles);
        const newRole = roles ? roles.find(role => role.name === 'host') : undefined;
        console.log('newRole:', newRole);
        console.log('targetPeerId:', targetPeerId);

        if (isHost) {
            try {
                const force = true;
                const targetPeer = hmsInstanceRef.current?.getPeerFromPeerId(targetPeerId);
                if (targetPeer) {
                    const result = await hmsInstanceRef.current?.changeRoleOfPeer(targetPeer, newRole, force);
                    console.log('Change Role Success: ', result);
                    if (result) {
                        setIsStreamHost(false);

                        const updatedMembers = members.map(member => {
                            if (member.peerID === targetPeerId) {
                                return {...member, role: 'host'};
                            }
                            if (member.role === 'host') {
                                return {...member, role: 'member'};
                            }
                            return member;
                        });
                        setMembers(updatedMembers);
                    }
                } else {
                    console.log('Target peer not found.');
                }
            } catch (error) {
                console.log('Change Role Error: ', error);
            }
        } else {
            console.log('Current user is not the host.');
        }
    };
    function isHostAvailable() {
        for (let i = 0; i < peerTrackNodes.length; i++) {
            const peer = peerTrackNodes[i].peer;
            const isRoomHost = peer.role?.name === 'host';
            if (isRoomHost) {
                return true;
            }
        }
        return false;
    }
    const toggleMic = async () => {
        const localPeer = await hmsInstanceRef.current?.getLocalPeer();
        if (localPeer) {
            if (isMicOn) {
                console.log('muting personal audio track...');
                localPeer?.localAudioTrack()?.setMute(true);
                setIsMicOn((prevState: boolean) => !prevState);
            } else {
                if (isHost) {
                    console.log('unmuting personal audio track...');
                    localPeer?.localAudioTrack()?.setMute(false);
                    setIsMicOn((prevState: boolean) => !prevState);
                } else {
                    const isHostAva = isHostAvailable();
                    if (isHostAva) {
                        onSend(null, null, 'request', user);
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
        console.log('mic Initail State:', micInitialState);

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

    const _handleTerminateRoom = async () => {
        console.log('In the terminate room function');
        if (hmsInstanceRef.current) {
            console.log('IN THE IF CONDITION');

            try {
                await hmsInstanceRef?.current.endRoom('Host Terminated Watchparty Session', false);
            } catch (error) {
                console.error('An error occurred:', error);
            }
            console.log('End Room Success');

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

        if (isHost && videoPlayerRef.current) {
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
            currentTime: number;
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
                                const currentTime = syncObject[0].currentTime;
                                const isMoviePlayingFromHost = syncObject[0].isMoviePlaying;
                                if (!isHost && !isSyncedWithHost.current) {
                                    if (videoPlayerRef.current) {
                                        console.log(
                                            `SYNC State [${isSyncedWithHost.current}]: Syncing video player to ${currentTime} seconds... host play status[${isMoviePlayingFromHost}]`,
                                        );
                                        videoPlayerRef.current.seek(currentTime);
                                        setCurrentTime(currentTime);
                                        setIsMoviePlaying(isMoviePlayingFromHost);
                                        isSyncedWithHost.current = true;
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
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);

                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'play-movie'}, payload => {
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);

                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'pause-movie'}, payload => {
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);

                        setIsMoviePlaying(false);
                    }
                })
                .on('broadcast', {event: 'seek-movie'}, payload => {
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);

                        videoPlayerRef.current.seek(Number(payload.payload.seekTime));
                    }
                })
                .on('broadcast', {event: 'close-movie'}, payload => {
                    console.log(payload);
                })
                .on('broadcast', {event: 'exit-movie'}, payload => {
                    console.log(payload);
                    if (!isHost && videoPlayerRef.current) {
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

    //

    //
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

    const _findNodeByPeerId = (peerID: string) => {
        console.log('peerTrackNodes:', peerTrackNodes);

        return peerTrackNodes.find(node => node.peer.peerID === peerID);
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
    };
    const __onJoinListener = (data: {room: HMSRoom}) => {
        const {localPeer} = data.room;

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
            const remainingPeerTrackNodes = peerTrackNodes.filter(node => node.peer.peerID !== peer.peerID);
            const remainingHosts = remainingPeerTrackNodes.filter(node => node.peer._role.name === 'host').length;

            if (remainingHosts === 0 && !isHost) {
                console.log('No more hosts, leaving room...');
                await _handleRoomLeave();
            }

            setPeerTrackNodes(prevPeerTrackNodes => removeNodeWithPeerId(prevPeerTrackNodes, peer.peerID));
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
                console.log('isMuted:', isMuted);
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
        console.log('onRemovedFromRoomListener data:', data);

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
        if (isHost && videoPlayerRef.current) {
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
        if (isHost && videoPlayerRef.current) {
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
        if (isHost && videoPlayerRef.current) {
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
        if (isHost && Number(data.currentTime.toFixed(1)) % 2 === 0) {
            await syncChannelRef.current?.track({
                isMoviePlaying: true,
                currentTime: data.currentTime,
                timestamp: new Date().toISOString(),
            });

            setCurrentTime(data.currentTime);
        }
    };
    const ___onEnterFullscreen = () => {
        setIsFullscreen(true);

        StatusBar.setHidden(true);
        Orientation.lockToLandscape();

        hideNavigationBar();
        if (videoPlayerRef.current && !isMoviePlaying) {
            if (isHost) {
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost.current) {
                    setIsMoviePlaying(true);
                }
            }
        }

        setTimeout(() => {
            if (videoPlayerRef.current && currentTime) {
                console.log(' you clicked enter FS... seeking to:', currentTime);
                videoPlayerRef.current.seek(currentTime);
            }
        }, 2000);
    };
    const ___onExitFullScreen = () => {
        setIsFullscreen(false);
        StatusBar.setHidden(false);
        Orientation.lockToPortrait();

        showNavigationBar();
        setTimeout(() => {
            if (videoPlayerRef.current && currentTime) {
                console.log(' you clicked exit FS... seeking to:', currentTime);
                videoPlayerRef.current.seek(currentTime);
            }
        }, 2000);

        if (videoPlayerRef.current && !isMoviePlaying) {
            if (isHost) {
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost.current) {
                    setIsMoviePlaying(true);
                }
            }
        }
    };
    const ___onBack = () => {
        if (isHost && videoPlayerRef.current) {
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'exit-movie',
                payload: {
                    timestamp: new Date().toISOString(),
                },
            });

            if (isFullscreen) {
                ___onExitFullScreen();
            }
            setIsStreamOpen(true);
        } else {
            console.log(`${user?.username} is exited the movie`);
        }
    };
    const ___onEnd = () => {
        console.log(`${user?.username} ended the movie`);
    };
    const ___onBuffer = (data: OnBufferData) => {
        console.log(`${user?.username} is buffering the movie: ${data.isBuffering}`);
    };
    const ___onError = (error: LoadError) => {
        console.log(`${user?.username} encountered an error with the movie`);
    };
    //open options Modal
    const [optionModalVisible, setOptionModalVisible] = useState(false);

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

    const handleTransfer = () => {
        setShowTransferConfirmation(false);
        //transfer host control to the next user
        if (isHost) {
            console.log('New Host:', members[1]);
            const newHost = members[1].peerID;
            if (newHost) {
                transferHostControl(newHost);
            }
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

    const handleLeaveRoom = () => {
        setLeaveRoom(true);
    };

    const sayhi = () => {
        console.log(viewtype, cru);
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
    const handleSnapPress = useCallback((index: number) => {
        console.log('heelo');
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleCloseError = () => {
        setPopupErrMsg('');
        setPopupErr(false);
    };

    const watchPartyView = () => {
        return (
            <View style={{marginBottom: SIZES.ScreenHeight / 12}}>
                {!isFullscreen && (
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>
                )}

                {!isFullscreen && (
                    <View style={styles.topcontainer}>
                        <TouchableOpacity onPress={handleLeaveRoom}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Leave Room</Text>
                            </View>
                        </TouchableOpacity>
                        {!isStreamOpen && isHost && (
                            <>
                                <TouchableOpacity onPress={handleOptionModal}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon
                                            name="ellipsis-vertical-circle"
                                            type="ionicon"
                                            size={23}
                                            color={COLORS.LIGHTGREY}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                <View style={{flex: 1, zIndex: 100}}>
                    {isStreamOpen ? (
                        <View style={styles.moviecontainer}>
                            <LinearGradient
                                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,

                                    borderRadius: 5,
                                    height: SIZES.ScreenHeight * 0.18,
                                }}
                            />
                            <View style={{marginRight: 10}}>
                                <Image source={{uri: movie?.portraitURL ?? undefined}} style={styles.poster} />
                            </View>
                            <View>
                                <Text style={{...FONTS.Title3}}>{movie?.title ?? 'Loading...'}</Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        marginVertical: 4,
                                        alignItems: 'center',
                                    }}>
                                    <Text style={{...FONTS.Title2, fontSize: 12}}>{movie?.year}</Text>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            fontSize: 12,
                                            marginHorizontal: 10,
                                        }}>
                                        {movie?.duration ? formatMovieDuration(movie?.duration) : '...'}
                                    </Text>
                                </View>
                                <View style={{flexDirection: 'row', marginBottom: 8}}>
                                    <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                    <Text style={styles.drawfonttag}>
                                        {movie?.genres[0] ? capitalizeFirstLetterOfString(movie?.genres[0]) : '...'}
                                    </Text>
                                    <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <TouchableWithoutFeedback>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor: COLORS.TAGCOLOR,
                                                marginRight: 5,
                                                paddingHorizontal: 5,
                                                paddingVertical: 5,
                                                borderRadius: 5,
                                                alignItems: 'center',
                                            }}>
                                            <Text
                                                style={{
                                                    ...FONTS.paragraph1,
                                                    marginRight: 5,
                                                    fontSize: 12,
                                                }}>
                                                Link Device
                                            </Text>
                                            <Icon name="tv-outline" type="ionicon" size={20} color={COLORS.MIDORANGE} />
                                        </View>
                                    </TouchableWithoutFeedback>

                                    {isHost && roomChannelRef.current && (
                                        <TouchableWithoutFeedback onPress={_handleStartMovie}>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    backgroundColor: COLORS.TAGCOLOR,
                                                    paddingHorizontal: 5,
                                                    paddingVertical: 5,
                                                    borderRadius: 5,
                                                    alignItems: 'center',
                                                }}>
                                                <Text
                                                    style={{
                                                        ...FONTS.paragraph1,
                                                        marginRight: 5,
                                                        fontSize: 12,
                                                    }}>
                                                    Play Stream
                                                </Text>
                                                <Icon name="play" type="ionicon" size={20} color={COLORS.CATREDLGT} />
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )}
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.videocontain}>
                                <View style={{flex: 1}}>
                                    {hasLottieFirstLoopCompleted ? (
                                        movie?.movieURL ? (
                                            <View style={!isFullscreen ? styles.movieview : styles.fullscreenmovie}>
                                                <VideoPlayer
                                                    videoRef={videoPlayerRef}
                                                    source={{
                                                        uri: movie?.movieURL,
                                                    }}
                                                    showHours={true}
                                                    paused={!isMoviePlaying}
                                                    poster={movie?.landscapeURL}
                                                    resizeMode="contain"
                                                    posterResizeMode="cover"
                                                    showOnStart={true}
                                                    tapAnywhereToPause={false}
                                                    preventsDisplaySleepDuringVideoPlayback={true}
                                                    isFullscreen={isFullscreen}
                                                    fullscreenAutorotate={false}
                                                    disableBack={true}
                                                    disablePlayPause={isHost ? false : true}
                                                    disableSeekButtons={isHost ? false : true}
                                                    disableSeekbar={isHost ? false : true}
                                                    onProgress={___onProgress}
                                                    onPlay={___onPlay}
                                                    onPause={___onPause}
                                                    onSeek={___onSeek}
                                                    onEnterFullscreen={___onEnterFullscreen}
                                                    onExitFullscreen={___onExitFullScreen}
                                                />
                                            </View>
                                        ) : (
                                            <ActivityIndicator size="large" color={COLORS.BLACK} />
                                        )
                                    ) : (
                                        <View>
                                            <Video
                                                source={require('../../../../assets/sounds/akcrusound1.mp3')}
                                                repeat={false}
                                            />
                                            <LottieView
                                                source={require('../../../../assets/lottie/Akcruopener1.json')}
                                                autoPlay
                                                loop={false}
                                                style={styles.movieview}
                                                onAnimationFinish={() => {
                                                    if (!hasLottieFirstLoopCompleted) {
                                                        setHasLottieFirstLoopCompleted(true);
                                                    }
                                                }}
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View
                    style={{
                        width: SIZES.ScreenWidth * 0.95,
                        height: (SIZES.ScreenWidth / 3) * 2.6,
                        marginTop: SIZES.ScreenHeight * 0.3,

                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    {hmsInstanceRef.current ? (
                        <FlatList
                            scrollEnabled={false}
                            style={{height: '100%', width: '100%'}}
                            key={peerTrackNodes.length}
                            numColumns={3}
                            data={peerTrackNodes}
                            keyExtractor={node => node.id}
                            contentContainerStyle={{flexGrow: 1}}
                            renderItem={({item}) => {
                                const isRoomHost = item.peer.role?.name === 'host';
                                const isExpanded = expandedVideo === item;

                                return hmsInstanceRef.current ? (
                                    <View
                                        style={{
                                            width: isExpanded ? SIZES.ScreenWidth * 0.95 : SIZES.ScreenWidth / 3.2,
                                            height: isExpanded
                                                ? (SIZES.ScreenWidth / 3) * 2.6
                                                : SIZES.ScreenWidth / 2.5,
                                            backgroundColor: 'red',
                                            flex: isExpanded ? 1 : 0,
                                            position: isExpanded ? 'absolute' : 'relative',
                                            zIndex: isExpanded ? 99 : 0,
                                            bottom: 0,
                                            top: 0,
                                            borderColor: COLORS.CATPURPLGT,
                                            borderWidth: 4,
                                        }}>
                                        {item.peer.videoTrack?.trackId ? (
                                            <hmsInstanceRef.current.HmsView
                                                key={item.peer.peerID}
                                                trackId={item.peer.videoTrack.trackId}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: 'black',
                                                }}
                                                scaleType={HMSVideoViewMode.ASPECT_BALANCED}
                                                mirror={true}
                                            />
                                        ) : null}

                                        {isRoomHost ? (
                                            <View style={{position: 'absolute', top: 0, right: 0}}>
                                                <Text
                                                    style={{
                                                        ...FONTS.paragraph1,
                                                        backgroundColor: COLORS.AKCRUBLUE,
                                                        paddingHorizontal: 5,
                                                        paddingVertical: 2,
                                                        borderBottomLeftRadius: 4,
                                                    }}>
                                                    {'Host'}
                                                </Text>
                                            </View>
                                        ) : null}

                                        <View style={{position: 'absolute', top: 0, left: 0}}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (isExpanded) {
                                                        setExpandedVideo(null);
                                                    } else {
                                                        if (expandedVideo) {
                                                            setExpandedVideo(null);
                                                        }
                                                        setExpandedVideo(item);
                                                    }
                                                }}>
                                                {isExpanded ? (
                                                    <Icon
                                                        name="contract"
                                                        type="ionicon"
                                                        size={30}
                                                        color={COLORS.AKCRUBLUE}
                                                    />
                                                ) : (
                                                    <Icon
                                                        name="expand"
                                                        type="ionicon"
                                                        size={23}
                                                        color={COLORS.AKCRUBLUE}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>

                                        <View
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                backgroundColor: COLORS.TRANSDARKGREY,
                                                width: '100%',
                                                borderTopLeftRadius: 5,
                                                borderTopRightRadius: 5,
                                            }}>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    paddingHorizontal: 3,
                                                    paddingVertical: 5,
                                                }}>
                                                <Text style={{...FONTS.paragraph1, paddingVertical: 4}}>
                                                    {isExpanded
                                                        ? item.peer.name
                                                        : item.peer.name.length > 8
                                                        ? item.peer.name.substring(0, 8) + '...'
                                                        : item.peer.name}
                                                </Text>
                                                <Pressable>
                                                    <Icon
                                                        name={
                                                            peersMuteStatus[item.peer.peerID] === undefined ||
                                                            peersMuteStatus[item.peer.peerID] == true
                                                                ? 'mic-off-circle'
                                                                : 'mic-circle'
                                                        }
                                                        type="ionicon"
                                                        size={25}
                                                        color={
                                                            peersMuteStatus[item.peer.peerID] === undefined ||
                                                            peersMuteStatus[item.peer.peerID] == true
                                                                ? COLORS.CATREDLGT
                                                                : COLORS.GREEN
                                                        }
                                                    />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                ) : null;
                            }}
                        />
                    ) : (
                        <View style={{backgroundColor: '#fff', width: 200, height: 200}}>
                            <Text>Loading...</Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottombtn}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}>
                        <Pressable onPress={toggleVideo}>
                            {isUserVideoOn ? (
                                <Icon name="video" type="material-community" size={40} color={COLORS.CATPURPLGT} />
                            ) : (
                                <Icon name="video-off" type="material-community" size={40} color={COLORS.CATREDLGT} />
                            )}
                        </Pressable>
                        <Pressable onPress={() => sayhi()}>
                            <Icon name="chatbox-ellipses" type="ionicon" size={40} color={COLORS.CATPURPLGT} />
                        </Pressable>
                        <Pressable onPress={toggleMic}>
                            {isMicOn ? (
                                <Icon name="mic-circle" type="ionicon" size={40} color={COLORS.GREEN} />
                            ) : (
                                <Icon name="mic-off-circle" type="ionicon" size={40} color={COLORS.CATREDLGT} />
                            )}
                        </Pressable>
                        {isHost ? (
                            <Pressable onPress={muteAllPeers} style={styles.button}>
                                <Text style={styles.buttonText}>Mute All</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                <Modal animationType="fade" transparent={true} visible={optionModalVisible}>
                    <SafeAreaView
                        style={{
                            flex: 1,
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                borderWidth: 0.8,
                                borderRadius: 5,
                                borderColor: COLORS.LIGHTGREY,
                                padding: 10,
                                width: '95%',
                                marginTop: '10%',
                            }}>
                            <Text style={{...FONTS.Title2, marginBottom: 5, textAlign: 'center'}}>
                                Room Host Options
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingBottom: 10,
                                    alignSelf: 'center',
                                }}>
                                <Text style={{...FONTS.Title2, paddingRight: 10}}>Transfer Hosting Permissions</Text>
                                <Icon name="body" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            </View>
                            <Text
                                style={{
                                    ...FONTS.paragraph1,
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: COLORS.MIDORANGE,
                                }}>
                                (Once transfer is complete, you won't be able to gain permissions back until it is given
                                back or your next CRU View)
                            </Text>
                            <Text
                                style={{
                                    ...FONTS.paragraph1,
                                    textAlign: 'center',
                                    fontSize: 12,
                                }}>
                                Choose who you are giving host privileges:
                            </Text>
                            <View>
                                <FlatList
                                    data={members.filter(member => member.role !== 'host')}
                                    horizontal={false}
                                    showsHorizontalScrollIndicator={false}
                                    numColumns={2}
                                    scrollEnabled={false}
                                    keyExtractor={item => item.user?.id}
                                    renderItem={({item}) => (
                                        <View style={{marginVertical: 5}}>
                                            <SmlMemberCard
                                                userPicture={item.user.profilePicture ?? ''}
                                                userName={item.user.username ?? 'Anonymous'}
                                                onPress={() => {
                                                    console.log('onPress FIRED');

                                                    setShowTransferConfirmation(true);
                                                }}
                                                userID={item.user.id}
                                                akcruBadge={item.user.badge}
                                                userDesc={item.user.description ?? ''}
                                                avatarbordercolor={selectAvatarBorderColor(
                                                    item.user.badge ?? 'AKCRUIT',
                                                )}
                                            />
                                        </View>
                                    )}
                                />
                            </View>

                            <View
                                style={{
                                    borderBottomWidth: 0.8,
                                    borderColor: COLORS.LIGHTGREY,
                                    marginVertical: 20,
                                    width: SIZES.ScreenWidth / 4,
                                    alignSelf: 'center',
                                }}
                            />

                            <View
                                style={{
                                    paddingBottom: 10,
                                }}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        paddingRight: 10,
                                        textAlign: 'center',
                                        marginBottom: '5%',
                                    }}>
                                    Terminate Watchparty and close room
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-around',

                                        paddingBottom: 5,
                                    }}>
                                    <AkcruButtons.SmallButton
                                        btnname="Terminate"
                                        color={COLORS.CATREDLGT}
                                        disabled={false}
                                        onPress={isHost && handleRoomTermination}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{marginBottom: '10%'}}>
                            <AkcruButtons.XlLrgButton
                                btnname="Close Options"
                                disabled={false}
                                color={COLORS.AKCRUBLUE}
                                onPress={confirmOptions}
                            />
                        </View>
                    </SafeAreaView>
                </Modal>
                <Modal animationType="fade" transparent={true} visible={showTransferConfirmation}>
                    <View
                        style={{
                            zIndex: 100,
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}>
                        <View
                            style={{
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                padding: 20,
                                borderRadius: 10,
                            }}>
                            <View style={{alignItems: 'center'}}>
                                <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Host Transfer</Text>
                                <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                                    {`Are you sure you want to transfer hosting privileges to "${selectedMemeberForHost?.user.username}"`}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                <TouchableOpacity
                                    onPress={handleCancelTransfer}
                                    style={{
                                        backgroundColor: 'red',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}>
                                    <Text style={{...FONTS.Title3}}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleTransfer}
                                    style={{
                                        backgroundColor: 'green',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}>
                                    <Text style={{...FONTS.Title3}}>Transfer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal animationType="fade" transparent={true} visible={terminateRoom}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}>
                        <View
                            style={{
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                padding: 20,
                                borderRadius: 10,
                                marginHorizontal: '5%',
                            }}>
                            <View style={{alignItems: 'center'}}>
                                <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm closing CRU View</Text>
                                <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                                    Are you sure you want to end this CRU View session?
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                }}>
                                <AkcruButtons.SmallButton
                                    onPress={_handleTerminateRoom}
                                    color={COLORS.PINK}
                                    btnname="Terminate"
                                />
                                <AkcruButtons.SmallButton
                                    onPress={handleCancelRoomTermination}
                                    color={COLORS.PURPLE}
                                    btnname="Cancel"
                                />
                                {/* <TouchableOpacity
                                    onPress={_handleTerminateRoom}
                                    style={{
                                        backgroundColor: 'green',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}>
                                    <Text style={{...FONTS.Title3}}>Terminate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCancelRoomTermination}
                                    style={{
                                        backgroundColor: 'red',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}>
                                    <Text style={{...FONTS.Title3}}>Cancel</Text>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    </View>
                </Modal>
                {isHost ? (
                    <Modal animationType="fade" transparent={true} visible={leaveRoom}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 20,
                                    borderRadius: 10,
                                    marginHorizontal: '5%',
                                }}>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm leaving Watch Party</Text>
                                    <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                                        Please assign a new host or terminate the Watch Party session to leave
                                    </Text>
                                </View>

                                <View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-around',
                                        }}>
                                        <AkcruButtons.SmallButton
                                            onPress={handleOptionModal}
                                            color={COLORS.PINK}
                                            btnname="Assign Host"
                                        />
                                        {/* <TouchableOpacity
                                            onPress={handleOptionModal}
                                            style={{
                                                backgroundColor: COLORS.PINK,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Assign Host</Text>
                                        </TouchableOpacity> */}
                                        <AkcruButtons.SmallButton
                                            onPress={handleRoomTermination}
                                            color={COLORS.PURPLE}
                                            btnname="Terminate"
                                        />
                                        {/* <TouchableOpacity
                                            onPress={handleRoomTermination}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Terminate</Text>
                                        </TouchableOpacity> */}
                                    </View>
                                    <View style={{alignItems: 'center', paddingTop: 10}}>
                                        <AkcruButtons.SmallButton
                                            onPress={handleCancelLeaveRoom}
                                            color={COLORS.CATREDLGT}
                                            btnname="Cancel"
                                        />
                                        {/* <TouchableOpacity
                                        onPress={handleCancelLeaveRoom}
                                        style={{
                                            backgroundColor: 'red',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity> */}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <Modal animationType="fade" transparent={true} visible={leaveRoom}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 20,
                                    borderRadius: 10,
                                }}>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm leaving Watch Party</Text>
                                    <Text style={{marginBottom: 20, ...FONTS.paragraph2, textAlign: 'center'}}>
                                        Are you sure you want to leave this Watch Party session?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                        marginHorizontal: '5%',
                                    }}>
                                    <AkcruButtons.SmallButton
                                        onPress={_handleRoomLeave}
                                        color={COLORS.PINK}
                                        btnname="Leave Room"
                                    />
                                    <AkcruButtons.SmallButton
                                        onPress={handleCancelLeaveRoom}
                                        color={COLORS.PURPLE}
                                        btnname="Cancel"
                                    />
                                    {/* <TouchableOpacity
                                        onPress={_handleRoomLeave}
                                        style={{
                                            backgroundColor: 'green',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Leave Room</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleCancelLeaveRoom}
                                        style={{
                                            backgroundColor: 'red',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity> */}
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

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

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.CATREDLGT,
        width: 80,
        height: 40,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
    topcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    poster: {
        width: 70,
        height: 110,
        borderRadius: 5,
    },
    moviecontainer: {
        marginHorizontal: 15,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#1C202A',
        borderRadius: 5,
        height: SIZES.ScreenHeight * 0.18,
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
    movieview: {
        height: SIZES.ScreenHeight / 3.5,
    },
    fullscreenmovie: {
        width: SIZES.ScreenHeight,
        height: SIZES.ScreenWidth,
    },
    videoplayer: {
        alignSelf: 'center',
        aspectRatio: 16 / 9,
        width: '100%',
    },
    bottombtn: {
        paddingTop: 10,
        position: 'relative',
    },
});
