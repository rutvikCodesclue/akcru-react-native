import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Pressable,
  Dimensions
} from "react-native";
import React from "react";
import MITUserVideoList from "../../../components/MITUserVideoList/MITUserVideoList";
import MITChatCard from "../../../components/MITChatCard/MITChatCard";
import AkcruButtons from "../../../components/akcruButtons";
import Header from "../../../components/header";
import { SIZES, FONTS, COLORS } from "../../../../assets/constants/index";
import LinearGradient from "react-native-linear-gradient";

import { Icon } from "@rneui/base";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import imageindex from "../../../../assets/images/imageindex";
import { JENNY_SCHEDULE } from "../../../../assets/constants/Mockusers";
import { useState, useRef, useEffect, useCallback } from "react";
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

//import { ResizeMode, Video } from 'expo-av';
// import { Video, ResizeMode } from "expo-av";
import { StackNavigationProp } from "@react-navigation/stack";
// import * as ScreenOrientation from "expo-screen-orientation";

function setOrientation() {
  if (Dimensions.get("window").height > Dimensions.get("window").width) {
    //Device is in portrait mode, rotate to landscape mode.
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } else {
    //Device is in landscape mode, rotate to portrait mode.
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }
}

type StartMITDateNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "StartMITDate"
>;

type StartMITDateRouteProp = RouteProp<UserProfileStackParams, "StartMITDate">;

type Props = {
  navigation: StartMITDateNavigationProp;
  route: StartMITDateRouteProp;
 
  dateID: string;
};

const StartMITDate = ({ navigation, route, dateID }: Props) => {
  const id: string | undefined = route.params?.id ?? null;
  const movie: string | undefined = route.params?.moviePoster ?? null;

  const { moviePoster } = JENNY_SCHEDULE[dateID ?? 0];

  const [isStreamOpen, setIsStreamOpen] = useState(true);

  const video = React.useRef(null);
  const [streamStatus, setStreamStatus] = React.useState({}); //Video Player Status

  const [isMicOn, setIsMicOn] = useState(true);
  const [isUserVideoOn, setIsUserVideoOn] = useState(true);

  const toggleMic = () => {
    setIsMicOn((prevState) => !prevState);
  };
  const toggleVideo = () => {
    setIsUserVideoOn((prevState) => !prevState);
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
      <ScrollView
        stickyHeaderIndices={[0]}
        style={{ marginBottom: SIZES.ScreenHeight / 12 }}
      >
        <View style={{ zIndex: 20 }}>
          <Header />
        </View>

        <View style={styles.topcontainer}>
          <TouchableOpacity onPress={() => navigation.pop()}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon
                name="chevron-back"
                type="ionicon"
                size={20}
                color={COLORS.LIGHTGREY}
              />
              <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>Leave Room</Text>
            </View>
          </TouchableOpacity>
          {!isStreamOpen && (
            <TouchableOpacity onPress={() => setIsStreamOpen(true)}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Icon
                  name="close-circle"
                  type="ionicon"
                  size={20}
                  color={COLORS.LIGHTGREY}
                />
                <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>
                  Close Movie
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View>
          {isStreamOpen ? (
            <View style={styles.moviecontainer}>
              <LinearGradient
                // Background Linear Gradient
                colors={[COLORS.FADEDBLACK, "transparent", COLORS.FADEDBLACK]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,

                  borderRadius: 5,
                  height: SIZES.ScreenHeight / 7,
                }}
              />
              <View style={{ marginRight: 10 }}>
                <Image
                  source={{ uri: JENNY_SCHEDULE[id].moviePoster }}
                  style={styles.poster}
                />
              </View>
              <View>
                <Text style={{ ...FONTS.Title3 }}>
                  {JENNY_SCHEDULE[id].movieName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginVertical: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ ...FONTS.Title2, fontSize: 12 }}>
                    {JENNY_SCHEDULE[id].movieYear}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      fontSize: 12,
                      marginHorizontal: 10,
                    }}
                  >
                    {JENNY_SCHEDULE[id].length}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {JENNY_SCHEDULE[id].movieRated}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {JENNY_SCHEDULE[id].movieGenre}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {JENNY_SCHEDULE[id].movieRating}/10
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <TouchableWithoutFeedback>
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: COLORS.TAGCOLOR,
                        marginRight: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          ...FONTS.paragraph1,
                          marginRight: 5,
                          fontSize: 12,
                        }}
                      >
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
                    onPress={() => setIsStreamOpen(false)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: COLORS.TAGCOLOR,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          ...FONTS.paragraph1,
                          marginRight: 10,
                          fontSize: 12,
                        }}
                      >
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
                <View>
                  {/* <Video
                    ref={video}
                    source={{
                      uri: JENNY_SCHEDULE[id].movieUrl,
                    }}
                    posterSource={{
                      uri: JENNY_SCHEDULE[id].movieLSposter,
                    }}
                    usePoster={true}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    onFullscreenUpdate={setOrientation}
                    volume={100}
                    onPlaybackStatusUpdate={(status: {}) =>
                      setStreamStatus(() => status)
                    }
                    style={styles.videoplayer}
                  /> */}
                </View>
              </View>
              <View style={{ marginTop: 15, alignItems: "center" }}>
                <AkcruButtons.MedButton
                  btnname={
                    streamStatus.isPlaying ? "Pause Movie" : "Play Movie"
                  }
                  onPress={() =>
                    streamStatus.isPlaying
                      ? video.current.pauseAsync()
                      : video.current.playAsync()
                  }
                  color={COLORS.AKCRUBLUE}
                />
              </View>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 15,
          }}
        >
          <Image source={imageindex.LrgMIT} style={{ width: 50, height: 20 }} />
          <Text style={{ ...FONTS.Title2Orange }}>Enjoy your MIT date</Text>
        </View>
        <View
          style={{
            marginHorizontal: 15,
          }}
        >
          <MITUserVideoList />
        </View>

        {isStreamOpen ? (
          <View style={{ height: SIZES.ScreenHeight / 4.2 }}></View>
        ) : (
          <View style={{ marginTop: 20 }}></View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
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

        <BottomSheet //Chat Modal
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: COLORS.AKCRUBACKGROUND }}
          onClose={() => setIsChatOpen(true)}
        >
          <BottomSheetScrollView style={{ marginHorizontal: 15 }}>
            <MITChatCard />
            <MITChatCard />
            <MITChatCard />
            <MITChatCard />
          </BottomSheetScrollView>
          <View style={{ marginHorizontal: 15 }}>
            <View style={styles.input}>
              <TextInput
                placeholder={"placeholder"}
                placeholderTextColor={"transparent"}
                style={styles.textinput}
              />

              <AkcruButtons.XSmallButton
                btnname={"REPLY"}
                onPress={function (): void {}}
                color=""
              />
            </View>
          </View>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StartMITDate;

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
});
