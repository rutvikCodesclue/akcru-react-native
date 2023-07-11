import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {Avatar, Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import { FAKE_USER_PROFILES } from '../../../assets/constants/Mockusers';
import LinearGradient from 'react-native-linear-gradient';

const MAX_USERDESC_LENGTH = 50; // Maximum number of characters for the userDesc

type UserSearchCardProps = {
  userPicture: string;
  userName: string;
  influencer: boolean;
  akcruBadge: any;
  onPress: () => void;
  userID: any;
  userDesc: string;
  avatarbordercolor: string;
};

const UserSearchCard = ({
  userPicture,
  userName,
  influencer,
  akcruBadge,
  onPress,
  userID,
  userDesc,
  avatarbordercolor,
}: UserSearchCardProps) => {
  const truncateduserDesc =
    userDesc.length > MAX_USERDESC_LENGTH
      ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...'
      : userDesc;

  return (
    <View
      style={{
        borderRadius: 5,
        backgroundColor: COLORS.TAGCOLOR,
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight / 9.3,
      }}>
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          width: SIZES.ScreenWidth,
          borderRadius: 5,
          height: SIZES.ScreenHeight / 9.3,
        }}
      />
      <View style={{padding: 10}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{marginRight: 8}}>
            <TouchableOpacity onPress={onPress}>
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
            </TouchableOpacity>
          </View>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{...FONTS.Title2}}>{userName}</Text>
              {influencer && (
                <Icon
                  name="ribbon"
                  type="ionicon"
                  color={COLORS.AKCRUBLUE}
                  size={20}
                  style={{marginLeft: 5}}
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
          <Text style={{...FONTS.paragraph1, fontSize: 12}}>
            {truncateduserDesc}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default UserSearchCard;

const styles = StyleSheet.create({});
