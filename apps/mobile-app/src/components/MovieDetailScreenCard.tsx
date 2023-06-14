import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { COLORS, FONTS } from "../../constants";
import { Icon } from "@rneui/base";
import { SIZES } from "../../constants";
// import styles from "./Styles/styles";
import imageindex from "../../assets/images/imageindex";
import { LinearGradient } from "expo-linear-gradient";
import AkcruButtons from "./Buttons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParams } from "../navigation/ClientStack";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import YoutubePlayer from "react-native-youtube-iframe";
import * as ScreenOrientation from 'expo-screen-orientation'

//import { ResizeMode, Video } from 'expo-av';
import { Video, ResizeMode } from "expo-av";


type MovieDetailScreenCardProps = {
  image_url: string;
  name: string;
  year: number;
  length: string;
  rated: string;
  rating: number;
  desc: string;
  actors: string;
  directors: string;
  id: string;
  youtubeID: string;
  thumb_url: string;
  movie_url: string;
};

const MovieDetailScreenCard = ({
  image_url,
  id,
  name,
  year,
  length,
  rated,
  rating,
  desc,
  actors,
  directors,
  youtubeID,
  thumb_url,
  movie_url
  
}: MovieDetailScreenCardProps) => {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({}); //Video Player Status

  function setOrientation() {
    if (Dimensions.get("window").height > Dimensions.get("window").width) {
      //Device is in portrait mode, rotate to landscape mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      //Device is in landscape mode, rotate to portrait mode.
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  const sheetRef = useRef<BottomSheet>(null); //Pop up trailer
  const [isOpen, setIsOpen] = useState(false);

  const snapPoints = ["1", "75"];

  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("Trailer has finished playing!");
    }
  }, []);

  const toggleTrailerPlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  return (
    <View>
      <View>
        <View>
          <Image
            source={{ uri: image_url }}
            style={{
              width: SIZES.ScreenWidth,
              height: SIZES.ScreenHeight / 1.5,
            }}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            height: 200,
            justifyContent: "flex-end",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.BLACK, "transparent", COLORS.AKCRUBACKGROUND]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: SIZES.ScreenHeight / 1.5,
            }}
          />
          <TouchableOpacity
            onPress={() => navigation.pop()}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -250,
              marginHorizontal: 15,
            }}
          >
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
              <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>Back</Text>
            </View>
          </TouchableOpacity>
          <View
            style={{ position: "absolute", left: 0, right: 0, bottom: 150 }}
          >
            <View style={styles.videocontain}>
              <View>
                <Video
                  ref={video}
                  source={{
                    uri: "https://priymuscontent.s3.amazonaws.com/Movie+folder/Attack+of+the+Lederhosen+Zombies_Feature+subtitles.mp4",
                  }}
                  posterSource={{ uri: thumb_url }}
                  usePoster={true}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  onFullscreenUpdate={setOrientation}
                  volume={100}
                  onPlaybackStatusUpdate={(status: {}) =>
                    setStatus(() => status)
                  }
                  style={styles.videoplayer}
                />
              </View>
            </View>
          </View>
          <View
            style={{ marginBottom: 10, alignItems: "flex-end", marginRight: 5 }}
          >
            <View
              style={{
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  ...FONTS.Title3,
                  textAlign: "center",
                  marginRight: 10,
                }}
              >
                Add to watchlist
              </Text>
              <TouchableOpacity>
                <Icon
                  name="add-circle-outline"
                  type="ionicon"
                  color={COLORS.MIDORANGE}
                  size={50}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
            }}
          >
            <AkcruButtons.MedButton
              btnname={status.isPlaying ? "Pause Movie" : "Play Movie"}
              onPress={() =>
                status.isPlaying
                  ? video.current.pauseAsync()
                  : video.current.playAsync()
              }
              color={COLORS.AKCRUBLUE}
            />
            <AkcruButtons.MedButton
              btnname={"Watch Trailer"}
              onPress={() => handleSnapPress(1)}
              color={COLORS.TAGCOLOR}
            />
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 15,
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <View style={{ width: 175 }}>
            <Text style={{ ...FONTS.Title3, fontSize: 20 }}>{name}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flexDirection: "row", marginLeft: 15 }}>
              <View style={{ marginRight: 25 }}>
                <TouchableOpacity>
                  <Icon
                    name="thumb-up-outline"
                    type="material-community"
                    color={"green"}
                    size={SIZES.MedIcon}
                  />
                </TouchableOpacity>
                <Text style={{ ...FONTS.Title2 }}>I Like</Text>
              </View>
              <View>
                <TouchableOpacity>
                  <Icon
                    name="thumb-down-outline"
                    type="material-community"
                    color={"red"}
                    size={SIZES.MedIcon}
                  />
                </TouchableOpacity>
                <Text style={{ ...FONTS.Title2 }}>Nah</Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            marginHorizontal: 15,
            flexDirection: "row",
            marginVertical: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              marginRight: 20,
            }}
          >
            <Text
              style={{
                ...FONTS.Title2,
                color: COLORS.LIGHTGREY,
                marginRight: 10,
              }}
            >
              {year}
            </Text>
            <Text style={{ ...FONTS.Title2, color: COLORS.LIGHTGREY }}>
              {length}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text style={styles.drawfonttag}>{rated}</Text>
            <Text style={styles.drawfonttag}>Drama</Text>
            <Text style={styles.drawfonttag}>Action</Text>
            <Text style={styles.drawfonttag}>{rating}/10</Text>
          </View>
        </View>
        <View style={{ marginHorizontal: 15, marginVertical: 10 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("PurchaseMITScreen")}
          >
            <View
              style={{
                borderColor: COLORS.AKCRUBLUE,
                borderWidth: 1,
                borderRadius: 5,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Image
                source={imageindex.MITticket}
                style={{ marginRight: 10 }}
              />

              <Text style={{ ...FONTS.Title2AkcruBlue }}>
                Send Movie Invite Ticket
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Image
            source={imageindex.AkcruHexLogo}
            style={{ width: 26, height: 26, marginRight: 10 }}
            resizeMode="contain"
          />
          <Text style={{ ...FONTS.Title2Orange }}>
            Earn up to 500 AKCRU dollars
          </Text>
        </View>

        <View style={{ marginHorizontal: 15, marginTop: 15 }}>
          <Text
            style={{
              ...FONTS.Title2Orange,
              color: COLORS.LIGHTGREY,
              lineHeight: 18,
              marginBottom: 10,
            }}
          >
            {desc}
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.DARKGREY,
                marginRight: 10,
              }}
            >
              Cast:
            </Text>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.AKCRUBLUE,
              }}
            >
              {actors}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.DARKGREY,
                marginRight: 10,
              }}
            >
              Director:
            </Text>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.AKCRUBLUE,
              }}
            >
              {directors}
            </Text>
          </View>
        </View>
      </View>

      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: COLORS.AKCRUBACKGROUND }}
        onClose={() => setIsOpen(true)}
      >
        <BottomSheetScrollView style={{ marginHorizontal: 15 }}>
          <YoutubePlayer
            height={225}
            play={playing}
            videoId={youtubeID}
            onChangeState={onStateChange}
          />
          <View style={{ alignItems: "center" }}>
            <AkcruButtons.LrgButton
              btnname={playing ? "Pause" : "Play"}
              onPress={toggleTrailerPlaying}
              color={COLORS.AKCRUBLUE}
            />
          </View>
          <View>
            <Text style={{ ...FONTS.Title3, fontSize: 20, marginVertical: 15 }}>
              {name} - Trailer
            </Text>
          </View>
          <View>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.LIGHTGREY,
                lineHeight: 18,
                marginBottom: 10,
              }}
            >
              {desc}
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text
                style={{
                  ...FONTS.Title2Orange,
                  color: COLORS.DARKGREY,
                  marginRight: 10,
                }}
              >
                Cast:
              </Text>
              <Text
                style={{
                  ...FONTS.Title2Orange,
                  color: COLORS.AKCRUBLUE,
                }}
              >
                {actors}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  ...FONTS.Title2Orange,
                  color: COLORS.DARKGREY,
                  marginRight: 10,
                }}
              >
                Director:
              </Text>
              <Text
                style={{
                  ...FONTS.Title2Orange,
                  color: COLORS.AKCRUBLUE,
                }}
              >
                {directors}
              </Text>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};


export default MovieDetailScreenCard

const styles = StyleSheet.create({
  video: {
    alignSelf: "center",
    width: SIZES.ScreenWidth,
    height: 200,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  drawfonttag: {
    ...FONTS.Title2Orange,
    color: COLORS.BLACK,
    backgroundColor: COLORS.STARGOLD,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderRadius: 4,
    textAlign: "center",
  },
  bigTitle: {
    ...FONTS.Title3,
    fontSize: 25,
    width: 250,
  },
  desc: {
    ...FONTS.Title2,
    marginBottom: 10,
  },
  videocontain: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'center'  
  },
  videoplayer : {
alignSelf: 'center',
aspectRatio: 16/9,
width: "100%"

  }
});
