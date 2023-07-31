import {
  View,
  Text,
  TextInput,
  Modal,
  FlatList,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {Avatar, Icon} from '@rneui/base';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import {FAKE_USER_PROFILES} from '../../../assets/constants/Mockusers';
import LinearGradient from 'react-native-linear-gradient';

const MAX_USERNAME_LENGTH = 10; // Maximum number of characters for the userDesc

type AddMemberCardProps = {
  userPicture: string;
  userName: string;
  influencer: boolean;
  akcruBadge: any;
  onPress: () => void;
  userID: any;
  userDesc: string;
  avatarbordercolor: string;
  AddMember: (userID: any) => void;
};

const AddMemberCard = ({
  userPicture,
  userName,
  influencer,
  akcruBadge,
  onPress,
  userID,
  userDesc,
  avatarbordercolor,
  AddMember,
}: AddMemberCardProps) => {
  const truncateduserName =
    userDesc.length > MAX_USERNAME_LENGTH
      ? userName.slice(0, MAX_USERNAME_LENGTH) + '...'
      : userName;

  const handleAddMember = () => {
    AddMember(userID);
  };

  return (
    <View style={{width: SIZES.ScreenWidth / 2.1}}>
      <View
        style={{
          borderRadius: 5,
          backgroundColor: COLORS.TAGCOLOR,
          width: SIZES.ScreenWidth / 2.3,
          height: SIZES.ScreenHeight * 0.08,
        }}>
        <LinearGradient
          colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            width: SIZES.ScreenWidth / 2.3,
            borderRadius: 5,
            height: SIZES.ScreenHeight * 0.08,
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
                <Text style={{...FONTS.Title2}}>{truncateduserName}</Text>
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
        </View>
      </View>
      <View style={{position: 'absolute', right: 5, top: -5}}>
        <Pressable onPress={handleAddMember}>
          <Icon
            name="add-circle"
            type="ionicon"
            size={25}
            color={COLORS.GREEN}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default AddMemberCard;
