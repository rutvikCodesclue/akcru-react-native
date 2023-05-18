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
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", margin: 10 }}>
        <View style={{ marginRight: 10 }}>
          <Avatar
            source={{
              uri: inviteePicture
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
          <View style={{ flexDirection: "row", flexWrap: "wrap", width: 290 }}>
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
                  backgroundColor: "green",
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
                  backgroundColor: "red",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text style={{ ...FONTS.Title2 }}>DECLINE</Text>
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
    color: COLORS.AKCRUBLUE,
    fontSize: 12,
  },
  paragraphText2: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE,
    fontSize: 12,
    marginRight: 5
  },
  paragraphText3: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE,
    fontSize: 12,
    marginLeft: 5
  },
});