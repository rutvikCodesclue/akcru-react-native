import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Avatar, Icon } from "@rneui/base";
import { FAKE_USER_PROFILES } from "../../constants/Mockusers";
import { COLORS, FONTS, SIZES } from "../../constants";
import AkcruLevels from "./AkcruBadges";

type AkcruReviewCardProps = {
  userPicture: string;
  userName: string;
  movieReview: string;
  movieReviewDate: string;
  userID: any;
};

const AkcruReviewCard = ({
  userPicture,
  userName,
  movieReview,
  movieReviewDate,
  userID,
}: AkcruReviewCardProps) => {
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
            <Text style={{ ...FONTS.Title2 }}>{userName}</Text>
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
        <View style={{ flexDirection: "row", marginLeft: 15 }}>
          <TouchableOpacity>
            <Icon
              name="thumb-up-outline"
              type="material-community"
              color={COLORS.LIGHTGREY}
              size={SIZES.MedIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon
              name="thumb-down-outline"
              type="material-community"
              color={COLORS.LIGHTGREY}
              size={SIZES.MedIcon}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style = {styles.review}>{movieReview}</Text>
        <Text style = {styles.datestamp}>{movieReviewDate}</Text>
      </View>
    </View>
  );
};

export default AkcruReviewCard;

const styles = StyleSheet.create({
  cardcontainer: {
    backgroundColor: "#1C202A",
    borderColor: "#1C202A",
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 10,
  },
  review: {
    ...FONTS.paragraph1,
  },
  datestamp: {
    ...FONTS.Title2Orange,
    marginBottom: 3,
    textAlign: 'right',
    marginTop: 10
  },
});
