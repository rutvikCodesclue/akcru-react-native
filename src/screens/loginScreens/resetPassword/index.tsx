import {
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import React, {useEffect, useState} from 'react';
import styles from './styles'
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { AkcruLogo } from '../../../../assets/svg';
import { supabase} from '../../../../lib/supabase';
import {Icon} from '@rneui/base';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = text => {
    setEmail(text);
    setEmailError(!isEmailValid(text));
  };

  const checkFormCompletion = () => {
    if (
      email &&
      isEmailValid(email) // Check email format
    ) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  };

  useEffect(() => {
    checkFormCompletion();
  }, [email]);

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParams>>();

  async function resetPassword() {
    setLoading(true);
    // FIXME: get rid of this console.log
    console.log('Attempting to Reset Password w/ Email:', email);

    const {error} = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ackru.com/update-password',
    });

    if (error) console.error(error.message);
    if (!error) {
      alert(
        ' Successful, password reset instructions have been sent to your email.',
      );
      setLoading(false);
      // FIXME: push to check email page / trigger set email state
      navigation.navigate('Signin');
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
          <TouchableOpacity
            onPress={() => navigation.pop()}
            style={styles.backbutton}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',

              }}>
              <Icon
                name="chevron-back"
                type="ionicon"
                size={20}
                color={COLORS.LIGHTGREY}
              />
              <Text style={{...FONTS.Title3, marginLeft: 5}}>
                Back to Signin
              </Text>
            </View>
          </TouchableOpacity>
          <View
            style={{flex: 1, alignItems: 'center', marginTop: SIZES.ScreenHeight / 4}}>
            <AkcruLogo width={200} height={60} />
            <Text style={{...FONTS.Title2, marginBottom: 10}}>Forgot your password?</Text>
            <View style={{marginBottom: 10}}>
              <Inputs
                placeholdername={'Enter Your Email'}
                iconname={'mail'}
                iconcolor={COLORS.LIGHTGREY}
                secureTextEntry={false}
                onChangeText={handleEmailChange}
                value={email}
              />
              {emailError && (
                <Text style={styles.warningText}>Invalid email format</Text>
              )}
            </View>

            <AkcruButtons.LrgButton
              color={COLORS.MIDORANGE}
              btnname={'Reset Password'}
              onPress={() => resetPassword()}
            />
          </View>
        </View>
      </ImageBackground> 
        </ScrollView>
      
    </SafeAreaView>
  );
};

export default ForgotPassword;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

