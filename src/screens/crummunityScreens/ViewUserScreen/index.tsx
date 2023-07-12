import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import styles from './styles';
import React, {useState} from 'react';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import {FAKE_USER_PROFILES, JENNY_INVITES} from '../../../../assets/constants/Mockusers';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Avatar } from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import BasicListCategories from '../../../components/BasicListCategories';
import { Akcru_Content } from '../../../../assets/constants/ListData';

type ViewUserScreenNavigationProp = StackNavigationProp<
  CrummunityStackParams,
  'ViewUserScreen'
>;

type ViewUserScreenRouteProp = RouteProp<
  CrummunityStackParams,
  'ViewUserScreen'
>;

type Props = {
  navigation: ViewUserScreenNavigationProp;
  route: ViewUserScreenRouteProp;
};

const ViewUserwatchlist = Akcru_Content[6];

const MAX_STATUS_LENGTH = 17; // Maximum number of characters for the username

export default function ViewUserScreen({route, navigation}: Props) {
  const userID: number | undefined = route.params?.userID ?? null;
  const userprofile: string | undefined = route.params?.userName ?? null;

  const {
    digitalpass,
    userPicture,
    privateaccount,
    online,
    userName,
    akcruBadge,
    status,
    userFollowerAmount,
    userDesc,
    influencer,
    ADAmount,
    CRUName,
    avatarbordercolor,
  } = FAKE_USER_PROFILES[userID ?? 0];

  const [scheduleIsShown, setScheduleIsShown] = useState(false);

  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedAkcruBadgeAkcruit, setSelectedAkcruBadgeAkcruit] =
    useState('');
  const [selectedAkcruBadgeGuardian, setSelectedAkcruBadgeGuardian] =
    useState('');
  const [selectedAkcruBadgeHero, setSelectedAkcruBadgeHero] = useState('');
  const [selectedAkcruBadgeSuperHero, setSelectedAkcruBadgeSuperHero] =
    useState('');
  const [selectedUserPicture, setSelectedUserPicture] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState('');

  const handlePressMIT = (
    userID,
    userName,
    akcruBadge,
    userPicture,
    influencer,
  ) => {
    setScheduleIsShown(true);
    setSelectedUserName(userName);
    setSelectedAkcruBadgeAkcruit(akcruBadge.akcruit);
    setSelectedAkcruBadgeGuardian(akcruBadge.guardian);
    setSelectedAkcruBadgeHero(akcruBadge.hero);
    setSelectedAkcruBadgeSuperHero(akcruBadge.superhero);
    setSelectedUserPicture(userPicture);
    setSelectedInfluencer(influencer);
    // Add your logic here to handle the onPress1 action
    // You can use the userID parameter or any other data from the item

    console.log('Item with userID', userID, userName, 'pressed!');
  };

  const truncatedstatus =
    status.length > MAX_STATUS_LENGTH
      ? status.slice(0, MAX_STATUS_LENGTH) + '...'
      : status;

  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View style={{zIndex: 20}}>
          <Header />
        </View>
        <ImageBackground
          source={{uri: digitalpass}}
          resizeMode="cover"
          style={{height: SIZES.ScreenHeight / 3.7, marginTop: -60}}>
          <LinearGradient
            // Digitalpass Linear Gradient overlay
            colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: SIZES.ScreenHeight / 3.7,
            }}
          />
          <View style={{marginTop: 60, marginHorizontal: 15, marginBottom: 10}}>
            <TouchableOpacity onPress={() => navigation.pop()}>
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
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',

              marginHorizontal: 15,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View style={{marginRight: 8}}>
                <Pressable
                  onPress={() => {
                    navigation.navigate('ViewUserDetailScreen', {
                      userID,
                    });
                    handlePressMIT(
                      userID,
                      userName,
                      akcruBadge,
                      userPicture,
                      influencer,
                    );
                  }}>
                  <Avatar
                    rounded
                    size={70}
                    source={{
                      uri: userPicture,
                    }}
                    avatarStyle={{
                      borderWidth: 2,
                      borderColor: avatarbordercolor,
                    }}
                  />
                </Pressable>

                <View />

                {!privateaccount ? (
                  online ? (
                    <View
                      style={{
                        backgroundColor: 'green',
                        height: 12,
                        width: 12,
                        borderRadius: 8,
                        position: 'absolute',
                        right: 8,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        backgroundColor: 'red',
                        height: 12,
                        width: 12,
                        borderRadius: 8,
                        position: 'absolute',
                        right: 8,
                      }}
                    />
                  )
                ) : null}
              </View>
              <View style={{width: SIZES.ScreenWidth / 2.5}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{...FONTS.Title2}}>{userName}</Text>
                  {influencer && (
                    <Icon
                      name="ribbon"
                      type="ionicon"
                      color={COLORS.AKCRUBLUE}
                      size={20}
                      style={{marginLeft: 5}}
                    />
                  )}
                </View>

                {akcruBadge.akcruit && (
                  <View>
                    <AkcruLevels.AkcruBadgeAkcruit />
                  </View>
                )}
                {akcruBadge.guardian && (
                  <View>
                    <AkcruLevels.AkcruBadgeGuardian />
                  </View>
                )}
                {akcruBadge.hero && (
                  <View>
                    <AkcruLevels.AkcruBadgeHero />
                  </View>
                )}
                {akcruBadge.superhero && (
                  <View>
                    <AkcruLevels.AkcruBadgeSuperHero />
                  </View>
                )}

                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      color: COLORS.AKCRUBLUE,
                      fontSize: 12,
                    }}>
                    Status:
                  </Text>

                  {privateaccount ? (
                    <View>
                      <Text
                        style={{
                          ...FONTS.Title2,
                          color: COLORS.DARKGREY,
                          fontSize: 12,
                          marginLeft: 8,
                        }}>
                        Private
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text
                        style={{
                          ...FONTS.Title2,
                          color: COLORS.DARKGREY,
                          fontSize: 12,
                          marginLeft: 8,
                        }}>
                        {truncatedstatus}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity>
                  <Text
                    style={{
                      ...FONTS.Title2,
                      color: COLORS.MIDORANGE,
                      fontSize: 12,
                      marginTop: 5,
                    }}>
                    Block {userName}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                height: 50,
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  borderLeftWidth: 1,
                  borderColor: COLORS.DARKGREY,
                  paddingLeft: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('SendMITViewUser', {
                      userID,
                    });
                    handlePressMIT(
                      userID,
                      userName,
                      akcruBadge,
                      userPicture,
                      influencer,
                    );
                  }}>
                  <Image
                    source={imageindex.MITticket}
                    style={{width: 55, height: 40}}
                  />
                </TouchableOpacity>

                <Text
                  style={{
                    ...FONTS.Title2,
                    color: COLORS.LIGHTGREY,
                    fontSize: 12,
                    marginLeft: 8,
                  }}>
                  Send a MIT
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View
          style={{
            marginTop: -15,
            marginHorizontal: 15,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 100,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{...FONTS.Title3, fontSize: 14}}>
              {userFollowerAmount}
            </Text>
            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>
              Followers
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity>
              <View style={styles.cruinvitebutton}>
                <Text style={{...FONTS.Title2}}>CRU INVITE</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={styles.followbutton}>
                <Text style={{...FONTS.Title2}}>FOLLOW</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {privateaccount ? (
          <View
            style={{marginHorizontal: 15, marginTop: SIZES.ScreenHeight / 7}}>
            <Text
              style={{...FONTS.Title3, textAlign: 'center', marginBottom: 20}}>
              This account is private
            </Text>
            <Icon
              name="lock"
              type="material-community"
              color={COLORS.LIGHTGREY}
              size={65}
            />
          </View>
        ) : (
          <View>
            <View style={{marginHorizontal: 15}}>
              <Text
                style={{
                  ...FONTS.Title2,
                  color: COLORS.LIGHTGREY,
                  fontSize: 12,
                }}>
                {userDesc}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  ...FONTS.Title2,
                  marginTop: 25,
                  marginBottom: 20,
                  textAlign: 'center',
                  fontSize: 14,
                  textDecorationLine: 'underline',
                }}>
                ARCHETYPE
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 15,
                }}>
                <View>
                  <Image
                    source={imageindex.GraphPurp}
                    style={{width: 190, height: 100}}
                    resizeMode="contain"
                  />
                  <Image source={imageindex.GraphMetric} />
                </View>
                <View style={{alignItems: 'center'}}>
                  <Image
                    source={imageindex.TurquoiseDog}
                    style={{width: 125, height: 90}}
                    resizeMode="contain"
                  />
                  <Text style={{...FONTS.Title2, fontSize: 12}}>
                    {' '}
                    Blood and Bullets
                  </Text>
                </View>
              </View>
              <View
                style={{
                  borderBottomWidth: 1.5,
                  borderColor: COLORS.DARKERGREY,
                  marginTop: 20,
                  marginBottom: 10,
                  marginHorizontal: 15,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 15,
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    ...FONTS.Title2,
                    marginTop: 10,
                    marginBottom: 20,
                    textAlign: 'center',
                    fontSize: 14,
                  }}>
                  {userName} Watchlist
                </Text>
                <View style={{flexDirection: 'row', marginLeft: 15}}>
                  <View style={{marginRight: 25}}>
                    <TouchableOpacity>
                      <Icon
                        name="thumb-up-outline"
                        type="material-community"
                        color={'green'}
                        size={SIZES.MedIcon}
                      />
                    </TouchableOpacity>
                    <Text style={{...FONTS.Title2}}>I Like</Text>
                  </View>
                  <View>
                    <TouchableOpacity>
                      <Icon
                        name="thumb-down-outline"
                        type="material-community"
                        color={'red'}
                        size={SIZES.MedIcon}
                      />
                    </TouchableOpacity>
                    <Text style={{...FONTS.Title2}}>Nah</Text>
                  </View>
                </View>
              </View>

              <View style={{marginBottom: 75, marginTop: -20}}>
                <BasicListCategories Akcru_Content={ViewUserwatchlist} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
