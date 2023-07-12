import { Text, View } from "react-native";
import React from "react";
import styles from "./styles";
import { Avatar } from "@rneui/base";
import { FAKE_USER_PROFILES } from "../../../assets/constants/Mockusers";
import { COLORS, FONTS, SIZES } from "../../../assets/constants";
import AkcruLevels from "../akcruBadges";
import { Icon } from "@rneui/base";

type UserCruChatCardProps = {
  userPicture: string;
  userName: string;
  CruChatDate: string;
  CruChatTime: string;
  CRUChat: string;
  userID: any;
  avatarbordercolor: string;
};

const UserCruChatCard = ({
  userPicture,
  userName,
  CruChatDate,
  CruChatTime,
  CRUChat,
  userID,
  avatarbordercolor,
}: UserCruChatCardProps) => {
  return (
    <View style={styles.cardcontainer}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginRight: 8 }}>
            <Avatar
              rounded
              size={40}
              source={{
                uri: userPicture,
              }}
              avatarStyle={{
                borderWidth: 2,
                borderColor: avatarbordercolor,
              }}
            />
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ ...FONTS.Title2 }}>{userName}</Text>
              {FAKE_USER_PROFILES[userID].influencer && (
                <Icon
                  name="ribbon"
                  type="ionicon"
                  color={COLORS.AKCRUBLUE}
                  size={20}
                  style={{ marginLeft: 5 }}
                />
              )}
            </View>

            {FAKE_USER_PROFILES[userID].akcruBadge.akcruit && (
              <View>
                <AkcruLevels.AkcruBadgeAkcruit />
              </View>
            )}
            {FAKE_USER_PROFILES[userID].akcruBadge.guardian && (
              <View>
                <AkcruLevels.AkcruBadgeGuardian />
              </View>
            )}
            {FAKE_USER_PROFILES[userID].akcruBadge.hero && (
              <View>
                <AkcruLevels.AkcruBadgeHero />
              </View>
            )}
            {FAKE_USER_PROFILES[userID].akcruBadge.superhero && (
              <View>
                <AkcruLevels.AkcruBadgeSuperHero />
              </View>
            )}
          </View>
        </View>

        <View>
          <Text style={styles.stamps}>{CruChatDate}</Text>
          <Text style={styles.stamps2}>{CruChatTime}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.cruchat}>{CRUChat}</Text>
      </View>
    </View>
  );
};

export default UserCruChatCard;
