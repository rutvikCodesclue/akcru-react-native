import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Avatar, Icon } from "@rneui/base";
import { SIZES, FONTS, COLORS } from "../../constants";
import AkcruLevels from "./AkcruBadges";
import { FAKE_USER_PROFILES } from "../../constants/Mockusers";
import { LinearGradient } from "expo-linear-gradient";


const MAX_USERNAME_LENGTH = 11; // Maximum number of characters for the username

type UserSearchCardProps = {
  userPicture: string;
  userName: string;
  influencer: boolean;
  akcruBadge: any;
  onPress: () => void;
  userID: any;
};

const UserSearchCard = ({
  userPicture,
  userName,
  influencer,
  akcruBadge,
  onPress,
  userID,
}: UserSearchCardProps) => {

const truncatedUserName =
  userName.length > MAX_USERNAME_LENGTH
    ? userName.slice(0, MAX_USERNAME_LENGTH) + "..."
    : userName;
  
  return (
    <View
      style={{
        borderRadius: 5,
        backgroundColor: COLORS.TAGCOLOR,
        width: SIZES.ScreenWidth / 2.2,
        height: 65,
      }}
    >
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.FADEDBLACK, "transparent", COLORS.FADEDBLACK]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          width: SIZES.ScreenWidth / 2.2,
          borderRadius: 5,
          height: 65,
        }}
      />
      <View style={{ flexDirection: "row", padding: 10 }}>
        <View style={{ marginRight: 8 }}>
          <TouchableOpacity onPress={onPress}>
            <Avatar
              rounded
              size={40}
              source={{
                uri: userPicture,
              }}
              avatarStyle={{
                borderWidth: 2,
                borderColor: COLORS.AKCRUBLUE,
              }}
            />
          </TouchableOpacity>
        </View>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ ...FONTS.Title2 }}>{truncatedUserName}</Text>
            {influencer && (
              <Icon
                name="ribbon"
                type="ionicon"
                color={COLORS.AKCRUBLUE}
                size={20}
                style={{ marginLeft: 5 }}
              />
            )}
          </View>

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
    </View>
  );
};

export default UserSearchCard;

const styles = StyleSheet.create({});
