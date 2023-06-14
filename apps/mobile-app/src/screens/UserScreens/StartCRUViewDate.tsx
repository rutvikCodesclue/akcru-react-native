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
  KeyboardAvoidingView,
  Dimensions
} from "react-native";
import React from "react";
import {
  AkcruButtons,
  Header,
  UserVideoBlock,
  MITChatCard,
  GroupViewMovieCard,
  MITUserVideoList,
  CRUUserVideoList,
} from "../../components";
import { SIZES, FONTS, COLORS } from "../../../constants/index";
import { LinearGradient } from "expo-linear-gradient";
import { DIGITAL_PASS } from "../../../constants/Mockusers";
import { Icon } from "@rneui/base";
import { useNavigation } from "@react-navigation/native";
import { UserProfileStackParams } from "../../navigation/UserProfileStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import imageindex from "../../../assets/images/imageindex";
import { JENNY_SCHEDULE } from "../../../constants/Mockusers";
import { useState, useRef, useEffect, useCallback } from "react";
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { FAKE_USER_PROFILES } from "../../../constants/Mockusers";

//import { ResizeMode, Video } from 'expo-av';
import { Video, ResizeMode } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

function setOrientation() {
  if (Dimensions.get("window").height > Dimensions.get("window").width) {
    //Device is in portrait mode, rotate to landscape mode.
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } else {
    //Device is in landscape mode, rotate to portrait mode.
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }
}

const StartCRUViewDate = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

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
                  source={{ uri: JENNY_SCHEDULE[0].moviePoster }}
                  style={styles.poster}
                />
              </View>
              <View>
                <Text style={{ ...FONTS.Title3 }}>
                  {JENNY_SCHEDULE[0].movieName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginVertical: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ ...FONTS.Title2, fontSize: 12 }}>
                    {JENNY_SCHEDULE[0].movieYear}
                  </Text>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      fontSize: 12,
                      marginHorizontal: 10,
                    }}
                  >
                    {JENNY_SCHEDULE[0].length}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {JENNY_SCHEDULE[0].movieRated}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {JENNY_SCHEDULE[0].movieGenre}
                  </Text>
                  <Text style={styles.drawfonttag}>
                    {JENNY_SCHEDULE[0].movieRating}/10
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
                  <Video
                    ref={video}
                    source={{
                      uri: "https://priymuscontent.s3.amazonaws.com/Movie+folder/Attack+of+the+Lederhosen+Zombies_Feature+subtitles.mp4",
                    }}
                    posterSource={{
                      uri: "data:image/jpeg;base64,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",
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
                  />
                </View>
              </View>
              {/* <AkcruButtons.MedButton
                btnname={streamStatus.isPlaying ? "Pause Movie" : "Play Movie"}
                onPress={() =>
                  streamStatus.isPlaying
                    ? video.current.pauseAsync()
                    : video.current.playAsync()
                }
                color={COLORS.AKCRUBLUE}
              /> */}
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
          <Image
            source={imageindex.AkcruHexLogo}
            style={{ width: 25, height: 25 }}
          />
          <Text style={{ ...FONTS.Title2Orange, marginLeft: 5 }}>
            Enjoy the CRU View
          </Text>
        </View>

        <View
          style={{
            marginHorizontal: 15,
          }}
        >
          <CRUUserVideoList />
        </View>

        {isStreamOpen ? (
          <View style={{ height: SIZES.ScreenHeight / 6.5 }}></View>
        ) : (
          <View style={{ height: SIZES.ScreenHeight / 50 }}></View>
        )}
        <View style={{ position: "relative" }}>
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
});
