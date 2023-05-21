import { View, Text, Image, TouchableOpacity, ScrollView} from 'react-native'
import React from 'react';
import imageindex from '../../../assets/images/imageindex';
import { SIZES, COLORS, FONTS } from '../../../constants';
import { Header } from '../../components';

const CruChewScreen = () => {
  return (
    <View>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>
        <View style={{ marginTop: -70 }}>
          <View>
            <Image
              source={imageindex.EatingPopcorn}
              resizeMode="cover"
              style={{
                width: SIZES.ScreenWidth,
                height: SIZES.ScreenHeight / 1.2,
              }}
            />
          </View>

          <View
            style={{
              alignItems: "center",
              position: "absolute",
              left: 0,
              right: 0,
              top: 225,
              zIndex: 100
            }}
          >
            <Image
              source={imageindex.AkcruLogo}
              style={{
                width: 125,
                height: 70,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                ...FONTS.Title2White,
                textAlign: "center",
                marginHorizontal: 25,
              }}
            >
              Welcome to the Akcru's Cru Chew, where you can order from your
              favorite restaurant and have it delivered to your door while
              you're enjoying your favorite content.
            </Text>
            <TouchableOpacity>
              <Image
                source={imageindex.CruChew3}
                style={{
                  width: 200,
                  height: 200,
    
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default CruChewScreen