import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView
} from 'react-native';
import AkcruButtons from '../../../components/akcruButtons'
import Inputs from '../../../components/input'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants'
import React, {useState} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import { AuthStackParams } from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/themed';
import { AkcruLogo, Applelogo, Googlelogo, Fblogo } from '../../../../assets/svg';
import { supabase } from "../../../../lib/supabase";

const Signin = () => {

const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();


const [email, setEmail] = useState<string>('');
const [password, setPassword] = useState<string>('');

const [loading, setLoading] = useState<boolean>(false);

async function attemptSignup() {
  setLoading(true);
  console.log('Attempting to Signup w/ Email/Password:', email, password);

  const {error} = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) console.error(error.message);
  if (!error) {
    console.log('Signup Successful!');
    setLoading(false);
    // navigation.navigate('ClientTabNavigator')
    // FIXME: push to sign up page
  }
}

async function attemptLogin() {
  setLoading(true);
  console.log('Attempting to LOGIN w/ Email/Password:', email, password);

  const {error} = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) console.error(error.message);
  if (!error) {
    console.log('LOGIN Successful!', email);
    setLoading(false);
    navigation.navigate('ClientTabNavigator');
  }
}

  return (
    <SafeAreaView>
      <ScrollView>
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
              />
            </View>
            <View style={{marginVertical: 10}}>
              <AkcruButtons.LrgButton
                color={COLORS.AKCRUBLUE}
                btnname={'Login'}
                onPress={() => attemptLogin()}
              />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity>
                <Googlelogo
                  width={42}
                  height={42}
                  onPress={() => navigation.navigate('ClientTabNavigator')}
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
              style={{flex: 1, justifyContent: 'flex-end', marginBottom: 10}}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

export default Signin