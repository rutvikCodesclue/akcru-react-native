import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView, Modal, Alert, Image, TouchableOpacity} from 'react-native';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import AkcruButtons from '../../../components/akcruButtons';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import useAuthStore from '../../../stores/auth.store';
import {getSystemWalletBalance, grantAD} from '../../../lib/api/admin.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import BackButton from '../../../components/General/backbutton';
import imageindex from '../../../../assets/images/imageindex';
import styles from './styles';

export default function AdminGrantADScreen() {
    const isFocused = useIsFocused();
    const route = useRoute();
    const selectedUser = route.params?.selectedUser as
        | {
              id: string;
              username: string;
          }
        | undefined;

    const [balance, setBalance] = useState<string>('0');
    const canGrantAD = useAuthStore(state => state.user?.canGrantAD);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    // ✨ Two pieces of state ✨
    // 1) username for the readonly input
    const [targetUsername, setTargetUsername] = useState<string>('');
    // 2) id for the API call
    const [targetUserId, setTargetUserId] = useState<string>('');

    const [amount, setAmount] = useState<string>('');

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [resultVisible, setResultVisible] = useState(false);
    const [resultMsg, setResultMsg] = useState('');
    const [resultType, setResultType] = useState<'success' | 'failed'>('success');
    useEffect(() => {
        if (!canGrantAD) {
            navigation.goBack();
        }
    }, [canGrantAD, navigation]);

    // fetch system balance on focus
    useEffect(() => {
        if (!isFocused) {
            return;
        }
        getSystemWalletBalance()
            .then(b => {
                if (b !== undefined) {
                    setBalance(b);
                }
            })
            .catch(e => console.error('Failed to load system balance', e));
    }, [isFocused]);

    useEffect(() => {
        if (selectedUser) {
            setTargetUsername(selectedUser.username);
            setTargetUserId(selectedUser.id);
        }
    }, [selectedUser]);

    const handleGrant = async () => {
        const amt = parseFloat(amount);
        const bal = parseFloat(balance);
        // Validate everything, including that you have a targetUserId
        if (!targetUserId || isNaN(amt) || amt <= 0 || amt > bal) {
            Alert.alert('Invalid', 'Please choose a user and enter an amount up to the system balance.');
            return;
        }

        try {
            const resp = await grantAD({userId: targetUserId, amount: amt});
            setResultType(resp.success ? 'success' : 'failed');
            setResultMsg(resp.message);
            if (resp.success) {
                // refresh system balance
                const b = await getSystemWalletBalance();
                if (b !== undefined) setBalance(b);
            }
        } catch (e) {
            console.error('Grant AD error', e);
            setResultType('failed');
            setResultMsg('Grant failed unexpectedly.');
        } finally {
            setResultVisible(true);
            setConfirmVisible(false);
            // clear everything
            setTargetUsername('');
            setTargetUserId('');
            setAmount('');
        }
    };

    const handleClear = () => {
        setTargetUsername('');
        setTargetUserId('');
        setAmount('');
    };

    return (
        <View style={{flex: 1, padding: SIZES.marginhorizontal}}>
            <ScrollView>
                <View>
                    <BackButton navigation={navigation} />
                </View>
                <Text style={{...FONTS.Title2, marginBottom: 12}}>System Wallet</Text>
                <View
                    style={{
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: COLORS.DARKERGREY,
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 24,
                    }}>
                    <Image source={imageindex.AkcruHexLogo} style={{width: 40, height: 33}} />
                    <Text style={{...FONTS.Title1, color: COLORS.PINK}}>BALANCE</Text>
                    <Text style={{...FONTS.Title1}}>{balance} AD</Text>
                </View>

                <Text style={styles.titleText2}>Target User</Text>

                <TouchableOpacity onPress={() => navigation.navigate('AdminWalletSearch')}>
                    <View style={styles.inputContainer2}>
                        <TextInput
                            placeholder={'To'}
                            placeholderTextColor={COLORS.TRANSPARENT}
                            style={{color: COLORS.WHITE, width: '100%'}}
                            editable={false}
                            secureTextEntry={false}
                            value={targetUsername} // Set the value of the TextInput to the selected user's username
                        />
                    </View>
                </TouchableOpacity>

                <Text style={styles.titleText2}>Amount to Grant:</Text>

                <View style={styles.inputContainer2}>
                    <TextInput
                        placeholder={'Amount'}
                        placeholderTextColor={COLORS.TRANSPARENT}
                        style={{color: COLORS.WHITE, width: '100%'}}
                        keyboardType="numeric" // Set keyboard type to phone-pad
                        value={amount}
                        onChangeText={setAmount} // Update the adAmount state
                    />
                </View>
                <View
                    style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: SIZES.ScreenWidth * 0.93,
                        alignItems: 'center',
                        marginBottom: '30%',
                    }}>
                    <AkcruButtons.FollowButton
                        btnname={'Clear'}
                        onPress={handleClear}
                        color={COLORS.AKCRUBLUE}
                        disabled={false}
                    />
                    <AkcruButtons.FollowButton
                        btnname={'Send'}
                        onPress={() => setConfirmVisible(true)}
                        color={COLORS.PURPLE}
                        disabled={false}
                    />
                </View>
            </ScrollView>

            <Modal transparent visible={confirmVisible} animationType="fade">
                <ConfirmationModal
                    confirmationText={`Grant ${amount} AD to user ${targetUsername}?`}
                    onPressYes={handleGrant}
                    onPressNo={() => setConfirmVisible(false)}
                />
            </Modal>

            <Modal transparent visible={resultVisible} animationType="fade">
                <BlockUserResultModal
                    closeModal={() => setResultVisible(false)}
                    type={resultType}
                    resultMessage={resultMsg}
                    iconName={resultType === 'success' ? 'check' : 'close'}
                />
            </Modal>
        </View>
    );
}
