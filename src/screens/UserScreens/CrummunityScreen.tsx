import * as React from "react";
import { View, useWindowDimensions, Text, ImageBackground, TouchableOpacity, Image } from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import { UserProfileCruInvites, UserProfileDatesTab } from "./UserProfileTabs";
import { DIGITAL_PASS } from "../../../constants/Mockusers";
import { SIZES, COLORS, FONTS, AKCRUBADGES } from "../../../constants";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Icon } from "@rneui/themed";
import { AkcruBadge } from "../../components";
import imageindex from "../../../assets/images/imageindex";

const FirstRoute = () => (
  <View>
    <UserProfileCruInvites />
  </View>
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: "#673ab7" }} />
);

const ThirdRoute = () => (
  <View>
    <UserProfileDatesTab />
  </View>
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute
});

export default function TabViewExample() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "First" },
    { key: "second", title: "Second" },
    { key: "third", title: "Third" },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <View>
        <ImageBackground
          source={{ uri: DIGITAL_PASS[0].SuperHeroPass }}
          resizeMode="cover"
          style={{ height: SIZES.ScreenHeight / 3.7 }}
        >
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: SIZES.ScreenHeight / 3.7,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 65,
              marginHorizontal: 15,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginRight: 8 }}>
                <Avatar
                  rounded
                  size={70}
                  source={{
                    uri: "https://lh3.googleusercontent.com/p/AF1QipNvFlRlQcAzAEb-G3fpXtEvVYYQslyVY4fxmj-3=w1080-h608-p-no-v0",
                  }}
                  avatarStyle={{
                    borderWidth: 2,
                    borderColor: COLORS.AKCRUBLUE,
                  }}
                />
              </View>
              <View>
                <Text style={{ ...FONTS.Title2 }}>Jenny 2x</Text>
                <AkcruBadge
                  color={AKCRUBADGES.SuperHero.label}
                  background={AKCRUBADGES.SuperHero.background}
                  label={AKCRUBADGES.SuperHero.label}
                />
                <TouchableOpacity>
                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      name="square-edit-outline"
                      type="material-community"
                      color={COLORS.DARKGREY}
                      size={15}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={{
                        ...FONTS.Title2,
                        color: COLORS.LIGHTGREY,
                        fontSize: 12,
                      }}
                    >
                      Edit Profile
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: COLORS.DARKGREY,
                width: 100,
                height: 60,
                justifyContent: "center",
                paddingLeft: 10,
              }}
            >
              <Text style={{ ...FONTS.Title3, fontSize: 14 }}>11200</Text>
              <Text style={{ ...FONTS.Title2 }}>Followers</Text>
            </View>
            <View
              style={{
                height: 50,
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <View>
                <Image
                  source={imageindex.MITticket}
                  style={{ width: 55, height: 40 }}
                />
              </View>
              <View style={{ position: "absolute", right: 0, top: 0 }}>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.WHITE,
                    width: 20,
                    height: 20,
                    borderRadius: 15,
                  }}
                >
                  <Text>5</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20, marginHorizontal: 15 }}>
            <Text
              style={{ ...FONTS.Title2, color: COLORS.LIGHTGREY, fontSize: 12 }}
            >
              Hey my name is Jenny 2x's because I like to watch movies 2 times.
              #moviebuff #acrkrurecruiter
            </Text>
          </View>
        </ImageBackground>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}
