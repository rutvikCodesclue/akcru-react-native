import * as React from "react";
import {
  View,
  useWindowDimensions,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps } from "react-native-tab-view";
import {
  UserProfileCruInvites,
  UserProfileDatesTab,
  UserProfileDetailsTab,
  UserProfileWalletTab
} from "./UserProfileTabs";
import { AkcruDollarAmount, DIGITAL_PASS, FAKE_USER_PROFILES } from "../../../constants/Mockusers";
import { SIZES, COLORS, FONTS, AKCRUBADGES } from "../../../constants";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Icon } from "@rneui/themed";
import {
  Header, AkcruLevels
} from "../../components";
import imageindex from "../../../assets/images/imageindex";
import { PressableAndroidRippleConfig } from "react-native";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";
import { TextStyle } from "react-native";
import { Route } from "react-native";
import { ClientStackParams } from "../../navigation/ClientStack";
import { NavigationState, Scene, SceneRendererProps } from "react-native-tab-view/lib/typescript/src/types";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";


type UserProfileScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  "UserProfileScreen"
>;

type UserProfileScreenRouteProp = RouteProp<
  ClientStackParams,
  "UserProfileScreen"
>;

type Props = {
  navigation: UserProfileScreenNavigationProp;
  route: UserProfileScreenRouteProp;
};


const FirstRoute = () => (
  <View>
    <UserProfileDetailsTab />
  </View>
);

const SecondRoute = () => <UserProfileDatesTab />;

const ThirdRoute = () => (
  <View>
    <UserProfileCruInvites />
  </View>
);

const FourthRoute = () => <UserProfileWalletTab/>;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
  fourth: FourthRoute
});

export default function UserProfileScreen({navigation, route}: Props) {
  const renderTabBar = (
    props: JSX.IntrinsicAttributes &
      SceneRendererProps & {
        navigationState: NavigationState<Route>;
        scrollEnabled?: boolean | undefined;
        bounces?: boolean | undefined;
        activeColor?: string | undefined;
        inactiveColor?: string | undefined;
        pressColor?: string | undefined;
        pressOpacity?: number | undefined;
        getLabelText?:
          | ((scene: Scene<Route>) => string | undefined)
          | undefined;
        getAccessible?:
          | ((scene: Scene<Route>) => boolean | undefined)
          | undefined;
        getAccessibilityLabel?:
          | ((scene: Scene<Route>) => string | undefined)
          | undefined;
        getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined;
        renderLabel?:
          | ((
              scene: Scene<Route> & { focused: boolean; color: string }
            ) => React.ReactNode)
          | undefined;
        renderIcon?:
          | ((
              scene: Scene<Route> & { focused: boolean; color: string }
            ) => React.ReactNode)
          | undefined;
        renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined;
        renderIndicator?:
          | ((props: TabBarIndicatorProps<Route>) => React.ReactNode)
          | undefined;
        renderTabBarItem?:
          | ((
              props: TabBarItemProps<Route> & { key: string }
            ) => React.ReactElement<
              any,
              string | React.JSXElementConstructor<any>
            >)
          | undefined;
        onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined;
        onTabLongPress?: ((scene: Scene<Route>) => void) | undefined;
        tabStyle?: StyleProp<ViewStyle>;
        indicatorStyle?: StyleProp<ViewStyle>;
        indicatorContainerStyle?: StyleProp<ViewStyle>;
        labelStyle?: StyleProp<TextStyle>;
        contentContainerStyle?: StyleProp<ViewStyle>;
        style?: StyleProp<ViewStyle>;
        gap?: number | undefined;
        testID?: string | undefined;
        android_ripple?: PressableAndroidRippleConfig | undefined;
      }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.DARKORANGE }}
      scrollEnabled={false}
      tabStyle={{ width: SIZES.ScreenWidth / 4 }}
      labelStyle={{ ...FONTS.Title2, color: COLORS.LIGHTGREY,}}
      style={{
        backgroundColor: COLORS.AKCRUBACKGROUND,
        justifyContent: "space-between",
      }}
      contentContainerStyle={{
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
      }}
      activeColor={COLORS.MIDORANGE}
    />
  );

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Details" },
    { key: "second", title: "Dates" },
    { key: "third", title: "Invites" },
    { key: "fourth", title: "Wallet" },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <View>
        <ImageBackground
          source={{ uri: DIGITAL_PASS[0].SuperHeroPass }}
          resizeMode="cover"
          style={{ height: SIZES.ScreenHeight / 3.7 }}
        >
          <View style={{ zIndex: 20 }}>
            <Header />
          </View>
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

              marginHorizontal: 15,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginRight: 8 }}>
                <Avatar
                  rounded
                  size={70}
                  source={{
                    uri: FAKE_USER_PROFILES[0].userPicture,
                  }}
                  avatarStyle={{
                    borderWidth: 2,
                    borderColor: COLORS.AKCRUBLUE,
                  }}
                />
              </View>
              <View>
                <Text style={{ ...FONTS.Title2 }}>{FAKE_USER_PROFILES[0].userName}</Text>
                {FAKE_USER_PROFILES[0].akcruBadge.akcruit && (
                  <View>
                    <AkcruLevels.AkcruBadgeAkcruit />
                  </View>
                )}
                {FAKE_USER_PROFILES[0].akcruBadge.guardian && (
                  <View>
                    <AkcruLevels.AkcruBadgeGuardian />
                  </View>
                )}
                {FAKE_USER_PROFILES[0].akcruBadge.hero && (
                  <View>
                    <AkcruLevels.AkcruBadgeHero />
                  </View>
                )}
                {FAKE_USER_PROFILES[0].akcruBadge.superhero && (
                  <View>
                    <AkcruLevels.AkcruBadgeSuperHero />
                  </View>
                )}
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
              <Text style={{ ...FONTS.Title3, fontSize: 14 }}>{FAKE_USER_PROFILES[0].userFollowerAmount}</Text>
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
              {FAKE_USER_PROFILES[0].userDesc}
            </Text>
          </View>
        </ImageBackground>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled={true}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}
