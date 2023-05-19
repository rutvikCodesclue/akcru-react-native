import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
} from "react-native";
import React from "react";
import { Header, AkcruLevels, UserCruChatCard } from "../../components";
import { LinearGradient } from "expo-linear-gradient";
import { SIZES, COLORS, FONTS } from "../../../constants";
import { DIGITAL_PASS, AkcruDollarAmount } from "../../../constants/Mockusers";
import { Avatar, Icon } from "@rneui/base";
import imageindex from "../../../assets/images/imageindex";
import { FAKE_USER_PROFILES } from "../../../constants/Mockusers";

const UserCruChatScreen = () => {
  return (
    <View>
      <ScrollView>
        <KeyboardAvoidingView>
          <View>
            <ImageBackground
              source={{ uri: DIGITAL_PASS[0].SuperHeroPass }}
              resizeMode="cover"
              style={{ height: SIZES.ScreenHeight / 3.7 }}
            >
              <View style={{ zIndex: 20 }}>
                <Header ADAmount={AkcruDollarAmount[0].ADAmount} />
              </View>
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
                  height: SIZES.ScreenHeight / 3.7,
                }}
              />
              <View style={styles.topContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                    <Text style={{ ...FONTS.Title2 }}>
                      {FAKE_USER_PROFILES[0].userName}
                    </Text>
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
                  <Text style={{ ...FONTS.Title3, fontSize: 14 }}>
                    {FAKE_USER_PROFILES[0].userFollowerAmount}
                  </Text>
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
            </ImageBackground>
          </View>
          <View style={{ marginHorizontal: 15 }}>
            <View
              style={{ marginTop: 10, marginBottom: 10, alignItems: "center" }}
            >
              <Text style={styles.titleText2}>Schedule a CRU View below</Text>
            </View>

            <View>
              <View style={{ marginBottom: -10 }}>
                <Text style={styles.titleText1}>CRU View Scheduler</Text>
              </View>
              <TouchableOpacity>
                <Icon
                  name="calendar-sharp"
                  type="ionicon"
                  color={COLORS.LIGHTGREY}
                  size={75}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.CruImageContainer}>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.titleText3}>
                  {FAKE_USER_PROFILES[0].CRUName}
                </Text>
              </View>
              <Image source={imageindex.CruLarge} style={styles.CruImage} />
              <TouchableOpacity>
                <View style={{ flexDirection: "row", marginTop: 10 }}>
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
                    Edit Your CRU
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: -10 }}>
              <Text style={styles.titleText1}>CRU Chat</Text>
            </View>
            <View>
              {FAKE_USER_PROFILES.map((item) => (
                <View key={item.userID} style={{ marginBottom: 10 }}>
                  <UserCruChatCard
                    userPicture={item.userPicture}
                    userName={item.userName}
                    CruChatDate={item.CruChatDate}
                    CruChatTime={item.CruChatTime}
                    CRUChat={item.CRUChat}
                    userID={item.userID}
                  />
                </View>
              ))}
            </View>
            <View style={{ marginBottom: 75 }}>
              <View style={styles.input}>
                <TextInput
                  placeholder={"placeholder"}
                  placeholderTextColor={"transparent"}
                  style={styles.textinput}
                />
                <TouchableOpacity>
                  <View style={styles.sendbutton}>
                    <Text style={{ ...FONTS.Title2 }}>SEND</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default UserCruChatScreen;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
  },
  titleText1: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  titleText2: {
    ...FONTS.Title2,

    color: COLORS.DARKGREY,
    fontSize: 12,
  },
  titleText3: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 14,
  },
  CruImage: {
    width: 275,
    height: 125,
  },
  CruImageContainer: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 50,
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
  sendbutton: {
    backgroundColor: COLORS.AKCRUBLUE,
    height: 35,
    justifyContent: "center",
    width: 90,
    borderRadius: 5,
    alignItems: "center",
  },
});
