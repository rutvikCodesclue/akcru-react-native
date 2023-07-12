import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import { Icon } from '@rneui/base';

import { useNavigation } from '@react-navigation/native';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BasicListCategories from '../../../components/BasicListCategories';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';

const gallery = FAKE_USER_PROFILES[0].gallery

const Userwatchlist = Akcru_Content[5];


const UserProfileDetailsTab = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();


  return (
    <View style={{ marginHorizontal: SIZES.marginhorizontal }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View>
          <Text
            style={{
              ...FONTS.Title2,
              marginTop: 10,
              marginBottom: 20,
              textAlign: "center",
              fontSize: 14,
              textDecorationLine: "underline",
            }}
          >
            PROFILE DETAILS
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ width: SIZES.ScreenWidth / 2 }}>
            <View>
              <Text
                style={{
                  ...FONTS.Title2,

                  fontSize: 12,
                  color: COLORS.AKCRUBLUE,
                }}
              >
                You have 2 CRU Invites left
              </Text>
            </View>
            <View>
              <Text
                style={{
                  ...FONTS.Title2,
                  fontSize: 12,
                  color: COLORS.LIGHTGREY,
                  marginVertical: 10,
                }}
              >
                Schedule a CRU View through the CRU Chat
              </Text>
            </View>
            <TouchableOpacity>
              <View style={{ flexDirection: "row" }}>
                <Icon
                  name="square-edit-outline"
                  type="material-community"
                  color={COLORS.DARKGREY}
                  size={15}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    ...FONTS.Title2,
                    color: COLORS.LIGHTGREY,
                    fontSize: 12,
                  }}
                >
                  Edit your CRU
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center" }}>
            <View>
              <Image
                source={imageindex.CruLarge}
                style={{ width: 150, height: 65 }}
                resizeMode="cover"
              />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("UserCruChatScreen")}
            >
              <View
                style={{
                  width: 125,
                  height: 30,
                  backgroundColor: COLORS.MIDORANGE,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                  marginTop: 15,
                }}
              >
                <Text style={{ ...FONTS.Title2 }}>CRU CHAT</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            borderBottomWidth: 1.5,
            borderColor: COLORS.DARKERGREY,
            marginTop: 20,
            marginBottom: 10,
          }}
        />

        <View>
          <Text
            style={{
              ...FONTS.Title2,
              marginTop: 10,
              marginBottom: 20,
              textAlign: "center",
              fontSize: 14,
              textDecorationLine: "underline",
            }}
          >
            ARCHETYPE
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Image source={imageindex.Graph1} />
            <Image source={imageindex.GraphMetric} />
          </View>
          <View style={{ alignItems: "center", marginRight: 20 }}>
            <View>
              <Image
                source={imageindex.SmileyBuffalo}
                style={{ width: 75, height: 75 }}
              />
            </View>

            <Text style={{ ...FONTS.Title2, fontSize: 12 }}>Romantic Star</Text>
          </View>
        </View>

        <View
          style={{
            borderBottomWidth: 1.5,
            borderColor: COLORS.DARKERGREY,
            marginTop: 20,
            marginBottom: 10,
          }}
        />

        <View>
          <Text
            style={{
              ...FONTS.Title2,
              marginTop: 10,
              marginBottom: 5,
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Your "CRU LOVE" watchlist
          </Text>
          <TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                justifyContent: "center",
              }}
            >
              <Icon
                name="square-edit-outline"
                type="material-community"
                color={COLORS.DARKGREY}
                size={15}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  ...FONTS.Title2,
                  color: COLORS.LIGHTGREY,
                  fontSize: 12,
                }}
              >
                Edit your watchlist
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ marginBottom: 75, marginTop: -20 }}>
            <BasicListCategories Akcru_Content={Userwatchlist} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default UserProfileDetailsTab;
