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
import {SIZES, FONTS, COLORS, AKCRUBADGES} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import {FAKE_USER_PROFILES} from '../../../assets/constants/Mockusers';
import LinearGradient from 'react-native-linear-gradient';
import { el } from 'date-fns/locale';
import { selectAvatarBorderColor } from '../../util/util';
import imageindex from '../../../assets/images/imageindex';

const MAX_USERNAME_LENGTH = 10; // Maximum number of characters for the userDesc

type CruMemberCardProps = {
  userPicture: string | undefined;
  userName: string;
  influencer: boolean;
  akcruBadge: any;
  onPress: () => void;
  userID: any;
  userDesc?: string;
  DeleteMember: (userID: any) => void;
};

const CruMemberCard = ({
  userPicture,
  userName,
  influencer,
  akcruBadge,
  onPress,
  userID,
  userDesc,
  DeleteMember,
}: CruMemberCardProps) => {
  const truncateduserName =
    userDesc && userDesc?.length > MAX_USERNAME_LENGTH
      ? userName.slice(0, MAX_USERNAME_LENGTH) + '...'
      : userName;

  const handleDeleteMember = () => {
    DeleteMember(userID);
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
                                  source={
                                      userPicture
                                          ? {
                                                uri: userPicture,
                                            }
                                          : imageindex.Akcruplaceholder
                                  }
                                  avatarStyle={{
                                      borderWidth: 2,
                                      borderColor: selectAvatarBorderColor(akcruBadge),
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

                          {akcruBadge === 'AKCRUIT' && (
                              <View>
                                  <AkcruLevels.AkcruBadgeAkcruit />
                              </View>
                          )}
                          {akcruBadge === 'GUARDIAN' && (
                              <View>
                                  <AkcruLevels.AkcruBadgeGuardian />
                              </View>
                          )}
                          {akcruBadge === 'HERO' && (
                              <View>
                                  <AkcruLevels.AkcruBadgeHero />
                              </View>
                          )}
                          {akcruBadge === 'SUPERHERO' && (
                              <View>
                                  <AkcruLevels.AkcruBadgeSuperHero />
                              </View>
                          )}
                      </View>
                  </View>
              </View>
          </View>
          <View style={{position: 'absolute', right: 5, top: -5}}>
              <Pressable onPress={handleDeleteMember}>
                  <Icon name="close-circle" type="ionicon" size={25} color={COLORS.CATREDLGT} />
              </Pressable>
          </View>
      </View>
  );
};

export default CruMemberCard;
