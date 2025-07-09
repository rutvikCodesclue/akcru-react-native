import React, {useEffect, useState} from 'react';
import {View, Text, SafeAreaView, TouchableOpacity, Modal, Alert, Linking, Image} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SIZES, COLORS, FONTS} from '../../../../assets/constants';
import Header from '../../../components/header';
import BackButton from '../../../components/General/backbutton';
import AkcruButtons from '../../../components/akcruButtons';
import {getAdPacks, purchaseAD, AdPackInfo} from '../../../lib/api/adPurchase.lib';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import LinearGradient from 'react-native-linear-gradient';
import {ScrollView} from 'react-native-gesture-handler';
import imageindex from '../../../../assets/images/imageindex';

export default function PurchaseAdScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

    const [tiers, setTiers] = useState<AdPackInfo[]>([]);
    const [selectedTier, setSelectedTier] = useState<AdPackInfo | null>(null);
    const [confirmVisible, setConfirmVis] = useState(false);

    // load bundles on mount
    useEffect(() => {
        getAdPacks()
            .then(setTiers)
            .catch(err => {
                console.error('Failed to load AD bundles:', err);
                Alert.alert('Error', 'Could not load purchase options');
            });
    }, []);

    const handlePurchasePress = () => {
        if (!selectedTier) {
            return Alert.alert('Select a bundle first.');
        }
        setConfirmVis(true);
    };

    const confirmPurchase = async () => {
        setConfirmVis(false);
        try {
            const {url} = await purchaseAD(selectedTier!.tier);
            // redirect into Stripe Checkout
            Linking.openURL(url);
        } catch (err: any) {
            console.error('Checkout session error:', err);
            Alert.alert('Purchase Failed', err.message || 'Please try again.');
        }
    };

    return (
        <View style={{flex: 1}}>
            <SafeAreaView style={{flex: 1}}>
                <LinearGradient
                    colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: SIZES.ScreenHeight,
                    }}
                />
                <Header />
                <BackButton navigation={navigation} />

                <ScrollView style={{padding: 16}}>
                    <Text style={{...FONTS.Title2, marginTop: 5}}>Choose a pack:</Text>

                    {tiers.map(t => {
                        const isSelected = selectedTier?.tier === t.tier;
                        return (
                            <TouchableOpacity
                                key={t.tier}
                                onPress={() => setSelectedTier(t)}
                                style={{
                                    padding: 20,
                                    marginVertical: 6,
                                    borderRadius: 6,
                                    borderWidth: 3,
                                    borderColor: isSelected ? COLORS.PURPLE : COLORS.PURPLE,
                                    backgroundColor: isSelected ? COLORS.TRANSPURPLE : COLORS.AKCRUBACKGROUND,
                                }}>
                                <Text style={{...FONTS.ContentTitle, color: COLORS.AKCRUPINK, textAlign: 'center'}}>
                                    {t.label.toLocaleString()}
                                </Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <Image
                                        source={imageindex.AkcruHexLogo}
                                        style={{width: 21, height: 21, marginRight: 6}}
                                        resizeMode="contain"
                                    />
                                    <Text style={{...FONTS.Title1, color: COLORS.WHITE, textAlign: 'center'}}>
                                        {t.adGiven.toLocaleString()} AD
                                    </Text>
                                </View>

                                <Text style={{...FONTS.Title2, color: COLORS.DARKGREY, textAlign: 'center'}}>
                                    {t.baselineAd.toLocaleString()} + {t.bonusAD.toLocaleString()} AD bonus (
                                    {t.bonusPercent}%)
                                </Text>
                                <Text style={{...FONTS.ContentTitle, color: COLORS.WHITE, textAlign: 'center'}}>
                                    ${t.priceUSD.toFixed(2)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={{marginTop: 20, marginBottom: '30%'}}>
                        <AkcruButtons.LrgButton
                            btnname="PURCHASE"
                            disabled={!selectedTier}
                            onPress={handlePurchasePress}
                            color={COLORS.CATPURPDRK}
                        />
                    </View>
                </ScrollView>
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
                        }}>
                        <Text style={FONTS.Title2}>
                            Confirm purchase of {selectedTier?.adGiven.toLocaleString()} AD for $
                            {selectedTier?.priceUSD.toFixed(2)}?
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
        </View>
    );
}
