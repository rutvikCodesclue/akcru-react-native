import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {Avatar} from '@rneui/base';
import { FAKE_USER_PROFILES } from '../../../assets/constants/Mockusers';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import {Icon} from '@rneui/base';
import styles from './styles';

type CrummunityFeedPostCardProps = {
  userPicture: string;
  userName: string;
  userID: any;
  CrummunityFeedPostLikes: number;
  crummunityPost: string;
  Crummunityreplies: string;
  influencer: boolean;
  akcruBadge: any;
  onPress: () => void;
  avatarboardcolor: string;
};

const CrummunityFeedPostCard = ({
  userPicture,
  userID,
  userName,
  CrummunityFeedPostLikes,
  crummunityPost,
  Crummunityreplies,
  influencer,
  akcruBadge,
  onPress,
  avatarboardcolor,
}: CrummunityFeedPostCardProps) => {
  return (
    <View style={styles.cardcontainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
                  borderColor: avatarboardcolor,
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

        <View style={{alignItems: 'center'}}>
          <TouchableOpacity>
            <Icon
              name="thumb-up-outline"
              type="material-community"
              color={COLORS.LIGHTGREY}
              size={22}
              style={{marginLeft: 5}}
            />
          </TouchableOpacity>

          <Text style={styles.stamps2}>{CrummunityFeedPostLikes}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.post}>{crummunityPost}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: 100,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity>
            <Text style={styles.reply}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.reply}>Send</Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity>
            <Text style={styles.viewreply}>{Crummunityreplies}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CrummunityFeedPostCard;
