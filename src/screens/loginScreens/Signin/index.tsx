import {
View,
Text,
ImageBackground,
TouchableOpacity,
Modal,
StyleSheet,
TextInput,
ActivityIndicator,
Platform,
KeyboardAvoidingView,
ScrollView
} from 'react-native';

import {BlurView} from '@react-native-community/blur';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import React, {useState} from 'react';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruLogo} from '../../../../assets/svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../../stores/auth.store';
import LinearGradient from 'react-native-linear-gradient';
import * as RootNavigation from '../../../util/RootNavigation';
import {isTablet} from '../../../../assets/constants/theme';

const iconSize = isTablet() ? 28 : 20;
const inputHeight = isTablet() ? 60 : 50;
const loginButtonHeight = isTablet() ? 60 : 50;

const Signin = () => {

const authStore = useAuthStore();
const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

const [email,setEmail] = useState('');
const [password,setPassword] = useState('');
const [emailError,setEmailError] = useState(false);
const [passwordError,setPasswordError] = useState(false);
const [isPasswordVisible,setPasswordVisible] = useState(false);
const [loading,setLoading] = useState(false);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmailValid = (email: string) => {
    return emailRegex.test(email);
};

const handleEmailChange = (text: string) => {
    const trimmedEmail = text.trim().toLowerCase();
    setEmail(trimmedEmail);
    if (trimmedEmail.length > 0) {
        setEmailError(!isEmailValid(trimmedEmail));
    } else {
        setEmailError(false);
    }
};

const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(false); // Clear error when user types
};

const isFormValid =
emailRegex.test(email) && password.length > 0;

async function attemptLogin(){

if(!email.trim()){
    setEmailError(true);
    return;
}

if(!emailRegex.test(email)){
    setEmailError(true);
    return;
}

if(!password.trim()){
    setPasswordError(true);
    return;
}

setLoading(true);

try{

const loginResponse = await authStore.loginWithEmail(email,password);

if(!loginResponse?.session || !loginResponse?.user){
    setPasswordError(true);
    setLoading(false);
    return;
}

const accessToken = loginResponse.session.access_token;

await AsyncStorage.setItem('access_token',accessToken);

RootNavigation.reset({
index:0,
routes:[
{
name:'NoBottomStack',
params:{
screen:'ClientTabNavigator',
params:{screen:'CrummunityStack'}
}
}
]
});

}catch(error){

setPasswordError(true);

}

setLoading(false);

}

return(

<View style={{flex:1}}>

<ImageBackground
style={styles.bgimage}
source={imageindex.BgImageSM}
resizeMode="cover"
>

<LinearGradient
colors={[
'rgba(5,7,35,0.95)',
'rgba(8,8,52,0.45)',
'rgba(5,7,35,0.95)'
]}
style={StyleSheet.absoluteFill}
/>

<KeyboardAvoidingView
style={{flex:1}}
behavior={Platform.OS==='ios'?'padding':'height'}
>

<ScrollView
contentContainerStyle={{
flexGrow:1,
alignItems:'center',
justifyContent:'center'
}}
keyboardShouldPersistTaps="handled"
showsVerticalScrollIndicator={false}
>

<View style={styles.logoTop}>

<AkcruLogo
width={isTablet()?300:200}
height={isTablet()?90:60}
/>

</View>

<View style={styles.signInFormCenter}>

<Text
style={{
...FONTS.paragraph2,
color:'rgba(255,255,255,0.9)',
fontSize:isTablet()?20:16,
marginBottom:15
}}
>
Welcome back, sign in below
</Text>


<View style={styles1.blurInputWrapper}>

<BlurView
style={StyleSheet.absoluteFill}
blurType="light"
blurAmount={10}
/>

<View style={styles1.inputRow}>

<Icon
name="mail"
type="ionicon"
size={iconSize}
color={COLORS.LIGHTGREY}
style={{marginRight:8}}
/>

<TextInput
placeholder="Email"
placeholderTextColor={COLORS.DARKGREY}
style={styles1.input}
value={email}
onChangeText={handleEmailChange}
keyboardType="email-address"
autoCapitalize="none"
/>

</View>

</View>

{emailError ? (
<Text style={styles1.errorText}>Invalid email format</Text>
) : null}


<View style={styles1.blurInputWrapper}>

<BlurView
style={StyleSheet.absoluteFill}
blurType="light"
blurAmount={10}
/>

<View style={styles1.inputRow}>

<Icon
name="lock-closed"
type="ionicon"
size={iconSize}
color={COLORS.LIGHTGREY}
style={{marginRight:8}}
/>

<TextInput
placeholder="Password"
placeholderTextColor={COLORS.DARKGREY}
style={styles1.input}
secureTextEntry={!isPasswordVisible}
value={password}
onChangeText={handlePasswordChange}
/>

<TouchableOpacity
onPress={()=>setPasswordVisible(!isPasswordVisible)}
>

<Icon
name={isPasswordVisible?'eye':'eye-off'}
type="ionicon"
size={iconSize}
color={COLORS.LIGHTGREY}
/>

</TouchableOpacity>

</View>

</View>

{passwordError ? (
<Text style={styles1.errorText}>Invalid email or password</Text>
) : null}


<TouchableOpacity
onPress={attemptLogin}
disabled={!isFormValid || loading}
style={[
styles1.loginButton,
{opacity:(!isFormValid || loading)?0.5:1}
]}
>

<LinearGradient
colors={[COLORS.PURPLE,COLORS.PINK]}
start={{x:0,y:0}}
end={{x:1,y:0}}
style={styles1.loginGradient}
>

{loading ? (
<ActivityIndicator color={COLORS.WHITE}/>
) : (
<Text style={{...FONTS.Title1,color:COLORS.WHITE}}>
Login
</Text>
)}

</LinearGradient>

</TouchableOpacity>


<TouchableOpacity
onPress={()=>navigation.navigate('ForgotPassword')}
style={{marginTop:25}}
>

<Text style={{...FONTS.Title1,color:COLORS.PINK}}>
Forgot your password?
</Text>

</TouchableOpacity>

<View style={{marginTop:30,flexDirection:'row'}}>

<Text style={{...FONTS.Title1,marginRight:5}}>
Not a subscriber?
</Text>

<TouchableOpacity
onPress={()=>navigation.navigate('OnboardEmail')}
>

<Text style={{...FONTS.Title1,color:COLORS.PINK}}>
Sign up here
</Text>

</TouchableOpacity>

</View>

</View>

</ScrollView>

</KeyboardAvoidingView>

</ImageBackground>

</View>

);

};

export default Signin;


const styles1 = StyleSheet.create({

blurInputWrapper:{
width:SIZES.ScreenWidth*0.9,
height:inputHeight,
borderRadius:12,
borderWidth:1,
borderColor:'rgba(255,255,255,0.25)',
overflow:'hidden',
marginVertical:8
},

inputRow:{
flexDirection:'row',
alignItems:'center',
paddingHorizontal:12,
height:inputHeight
},

input:{
flex:1,
color:COLORS.WHITE,
fontSize:isTablet()?18:14
},

errorText:{
width:SIZES.ScreenWidth*0.9,
color:'#FF6B6B',
fontSize:12,
marginTop:-4,
marginBottom:8
},

loginButton:{
width:SIZES.ScreenWidth*0.9,
height:loginButtonHeight,
borderRadius:12,
overflow:'hidden',
marginTop:20
},

loginGradient:{
flex:1,
justifyContent:'center',
alignItems:'center'
}

});
