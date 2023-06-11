import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { FONTS, COLORS } from "../../../../constants";
import { CruInviteCard } from '../../../components';
import { JENNY_INVITES } from '../../../../constants/Mockusers';


const UserProfileCruInvites = () => {
  return (
    <View>
      <ScrollView>
        <View>
          <Text style={styles.titleText1}>CRU INVITES</Text>
        </View>
        <View style={{marginBottom: 75}}>
          {JENNY_INVITES.map((item) => (
            <View
              key={item.cruInviteID}
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

const styles = StyleSheet.create({
  titleText1: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  paragraphText: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
  },
});