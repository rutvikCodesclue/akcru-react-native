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
import { RouteProp } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { StackNavigationProp } from "@react-navigation/stack";

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
  const invitee: string | undefined = route.params?.inviteeName ?? null;

  const {
    inviteePicture,
    privateaccount,
    online,
    inviteeName,
    akcruBadge,
    status,
    userFollowerAmount,
    userDesc,
    influencer,
    MITMovieposter,
    MITMoviechoice,
    MITDate,
    MITTime,
    avatarbordercolor
  } = JENNY_INVITES[MITID ?? 0];

  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);

  const snapPoints = ["1", "85"];

  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.sheetcontainer}>
        <ScrollView stickyHeaderIndices={[0]}>
          <View>
            <Header />
          </View>
          <View>
            <ImageBackground
              source={{ uri: DIGITAL_PASS[0].SuperHeroPass }}
              resizeMode="cover"
              style={{ height: SIZES.ScreenHeight / 4, marginTop: -60 }}
            >
              <LinearGradient
                // Background Linear Gradient
                colors={[
                  COLORS.BLACK,
                  COLORS.FADEDBLACK,
                  COLORS.AKCRUBACKGROUND,
                ]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: SIZES.ScreenHeight / 4,
                }}
              />
              <View style={styles.topcontainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("UserMITHubScreen")}
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.screenTitle}>Movie Invite Ticket</Text>
                  <Image
                    source={imageindex.LrgMIT}
                    style={{ width: 55, height: 25 }}
                  />
                </View>
              </View>
            </ImageBackground>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: -60,
                marginHorizontal: 15,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ marginRight: 8 }}>
                  <Avatar
                    rounded
                    size={70}
                    source={{
                      uri: inviteePicture,
                    }}
                    avatarStyle={{
                      borderWidth: 2,
                      borderColor: avatarbordercolor,
                    }}
                  />
                  <View />

                  {!privateaccount ? (
                    online ? (
                      <View
                        style={{
                          backgroundColor: "green",
                          height: 12,
                          width: 12,
                          borderRadius: 8,
                          position: "absolute",
                          right: 8,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          backgroundColor: "red",
                          height: 12,
                          width: 12,
                          borderRadius: 8,
                          position: "absolute",
                          right: 8,
                        }}
                      />
                    )
                  ) : null}
                </View>
                <View style={{ width: SIZES.ScreenWidth / 2.5 }}>
                  <Text style={{ ...FONTS.Title2 }}>{inviteeName}</Text>
                  {akcruBadge.akcruit && (
                    <View>
                      <AkcruLevels.AkcruBadgeAkcruit />
                    </View>
                  )}
                  {akcruBadge.guardian && (
                    <View>
                      <AkcruLevels.AkcruBadgeGuardian />
                    </View>
                  )}
                  {akcruBadge.hero && (
                    <View>
                      <AkcruLevels.AkcruBadgeHero />
                    </View>
                  )}
                  {akcruBadge.superhero && (
                    <View>
                      <AkcruLevels.AkcruBadgeSuperHero />
                    </View>
                  )}
                </View>
              </View>
              <View style={{ marginVertical: 20 }}>
                <View
                  style={{
                    alignItems: "center",
                    borderLeftWidth: 1,
                    borderColor: COLORS.DARKGREY,
                    paddingLeft: 10,
                  }}
                >
                  <View
                    style={{
                      width: 100,
                      height: 60,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ ...FONTS.Title3, fontSize: 14 }}>
                      {userFollowerAmount}
                    </Text>
                    <Text style={{ ...FONTS.Title2, color: COLORS.MIDORANGE }}>
                      Followers
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View>
              <View style={styles.bottomcontainer}>
                <View style={{ alignItems: "center", marginBottom: 10 }}>
                  <TouchableOpacity>
                    <Image
                      source={{ uri: MITMovieposter }}
                      style={styles.poster}
                    />
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    ...FONTS.paragraph1,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  "{inviteeName}" wants to watch "{MITMoviechoice}" with you on:
                </Text>
              </View>
              <View style={{ alignItems: "center", marginVertical: 20 }}>
                <View style={styles.datebox}>
                  <Text style={styles.datetext}>{MITDate}</Text>
                  <Text style={styles.datetext}>@ {MITTime}</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.datetext}>Request change</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 25 }}>
                <MITSwipe />
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.opensheet}>
          <TouchableOpacity onPress={() => handleSnapPress(1)}>
            <Icon
              name="chevron-up"
              type="ionicon"
              size={30}
              color={COLORS.DARKGREY}
            />
          </TouchableOpacity>
        </View>

        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: COLORS.TAGCOLOR }}
          onClose={() => setIsOpen(true)}
        >
          <BottomSheetScrollView style={{ marginHorizontal: 15 }}>
            <MITMessages
              inviteePicture={inviteePicture}
              inviteeName={inviteeName}
              akcruBadge={akcruBadge}
              influencer={influencer} avatarbordercolor={avatarbordercolor}            />
          </BottomSheetScrollView>
          <View style={{ marginBottom: 75, marginHorizontal: 15 }}>
            <View style={styles.input}>
              <TextInput
                placeholder={"placeholder"}
                placeholderTextColor={"transparent"}
                style={styles.textinput}
              />

              <AkcruButtons.XSmallButton
                btnname={"SEND"}
                onPress={function (): void {}}
                color=""
              />
            </View>
          </View>
        </BottomSheet>
      </View>
    </View>
  );
};

export default ChooseMITScreen;
