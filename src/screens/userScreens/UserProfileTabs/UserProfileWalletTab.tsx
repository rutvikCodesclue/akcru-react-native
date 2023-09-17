import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from "../../../../assets/images/imageindex";
import {
  FAKE_USER_PROFILES,
  AKCRUAPP_TOTAL_AD,
} from "../../../../assets/constants/Mockusers";

import { Icon } from "@rneui/base";
import AkcruButtons from "../../../components/akcruButtons";
import useAuthStore from "../../../stores/auth.store";
import { useFocusEffect } from "@react-navigation/native";
import { getTotalSupplyOfAD } from "../../../lib/api/wallet.lib";

const UserProfileWalletTab = () => {
  const { user } = useAuthStore();
  const [toUSD, setToUSD] = useState(true);
  const [totalSupply, setTotalSupply] = useState<Number | undefined>(undefined);

   const toggleToUSD = () => {
    setToUSD(!toUSD);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      getTotalSupplyOfAD().then((amount) => {
        setTotalSupply(amount);
      });

      return () => {
        // Do something when the screen is unfocused
      };
    }
  , []));

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
            {user?.adAmount} AD
          </Text>
        </View>

        {/* <View style={styles.lineSeperator} />
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText2}>REWARDS EARNED</Text>
        </View>

        <View>
          <Image
            source={imageindex.GRAPHwallet1}
            style={{ width: SIZES.ScreenWidth / 1.1, height: 170 }}
          />
        </View> */}
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
            <Pressable onPress={toggleToUSD}>
              {toUSD ? (
                <View style={{ marginTop: 10 }}>
                  <View style={{ marginBottom: -10 }}>
                    <Icon
                      name="arrow-left-thin"
                      type="material-community"
                      size={35}
                      color={COLORS.LIGHTGREY}
                    />
                  </View>
                  <View style={{ marginTop: -10 }}>
                    <Icon
                      name="arrow-right-thin"
                      type="material-community"
                      size={35}
                      color={"green"}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  <View style={{ marginBottom: -10 }}>
                    <Icon
                      name="arrow-left-thin"
                      type="material-community"
                      size={35}
                      color={"green"}
                    />
                  </View>
                  <View style={{ marginTop: -10 }}>
                    <Icon
                      name="arrow-right-thin"
                      type="material-community"
                      size={35}
                      color={COLORS.LIGHTGREY}
                    />
                  </View>
                </View>
              )}
            </Pressable>
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
            {`${totalSupply?.toString()} AD` ?? "Loading..."}
          </Text>
          {/* <Text
            style={{ ...FONTS.Title3, fontSize: 18, color: COLORS.AKCRUBLUE }}
          >
            +{AKCRUAPP_TOTAL_AD[0].percentageChange}%
          </Text> */}
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
