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
  FlatList
} from "react-native";
import React from "react";
import CRUUserVideoList from "../../../components/CruViewUserVideoList";
import AkcruButtons from "../../../components/akcruButtons";
import Header from "../../../components/header";
import MITChatCard from "../../../components/MITChatCard/MITChatCard";
import { SIZES, FONTS, COLORS } from "../../../../assets/constants";
import LinearGradient from "react-native-linear-gradient";
import { Icon } from "@rneui/base";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState, useRef, useEffect, useCallback } from "react";
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

//import { ResizeMode, Video } from 'expo-av';
// import { Video, ResizeMode } from "expo-av";
// import * as ScreenOrientation from "expo-screen-orientation";
import { StackNavigationProp } from "@react-navigation/stack";
import VideoPlayer from "react-native-media-console";
import { findMovieById } from "../../../lib/api/movies.lib";
import { IMovie } from "../../../../types";
import { formatMovieDuration } from "../../../util/util";
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
  HMSRemotePeer,
  HMSAudioTrackSettings,
  HMSVideoTrackSettings,
} from "@100mslive/react-native-hms";
import useAuthStore from "../../../stores/auth.store";

// function setOrientation() {
//   if (Dimensions.get("window").height > Dimensions.get("window").width) {
//     //Device is in portrait mode, rotate to landscape mode.
//     ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
//   } else {
//     //Device is in landscape mode, rotate to portrait mode.
//     ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
//   }
// }


type StartCRUViewDateNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "StartCRUViewDate"
>;

type StartCRUViewDateRouteProp = RouteProp<
  UserProfileStackParams,
  "StartCRUViewDate"
>;

type Props = {
  navigation: StartCRUViewDateNavigationProp;
  route: StartCRUViewDateRouteProp;
  movieName: string;
  movieId: string;
  roomId: string;
  roomAuthToken: string;
  micInitialState: boolean;
  cameraInitialState: boolean;
};

const StartCRUViewDate = ({ navigation, route }: Props) => {
  const movieId = route.params?.movieId;
  const roomId = route.params?.roomId;
  const roomAuthToken = route.params?.roomAuthToken;
  const micInitialState = route.params?.micInitialState;
  const cameraInitialState = route.params?.cameraInitialState;
  const [movie, setMovie] = useState<IMovie | null>(null);
  const hmsInstanceRef = useRef<HMSSDK | null>(null);
  const [peerTrackNodes, setPeerTrackNodes] = useState([]); // Use this state to render Peer Tiles
  const [trackIds, setTrackIds] = useState<string[]>([]);
  const { user } = useAuthStore();

  const HMSView = hmsInstanceRef.current?.HmsView;
  // const _keyExtractor = (item) => item.id;

  useEffect(() => {
    // join the 100ms room
    _join100msRoom()
    // load the movie
    findMovieById(movieId).then((res) => {
      if (res) {
        setMovie(res);
      }
    })

    console.log("room details [movieId]:", movieId );
    console.log("room details [roomId]:", roomId );
    console.log("room details [roomAuthToken]:", roomAuthToken);
    console.log("room details [micInitialState]:", micInitialState);
    console.log("room details [cameraInitialState]:", cameraInitialState);
    
    // TODO: setup the realtime channels for the room
    
  }, []);

  /**
   * returns `uniqueId` for a given `peer` and `track` combination
   */
  const getPeerTrackNodeId = (peer, track) => {
    return peer.peerID + (track?.source ?? HMSTrackSource.REGULAR);
  };

  /**
   * creates `PeerTrackNode` object for given `peer` and `track` combination
   */
  const createPeerTrackNode = (peer, track) => {
    let isVideoTrack = false;
    if (track && track?.type === HMSTrackType.VIDEO) {
        isVideoTrack = true;
    }
    const videoTrack = isVideoTrack ? track : undefined;
    return {
        id: getPeerTrackNodeId(peer, track),
        peer: peer,
        track: videoTrack
    };
  };

  /**
  * Removes all nodes which has `peer` with `id` same as the given `peerID`.
  */
  const removeNodeWithPeerId = (nodes, peerID) => {
    return nodes.filter((node) => node.peer.peerID !== peerID);
  };

  /**
   * Updates `track` and `peer` of `PeerTrackNode` objects which has `id` same as `uniqueId` generated from given `peer` and `track`.
   *
   * If `createNew` is passed as `true` and no `PeerTrackNode` exists with `id` same as `uniqueId` generated from given `peer` and `track`
   * then new `PeerTrackNode` object will be created
   */
  const _updateNode = (data) => {
    const { nodes, peer, track, createNew = false } = data;

    const uniqueId = getPeerTrackNodeId(peer, track);

    const nodeExists = nodes.some((node) => node.id === uniqueId);

    if (nodeExists) {
        return nodes.map((node) => {
            if (node.id === uniqueId) {
                return { ...node, peer, track };
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

  const _join100msRoom = async () => {
    // set track settings
  //   let audioSettings = new HMSAudioTrackSettings({
  //     initialState: HMSTrackSettingsInitState.MUTED
  // });

  // let videoSettings = new HMSVideoTrackSettings({
  //     initialState: HMSTrackSettingsInitState.MUTED
  // });
  //   const trackSettings = new HMSTrackSettings({
  //     video: videoSettings,
  //     audio: audioSettings
  //   });
    let hmsInstance: HMSSDK | null = null;
    if (hmsInstanceRef.current == null) {
      hmsInstance = await HMSSDK.build();
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
        hmsInstance.addEventListener(HMSUpdateListenerActions.ON_REMOVED_FROM_ROOM, __onRemovedFromRoomListener);
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
          console.log("Joining the call...");
          
          hmsInstance.join(config)
        }
      }
    }
  }

  useEffect(() => {
    console.log("Current track ids:", trackIds);
    
  }, [trackIds]);

  const __onErrorListener = (data: HMSException) => {
    // gets triggered when join is successful. You can navigate to other screens.
    // use these objects to update your local and remote peers.
    console.log("onErrorListener", data);
    // console.log("onJoin [local peer / video]", localPeer.localVideoTrack);
    // console.log("onJoin [local peer / audio]", localPeer.localAudioTrack);
    
  };
  const __onJoinListener = (data: { room: HMSRoom }) => {
    // gets triggered when join is successful. You can navigate to other screens.
    // use these objects to update your local and remote peers.
    console.log("onJoinListener", data.room);
    // console.log("onJoin [local peer / video]", localPeer.localVideoTrack);
    // console.log("onJoin [local peer / audio]", localPeer.localAudioTrack);
    
  };

  const __onPeerListener = ({ peer, type }: { peer: HMSPeer, type: HMSPeerUpdate }) => {
    // gets triggered when peer leaves, joins, peer's audio or video is muted, starts or stops speaking, role is changed or becomes dominant speaker.
    // use these objects to update your local and remote peers.
  };

  const __onTrackListener = ({
    track,
    peer,
    type
}: {
    track: HMSTrack,
    peer: HMSPeer,
    type: HMSTrackUpdate
}) => {

  // We will only consider Video tracks events to render videos
  if (track.type === HMSTrackType.VIDEO) {
      // If Video track is added, you can use `trackId` to render video
      if (type === HMSTrackUpdate.TRACK_ADDED) {
          console.log(`${peer.name}s' video track Added: ${track.trackId}`);
          console.log(`Render HMSView with trackId: ${track.trackId}`);
          setTrackIds(prevTrackIds => [...prevTrackIds, track.trackId]);
      }

      // If Video track is removed, remove `HMSView` which is using this `trackId`
      if (type === HMSTrackUpdate.TRACK_REMOVED) {
          console.log(`${peer.name}s' video track Removed: ${track.trackId}`);
          console.log(`Remove HMSView rendering trackId: ${track.trackId}`);
          setTrackIds(prevTrackIds => prevTrackIds.filter(prevTrackId => prevTrackId !== track.trackId));
      }

      if (
          type === HMSTrackUpdate.TRACK_MUTED ||
          type === HMSTrackUpdate.TRACK_UNMUTED ||
          type === HMSTrackUpdate.TRACK_RESTORED ||
          type === HMSTrackUpdate.TRACK_DEGRADED
      ) {
          console.log(
              `Update UI to show Muted/Unmuted/Degraded/Restored updates: ${track.trackId}`
          );
      }
  }
    // gets triggered when track is added, removed, muted, unmuted, degraded and restored back.
    // use these objects to update your local and remote peers.
  };

  const __onRoomListener = ({ room, type }: { room: HMSRoom, type: HMSRoomUpdate }) => {
    // gets triggered when room is muted or unmuted.
  };

  const __onRemovedFromRoomListener = (data: any) => {
  // const __onRemovedFromRoomListener = (data: HMSLeaveRoomRequest) => {
    // triggered whenever someone removes local peer from the room or the room is ended.
    // You can navigate to home screen, clear all reducers and reset all the states whenever this is triggered
  };

  const __onMessageListener = (data: HMSMessage) => {
    // gets triggered whenever you receive a direct message, broadcasted message or role-based message.
    // whenever local peer receives a message this is triggered. Add the message to reducer.
  };

  const __onSpeakerListener = (data: HMSSpeaker[]) => {
    // gets triggered whenever someone speaks
    // an array of speakers is received. Use it to highlight the speakers.
  };

  const __onReconnectedListener = (data: any) => {
    // triggered when local peer is reconnected to the room.
  };

  const __onReconnectingListener = (data: any) => {
    // triggered whenever local peer is trying to reconnect to room, that is bad network.
  };
  
  // FIXME: re-enable this when working on party sync
  // useEffect(() => {
  //   console.log("room details [movieId]:", movieId );
  //   console.log("room details [roomId]:", roomId );
  //   console.log("room details [roomAuthToken]:", roomAuthToken);
  //   // TODO: setup the realtime channels for the room
  //   let roomChannel: RealtimeChannel | null = null
  //   let syncChannel: RealtimeChannel | null = null

  //   if (roomId) {
  //     roomChannel = supabaseRealtime.channel(`room`) 
  //     syncChannel = supabaseRealtime.channel(`room-sync`) // TODO: make this a presence channel
  //     console.log("Create room and sync channels");
  //     // roomChannel = supabaseRealtime.channel(`room-${roomId}`) 
  //     // syncChannel = supabaseRealtime.channel(`room-sync-${roomId}`) // TODO: make this a presence channel
  //     // TODO: figure out how to store these globally

  //     if (roomChannel) {
  //       roomChannel
  //       .on(
  //         'broadcast',
  //         { event: 'test' },
  //         (payload) => console.log(payload)
  //       )
  //       .subscribe()
    
  //     }

  //     if (syncChannel) {
  //       syncChannel
  //         .on(
  //           'presence',
  //           { event: 'sync' },
  //           () => {
  //             const newState = syncChannel?.presenceState()
  //             console.log('sync', newState)
  //           }
  //         )
  //         // .on(
  //         //   'presence',
  //         //   { event: 'join' },
  //         //   ({ key, newPresences }) => {
  //         //     console.log('join', key, newPresences)
  //         //   }
  //         // )
  //         // .on(
  //         //   'presence',
  //         //   { event: 'leave' },
  //         //   ({ key, leftPresences }) => {
  //         //     console.log('leave [sync]:', key, leftPresences)
  //         //   }
  //         // )
  //         .subscribe(async (status) => {
  //           if (status === 'SUBSCRIBED') {
  //             // const presenceTrackStatus = await syncChannel?.track({
  //             //   role: "host",
  //             //   user: user?.username ?? "Anonymous",
  //             //   online_at: new Date().toISOString(),
  //             // })
  //             // console.log(presenceTrackStatus)
  //           }
  //         })
  //     }

  //     // every 2.5 seconds
  //     setInterval(myFunction, 2500);
  //     function myFunction() {
  //       if (syncChannel) {
  //         syncChannel?.track({
  //           timestamp: new Date().toUTCString(),
  //         })
  //       }
  //     }
  //   }
  // }, [roomId]);

  const [isStreamOpen, setIsStreamOpen] = useState(true);
  const [isMicOn, setIsMicOn] = useState(micInitialState);
  const [isUserVideoOn, setIsUserVideoOn] = useState(cameraInitialState);

  const toggleMic = () => {
    setIsMicOn((prevState: boolean) => !prevState);
  };
  const toggleVideo = () => {
    setIsUserVideoOn((prevState: boolean) => !prevState);
  };

  const sheetRef = useRef<BottomSheet>(null); //Pop up chat
  const [isChatOpen, setIsChatOpen] = useState(false);

  const snapPoints = ["1", "40"];

  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsChatOpen(true);
  }, []);

  return (
    <SafeAreaView>
      <View
        // stickyHeaderIndices={[0]}
        style={{marginBottom: SIZES.ScreenHeight / 12}}>
        <View style={{zIndex: 20}}>
          <Header />
        </View>

        <View style={styles.topcontainer}>
          <TouchableOpacity onPress={() => navigation.pop()}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Icon
                name="chevron-back"
                type="ionicon"
                size={20}
                color={COLORS.LIGHTGREY}
              />
              <Text style={{...FONTS.Title3, marginLeft: 5}}>Leave Room</Text>
            </View>
          </TouchableOpacity>
          {!isStreamOpen && (
            <TouchableOpacity onPress={() => setIsStreamOpen(true)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="close-circle"
                  type="ionicon"
                  size={20}
                  color={COLORS.LIGHTGREY}
                />
                <Text style={{...FONTS.Title3, marginLeft: 5}}>
                  Close Movie
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Movie Player */}
        <View>
          {isStreamOpen ? (
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
                  height: SIZES.ScreenHeight / 7,
                }}
              />
              <View style={{marginRight: 10}}>
                <Image
                  source={{uri: movie?.portraitURL ?? undefined}}
                  style={styles.poster}
                />
              </View>
              <View>
                <Text style={{...FONTS.Title3}}>
                  {movie?.title ?? "Loading..."}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    marginVertical: 8,
                    alignItems: 'center',
                  }}>
                  <Text style={{...FONTS.Title2, fontSize: 12}}>
                    {movie?.year}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      fontSize: 12,
                      marginHorizontal: 10,
                    }}>
                    {movie?.duration ? formatMovieDuration(movie?.duration) : "..."}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {movie?.rated}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {movie?.genres[0]}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {movie?.rating}/10
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <TouchableWithoutFeedback>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: COLORS.TAGCOLOR,
                        marginRight: 10,
                        paddingHorizontal: 10,
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
                      <Icon
                        name="tv-outline"
                        type="ionicon"
                        size={20}
                        color={COLORS.MIDORANGE}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    onPress={() => setIsStreamOpen(false)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: COLORS.TAGCOLOR,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          ...FONTS.paragraph1,
                          marginRight: 10,
                          fontSize: 12,
                        }}>
                        Play Stream
                      </Text>
                      <Icon
                        name="play"
                        type="ionicon"
                        size={20}
                        color={COLORS.CATREDLGT}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.videocontain}>
                <View style={{flex: 1}}>
                  <View style={{height: SIZES.ScreenHeight / 4}}>
                    <VideoPlayer
                      source={{
                        uri: movie?.movieURL,
                      }}
                      tapAnywhereToPause={true}
                      toggleResizeModeOnFullscreen={true}
                      isFullscreen={false}
                      posterResizeMode="cover"
                      poster={movie?.landscapeURL}
                    />
                  </View>
                  <View style={{backgroundColor: 'red', flex: 1}}></View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 15,
          }}>
          <Image
            source={imageindex.AkcruHexLogo}
            style={{width: 25, height: 25}}
          />
          <Text style={{...FONTS.Title2Orange, marginLeft: 5}}>
            Enjoy the CRU View
          </Text>
        </View> */}

        <View
          style={{ 
            marginHorizontal: 15,
            width: 400,
            height: 550,
            backgroundColor: "purple",
          }}>
            {
              hmsInstanceRef.current ? (
                <FlatList
                  style={{ flex: 1, backgroundColor: "blue" }}
                  key={trackIds.length}
                  numColumns={2}
                  data={trackIds} // trackIds is an array of trackIds of video tracks
                  keyExtractor={(trackId) => trackId}
                  renderItem={({ item }) => 
                    (
                      hmsInstanceRef.current ? 
                      <hmsInstanceRef.current.HmsView 
                        key={item} 
                        trackId={item} 
                        style={{ flex:1,  height: 200, backgroundColor: "red" }} 
                        scaleType={HMSVideoViewMode.ASPECT_FILL}
                        mirror={true}
                      /> 
                      : <View style={{ backgroundColor: "#fff", width: 200, height: 200 }}>nothings rendering</View>
                    )
                  }
                />
              ): 
              <View style={{ backgroundColor: "#fff", width: 200, height: 200 }}>
                <Text>Loading...</Text>
              </View>
            }
          {/* <CRUUserVideoList /> */}
        </View>

        {isStreamOpen ? (
          <View style={{height: SIZES.ScreenHeight * 0.16}}></View>
        ) : (
          <View style={{height: SIZES.ScreenHeight * 0.055}}></View>
        )}
        <View style={styles.bottombtn}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <Pressable onPress={toggleVideo}>
              {isUserVideoOn ? (
                <Icon
                  name="video"
                  type="material-community"
                  size={40}
                  color={COLORS.CATPURPLGT}
                />
              ) : (
                <Icon
                  name="video-off"
                  type="material-community"
                  size={40}
                  color={COLORS.CATREDLGT}
                />
              )}
            </Pressable>
            <Pressable onPress={() => handleSnapPress(1)}>
              <Icon
                name="chatbox-ellipses"
                type="ionicon"
                size={40}
                color={COLORS.CATPURPLGT}
              />
            </Pressable>
            <Pressable onPress={toggleMic}>
              {isMicOn ? (
                <Icon
                  name="mic-circle"
                  type="ionicon"
                  size={40}
                  color={COLORS.CATPURPLGT}
                />
              ) : (
                <Icon
                  name="mic-off-circle"
                  type="ionicon"
                  size={40}
                  color={COLORS.CATREDLGT}
                />
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
      </View>
    </SafeAreaView>
  );
};

export default StartCRUViewDate;

const styles = StyleSheet.create({
  topcontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 5,
  },
  moviecontainer: {
    marginHorizontal: 15,
    padding: 10,
    flexDirection: "row",
    backgroundColor: "#1C202A",
    borderRadius: 5,
    height: SIZES.ScreenHeight / 7,
    alignItems: "center",
  },
  drawfonttag: {
    ...FONTS.Title2Orange,
    color: COLORS.DARKGREY,
    backgroundColor: COLORS.TAGCOLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderRadius: 4,
    textAlign: "center",
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.8,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    justifyContent: "space-between",
    marginVertical: 10,
    paddingLeft: 10,
    alignItems: "center",
    height: 35,
  },
  textinput: {
    color: COLORS.LIGHTGREY,
  },
  videocontain: {
    flex: 1,
    zIndex: 1,
    justifyContent: "center",
  },
  videoplayer: {
    alignSelf: "center",
    aspectRatio: 16 / 9,
    width: "100%",
  },
  bottombtn: {

  }
});
