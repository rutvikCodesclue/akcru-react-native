import { Image, Text, View } from "react-native";
import React from "react";
import styles from "./styles";
import { Avatar } from "@rneui/base";
import { COLORS, FONTS, SIZES } from "../../../assets/constants";
import { Icon } from "@rneui/base";
import HexAvatar from "../HexAvatar";
import { selectAvatarBorderColor } from "../../util/util";
import LinearGradient from "react-native-linear-gradient";

type UserCruChatCardProps = {
  userPicture?: string;
  userName: string;
  CruChatDate: string;
  CruChatTime: string;
  CRUChat: string;
  userID: any;
  avatarbordercolor: string;
  movie: string;
  moviePoster?: string;
};

const UserCruChatCard = ({
  userPicture,
  userName,
  CruChatDate,
  CruChatTime,
  CRUChat,
  userID,
  avatarbordercolor,
  movie,
  moviePoster
}: UserCruChatCardProps) => {
  return (
      <View style={styles.cardcontainer}>
          <LinearGradient
              // Background Linear Gradient
              colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
              style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 5,
              }}
          />

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                  <View style={{flexDirection: 'row', flex: 1}}>
                      <View style={{paddingRight: 10}}>
                          <HexAvatar
                              source={{uri: userPicture}}
                              size={45}
                              bordercolor={selectAvatarBorderColor(userID?.badge ?? 'AKCRUIT')}
                          />
                      </View>

                      <View style={{flex: 1}}>
                          <Text style={{...FONTS.paragraph1, fontSize: 12, flexWrap: 'wrap'}} numberOfLines={3}>
                              Chat with "{userName}" about watching "{movie}"
                          </Text>
                      </View>
                  </View>
                  <View style={{marginBottom: 10}}>
                      <Image
                          source={{uri: moviePoster}}
                          style={{
                              width: SIZES.ScreenWidth / 1.5,
                              height: SIZES.ScreenWidth / 2.5,
                              borderRadius: 5,
                              marginTop: 10,
                              alignSelf: 'center',
                          }}
                      />
                  </View>
              </View>
              <View style={{alignItems: 'flex-end', marginLeft: 8}}>
                  <Text style={styles.stamps}>{CruChatDate}</Text>
                  <Text style={styles.stamps2}>{CruChatTime}</Text>
              </View>
          </View>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline'}}>
              <Text style={[styles.cruchat, {color: COLORS.PURPLE}]}>Last message:</Text>
              <Text style={[styles.cruchat, {color: COLORS.WHITE}]}>{CRUChat}</Text>
          </View>
      </View>
  );
};

export default UserCruChatCard;