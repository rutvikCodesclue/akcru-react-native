import { View, Text, TouchableOpacity, ScrollView, ImageBackground, Button, SafeAreaView } from 'react-native'
import React from 'react'
import Header from '../../../components/header';
import { Icon } from '@rneui/base';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import { DIGITAL_PASS, FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import notifee from '@notifee/react-native';


const UserNotifications = () => {

const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

const userNotifications = FAKE_USER_PROFILES[0].notifications;

    async function onDisplayNotification() {
        // Request permissions (required for iOS)
        await notifee.requestPermission()
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        // Display a notification
        await notifee.displayNotification({
            title: 'New Cru View',
            body: 'Main body content of the notification',
            android: {
                channelId,
                smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
                // pressAction is needed if you want the notification to open the app when pressed
                pressAction: {
                id: 'default',
                },
            },
        });
    }

  return (
      <SafeAreaView style={{flex: 1}}>
          <ScrollView stickyHeaderIndices={[0]} style={{marginBottom:60}}>
              <View>
                <View style={{zIndex: 100}}>
                   <Header /> 
                </View>
                  
                  <ImageBackground
                  source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                  resizeMode="cover"
                  style={{height: SIZES.ScreenHeight / 4, marginTop: -70}}>
                  <LinearGradient
                      // Background Linear Gradient
                      colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                      style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          height: SIZES.ScreenHeight / 4,
                      }}
                  />
                  <View>
                      <TouchableOpacity
                          style={{marginHorizontal: 15, marginBottom: 10, paddingTop: 80}}
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
                              marginBottom: 20,
                              textAlign: 'center',
                              fontSize: 14,
                              textDecorationLine: 'underline',
                          }}>
                          NOTIFICATIONS
                      </Text>
                      <View>
                        <Button title="Display Notification" onPress={() => onDisplayNotification()} />
                      </View>
                  </View>
              </ImageBackground>
              </View>
              
              <View style={{marginHorizontal: 15, marginTop: 10}}>
                  {/* Render user notifications */}
                  {userNotifications.map((notification, index) => {
                      const type = Object.keys(notification)[0];
                      const message = notification[type];

                      return (
                          <View key={index} style={styles.cardcontainer}>
                              <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>{`${type}:`}</Text>
                              <Text style={{...FONTS.paragraph1}}>{`${message}`}</Text>
                          </View>
                      );
                  })}
              </View>
          </ScrollView>
      </SafeAreaView>
  );
}

export default UserNotifications