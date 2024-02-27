import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { Icon } from '@rneui/base';
import { COLORS, FONTS } from '../../../assets/constants/theme';
import styles from './styles';

type ViewUserOptionModalProps = {
    closeModal: () => void;
    username?: string;
    blockUser: () => void;
    reportUser: () => void;
    followUser: () => void;
    cruInviteUser: () => void;
    followToggleText: string;
    followToggleIcon: string;
    followIconType: string;

  
    blockToggleText: string; 
};

const ViewUserOptionModal = ({blockToggleText, followIconType, followToggleIcon, followToggleText,closeModal, username, blockUser, reportUser, followUser, cruInviteUser}: ViewUserOptionModalProps) => {
  return (
      <Pressable style={styles.postoptioncontainer} onPress={closeModal}>
          <View style={styles.postoptionsmodal}>
              {/* <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                  <Icon name="eye" type="ionicon" color={COLORS.PURPLE} size={20} style={{marginLeft: 5}} />
                  <Text style={{...FONTS.Title2, paddingLeft: 12}}>{username} is watching </Text>
              </Pressable> */}
              <Pressable
                  onPress={blockUser}
                  style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                  <Icon name="hand-left" type="ionicon" color={COLORS.MIDORANGE} size={20} style={{marginLeft: 5}} />
                  <Text style={{...FONTS.Title2, paddingLeft: 12}}>
                     {blockToggleText} {username}
                  </Text>
              </Pressable>
              <Pressable onPress={reportUser} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                  <Icon name="flag" type="ionicon" color={COLORS.MIDORANGE} size={20} style={{marginLeft: 5}} />
                  <Text style={{...FONTS.Title2, paddingLeft: 12}}>Report {username}</Text>
              </Pressable>
              <Pressable onPress={followUser}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                      <Icon
                          name="person"
                          type={followIconType}
                          color={COLORS.MIDORANGE}
                          size={20}
                          style={{marginLeft: 5}}
                      />
                      <Text style={{...FONTS.Title2, paddingLeft: 12}}>
                          {followToggleText} {username}
                      </Text>
                  </View>
              </Pressable>
              <Pressable onPress={cruInviteUser} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                  <Icon
                      name="people-circle"
                      type="ionicon"
                      color={COLORS.MIDORANGE}
                      size={20}
                      style={{marginLeft: 5}}
                  />
                  <Text style={{...FONTS.Title2, paddingLeft: 12}}>Send Cru Invite to {username}</Text>
              </Pressable>
          </View>
      </Pressable>
  );
}

export default ViewUserOptionModal