import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import CruInviteCard from '../../../components/CruInviteCard';
import { JENNY_INVITES } from '../../../../assets/constants/Mockusers';


const UserProfileCruInvites = () => {
  return (
    <View>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>CRU INVITES</Text>
        </View>
        <View style={{ marginBottom: 75 }}>
          {JENNY_INVITES.map((item) => (
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
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default UserProfileCruInvites
