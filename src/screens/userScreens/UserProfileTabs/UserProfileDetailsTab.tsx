import {View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Modal} from 'react-native';
import React, { useEffect, useState } from 'react'
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import { Icon } from '@rneui/base';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BasicListCategories from '../../../components/BasicListCategories';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';
import {LineChart} from 'react-native-gifted-charts';
import useAuthStore from '../../../stores/auth.store';
import { IMovie } from '../../../../types';
import { findMovies } from '../../../lib/api/movies.lib';

import archetypeData, { archetypeMapping } from '../../../../assets/constants/archetypeMapping'; // Import your mapping
import { Pressable } from 'react-native';

 


const UserProfileDetailsTab = () => {

    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);
    
  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const {user, hydrateUser} = useAuthStore();
    
    

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            hydrateUser();
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                hydrateUser();
            };
        }, []),
    );

    useEffect(() => {
        const fetchNewerYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by year in descending order
                const sortedMovies = allMovies.sort((a, b) => b.year - a.year);

                // Get the 5 oldest movies
                const Newer5Movies = sortedMovies.slice(0, 5);

                setNewerYearMovies(Newer5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };
        fetchNewerYearMovies();
    }, []);

// const data = [
//     {value: 10, label: 'FA'},
//     {value: 20, label: 'SC'},
//     {value: 30, label: 'DR'},
//     {value: 100, label: 'MY'},
//     {value: 40, label: 'TH'},
//     {value: 50, label: 'CO'},
//     {value: 10, label: 'SP'},
//     {value: 50, label: 'FM'},
//     {value: 50, label: 'HR'},
//     {value: 30, label: 'AC'},
//     {value: 50, label: 'CR'},
//     {value: 20, label: 'AD'},
//     {value: 100, label: 'RO'},
// ];


  return (
      <View style={{marginHorizontal: SIZES.marginhorizontal}}>
          <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                  <Text
                      style={{
                          ...FONTS.Title2,
                          marginTop: 10,
                          marginBottom: 20,
                          textAlign: 'center',
                          fontSize: 14,
                          textDecorationLine: 'underline',
                      }}>
                      PROFILE DETAILS
                  </Text>
              </View>
              <View
                  style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                  }}>
                  <View style={{width: SIZES.ScreenWidth / 2, flex: 1}}>
                      
                      <View>
                          <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.AKCRUBLUE, marginTop: 10}}>
                              You have "{user?.MITCount}" Movie Invites
                          </Text>
                      </View>
                      <View>
                          <Text
                              style={{
                                  ...FONTS.Title2,
                                  fontSize: 12,
                                  color: COLORS.LIGHTGREY,
                                  marginVertical: 20,
                              }}>
                              Schedule a CRU View through the CRU Chat
                          </Text>
                      </View>
                      <TouchableOpacity onPress={() => navigation.navigate('EditCru')}>
                          <View style={{flexDirection: 'row'}}>
                              <Icon
                                  name="square-edit-outline"
                                  type="material-community"
                                  color={COLORS.DARKGREY}
                                  size={15}
                                  style={{marginRight: 5}}
                              />
                              <Text
                                  style={{
                                      ...FONTS.Title2,
                                      color: COLORS.LIGHTGREY,
                                      fontSize: 12,
                                  }}>
                                  Edit your CRU
                              </Text>
                          </View>
                      </TouchableOpacity>
                  </View>

                  <View style={{alignItems: 'center'}}>
                      <View>
                          <Image source={imageindex.NewCru} style={{width: 90, height: 90}} resizeMode="cover" />
                      </View>

                      <TouchableOpacity onPress={() => navigation.navigate('UserCruChatScreen')}>
                          <View
                              style={{
                                  width: 125,
                                  height: 30,
                                  backgroundColor: COLORS.MIDORANGE,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderRadius: 3,
                                  marginTop: 15,
                              }}>
                              <Text style={{...FONTS.Title2}}>CRU CHAT</Text>
                          </View>
                      </TouchableOpacity>
                  </View>
              </View>

              <View
                  style={{
                      borderBottomWidth: 1.5,
                      borderColor: COLORS.DARKERGREY,
                      marginTop: 20,
                      marginBottom: 10,
                  }}
              />

              <View>
                  {/* <Text
                      style={{
                          ...FONTS.Title2,
                          marginTop: 10,
                          marginBottom: 5,
                          textAlign: 'center',
                          fontSize: 14,
                      }}>
                      Your "CRU LOVE" watchlist
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('EditWatchList')}>
                      <View
                          style={{
                              flexDirection: 'row',
                              marginBottom: 20,
                              justifyContent: 'center',
                          }}>
                          <Icon
                              name="square-edit-outline"
                              type="material-community"
                              color={COLORS.DARKGREY}
                              size={15}
                              style={{marginRight: 5}}
                          />
                          <Text
                              style={{
                                  ...FONTS.Title2,
                                  color: COLORS.LIGHTGREY,
                                  fontSize: 12,
                              }}>
                              Edit your watchlist
                          </Text>
                      </View>
                  </TouchableOpacity> */}
                  <View style={{marginBottom: 75}}>
                      <BasicListCategories
                          Akcru_Content={{id: 'recommendedForYou', title: 'Recommended to you', movies: newerYearMovies}}
                      />
                  </View>
              </View>
          </ScrollView>
      </View>
  );
}

export default UserProfileDetailsTab;
