import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FONTS } from '../../../constants'
import { Rating } from '@rneui/base'

const WatchPartyTestScreen = () => {
  return (
    <View>
      <Text style={{ ...FONTS.Title2 }}>WatchPartyTestScreen</Text>
      <View>
        <Rating
          type="rocket"
          imageSize={9}
          ratingCount={20}
          readonly={true}
          startingValue={3}
          style={{ }}
        />
      </View>
    </View>
  );
}

export default WatchPartyTestScreen

const styles = StyleSheet.create({})