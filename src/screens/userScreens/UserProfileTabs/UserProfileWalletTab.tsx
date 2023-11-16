import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  Modal,
  Alert
} from "react-native";
import React, { useRef, useState } from "react";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from "../../../../assets/images/imageindex";

import { Icon } from "@rneui/base";
import AkcruButtons from "../../../components/akcruButtons";
import useAuthStore from "../../../stores/auth.store";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { getTotalSupplyOfAD } from "../../../lib/api/wallet.lib";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";



const UserProfileWalletTab = () => {
    // Use the useRoute hook to access the selected user data
    const route = useRoute();
    const selectedUser = route.params?.selectedUser;

    // Define state for the AD amount
    const [adAmount, setAdAmount] = useState(''); // This will hold the amount entered in the input field

    const [amountToSend, setAmountToSend] = useState(''); // State to store the amount entered

    // Function to handle the AD transfer
    const handleSendAD = () => {
        const numericAmountToSend = parseFloat(amountToSend);

        if (!isNaN(numericAmountToSend) && typeof user?.adAmount === 'number') {
            if (numericAmountToSend > 0 && numericAmountToSend <= user?.adAmount) {
                // Call the function to send AD to the selected user
                // You'll need to implement this function or API call
                sendAD(selectedUser, numericAmountToSend);
            } else {
                Alert.alert('Insufficient Balance', 'You do not have enough AD to complete this transaction.', [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ]);
            }
        } else {
            console.log('Invalid AD amount entered.');
        }
    };

    // console.log('Selected User:', selectedUser);
    const toText = selectedUser ? selectedUser.username : '';
    const {user} = useAuthStore();
    const [totalSupply, setTotalSupply] = useState<Number | undefined>(undefined);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused
            getTotalSupplyOfAD().then(amount => {
                setTotalSupply(amount);
            });

            return () => {
                // Do something when the screen is unfocused
            };
        }, []),
    );

    return (
        <View style={{marginHorizontal: SIZES.marginhorizontal}}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <Text style={styles.titleText1}>WALLET</Text>
                </View>
                <View
                    style={{
                        alignItems: 'center',
                        borderColor: COLORS.DARKERGREY,
                        borderWidth: 1,
                        borderRadius: 8,
                        height: 175,
                        justifyContent: 'center',
                    }}>
                    <Image source={imageindex.AkcruHexLogo} style={{width: 40, height: 33}} />
                    <Text style={styles.titleText2}>BALANCE</Text>
                    <Text style={{...FONTS.Title3, fontSize: 18}}>{user?.adAmount} AD</Text>
                </View>

                <View style={styles.lineSeperator} />
                <View style={{marginBottom: 10}}>
                    <Text style={styles.titleText2White}>Send Akcru Dollars to your friends and family</Text>
                </View>
                <View>
                    <Text style={styles.titleText2}>TO:</Text>
                    <Pressable onPress={() => navigation.navigate('UserWalletSearch')}>
                        <View style={styles.inputContainer2}>
                            <TextInput
                                placeholder={'To'}
                                placeholderTextColor={'transparent'}
                                style={{color: COLORS.WHITE, width: '100%'}}
                                editable={false}
                                secureTextEntry={false}
                                value={toText} // Set the value of the TextInput to the selected user's username
                            />
                        </View>
                    </Pressable>
                </View>
                <View>
                    <Text style={styles.titleText2}>AKCRU DOLLAR AMOUNT:</Text>
                    <View style={styles.inputContainer2}>
                        <TextInput
                            placeholder={'Amount'}
                            placeholderTextColor={'transparent'}
                            style={{color: COLORS.WHITE, width: '100%'}}
                            keyboardType="phone-pad" // Set keyboard type to phone-pad
                            onChangeText={text => setAmountToSend(text)} // Update the amountToSend state
                        />
                    </View>
                </View>

                <View style={{alignItems: 'center', marginTop: 30, marginBottom: 20}}>
                    <AkcruButtons.MedButton
                        btnname={'Send'}
                        onPress={()=>{''}}
                        color={COLORS.AKCRUBLUE}
                        disabled={false}
                    />
                </View>
                <View style={styles.lineSeperator} />
                <View style={{marginBottom: 10}}>
                    <Text style={styles.titleText2White}>Total AKCRU Dollars in Circulation</Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                    }}>
                    <Image source={imageindex.AkcruHexLogo} style={{width: 26, height: 20, marginRight: 10}} />
                    <Text style={{...FONTS.Title3, fontSize: 18, marginRight: 25}}>
                        {`${totalSupply?.toString()} AD` ?? 'Loading...'}
                    </Text>
                </View>
                <View style={{marginBottom: 75}}>
                    <Image source={imageindex.GRAPHwallet2} style={{width: SIZES.ScreenWidth / 1.1, height: 170}} />
                </View>
            </ScrollView>
        </View>
    );
};

export default UserProfileWalletTab;
