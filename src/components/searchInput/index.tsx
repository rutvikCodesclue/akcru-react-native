import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Image,
  Platform
} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { ClientStackParams } from '../../navigation/ClientStack';
import filter from 'lodash/filter';
import { Akcru_Content } from '../../../assets/constants/ListData';
import { findMovies } from '../../lib/api/movies.lib';
import {IMovie} from '../../../types';
import {findMovieById} from '../../lib/api/movies.lib';
import { FlashList } from '@shopify/flash-list';

const SearchInput = () => {
  //search input function
  const [data, setData] = useState<IMovie[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [textInputFocused, setTextInputFocused] = useState(false);
  const textInputRef = useRef(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

  const contains = ({title}: {title: string}, query: string) => {
    if (title.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    return false;
  };

  const handleSearch = (text: string) => {
      const dataSearch = filter(data, userSearch => {
          return contains(userSearch, text.toLowerCase());
      });

      setData([...dataSearch]);
  };

  useEffect(() => {
      // Fetch movies here using the findMovies function from your API
      const fetchMovies = async () => {
          try {
              const fetchedMovies: IMovie[] = await findMovies(); // Replace this with the actual function to fetch movies
              setData(fetchedMovies);
          } catch (error) {
              console.error('Error fetching movies:', error);
          }
      };

      fetchMovies();
  }, []);

  return (
      <View>
          <LinearGradient
              // Background Linear Gradient
              colors={[COLORS.AKCRUBACKGROUND, 'transparent']}
              style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 65,
                  width: SIZES.ScreenWidth,
                        
              }}
          />
          <View style={{alignItems: 'center'}}>
              <TouchableWithoutFeedback
                  onPress={() => {
                      setModalVisible(true);
                  }}>
                  <View style={styles.searchinput}>
                      <Icon
                          name="magnify"
                          type="material-community"
                          color={COLORS.DARKGREY}
                          size={28}
                          style={{marginRight: 10}}
                      />
                      <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>What movie are you searching for?</Text>
                  </View>
              </TouchableWithoutFeedback>

              <Modal animationType="fade" transparent={false} visible={modalVisible}>
                  <View style={{backgroundColor: COLORS.AKCRUBACKGROUND, flex: 1}}>
                      <View style={styles.backbutton}>
                          <TouchableOpacity
                              onPress={() => setModalVisible(false)}
                              style={{
                                  paddingHorizontal: 15,
                                  paddingVertical: 10,
                              }}>
                               <View
                                  style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                  }}>
                                  <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                  <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                              </View>
                             
                          </TouchableOpacity>
                      </View>
                      <View style={styles.searchmodal}>
                          <View style={styles.searchinput}>
                              <View>
                                  <Icon
                                      name={textInputFocused ? 'arrow-left' : 'magnify'}
                                      onPress={() => {
                                          if (textInputFocused) setModalVisible(false);
                                          setTextInputFocused(true);
                                      }}
                                      iconStyle={{marginRight: 5}}
                                      type="material-community"
                                      style={styles.icon}
                                      color={COLORS.DARKGREY}
                                      size={28}
                                  />
                              </View>
                              <TextInput
                                  textAlignVertical={'center'}
                                  placeholder="Search Movie"
                                  placeholderTextColor={COLORS.DARKGREY}
                                  style={styles.textinput}
                                  autoFocus={false}
                                  ref={textInputRef}
                                  onFocus={() => {
                                      setTextInputFocused(true);
                                  }}
                                  onBlur={() => {
                                      setTextInputFocused(false);
                                  }}
                                  onChangeText={handleSearch}
                              />
                              <TouchableWithoutFeed onPress={() => {}}>
                                  <Icon
                                      name="close-circle"
                                      type="material-community"
                                      size={25}
                                      color={COLORS.DARKGREY}
                                      style={{marginLeft: SIZES.ScreenWidth / 2.2}}
                                      onPress={() => {
                                          textInputRef.current.clear();
                                          handleSearch('');
                                          //    handleSearch(textInputRef);
                                          setTextInputFocused(true);
                                      }}
                                  />
                              </TouchableWithoutFeedback>
                          </View>
                      </View>
                      <View style={{flex: 1, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                          <FlashList
                              data={data}
                              estimatedItemSize={500}
                              ListFooterComponent={<View style={{marginBottom: 70}} />}
                              renderItem={({item, index}) => (
                                  <TouchableOpacity
                                      onPress={() => {
                                          Keyboard.dismiss;
                                          navigation.navigate('ContentDetailScreen', {
                                              id: item.id,
                                              movie: item.id,
                                          });
                                          setModalVisible(false);
                                          setTextInputFocused(true);
                                      }}>
                                      <View
                                          style={{
                                              marginHorizontal: 15,
                                              backgroundColor: COLORS.AKCRUBACKGROUND,
                                              marginBottom: 10,
                                          }}>
                                          <View style={{flexDirection: 'row'}}>
                                              <Image
                                                  source={{uri: item.portraitURL}}
                                                  style={{width: 30, height: 50, borderRadius: 3}}
                                              />
                                              <View style={{marginLeft: 10}}>
                                                  <Text style={{...FONTS.Title2, fontSize: 12}}>{item.title}</Text>
                                                  <Text style={{...FONTS.paragraph1, fontSize: 12}}>{item.year}</Text>
                                              </View>
                                          </View>
                                      </View>
                                  </TouchableOpacity>
                              )}
                              keyExtractor={item => item.id}
                          />
                      </View>
                  </View>
              </Modal>
          </View>
      </View>
  );
};

export default SearchInput;
