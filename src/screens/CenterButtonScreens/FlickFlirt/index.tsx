import { ImageBackground,StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import SafeAreaView from 'react-native-safe-area-view';
import imageindex from '../../../../assets/images/imageindex';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants/theme';
import Header from '../../../components/header';
import { Icon } from '@rneui/base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AkcruButtonStackParams } from '../../../navigation/AkcruButtonStack';
import LinearGradient from 'react-native-linear-gradient';
import TabContainer from '../../../components/TabContainer/TabContainer';


const FlickFlirtScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
  return (
      <TabContainer>
          <View>
              <ImageBackground
                  source={imageindex.FLickFlirt}
                  resizeMode="cover"
                  style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                  <SafeAreaView>
                      <View>
                          <Header />
                      </View>
                      <TouchableOpacity
                          style={{marginHorizontal: 15, marginBottom: 10}}
                          onPress={() => navigation.pop()}>
                          <View
                              style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                              }}>
                              <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                          </View>
                      </TouchableOpacity>
                      <View style={{justifyContent: 'center', height: SIZES.ScreenHeight * .65}}>
                        <View style={styles.textcontainer}>
                          <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>"Flick Flirt"</Text>
                          <Text style={[styles.title, {color: COLORS.PINK, marginBottom: 15}]}>
                              Elevate Your Movie Nights with a Dash of Romance!
                          </Text>
                          <Text style={styles.paragraph}>
                              Welcome to Flick Flirt, the charming and playful side of Akcru designed to bring a
                              touch of romance to your cinematic experiences. Flick Flirt is not just about watching
                              movies; it's about connecting with someone special over shared film interests.
                          </Text>
                      </View>
                      </View>           
                  </SafeAreaView>
                  {/* <LinearGradient
                      // Background Linear Gradient
                      colors={['transparent', COLORS.AKCRUBACKGROUND]}
                      style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 600,
                      }}
                  /> */}
              </ImageBackground>
          </View>
      </TabContainer>
  );
}

export default FlickFlirtScreen

const styles = StyleSheet.create({
    title: {
        ...FONTS.Title3,
        textAlign: 'center',
        
        
    },
    textcontainer: {
        backgroundColor: COLORS.TRANSPURPLGT,
        alignSelf: 'center',
        width: SIZES.ScreenWidth * .93,
        padding: 15,
        borderRadius: 5,
      
        
    },
    paragraph: {
...FONTS.Title2,
fontSize: 12,
textAlign: 'center'
    }
});