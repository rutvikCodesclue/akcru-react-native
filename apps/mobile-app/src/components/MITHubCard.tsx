import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Avatar } from "@rneui/base";
import { JENNY_INVITES } from "../../constants/Mockusers";
import { COLORS, FONTS, SIZES } from "../../constants";
import AkcruLevels from "./AkcruBadges";
import { Icon } from "@rneui/base";
import imageindex from "../../assets/images/imageindex";
import { LinearGradient } from "expo-linear-gradient";

type MITHubCardProps = {
  inviteePicture: string;
  inviteeName: string;
  MITDate: string;
  MITMoviechoice: string;
  onPress: () => void;
  onPressIn: () => void;
  akcruBadge: any;
  influencer: boolean;
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  } else {
    return text;
  }
};

const MITHubCard = ({
 inviteePicture,
 inviteeName,
 MITDate,
 MITMoviechoice,
 onPress,
 onPressIn,
 akcruBadge,
 influencer

}: MITHubCardProps) => {
  return (
    <View style={styles.cardcontainer}>
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.FADEDBLACK, "transparent", COLORS.FADEDBLACK]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,

          borderRadius: 5,
          height: 95,
        }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginRight: 8 }}>
            <TouchableOpacity onPressIn={onPressIn}>
              <Avatar
                rounded
                size={40}
                source={{
                  uri: inviteePicture,
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
              <Text style={{ ...FONTS.Title2 }}>{inviteeName}</Text>
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

        <View>
          <Text style={styles.stamps}>{MITDate}</Text>
          <TouchableOpacity onPress={onPress}>
            <Image
              source={imageindex.LrgMIT}
              style={{ width: 55, height: 25 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <Text style={styles.cruchat2} numberOfLines={1} ellipsizeMode="tail">
          {truncateText(
            inviteeName + ' invites you to watch "' + MITMoviechoice + '"',
            65
          )}
        </Text>
      </View>
    </View>
  );
};


export default MITHubCard;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
  },
  cruchat: {
    ...FONTS.paragraph1,
    fontSize: 12,
    color: COLORS.AKCRUBLUE
  },
  cruchat2: {
    ...FONTS.paragraph1,
    fontSize: 12,
  },
  cardcontainer: {
    backgroundColor: "#1C202A",
    borderColor: "#1C202A",
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 10,
    height: 95,
  },
  stamps: {
    ...FONTS.Title2Orange,
    marginBottom: 3,
  },
  stamps2: {
    ...FONTS.Title2AkcruBlue,
    fontSize: 12,
  },
});
