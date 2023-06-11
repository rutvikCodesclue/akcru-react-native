import {
  StyleSheet,
  Text,
  View,
 TextInput
} from "react-native";

import { Avatar, Icon } from "@rneui/base";
import { FONTS, COLORS} from "../../constants";
import React, { useState, useCallback, useRef } from "react";
import { FAKE_USER_PROFILES } from "../../constants/Mockusers";
import AkcruLevels from "./AkcruBadges";
import AkcruButtons from "./Buttons";

type MITMessagesProps = {
  inviteePicture: string;
  inviteeName: string;
  akcruBadge: any;
  influencer: boolean;
};



const MITMessages = ({
  inviteePicture,
  inviteeName,
  akcruBadge,
  influencer,
}: MITMessagesProps) => {
  return (
    <View>
      <View style={styles.cardcontainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 8 }}>
              <Avatar
                rounded
                size={40}
                source={{
                  uri: inviteePicture
                }}
                avatarStyle={{
                  borderWidth: 2,
                  borderColor: COLORS.AKCRUBLUE,
                }}
              />
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ ...FONTS.Title2 }}>
                  {inviteeName}
                </Text>
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
            <Text style={styles.stamps}>
              {FAKE_USER_PROFILES[3].CruChatDate}
            </Text>
            <Text style={styles.stamps2}>
              {FAKE_USER_PROFILES[3].CruChatTime}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.cruchat}>{FAKE_USER_PROFILES[3].CRUChat}</Text>
        </View>
      </View>
      <View style={styles.cardcontainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 8 }}>
              <Avatar
                rounded
                size={40}
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ ...FONTS.Title2 }}>
                  {FAKE_USER_PROFILES[0].userName}
                </Text>
                {FAKE_USER_PROFILES[0].influencer && (
                  <Icon
                    name="ribbon"
                    type="ionicon"
                    color={COLORS.AKCRUBLUE}
                    size={20}
                    style={{ marginLeft: 5 }}
                  />
                )}
              </View>

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

          <View>
            <Text style={styles.stamps}>
              {FAKE_USER_PROFILES[0].CruChatDate}
            </Text>
            <Text style={styles.stamps2}>
              {FAKE_USER_PROFILES[0].CruChatTime}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.cruchat}>{FAKE_USER_PROFILES[0].CRUChat}</Text>
        </View>
      </View>
      <View style={styles.cardcontainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 8 }}>
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
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ ...FONTS.Title2 }}>
                  {inviteeName}
                </Text>
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
            <Text style={styles.stamps}>
              {FAKE_USER_PROFILES[3].CruChatDate}
            </Text>
            <Text style={styles.stamps2}>
              {FAKE_USER_PROFILES[3].CruChatTime}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.cruchat}>{FAKE_USER_PROFILES[3].CRUChat}</Text>
        </View>
      </View>
      <View style={styles.cardcontainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 8 }}>
              <Avatar
                rounded
                size={40}
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ ...FONTS.Title2 }}>
                  {FAKE_USER_PROFILES[0].userName}
                </Text>
                {FAKE_USER_PROFILES[0].influencer && (
                  <Icon
                    name="ribbon"
                    type="ionicon"
                    color={COLORS.AKCRUBLUE}
                    size={20}
                    style={{ marginLeft: 5 }}
                  />
                )}
              </View>

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

          <View>
            <Text style={styles.stamps}>
              {FAKE_USER_PROFILES[0].CruChatDate}
            </Text>
            <Text style={styles.stamps2}>
              {FAKE_USER_PROFILES[0].CruChatTime}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.cruchat}>{FAKE_USER_PROFILES[0].CRUChat}</Text>
        </View>
      </View>
      <View style={styles.cardcontainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 8 }}>
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
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ ...FONTS.Title2 }}>
                  {inviteeName}
                </Text>
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
            <Text style={styles.stamps}>
              {FAKE_USER_PROFILES[3].CruChatDate}
            </Text>
            <Text style={styles.stamps2}>
              {FAKE_USER_PROFILES[3].CruChatTime}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.cruchat}>{FAKE_USER_PROFILES[3].CRUChat}</Text>
        </View>
      </View>
    </View>
  );
};

export default MITMessages;

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
  },
  cardcontainer: {
    backgroundColor: "#1C202A",
    borderColor: "#1C202A",
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
  stamps: {
    ...FONTS.Title2Orange,
    marginBottom: 3,
  },
  stamps2: {
    ...FONTS.Title2AkcruBlue,
    fontSize: 12,
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
});
