import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Icon } from '@rneui/base';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../../components/header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import { getBlockedUsers, unblockUser } from '../../../lib/api/user.lib';
import BlockedUserCard from '../../../components/BlockedUserCard';

const BlockedUsers = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        setLoading(true);
        const response = await getBlockedUsers();
        if (response.success) {
            setBlockedUsers(response.blockedUsers || []);
        } else {
            // Handle failure
        }
        setLoading(false);
    };

    const handleUnblockUser = async userId => {
        const userIdToUnblock = userId;
        const {success, message} = await unblockUser(userIdToUnblock);
        if (success) {
            Alert.alert('Success', 'User successfully unblocked');
            fetchBlockedUsers(); // Refresh the list of blocked users
        } else {
            Alert.alert('Error', `Failed to unblock user: ${message}`);
        }
    };

    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
            </View>
        );
    }

  return (
      <View style={{flex: 1}}>
          <View>
              <View>
                  <View style={{zIndex: 100}}>
                      <Header />
                  </View>
                  <View
                      style={{
                          height: SIZES.ScreenHeight / 5,
                          marginTop: -60,
                          backgroundColor: COLORS.AKCRUBACKGROUND,
                      }}>
                      <LinearGradient
                          // Background Linear Gradient
                          colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                          style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: 0,
                              height: SIZES.ScreenHeight / 5,
                          }}
                      />
                      <View>
                          <TouchableOpacity
                              style={{marginHorizontal: 15, marginBottom: 10, paddingTop: 60}}
                              onPress={() => navigation.pop()}>
                              <View
                                  style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                  }}>
                                  <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                  <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                              </View>
                          </TouchableOpacity>
                          <Text
                              style={{
                                  ...FONTS.Title2,
                                  marginTop: 10,

                                  textAlign: 'center',
                                  fontSize: 13,
                                  textDecorationLine: 'underline',
                              }}>
                              BLOCKED USERS
                          </Text>
                      </View>
                  </View>
              </View>
          </View>
          {blockedUsers.length === 0 ? (
              <View>
                  <Text style={{...FONTS.Title2, marginTop: '10%', color: COLORS.DARKGREY, textAlign: 'center'}}>
                      You have no blocked any users
                  </Text>
              </View>
          ) : (
              <View style={{marginHorizontal: 15}}>
                  <FlatList
                      data={blockedUsers}
                      horizontal={false}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={true}
                      keyExtractor={item => item.id.toString()}
                      renderItem={({item}) => (
                          <View style={{marginVertical: 5}}>
                              <BlockedUserCard
                                  userPicture={item.profilePicture}
                                  userName={item.username}
                                  onPress={() => {
                                      console.log(
                                          'Navigating to ViewUserScreen with userID:',
                                          item.username,
                                          item.id,
                                          item.firstName,
                                      );
                                      navigation.navigate('ViewUserScreen', {
                                          userID: item.id,
                                      });
                                  }}
                                  influencer={item.influencer}
                                  userID={item.id}
                                  akcruBadge={item.badge}
                                  userDesc={item.description}
                                  firstName={item.firstName}
                                  unblock={() => handleUnblockUser(item.id)}
                              />
                          </View>
                      )}
                  />
              </View>
          )}
      </View>
  );
}

export default BlockedUsers