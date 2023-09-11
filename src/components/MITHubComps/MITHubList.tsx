import {  View, FlatList, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import MITHubCard from './MITHubCard'
import { JENNY_INVITES } from '../../../assets/constants/Mockusers'
import { UserProfileStackParams } from '../../navigation/UserProfileStack'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { getMyMITInvites, getMyMITs } from '../../lib/api/mit.lib'
import { ICruInvite, IMITInvite } from '../../../types'
import MITInviteHubCard from './MITInviteHubCard'
import { FONTS } from '../../../assets/constants/theme'
import CruInviteCard from '../CruInviteCard'
import { getCRUInvites } from '../../lib/api/cru.lib'


const MITHubList = () => {
  const [currentMITS, setCurrentMITS] = useState< IMITInvite[] | []>([]);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);

const navigation =
  useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  useFocusEffect(
    React.useCallback(() => {
        // This code will run when the screen comes into focus (e.g., when navigating to this screen)
        getMyMITs().then((res) => {
          if (res) {
            setCurrentMITS(res);
          }
        });
        return () => {
          // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
        };
    }, [])
  );

  useFocusEffect(
      React.useCallback(() => {
          // This code will run when the screen comes into focus (e.g., when navigating to this screen)
          // console.log('User Profile Cru Invite Tab focused');
          getCRUInvites({pending: true}).then(invites => {
              // console.log("cru invites: ", JSON.stringify(invites, null, 3));
              setInvites(invites);

              // get the MITS for the user and merge
              getMyMITInvites({pending: true}).then(mitInvites => {
                  // console.log("mitInvites: ", JSON.stringify(mitInvites, null, 3));

                  if (mitInvites) {
                      setInvites(prevInvites => [...prevInvites, ...mitInvites]);
                      // sort invites by date (newest to oldest) and set state
                      setInvites(prevInvites =>
                          prevInvites.sort((a, b) => {
                              if (a.createdAt < b.createdAt) {
                                  return 1;
                              }
                              if (a.createdAt > b.createdAt) {
                                  return -1;
                              }
                              return 0;
                          }),
                      );
                  }

                  setIsLoaded(true);
              });
          });

          return () => {
              // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
              // console.log('User Profile Cru Invite Tab unfocused');
          };
      }, []),
  );

  return (
      <View style={{marginTop: 10, marginBottom: 75}}>
          <View>
              {!isLoaded && <Text style={{...FONTS.Title1, textAlign: 'center'}}>Loading...</Text>}
              {isLoaded && (
                  <View style={{marginVertical: 5}}>
                      {invites.length > 0 ? (
                          invites.map(item => {
                              if (item instanceof Object && 'cru' in item) {
                              } else {
                                  // FIXME: implement MIT invite card
                                  return (
                                      <View key={item.id} style={{marginHorizontal: 15, marginBottom: 10}}>
                                          <MITInviteHubCard
                                              MITInviteID={item.id}
                                              movie={item.movie}
                                              creator={item.creator}
                                              // inviteeName={`${item.creator.firstName} ${item.creator.lastName}`}
                                              // inviteePicture={item.creator.profilePicture ?? undefined}
                                              inviteDate={item.createdAt}
                                              akcruBadge={item.invitee.badge}
                                              onPress={() =>
                                                  navigation.navigate('ChooseMITScreen', {
                                                      MITID: item.id,
                                                      movie: item.movie,
                                                      creator: item.creator,
                                                      inviteDate: item.createdAt,
                                                      akcruBadge: item.invitee.badge,
                                                  })
                                              }
                                          />
                                      </View>
                                  );
                              }
                          })
                      ) : (
                          // FIXME: implement no invites empty state
                          <Text style={{...FONTS.Title1, textAlign: 'center'}}>No Invites</Text>
                      )}
                  </View>
              )}
          </View>
          <FlatList
              data={currentMITS}
              horizontal={false}
              scrollEnabled={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => (
                  <View style={{marginVertical: 5, marginHorizontal: 15}}>
                      <MITHubCard
                          inviteeName={
                              item.invitee.firstName ? `${item.invitee.firstName}` : `${item.invitee.username}`
                          }
                          inviteePicture={item.invitee.profilePicture ?? ''}
                          MITDate={item.startDate}
                          MITMoviechoice={item.movie.title}
                          scheduleDate={item.startDate}
                          scheduleTime={item.startDate}
                          onPressIn={() =>
                              navigation.navigate('ViewUserScreen', {
                                  userID: item.inviteeId,
                              })
                          }
                          // influencer={item.influencer}
                          akcruBadge={item.invitee.badge}
                      />
                  </View>
              )}
          />
      </View>
  );
}

export default MITHubList