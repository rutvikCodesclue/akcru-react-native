import React, {useEffect, useMemo, useState} from 'react';
import {
View,
Text,
TouchableOpacity,
Modal,
StatusBar,
Dimensions,
Platform,
StyleSheet,
ImageBackground,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import imageindex from '../../../../assets/images/imageindex';
import {AkcruLogo} from '../../../../assets/svg';
import useAuthStore from '../../../stores/auth.store';
import AkcruAppOpener from '../../../components/AkcruAppOpener';
import {isTablet} from '../../../../assets/constants/theme';
import {getPostAuthClientTabParams, getPostAuthResetState} from '../../../util/postAuthNavigation';
import {reset as resetNavigation} from '../../../util/RootNavigation';
import {isCurrentFlowPpv} from '../../../util/config';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const Welcome = (params:any) => {

const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
const authStore = useAuthStore();
const insets = useSafeAreaInsets();

const [showLoginError,setShowLoginError] = useState(false);
const [loading,setLoading] = useState(true);
const [showOpener,setShowOpener] = useState(true);

const logoWidth = useMemo(()=>isTablet()?300:200,[]);
const logoHeight = useMemo(()=>isTablet()?90:60,[]);
const buttonHeight = useMemo(()=>isTablet()?62:56,[]);

useEffect(()=>{

const checkPermissions = async()=>{

try{

if(Platform.OS==='android'){

const permissions=[
PERMISSIONS.ANDROID.RECORD_AUDIO,
PERMISSIONS.ANDROID.READ_CONTACTS,
PERMISSIONS.ANDROID.CAMERA,
PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
];

for(const permission of permissions){
const result = await check(permission);
if(result !== RESULTS.GRANTED){
await request(permission);
}
}

}

if(Platform.OS==='ios'){

const permissions=[
PERMISSIONS.IOS.CAMERA,
PERMISSIONS.IOS.MICROPHONE,
PERMISSIONS.IOS.MEDIA_LIBRARY
];

for(const permission of permissions){
const result = await check(permission);
if(result !== RESULTS.GRANTED){
await request(permission);
}
}

}

}catch(err){
console.log(err);
}

};

checkPermissions();

},[]);


const waitForRehydration = async()=>{
let attempts = 0;
const maxAttempts = 50;
while(!useAuthStore.getState()._hasHydrated && attempts < maxAttempts){
await new Promise(resolve=>setTimeout(resolve,50));
attempts++;
}
};

const checkAuth = async()=>{

try{

await waitForRehydration();

await authStore.hydrateAuth();

const session = authStore.getSession();
const accessTokenFromStorage = await AsyncStorage.getItem('access_token');
const hasToken = accessTokenFromStorage !== null || session?.access_token != null;

const isAuthed =
authStore.getUser() !== null &&
authStore.getSession() !== null;

return isAuthed && hasToken;

}catch(err){
console.log(err);
return false;
}

};


const handleAnimation = ()=>{

return new Promise<void>((resolve)=>{

setShowOpener(true);

setTimeout(()=>{
setShowOpener(false);
resolve();
},10000);

});

};


useEffect(()=>{

let cancelled=false;

const fromLogout = params?.route?.params?.fromLogout === true;

const init = async()=>{

const authPromise = checkAuth();
const animationPromise = fromLogout ? Promise.resolve() : handleAnimation();

if(fromLogout) setShowOpener(false);

const [isLoggedIn] = await Promise.all([authPromise,animationPromise]);

if(cancelled) return;

if(isLoggedIn){

const routeParams = params?.route?.params?.params;

if(routeParams?.screenName){

navigation.navigate('NoBottomStack',{
screen:routeParams.screenName,
params:routeParams.params ?? {}
});

return;

}

if (isCurrentFlowPpv) {
    resetNavigation(getPostAuthResetState('returning'));
} else {
    navigation.navigate('ClientTabNavigator', getPostAuthClientTabParams('returning'));
}
return;

}

setLoading(false);

}

init();

return ()=>{cancelled=true};

},[]);


if(loading){

return(
<View
style={{
flex:1,
marginTop:-insets.top,
height:SCREEN_HEIGHT + insets.top,
width:SCREEN_WIDTH,
backgroundColor:COLORS.AKCRUBACKGROUND
}}
>
{showOpener && (
<AkcruAppOpener
onAnimationFinish={()=>setShowOpener(false)}
/>
)}
</View>
);

}


return(

<View style={styles.root}>

<StatusBar translucent backgroundColor={COLORS.TRANSPARENT} barStyle="light-content"/>

<ImageBackground
source={imageindex.BgImageSM}
resizeMode="cover"
style={styles.background}
>

<LinearGradient
colors={[
'rgba(5,7,35,0.95)',
'rgba(8,8,52,0.45)',
'rgba(5,7,35,0.95)'
]}
style={StyleSheet.absoluteFill}
/>

<View
style={[
styles.container,
{
paddingTop:Math.max(insets.top+40,60),
paddingBottom:Math.max(insets.bottom+40,70)
}
]}
>

<View style={styles.centerSection}>

<AkcruLogo width={logoWidth} height={logoHeight}/>

<Text style={styles.headline}>
Connect Through What You Watch
</Text>

<Text style={styles.subtitle}>
Discover People. Send Movie Invites. Create Shared Experiences
</Text>

</View>

<View style={styles.buttonSection}>

<TouchableOpacity
activeOpacity={0.9}
style={[styles.buttonShadow,{height:buttonHeight}]}
onPress={()=>navigation.navigate('Signin')}
>

<LinearGradient
colors={[COLORS.PURPLE,COLORS.PINK]}
start={{x:0,y:0}}
end={{x:1,y:0}}
style={styles.primaryButton}
>

<Text style={styles.primaryButtonText}>
Sign In
</Text>

</LinearGradient>

</TouchableOpacity>


<TouchableOpacity
activeOpacity={0.9}
style={[styles.buttonShadow,styles.secondaryButtonWrapper,{height:buttonHeight}]}
onPress={()=>navigation.navigate('OnboardEmail')}
>

<View style={styles.secondaryButton}>

<Text style={styles.primaryButtonText}>
Create Account
</Text>

</View>

</TouchableOpacity>

<Text style={styles.footerText}>
Continue to your account or create a new one to get started.
</Text>

</View>


<Modal transparent visible={showLoginError} animationType="fade">

<View style={styles.modalBackdrop}>

<View style={styles.modalCard}>

<Text style={styles.modalTitle}>
Login error, please try again.
</Text>

<TouchableOpacity
onPress={()=>setShowLoginError(false)}
style={styles.modalButton}
>

<Text style={styles.modalButtonText}>
Close
</Text>

</TouchableOpacity>

</View>

</View>

</Modal>

</View>

</ImageBackground>

</View>

);

};

export default Welcome;


const styles = StyleSheet.create({

root:{
flex:1,
backgroundColor:COLORS.AKCRUBACKGROUND
},

background:{
flex:1
},

container:{
flex:1,
paddingHorizontal:24,
justifyContent:'space-between'
},

centerSection:{
flex:1,
justifyContent:'center',
alignItems:'center'
},

headline:{
...FONTS.Title1,
fontSize:34,
color:COLORS.WHITE,
textAlign:'center',
marginTop:20,
lineHeight:42
},

subtitle:{
...FONTS.paragraph2,
fontSize:16,
color:COLORS.OVERLAY_WHITE_75,
textAlign:'center',
marginTop:14,
lineHeight:22,
paddingHorizontal:20
},

buttonSection:{
width:'100%'
},

buttonShadow:{
borderRadius:12,
marginBottom:16,
shadowColor:COLORS.BLACK,
shadowOffset:{width:0,height:12},
shadowOpacity:0.35,
shadowRadius:20,
elevation:10
},

primaryButton:{
flex:1,
borderRadius:12,
alignItems:'center',
justifyContent:'center'
},

primaryButtonText:{
...FONTS.Title1,
color:COLORS.WHITE,
textAlign:'center'
},

secondaryButtonWrapper:{
backgroundColor:COLORS.OVERLAY_WHITE_08,
borderWidth:1,
borderColor:COLORS.OVERLAY_WHITE_18,
overflow:'hidden'
},

secondaryButton:{
flex:1,
borderRadius:12,
alignItems:'center',
justifyContent:'center',
backgroundColor:COLORS.OVERLAY_WHITE_06
},

footerText:{
...FONTS.paragraph2,
color:COLORS.OVERLAY_WHITE_55,
textAlign:'center',
marginTop:10
},

modalBackdrop:{
flex:1,
backgroundColor:COLORS.OVERLAY_BLACK_55,
justifyContent:'center',
alignItems:'center',
paddingHorizontal:20
},

modalCard:{
backgroundColor:COLORS.AKCRUBACKGROUND,
padding:22,
borderRadius:18
},

modalTitle:{
...FONTS.Title3,
color:COLORS.WHITE,
textAlign:'center'
},

modalButton:{
alignSelf:'center',
marginTop:14
},

modalButtonText:{
...FONTS.Title2,
color:COLORS.PINK
}

});
