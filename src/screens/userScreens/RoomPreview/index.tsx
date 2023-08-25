import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
} from "react-native";
import React, { useRef } from "react";
import Header from "../../../components/header";
import { SIZES, FONTS, COLORS } from "../../../../assets/constants";
import LinearGradient from "react-native-linear-gradient";
import { Icon } from "@rneui/base";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { useState, useEffect } from "react";
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { StackNavigationProp } from "@react-navigation/stack";
import { findMovieById } from "../../../lib/api/movies.lib";
import { IMovie } from "../../../../types";
import { formatMovieDuration } from "../../../util/util";
import { joinMyRoom } from "../../../lib/api/rooms.lib";
import { HMSConfig, HMSException, HMSRoom, HMSSDK, HMSTrack, HMSTrackSource, HMSTrackType, HMSUpdateListenerActions, HMSVideoViewMode } from "@100mslive/react-native-hms";
import useAuthStore from "../../../stores/auth.store";
import {capitalizeFirstLetterOfString} from '../../../util/util';
import AkcruButtons from "../../../components/akcruButtons";
import { NoBottomTabStackParams } from "../../../navigation/NoBottomTabStack";


type RoomPreviewNavigationProp = StackNavigationProp<NoBottomTabStackParams, 'RoomPreviewScreen'>;

type RoomPreviewRouteProp = RouteProp<
  UserProfileStackParams,
  "RoomPreviewScreen"
>;

type Props = {
    navigation: RoomPreviewNavigationProp;
    route: RoomPreviewRouteProp;
    movieName: string;
    movieId: string;
};

const RoomPreviewScreen = ({ navigation, route }: Props) => {

const micInitialState = route.params?.micInitialState;
const cameraInitialState = route.params?.cameraInitialState;

  const movieId = route.params?.movieId;
  const [movie, setMovie] = useState<IMovie | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState(micInitialState);
  const [isUserVideoOn, setIsUserVideoOn] = useState(cameraInitialState);
  const [canJoinRoom, setCanJoinRoom] = useState(false);
  const [roomIdFrom100ms, setRoomIdFrom100ms] = useState<string | null>(null);
  const [previewVideoTrack, setPreviewVideoTrack] = useState<HMSTrack | undefined>(undefined);
  const [roomAuthToken, setAuthRoomToken] = useState<string | null>(null);
  const { user } = useAuthStore()
  const hmsInstanceRef = useRef<HMSSDK | null>(null);

  const [isMovieDataLoaded, setIsMovieDataLoaded] = useState(false);

  useEffect(() => {
    // load the movie
    findMovieById(movieId).then((res) => {
      if (res) {
        setMovie(res);
      } 
    })
  }, []);

  const _checkPermissions = async () => {
    //check permissions for camera and microphone on android
    if (Platform.OS === 'android') {
      // Request microphone permission
      check(PERMISSIONS.ANDROID.RECORD_AUDIO)
      .then(audioResult => {
          if (audioResult === RESULTS.GRANTED) {
              // Microphone permission granted
              console.log('Microphone permission granted');
          }
      })
      .catch(audioError => {
          // Handle microphone permission request error
          console.log('Microphone permission request error:', audioError);
      });

      // Request camera permission
      check(PERMISSIONS.ANDROID.CAMERA)
      .then(cameraResult => {
          if (cameraResult === RESULTS.GRANTED) {
              // Camera permission granted
              console.log('Camera permission granted');
          }
      })
      .catch(cameraError => {
          // Handle camera permission request error
          console.log('Camera permission request error:', cameraError);
      });
    }
    // check permissions for camera and microphone on iOS
    if (Platform.OS === 'ios') {
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
  }

  const __onError = (error: HMSException) => {
    console.log("Error previewing room", error);
  }
  const __onPreview = (data: { room: HMSRoom, previewTracks: HMSTrack[] }) => {
    // console.log("Previewing room..."); // FIXME: remove this
    // console.log("Room", data.room); // FIXME: remove this
    setRoomIdFrom100ms(data.room.id)
    // console.log("Preview Tracks", data.previewTracks); // FIXME: remove this
    
    // Get Local Audio Track from preview tracks (we don't need this for preview)
    // const regularAudioTrack = data.previewTracks.find((previewTrack) => {
    //   return (
    //       previewTrack.source === HMSTrackSource.REGULAR && previewTrack.type === HMSTrackType.AUDIO
    //   );
    // });

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

    console.log("Joining room preview [RoomPreviewScreen]...");

    // call join the room API endpoint to get the room Token
    // FIXME: handle user joining a room that they aren't hosting
    const authTokenForRoom = await joinMyRoom()
    setAuthRoomToken(authTokenForRoom)

    // check permissions for microphone and camera (iOS/Android)
    await _checkPermissions()

    // if (cameraPermission && micPermission && hmsInstance) { // TODO: make sure camera and mic permissions are granted
    if (hmsInstance) {
      console.log("Registering Room Preview Event Listeners [RoomPreviewScreen]...");
      
      // 1. add Event Listeners to subscribe to Join Success or Failure updates
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, __onError); 
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PREVIEW, __onPreview);

      // 2. create an object of HMSConfig class using the available joining configurations.
      let config = new HMSConfig({
        authToken: authTokenForRoom, // client-side token generated from `getAuthTokenByRoomCode` method
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
    // navigate to room and pass in the room auth token and current camera/mic settings
    if (roomIdFrom100ms && roomAuthToken) {
      // leave the room preview (cleanup 100ms resources)
      const leaveRoomSuccessful = await _handleRoomLeave()

      if (leaveRoomSuccessful) {
        // navigate to the room
        navigation.navigate("StartCRUViewDate", {
          movieId,
          roomId: roomIdFrom100ms,
          roomAuthToken,
          micInitialState: isMicOn,
          cameraInitialState: isUserVideoOn,
        })
      }

    }
  }

  const _handleRoomLeave = async () => {
    try {
      const hmsInstance = hmsInstanceRef.current;
  
      if (!hmsInstance) {
        return Promise.reject('HMSSDK instance is null');
      }
      // Removing all registered listeners
      hmsInstance.removeAllListeners();
      console.log('All listeners removed [RoomPreviewScreen]');
      
  
      /**
       * Leave Room. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/leave | Leave Room}
       */
      const leaveResult = await hmsInstance.leave();
      console.log('Leave Success [RoomPreviewScreen]:', leaveResult);
  
      /**
       * Free/Release Resources. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/release-resources | Release Resources}
       */
      const destroyResult = await hmsInstance.destroy();
      console.log('Destroy Success [RoomPreviewScreen]:', destroyResult);
  
      // Removing HMSSDK instance
      hmsInstanceRef.current = null;

      return true
    } catch (error) {
      console.log('Leave or Destroy Error: ', error);
      return false
    }
  };

  const toggleMic = () => {
      setIsMicOn((prevState: boolean) => !prevState);
  };
  const toggleVideo = () => {
      setIsUserVideoOn((prevState: boolean) => !prevState);
  };


  // useEffect(() => {
  //   _startRoomPreview()

  //   return () => {
  //     console.log("Leaving room preview...");
      
  //     // cleanup (if app crashes or user leaves the screen unexpectedly)
  //     if (hmsInstanceRef.current) {
  //       _handleRoomLeave()
  //       // hmsInstanceRef.current.leave();
  //     }
  //   }
  // }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // This code will run when the screen comes into focus (e.g., when navigating to this screen)
      console.log('Screen focused [RoomPreviewScreen]');
      console.log("Starting room preview...");
      _startRoomPreview()

      return () => {
        // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
        console.log('Screen unfocused [RoomPreviewScreen]');
        console.log("Leaving room preview...");
      
      // cleanup (if app crashes or user leaves the screen unexpectedly)
      if (hmsInstanceRef.current) {
        _handleRoomLeave()
        // hmsInstanceRef.current.leave();
      }
      };
    }, [])
  );


  return (
      <SafeAreaView>
          <View style={{marginBottom: SIZES.ScreenHeight / 12, height: '100%'}}>
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
                          <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                          <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
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
                          <Image source={{uri: movie?.portraitURL ?? undefined}} style={styles.poster} />
                      </View>
                      <View>
                          <Text style={{...FONTS.Title3}}>{movie?.title ?? 'Loading...'}</Text>
                          <View
                              style={{
                                  flexDirection: 'row',
                                  marginVertical: 8,
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
                          <View style={{flexDirection: 'row'}}>
                              <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                              <Text style={styles.drawfonttag}>
                                  {movie?.genres[0] ? capitalizeFirstLetterOfString(movie?.genres[0]) : '...'}
                              </Text>
                              <Text style={styles.drawfonttag}>
                                  {movie?.genres[1] ? capitalizeFirstLetterOfString(movie?.genres[1]) : '...'}
                              </Text>

                              <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                          </View>
                          <View style={{flexDirection: 'row'}}></View>
                      </View>
                  </View>
              </View>

              <View style={{flex: 1, marginHorizontal: 15, marginVertical: 10}}>
                  {/* Video Preview */}
                  <View
                      style={{
                          width: '100%',
                          height: 300,
                          backgroundColor: '#000',
                          marginBottom: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                      }}>
                      {/* Only show when  */}
                      {hmsInstanceRef.current && previewVideoTrack ? (
                          isUserVideoOn ? (
                              <hmsInstanceRef.current.HmsView
                                  trackId={previewVideoTrack.trackId} // Render Video track by using its' trackId
                                  scaleType={HMSVideoViewMode.ASPECT_FILL}
                                  style={{width: '100%', height: '100%'}}
                                  mirror={true}
                              />
                          ) : <Text style={{color: '#fff'}}>Camera Off</Text>
                      ) : (
                          <Text style={{color: '#fff'}}>Loading....</Text>
                      )}
                  </View>
              </View>

              <View style={{flex: 1, marginHorizontal: 15, marginVertical: 10, alignItems: 'center'}}>
                  {/* Join Room Button */}
                  <TouchableOpacity>
                      <AkcruButtons.LrgButton
                          disabled={!canJoinRoom}
                          onPress={() => {
                              _handleJoinRoom();
                          }}
                          btnname="Join Room"
                          color={COLORS.AKCRUBLUE}
                      />
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                      disabled={!canJoinRoom}
                      onPress={() => {
                          _handleJoinRoom();
                      }}
                      style={{
                          width: '100%',
                          height: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#000',
                      }}>
                      <Text style={{color: '#fff', textAlign: 'center', marginTop: 5}}>Join Room</Text>
                  </TouchableOpacity> */}
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
                      <Pressable onPress={toggleMic}>
                          {isMicOn ? (
                              <Icon name="mic-circle" type="ionicon" size={40} color={COLORS.CATPURPLGT} />
                          ) : (
                              <Icon name="mic-off-circle" type="ionicon" size={40} color={COLORS.CATREDLGT} />
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
    moviecontainer: {
        marginHorizontal: 15,
        padding: 10,
        flexDirection: 'row',
        backgroundColor: '#1C202A',
        borderRadius: 5,
        height: SIZES.ScreenHeight / 7,
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
        height: 100,
        bottom: 0,
        width: '100%',
        marginBottom: 100,
    },
});
