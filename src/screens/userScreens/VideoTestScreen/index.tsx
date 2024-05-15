import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
    SafeAreaView,
    FlatList,
    StatusBar,
    Text,
    View,
    TouchableHighlight,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import {Permission, PERMISSIONS, request, requestMultiple, RESULTS} from 'react-native-permissions';
import {
    HMSSDK,
    HMSUpdateListenerActions,
    HMSConfig,
    HMSTrackType,
    HMSTrackUpdate,
    HMSPeerUpdate,
} from '@100mslive/react-native-hms';

/**
 * Take Room Code from Dashbaord for this sample app.
 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/get-started/token#get-room-code-from-100ms-dashboard | Room Code}
 */
const ROOM_CODE = 'vev-areq-ugc';

/**
 * using `ROOM_CODE` is recommended over `AUTH_TOKEN` approach
 *
 * Take Auth Token from Dashbaord for this sample app.
 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/foundation/security-and-tokens | Token Concept}
 */
const AUTH_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiYXBwIiwiYXBwX2RhdGEiOm51bGwsImFjY2Vzc19rZXkiOiI2NDkzNjYxODkxYzAyM2I0ZTJkNzY4MjciLCJyb2xlIjoiaG9zdCIsInJvb21faWQiOiI2NGM1MGUzYzdmYjg5NWJlZDZmNzRmOGQiLCJ1c2VyX2lkIjoiMWIxNzQ2MjUtNzdiNS00ZTQyLTljYTEtMDJkZGQyMjU0NjI0IiwiZXhwIjoxNjkxMzM2MjI4LCJqdGkiOiI1YmU4OGE2NC02MTgwLTRiMjUtODIyYS0zYTliZGFmNzAwZTAiLCJpYXQiOjE2OTEyNDk4MjgsImlzcyI6IjY0OTM2NjE4OTFjMDIzYjRlMmQ3NjgyNSIsIm5iZiI6MTY5MTI0OTgyOCwic3ViIjoiYXBpIn0.tKAgBstNfdcfiC9R74iaZpnZED8D92ynx7AvYJDCNlw';

const USERNAME = 'Test User';

//#region Screens
const VideoTestScreen = () => {
    const [joinRoom, setJoinRoom] = useState(false);

    const navigate = useCallback(screen => setJoinRoom(screen === 'RoomScreen'), []);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#EFF7FF'}}>
            <StatusBar barStyle={'dark-content'} />

            {joinRoom ? <RoomScreen navigate={navigate} /> : <HomeScreen navigate={navigate} />}
        </SafeAreaView>
    );
};

export default VideoTestScreen;

const HomeScreen = ({navigate}) => {
    const handleJoinPress = async () => {
        const permissionsGranted = await checkPermissions([
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        ]);

        if (permissionsGranted) {
            navigate('RoomScreen');
        } else {
            console.log('Permission Not Granted!');
        }
    };

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <TouchableHighlight
                onPress={handleJoinPress}
                underlayColor="#143466"
                style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    backgroundColor: '#2471ED',
                    borderRadius: 8,
                }}>
                <Text style={{fontSize: 20, color: '#ffffff'}}>Join Room</Text>
            </TouchableHighlight>
        </View>
    );
};

const RoomScreen = ({navigate}) => {
    /**
     * `usePeerTrackNodes` hook takes care of setting up {@link HMSSDK | HMSSDK} instance, joining room and adding all required event listeners.
     * It gives us:
     *  1. peerTrackNodes - This is a list of {@link PeerTrackNode}, we can use this list to render local and remote peer tiles.
     *  2. loading - We can show loader while Room Room join is under process.
     *  3. leaveRoom - This is a function that can be called on a button press to leave room and go back to Welcome screen.
     */
    const {peerTrackNodes, loading, leaveRoom, hmsInstanceRef} = usePeerTrackNodes({navigate});

    const HmsView = hmsInstanceRef.current?.HmsView;

    const _keyExtractor = item => item.id;

    const _renderItem = ({item}) => {
        const {peer, track} = item;

        return (
            <View
                style={{
                    height: 300,
                    margin: 8,
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: '#A0C3D2',
                }}>
                {HmsView && track && track.trackId && !track.isMute() ? (
                    <HmsView trackId={track.trackId} mirror={peer.isLocal} style={{width: '100%', height: '100%'}} />
                ) : (
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <View
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#FD8A8A',
                            }}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 28,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                }}>
                                {peer.name
                                    .split(' ')
                                    .map(item => item[0])
                                    .join('')}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const handleRoomEnd = () => {
        leaveRoom();

        navigate('HomeScreen');
    };

    return (
        <View style={{flex: 1}}>
            {loading ? (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size={'large'} color="#2471ED" />
                </View>
            ) : (
                <View style={{flex: 1, position: 'relative'}}>
                    {peerTrackNodes.length > 0 ? (
                        <FlatList
                            centerContent={true}
                            data={peerTrackNodes}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={_keyExtractor}
                            renderItem={_renderItem}
                            contentContainerStyle={{
                                paddingBottom: 120,
                                flexGrow: Platform.OS === 'android' ? 1 : undefined,
                                justifyContent: Platform.OS === 'android' ? 'center' : undefined,
                            }}
                        />
                    ) : (
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontSize: 28, marginBottom: 32}}>Welcome!</Text>
                            <Text style={{fontSize: 16}}>You’re the first one here.</Text>
                            <Text style={{fontSize: 16}}>Sit back and relax till the others join.</Text>
                        </View>
                    )}

                    <TouchableHighlight
                        onPress={handleRoomEnd}
                        underlayColor="#6e2028"
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            alignSelf: 'center',
                            backgroundColor: '#CC525F',
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Text style={{textAlign: 'center', color: '#ffffff', fontWeight: 'bold'}}>Leave Room</Text>
                    </TouchableHighlight>
                </View>
            )}
        </View>
    );
};
//#endregion Screens

/**
 * Sets up HMSSDK instance, Adds required Event Listeners
 * Checkout Quick Start guide to know things covered {@link https://www.100ms.live/docs/react-native/v2/guides/quickstart | Quick Start Guide}
 */
export const usePeerTrackNodes = ({navigate}) => {
    const hmsInstanceRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [peerTrackNodes, setPeerTrackNodes] = useState([]);

    /**
     * Handles Room leave process
     */
    const handleRoomLeave = async () => {
        try {
            const hmsInstance = hmsInstanceRef.current;

            if (!hmsInstance) {
                return Promise.reject('HMSSDK instance is null');
            }

            hmsInstance.removeAllListeners();

            /**
             * Leave Room. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/leave | Leave Room}
             */
            const leaveResult = await hmsInstance.leave();
            console.log('Leave Success: ', leaveResult);

            /**
             * Free/Release Resources. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/release-resources | Release Resources}
             */
            const destroyResult = await hmsInstance.destroy();
            console.log('Destroy Success: ', destroyResult);

            hmsInstanceRef.current = null;
        } catch (error) {
            console.log('Leave or Destroy Error: ', error);
        }
    };

    /**
     * Handles Join Update received from {@link HMSUpdateListenerActions.ON_JOIN} event listener
     * Receiving This event means User (that is Local Peer) has successfully joined room
     * @param {Object} data - object which has room object
     * @param {Object} data.room - current {@link HMSRoom | room} object
     */
    const onJoinSuccess = data => {
        /**
         * Checkout {@link HMSLocalPeer | HMSLocalPeer} Class
         */
        const {localPeer} = data.room;

        setPeerTrackNodes(prevPeerTrackNodes =>
            updateNode({
                nodes: prevPeerTrackNodes,
                peer: localPeer,
                track: localPeer.videoTrack,
                createNew: true,
            }),
        );

        setLoading(false);
    };

    /**
     * Handles Peer Updates received from {@link HMSUpdateListenerActions.ON_PEER_UPDATE} event listener
     * @param {Object} data - This has updated peer and update type
     * @param {HMSPeer} data.peer - Updated Peer
     * @param {HMSPeerUpdate} data.type - Update Type
     */
    const onPeerListener = ({peer, type}) => {
        if (type === HMSPeerUpdate.PEER_JOINED) {
            return;
        }

        if (type === HMSPeerUpdate.PEER_LEFT) {
            setPeerTrackNodes(prevPeerTrackNodes => removeNodeWithPeerId(prevPeerTrackNodes, peer.peerID));
            return;
        }

        if (peer.isLocal) {
            setPeerTrackNodes(prevPeerTrackNodes =>
                updateNodeWithPeer({nodes: prevPeerTrackNodes, peer, createNew: true}),
            );
            return;
        }

        if (
            type === HMSPeerUpdate.ROLE_CHANGED ||
            type === HMSPeerUpdate.METADATA_CHANGED ||
            type === HMSPeerUpdate.NAME_CHANGED ||
            type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
        ) {
            return;
        }
    };

    /**
     * Handles Track Updates received from {@link HMSUpdateListenerActions.ON_TRACK_UPDATE} event listener
     * @param {Object} data - This has updated track with peer and update type
     * @param {HMSPeer} data.peer - Peer
     * @param {HMSTrack} data.track - Peer Track
     * @param {HMSTrackUpdate} data.type - Update Type
     */
    const onTrackListener = ({peer, track, type}) => {
        if (type === HMSTrackUpdate.TRACK_ADDED && track.type === HMSTrackType.VIDEO) {
            setPeerTrackNodes(prevPeerTrackNodes =>
                updateNode({
                    nodes: prevPeerTrackNodes,
                    peer,
                    track,
                    createNew: true,
                }),
            );

            return;
        }

        if (type === HMSTrackUpdate.TRACK_MUTED || type === HMSTrackUpdate.TRACK_UNMUTED) {
            if (track.type === HMSTrackType.VIDEO) {
                setPeerTrackNodes(prevPeerTrackNodes =>
                    updateNode({
                        nodes: prevPeerTrackNodes,
                        peer,
                        track,
                    }),
                );
            } else {
                setPeerTrackNodes(prevPeerTrackNodes =>
                    updateNodeWithPeer({
                        nodes: prevPeerTrackNodes,
                        peer,
                    }),
                );
            }
            return;
        }

        if (type === HMSTrackUpdate.TRACK_REMOVED) {
            return;
        }

        /**
         * For more info about Degrade/Restore. check out {@link https://www.100ms.live/docs/react-native/v2/features/auto-video-degrade | Auto Video Degrade}
         */
        if (type === HMSTrackUpdate.TRACK_RESTORED || type === HMSTrackUpdate.TRACK_DEGRADED) {
            return;
        }
    };

    /**
     * Handles Errors received from {@link HMSUpdateListenerActions.ON_ERROR} event listener
     * @param {HMSException} error
     *
     * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/error-handling | Error Handling}
     */
    const onErrorListener = error => {
        setLoading(false);

        console.log(`${error?.code} ${error?.description}`);
    };

    useEffect(() => {
        const joinRoom = async () => {
            try {
                setLoading(true);

                /**
                 * creating {@link HMSSDK} instance to join room
                 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/join#join-a-room | Join a Room}
                 */
                const hmsInstance = await HMSSDK.build();

                hmsInstanceRef.current = hmsInstance;

                let token = AUTH_TOKEN;

                if (!token) {
                    token = await hmsInstance.getAuthTokenByRoomCode(ROOM_CODE);
                }

                /**
                 * Adding HMSSDK Event Listeners before calling Join method on HMSSDK instance
                 * For more info, Check out -
                 * {@link https://www.100ms.live/docs/react-native/v2/features/join#update-listener | Adding Event Listeners before Join},
                 * {@link https://www.100ms.live/docs/react-native/v2/features/event-listeners | Event Listeners},
                 * {@link https://www.100ms.live/docs/react-native/v2/features/event-listeners-enums | Event Listeners Enums}
                 */
                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinSuccess);

                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, onPeerListener);

                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrackListener);

                hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onErrorListener);

                /**
                 * Joining Room. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/join#join-a-room | Join a Room}
                 */
                hmsInstance.join(new HMSConfig({authToken: token, username: USERNAME}));
            } catch (error) {
                navigate('HomeScreen');
                console.error(error);
                Alert.alert('Error', 'Check your console to see error logs!');
            }
        };

        joinRoom();

        return () => {
            handleRoomLeave();
        };
    }, [navigate]);

    return {loading, leaveRoom: handleRoomLeave, peerTrackNodes, hmsInstanceRef};
};

//#region Utilities

/**
 * Function to check permissions
 * @param {string[]} permissions
 * @returns {boolean} all permissions granted or not
 */
export const checkPermissions = async (permissions: Permission[]) => {
    console.log('Checking permissions');

    try {
        if (Platform.OS === 'ios') {
            return true;
        }
        const requiredPermissions = permissions.filter(
            (permission: Permission) => permission.toString() !== PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        );

        const results = await requestMultiple(requiredPermissions);

        let allPermissionsGranted = true;
        for (let permission in requiredPermissions) {
            if (!(results[requiredPermissions[permission]] === RESULTS.GRANTED)) {
                allPermissionsGranted = false;
            }
            console.log(`${requiredPermissions[permission]} : ${results[requiredPermissions[permission]]}`);
        }

        if (permissions.findIndex(permission => permission.toString() === PERMISSIONS.ANDROID.BLUETOOTH_CONNECT) >= 0) {
            const bleConnectResult = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
            console.log(`${PERMISSIONS.ANDROID.BLUETOOTH_CONNECT} : ${bleConnectResult}`);
        }

        return allPermissionsGranted;
    } catch (error) {
        console.log(error);
        return false;
    }
};

/**
 * returns `uniqueId` for a given `peer` and `track` combination
 */
export const getPeerTrackNodeId = (peer, track) => {
    return peer.peerID + (track?.source ?? HMSTrackSource.REGULAR);
};

/**
 * creates `PeerTrackNode` object for given `peer` and `track` combination
 */
export const createPeerTrackNode = (peer, track) => {
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

/**
 * Removes all nodes which has `peer` with `id` same as the given `peerID`.
 */
export const removeNodeWithPeerId = (nodes, peerID) => {
    return nodes.filter(node => node.peer.peerID !== peerID);
};

/**
 * Updates `peer` of `PeerTrackNode` objects which has `peer` with `peerID` same as the given `peerID`.
 *
 * If `createNew` is passed as `true` and no `PeerTrackNode` exists with `id` same as `uniqueId` generated from given `peer` and `track`
 * then new `PeerTrackNode` object will be created.
 */
export const updateNodeWithPeer = data => {
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

/**
 * Removes all nodes which has `id` same as `uniqueId` generated from given `peer` and `track`.
 */
export const removeNode = (nodes, peer, track) => {
    const uniqueId = getPeerTrackNodeId(peer, track);

    return nodes.filter(node => node.id !== uniqueId);
};

/**
 * Updates `track` and `peer` of `PeerTrackNode` objects which has `id` same as `uniqueId` generated from given `peer` and `track`.
 *
 * If `createNew` is passed as `true` and no `PeerTrackNode` exists with `id` same as `uniqueId` generated from given `peer` and `track`
 * then new `PeerTrackNode` object will be created
 */
export const updateNode = data => {
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
