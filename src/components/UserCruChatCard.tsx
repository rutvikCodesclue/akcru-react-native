import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Avatar } from "@rneui/base";
import { FAKE_USER_PROFILES } from "../../constants/Mockusers";
import { COLORS, FONTS, SIZES } from "../../constants";
import AkcruLevels from "./AkcruBadges";
import { Icon } from "@rneui/base";

type UserCruChatCardProps = {
  userPicture: string;
  userName: string;
  CruChatDate: string;
  CruChatTime: string;
  CRUChat: string;
  userID: any;
};

const UserCruChatCard = ({
  userPicture,
  userName,
  CruChatDate,
  CruChatTime,
  CRUChat,
  userID,
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
                borderColor: COLORS.AKCRUBLUE,
              }}
            />
          </View>
          <View>
            <View style={{flexDirection: 'row', alignItems:'center'}}>
              <Text style={{ ...FONTS.Title2 }}>{userName}</Text>
              {FAKE_USER_PROFILES[userID].influencer && (<Icon
                name="ribbon"
                type="ionicon"
                color={COLORS.AKCRUBLUE}
                size={20}
                style={{marginLeft: 5}}
              />)}
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

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
  },
  cruchat: {
    ...FONTS.paragraph1, fontSize: 12,
  },
  cardcontainer: {
    backgroundColor: "#1C202A",
    borderColor: "#1C202A",
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 10,
   
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
