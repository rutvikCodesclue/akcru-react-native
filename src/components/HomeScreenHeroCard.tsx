import * as React from "react";
import {
  View,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Dimensions,
  Text
} from "react-native";
//import { ResizeMode, Video } from 'expo-av';
import { Video, ResizeMode } from "expo-av";
import { SIZES, COLORS, FONTS } from "../../constants";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import AkcruButtons from "./Buttons";
import { Rating, Icon } from "@rneui/base";
import { MOVIES } from "../../constants/Data";



const { height, width } = Dimensions.get("screen");

const VideoContainer = styled(View)`
  flex: 1;
  background-color: #0e0f0f;
  height: ${() => height * 0.56}px;
  width: ${() => width}px;
  z-index: 1;
  overflow: hidden;
`;

const VideoPlayer = styled(Video)`
  align-self: center;
  width: 100%;
  height: 100%;
`;

const Overlay = styled(LinearGradient)`
  width: 100%;
  position: absolute;
  height: 56%;
  padding: 27px 0px;
  bottom: 0;
`;


export default function HomeScreenHeroCard() {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  return (
    <View>
      {/* Tom Cruise */}

      <VideoContainer>
        <TouchableWithoutFeedback
          onPress={() =>
            status.isPlaying
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        >
          <View>
            <VideoPlayer
              ref={video}
              source={{
                uri: "https://priymuscontent.s3.amazonaws.com/Movie+folder/AmericanApocalypse_L33_2ch.mp4",
              }}
              resizeMode={ResizeMode.COVER}
              isLooping
              volume={0}
              onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            />
            <LinearGradient
              // Background Linear Gradient
              colors={["transparent", COLORS.AKCRUBACKGROUND]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 200,
              }}
            />
            {/* <Overlay
                  colors={[
                    "#000000",
                    "#000000af",
                    "#00000055",
                    "#00000016",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                /> */}
            <View
              style={{
                marginHorizontal: 15,
                marginBottom: 20,
                position: "absolute",
                bottom: 0,
                right: 0,
                left: 0,
              }}
            >
              <View>
                <Text style={styles.bigTitle}>{MOVIES[21].name}</Text>
                <View style={{ flexDirection: "row", marginVertical: 10 }}>
                  <Text style={styles.drawfonttag}>{MOVIES[21].rated}</Text>
                  <Text style={styles.drawfonttag}>{MOVIES[21].genre}</Text>

                  <Text style={styles.drawfonttag}>{MOVIES[21].rating}/10</Text>
                </View>
                <Text style={styles.desc}>{MOVIES[21].desc}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={{marginRight: 10}}>
                  <AkcruButtons.SmallButton
                    btnname={"Watch Movie"}
                    color={COLORS.AKCRUBLUE}
                    onPress={function (): void {}}
                  />
                </View>
                <View>
                  <AkcruButtons.SmallButton
                    btnname={"Watch Trailer"}
                    color={COLORS.TAGCOLOR}
                    onPress={function (): void {}}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </VideoContainer>

      {/* End */}
      {/* <MovieHomeScreenHero /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
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
  bigTitle : {
    ...FONTS.Title3,
    fontSize: 25,
    width: 250
  },
  desc: {
    ...FONTS.Title2,
    marginBottom: 10
  }
});
