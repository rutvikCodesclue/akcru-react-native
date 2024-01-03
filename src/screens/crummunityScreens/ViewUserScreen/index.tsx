import {
  Text,
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView
} from 'react-native';
import styles from './styles';
import React, {useState} from 'react';
import {FONTS, COLORS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Avatar } from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import { Akcru_Content } from '../../../../assets/constants/ListData';
import { findAUser, followUser, getUserFollowing, unfollowUser } from '../../../lib/api/user.lib';
import { IUserProfile } from '../../../../types';
import { selectAvatarBorderColor } from '../../../util/util';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientTabsParams } from '../../../navigation/ClientTabNavigator';
import { createACRUInvite } from '../../../lib/api/cru.lib';
import { ClientStackParams } from '../../../navigation/ClientStack';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import ViewUserOptionModal from '../../../components/ViewUserOptionModal/ViewUserOptionModal';
import ComfirmationModal from '../../../components/ConfirmationModal';
import useAuthStore from '../../../stores/auth.store';

type ViewUserScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  'ViewUserScreen'
>;

type ViewUserScreenRouteProp = RouteProp<
  UserProfileStackParams,
  'ViewUserScreen'
>;

type Props = {
  navigation: ViewUserScreenNavigationProp;
  route: ViewUserScreenRouteProp;
};


const ViewUserwatchlist = Akcru_Content[6];

const MAX_STATUS_LENGTH = 17; // Maximum number of characters for the username

export default function ViewUserScreen({route, navigation}: Props) {

    const [follow, setFollow] = useState(false);
    //Get current user
    const currentuser = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();
    const userID: string | undefined = route.params?.userID ?? null;
    const id: string | undefined = route.params?.id;
    const userprofile: string | undefined = route.params?.userName ?? null;

    const userId = route.params?.userId;

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);
    

useFocusEffect(
    React.useCallback(() => {
        // This code will run when the screen comes into focus (e.g., when navigating to this screen)
        console.log('ViewUserScreen focused [ViewUserScreen]');
        hydrateUser();

        return () => {
            // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
            console.log('ViewUserScreen Screen unfocused [ViewUserScreen]');
        };
    }, []),
);

useFocusEffect(
    React.useCallback(() => {
        //Find and set the viewed user
        findAUser({id: userID}).then(user => {
            setUser(user);
        });

        getUserFollowing().then(response => {
            if (response && response.success) {
                const isFollowing = response.following.some(followedUser => followedUser.id === userID);
                setFollow(isFollowing);
            } else {
                setFollow(false);
            }
        });

        return () => {
            // Cleanup code if needed
        };
    }, [userID, currentuser?.id]),
);



    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCruInviteSent, setShowCruInviteSent] = useState(false);

  const [userOptionModal, setUserOptionModal] = useState(false);
  
    const handleSendCruInvite = async () => {
        try {
            // Call the createACRUInvite function with the username of the user you want to invite
            const response = await createACRUInvite({
                username: user.username, // Replace with the actual username
            });

            // Check the response or handle success/failure accordingly
            if (response) {
                // The invite was sent successfully
                setShowCruInviteSent(true);
                setShowConfirmationModal(false);

                // Start a timer to hide the modal after a certain duration
                setTimeout(() => {
                    setShowCruInviteSent(false);
                }, 4000); // 4000 milliseconds = 4 seconds
            }
        } catch (error) {
            // Handle any errors that may occur during the invite creation
            console.error(error);
        }
    };

console.log('ViewUserScreen render', {follow});

const handleFollowPress = async () => {
    if (follow) {
        const success = await unfollowUser({userId: userID});
        if (success) {
            setFollow(false);
            setUserOptionModal(false);
        }
    } else {
        const success = await followUser({userId: userID});
        if (success) {
            setFollow(true);
            setUserOptionModal(false);
        }
    }
};

  return (
      <TabContainer>
          <SafeAreaView>
              <ScrollView stickyHeaderIndices={[0]}>
                  <View style={{zIndex: 20}}>
                      <Header />
                  </View>
                  <ImageBackground
                      //   source={{uri: digitalpass ?? undefined}}
                      source={{uri: undefined}}
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
                      <View
                          style={{
                              marginTop: 60,
                              marginHorizontal: 15,
                              marginBottom: 10,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                          }}>
                          <TouchableOpacity onPress={() => navigation.pop()}>
                              <View
                                  style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                  }}>
                                  <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                  <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                              </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setUserOptionModal(true)}>
                              <View
                                  style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                  }}>
                                  <Icon name="ellipsis-vertical" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                              </View>
                          </TouchableOpacity>
                      </View>

                      <View
                          style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginHorizontal: 15,
                          }}>
                          <View style={{flexDirection: 'row'}}>
                              <View style={{marginRight: 8}}>
                                  <Pressable
                                      onPress={() => {
                                          console.log(
                                              'Navigating to ViewUserDetailScreen with userID:',
                                              user?.username,
                                              user?.id,
                                          );
                                          navigation.navigate('ViewUserDetailScreen', {
                                              userID: user?.id,
                                          });
                                      }}>
                                      <HexAvatar
                                          source={{uri: user?.profilePicture}}
                                          size={60}
                                          bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                      />
                                  </Pressable>

                                  <View />

                                  {/* {!user?.private ? (
                                  true ? (
                                //   online ? (
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
                              ) : null} */}
                              </View>
                              <View style={{width: SIZES.ScreenWidth / 2.5}}>
                                  <View style={{flexDirection: 'row'}}>
                                      <Text style={{...FONTS.Title2, fontSize: 12}}>{user?.username}</Text>
                                      {/* {
                                  true && (
                                //   influencer && (
                                      <Icon
                                          name="ribbon"
                                          type="ionicon"
                                          color={COLORS.AKCRUBLUE}
                                          size={20}
                                          style={{marginLeft: 5}}
                                      />
                                  )} */}
                                  </View>
                                  {user?.firstName && (
                                      <Text style={{...FONTS.paragraph1, fontSize: 12, color: COLORS.LIGHTGREY}}>
                                          {user?.firstName ? user.firstName : ''}
                                      </Text>
                                  )}
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
                                      style={{alignItems: 'center'}}
                                      onPress={() => {
                                          navigation.navigate('SendMITViewUser', {
                                              userID,
                                          });
                                      }}>
                                      <Image source={imageindex.MITticket} style={{height: 40}} />
                                      <Text style={{color: 'white', fontSize: 10}}>Send User a MIT</Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </View>
                  </ImageBackground>
                  <View
                      style={{
                          marginTop: -30,
                          marginHorizontal: 15,
                          flexDirection: 'row',
                          alignItems: 'center',
                      }}>
                      <Pressable
                          onPress={() => navigation.navigate('ViewUserFollowList', {
                                              userID: user?.id,
                                          })}
                          style={{
                              width: 100,
                              height: 30,
                              justifyContent: 'center',
                              alignItems: 'center',
                          }}>
                          <Text style={{...FONTS.Title3, fontSize: 14}}>{user?.followerCount}</Text>
                          <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Followers</Text>
                      </Pressable>
                      <View style={{flexDirection: 'row'}}>
                          <TouchableOpacity onPress={() => setShowConfirmationModal(true)}>
                              <View style={styles.cruinvitebutton}>
                                  <Text style={{...FONTS.Title2}}>CRU INVITE</Text>
                              </View>
                          </TouchableOpacity>
                          {/* Cru Invite Confirmation Modal */}
                          <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                              <ComfirmationModal
                                  confirmationText={`Are you sure you want to send "${user?.username}" a Cru invite?`}
                                  onPressYes={handleSendCruInvite}
                                  onPressNo={() => setShowConfirmationModal(false)}
                              />
                          </Modal>
                          {/* Cru Invite Sent Modal */}
                          <Modal animationType="fade" transparent={true} visible={showCruInviteSent}>
                              <View
                                  style={{
                                      flex: 1,
                                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                  }}>
                                  <View
                                      style={{
                                          backgroundColor: COLORS.AKCRUBACKGROUND,
                                          padding: 20,
                                          borderRadius: 10,
                                          alignItems: 'center',
                                          marginHorizontal: 15,
                                      }}>
                                      <Text
                                          style={{
                                              ...FONTS.Title3,
                                              marginBottom: 10,
                                              textAlign: 'center',
                                          }}>
                                          {`You have sent "${user?.username}" a Cru invite! You will be notified if they ACCEPT or DECLINE the invite`}
                                      </Text>
                                  </View>
                              </View>
                          </Modal>

                          <Modal visible={userOptionModal} transparent={true} animationType="slide">
                              <ViewUserOptionModal
                                  username={user?.username}
                                  closeModal={() => setUserOptionModal(false)}
                                  blockUser={() => {
                                      ('');
                                  }}
                                  reportUser={() => {
                                      ('');
                                  }}
                                  followUser={handleFollowPress}
                                  followToggleIcon={follow ? 'person-subtract' : 'person-add'}
                                  followIconType = {"ionicon"}
                                  followToggleText={follow ? 'Unfollow' : 'Follow'}
                                  cruInviteUser={() => setShowConfirmationModal(true)}
                              />
                          </Modal>

                          <Pressable onPress={handleFollowPress} style={{width: '100%'}}>
                              <View style={follow ? styles.unfollowbutton : styles.followbutton}>
                                  <Text style={{...FONTS.Title2}}>{follow ? 'UNFOLLOW' : 'FOLLOW'}</Text>
                              </View>
                          </Pressable>
                      </View>
                  </View>
                  {user?.private ? (
                      <View style={{marginHorizontal: 15, marginTop: SIZES.ScreenHeight / 7}}>
                          <Text style={{...FONTS.Title3, textAlign: 'center', marginBottom: 20}}>
                              This account is private
                          </Text>
                          <Icon name="lock" type="material-community" color={COLORS.LIGHTGREY} size={65} />
                      </View>
                  ) : (
                      <View>
                          <View style={{marginHorizontal: 15, paddingTop: 20}}>
                              <Text
                                  style={{
                                      ...FONTS.Title2,
                                      color: COLORS.LIGHTGREY,
                                      fontSize: 12,
                                  }}>
                                  {user?.description}
                              </Text>
                          </View>
                          <View>
                              <Text style={styles.desctext}>ARCHETYPE</Text>

                              <View
                                  style={{
                                      paddingTop: 10,
                                      flexDirection: 'row',
                                      justifyContent: 'center',
                                      paddingHorizontal: 10,
                                  }}>
                                  <View style={{paddingBottom: 10, paddingRight: 10}}>
                                      <Pressable onPress={toggleModal}>
                                          <Image
                                              source={imageindex.SpaceCrimePuzzler}
                                              style={{
                                                  width: SIZES.ScreenWidth / 2.2,
                                                  height: SIZES.ScreenWidth / 2.2,
                                                  borderRadius: 5,
                                              }}
                                          />
                                      </Pressable>
                                  </View>
                                  <View style={{flex: 1}}>
                                      <Text style={{...FONTS.Title2, paddingBottom: 5}}>Action Junkie</Text>
                                      <View style={{flexDirection: 'row', paddingBottom: 5}}>
                                          <Text style={styles.drawfonttag}>Thriller</Text>
                                          <Text style={styles.drawfonttag}> Adventure</Text>
                                      </View>
                                      <Text style={{...FONTS.Title2, fontSize: 12}}>
                                          These individual appreciate movies that combine suspenseful and thrilling
                                          elements with adrenaline-pumping adventures. Experiencing intense suspense and
                                          daring escapades is where they find their cinematic excitement.
                                      </Text>
                                  </View>
                              </View>

                              {/* Create a modal to display the enlarged image */}
                              <Modal visible={isModalVisible} animationType="fade" transparent={true}>
                                  <View
                                      style={{
                                          flex: 1,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                      }}>
                                      {/* Display the enlarged image */}
                                      <Image
                                          source={imageindex.SpaceCrimePuzzler}
                                          style={{
                                              width: SIZES.ScreenWidth / 1.2, // Adjust the size as needed
                                              height: SIZES.ScreenWidth / 1.2, // Adjust the size as needed
                                              borderRadius: 5,
                                          }}
                                      />
                                      <TouchableOpacity onPress={toggleModal}>
                                          <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE}}>Close</Text>
                                      </TouchableOpacity>
                                  </View>
                              </Modal>

                              {/* <View style={styles.seperator} />
                          <View style={styles.watchlistcontainer}>
                              <Text style={styles.watchlisttext}>{user?.username} Watchlist</Text>
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
                          </View> */}
                          </View>
                      </View>
                  )}
              </ScrollView>
          </SafeAreaView>
      </TabContainer>
  );
}
