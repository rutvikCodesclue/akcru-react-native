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
} from 'react-native';
import React, {useState} from 'react';
import Header from '../../../components/header';
import AkcruButtons from '../../../components/akcruButtons';
import CrummunityPostList from '../../../components/CrummunityPostList';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { DIGITAL_PASS } from '../../../../assets/constants/Mockusers';
import { FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

import { CrummunityStackParams } from '../../../navigation/CrummunityStack';

const CrummunityScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>
        <ImageBackground
          source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
          resizeMode="cover"
          style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: SIZES.ScreenHeight / 4,
            }}
          />
          <Text style={styles.screenTitle}>Crummunity Feed</Text>

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
                <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>
                  Search users
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ImageBackground>

        <View style={styles.container}>
          <View style={styles.input}>
            <TextInput
              placeholder={'Post something'}
              placeholderTextColor={COLORS.DARKGREY}
              style={styles.textinput}
            />
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <AkcruButtons.XSmallButton
              btnname={'POST'}
              onPress={function (): void {}}
              color=""
            />
          </View>
        </View>
        <View style={styles.postcontainer}>
          <CrummunityPostList />
        </View>
      </ScrollView>
    </View>
  );
};

export default CrummunityScreen;
