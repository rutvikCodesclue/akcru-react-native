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
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from "../../../../assets/images/imageindex";

import { Icon } from "@rneui/base";
import AkcruButtons from "../../../components/akcruButtons";
import useAuthStore from "../../../stores/auth.store";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { getTotalSupplyOfAD, sendAD } from "../../../lib/api/wallet.lib";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import ComfirmationModal from "../../../components/ConfirmationModal";
import { set } from "lodash";
import BlockUserResultModal from "../../../components/BlockUserResultModal/BlockUserResultModal";



const UserProfileWalletTab = () => {
    // Use the useRoute hook to access the selected user data
    const route = useRoute();
    const selectedUser = route.params?.selectedUser;

    // Define state for the AD amount
    const [adAmount, setAdAmount] = useState(''); // This will hold the amount entered in the input field

    const [amountToSend, setAmountToSend] = useState(''); // State to store the amount entered

    // console.log('Selected User:', selectedUser);
    // const toText = selectedUser ? selectedUser.username : '';
    useEffect(() => {
        if (selectedUser && selectedUser?.username) {
            setSendTo(selectedUser.username);
        }
    }, [selectedUser]);

    const {user} = useAuthStore();
    const [totalSupply, setTotalSupply] = useState<Number | undefined>(undefined);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [walletResultModal, setWalletResultModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [walletResultMessage, setwalletResultMessage] = useState('');
    const [iconName, setIconName] = useState('');
    const [sendTo, setSendTo] = useState(selectedUser ? selectedUser.username : '');

    const closeModal = () => {
        setWalletResultModal(false);
    };

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

    // Function to handle the AD transfer
    const handleSendAD = async () => {
        const adAmountNumber = parseFloat(amountToSend);

        if (!isNaN(adAmountNumber) && adAmountNumber > 0) {
            if (user && selectedUser && adAmountNumber <= user.adAmount) {
                const response = await sendAD({
                    recipientId: selectedUser.id, // Assuming selectedUser has an 'id' field
                    adAmount: adAmountNumber,
                });
                console.log('Response:', response);
                if (response.success) {
                    // Alert.alert('Success', response.message || 'AD sent successfully');
                    // Optionally, update any relevant state or navigate as needed
                    setModalType('success');
                    setWalletResultModal(true);

                    setwalletResultMessage(response.message || 'AD sent successfully');
                    setIconName('check');
                    setAmountToSend(''); // Clear the amount input
                    setSendTo('');
                } else {
                    // Alert.alert('Error', response.message || 'Failed to send AD');
                    setModalType('failed');
                    setWalletResultModal(true);
                    setwalletResultMessage(response.message || 'Failed to send AD');
                    setIconName('close');
                    setAmountToSend(''); // Clear the amount input
                    setSendTo('');
                }
            } else {
                // Alert.alert('Error', response.message );
                setModalType('failed');
                setWalletResultModal(true);
                setwalletResultMessage('Failed to send AD');
                setIconName('close');
                setAmountToSend(''); // Clear the amount input
                setSendTo('');
            }
        } else {
            // Alert.alert('Error', 'Please enter a valid amount');
            setModalType('failed');
            setWalletResultModal(true);
            setwalletResultMessage('Please enter a valid amount');
            setIconName('close');
            setAmountToSend(''); // Clear the amount input
            setSendTo('');
        }
    };

    const handleSendButtonPress = () => {
        setSendTo(selectedUser?.username);
        setConfirmationModalVisible(true);
        
    };

    const handleClearInput = () => {
        setSendTo(''); // Assuming you're using sendTo to store the recipient's username
        setAmountToSend(''); // Clear the AD amount input
    };
    

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
                                value={sendTo} // Set the value of the TextInput to the selected user's username
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

                <View
                    style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: SIZES.ScreenWidth * 0.93,
                        alignItems: 'center',
                    }}>
                    <AkcruButtons.FollowButton
                        btnname={'Clear'}
                        onPress={() => {
                            handleClearInput();
                        }}
                        color={COLORS.AKCRUBLUE}
                        disabled={false}
                    />
                    <AkcruButtons.FollowButton
                        btnname={'Send'}
                        onPress={() => {
                            handleSendButtonPress();
                        }}
                        color={COLORS.PURPLE}
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
            <Modal transparent={true} visible={confirmationModalVisible} animationType="fade">
                <ComfirmationModal
                    confirmationText={`Are you sure you want to send ${sendTo} "${amountToSend}" AD?`}
                    onPressYes={() => {
                        handleSendAD();
                        setConfirmationModalVisible(false);
                    }}
                    onPressNo={() => setConfirmationModalVisible(false)}
                />
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={walletResultModal}
                onRequestClose={() => {
                    setWalletResultModal(!walletResultModal);
                }}>
                <BlockUserResultModal
                    closeModal={closeModal}
                    type={modalType}
                    resultMessage={walletResultMessage}
                    iconName={iconName}
                />
            </Modal>
        </View>
    );
};

export default UserProfileWalletTab;
