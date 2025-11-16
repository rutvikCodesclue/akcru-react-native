// src/screens/PurchaseAdScreen.tsx

import React, {useEffect, useState} from 'react';
import {View, Text, SafeAreaView, TouchableOpacity, Modal, Alert, Image, ActivityIndicator} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {COLORS, FONTS} from '../../../../assets/constants';
import Header from '../../../components/header';

import AkcruButtons from '../../../components/akcruButtons';
import {getAdPacks, purchaseAD, purchaseADInApp, AdPackInfo} from '../../../lib/api/adPurchase.lib';
import { Platform } from 'react-native';

import {ScrollView} from 'react-native-gesture-handler';
import imageindex from '../../../../assets/images/imageindex';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';

export default function PurchaseAdScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [tiers, setTiers] = useState<AdPackInfo[]>([]);
    const [selectedTier, setSelectedTier] = useState<AdPackInfo | null>(null);
    const [confirmVisible, setConfirmVis] = useState(false);
    const [purchaseInProgress, setPurchaseInProgress] = useState(false);

    useEffect(() => {
        getAdPacks()
            .then(setTiers)
            .catch(err => {
                console.error('Failed to load AD bundles:', err);
                Alert.alert('Error', 'Could not load purchase options');
            });
    }, []);

    // Show confirmation for a particular pack
    const onPackPurchasePress = (tier: AdPackInfo) => {
        setSelectedTier(tier);
        setConfirmVis(true);
    };

    // After confirming
    const confirmPurchase = async () => {
        setConfirmVis(false);
        if (!selectedTier) return;

        setPurchaseInProgress(true);
        try {
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Alert.alert('Purchase In Progress', 'Please follow the in-app purchase prompts.');
                const txId = await purchaseADInApp(selectedTier.tier);
                if (txId){
                    Alert.alert('Purchase Successful', 'Thank you for your purchase of AD!');
                }
            } else {
                const checkoutUrl = await purchaseAD(selectedTier.tier);
                navigation.navigate('StripeWebCheckout', {checkoutUrl});
            }
        } catch (err: any) {
            console.error('Checkout session error:', err);
            Alert.alert('Purchase Failed', "Some issue occurred during purchase. Please try again later.");
        } finally {
            setPurchaseInProgress(false);
        }
    };

    return (
        <TabContainer style={{flex: 1}}>
            <SafeAreaView style={{flex: 1}}>
                <Header />
                <View>
                    <ScrollView style={{padding: 16}} contentContainerStyle={{paddingTop: 16, paddingBottom: '40%'}}>
                        <Text style={{...FONTS.Title2, marginTop: 5}}>Choose a pack:</Text>

                        {tiers.map(t => {
                            const isSelected = selectedTier?.tier === t.tier;
                            return (
                                <View
                                    key={t.tier}
                                    style={{
                                        padding: 20,
                                        marginVertical: 6,
                                        borderRadius: 6,
                                        borderWidth: 3,
                                        borderColor: COLORS.PURPLE,
                                        backgroundColor: isSelected ? COLORS.TRANSPURPLE : COLORS.AKCRUBACKGROUND,
                                    }}>
                                    <TouchableOpacity onPress={() => setSelectedTier(t)}>
                                        <Text
                                            style={{
                                                ...FONTS.ContentTitle,
                                                color: COLORS.AKCRUPINK,
                                                textAlign: 'center',
                                            }}>
                                            {t.label}
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginVertical: 8,
                                            }}>
                                            <Image
                                                source={imageindex.AkcruHexLogo}
                                                style={{width: 21, height: 21, marginRight: 6}}
                                                resizeMode="contain"
                                            />
                                            <Text
                                                style={{
                                                    ...FONTS.Title1,
                                                    color: COLORS.WHITE,
                                                    textAlign: 'center',
                                                }}>
                                                {t.adGiven.toLocaleString()} AD
                                            </Text>
                                        </View>

                                        <Text
                                            style={{
                                                ...FONTS.Title2,
                                                color: COLORS.DARKGREY,
                                                textAlign: 'center',
                                                marginBottom: 8,
                                            }}>
                                            {t.baselineAd.toLocaleString()} + {t.bonusAD.toLocaleString()} AD bonus (
                                            {t.bonusPercent}%)
                                        </Text>
                                        <Text
                                            style={{
                                                ...FONTS.ContentTitle,
                                                color: COLORS.WHITE,
                                                textAlign: 'center',
                                            }}>
                                            ${t.priceUSD.toFixed(2)}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={{marginTop: 12, alignItems: 'center'}}>
                                        <AkcruButtons.XlLrgButton
                                            btnname="Purchase"
                                            onPress={() => onPackPurchasePress(t)}
                                            color={COLORS.CATPURPLGT}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </SafeAreaView>

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
                            width: '85%',
                        }}>
                        <Text style={{textAlign: 'center', ...FONTS.Title2}}>
                            Confirm purchase of {selectedTier?.adGiven.toLocaleString()} AD for $
                            {selectedTier?.priceUSD.toFixed(2)}? (All sales are final — no refunds)
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginTop: 16,
                                justifyContent: 'space-between',
                            }}>
                            <AkcruButtons.SmallButton
                                btnname="Cancel"
                                onPress={() => setConfirmVis(false)}
                                color={COLORS.AKCRUBLUE}
                            />
                            <AkcruButtons.SmallButton
                                btnname="Confirm"
                                onPress={confirmPurchase}
                                color={COLORS.CATPURPLGT}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </TabContainer>
    );
}
