import _ from "lodash";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Modal
} from "react-native";
import React from "react";
import AkcruButtons from "../../../components/akcruButtons";
import Header from "../../../components/header";
import MITChatCard from "../../../components/MITChatCard/MITChatCard";
import { SIZES, FONTS, COLORS } from "../../../../assets/constants";
import LinearGradient from "react-native-linear-gradient";
import { Icon } from "@rneui/base";
import { RouteProp, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useRef, useEffect, useCallback } from "react";
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { StackNavigationProp } from "@react-navigation/stack";
import VideoPlayer from "react-native-media-console";
import { findMovieById } from "../../../lib/api/movies.lib";
import { IMovie } from "../../../../types";
import { capitalizeFirstLetterOfString, formatMovieDuration } from "../../../util/util";
import { supabaseRealtime } from "../../../../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { 
  HMSConfig, 
  HMSException, 
  HMSPeer, 
  HMSPeerUpdate, 
  HMSLocalPeer,
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
  HMSRole,
  HMSRemotePeer,
  HMSTrackSettings,
  HMSAudioTrackSettings,
  HMSVideoTrackSettings,
  HMSTrackSettingsInitState,
} from "@100mslive/react-native-hms";
import useAuthStore from "../../../stores/auth.store";
import { NoBottomTabStackParams } from "../../../navigation/NoBottomTabStack";
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import Video, { LoadError, OnBufferData, OnProgressData, OnSeekData } from "react-native-video";
import { IUserProfile } from "../../../../types";

import SmlMemberCard from "../../../components/SmlMemberCard";
import { FAKE_USER_PROFILES } from "../../../../assets/constants/Mockusers";


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
};

type PeerTrackNode = {
    id: string;
    peer: HMSPeer;
    track: HMSTrack | undefined;
};

const StartWatchPartyView = ({ navigation, route }: Props) => {
    const isHost = route.params?.isHost;
    const movieId = route.params?.movieId;
    const roomId = route.params?.roomId;
    const roomAuthToken = route.params?.roomAuthToken;
    const micInitialState = route.params?.micInitialState;
    const cameraInitialState = route.params?.cameraInitialState;
    const [movie, setMovie] = useState<IMovie | null>(null);
    const [peerTrackNodes, setPeerTrackNodes] = useState<PeerTrackNode[] | []>([]); // Use this state to render Peer Tiles
    const {user} = useAuthStore();
    const [isStreamOpen, setIsStreamOpen] = useState(false);
    const [isMoviePlaying, setIsMoviePlaying] = useState(false);
    const [isMicOn, setIsMicOn] = useState(micInitialState);
    const [isUserVideoOn, setIsUserVideoOn] = useState(cameraInitialState);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<number | undefined>(undefined);
    /* REFS */
    const hmsInstanceRef = useRef<HMSSDK | null>(null);
    const sheetRef = useRef<BottomSheet>(null); //Pop up chat
    const syncChannelRef = useRef<RealtimeChannel | null>(null);
    const roomChannelRef = useRef<RealtimeChannel | null>(null);
    const videoPlayerRef = useRef<Video | null>(null);
    const isSyncedWithHost = useRef<boolean | null>(null);


    // FIXME: find a way to join & sync a room in progress
    /* 
        USE EFFECTS
    */
    useEffect(() => {
        console.log(`isMoviePlaying changed... [${isMoviePlaying}]`);
        
    }, [isMoviePlaying]);
    // INITIAL LOAD
    useEffect(() => {
        // join the 100ms room
        _join100msRoom().then(() => {
            // setup the realtime channels for the room, once room is joined (needs roomId)
            _setupRoomChannels();
        });
        // load the movie
        findMovieById(movieId).then(res => {
            if (res) {
                setMovie(res);
                setIsLoading(false);
            }
        });

        console.log('room details [roomId]:', roomId);
        // console.log('room details [movieId]:', movieId);
        // console.log('room details [roomAuthToken]:', roomAuthToken);
        // console.log('room details [micInitialState]:', micInitialState);
        // console.log('room details [cameraInitialState]:', cameraInitialState);

        // FIXME: close and destroy the hmsInstance when the component unmounts
        // return () => {
        //     if (hmsInstanceRef.current) {
        //         // leave the room
        //         console.log("Leaving the watchparty room [StartWatchPartyView]...");
        //         hmsInstanceRef.current.leave();

        //         console.log("Destroying hmsInstance [StartWatchPartyView]...");
        //         hmsInstanceRef.current.destroy();
        //     }
        // }
    }, []);

    useEffect(() => {
        console.log('peerTrackNodes changed...');
        console.log(
            'Current track ids:',
            peerTrackNodes.map(node => node.track?.trackId),
        );
    }, [peerTrackNodes]);

    /* 
        ROOM HANDLERS
    */
    const toggleMic = async () => {
        // access the local peer
        const localPeer = await hmsInstanceRef.current?.getLocalPeer();

        // toggle the mic
        if (localPeer) {
            if (isMicOn) {
                console.log("muting personal audio track...")
                localPeer?.localAudioTrack()?.setMute(true);
            } else {
                console.log("unmuting personal audio track...")
                localPeer?.localAudioTrack()?.setMute(false);
            }
        }
        // toggle the state
        setIsMicOn((prevState: boolean) => !prevState);
    };
    const toggleVideo = () => {
        setIsUserVideoOn((prevState: boolean) => !prevState);
    };

    const snapPoints = ['1', '40'];

    const handleSnapPress = useCallback((index: number) => {
        sheetRef.current?.snapToIndex(index);
        setIsChatOpen(true);
    }, []);

    /**
     * ADDITIONAL METHODS
     */
    const _setupRoomChannels = async () => {
        // setup the realtime channels for the room
        let roomChannel: RealtimeChannel | null = null;
        let syncChannel: RealtimeChannel | null = null;

        if (roomId) {
            roomChannel = supabaseRealtime.channel(`room-${roomId}`, {
                config: {
                    broadcast: {
                        // self: isHost ? true: false,
                    },
                },
            });
            syncChannel = supabaseRealtime.channel(`room-${roomId}/sync`, {
                config: {
                    presence: {
                        // self: isHost ? true: false,
                    },
                },
            });

            roomChannelRef.current = roomChannel;
            syncChannelRef.current = syncChannel;
            console.log('Created room and sync channels');

            // handle the room channel events
            __handleRoomChannelEventsAndSubscribe();
        }
    };

    const _join100msRoom = async () => {
        let hmsInstance: HMSSDK | null = null;

        if (hmsInstanceRef.current == null) {
            // set track settings
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
            // set the hmsInstanceRef
            hmsInstanceRef.current = hmsInstance;
        }
        // set the hmsInstance to the currently set hmsInstanceRef
        hmsInstance = hmsInstanceRef.current;

        if (roomId && roomAuthToken) {
            if (hmsInstance) {
                // 1. add Event Listeners to subscribe to Join Success or Failure updates
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

                // 2. create an object of HMSConfig class using the available joining configurations.
                if (roomAuthToken && user) {
                    let config = new HMSConfig({
                        authToken: roomAuthToken, // client-side token generated from `getAuthTokenByRoomCode` method
                        username: user.username, // username of the user joining the room
                    });

                    // 3. call the preview method to join the room
                    // starting room preview
                    console.log('Joining the call...');

                    hmsInstance.join(config);
                }
            }
        }
    };

    const _handleRoomLeave = async () => {
        if (hmsInstanceRef.current) {
            // leave the room
            console.log('Leaving the watchparty room [StartWatchPartyView]...');
            hmsInstanceRef.current.leave();

            console.log('Destroying hmsInstance [StartWatchPartyView]...');
            hmsInstanceRef.current.destroy();
        }

        hmsInstanceRef.current = null;

        // clear the navigation stack history
        // reset navigation
        navigation.reset({
            index: 0,
            routes: [{name: 'UserProfileScreen'}],
        });
        navigation.navigate('UserProfileStack', {
            screen: 'UserProfileScreen',
        });
    };

    const _handleCloseMovie = async () => {
        // close the movie
        if (videoPlayerRef.current) {
            videoPlayerRef.current.dismissFullscreenPlayer();
            setIsFullscreen(false);
        }
        setIsStreamOpen(true);
    };

    const _handleStartMovie = async () => {
        console.log("Starting the movie...");
        
        
        if (isHost && videoPlayerRef.current) {
            // SYNC: send a message to the room that the host started playing the movie
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'start-movie',
                payload: {
                    // send timestamp in seconds since epoch
                    timestamp: new Date().toISOString(),
                },
            });

            // setIsStreamOpen(false);
            // setIsMoviePlaying(true);
        }
    };

    const __handleRoomChannelEventsAndSubscribe = () => {
        type ISyncObject = {
            currentTime: number;
            timestamp: string;
            isMoviePlaying: boolean;
        }

        // SYNC CHANNEL EVENTS - subscribe to the sync channel if not host, and not synced (just joined)
        if (syncChannelRef.current) {
            syncChannelRef.current
                .on(
                'presence',
                { event: 'sync' },
                () => {
                    const newSyncState = syncChannelRef.current.presenceState() as object;
                    const syncObject = Object.values(newSyncState)[0] as [ISyncObject]
                    const currentTime = syncObject[0].currentTime // there should only be one object in the array (from host)
                    const isMoviePlayingFromHost = syncObject[0].isMoviePlaying;
                    if (!isHost && !isSyncedWithHost.current) {
                        // if not host, and not synced, get the current video timestamp sync the video player
                        if (videoPlayerRef.current) {
                            console.log(`SYNC State [${isSyncedWithHost.current}]: Syncing video player to ${currentTime} seconds... host play status[${isMoviePlayingFromHost}]`);
                            videoPlayerRef.current.seek(currentTime);
                            setCurrentTime(currentTime);
                            setIsMoviePlaying(isMoviePlayingFromHost);
                            isSyncedWithHost.current = true; // set synced to true
                        }
                    } 
                })
                .subscribe()
        }
        // ROOM CHANNEL EVENTS - once synced, subscribe to the room channel
        if (roomChannelRef.current) {
            // subscribe to play event
            roomChannelRef.current
                .on('broadcast', {event: 'start-movie'}, payload => {
                    // play video player if not host
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);
                        // play the video player, for host
                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'play-movie'}, payload => {
                    // play video player if not host
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);
                        // play the video player, for host
                        setIsStreamOpen(false);
                        setIsMoviePlaying(true);
                    }
                })
                .on('broadcast', {event: 'pause-movie'}, payload => {
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);
                        // pause the video player if not host
                        setIsMoviePlaying(false);
                    }
                })
                .on('broadcast', {event: 'seek-movie'}, payload => {
                    // seek the video player if not host
                    if (!isHost && videoPlayerRef.current) {
                        console.log(payload);
                        // seek the video player if not host
                        videoPlayerRef.current.seek(Number(payload.payload.currentTime));
                    }
                })
                .on('broadcast', {event: 'close-movie'}, payload => {
                    console.log(payload);
                    // TODO: close the video player if not host
                })
                .on('broadcast', {event: 'exit-movie'}, payload => {
                    console.log(payload);
                    if (!isHost && videoPlayerRef.current) {
                        setIsFullscreen(false);
                        Orientation.lockToPortrait(); // Lock to portrait when exiting fullscreen
                        // videoPlayerRef.current.dismissFullscreenPlayer();
                    }
                })
                .subscribe();

            console.log('Subscribed to room channel');
        }
    };

    //  returns `uniqueId` for a given `peer` and `track` combination
    const getPeerTrackNodeId = (peer: HMSPeer, track: HMSTrack | undefined) => {
        return peer.peerID + (track?.source ?? HMSTrackSource.REGULAR);
    };

    // creates `PeerTrackNode` object for given `peer` and `track` combination
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
    // Removes all nodes which has `peer` with `id` same as the given `peerID`.
    const removeNodeWithPeerId = (nodes: PeerTrackNode[], peerID: string) => {
        return nodes.filter(node => node.peer.peerID !== peerID);
    };
    //   Updates `track` and `peer` of `PeerTrackNode` objects which has `id` same as `uniqueId` generated from given `peer` and `track`.
    //
    //   If `createNew` is passed as `true` and no `PeerTrackNode` exists with `id` same as `uniqueId` generated from given `peer` and `track`
    //   then new `PeerTrackNode` object will be created
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

        if (!createNew) return nodes;

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

        if (!createNew) return nodes;

        if (peer.isLocal) {
            return [createPeerTrackNode(peer), ...nodes];
        }

        return [...nodes, createPeerTrackNode(peer)];
    };

    /*
        100ms Event Listeners
    */
    const __onErrorListener = (data: HMSException) => {
        // FIXME: handle errors (if host leaves, or if user leaves)
        console.log("=== 100ms Error ===:", data);
        
        // console.log("onJoin [local peer / video]", localPeer.localVideoTrack);
        // console.log("onJoin [local peer / audio]", localPeer.localAudioTrack);
    };
    const __onJoinListener = (data: {room: HMSRoom}) => {
        // gets triggered when join is successful. You can navigate to other screens.
        // use these objects to update your local and remote peers.
        const {localPeer} = data.room;

        // ADD YOUR OWN VIDEO TRACK (no audio)
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

    const __onPeerListener = ({peer, type}: {peer: HMSPeer; type: HMSPeerUpdate}) => {
        // gets triggered when peer leaves, joins, peer's audio or video is muted, starts or stops speaking, role is changed or becomes dominant speaker.
        // use these objects to update your local and remote peers.

        // We will create Tile for the Joined Peer when we receive `HMSUpdateListenerActions.ON_TRACK_UPDATE` event.
        // Note: We are chosing to not create Tiles for Peers which does not have any tracks
        if (type === HMSPeerUpdate.PEER_JOINED) {
            setPeerTrackNodes(prevPeerTrackNodes =>
                _updateNode({
                    nodes: prevPeerTrackNodes,
                    peer,
                    track: peer.videoTrack,
                    createNew: true,
                }),
            );

            return;
        }

        if (type === HMSPeerUpdate.PEER_LEFT) {
            // Remove all Tiles which has peer same as the peer which just left the room.
            // `removeNodeWithPeerId` function removes peerTrackNodes which has given peerID and returns updated list.
            setPeerTrackNodes(prevPeerTrackNodes => removeNodeWithPeerId(prevPeerTrackNodes, peer.peerID));
            return;
        }

        if (peer.isLocal) {
            // Updating the LocalPeer Tile.
            // `updateNodeWithPeer` function updates Peer object in PeerTrackNodes and returns updated list.
            // if none exist then we are "creating a new PeerTrackNode for the updated Peer".
            setPeerTrackNodes(prevPeerTrackNodes =>
                _updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
            );
            return;
        }

        if (
            type === HMSPeerUpdate.ROLE_CHANGED ||
            type === HMSPeerUpdate.METADATA_CHANGED ||
            type === HMSPeerUpdate.NAME_CHANGED ||
            type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
        ) {
            // Ignoring these update types because we want to keep this implementation simple.
            return;
        }
    };

    const __onTrackListener = ({track, peer, type}: {track: HMSTrack; peer: HMSPeer; type: HMSTrackUpdate}) => {
        // We will only consider Video tracks events to render videos
        if (track.type === HMSTrackType.VIDEO) {
            // If Video track is added, you can use `trackId` to render video
            if (type === HMSTrackUpdate.TRACK_ADDED) {
                if (!peer.isLocal) {
                    // FIXME: add the track to the peerTrackNodes if peer is not local
                    // Updating the Tiles with Track and Peer.
                    // `updateNode` function updates "Track and Peer objects" in PeerTrackNodes and returns updated list.
                    // if none exist then we are "creating a new PeerTrackNode with the received Track and Peer".
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

            // If Video track is removed, remove `HMSView` which is using this `trackId`
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
            }
        } else if (track.type === HMSTrackType.AUDIO) {
            console.log(`Update UI to show Audio Muted/Unmuted updates: ${track.trackId}`);
            if (type === HMSTrackUpdate.TRACK_ADDED) {
                if (!peer.isLocal) {
                    // FIXME: add the track to the peerTrackNodes if peer is not local
                    // Updating the Tiles with Track and Peer.
                    // `updateNode` function updates "Track and Peer objects" in PeerTrackNodes and returns updated list.
                    // if none exist then we are "creating a new PeerTrackNode with the received Track and Peer".
                    setPeerTrackNodes(prevPeerTrackNodes =>
                        _updateNodeWithPeer({
                            nodes: prevPeerTrackNodes,
                            peer,
                            createNew: true,
                        }),
                    );
                }
            }
        }
        // gets triggered when track is added, removed, muted, unmuted, degraded and restored back.
        // use these objects to update your local and remote peers.
    };

    const __onRoomListener = ({room, type}: {room: HMSRoom; type: HMSRoomUpdate}) => {
        // gets triggered when room is muted or unmuted.
        // TODO: implement this
    };

    const __onRemovedFromRoomListener = (data: any) => {
        // const __onRemovedFromRoomListener = (data: HMSLeaveRoomRequest) => {
        // triggered whenever someone removes local peer from the room or the room is ended.
        // You can navigate to home screen, clear all reducers and reset all the states whenever this is triggered
        console.log('onRemovedFromRoomListener triggered');
    };

    const __onMessageListener = (data: HMSMessage) => {
        // gets triggered whenever you receive a direct message, broadcasted message or role-based message.
        // whenever local peer receives a message this is triggered. Add the message to reducer.
    };

    const __onSpeakerListener = (data: HMSSpeaker[]) => {
        // gets triggered whenever someone speaks
        // an array of speakers is received. Use it to highlight the speakers.
        // TODO: implement this
    };

    const __onReconnectedListener = (data: any) => {
        // triggered when local peer is reconnected to the room.
    };

    const __onReconnectingListener = (data: any) => {
        // triggered whenever local peer is trying to reconnect to room, that is bad network.
    };

    /*
        WatchParty Video Player Sync Methods
    */
    const ___onPlay = () => {
        if (isHost && videoPlayerRef.current) {
            console.log(`HOST: ${user?.username} started playing the movie`);
            // SYNC: send a message to the room that the host started playing the movie
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'play-movie',
                payload: {
                    // send timestamp in seconds since epoch
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };
    const ___onPause = () => {
        if (isHost && videoPlayerRef.current) {
            setIsMoviePlaying(false);
            console.log(`HOST: ${user?.username} paused the movie`);
            // SYNC: send a message to the room that the host paused the movie
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'pause-movie',
                payload: {
                    // send timestamp in seconds since epoch
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };
    const ___onSeek = (data: OnSeekData) => {
        if (isHost && videoPlayerRef.current) {
            console.log(
                `HOST: ${user?.username} seeked the movie [currentTime: ${data.currentTime} / seekTime: ${data.seekTime}]]`,
            );
            // SYNC: send a message to the room that the host paused the movie
            roomChannelRef.current?.send({
                type: 'broadcast',
                event: 'seek-movie',
                payload: {
                    // send timestamp in seconds since epoch
                    currentTime: data.currentTime,
                    seekTime: data.seekTime,
                    timestamp: new Date().toISOString(),
                },
            });
        }
    };
    const ___onProgress = async (data: OnProgressData) => {
        // send an event to the room every 2 seconds
        if (isHost && Number(data.currentTime.toFixed(1)) % 2 === 0) {
            // SYNC: send a message to the room (sync channel) with the current progress of the movie
            await syncChannelRef.current?.track({
                isMoviePlaying: true,
                currentTime: data.currentTime,
                timestamp: new Date().toISOString(),
            })
            // update the currentTime state
            setCurrentTime(data.currentTime);
        }
        
    }
    const ___onEnd = () => {
        // setIsMoviePlaying(false);
        console.log(`${user?.username} ended the movie`);
    };
    const ___onPlaybackResume = () => {
        console.log(`${user?.username} resumed playback of the movie`);
    };
    const ___onEnterFullscreen = () => {
        // enter fullscreen
        setIsFullscreen(true);
        Orientation.lockToLandscape(); // Lock to landscape when entering fullscreen
        // seeek to the current time
        if (videoPlayerRef.current && currentTime) {
            videoPlayerRef.current.seek(currentTime);
        }
        // automatically play the video if it paused (if it was already playing)
        if (videoPlayerRef.current && !isMoviePlaying) {
            if (isHost) {
                // play on exit fullscreen if host
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost) {
                    // play on exit fullscreen if synced with host
                    setIsMoviePlaying(true);
                }
            }
        }


    };
    const ___onExitFullScreen = () => {
        // exit fullscreen
        setIsFullscreen(false);
        Orientation.lockToPortrait(); // Lock to portrait when exiting fullscreen
        // seeek to the current time
        if (videoPlayerRef.current && currentTime) {
            videoPlayerRef.current.seek(currentTime);
        }
        // automatically play the video if it paused (if it was already playing)
        if (videoPlayerRef.current && !isMoviePlaying) {
            if (isHost) {
                // play on exit fullscreen if host
                setIsMoviePlaying(true);
            } else {
                if (isSyncedWithHost) {
                    // play on exit fullscreen if synced with host
                    setIsMoviePlaying(true);
                }
            }
        }
    };
    const ___onBack = () => {
        if (isHost && videoPlayerRef.current) {
            console.log(`HOST: ${user?.username} exited the movie`);
            // SYNC: send a message to the room that the host paused the movie
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
    };
    const [expandedVideo, setExpandedVideo] = useState<Video | null>(null);
    const [fullscreenUserVideo, setFullscreenUserVideo] = useState(null); // State to track expanded video
    const [userVideoExpanded, setUserVideoExpanded] = useState(false); // State to track user's video expanded
    const [hasLottieFirstLoopCompleted, setHasLottieFirstLoopCompleted] = useState(false);
    const [terminateRoom, setTerminateRoom] = useState(false); // Add state for terminate setting
    const [members, setMembers] = useState<IUserProfile[] | []>([]); // Initial member list
    const [showTransferConfirmation, setShowTransferConfirmation] = useState(false);

    const getAvailableMembers = () => {
        // Get the userIDs of existing CRU members
        const existingMemberIDs = members.map(member => member.userID);

        // Filter out the existing members from the FAKE_USER_PROFILES data
        return FAKE_USER_PROFILES.slice(1, 7).filter(member => !existingMemberIDs.includes(member.userID));
    };

    const handleCancelTransfer = () => {
    setShowTransferConfirmation(false)
    };

    const handleTransfer = () => {
        setShowTransferConfirmation(false);
    };

    const handleCancelRoomTermination = () => {
        setTerminateRoom(false)
    };
    const handleRoomTermination = async () => {
        confirmOptions;
        _handleRoomLeave;
        _handleCloseMovie;
        setTerminateRoom(false);
    };

    const watchPartyView = () => {
        return (
            <View style={{marginBottom: SIZES.ScreenHeight / 12}}>
                {!isFullscreen && (
                    <View style={{zIndex: 20}}>
                        <Header />
                    </View>
                )}

                {/* Leave Room / Close Movie Buttons */}
                {!isFullscreen && (
                    <View style={styles.topcontainer}>
                        <TouchableOpacity onPress={_handleRoomLeave}>
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
                                {/* <TouchableOpacity onPress={_handleCloseMovie}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon name="close-circle" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Close</Text>
                                    </View>
                                </TouchableOpacity> */}

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

                {/* Movie Player */}
                <View style={{flex: 1, zIndex: 100}}>
                    {isStreamOpen ? (
                        // MOVIE INFO
                        <View style={styles.moviecontainer}>
                            <LinearGradient
                                // Background Linear Gradient
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
                                    {/* START MOVIE BUTTON */}
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
                        // VIDEO PLAYER
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
                                                    posterResizeMode="cover"
                                                    showOnStart={true}
                                                    // setup a videoPlayerRef to control playback
                                                    isFullscreen={isFullscreen}
                                                    // toggleResizeModeOnFullscreen={true}
                                                    fullscreenAutorotate={false}
                                                    tapAnywhereToPause={false}
                                                    preventsDisplaySleepDuringVideoPlayback={true}
                                                    // only show certain controls when you are host
                                                    onProgress={___onProgress}
                                                    // controls={isHost ? true : false}
                                                    disableBack={true}
                                                    disablePlayPause={isHost ? false : true}
                                                    disableSeekButtons={isHost ? false : true}
                                                    disableSeekbar={isHost ? false : true}
                                                    onBack={___onBack}
                                                    onPlay={___onPlay}
                                                    onPause={___onPause}
                                                    onSeek={___onSeek}
                                                    onEnterFullscreen={___onEnterFullscreen}
                                                    onFullscreenPlayerWillPresent={() => {
                                                        console.log('onFullscreenPlayerWillPresent');
                                                    }}
                                                    onExitFullscreen={___onExitFullScreen}
                                                    // onShowControls={___onShowControls}
                                                    // onHideControls={___onHideControls}
                                                    // onEnd={___onEnd} // TODO: handle end of movie
                                                    // onPlaybackResume={___onPlaybackResume}
                                                    // onBuffer={___onBuffer} // TODO: handle buffering
                                                    // onError={___onError} // TODO: handle error
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

                {/* CHAT ROOM */}
                <View
                    style={{
                        width: SIZES.ScreenWidth * 0.95,
                        height: (SIZES.ScreenWidth / 3) * 2.6,
                        marginTop: SIZES.ScreenHeight * 0.3,
                        backgroundColor: 'blue',
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
                            data={peerTrackNodes} // peerTrackNodes is an array of PeerTrackNode objects
                            keyExtractor={node => node.id}
                            renderItem={({item}) => {
                                // console.log("item", JSON.stringify(item, null, 2));
                                const isRoomHost = item.peer.role?.name === 'host';
                                const isUserVideo = item.peer.isLocal; // Check if this is the user's video
                                // const isExpanded = fullscreenUserVideo === item; // Check if this video is expanded
                                const isExpanded = expandedVideo === item;
                                return hmsInstanceRef.current ? (
                                    <View
                                        style={{
                                            width: isExpanded ? SIZES.ScreenWidth * 0.95 : SIZES.ScreenWidth / 3.2,
                                            height: isExpanded
                                                ? (SIZES.ScreenWidth / 3) * 2.6
                                                : SIZES.ScreenWidth / 2.6,
                                            backgroundColor: '#000',
                                        }}>
                                        {/* CAMERA SCREEN */}
                                        {item.peer.videoTrack ? (
                                            <hmsInstanceRef.current.HmsView
                                                key={item.id}
                                                trackId={item.peer.videoTrack.trackId}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: '#000',
                                                    borderRadius: 5,
                                                }}
                                                scaleType={HMSVideoViewMode.ASPECT_BALANCED}
                                                mirror={true}
                                            />
                                        ) : null}
                                        {/* HOST BADGE */}

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
                                                        // Contract the currently expanded video
                                                        setExpandedVideo(null);
                                                    } else {
                                                        if (isUserVideo && expandedVideo) {
                                                            // Minimize the user's video if it's expanded
                                                            setExpandedVideo(null);
                                                        }
                                                        setExpandedVideo(item); // Expand this video
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

                                        {/* USERNAME */}
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
                                                        ? item.peer.name // Display full name when expanded
                                                        : item.peer.name.length > 8
                                                        ? item.peer.name.substring(0, 8) + '...' // Truncate to 10 characters and add ellipsis
                                                        : item.peer.name}
                                                </Text>
                                                <Pressable onPress={item.peer.isLocal ? toggleMic : null}>
                                                    {item.peer.isLocal && isMicOn ? (
                                                        <Icon
                                                            name="mic-circle"
                                                            type="ionicon"
                                                            size={25}
                                                            color={COLORS.GREEN}
                                                        />
                                                    ) : (
                                                        <Icon
                                                            name="mic-off-circle"
                                                            type="ionicon"
                                                            size={25}
                                                            color={COLORS.CATREDLGT}
                                                        />
                                                    )}
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
                        <Pressable onPress={() => handleSnapPress(1)}>
                            <Icon name="chatbox-ellipses" type="ionicon" size={40} color={COLORS.CATPURPLGT} />
                        </Pressable>
                        <Pressable onPress={toggleMic}>
                            {isMicOn ? (
                                <Icon name="mic-circle" type="ionicon" size={40} color={COLORS.CATPURPLGT} />
                            ) : (
                                <Icon name="mic-off-circle" type="ionicon" size={40} color={COLORS.CATREDLGT} />
                            )}
                        </Pressable>
                    </View>
                </View>
                <BottomSheet //Chat Modal
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    backgroundStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
                    onClose={() => setIsChatOpen(true)}>
                    <BottomSheetScrollView style={{marginHorizontal: 15}}>
                        <MITChatCard />
                        <MITChatCard />
                        <MITChatCard />
                        <MITChatCard />
                    </BottomSheetScrollView>
                    <View style={{marginHorizontal: 15}}>
                        <View style={styles.input}>
                            <TextInput
                                placeholder={'placeholder'}
                                placeholderTextColor={'transparent'}
                                style={styles.textinput}
                            />

                            <AkcruButtons.XSmallButton
                                btnname={'REPLY'}
                                onPress={function (): void {}}
                                color=""
                                disabled={false}
                            />
                        </View>
                    </View>
                </BottomSheet>
                {/* Option Modal */}
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
                                (Once transfer is complete, you want be able to gain permissions back until it is given
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
                                    data={getAvailableMembers()}
                                    horizontal={false}
                                    showsHorizontalScrollIndicator={false}
                                    numColumns={2}
                                    scrollEnabled={false}
                                    keyExtractor={item => item.userID}
                                    renderItem={({item, index}) => (
                                        <View style={{marginVertical: 5}}>
                                            <SmlMemberCard
                                                userPicture={item.userPicture}
                                                userName={item.userName}
                                                onPress={() => {
                                                    setShowTransferConfirmation(true);
                                                }}
                                                influencer={item.influencer}
                                                userID={item.userID}
                                                akcruBadge={item.akcruBadge}
                                                userDesc={item.userDesc}
                                                avatarbordercolor={item.avatarbordercolor}
                                                // AddMember={() => {
                                                //     // Set the selected member when the user clicks on the "Add Member" button
                                                //     setSelectedMember(item);
                                                //     // Show the Add Member confirmation modal
                                                //     setShowAddMemberConfirmationModal(true);
                                                // }}
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
                                    Terminate CRU View and close room
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-around',

                                        paddingBottom: 5,
                                    }}>
                                <AkcruButtons.SmallButton 
                                btnname="Terminate" color={COLORS.CATREDLGT} disabled={false} onPress = {()=>{setTerminateRoom(true)}}
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
                                    {`Are you sure you want to transfer hosting privileges to "${members}"`}
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
                            }}>
                            <View style={{alignItems: 'center'}}>
                                <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm closing CRU View</Text>
                                <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                                    Are you sure you want to end this CRU View session?
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                <TouchableOpacity
                                    onPress={handleCancelRoomTermination}
                                    style={{
                                        backgroundColor: 'red',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}>
                                    <Text style={{...FONTS.Title3}}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleRoomTermination}
                                    style={{
                                        backgroundColor: 'green',
                                        padding: 10,
                                        borderRadius: 5,
                                    }}>
                                    <Text style={{...FONTS.Title3}}>Terminate</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    return isFullscreen ? (
        <View>{watchPartyView()}</View>
    ) : (
        <SafeAreaView>
            {isLoading ? null : watchPartyView()}
        </SafeAreaView>
    );
};

export default StartWatchPartyView;

const styles = StyleSheet.create({
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
        height: SIZES.ScreenWidth
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