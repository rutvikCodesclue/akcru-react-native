import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  ImageBackground,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import React, {useState} from 'react';
import Header from '../../../components/header';
import AkcruButtons from '../../../components/akcruButtons';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import skinnies from '../../../../assets/constants/SkinnyPost';

const CrummunityScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

    const handlePostPress = (post) => {
        navigation.navigate('PostScreen', {post});
    };

  return (
      <SafeAreaView>
          <View>
              <ScrollView stickyHeaderIndices={[0]}>
                  <View>
                      <View style={{zIndex: 100}}>
                          <Header />
                      </View>
                      <View
                          style={{
                              height: SIZES.ScreenHeight * 0.26,
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
                                  height: SIZES.ScreenHeight * 0.26,
                              }}
                          />
                          <Text style={styles.screenTitle}>What's the Skinny?</Text>

                          <View style={{alignItems: 'center'}}>
                              <TouchableWithoutFeedback
                                  onPress={() => {
                                      navigation.navigate('UserSearchResultScreen');
                                  }}>
                                  <View style={styles.searchinput}>
                                      <Icon
                                          name="magnify"
                                          type="material-community"
                                          color={COLORS.AKCRUBLUE}
                                          size={28}
                                          style={{marginRight: 10}}
                                      />
                                      <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Search users</Text>
                                  </View>
                              </TouchableWithoutFeedback>
                          </View>
                          <Text style={styles.screenTitle2}>Crummunity Feed</Text>
                      </View>
                  </View>
                  <View style={{marginBottom: '20%'}}>
                      <FlatList
                          data={skinnies}
                          renderItem={({item}) => (
                              <Pressable onPress={() => handlePostPress(item)}>
                                  <View style={styles.postcontainer}>
                                      <SkinnyPostCard post={item} />
                                  </View>
                              </Pressable>
                          )}
                      />
                  </View>
              </ScrollView>
          </View>
      </SafeAreaView>
  );
};

export default CrummunityScreen;
