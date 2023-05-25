import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ScrollView,
  Image,
} from "react-native";
import React from "react";
import { SIZES, COLORS, FONTS } from "../../../constants";
import { Header, AkcruButtons } from "../../components";
import imageindex from "../../../assets/images/imageindex";

const PurchaseMITScreen = () => {
  return (
    <View>
      <ImageBackground
        source={{
          uri: "https://akcru.com/wp-content/uploads/2023/05/creepymit.png",
        }}
        resizeMode="cover"
        style={{ width: SIZES.ScreenWidth, height: SIZES.ScreenHeight }}
      >
        <ScrollView stickyHeaderIndices={[0]}>
          <View>
            <Header />
          </View>
          <View style={{marginBottom: 100}}>
            <Text style={{...FONTS.Title3, marginHorizontal: 15, marginVertical: 10}}>Create a date to watch a movie with someone outside of your CRU.</Text>
            <View style={styles.pricecontainer}>
              <Image source={imageindex.MIT2} style={styles.mitimage} />
              <View style={{ flexDirection: "row", marginVertical: 10 }}>
                <Text
                  style={{
                    ...FONTS.Title3,
                    fontSize: 20,
                    marginRight: 10,
                    color: COLORS.AKCRUBLUE,
                  }}
                >
                  10
                </Text>
                <Text style={{ ...FONTS.Title3, fontSize: 20 }}>
                  Movie Invite Tickets
                </Text>
              </View>
              <Text style={{ ...FONTS.Title2 }}>Save 150%</Text>
              <Text style={styles.mitprice}>$10.00</Text>
              <AkcruButtons.LrgButton
                btnname="PURCHASE"
                color={COLORS.CATPURPDRK}
                onPress={() => {}}
              />
            </View>
            <View style={styles.pricecontainer}>
              <Image source={imageindex.MIT1} style={styles.mitimage} />
              <View style={{ flexDirection: "row", marginVertical: 10 }}>
                <Text
                  style={{
                    ...FONTS.Title3,
                    fontSize: 20,
                    marginRight: 10,
                    color: COLORS.AKCRUBLUE,
                  }}
                >
                  6
                </Text>
                <Text style={{ ...FONTS.Title3, fontSize: 20 }}>
                  Movie Invite Tickets
                </Text>
              </View>
              <Text style={{ ...FONTS.Title2 }}>Save 66%</Text>
              <Text style={styles.mitprice}>$9.00</Text>
              <AkcruButtons.LrgButton
                btnname="PURCHASE"
                color={COLORS.CATPURPDRK}
                onPress={() => {}}
              />
            </View>
            <View style={styles.pricecontainer}>
              <Image source={imageindex.MIT3} style={styles.mitimage} />
              <View style={{ flexDirection: "row", marginVertical: 10 }}>
                <Text
                  style={{
                    ...FONTS.Title3,
                    fontSize: 20,
                    marginRight: 10,
                    color: COLORS.AKCRUBLUE,
                  }}
                >
                  4
                </Text>
                <Text style={{ ...FONTS.Title3, fontSize: 20 }}>
                  Movie Invite Tickets
                </Text>
              </View>
              <Text style={{ ...FONTS.Title2 }}>Save 25%</Text>
              <Text style={styles.mitprice}>$8.00</Text>
              <AkcruButtons.LrgButton
                btnname="PURCHASE"
                color={COLORS.CATPURPDRK}
                onPress={() => {}}
              />
            </View>
            <View style={styles.pricecontainer}>
              <Image source={imageindex.MIT4} style={styles.mitimage} />
              <View style={{ flexDirection: "row", marginVertical: 10 }}>
                <Text
                  style={{
                    ...FONTS.Title3,
                    fontSize: 20,
                    marginRight: 10,
                    color: COLORS.AKCRUBLUE,
                  }}
                >
                  2
                </Text>
                <Text style={{ ...FONTS.Title3, fontSize: 20 }}>
                  Movie Invite Tickets
                </Text>
              </View>
              <Text style={{ ...FONTS.Title2 }}></Text>
              <Text style={styles.mitprice}>$5.00</Text>
              <AkcruButtons.LrgButton
                btnname="PURCHASE"
                color={COLORS.CATPURPDRK}
                onPress={() => {}}
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default PurchaseMITScreen;

const styles = StyleSheet.create({
  pricecontainer: {
    alignItems: "center",
    backgroundColor: COLORS.TRANSDARKGREY,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 5
  },
  mitimage: {
    width: 115,
    height: 100,
  },
  mitprice: {
    ...FONTS.Title3,
    fontSize: 20,
    color: COLORS.AKCRUBLUE,
    marginBottom: 10
  },
});
