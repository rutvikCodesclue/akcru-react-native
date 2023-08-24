import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import React, { useEffect, useRef } from "react";
import styles from "./styles";
import { SIZES, COLORS, FONTS } from "../../../../assets/constants";
import Header from "../../../components/header";
import AkcruButtons from "../../../components/akcruButtons";
import imageindex from "../../../../assets/images/imageindex";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CrummunityStackParams } from "../../../navigation/CrummunityStack";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import LottieView from "lottie-react-native";


const PurchaseMITScreen = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();


    

  return (
      <View>
          <ImageBackground
              source={{
                  uri: 'https://akcru.com/wp-content/uploads/2023/05/creepymit.png',
              }}
              resizeMode="cover"
              style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
              <SafeAreaView>
                  <View>
                      <Header />
                  </View>
                  <ScrollView>
                      <View style={{marginBottom: 100}}>
                          <Text
                              style={{
                                  ...FONTS.Title2,
                                  marginHorizontal: 15,
                                  marginVertical: 10,
                                  color: COLORS.MIDORANGE,
                              }}>
                              Create a date to watch a movie with someone outside of your CRU.
                          </Text>

                          <View style={styles.pricecontainer}>
                              <Image source={imageindex.MIT2} style={styles.mitimage} />
                              <View style={{flexDirection: 'row', marginVertical: 10}}>
                                  <Text
                                      style={{
                                          ...FONTS.Title3,
                                          fontSize: 20,
                                          marginRight: 10,
                                          color: COLORS.AKCRUBLUE,
                                      }}>
                                      10
                                  </Text>
                                  <Text style={{...FONTS.Title3, fontSize: 20}}>Movie Invite Tickets</Text>
                              </View>
                              <Text style={{...FONTS.Title2}}>Save 150%</Text>
                              <Text style={styles.mitprice}>$10.00</Text>
                              <AkcruButtons.LrgButton btnname="PURCHASE" color={COLORS.CATPURPDRK} onPress={() => {}} />
                          </View>
                          <View style={styles.pricecontainer}>
                              <Image source={imageindex.MIT1} style={styles.mitimage} />
                              <View style={{flexDirection: 'row', marginVertical: 10}}>
                                  <Text
                                      style={{
                                          ...FONTS.Title3,
                                          fontSize: 20,
                                          marginRight: 10,
                                          color: COLORS.AKCRUBLUE,
                                      }}>
                                      6
                                  </Text>
                                  <Text style={{...FONTS.Title3, fontSize: 20}}>Movie Invite Tickets</Text>
                              </View>
                              <Text style={{...FONTS.Title2}}>Save 66%</Text>
                              <Text style={styles.mitprice}>$9.00</Text>
                              <AkcruButtons.LrgButton btnname="PURCHASE" color={COLORS.CATPURPDRK} onPress={() => {}} />
                          </View>
                          <View style={styles.pricecontainer}>
                              <Image source={imageindex.MIT3} style={styles.mitimage} />
                              <View style={{flexDirection: 'row', marginVertical: 10}}>
                                  <Text
                                      style={{
                                          ...FONTS.Title3,
                                          fontSize: 20,
                                          marginRight: 10,
                                          color: COLORS.AKCRUBLUE,
                                      }}>
                                      4
                                  </Text>
                                  <Text style={{...FONTS.Title3, fontSize: 20}}>Movie Invite Tickets</Text>
                              </View>
                              <Text style={{...FONTS.Title2}}>Save 25%</Text>
                              <Text style={styles.mitprice}>$8.00</Text>
                              <AkcruButtons.LrgButton btnname="PURCHASE" color={COLORS.CATPURPDRK} onPress={() => {}} />
                          </View>
                          <View style={styles.pricecontainer}>
                              <Image source={imageindex.MIT4} style={styles.mitimage} />
                              <View style={{flexDirection: 'row', marginVertical: 10}}>
                                  <Text
                                      style={{
                                          ...FONTS.Title3,
                                          fontSize: 20,
                                          marginRight: 10,
                                          color: COLORS.AKCRUBLUE,
                                      }}>
                                      2
                                  </Text>
                                  <Text style={{...FONTS.Title3, fontSize: 20}}>Movie Invite Tickets</Text>
                              </View>
                              <Text style={{...FONTS.Title2}}></Text>
                              <Text style={styles.mitprice}>$5.00</Text>
                              <AkcruButtons.LrgButton btnname="PURCHASE" color={COLORS.CATPURPDRK} onPress={() => {}} />
                          </View>
                      </View>
                  </ScrollView>
              </SafeAreaView>
          </ImageBackground>
      </View>
  );
};

export default PurchaseMITScreen;

