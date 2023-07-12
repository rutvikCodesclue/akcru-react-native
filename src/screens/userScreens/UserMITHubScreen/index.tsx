import { Text, View, ScrollView, ImageBackground, TouchableWithoutFeedback, TouchableOpacity, Image } from 'react-native'
import React from 'react';
import styles from './styles';
import { MITHubList } from '../../../components/MITHubComps';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { DIGITAL_PASS } from '../../../../assets/constants/Mockusers'
import { Icon } from '@rneui/base'
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import imageindex from '../../../../assets/images/imageindex';
import { JENNY_INVITES } from '../../../../assets/constants/Mockusers'
import { StackNavigationProp } from '@react-navigation/stack'

type UserMITHubScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "UserMITHubScreen"
>;

type UserMITHubScreenRouteProp = RouteProp<
  UserProfileStackParams,
  "UserMITHubScreen"
>;

type Props = {
  navigation: UserMITHubScreenNavigationProp;
  route: UserMITHubScreenRouteProp;
};

const MAX_STATUS_LENGTH = 17; // Maximum number of characters for the username


const UserMITHubScreen = ({navigation, route}: Props) => {
    

  
  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>
        <ImageBackground
          source={{ uri: DIGITAL_PASS[0].SuperHeroPass }}
          resizeMode="cover"
          style={{ height: SIZES.ScreenHeight / 4, marginTop: -60 }}
        >
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: SIZES.ScreenHeight / 4,
            }}
          />
          <View style={styles.topcontainer}>
            <TouchableOpacity onPress={() => navigation.pop()}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon
                name="chevron-back"
                type="ionicon"
                size={20}
                color={COLORS.LIGHTGREY}
              />
              <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>Back</Text>
            </View>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.screenTitle}>Movie Invite Ticket Hub</Text>
            <Image source={ imageindex.LrgMIT} style={{width: 55, height: 25}}/>
          </View>
          
          </View>
          

          <View style={{ alignItems: "center" }}>
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate("UserSearchResultScreen");
              }}
            >
              <View style={styles.searchinput}>
                <Icon
                  name="magnify"
                  type="material-community"
                  color={COLORS.AKCRUBLUE}
                  size={28}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ ...FONTS.Title2, color: COLORS.DARKGREY }}>
                  Search users
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ImageBackground>
        <View style={{ marginHorizontal: 15 }}>
            <Text style={{...FONTS.Title2}}>
                You have 7 Movie Invites
            </Text>
          <MITHubList />
        </View>
      </ScrollView>
    </View>
  );
}

export default UserMITHubScreen
