import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Avatar, Icon } from '@rneui/base';
import { SIZES, FONTS, COLORS } from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import DisplayBadge from '../General/akcrubadge';

const MAX_USERNAME_LENGTH = 10;

type SmlMemberCardWithIconProps = {
  userPicture: string;
  userName: string;
  influencer?: boolean;
  akcruBadge: any;
  onPress?: () => void;
  userID: any;
  userDesc: string;
  avatarbordercolor: string;

  // icon props
  iconName: string;
  iconType: string;
  iconSize?: number;
  iconColor?: string;
  onIconPress?: () => void;
};

const SmlMemberCardWithIcon = ({
  userPicture,
  userName,
  influencer,
  akcruBadge,
  onPress,
  userDesc,
  avatarbordercolor,
  iconName,
  iconType,
  iconSize = 22,
  iconColor = COLORS.AKCRUBLUE,
  onIconPress,
}: SmlMemberCardWithIconProps) => {
  const truncateduserName =
    userName.length > MAX_USERNAME_LENGTH
      ? userName.slice(0, MAX_USERNAME_LENGTH) + '...'
      : userName;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ width: SIZES.ScreenWidth / 2.1 }}>
        <View
          style={{
            borderRadius: 5,
            backgroundColor: COLORS.TAGCOLOR,
            width: SIZES.ScreenWidth / 2.3,
            height: SIZES.ScreenHeight * 0.08,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />

          {/* Main Row: Left (avatar+details) | Right (icon) */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 10,
              height: '100%',
            }}
          >
            {/* Left side */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar
                rounded
                size={40}
                source={{ uri: userPicture }}
                avatarStyle={{
                  borderWidth: 2,
                  borderColor: avatarbordercolor,
                }}
                containerStyle={{ marginRight: 8 }}
              />

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ ...FONTS.Title2 }}>{truncateduserName}</Text>
                  {influencer && (
                    <Icon
                      name="ribbon"
                      type="ionicon"
                      color={COLORS.AKCRUBLUE}
                      size={18}
                      style={{ marginLeft: 5 }}
                    />
                  )}
                </View>
                <DisplayBadge akcruBadge={akcruBadge} />
              </View>
            </View>

            {/* Right side: Icon */}
            <TouchableOpacity onPress={onIconPress}>
              <Icon
                name={iconName}
                type={iconType}
                size={iconSize}
                color={iconColor}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SmlMemberCardWithIcon;
