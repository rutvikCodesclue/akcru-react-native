import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Pressable,
} from "react-native";
import React from "react";
import { Icon } from "@rneui/base";
import { SIZES, FONTS, COLORS } from "../../constants/index";
import { useState } from "react";

interface Props {
  userPicture: string;
  userName: string;
  host: boolean;
  onPress: () => void;
  userID: string;
}

const UserMITVideoBlock: React.FC<Props> = ({
  userPicture,
  userName,
  host,
  onPress,
  userID,
}) => {
  const [isUserMicOn, setIsUserMicOn] = useState(true);

  const toggleUserMic = () => {
    setIsUserMicOn((prevState) => !prevState);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    } else {
      return text;
    }
  };

  return (
    <View style={styles.videoblock}>
      <Image source={{ uri: userPicture }} style={styles.userstream} />
      {host && (
        <View style={{ position: "absolute", top: 10, right: 10 }}>
          <Text
            style={{
              ...FONTS.Title2,
              backgroundColor: COLORS.AKCRUBLUE,
              paddingHorizontal: 5,
              borderRadius: 4,
            }}
          >
            Host
          </Text>
        </View>
      )}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <View style={styles.bottomtab}>
          <Pressable onPress={toggleUserMic} style={{ marginRight: 10 }}>
            {isUserMicOn ? (
              <Icon name="mic" type="ionicon" size={28} color={COLORS.GREEN} />
            ) : (
              <Icon
                name="mic-off"
                type="ionicon"
                size={28}
                color={COLORS.CATREDLGT}
              />
            )}
          </Pressable>
          <Pressable onPress={onPress}>
            <Text
              style={{ ...FONTS.Title3 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {truncateText(userName, 10)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const UserCRUVideoBlock: React.FC<Props> = ({
  userPicture,
  userName,
  host,
  onPress,
  userID,
}) => {
  const [isUserMicOn, setIsUserMicOn] = useState(true);

  const toggleUserMic = () => {
    setIsUserMicOn((prevState) => !prevState);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    } else {
      return text;
    }
  };

  return (
    <View style={styles.videoblock2}>
      <Image source={{ uri: userPicture }} style={styles.userstream2} />
      {host && (
        <View style={{ position: "absolute", top: 10, right: 10 }}>
          <Text
            style={{
              ...FONTS.Title2,
              backgroundColor: COLORS.AKCRUBLUE,
              paddingHorizontal: 5,
              borderRadius: 4,
            }}
          >
            Host
          </Text>
        </View>
      )}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <View style={styles.bottomtab2}>
          <Pressable onPress={toggleUserMic} style={{ marginRight: 10 }}>
            {isUserMicOn ? (
              <Icon name="mic" type="ionicon" size={28} color={COLORS.GREEN} />
            ) : (
              <Icon
                name="mic-off"
                type="ionicon"
                size={28}
                color={COLORS.CATREDLGT}
              />
            )}
          </Pressable>
          <Pressable onPress={onPress}>
            <Text
              style={{ ...FONTS.Title3 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {truncateText(userName, 5)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const UserVideoBlock = {
  UserMITVideoBlock,
  UserCRUVideoBlock,
};

export default UserVideoBlock;

const styles = StyleSheet.create({
  videoblock: {
    borderRadius: 5,
    width: SIZES.ScreenWidth / 2.2,
    height: SIZES.ScreenWidth / 2.2,
  },
  
  userstream: {
    borderRadius: 5,
    width: SIZES.ScreenWidth / 2.2,
    height: SIZES.ScreenWidth / 2.2,
  },
  
  bottomtab: {
    backgroundColor: COLORS.TRANSDARKGREY,
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.ScreenWidth / 2.2,
    height: 40,
    paddingHorizontal: 10,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  videoblock2: {
    borderRadius: 5,
    width: SIZES.ScreenWidth / 3.4,
    height: SIZES.ScreenWidth / 3.4,
  },
  userstream2: {
    borderRadius: 5,
    width: SIZES.ScreenWidth / 3.4,
    height: SIZES.ScreenWidth / 3.4,
  },
  bottomtab2: {
    backgroundColor: COLORS.TRANSDARKGREY,
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.ScreenWidth / 3.4,
    height: 40,
    paddingHorizontal: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
});
