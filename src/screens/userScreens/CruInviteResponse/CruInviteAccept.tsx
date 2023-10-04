import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  SafeAreaView,
} from "react-native";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import styles from "./styles";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Icon, Avatar } from "@rneui/base";
import AkcruLevels from "../../../components/akcruBadges";
import Header from "../../../components/header";
import LinearGradient from "react-native-linear-gradient";
import { DIGITAL_PASS } from "../../../../assets/constants/Mockusers";
import imageindex from "../../../../assets/images/imageindex";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import { StackNavigationProp } from "@react-navigation/stack";
import { IMovie, IUserProfile } from "../../../../types";
import { capitalizeFirstLetterOfString, formatMovieDuration } from "../../../util/util";
import { ClientStackParams } from "../../../navigation/ClientStack";

type CruInviteAcceptNavigationProp = StackNavigationProp<ClientStackParams, 'CruInviteDecline'>;

type CruInviteAcceptRouteProp = RouteProp<ClientStackParams, 'CruInviteDecline'>;

type Props = {
    navigation: CruInviteAcceptNavigationProp;
    route: CruInviteAcceptRouteProp;
};


const CruInviteAccept = ({navigation, route}: Props) => {
    const id: string = route.params?.id ?? null;
    const inviteeName: string | undefined = route.params?.inviteeName ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const inviteDate: string | undefined = route.params?.inviteDate ?? null;
    const akcruBadge: any = route.params?.akcruBadge ?? null;
      useEffect(() => {
          const timer = setTimeout(() => {
              // Navigate to UserProfileScreen
              navigation.navigate('UserProfileScreen');
          }, 4000); // 4000 milliseconds (4 seconds)

          // Clear the timer if the component unmounts
          return () => clearTimeout(timer);
      }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.sheetcontainer}>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View>
                        <Header />
                    </View>
                    <View>
                        <View style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
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
                            <View style={styles.topcontainer}>
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            color: COLORS.CATGREENLGT,
                                            fontSize: 16,
                                            textAlign: 'center',
                                            paddingTop: '10%',
                                        }}>
                                        YOU ACCEPTED A CRU INVITE FROM
                                    </Text>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            color: COLORS.MIDORANGE,
                                            fontSize: 16,
                                            textAlign: 'center',
                                        }}>
                                        {inviteeName}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            style={{
                                alignItems: 'center',

                                marginHorizontal: 15,
                                marginBottom: 20,
                            }}>
                            <View>
                                <View>
                                    <Avatar
                                        rounded
                                        size={150}
                                        source={{
                                            uri: creator?.profilePicture,
                                        }}
                                        avatarStyle={{
                                            borderWidth: 2,
                                            borderColor: COLORS.AKCRUBLUE,
                                        }}
                                    />
                                    <View />

                                    {/* {!privateaccount ? (
                                      online ? (
                                          <View
                                              style={{
                                                  backgroundColor: 'green',
                                                  height: 12,
                                                  width: 12,
                                                  borderRadius: 8,
                                                  position: 'absolute',
                                                  right: 8,
                                              }}
                                          />
                                      ) : (
                                          <View
                                              style={{
                                                  backgroundColor: 'red',
                                                  height: 12,
                                                  width: 12,
                                                  borderRadius: 8,
                                                  position: 'absolute',
                                                  right: 8,
                                              }}
                                          />
                                      )
                                  ) : null} */}
                                </View>
                            </View>
                        </View>
                        <View>
                            <View style={styles.bottomcontainer}>
                                <Text
                                    style={{
                                        ...FONTS.paragraph1,
                                        fontSize: 12,
                                        textAlign: 'center',
                                    }}>
                                    We will notify "{inviteeName}" you have ACCEPTED to join their CRU.
                                </Text>
                                <View style={{alignItems: 'center', marginTop: 30}}></View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CruInviteAccept;
