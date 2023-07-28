import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons'
import Inputs from '../../../components/input'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants'
import React, {useState, useEffect} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import { AuthStackParams } from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/themed';
import { AkcruLogo, Applelogo, Googlelogo, Fblogo } from '../../../../assets/svg';
import { supabase } from "../../../../lib/supabase";
import NoBottomStack from '../../../navigation/NoBottomTabStack';
import { API } from '../../../clients/api.client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';


const Signin = () => {
  const authStore = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();


  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (authStore.isAuth()) {
      navigation.navigate('ClientTabNavigator', {screen: 'UserProfileStack'});
    }
  }, [])

  async function attemptLogin() {
    try {
      setLoading(true);
      console.log('Attempting to LOGIN w/ Email/Password:', email, password);
      // login through the API
      const loginResponse = await authStore.loginWithEmail(email, password);
      const session = loginResponse?.session;
      const user = loginResponse?.user;
      // const loginResponse = await API.post("/v1/auth/login", {
      //   type: "email",
      //   email: email,
      //   password: password,
      // })
  
      if (!session || !user) {
        Alert.alert("Error Logging In");
        setLoading(false);
        return null;
      }
      
      // set the acces_token in local storage
      const accessToken = session.access_token;
      AsyncStorage.setItem("access_token", accessToken);
      
      
      console.log(`LOGIN Successful for user: ${user.email}`);
      setLoading(false);
      navigation.navigate('ClientTabNavigator', {screen: 'UserProfileStack'});
      
    } catch (error) {
      console.log('LOGIN Error:', error);
      
    }
  }

  return (
    <View>
      <ImageBackground
        style={styles.bgimage}
        source={imageindex.BgImageSM}
        resizeMode={'cover'}>
        <View style={styles.container}>
          <AkcruLogo width={200} height={60} />
          <View style={{marginBottom: 10}}>
            <Text style={{...FONTS.Title1}}>Welcome back, sign in below</Text>
          </View>
          <View>
            <Inputs
              placeholdername={'Email'}
              iconname={'mail'}
              iconcolor={COLORS.LIGHTGREY}
              secureTextEntry={false}
              onChangeText={(text: React.SetStateAction<string>) =>
                setEmail(text)
              }
              value={email}
              editable={true}
            />
            <Inputs
              placeholdername={'Password'}
              iconname={'lock-closed'}
              iconcolor={COLORS.LIGHTGREY}
              secureTextEntry={true}
              onChangeText={(text: React.SetStateAction<string>) =>
                setPassword(text)
              }
              value={password}
              editable={true}
            />
          </View>
          <View style={{marginVertical: 10}}>
            <AkcruButtons.LrgButton
              color={COLORS.AKCRUBLUE}
              btnname={'Login'}
              onPress={() => attemptLogin()}
              disabled={loading}
            />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity>
              <Googlelogo
                width={42}
                height={42}
                onPress={() => navigation.navigate('ClientTabNavigator', {screen: 'UserProfileStack'})}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Fblogo
                width={40}
                height={40}
                style={{marginLeft: 25, marginRight: 25}}
                onPress={() => {}}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Applelogo width={50} height={50} onPress={() => {}} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text
              style={{
                ...FONTS.Title2Orange,
                fontSize: 14,
                marginTop: 10,
              }}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
          <View
            style={{flex: 1, justifyContent: 'flex-end', marginBottom: 50}}>
            <View
              style={{
                marginBottom: 25,
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  ...FONTS.Title2White,
                  marginRight: 5,
                }}>
                Not a subscriber?
              </Text>

              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text
                  style={{
                    ...FONTS.Title2AkcruBlue,
                  }}>
                  Sign up here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export default Signin