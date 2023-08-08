import {
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import UserSearchCard from '../../../components/UserSearchCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';

import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import filter from 'lodash/filter';
import {ScrollView} from 'react-native-gesture-handler';

const UserSearchResultScreen = () => {
  const [data, setData] = useState([...FAKE_USER_PROFILES]);

  const [textInputFocused, setTextInputFocused] = useState(false);
  const textInputRef = useRef(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  const contains = ({userName}: {userName: string}, query: string) => {
    if (userName.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    return false;
  };
  const handleSearch = (text: any) => {
    const dataSearch = filter(FAKE_USER_PROFILES, userSearch => {
      return contains(userSearch, text.toLowerCase());
    });

    setData([...dataSearch]);
  };

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
          <Header />
          <TouchableOpacity
            style={{marginHorizontal: 15, marginBottom: 10}}
            onPress={() => navigation.pop()}>
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
              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
            </View>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
            <View style={styles.searchinput}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Icon
                name="magnify"
                type="material-community"
                color={COLORS.AKCRUBLUE}
                size={28}
                style={{marginRight: 10}}
              />
              <TextInput
                placeholder="Search for user"
                placeholderTextColor={COLORS.DARKGREY}
                autoCorrect={false}
                autoFocus={false}
                ref={textInputRef}
                onFocus={() => {
                  setTextInputFocused(true);
                }}
                onBlur={() => {
                  setTextInputFocused(false);
                }}
                onChangeText={handleSearch}
                style={{color: COLORS.LIGHTGREY}}
              /> 
                </View>
              
              <TouchableWithoutFeedback onPress={() => {}}>
                <Icon
                  name="close-circle"
                  type="material-community"
                  size={25}
                  color={COLORS.DARKGREY}
                  style={{}}
                  onPress={() => {
                    textInputRef.current.clear();
                    handleSearch(textInputRef);
                    setTextInputFocused(true);
                  }}
                />
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>

        <View style={{marginHorizontal: 15, marginBottom: 70}}>
          <FlatList
            data={data}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            keyExtractor={item => item.userID}
            renderItem={({item, index}) => (
              <View style={{marginVertical: 5}}>
                <UserSearchCard
                  userPicture={item.userPicture}
                  userName={item.userName}
                  onPress={() => {
                    navigation.navigate('ViewUserScreen', {
                      userID: index,
                    });
                    setTextInputFocused(true);
                  }}
                  influencer={item.influencer}
                  userID={item.userID}
                  akcruBadge={item.akcruBadge}
                  userDesc={item.userDesc}
                  avatarbordercolor={item.avatarbordercolor}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default UserSearchResultScreen;
