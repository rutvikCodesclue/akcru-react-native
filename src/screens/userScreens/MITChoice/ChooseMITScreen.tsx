import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import styles from "./styles";
import { COLORS, FONTS, SIZES } from "../../../../assets/constants";

import { Icon, Avatar, color } from "@rneui/base";
import MITSwipe from "../../../components/MITSwipe";
import Header from "../../../components/header";
import AkcruLevels from "../../../components/akcruBadges";
import MITMessages from "../../../components/MITMessages";
import AkcruButtons from "../../../components/akcruButtons";
import LinearGradient from "react-native-linear-gradient";
import { DIGITAL_PASS } from "../../../../assets/constants/Mockusers";
import imageindex from "../../../../assets/images/imageindex";
import { JENNY_INVITES } from "../../../../assets/constants/Mockusers";
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { StackNavigationProp } from "@react-navigation/stack";
import {acceptAMITInvite, declineAMITInvite, getMyMITInvites} from '../../../lib/api/mit.lib';
import {IMovie, IUserProfile} from '../../../../types';
import { getCRUInvites } from "../../../lib/api/cru.lib";
import { capitalizeFirstLetterOfString, formatMovieDuration, getShortenedTimezone, selectAvatarBorderColor } from "../../../util/util";
import YoutubePlayer from 'react-native-youtube-iframe';
import moment from "moment";
import { MediaType, launchImageLibrary } from "react-native-image-picker";
import MITMessage from "../../../../assets/constants/MITmessages";
import TabContainer from "../../../components/TabContainer/TabContainer";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";
import { HMSAudioTrackSettings, HMSCameraFacing, HMSConfig, HMSMessage, HMSPeer, HMSSDK, HMSTrack, HMSTrackSettings, HMSTrackSettingsInitState, HMSTrackUpdate, HMSUpdateListenerActions, HMSVideoTrackSettings } from "@100mslive/react-native-hms";
import { createChatRoom, getTextMessages, saveTextMessage } from "../../../lib/api/rooms.lib";
import useAuthStore from "../../../stores/auth.store";
import { TouchableRipple } from "react-native-paper";
import HexAvatar from "../../../components/HexAvatar";

type ChooseMITScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "ChooseMITScreen"
>;

type ChooseMITScreenRouteProp = RouteProp<
  UserProfileStackParams,
  "ChooseMITScreen"
>;

type Props = {
  navigation: ChooseMITScreenNavigationProp;
  route: ChooseMITScreenRouteProp;

};

const ChooseMITScreen = ({ navigation, route }: Props) => {
    const MITID: number | undefined = route.params?.MITID ?? null;
    const {user} = useAuthStore();

    const inviteeName: string | undefined = route.params?.inviteeName ?? null;

    // Access other passed parameters
    const movie: IMovie | null = route.params?.movie ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const inviteDate: string | undefined = route.params?.inviteDate ?? null;
    const akcruBadge: any = route.params?.akcruBadge ?? null;
    const schedule: string | undefined = route.params?.schedule ?? null;
    const timezone: string | undefined = route.params?.timezone ?? null;

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const [showTrailer, setShowTrailer] = useState(false);



  const [messages, setMessages] = useState<IMessage []>([])

  var roomId =""
  
  const hmsInstanceRef = useRef<HMSSDK | null>(null);
  useEffect(()=>{
    intializeChat();
    return () =>  {
      hmsInstanceRef.current != null ?? hmsInstanceRef.current?.removeAllListeners();
      hmsInstanceRef.current != null ?? hmsInstanceRef.current?.leave();
    }
  },[])



const getTrackSettings = () => {
let audioSettings = new HMSAudioTrackSettings({
  initialState:HMSTrackSettingsInitState.MUTED
});

let videoSettings = new HMSVideoTrackSettings({
  initialState: HMSTrackSettingsInitState.MUTED,
  cameraFacing: HMSCameraFacing.FRONT,
  forceSoftwareDecoder: true,
});
return new HMSTrackSettings({
    video: videoSettings,
    audio: audioSettings,
  });
};

const getTextMessage =  async(roomId:string)=>{
  const response  =   await  getTextMessages(roomId)
  console.log(JSON.stringify(response));
  setMessages(response!);
}

  const intializeChat = async()=>{
    const trackSettings = getTrackSettings();
    const hmsInstance = await HMSSDK.build({trackSettings});
    const fetchRoomInfo =  await  createChatRoom(creator?.id!,MITID!.toString());
    const chatId = fetchRoomInfo.room.roomId;
    roomId =chatId;
       const token =  fetchRoomInfo.roomAuthToken.token // await hmsInstance.getAuthTokenByRoomCode(fetchRoomInfo.room.roomId);
        const hmsConfig = new HMSConfig({
          authToken: token,
          username: user?.username!,
        });
        hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinSuccess);
        hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);
        
        //  const localPeer = await hmsInstance.getLocalPeer();
        //  localPeer.audioTrack!.mute  =false;
        //  To Mute Video of local peer - other peers will stop seeing video
        hmsInstance.join(hmsConfig);
        hmsInstance.onMessageListener = onMessageListener
        hmsInstanceRef.current = hmsInstance;
        getTextMessage(MITID!.toString())
    /**
     * Create `HMSConfig` with the above auth token and username
     */
  }

  const onTrackListener = ({
    track,
    peer,
    type
}: {
    track: HMSTrack,
    peer: HMSPeer,
    type: HMSTrackUpdate
}) => {
    // gets triggered when track is added, removed, muted, unmuted, degraded and restored back.
    // use these objects to update your local and remote peers.
};


 


const onMessageListener = (data: HMSMessage) => {
 
    var messsages: IMessage [] = []
    const iMessage : IMessage = {
             _id: creator?.id!,
             text: data.message,
             user: { _id: creator?.id!,},
             createdAt: data.time,
         };
         messsages.push(iMessage);
   setMessages(previousMessages =>
   GiftedChat.append(previousMessages, messsages),
 )
};


  const onReceiverMessage = (data: HMSMessage)=>
  {
    var messsages: IMessage [] = []
    const iMessage : IMessage = {
             _id: creator?.id!,
             text: data.message,
             user: { _id: creator?.id!,},
             createdAt: data.time,
         };
         messsages.push(iMessage);
   setMessages(previousMessages =>
   GiftedChat.append(previousMessages, messsages),
 )

  }


  const onJoinSuccess = async(a :any)=>
  {

    hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_MESSAGE, onReceiverMessage);
    hmsInstanceRef.current!.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, onTrackListener);
  }

  const onError = (e :any ) =>{
    console.log('FAILLL'+JSON.stringify(e));
  }
 

  /*
  const allMessages = useHMSStore(selectHMSMessages); // get all messages
  const broadcastMessages = useHMSStore(selectBroadcastMessages); // get all broadcasted messages
  const groupMessagesByRole = useHMSStore(selectMessagesByRole('host')); // get conversation with the host role
  const directMessages = useHMSStore(selectMessagesByPeerID('')); // get private conversation with peer
  */




  const onSend = useCallback( async (messages : IMessage[] = []) => {
    hmsInstanceRef.current!.sendBroadcastMessage(messages[0]!.text!,'chat');
    setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages),
      )
      saveTextMessage(MITID!.toString(),messages[0]!.text!, creator?.id!,);
    }, [])



    const handleDecline = () => {
        setIsLoading(true);
        console.log('decline invite');
        declineAMITInvite({inviteId: MITID})
            .then(res => {
                console.log('declined res:', res);
                setIsLoading(false);
                // Add any additional logic you need after declining the invite
                // For example, navigate to another screen or update the UI.
                // You can add navigation.navigate here if needed.
            })
            .catch(error => {
                console.error('Error declining invite:', error);
                setIsLoading(false);
            });
    };

    const handleAccept = () => {
        setIsLoading(true);
        console.log('accept invite');
        acceptAMITInvite({inviteId: MITID})
            .then(res => {
                console.log('accepted res:', res);
                setIsLoading(false);
                // Add any additional logic you need after accepting the invite
                // For example, navigate to another screen or update the UI.
                // You can add navigation.navigate here if needed.
            })
            .catch(error => {
                console.error('Error accepting invite:', error);
                setIsLoading(false);
            });
    };

    // Then, you can use these functions in your navigation.navigate calls
    const handleDeclineNavigation = () => {
        handleDecline(); // Call the decline function here
        navigation.navigate('DeclineMITScreen', {
            MITID: MITID,
            movie: movie,
            creator: creator,
            inviteDate: inviteDate,
            akcruBadge: akcruBadge,
            schedule: schedule,
            timezone: timezone,
        });
    };

    const handleAcceptNavigation = () => {
        handleAccept(); // Call the accept function here
        navigation.navigate('AcceptMITScreen', {
            MITID: MITID,
            movie: movie,
            creator: creator,
            inviteDate: inviteDate,
            akcruBadge: akcruBadge,
            schedule: schedule,
            timezone: timezone,
        });
    };

    //Playing Trailer functions

    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
            Alert.alert('Trailer has finished playing!');
        }
    }, []);

    const toggleTrailerPlaying = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

    //Chat Room functions

    const [showChat, setShowChat] = useState(false);
    

    const handleAvatarPress = (user: any) => {
        // Navigate to the user's profile screen
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    return (
        <TabContainer>
            <View style={{flex: 1}}>
                <View style={styles.sheetcontainer}>
                    <ScrollView stickyHeaderIndices={[0]}>
                        <View>
                            <Header />
                        </View>
                        <View>
                            <View
                                //   source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                                //   resizeMode="cover"
                                style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
                                <LinearGradient
                                    // Background Linear Gradient
                                    colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        height: SIZES.ScreenHeight / 4,
                                    }}
                                />
                                <View style={styles.topcontainer}>
                                    <TouchableOpacity onPress={() => navigation.navigate('UserMITHubScreen')}>
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
                                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={styles.screenTitle}>Movie Invite Ticket</Text>
                                            <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                                        </View>
                                        <TouchableOpacity onPress={() => setShowChat(true)}>
                                            <Icon
                                                name="chatbox-ellipses"
                                                type="ionicon"
                                                size={30}
                                                color={COLORS.MIDORANGE}
                                                style={{marginRight: 20}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: -60,
                                    marginHorizontal: 15,
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{marginRight: 8}}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.navigate('ViewUserScreen', {userID: creator?.id})
                                            }>
                                            <HexAvatar
                                                source={{uri: creator?.profilePicture}}
                                                size={58}
                                                bordercolor={selectAvatarBorderColor(creator?.badge ?? 'AKCRUIT')}
                                            />
                                
                                        </TouchableOpacity>
                                        <View />

                                        <View
                                            style={{
                                                backgroundColor: 'green',
                                                height: 12,
                                                width: 12,
                                                borderRadius: 8,
                                                position: 'absolute',
                                                right: 8,
                                            }}
                                        />

                                        {/* {!privateaccount ? (
                                      online ? (
                                          <View
                                              style={{
                                                  backgroundColor: 'green',
                                                  height: 12,
                                                  width: 12,
                                                  borderRadius: 8,
                                                  position: 'absolute',
                                                  right: 8,
                                              }}
                                          />
                                      ) : (
                                          <View
                                              style={{
                                                  backgroundColor: 'red',
                                                  height: 12,
                                                  width: 12,
                                                  borderRadius: 8,
                                                  position: 'absolute',
                                                  right: 8,
                                              }}
                                          />
                                      )
                                  ) : null} */}
                                    </View>
                                    <View style={{width: SIZES.ScreenWidth / 2.5}}>
                                        <Text style={{...FONTS.Title2, fontSize: 12}}>{creator?.username}</Text>
                                        <Text style={{...FONTS.paragraph1, fontSize: 12}}>{creator?.firstName}</Text>
                                        {akcruBadge === 'AKCRUIT' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeAkcruit />
                                            </View>
                                        )}
                                        {akcruBadge === 'GUARDIAN' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeGuardian />
                                            </View>
                                        )}
                                        {akcruBadge === 'HERO' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeHero />
                                            </View>
                                        )}
                                        {akcruBadge === 'SUPERHERO' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeSuperHero />
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={{marginVertical: 20}}>
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            borderLeftWidth: 1,
                                            borderColor: COLORS.DARKGREY,
                                            paddingLeft: 10,
                                        }}>
                                        <View
                                            style={{
                                                width: 100,
                                                height: 60,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{...FONTS.Title3, fontSize: 14}}>
                                                {creator?.followerCount}
                                            </Text>
                                            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Followers</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={styles.bottomcontainer}>
                                    <View style={{alignItems: 'center', marginBottom: 10}}>
                                        <View style={{marginTop: 10}}>
                                            <View style={{flexDirection: 'row', width: '75%'}}>
                                                <View style={{marginRight: 10}}>
                                                    <Image source={{uri: movie?.portraitURL}} style={styles.poster} />
                                                </View>
                                                <View style={{}}>
                                                    <Text style={{...FONTS.Title2, fontSize: 12}}>{movie?.title}</Text>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            marginBottom: 5,
                                                            alignItems: 'center',
                                                        }}>
                                                        <Text style={{...FONTS.paragraph1, fontSize: 12}}>
                                                            {movie?.year}
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                ...FONTS.paragraph1,
                                                                fontSize: 12,
                                                                marginHorizontal: 10,
                                                            }}>
                                                            {formatMovieDuration(movie?.duration)}
                                                        </Text>
                                                    </View>
                                                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                                                        <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                        <Text style={styles.drawfonttag}>
                                                            {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                        </Text>

                                                        <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPressOut={() => {
                                                            navigation.navigate('TrailerPlayer', {
                                                                id: movie?.id,
                                                                trailerURL: movie?.trailerURL,
                                                                landscapeURL: movie?.landscapeURL,
                                                            });
                                                        }}
                                                        disabled={false}
                                                        style={{marginTop: 10}}>
                                                        <View
                                                            style={{
                                                                width: 125,
                                                                height: 30,
                                                                backgroundColor: COLORS.CATPURPDRK,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                borderRadius: 3,
                                                            }}>
                                                            <Text style={styles.playButton}>Play Trailer</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            fontSize: 12,
                                            textAlign: 'center',
                                            color: COLORS.PURPLE,
                                        }}>
                                        "{creator?.firstName}" wants to watch "{movie?.title}" with you on:
                                    </Text>
                                </View>
                                <View style={{alignItems: 'center', marginVertical: 10}}>
                                    <View style={styles.datebox}>
                                        <Text style={styles.datetext}>
                                            {' '}
                                            {moment(schedule).tz(timezone).format('ddd, MMM Do')}{' '}
                                        </Text>
                                        <Text style={styles.datetext}>@ </Text>
                                        <Text style={styles.datetext}>
                                            {/* render UTC Time w/ moment */}
                                            {moment(schedule).tz(timezone).format('h:mm A')}{' '}
                                            {getShortenedTimezone(timezone)}
                                        </Text>

                                        {/* <Text style={styles.datetext}>@ {MITTime}</Text> */}
                                    </View>
                                </View>
                                <View style={{marginTop: 25}}>
                                    <MITSwipe decline={handleDeclineNavigation} accept={handleAcceptNavigation} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    {/* <View style={styles.opensheet}>
                    
                    </View> */}
                    {/* {Chat Room} */}

                    <Modal animationType="fade" transparent={true} visible={showChat}>
                        <View style={{backgroundColor: COLORS.AKCRUBACKGROUND, flex: 1}}>
                            <View style={{zIndex: 20}}>
                                <Header />
                            </View>
                            <View style={{marginHorizontal: 15, marginBottom: 10, zIndex: 21}}>
                                <TouchableRipple onPress={() => setShowChat(false)}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                    </View>
                                </TouchableRipple>
                            </View>
                            <View style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                                <GiftedChat
                                    messages={messages}
                                    onSend={messages => onSend(messages)}
                                    user={{
                                        _id: user?.id!,
                                        name: user?.username,
                                    }}
                                    textInputProps={{
                                        style: {
                                            color: COLORS.BLACK, // Set the color of the text inside the input area
                                            width: '85%', // Adjust the width based on typing status
                                            // You can add more custom styles here if needed
                                        },
                                    }}
                                    renderUsernameOnMessage={true}
                                    showUserAvatar={true}
                                    renderAvatar={props => (
                                        <TouchableRipple onPress={() => handleAvatarPress(props.currentMessage?.user)}>
                                            <HexAvatar
                                                size={45}
                                                bordercolor={selectAvatarBorderColor(
                                                    props.currentMessage?.user?._id === user?.id
                                                        ? user?.badge ?? 'AKCRUIT'
                                                        : 'OTHER_USER_BADGE',
                                                )}
                                                source={{
                                                    uri:
                                                        props.currentMessage?.user?._id === user?.id
                                                            ? user?.profilePicture
                                                            : creator?.profilePicture,
                                                }}
                                                {...props}
                                            />
                                        </TouchableRipple>
                                    )}
                                    renderBubble={props => (
                                        <Bubble
                                            {...props}
                                            wrapperStyle={{
                                                right: {
                                                    // Change the background color for messages sent by the current user
                                                    backgroundColor: COLORS.AKCRUBLUE,
                                                },
                                                left: {
                                                    // Change the background color for messages sent by other users
                                                    backgroundColor: COLORS.CATPURPDRK,
                                                },
                                            }}
                                            textStyle={{
                                                right: {
                                                    // Text color for messages sent by the current user
                                                    color: COLORS.WHITE,
                                                },
                                                left: {
                                                    // Text color for messages sent by other users
                                                    color: COLORS.WHITE,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </TabContainer>
    );
};

export default ChooseMITScreen;
