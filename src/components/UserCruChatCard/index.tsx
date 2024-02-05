import { Text, View } from "react-native";
import React from "react";
import styles from "./styles";
import { Avatar } from "@rneui/base";
import { COLORS, FONTS, SIZES } from "../../../assets/constants";
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
              </View>
          </View>
        </View>

        <View style={{alignSelf:'flex-end'}}>
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