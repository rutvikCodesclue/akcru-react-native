import React, { useState, useCallback, useRef } from "react";
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
} from "react-native";
import styles from "./styles";
import { COLORS, FONTS, SIZES } from "../../../../assets/constants";

import { Icon, Avatar } from "@rneui/base";
import MITSwipe from "../../../components/MITSwipe";
import Header from "../../../components/header";
import AkcruLevels from "../../../components/akcruBadges";
import MITMessages from "../../../components/MITMessagesCard/MITMessagesCard";
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
import { capitalizeFirstLetterOfString, formatMovieDuration } from "../../../util/util";
import YoutubePlayer from 'react-native-youtube-iframe';

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
  const inviteeName: string | undefined = route.params?.inviteeName ?? null;

  // Access other passed parameters
  const movie: IMovie | null = route.params?.movie ?? null;
  const creator: IUserProfile | null = route.params?.creator ?? null;
  const inviteDate: string | undefined = route.params?.inviteDate ?? null;
  const akcruBadge: any = route.params?.akcruBadge ?? null;

  const [isLoaded, setIsLoaded] = useState(false);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [showTrailer, setShowTrailer] = useState(false);

  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);

  const snapPoints = ["1", "85"];

  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

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


  return (
      <View style={{flex: 1}}>
          <View style={styles.sheetcontainer}>
              <ScrollView stickyHeaderIndices={[0]}>
                  <View>
                      <Header />
                  </View>
                  <View>
                      <ImageBackground
                          source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                          resizeMode="cover"
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
                                      <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                      <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                  </View>
                              </TouchableOpacity>
                              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                  <Text style={styles.screenTitle}>Movie Invite Ticket</Text>
                                  <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                              </View>
                          </View>
                      </ImageBackground>
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
                                      onPress={() => navigation.navigate('ViewUserScreen', {userID: creator?.id})}>
                                      <Avatar
                                          rounded
                                          size={70}
                                          source={{
                                              uri: creator?.profilePicture,
                                          }}
                                          avatarStyle={{
                                              borderWidth: 2,
                                              borderColor: COLORS.AKCRUBLUE,
                                          }}
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
                                  <Text style={{...FONTS.Title2}}>{creator?.username}</Text>
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
                                      <Text style={{...FONTS.Title3, fontSize: 14}}>{creator?.followerCount}</Text>
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
                                              <Text style={{...FONTS.Title2}}>{movie?.title}</Text>
                                              <View
                                                  style={{
                                                      flexDirection: 'row',
                                                      marginBottom: 5,
                                                      alignItems: 'center',
                                                  }}>
                                                  <Text style={{...FONTS.Title2, fontSize: 12}}>{movie?.year}</Text>
                                                  <Text style={{...FONTS.Title2, fontSize: 12, marginHorizontal: 10}}>
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
                                                  onPressOut={() => setShowTrailer(true)}
                                                  disabled={isLoading}
                                                  style={{marginTop: 10}}>
                                                  <View
                                                      style={{
                                                          width: 125,
                                                          height: 30,
                                                          backgroundColor: COLORS.CATREDLGT,
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
                                      color: COLORS.MIDORANGE,
                                  }}>
                                  "{creator?.firstName}" wants to watch "{movie?.title}" with you on:
                              </Text>
                          </View>
                          <View style={{alignItems: 'center', marginVertical: 20}}>
                              <View style={styles.datebox}>
                                  <Text style={styles.datetext}>
                                      {' '}
                                      {new Date(inviteDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                      })}
                                  </Text>
                                  {/* <Text style={styles.datetext}>@ {MITTime}</Text> */}
                              </View>
                              {/* <TouchableOpacity>
                                  <Text style={styles.datetext}>Request change</Text>
                              </TouchableOpacity> */}
                          </View>
                          <View style={{marginTop: 25}}>
                              <MITSwipe decline={handleDeclineNavigation} accept={handleAcceptNavigation} />
                          </View>
                      </View>
                  </View>
              </ScrollView>
              <View style={styles.opensheet}>
                  <TouchableOpacity onPress={() => handleSnapPress(1)}>
                      <Icon name="chevron-up" type="ionicon" size={30} color={COLORS.DARKGREY} />
                  </TouchableOpacity>
              </View>

              <BottomSheet
                  ref={sheetRef}
                  snapPoints={snapPoints}
                  enablePanDownToClose={true}
                  backgroundStyle={{backgroundColor: COLORS.TAGCOLOR}}
                  onClose={() => setIsOpen(true)}>
                  <BottomSheetScrollView style={{marginHorizontal: 15}}>
                      <MITMessages
                          inviteePicture={creator?.profilePicture}
                          inviteeName={creator?.username}
                          akcruBadge={creator?.badge}
                          // influencer={influencer}
                          avatarbordercolor={COLORS.AKCRUBLUE}
                      />
                  </BottomSheetScrollView>
                  <View style={{marginBottom: 75, marginHorizontal: 15}}>
                      <View style={styles.input}>
                          <TextInput
                              placeholder={'placeholder'}
                              placeholderTextColor={'transparent'}
                              style={styles.textinput}
                          />

                          <AkcruButtons.XSmallButton
                              btnname={'SEND'}
                              onPress={function (): void {}}
                              color=""
                              disabled={false}
                          />
                      </View>
                  </View>
              </BottomSheet>
          </View>
          {/* Play Trailer Modal */}
          <Modal animationType="fade" transparent={true} visible={showTrailer}>
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
                          <Text style={{...FONTS.Title3, marginBottom: 10}}>{movie?.title} Trailer</Text>
                          <YoutubePlayer
                              height={200}
                              width={300}
                              play={playing}
                              videoId={movie?.trailerURL}
                              onChangeState={onStateChange}
                          />
                          <View style={{alignItems: 'center'}}>
                              <AkcruButtons.LrgButton
                                  btnname={playing ? 'Pause' : 'Play'}
                                  onPress={toggleTrailerPlaying}
                                  color={COLORS.AKCRUBLUE}
                                  disabled={false}
                              />
                          </View>
                      </View>

                      <View>
                          <TouchableOpacity
                              onPress={() => setShowTrailer(false)} // Hide the confirmation modal
                              style={{
     
                                  padding: 10,
                                  borderRadius: 5,
                                  alignItems: 'center',
                              }}>
                              <Text style={{...FONTS.Title3}}>Close</Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
          </Modal>
          
      </View>
  );
};

export default ChooseMITScreen;
