import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import React from 'react';
import {Avatar, Icon} from '@rneui/base';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants/index';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';

const MAX_USERDESC_LENGTH = 50; // Maximum number of characters for the userDesc

type MITUserSearchCardProps = {
  userPicture: string;
  userName: string;
  influencer: boolean;
  akcruBadge: any;
  onPress: () => void;
  userID: any;
  userDesc: string;
  onPress1: () => void;
  id: string;
};

const MITUserSearchCard = ({
  userPicture,
  userName,
  influencer,
  akcruBadge,
  onPress,
  userID,
  userDesc,
  onPress1,
  id,
}: MITUserSearchCardProps) => {
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginRight: 30,
          }}>
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
                    borderColor: COLORS.AKCRUBLUE,
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
          <Pressable
            style={{alignItems: 'center'}}
            onPress={() =>
              onPress1(userID, userName, akcruBadge, userPicture, influencer)
            }>
            <Image source={imageindex.MITticket} />
            <View>
              <Text style={{...FONTS.Title3, fontSize: 12}}>Send MIT</Text>
            </View>
          </Pressable>
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

export default MITUserSearchCard;
