import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles';
import CruInviteCard from '../../../components/CruInviteCard';
import { JENNY_INVITES } from '../../../../assets/constants/Mockusers';
import { useFocusEffect } from '@react-navigation/native';
import { getCRUInvites } from '../../../lib/api/cru.lib';
import { ICruInvite, IMITInvite } from '../../../../types';
import { FONTS } from '../../../../assets/constants';
import { getMyMITInvites } from '../../../lib/api/mit.lib';
import MITInviteCard from '../../../components/MITInviteCard';


const UserProfileCruInvites = () => {
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  const [invites, setInvites] = React.useState<(ICruInvite | IMITInvite)[] | []>([]);

  useFocusEffect(
    React.useCallback(() => {
      // This code will run when the screen comes into focus (e.g., when navigating to this screen)
      // console.log('User Profile Cru Invite Tab focused');
      getCRUInvites({ pending: true }).then((invites) => {
        // console.log("cru invites: ", JSON.stringify(invites, null, 3));
        setInvites(invites);

        // get the MITS for the user and merge 
        getMyMITInvites({ pending: true }).then((mitInvites) => {
          // console.log("mitInvites: ", JSON.stringify(mitInvites, null, 3));
          
          if (mitInvites) {
            setInvites((prevInvites) => [...prevInvites, ...mitInvites]);
            // sort invites by date (newest to oldest) and set state
            setInvites((prevInvites) => prevInvites.sort((a, b) => {
              if (a.createdAt < b.createdAt) {
                return 1;
              }
              if (a.createdAt > b.createdAt) {
                return -1;
              }
              return 0;
            }));
          }

          setIsLoaded(true);
        })
      });

      return () => {
          // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
          // console.log('User Profile Cru Invite Tab unfocused');
      };
    }, [])
  );

  return (
    <View>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>CRU INVITES</Text>
        </View>
        {!isLoaded && <Text style={{...FONTS.Title1, textAlign: 'center'}}>Loading...</Text>}
        {isLoaded && 
          <View style={{ marginBottom: 75 }}>
            {invites.length > 0 ? invites.map((item) => 
            {
              if (item instanceof Object && 'cru' in item) {
                return (
                  <View
                    key={item.id}
                    style={{ marginHorizontal: 15, marginBottom: 10 }}
                  >
                    <CruInviteCard
                      cruInviteID={item.id}
                      inviteeName={`${item.cru.creator.firstName} ${item.cru.creator.lastName} ${item.id}`}
                      inviteePicture={item.cru.creator.profilePicture ?? undefined} 
                      inviteDate={item.createdAt}
                    />
                  </View>
                )
              } else {
                // FIXME: implement MIT invite card
                return (
                  <View
                    key={item.id}
                    style={{ marginHorizontal: 15, marginBottom: 10 }}
                  >
                    <MITInviteCard
                      MITInviteID={item.id}
                      movie={item.movie}
                      creator={item.creator}
                      // inviteeName={`${item.creator.firstName} ${item.creator.lastName}`}
                      // inviteePicture={item.creator.profilePicture ?? undefined} 
                      inviteDate={item.createdAt}
                    />
                  </View>
                )
              }
          }
            ) : 
            // FIXME: implement no invites empty state
            <Text style={{...FONTS.Title1, textAlign: 'center'}}>No Invites</Text>}
          </View>
        }
      </ScrollView>
    </View>
  );
}

export default UserProfileCruInvites
