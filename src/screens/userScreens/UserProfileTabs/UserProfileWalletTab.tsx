import {View, Text, ScrollView, Image, TextInput, Pressable, Modal, Alert, Platform} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import AkcruButtons from '../../../components/akcruButtons';
import useAuthStore from '../../../stores/auth.store';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {getTotalSupplyOfAD, getADSupplySnapshots, sendAD} from '../../../lib/api/wallet.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import ComfirmationModal from '../../../components/ConfirmationModal';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import {LineChart} from 'react-native-gifted-charts';
import {Dimensions} from 'react-native';

type Snapshot = {
    date: string;
    supply: number;
    snapshotAt: string;
};

const UserProfileWalletTab = () => {
    // Use the useRoute hook to access the selected user data
    const route = useRoute();
    const selectedUser = route.params?.selectedUser;

    // Define state for the AD amount
    const [adAmount, setAdAmount] = useState<number | string>(''); // This will hold the amount entered in the input field
    const [sendTo, setSendTo] = useState(selectedUser ? selectedUser.username : '');

    // Initialize other states
    const {user} = useAuthStore();
    const [totalSupply, setTotalSupply] = useState<Number | undefined>(undefined);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [walletResultModal, setWalletResultModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [walletResultMessage, setWalletResultMessage] = useState('');
    const [iconName, setIconName] = useState('');

    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    useEffect(() => {
        if (selectedUser && selectedUser?.username) {
            setSendTo(selectedUser.username);
        }
    }, [selectedUser]);

    useFocusEffect(
        React.useCallback(() => {
            getTotalSupplyOfAD().then(setTotalSupply);
            getADSupplySnapshots().then((history: Snapshot[]) => {
                // console.log('RAW snapshot history:', history);
                setSnapshots(history);
            });
        }, []),
    );

    const closeModal = () => {
        setWalletResultModal(false);
    };

    // Function to clear both the recipient and the amount input
    const handleClearInput = () => {
        setSendTo(''); // Clear the recipient input
        setAdAmount(''); // Clear the AD amount input
    };

    // Function to handle the AD transfer
    const handleSendAD = async () => {
        const adAmountNumber = parseFloat(adAmount as string);

        if (!isNaN(adAmountNumber) && adAmountNumber > 0 && user && selectedUser && adAmountNumber <= user.adAmount) {
            try {
                const response = await sendAD({
                    recipientId: selectedUser.id, // Assuming selectedUser has an 'id' field
                    adAmount: adAmountNumber,
                });

                if (response.success) {
                    setModalType('success');
                    setWalletResultModal(true);
                    setWalletResultMessage(response.message || 'AD sent successfully');
                    setIconName('check');
                } else {
                    setModalType('failed');
                    setWalletResultModal(true);
                    setWalletResultMessage(response.message || 'Failed to send AD');
                    setIconName('close');
                }
            } catch (error) {
                console.error('Error while sending AD:', error);
                setModalType('failed');
                setWalletResultModal(true);
                setWalletResultMessage('Failed to send AD');
                setIconName('close');
            } finally {
                handleClearInput(); // Clear inputs regardless of success or failure
            }
        } else {
            Alert.alert('Invalid Input', 'Please enter a valid amount and ensure you have sufficient balance.');
            handleClearInput(); // Clear inputs if validation fails
        }
    };

    const handleSendButtonPress = () => {
        setSendTo(selectedUser?.username);
        setConfirmationModalVisible(true);
    };

    // 1) group into one-per-month
    const allMonthly = Object.values(
        snapshots.reduce<Record<string, (typeof snapshots)[0]>>((acc, snap) => {
            const monthKey = snap.date.slice(0, 7); // "YYYY-MM"
            acc[monthKey] = snap; // keeps the last snapshot of that month
            return acc;
        }, {}),
    );

    // 2) sort by calendar date
    allMonthly.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 3) keep only the most recent 6 months
    const monthlySnapshots = allMonthly.slice(-6);

    // now build chartData off `monthlySnapshots` instead of `snapshots`
    const chartData = monthlySnapshots.map(s => {
        const [Y, M] = s.date.split('-').map(Number);
        const label = new Date(Y, M - 1).toLocaleDateString('en-US', {month: 'short'});
        return {value: s.supply, label};
    });

    console.log('chartdata:', chartData);
    // 3) Compute Y axis scale
    const max = Math.max(...chartData.map(d => d.value));
    const noOfSections = 5;
    // round up the “step” to the nearest 10 000:
    const stepValue = Math.ceil(max / noOfSections / 10000) * 10000;

    const screenWidth = Dimensions.get('window').width - SIZES.marginhorizontal * 2;
    const pointCount = 7; // = 6
    const gap =
        pointCount > 1
            ? screenWidth / (pointCount - 1) // 5 gaps over screenWidth
            : screenWidth;

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
                    <Text style={{...FONTS.Title1, color: COLORS.PINK}}>BALANCE</Text>
                    <Text style={{...FONTS.Title1}}>{user?.adAmount} AD</Text>
                </View>

                <View style={styles.lineSeperator} />
                <View style={{marginBottom: 10}}>
                    <Text style={styles.titleText2White}>Send Akcru Dollars to your friends and family</Text>
                </View>
                <View>
                    <Text style={styles.titleText2}>TO:</Text>
                    {Platform.OS === 'android' ? (
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
                    ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('UserWalletSearch')}>
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
                        </TouchableOpacity>
                    )}
                </View>
                <View>
                    <Text style={styles.titleText2}>AKCRU DOLLAR AMOUNT:</Text>
                    <View style={styles.inputContainer2}>
                        <TextInput
                            placeholder={'Amount'}
                            placeholderTextColor={'transparent'}
                            style={{color: COLORS.WHITE, width: '100%'}}
                            keyboardType="phone-pad" // Set keyboard type to phone-pad
                            value={adAmount.toString()}
                            onChangeText={text => setAdAmount(text)} // Update the adAmount state
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
                        onPress={handleClearInput}
                        color={COLORS.AKCRUBLUE}
                        disabled={false}
                    />
                    <AkcruButtons.FollowButton
                        btnname={'Send'}
                        onPress={handleSendButtonPress}
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
                <View style={{marginBottom: 100, marginTop: 10}}>
                    {/* <Image source={imageindex.GRAPHwallet2} style={{width: SIZES.ScreenWidth / 1.1, height: 170}} /> */}
                    <LineChart
                        data={chartData}
                        width={screenWidth}
                        height={220}
                        areaChart
                        thickness={5}
                        color={COLORS.PURPLE}
                        startFillColor={COLORS.AKCRUBLUE}
                        endFillColor={COLORS.PURPLE}
                        xAxisColor={COLORS.LIGHTGREY}
                        xAxisLabelTexts={chartData.map(d => d.label)}
                        hideDataPoints
                        spacing={gap}
                        initialSpacing={5}
                        endSpacing={5}
                        adjustToWidth={true}
                        // 4) show Y axis labels
                        yAxisLabelPrefix=""
                        yAxisLabelSuffix=""
                        yAxisTextStyle={{fontSize: 10, color: COLORS.LIGHTGREY}}
                        yAxisLabelWidth={40}
                        yAxisColor={COLORS.LIGHTGREY}
                        noOfSections={5}
                        stepValue={stepValue}
                        // 5) style X axis labels
                        xAxisLabelTextStyle={{fontSize: 10, color: COLORS.LIGHTGREY}}
                        xAxisLength={SIZES.ScreenWidth - SIZES.marginhorizontal}
                        // optional: hide the vertical grid lines
                        showVerticalLines={false}
                        curved={true}
                        curvature={0.1}
                    />
                </View>
            </ScrollView>
            <Modal transparent={true} visible={confirmationModalVisible} animationType="fade">
                <ComfirmationModal
                    confirmationText={`Are you sure you want to send ${sendTo} "${adAmount}" AD?`}
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
