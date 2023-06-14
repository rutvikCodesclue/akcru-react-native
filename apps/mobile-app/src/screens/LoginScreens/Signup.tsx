import { Text, Button, View, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import imageindex from '../../../assets/images/imageindex';
import { COLORS, SIZES, FONTS } from '../../../constants/Theme';
import styles from './Styles/styles';
import { AkcruLogo, Fblogo, Googlelogo, Applelogo } from '../../../assets';
import { Inputs, AkcruButtons } from '../../components';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '../../lib/supabase';
import { useNavigation } from "@react-navigation/native";
import {
  Text as RapiText,
  TextInput as RapiTextInput,
} from "react-native-rapi-ui";
import { AuthStackParams } from "../../navigation/AuthNavigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { styled } from "nativewind";

const StyledView = styled(View);


export const SignUp = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();


  async function attemptSignup() {
    setLoading(true)
    console.log("Attempting to Signup w/ Email/Password:",email, password);
    
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) console.error(error.message)
    if (!error) {
      alert("Signup Successful!");
      setLoading(false)
      // FIXME: push to log in page
      navigation.navigate('Signin')
    }
  }
  

  return (
    <KeyboardAvoidingView style={{ width: "100%", height: "100%" }}>
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
            <Text style={{ ...FONTS.Title1 }}>Sign Up</Text>
          </View>
          <StyledView className='w-[265px] text-white'>
            {/* EMAIL ADDRESS */}
            <RapiTextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your email"
              value={email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />
            {/* PASSWORD */}
            <RapiTextInput
              containerStyle={{ marginTop: 15, }}
              placeholder="Enter your password"
              value={password}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
          </StyledView>
          <View style={{ marginVertical: 10, gap: 10 }}>
            <AkcruButtons.LrgButton
              color={COLORS.MIDORANGE}
              btnname={"Sign Up"}
              onPress={() => attemptSignup()}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity>
              <Googlelogo width={42} height={42} onPress={() => {navigation.navigate('ClientTabNavigator')}} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Fblogo
                width={40}
                height={40}
                style={{ marginLeft: 25, marginRight: 25 }}
                onPress={() => {navigation.navigate('ClientTabNavigator')}}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Applelogo 
                width={48} 
                height={48} 
                onPress={() => {navigation.navigate('ClientTabNavigator')}} />
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
    </KeyboardAvoidingView>
  );
}


export default SignUp;