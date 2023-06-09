import { Text, View, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import imageindex from '../../../assets/images/imageindex';
import { COLORS, SIZES, FONTS } from '../../../constants/Theme';
import styles from './Styles/styles';
import { AkcruLogo, Fblogo, Googlelogo, Applelogo } from '../../../assets';
import { Inputs, AkcruButtons } from '../../components';

import { useNavigation } from "@react-navigation/native";

import { AuthStackParams } from "../../navigation/AuthNavigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const Signin = () => {

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();

  return (
    <ScrollView style={{ width: "100%", height: "100%" }}>
      <ImageBackground
        style={styles.bgimage}
        source={imageindex.BgImageSM}
        resizeMode={"cover"}
      >
        <View
          style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}
        >
          <AkcruLogo width={200} height={60} />
          <View style={{ marginBottom: 10 }}>
            <Text style={{ ...FONTS.Title1 }}>Welcome back, sign in below</Text>
          </View>
          <View>
            <Inputs
              placeholdername={"Email"}
              iconname={"email"}
              iconcolor={COLORS.LIGHTGREY}
            />
            <Inputs
              placeholdername={"Password"}
              iconname={"lock"}
              iconcolor={COLORS.LIGHTGREY}
            />
          </View>
          <View style={{ marginVertical: 10 }}>
            <AkcruButtons.LrgButton
              color={COLORS.AKCRUBLUE}
              btnname={"Login"}
              onPress={() => navigation.navigate('ClientTabNavigator')}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity>
              <Googlelogo width={42} height={42} onPress={() => {}} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Fblogo
                width={40}
                height={40}
                style={{ marginLeft: 25, marginRight: 25 }}
                onPress={() => {}}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Applelogo 
                width={48} 
                height={48} 
                onPress={() => {}} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Text
              style={{
                ...FONTS.Title2Orange,
                marginTop: 10,
              }}
            >
              Forgot your password?
            </Text>
          </TouchableOpacity>
          <View
            style={{ marginTop: 200, marginBottom: 25, flexDirection: "row" }}
          >
            <Text
              style={{
                ...FONTS.Title2White,
                marginRight: 5,
              }}
            >
              Not a subscriber?
            </Text>

            <TouchableOpacity>
              <Text
                style={{
                  ...FONTS.Title2AkcruBlue,
                }}
              >
                Sign up here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

export default Signin
