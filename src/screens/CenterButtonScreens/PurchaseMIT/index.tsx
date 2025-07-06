// src/screens/PurchaseMITScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, ImageBackground, SafeAreaView, TouchableOpacity, Modal, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SIZES, COLORS, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import Header from '../../../components/header';
import BackButton from '../../../components/General/backbutton';
import AkcruButtons from '../../../components/akcruButtons';
import useAuthStore from '../../../stores/auth.store';
import {getMitTiers, purchaseMIT, MitTier} from '../../../lib/api/mit.lib';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';

export default function PurchaseMITScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const walletBalance = useAuthStore(s => s.walletBalance);
    const hydrateUser = useAuthStore(s => s.hydrateUser);

    const [tiers, setTiers] = useState<MitTier[]>([]);
    const [selectedTier, setSelectedTier] = useState<MitTier | null>(null);
    const [confirmVisible, setConfirmVis] = useState(false);
    const [successVisible, setSuccessVis] = useState(false);

    // load bundles on mount
    useEffect(() => {
        getMitTiers().then(setTiers);
    }, []);

    const balance = parseFloat(walletBalance || '0');

    const handlePurchasePress = () => {
        if (!selectedTier) {
            return Alert.alert('Select a bundle first.');
        }
        if (balance < selectedTier.cost) {
            return Alert.alert('Insufficient AD', `You need ${selectedTier.cost} AD.`);
        }
        setConfirmVis(true);
    };

    const confirmPurchase = async () => {
        setConfirmVis(false);
        const resp = await purchaseMIT(selectedTier!.quantity);
        if (!resp.success) {
            return Alert.alert('Purchase Failed', resp.message || '');
        }
        await hydrateUser();
        setSuccessVis(true);
        setTimeout(() => setSuccessVis(false), 3000);
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground
                source={imageindex.MIT1}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView style={{flex: 1}}>
                    <Header />
                    <BackButton navigation={navigation} />

                    <View style={{padding: 16}}>
                        <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center'}}>
                            Your Balance: {balance} AD
                        </Text>

                        <Text style={{...FONTS.Title2, marginTop: 20}}>Choose a bundle:</Text>
                        {tiers.map(t => {
                            const isSelected = selectedTier?.quantity === t.quantity;
                            return (
                                <TouchableOpacity
                                    key={t.quantity}
                                    onPress={() => setSelectedTier(t)}
                                    style={{
                                        padding: 12,
                                        marginVertical: 6,
                                        borderRadius: 6,
                                        backgroundColor: isSelected ? COLORS.PURPLE : COLORS.DARKERGREY,
                                    }}>
                                    <Text style={{...FONTS.Body, color: COLORS.WHITE, textAlign: 'center'}}>
                                        {t.quantity} for {t.cost} AD
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        <AkcruButtons.LrgButton
                            btnname="PURCHASE"
                            disabled={!selectedTier}
                            onPress={handlePurchasePress}
                            color={COLORS.CATPURPDRK}
                        />
                    </View>
                </SafeAreaView>
            </ImageBackground>

            {/* Confirm Modal */}
            <Modal transparent visible={confirmVisible} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                            padding: 20,
                            borderRadius: 8,
                        }}>
                        <Text style={FONTS.Title2}>
                            Confirm purchase of {selectedTier?.quantity} MIT(s) for {selectedTier?.cost} AD?
                        </Text>
                        <View style={{flexDirection: 'row', marginTop: 16, justifyContent: 'space-between'}}>
                            <AkcruButtons.FollowButton
                                btnname="Cancel"
                                onPress={() => setConfirmVis(false)}
                                color={COLORS.AKCRUBLUE}
                            />
                            <AkcruButtons.FollowButton
                                btnname="Confirm"
                                onPress={confirmPurchase}
                                color={COLORS.CATPURPDRK}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal transparent visible={successVisible} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: COLORS.AKCRUBACKGROUND,
                            padding: 20,
                            borderRadius: 8,
                        }}>
                        <Text style={FONTS.Title2}>🎉 Purchased {selectedTier?.quantity} MIT(s)!</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
