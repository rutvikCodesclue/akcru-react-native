import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';
import UserCruChatCard from '../../../components/UserCruChatCard';
import AkcruButtons from '../../../components/akcruButtons';
import styles from './styles';


const UserCruChat = () => {
  return (
      <View style={styles.container}>
          <View>
              {FAKE_USER_PROFILES.map(item => (
                  <View key={item.userID} style={{marginBottom: 10}}>
                      <UserCruChatCard
                          userPicture={item.userPicture}
                          userName={item.userName}
                          CruChatDate={item.CruChatDate}
                          CruChatTime={item.CruChatTime}
                          CRUChat={item.CRUChat}
                          userID={item.userID}
                          avatarbordercolor={item.avatarbordercolor}
                      />
                  </View>
              ))}
          </View>
          <View style={{marginBottom: 75}}>
              <View style={styles.input}>
                  <TextInput
                      placeholder={'placeholder'}
                      placeholderTextColor={'transparent'}
                      style={styles.textinput}
                  />

                  <AkcruButtons.XSmallButton btnname={'SEND'} onPress={function (): void {}} color="" />
              </View>
          </View>
      </View>
  );
}

export default UserCruChat