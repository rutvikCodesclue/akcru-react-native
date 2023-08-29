import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles';
import CruInviteCard from '../../../components/CruInviteCard';
import { JENNY_INVITES } from '../../../../assets/constants/Mockusers';
import { useFocusEffect } from '@react-navigation/native';
import { getCRUInvites } from '../../../lib/api/cru.lib';
import { ICruInvite } from '../../../../types';


const UserProfileCruInvites = () => {
  const [invites, setInvites] = React.useState<ICruInvite[] | []>([]);

  useFocusEffect(
    React.useCallback(() => {
      // This code will run when the screen comes into focus (e.g., when navigating to this screen)
      // console.log('User Profile Cru Invite Tab focused');
      getCRUInvites({}).then((invites) => {
        // console.log("invites: ", JSON.stringify(invites, null, 3));
        setInvites(invites);
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
        <View style={{ marginBottom: 75 }}>
          {invites.map((item) => (
            <View
              key={item.id}
              style={{ marginHorizontal: 15, marginBottom: 10 }}
            >
              <CruInviteCard
                cruInviteID={item.id}
                inviteeName={`${item.cru.creator.firstName} ${item.cru.creator.lastName}`}
                inviteePicture={item.cru.creator.profilePicture ?? undefined} 
                inviteDate={item.createdAt}
              />
            </View>
          ))}
          {/* {JENNY_INVITES.map((item) => (
            <View
              key={item.MITID}
              style={{ marginHorizontal: 15, marginBottom: 10 }}
            >
              <CruInviteCard
                inviteeName={item.inviteeName}
                inviteePicture={item.inviteePicture}
                inviteDate={item.inviteDate}
                cruInviteID={undefined}
              />
            </View>
          ))} */}
        </View>
      </ScrollView>
    </View>
  );
}

export default UserProfileCruInvites
