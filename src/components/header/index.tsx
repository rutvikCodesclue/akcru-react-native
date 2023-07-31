import {View, Text, TouchableOpacity, Image, Pressable} from 'react-native';
import React from 'react';
import {Icon, Badge, withBadge} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../assets/images/imageindex';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AuthNavigation';
import { ClientStackParams } from '../../navigation/ClientStack';
import {useNavigation} from '@react-navigation/native';
import { FAKE_USER_PROFILES } from '../../../assets/constants/Mockusers';
import useAuthStore from '../../stores/auth.store';


// interface Props {
//   userpoints: number;
// }

const userpoints = FAKE_USER_PROFILES[0].ADAmount

const Header = () => {
  const NotificationBadgeIcon = withBadge(0)(Icon);
  
  const { user } = useAuthStore()

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();

  return (
    <View
      style={{
        width: SIZES.ScreenWidth,
      }}>
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.AKCRUBACKGROUND, 'transparent']}
        style={{position: 'absolute', left: 0, right: 0, top: 0, height: 65}}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: 15,
        }}>
        <View>
          <Pressable onPress={() => navigation.navigate('ClientTabNavigator')}>
            <Image
              source={imageindex.AkcruLogo}
              style={{width: 100, height: 70}}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{marginRight: 15}}>
            <TouchableOpacity>
              <Icon
                name="magnify"
                type="material-community"
                color={COLORS.LIGHTGREY}
                size={28}
                onPress={() => navigation.navigate('SearchMovieScreen')}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <NotificationBadgeIcon
              name="notifications-outline"
              type="ionicon"
              color={COLORS.LIGHTGREY}
              size={SIZES.SmallIcon}
              onPress={() => {}}
            />
          </TouchableOpacity>
          <View>
            <Image
              source={imageindex.AkcruHexLogo}
              style={{width: 26, height: 26, marginRight: 8, marginLeft: 20}}
              resizeMode="contain"
            />
          </View>
          <Text style={{...FONTS.Title1}}>{user?.adAmount ?? 0}</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
