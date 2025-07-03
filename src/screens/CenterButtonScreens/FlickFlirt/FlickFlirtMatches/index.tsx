// src/screens/FlickFlirtMatches.tsx

import React, {useState, useCallback} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    ImageBackground,
    StyleSheet,
    Alert,
    Modal,
    TouchableOpacity,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import AkcruButtons from '../../../../components/akcruButtons';
import useAuthStore from '../../../../stores/auth.store';

import {getMatches, unlockMatches, MatchesResponse, UnlockOption} from '../../../../lib/api/flickflirt.lib';

const FlickFlirtMatches = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {hydrateUser} = useAuthStore();

    // UI state
    const [matches, setMatches] = useState<MatchesResponse['matches']>([]);
    const [hiddenCount, setHiddenCount] = useState<number>(0);
    const [unlocked, setUnlocked] = useState<boolean>(false);
    const [unlockOptions, setUnlockOptions] = useState<UnlockOption[]>([]);

    // Confirmation modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<UnlockOption | null>(null);

    // 1) Fetch (limited) matches on focus
    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                try {
                    const data = await getMatches(); // uses flickflirt.lib
                    if (!active) {
                        return;
                    }

                    if (!data.success) {
                        Alert.alert('Error', data.message || 'Failed to load matches.');
                        return;
                    }

                    setMatches(data.matches); // server-provided (2 items if locked)
                    setHiddenCount(data.hiddenCount);
                    setUnlocked(data.unlocked);
                    setUnlockOptions(data.unlockOptions); // e.g. [ {7,2500}, {30,7500} ]
                } catch (err) {
                    console.error(err);
                    Alert.alert('Error', 'Network error fetching matches.');
                }
            })();
            return () => {
                active = false;
            };
        }, []),
    );

    // 2) Open the unlock confirmation
    const openModal = () => {
        if (unlockOptions.length === 0) {
            return Alert.alert('Error', 'No unlock options available.');
        }
        // default to first option
        setSelectedOpt(unlockOptions[0]);
        setModalVisible(true);
    };

    // 3) Confirm unlock
    const confirmUnlock = async () => {
        if (!selectedOpt) {
            return;
        }
        setModalVisible(false);

        try {
            const data = await unlockMatches(selectedOpt.durationDays);
            if (!data.success) {
                Alert.alert('Unable to Unlock', data.message);
                return;
            }
            // Append only new matches
            setMatches(prev => {
                const seen = new Set(prev.map(m => m.id));
                return [...prev, ...data.matches.filter(m => !seen.has(m.id))];
            });
            setHiddenCount(0);
            setUnlocked(true);
            hydrateUser(); // refresh AD balance
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Network error during unlock.');
        }
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground source={imageindex.FLickFlirt} resizeMode="cover" style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={StyleSheet.absoluteFill}
                    />
                    <Header />
                    <BackButton navigation={navigation} />

                    <View style={styles.content}>
                        {matches.length > 0 ? (
                            <>
                                <FlatList
                                    data={matches}
                                    numColumns={2}
                                    keyExtractor={item => item.id}
                                    ListHeaderComponent={<Text style={styles.headerText}>Your Matches</Text>}
                                    renderItem={({item}) => (
                                        <View style={styles.cardWrapper}>
                                            <FlickFlirtMatchCard
                                                userPicture={item.profilePicture}
                                                userName={item.username}
                                                onPress={() => navigation.navigate('ViewUserScreen', {userID: item.id})}
                                                influencer={false}
                                                akcruBadge={item.badge}
                                                userDesc={item.description}
                                                matchLabel={item.matchLabel}
                                            />
                                        </View>
                                    )}
                                />

                                {!unlocked && hiddenCount > 0 && (
                                    <View style={styles.unlockWrapper}>
                                        <Text style={styles.unlockText}>
                                            You have {hiddenCount} locked {hiddenCount > 1 ? 'matches' : 'match'}
                                        </Text>
                                        <AkcruButtons.XlLrgButton
                                            btnname="Unlock Matches"
                                            onPress={openModal}
                                            color={COLORS.PURPLE}
                                        />
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.noMatchWrapper}>
                                <Text style={styles.noMatchText}>You have no matches.</Text>
                                <AkcruButtons.XlLrgButton
                                    btnname="Start Over"
                                    onPress={() => navigation.navigate('FlickFlirtPref')}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>

            {/* 4) Unlock confirmation modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Unlock All Matches</Text>

                        <Text style={styles.modalLabel}>Choose an option:</Text>
                        {unlockOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.durationDays}
                                style={[
                                    styles.optionRow,
                                    selectedOpt?.durationDays === opt.durationDays && styles.optionRowSelected,
                                ]}
                                onPress={() => setSelectedOpt(opt)}>
                                <Text style={styles.optionText}>
                                    {opt.durationDays} days — {opt.cost} AD
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={confirmUnlock}>
                                <Text style={styles.modalBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {width: SIZES.ScreenWidth, height: SIZES.ScreenHeight},
    container: {flex: 1},
    content: {alignItems: 'center', justifyContent: 'center', marginHorizontal: SIZES.marginhorizontal},
    headerText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 10},
    cardWrapper: {margin: 5, alignItems: 'center'},
    noMatchWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    noMatchText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center', marginBottom: 20},
    unlockWrapper: {marginTop: 20, alignItems: 'center'},
    unlockText: {...FONTS.Title3, color: COLORS.LIGHTGREY, marginBottom: 10},

    // modal styles
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
    modalContent: {width: '80%', backgroundColor: COLORS.AKCRUBACKGROUND, borderRadius: 8, padding: 20},
    modalTitle: {...FONTS.Title2, marginBottom: 15, textAlign: 'center'},
    modalLabel: {...FONTS.Title3, marginBottom: 10},
    optionRow: {padding: 10, borderWidth: 1, borderColor: COLORS.LIGHTGREY, borderRadius: 4, marginBottom: 8},
    optionRowSelected: {backgroundColor: COLORS.PURPLE},
    optionText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center'},
    modalButtonsRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
    modalBtn: {flex: 1, padding: 10, borderRadius: 4, alignItems: 'center', marginHorizontal: 5},
    cancelBtn: {backgroundColor: COLORS.AKCRUBLUE},
    confirmBtn: {backgroundColor: COLORS.PURPLE},
    modalBtnText: {...FONTS.Title3, color: COLORS.WHITE},
});

export default FlickFlirtMatches;
