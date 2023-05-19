import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Avatar } from '@rneui/base';
import { COLORS, FONTS } from '../../constants';


type CruInviteCardProp = {
    inviteeName: string;
    inviteePicture: string;
    inviteDate: string;
    cruInviteID: any;
}


const CruInviteCard = ({
    inviteeName,
    inviteePicture,
    inviteDate,
    cruInviteID

}: CruInviteCardProp) => {
  return (
    <View
      style={{
        backgroundColor: "#1C202A",
        borderColor: "#1C202A",
        borderWidth: 0.5,
        borderRadius: 5,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", margin: 10 }}>
        <View style={{ marginRight: 10 }}>
          <Avatar
            source={{
              uri: inviteePicture,
            }}
            size={50}
            rounded
            avatarStyle={{
              borderWidth: 2,
              borderColor: COLORS.AKCRUBLUE,
            }}
          />
        </View>
        <View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", width: 280 }}>
            <View>
              <Text style={styles.paragraphText2}>{inviteeName}</Text>
            </View>

            <Text style={styles.paragraphText}>
              has sent you a CRU Invite on
            </Text>
            <View>
              <Text style={styles.paragraphText3}>{inviteDate}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity>
              <View
                style={{
                  width: 125,
                  height: 30,
                  backgroundColor: COLORS.AKCRUBLUE,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                  marginRight: 10,
                }}
              >
                <Text style={{ ...FONTS.Title2 }}>ACCEPT</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <View
                style={{
                  width: 125,
                  height: 30,
                  backgroundColor: COLORS.CATPURPDRK,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text style={styles.declineButton}>DECLINE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CruInviteCard

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
    marginHorizontal: 5
  },
  paragraphText2: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE,
    fontSize: 12,
    
  },
  paragraphText3: {
    ...FONTS.Title2,
    color: COLORS.MIDORANGE,
    fontSize: 12,
   
  },
  declineButton: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE
  },
});