import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS, FONTS } from '../../../assets/constants/theme';

type ConfirmationModalProps = {
    onPressYes: () => void;
    onPressNo: () => void;
    confirmationText: string;
}

const ComfirmationModal = ({confirmationText, onPressNo, onPressYes}: ConfirmationModalProps) => {
  return (
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
                  {confirmationText}
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%'}}>
                  <TouchableOpacity
                      style={{
                          backgroundColor: COLORS.PURPLE,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 5,
                      }}
                      onPress={onPressYes}>
                      <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={{
                          backgroundColor: COLORS.DARKAKCRUBLUE,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          marginRight: 10,
                          borderRadius: 5,
                      }}
                      onPress={onPressNo}>
                      <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>No</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </View>
  );
}

export default ComfirmationModal;