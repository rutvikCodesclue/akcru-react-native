import {Text, View, TouchableOpacity, Pressable} from 'react-native';
import React from 'react';
import {Avatar, Icon} from '@rneui/base';
import { FAKE_USER_PROFILES } from '../../../assets/constants/Mockusers';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import styles from './styles';
import { CrummunityStackParams } from '../../navigation/CrummunityStack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

const navigation =
  useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  return (
    <View style={styles.cardcontainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{marginRight: 8}}>
            <Pressable
              onPress={() =>   
                {console.log('Item with userID', userID, userName, 'pressed!');
                  navigation.navigate('ViewUserScreen', {
                  userID
                  
                })}
                
              }>
                
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
            </Pressable>
          </View>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{...FONTS.Title2}}>{userName}</Text>
              {FAKE_USER_PROFILES[userID].influencer && (
                <Icon
                  name="ribbon"
                  type="ionicon"
                  color={COLORS.AKCRUBLUE}
                  size={20}
                  style={{marginLeft: 5}}
                />
              )}
            </View>

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
        <View style={{flexDirection: 'row', marginLeft: 15}}>
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
              style={{marginLeft: 8}}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.review}>{movieReview}</Text>
        <Text style={styles.datestamp}>{movieReviewDate}</Text>
      </View>
    </View>
  );
};

export default AkcruReviewCard;
