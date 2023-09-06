import {
  SafeAreaView,
  Text,
  View,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from 'react-native';
import styles from './styles';
import React, {useRef, useState} from 'react';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/index';
import {Avatar, Icon} from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import { findAUser } from '../../../lib/api/user.lib';
import { IUserProfile } from '../../../../types';
import { selectAvatarBorderColor } from '../../../util/util';

type ViewUserDetailScreenNavigationProp = StackNavigationProp<
  CrummunityStackParams,
  'ViewUserDetailScreen'
>;

type ViewUserDetailScreenRouteProp = RouteProp<
  CrummunityStackParams,
  'ViewUserDetailScreen'
>;

type Props = {
  navigation: ViewUserDetailScreenNavigationProp;
  route: ViewUserDetailScreenRouteProp;
};

const ViewUserDetailScreen = ({route, navigation}: Props) => {
  const userID: string | undefined = route.params?.userID ?? null;
  const username: string | undefined = route.params?.userName ?? null;

  useFocusEffect(
      React.useCallback(() => {
          // This code will run when the screen comes into focus (e.g., when navigating to this screen)
          findAUser({id: userID}).then(user => {
              setUser(user);
          });

          return () => {
              // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
          };
      }, []),
  );

  const [user, setUser] = useState<IUserProfile | undefined>(undefined);

  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const selectedPhotoAnimatedOpacity = useRef(new Animated.Value(0)).current;

  const openPhoto = (photoUri: string) => {
    setSelectedPhotoUri(photoUri);
    Animated.timing(selectedPhotoAnimatedOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closePhoto = () => {
    Animated.timing(selectedPhotoAnimatedOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedPhotoUri(null));
  };

  return (
      <View>
          <ScrollView>
              <View>
                  <ImageBackground
                      source={{uri: undefined}}
                      resizeMode="cover"
                      style={{height: SIZES.ScreenHeight / 5}}>
                      <LinearGradient
                          // Digitalpass Linear Gradient overlay
                          colors={['transparent', 'transparent', COLORS.AKCRUBACKGROUND]}
                          style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: 0,
                              height: SIZES.ScreenHeight / 5,
                          }}
                      />
                      <Header />
                      <TouchableOpacity onPress={() => navigation.navigate('ViewUserScreen',{userID})}>
                          <View
                              style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginHorizontal: 15,
                                  marginBottom: 30,
                              }}>
                              <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                          </View>
                      </TouchableOpacity>
                  </ImageBackground>
                  <View style={{alignItems: 'center', marginTop: -50}}>
                      <Avatar
                          rounded
                          size={250}
                          source={{
                              uri: user?.profilePicture ?? undefined,
                          }}
                          avatarStyle={{
                              borderWidth: 5,
                              borderColor: selectAvatarBorderColor(user?.badge ?? 'AKCRUIT'),
                          }}
                      />
                  </View>
                  <View style={{alignItems: 'center', marginTop: 20}}>
                      {user?.badge === 'AKCRUIT' && (
                          <View>
                              <AkcruLevels.AkcruBadgeAkcruit />
                          </View>
                      )}
                      {user?.badge === 'GUARDIAN' && (
                          <View>
                              <AkcruLevels.AkcruBadgeGuardian />
                          </View>
                      )}
                      {user?.badge === 'HERO' && (
                          <View>
                              <AkcruLevels.AkcruBadgeHero />
                          </View>
                      )}
                      {user?.badge === 'SUPERHERO' && (
                          <View>
                              <AkcruLevels.AkcruBadgeSuperHero />
                          </View>
                      )}
                  </View>
                  <View style={{marginHorizontal: 15, marginVertical: 10}}>
                      <View style={{flexDirection: 'row'}}>
                          <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Name: </Text>
                          <Text style={{...FONTS.Title2}}>{user?.username}</Text>
                      </View>
                      <View style={{flexDirection: 'row', marginVertical: 5}}>
                          <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Location: </Text>
                          <Text style={{...FONTS.Title2}}>{user?.location}</Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                          <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>CRU Name: </Text>
                          <Text style={{...FONTS.Title2}}>CRUName</Text>
                      </View>
                  </View>
                  <View
                      style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginTop: 10,
                      }}>
                      <Text style={{...FONTS.Title3}}>Gallery</Text>
                      <Icon name="images" type="ionicon" color={COLORS.LIGHTGREY} size={20} style={{marginLeft: 5}} />
                  </View>
                  {/* <View style={styles.gallerycontainer}>
                      <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.galleryImagesContainer}>
                          {gallery.map((imageUri, index) => {
                              return (
                                  <TouchableOpacity
                                      key={index.toString()}
                                      onPress={() => openPhoto(imageUri)}
                                      activeOpacity={0.8}>
                                      <Image source={{uri: imageUri}} style={styles.galleryImage} />
                                  </TouchableOpacity>
                              );
                          })}
                      </ScrollView>
                  </View>
                  {selectedPhotoUri && (
                      <TouchableOpacity style={styles.selectedPhotoContainer} onPress={closePhoto} activeOpacity={1}>
                          <Animated.Image
                              source={{uri: selectedPhotoUri}}
                              resizeMode="cover"
                              style={[styles.selectedPhoto, {opacity: selectedPhotoAnimatedOpacity}]}
                          />
                      </TouchableOpacity>
                  )} */}
              </View>
          </ScrollView>
      </View>
  );
};

export default ViewUserDetailScreen;
