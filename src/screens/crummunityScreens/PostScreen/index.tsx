import { View, Text, SafeAreaView, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles'
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost'
import skinnies from '../../../../assets/constants/SkinnyPost'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants/theme'
import LinearGradient from 'react-native-linear-gradient'
import { Icon } from '@rneui/base'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { CrummunityStackParams } from '../../../navigation/CrummunityStack'
import Header from '../../../components/header'
import TabContainer from '../../../components/TabContainer/TabContainer'


const PostScreen =({route}) => {

    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
   const {post} = route.params;

   if (!post) {
       return (
           <View style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND, alignItems: 'center', justifyContent: 'center'}}>
               <Text style={{...FONTS.Title2Orange}}>Error: Post not found</Text>
           </View>
       );
   }
   
  return (
    <TabContainer>
        <SafeAreaView>
          <ScrollView stickyHeaderIndices={[0]}>
              <View style={{zIndex: 100}}>
                  <Header />
              </View>
              <View
                  style={{
                      height: SIZES.ScreenHeight * 0.15,
                      marginTop: -68,
                      backgroundColor: COLORS.AKCRUBACKGROUND,
                  }}>
                  <LinearGradient
                      // Background Linear Gradient
                      colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                      style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          height: SIZES.ScreenHeight * 0.15,
                      }}>
                      <TouchableOpacity onPress={() => navigation.pop()}>
                          <View
                              style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginTop: '20%',
                                  marginHorizontal: 15,
                              }}>
                              <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                          </View>
                      </TouchableOpacity>
                  </LinearGradient>
              </View>
              <View style={styles.postcontainer}>
                  <SkinnyPostCard post={post} />
              </View>
          </ScrollView>
      </SafeAreaView>
    </TabContainer>
      
  );
}
export default PostScreen;