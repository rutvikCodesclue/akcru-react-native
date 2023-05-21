import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { FONTS, SIZES, COLORS } from "../../../../constants";
import imageindex from "../../../../assets/images/imageindex";
import {
  FAKE_USER_PROFILES,
  AKCRUAPP_TOTAL_AD,
} from "../../../../constants/Mockusers";
import { Icon } from "@rneui/base";
import { AkcruButtons} from "../../../components";

const UserProfileWalletTab = () => {
  const [toUSD, setToUSD] = useState(true);

  return (
    <View style={{ marginHorizontal: SIZES.marginhorizontal }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.titleText1}>WALLET</Text>
        </View>
        <View
          style={{
            alignItems: "center",
            borderColor: COLORS.DARKERGREY,
            borderWidth: 1,
            borderRadius: 8,
            height: 175,
            justifyContent: "center",
          }}
        >
          <Image
            source={imageindex.AkcruHexLogo}
            style={{ width: 40, height: 33 }}
          />
          <Text style={styles.titleText2}>BALANCE</Text>
          <Text style={{ ...FONTS.Title3, fontSize: 18 }}>
            {FAKE_USER_PROFILES[0].ADAmount} AD
          </Text>
        </View>

        <View style={styles.lineSeperator} />
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText2}>REWARDS EARNED</Text>
        </View>

        <View>
          <Image
            source={imageindex.GRAPHwallet1}
            style={{ width: SIZES.ScreenWidth / 1.1, height: 170 }}
          />
        </View>
        <View style={styles.lineSeperator} />
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText2White}>
            Exchange AD to USD / USD to AD
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={styles.titleText3}>AKCRU DOLLARS</Text>
            <View style={styles.inputContainer}>
              <Image
                source={imageindex.AkcruHexLogo}
                style={{ width: 26, height: 20, marginRight: 5 }}
              />
              <TextInput
                placeholder={"AD Amount"}
                placeholderTextColor={"transparent"}
                style={{ color: COLORS.WHITE }}
              />
            </View>
          </View>

          <View>
            <TouchableOpacity onPress={()=>{setToUSD(false), setToUSD(true)}}>
              <View style={{ marginTop: 10 }}>
                <View style={{ marginBottom: -10 }}>
                  <Icon
                    name="arrow-left-thin"
                    type="material-community"
                    size={35}
                    color={ toUSD? COLORS.LIGHTGREY: "green"}
                  />
                </View>
                <View style={{ marginTop: -10 }}>
                  <Icon
                    name="arrow-right-thin"
                    type="material-community"
                    size={35}
                    color={toUSD ? "green" : COLORS.LIGHTGREY}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.titleText3}>USD</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="currency-usd"
                type="material-community"
                size={27}
                color={"green"}
                style={{ marginLeft: -5 }}
              />

              <TextInput
                placeholder={"AD Amount"}
                placeholderTextColor={"transparent"}
                style={{ color: COLORS.WHITE }}
              />
            </View>
          </View>
        </View>
        <View style={{ alignItems: "center", marginTop: 30, marginBottom: 20 }}>
          <AkcruButtons.MedButton
            btnname={"Exchange"}
            onPress={function (): void {}}
            color={COLORS.AKCRUBLUE}
          />
        </View>
        <View style={styles.lineSeperator} />
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText2White}>
            Send Akcru Dollars to your friends and family
          </Text>
        </View>
        <View>
          <Text style={styles.titleText2}>TO:</Text>
          <View style={styles.inputContainer2}>
            <TextInput
              placeholder={"To"}
              placeholderTextColor={"transparent"}
              style={{ color: COLORS.WHITE }}
            />
          </View>
        </View>
        <View>
          <Text style={styles.titleText2}>AMOUNT:</Text>
          <View style={styles.inputContainer2}>
            <TextInput
              placeholder={"Amount"}
              placeholderTextColor={"transparent"}
              style={{ color: COLORS.WHITE }}
            />
          </View>
        </View>
        <View>
          <Text style={styles.titleText2}>GOOGLE AUTHENTIFICATION</Text>
          <View style={styles.inputContainer2}>
            <TextInput
              placeholder={"Google Authentification"}
              placeholderTextColor={"transparent"}
              style={{ color: COLORS.WHITE }}
            />
          </View>
        </View>
        <View style={{ alignItems: "center", marginTop: 30, marginBottom: 20 }}>
          <AkcruButtons.MedButton
            btnname={"Send"}
            onPress={function (): void {}}
            color={COLORS.AKCRUBLUE}
          />
        </View>
        <View style={styles.lineSeperator} />
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText2White}>
            Total AKCRU Dollars in Circulation
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Image
            source={imageindex.AkcruHexLogo}
            style={{ width: 26, height: 20, marginRight: 10 }}
          />
          <Text style={{ ...FONTS.Title3, fontSize: 18, marginRight: 25 }}>
            {AKCRUAPP_TOTAL_AD[0].akcruTotalADAmount} AD
          </Text>
          <Text
            style={{ ...FONTS.Title3, fontSize: 18, color: COLORS.AKCRUBLUE }}
          >
            +{AKCRUAPP_TOTAL_AD[0].percentageChange}%
          </Text>
        </View>
        <View style={{ marginBottom: 75 }}>
          <Image
            source={imageindex.GRAPHwallet2}
            style={{ width: SIZES.ScreenWidth / 1.1, height: 170 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default UserProfileWalletTab;

const styles = StyleSheet.create({
  inputContainer: {
    width: SIZES.ScreenWidth / 2.5,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: "center",
    height: 35,
  },
  inputContainer2: {
    width: SIZES.ScreenWidth / 1.1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: "center",
    height: 35,
  },

  titleText1: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  titleText2: {
    ...FONTS.Title2,
    color: COLORS.DARKGREY,
    fontSize: 12,
    marginVertical: 5,
  },
  titleText2White: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
    marginVertical: 5,
  },
  titleText3: {
    ...FONTS.Title2,
    color: COLORS.DARKGREY,
    fontSize: 12,
  },
  lineSeperator: {
    borderBottomWidth: 1.5,
    borderColor: COLORS.DARKERGREY,
    marginTop: 20,
    marginBottom: 10,
  },
});
