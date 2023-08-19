import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import React, { useRef } from "react";
import Header from "../../../components/header";
import { SIZES, FONTS, COLORS } from "../../../../assets/constants";
import LinearGradient from "react-native-linear-gradient";
import { Icon } from "@rneui/base";
import { RouteProp } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { useState, useEffect } from "react";
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { StackNavigationProp } from "@react-navigation/stack";
import { findMovieById } from "../../../lib/api/movies.lib";
import { IMovie } from "../../../../types";
import { formatMovieDuration } from "../../../util/util";
import { supabaseRealtime } from "../../../../lib/supabase";
import { joinMyRoom } from "../../../lib/api/rooms.lib";
import useRoomStore from "../../../stores/room.store";
import { HMSConfig, HMSException, HMSRoom, HMSSDK, HMSTrack, HMSTrackSource, HMSTrackType, HMSUpdateListenerActions, HMSVideoViewMode } from "@100mslive/react-native-hms";
import useAuthStore from "../../../stores/auth.store";
import { RealtimeChannel } from "@supabase/supabase-js";

type RoomPreviewNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "RoomPreview"
>;

type RoomPreviewRouteProp = RouteProp<
  UserProfileStackParams,
  "RoomPreview"
>;

type Props = {
  navigation: RoomPreviewNavigationProp;
  route: RoomPreviewRouteProp;
  movieName: string;
  movieId: string;
};

const RoomPreviewScreen = ({ navigation, route }: Props) => {
  const movieId = route.params?.movieId;
  const [movie, setMovie] = useState<IMovie | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isUserVideoOn, setIsUserVideoOn] = useState(true);
  const [canJoinRoom, setCanJoinRoom] = useState(false);
  const [roomIdFrom100ms, setRoomIdFrom100ms] = useState<string | null>(null);
  const [previewVideoTrack, setPreviewVideoTrack] = useState<HMSTrack | undefined>(undefined);
  const { user } = useAuthStore()
  const hmsInstanceRef = useRef<HMSSDK | null>(null);

  useEffect(() => {
    // load the movie
    findMovieById(movieId).then((res) => {
      if (res) {
        setMovie(res);
      }
    })
  }, []);
  
  useEffect(() => {
    // TODO: setup the realtime channels for the room
    let roomChannel: RealtimeChannel | null = null
    let syncChannel: RealtimeChannel | null = null

    if (roomIdFrom100ms) {
      roomChannel = supabaseRealtime.channel(`room`) 
      syncChannel = supabaseRealtime.channel(`room-sync`) // TODO: make this a presence channel
      console.log("Create room and sync channels");
      // roomChannel = supabaseRealtime.channel(`room-${roomIdFrom100ms}`) 
      // syncChannel = supabaseRealtime.channel(`room-sync-${roomIdFrom100ms}`) // TODO: make this a presence channel
      // TODO: figure out how to store these globally

      if (roomChannel) {
        roomChannel
        .on(
          'broadcast',
          { event: 'test' },
          (payload) => console.log(payload)
        )
        .subscribe()
    
      }

      if (syncChannel) {
        syncChannel
          .on(
            'presence',
            { event: 'sync' },
            () => {
              const newState = syncChannel?.presenceState()
              console.log('sync', newState)
            }
          )
          // .on(
          //   'presence',
          //   { event: 'join' },
          //   ({ key, newPresences }) => {
          //     console.log('join', key, newPresences)
          //   }
          // )
          // .on(
          //   'presence',
          //   { event: 'leave' },
          //   ({ key, leftPresences }) => {
          //     console.log('leave [sync]:', key, leftPresences)
          //   }
          // )
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              // const presenceTrackStatus = await syncChannel?.track({
              //   role: "host",
              //   user: user?.username ?? "Anonymous",
              //   online_at: new Date().toISOString(),
              // })
              // console.log(presenceTrackStatus)
            }
          })
      }

      // every 2.5 seconds
      setInterval(myFunction, 2500);
      function myFunction() {
        if (syncChannel) {
          syncChannel?.track({
            timestamp: new Date().toUTCString(),
          })
        }
      }
    }
  }, [roomIdFrom100ms]);


  const _checkPermissions = async () => {
    // TODO: handle permissions for android as well

    // check permissions for camera and microphone on iOS
    check(PERMISSIONS.IOS.CAMERA)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('The camera is not available (on this device / in this context)');
          break;
        case RESULTS.DENIED:
          console.log('The camera permission has not been requested / is denied but requestable');
          request(PERMISSIONS.IOS.CAMERA).then((result) => {
            // …
            console.log("Requested camera permission", result);
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
    .catch((error) => {
      // display some error message for the user
    });
    
    check(PERMISSIONS.IOS.MICROPHONE)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('The microphone is not available (on this device / in this context)');
          break;
        case RESULTS.DENIED:
          console.log('The microphone permission has not been requested / is denied but requestable');
          request(PERMISSIONS.IOS.MICROPHONE).then((result) => {
            // …
            console.log("Requested microphone permission");
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
    .catch((error) => {
      // display some error message for the user
    });
  }

  const __onError = (error: HMSException) => {
    console.log("Error previewing room", error);
  }
  const __onPreview = (data: { room: HMSRoom, previewTracks: HMSTrack[] }) => {
    console.log("Previewing room..."); // FIXME: remove this
    console.log("Room", data.room); // FIXME: remove this
    setRoomIdFrom100ms(data.room.id)
    console.log("Preview Tracks", data.previewTracks); // FIXME: remove this
    
    // Get Local Audio Track from preview tracks
    const regularAudioTrack = data.previewTracks.find((previewTrack) => {
      return (
          previewTrack.source === HMSTrackSource.REGULAR && previewTrack.type === HMSTrackType.AUDIO
      );
    });

    // Get Local Video Track from preview tracks
    const regularVideoTrack = data.previewTracks.find((previewTrack) => {
      return (
          previewTrack.source === HMSTrackSource.REGULAR && previewTrack.type === HMSTrackType.VIDEO
      );
    });

    setPreviewVideoTrack(regularVideoTrack)

    // preview is successful, re-enable Join Room button
    setCanJoinRoom(true)
  }

  const _startRoomPreview = async () => {
    const hmsInstance = await HMSSDK.build();
    // set the hmsInstanceRef
    hmsInstanceRef.current = hmsInstance;

    console.log("Joining room...");

    // call join the room API endpoint to get the room Token
    // FIXME: handle user joining a room that they aren't hosting
    const roomAuthToken = await joinMyRoom()

    // check permissions for microphone and camera
    await _checkPermissions()

    // if (cameraPermission && micPermission && hmsInstance) { // TODO: make sure camera and mic permissions are granted
    if (hmsInstance) {
      console.log("starting preview check...");
      
      // 1. add Event Listeners to subscribe to Join Success or Failure updates
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, __onError); 
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PREVIEW, __onPreview);

      // 2. create an object of HMSConfig class using the available joining configurations.
      let config = new HMSConfig({
        authToken: roomAuthToken, // client-side token generated from `getAuthTokenByRoomCode` method
        username: user?.username ?? "Anonymous", // username of the user joining the room
      });

      // 3. call the preview method to join the room
      // starting room preview
      hmsInstance.preview(config)
  
      
    } else {
      // TODO: handle permissions not granted
      // TODO: handle no hmsInstance
      console.error("=== Permissions not granted or no hmsInstance ===");
      
    }
  }

  const _handleJoinRoom = async () => {
    console.log("Joining the acutal room...");
    console.log("Room ID", roomIdFrom100ms);
    
    // navigate to room and pass in the room auth token and current camera/mic settings

    // TODO: navigate to the room once joined to the 100ms room
      // then navigate to the room
      // navigation.navigate("StartCRUViewDate", {
      //   id,
      //   movieId,
      // })
  }

  const toggleMic = () => {
    setIsMicOn((prevState) => !prevState);
  };
  const toggleVideo = () => {
    setIsUserVideoOn((prevState) => !prevState);
  };


  useEffect(() => {
    _startRoomPreview()
  }, []);


  return (
    <SafeAreaView>
      <View
        style={{ marginBottom: SIZES.ScreenHeight / 12, height: "100%"}}>
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
        </View>

        {/* Video Info */}
        <View>
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
              </View>
            </View>
          </View>
        </View>

        <View
          style={{ flex: 1,
            marginHorizontal: 15,
            marginVertical: 10,
          }}>
          {/* Video Preview */}
          <View style={{ width: '100%', height: 300, backgroundColor: "#000", marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Only show when  */}
            {
              hmsInstanceRef.current &&
              previewVideoTrack ?
              (
                isUserVideoOn ? 
                  <hmsInstanceRef.current.HmsView
                    trackId={previewVideoTrack.trackId} // Render Video track by using its' trackId
                    scaleType={HMSVideoViewMode.ASPECT_FILL}
                    style={{ width: '100%', height: '100%' }}
                    mirror={true}
                  /> : null
              ): (
                <Text style={{ color: "#fff" }}>Loading....</Text>
              )
            }
            {/* <HmsView
              trackId={previewVideoTrack?.trackId} // Render Video track by using its' trackId
              scaleType={HMSVideoViewMode.ASPECT_FILL}
              style={{ width: '100%', height: '100%' }}
              mirror={true}
            /> */}
          </View>
        </View>

        <View
          style={{ flex: 1,
            marginHorizontal: 15,
            marginVertical: 10,
          }}>
          {/* Join Room Button */}
          <TouchableOpacity
            disabled={!canJoinRoom}
            onPress={() => {
              _handleJoinRoom();
            }}
            style={{ width: '100%', height: 50, display: "flex", alignItems: "center", justifyContent: 'center', backgroundColor: "#000" }}>
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 5 }}>Join Room</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottombtn}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <Pressable onPress={toggleVideo}>
              {cameraPermission && isUserVideoOn ? (
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
            <Pressable onPress={toggleMic}>
              {micPermission && isMicOn ? (
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

      </View>
    </SafeAreaView>
  );
};

export default RoomPreviewScreen;

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
    position: "absolute",
    height: 100,
    bottom: 0,
    width: "100%",
    marginBottom: 100
  }
});
