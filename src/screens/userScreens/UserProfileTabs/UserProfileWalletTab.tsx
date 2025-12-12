import {View, Text, ScrollView, Image, TextInput, Pressable, Modal, Alert, Platform} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import AkcruButtons from '../../../components/akcruButtons';
import useAuthStore from '../../../stores/auth.store';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {sendAD, getUserWallet} from '../../../lib/api/wallet.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import ComfirmationModal from '../../../components/ConfirmationModal';
import BlockUserResultModal from '../../../components/BlockUserResultModal/BlockUserResultModal';
import { IAd } from '../../../../types';
import { getAds, trackAdEvent } from '../../../lib/api/ads.lib';
import RotatingAd from '../../../components/Ads/RotatingAd';
import { isTablet } from '../../../../assets/constants/theme';

const UserProfileWalletTab = () => {
    // Use the useRoute hook to access the selected user data
    const route = useRoute();
    const selectedUser = route.params?.selectedUser;

    // Define state for the AD amount
    const [adAmount, setAdAmount] = useState<string>(''); // This will hold the amount entered in the input field
    const [sendTo, setSendTo] = useState(selectedUser ? selectedUser.username : '');

    // Initialize other states
    const isFocused = useIsFocused();
    const [iconName, setIconName] = useState('');

    // Modals state
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [resultVisible, setResultVisible] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [resultType, setResultType] = useState<'success' | 'failed'>('success');

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const walletBalance = useAuthStore(s => s.walletBalance);
    const setWalletBalance = useAuthStore(s => s.setWalletBalance);

    const [walletAds, setWalletAds] = useState<IAd[]>([]);
        // const AD_HEIGHT = isTablet() ? Math.round((SIZES.ScreenWidth * 9) / 16) : Math.round((SIZES.ScreenWidth * 9) / 16);
        const AD_HEIGHT = SIZES.ScreenWidth / 2.4;
    
        useEffect(() => {
            (async () => {
                try {
                    const res = await getAds('WALLET_BILLBOARD'); // { ads: IAd[] }
    
                    // ✅ filter by start/end dates + active flag (client-side guard)
                    const now = Date.now();
                    const filtered = (res.ads ?? []).filter(a => {
                        const s = a.startAt ? Date.parse(a.startAt) : -Infinity;
                        const e = a.endAt ? Date.parse(a.endAt) : Infinity;
                        return s <= now && now <= e && a.isActive;
                    });
    
                    setWalletAds(filtered);
                } catch (e) {
                    console.log('Failed to load ads', e);
                    setWalletAds([]); // safe fallback
                }
            })();
        }, []);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        getUserWallet()
            .then(b => {
                if (b !== undefined) {
                    setWalletBalance(b);
                }
            })
            .catch(e => console.error('wallet fetch failed', e));
    }, [isFocused, setWalletBalance]);

    useEffect(() => {
        if (selectedUser && selectedUser?.username) {
            setSendTo(selectedUser.username);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (selectedUser?.username) {
            setSendTo(selectedUser.username);
        }
    }, [selectedUser]);

    const handleClear = () => {
        setSendTo('');
        setAdAmount('');
    };

    const handleSendAD = async () => {
        const amountNum = parseFloat(adAmount);
        const currentBalance = parseFloat(walletBalance || '0');

        if (isNaN(amountNum) || amountNum <= 0 || amountNum > currentBalance) {
            Alert.alert('Invalid Input', 'Please enter a valid amount and ensure you have sufficient balance.');
            handleClear();
            return;
        }

        try {
            const resp = await sendAD({recipientId: selectedUser.id, adAmount: amountNum});
            if (resp.success) {
                setResultType('success');
                setIconName('check');
                // Refresh balance
                const b = await getUserWallet();
                if (b !== undefined) {
                    setWalletBalance(b);
                }
            } else {
                setResultType('failed');
                setIconName('close');
            }
            setResultMessage(resp.message);
        } catch (e) {
            console.error('Error sending AD:', e);
            setResultType('failed');
            setIconName('close');
            setResultMessage('Failed to send AD.');
        } finally {
            setResultVisible(true);
            handleClear();
        }
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
                    <Text style={{...FONTS.Title1, color: COLORS.PINK}}>BALANCE</Text>
                    <Text style={{...FONTS.Title1}}>{walletBalance ?? 0} AD</Text>
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
                            value={adAmount}
                            onChangeText={setAdAmount} // Update the adAmount state
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
                        onPress={handleClear}
                        color={COLORS.AKCRUBLUE}
                        disabled={false}
                    />
                    <AkcruButtons.FollowButton
                        btnname={'Send'}
                        onPress={() => setConfirmationVisible(true)}
                        color={COLORS.PURPLE}
                        disabled={false}
                    />
                </View>
                {!!walletAds.length && (
                    <View style={{marginTop: isTablet() ? 24 : 16, paddingHorizontal: '2%', marginBottom: '30%'}}>
                        <RotatingAd
                            ads={walletAds}
                            height={AD_HEIGHT}
                            pause={!isFocused}
                            onImpression={id => trackAdEvent(id, 'IMPRESSION')}
                            onClick={id => trackAdEvent(id, 'CLICK')}
                        />
                    </View>
                )}
            </ScrollView>
            <Modal transparent={true} visible={confirmationVisible} animationType="fade">
                <ComfirmationModal
                    confirmationText={`Are you sure you want to send ${sendTo} "${adAmount}" AD?`}
                    onPressYes={() => {
                        handleSendAD();
                        setConfirmationVisible(false);
                    }}
                    onPressNo={() => setConfirmationVisible(false)}
                />
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={resultVisible}
                onRequestClose={() => setResultVisible(false)}>
                <BlockUserResultModal
                    closeModal={() => setResultVisible(false)}
                    type={resultType}
                    resultMessage={resultMessage}
                    iconName={iconName}
                />
            </Modal>
        </View>
    );
};

export default UserProfileWalletTab;
