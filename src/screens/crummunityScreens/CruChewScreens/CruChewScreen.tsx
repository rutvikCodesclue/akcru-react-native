import { View, Text, Image, TouchableOpacity, ScrollView} from 'react-native'
import React from 'react';
import imageindex from '../../../../assets/images/imageindex';
import { SIZES, FONTS, COLORS} from '../../../../assets/constants';
import Header from '../../../components/header';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CruChewStackParams } from '../../../navigation/CruChewStack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabContainer from '../../../components/TabContainer/TabContainer';



const CruChewScreen = () => {

  
  const navigation =
    useNavigation<NativeStackNavigationProp<CruChewStackParams>>();
  
  return (
    
    <TabContainer>
        <SafeAreaView>
          <ScrollView stickyHeaderIndices={[0]}>
              <View>
                  <Header />
              </View>
              <View style={{marginTop: -70}}>
                  <View>
                      <Image
                          source={imageindex.EatingPopcorn}
                          resizeMode="cover"
                          style={{
                              width: SIZES.ScreenWidth,
                              height: SIZES.ScreenHeight / 1.2,
                          }}
                      />
                  </View>

                  <View
                      style={{
                          alignItems: 'center',
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 225,
                          zIndex: 100,
                      }}>
                      <Image
                          source={imageindex.AkcruLogo}
                          style={{
                              width: 125,
                              height: 70,
                          }}
                          resizeMode="contain"
                      />
                      <Text
                          style={{
                              ...FONTS.Title2,
                              textAlign: 'center',
                              marginHorizontal: 25,
                          }}>
                          Welcome to the Akcru's Cru Chew, where you can order from your favorite restaurant and have it
                          delivered to your door while you're enjoying your favorite content.
                      </Text>
                      <TouchableOpacity onPress={() => navigation.navigate('CruChewOrder')}>
                          <Image
                              source={imageindex.CruChew3}
                              style={{
                                  width: SIZES.ScreenWidth * 0.5,
                                  height: SIZES.ScreenWidth * 0.5,
                              }}
                              resizeMode="contain"
                          />
                      </TouchableOpacity>
                      <Text style={{...FONTS.Title2, color: COLORS.PURPLE}}>ORDER NOW!!!</Text>
                  </View>
              </View>
          </ScrollView>
      </SafeAreaView>
    </TabContainer>
      
  );
}

export default CruChewScreen;