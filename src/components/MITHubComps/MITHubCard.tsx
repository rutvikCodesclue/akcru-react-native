import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Avatar } from "@rneui/base";
import { JENNY_INVITES } from "../../../assets/constants/Mockusers";
import {COLORS, SIZES, FONTS} from '../../../assets/constants';


import AkcruLevels from "../akcruBadges";
import { Icon } from "@rneui/base";
import imageindex from "../../../assets/images/imageindex";
import styles from "./styles";
import LinearGradient from "react-native-linear-gradient";
import { selectAvatarBorderColor } from "../../util/util";

type MITHubCardProps = {
  inviteePicture: string;
  inviteeName: string;
  MITDate: string;
  MITMoviechoice: string;
  onPress: () => void;
  onPressIn: () => void;
  akcruBadge: any;
  // influencer: boolean;
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
  // influencer,
}: MITHubCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.cardcontainer}>
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
                  borderColor: selectAvatarBorderColor(akcruBadge),
                }}
              />
            </TouchableOpacity>
          </View>
          <View>
            {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
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
            </View> */}

            {akcruBadge === "AKCRUIT" && (
              <View>
                <AkcruLevels.AkcruBadgeAkcruit />
              </View>
            )}
            {akcruBadge === "GUARDIAN" && (
              <View>
                <AkcruLevels.AkcruBadgeGuardian />
              </View>
            )}
            {akcruBadge === "HERO" && (
              <View>
                <AkcruLevels.AkcruBadgeHero />
              </View>
            )}
            {akcruBadge === "SUPERHERO" && (
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
            
            'You invited ' + inviteeName + ' to watch "' + MITMoviechoice + '"',
            65
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


export default MITHubCard;
