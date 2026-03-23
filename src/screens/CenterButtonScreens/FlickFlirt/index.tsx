// src/screens/FlickFlirtScreen.tsx

import React, {useState, useCallback, useEffect} from 'react';
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    Alert,
    DeviceEventEmitter,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';

import imageindex from '../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import Header from '../../../components/header';
import TabContainer from '../../../components/TabContainer/TabContainer';
import AkcruButtons from '../../../components/akcruButtons';
import {API} from '../../../clients/api.client';
import useAuthStore from '../../../stores/auth.store';
import {newFlickUserUpdate, newVisitFlick} from '../../../lib/api/flickflirt.lib';
import LoadingComponent from '../../../components/Loading';
import Video from 'react-native-video';
import {navigate} from '../../../util/RootNavigation';

const FlickFlirtScreen = () => {
    const {user, hydrateUser} = useAuthStore();
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [hasMatches, setHasMatches] = useState(false);
    const [resetModalVisible, setResetModalVisible] = useState(false);
    const [skipped, setSkipped] = useState(false);

    // 1) fetchMatches: check if user has any matches
    const fetchMatches = useCallback(async () => {
        try {
            const response = await API.get('/v1/flickflirt/matches');
            const payload = response?.data ?? response;
            if (payload.success && Array.isArray(payload.matches)) {
                setHasMatches(payload.matches.length > 0);
            } else {
                setHasMatches(false);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            setHasMatches(false);
        }
    }, []);

    // 2) refetch on screen focus
    useFocusEffect(
        useCallback(() => {
            hydrateUser();
            fetchMatches();
        }, [fetchMatches, hydrateUser]),
    );

    // 3) perform the reset when confirmed
    const handleConfirmReset = async () => {
        try {
            const response = await API.delete('/v1/flickflirt/reset-preferences');
            const payload = response?.data ?? response;
            if (payload.success) {
                setResetModalVisible(false);
                await hydrateUser();
                await fetchMatches();
                DeviceEventEmitter.emit('matchesUpdated');
            } else {
                Alert.alert('Error', payload.message || 'Could not reset preferences.');
            }
        } catch (error) {
            console.error('Error resetting preferences:', error);
            Alert.alert('Error', 'Network error while resetting.');
        }
    };

    const [firstTimeFlickUser, setFirstTimeFlickUser] = useState<any>(null);

    useEffect(() => {
        async function checkFirstTimeFlickUser() {
            try {
                const isNewVisitFlick = await newVisitFlick();
                if (isNewVisitFlick) {
                    setFirstTimeFlickUser(isNewVisitFlick);
                    console.log('Flick intro check: ', isNewVisitFlick);
                } else {
                    setFirstTimeFlickUser(false);
                }
            } catch (error) {
                console.log(error);
            }
        }
        checkFirstTimeFlickUser();
    }, []);

    const handleFlickVideoEnd = async () => {
        try {
            const updateResponse = await newFlickUserUpdate();
            if (updateResponse.success) {
                setFirstTimeFlickUser(false);
            } else {
                console.log('Failed to update user status');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setFirstTimeFlickUser(false);
            navigate('NoBottomStack', {screen: 'DiscoverArchetypeScreen'});
        }
    };

    // console.log('Render state →', {
    //     firstTimeFlickUser,
    //     skipped,
    // });

    if (firstTimeFlickUser === null) {
        return <LoadingComponent />;
    } else if (firstTimeFlickUser && !skipped) {
        return (
            <TabContainer>
                <SafeAreaView>
                    <Video
                        source={{uri: 'https://d17ybuhl825fg.cloudfront.net/Intro+Videos/FlickFlirt_Intro-2.mp4'}}
                        style={{height: '100%', width: '100%'}}
                        paused={false} // make it start
                        repeat={false}
                        resizeMode="cover"
                        onEnd={handleFlickVideoEnd}
                    />

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => {
                            setSkipped(true);
                            handleFlickVideoEnd();
                        }}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </TabContainer>
        );
    } else {
        return (
            <TabContainer>
                <ImageBackground
                    source={imageindex.FLickFlirt}
                    resizeMode="cover"
                    style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                    <SafeAreaView>
                        <LinearGradient
                            colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                            style={{position: 'absolute', top: 0, left: 0, right: 0, height: SIZES.ScreenHeight}}
                        />
                        <Header />

                        <View style={{justifyContent: 'center', height: SIZES.ScreenHeight * 0.6}}>
                            <View style={styles.textcontainer}>
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>Flick Flirt</Text>
                                <Text style={[styles.title, {color: COLORS.PINK, marginBottom: 15}]}>
                                    Elevate Your Movie Nights with a Dash of Romance!
                                </Text>
                                <Text style={styles.paragraph}>
                                    Welcome to Flick Flirt, the charming and playful side of Akcru designed to bring a
                                    touch of romance to your cinematic experiences. Flick Flirt is not just about
                                    watching movies; it's about connecting with someone special over shared film
                                    interests.
                                </Text>
                            </View>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.XlLrgButton
                                    btnname="Open FlickFlirt"
                                    onPress={() => navigate('NoBottomStack', {screen: 'FlickFlirtSwipe'})}
                                    color={COLORS.PURPLE}
                                />
                            </View>

                            {hasMatches && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.XlLrgButton
                                        btnname="You Have Matches"
                                        onPress={() => navigate('NoBottomStack', {screen: 'FlickFlirtMatches'})}
                                        color={COLORS.PURPLE}
                                    />
                                </View>
                            )}
                            {user?.hasSetFlirtPref && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.XlLrgButton
                                        btnname="Reset Preferences"
                                        onPress={() => setResetModalVisible(true)}
                                        color={COLORS.PURPLE}
                                    />
                                </View>
                            )}
                        </View>
                    </SafeAreaView>
                </ImageBackground>

                {/* ── Reset Confirmation Modal ── */}
                <Modal
                    visible={resetModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setResetModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Reset Flick Flirt Preferences?</Text>
                            <Text style={styles.modalText}>
                                This will clear all your swipes and matches. Are you sure you want to proceed?
                            </Text>
                            <View style={styles.modalButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.cancelBtn]}
                                    onPress={() => setResetModalVisible(false)}>
                                    <Text style={styles.modalBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.confirmBtn]}
                                    onPress={handleConfirmReset}>
                                    <Text style={styles.modalBtnText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </TabContainer>
        );
    }
};

export default FlickFlirtScreen;

const styles = StyleSheet.create({
    title: {
        ...FONTS.Title3,
        textAlign: 'center',
    },
    textcontainer: {
        alignSelf: 'center',
        width: SIZES.ScreenWidth * 0.93,
        padding: 15,
        borderRadius: 5,
    },
    paragraph: {
        ...FONTS.paragraph1,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderRadius: 8,
        padding: 20,
    },
    modalTitle: {
        ...FONTS.Title2,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalText: {
        ...FONTS.Title3,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalBtn: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 4,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: COLORS.AKCRUBLUE,
    },
    confirmBtn: {
        backgroundColor: COLORS.PURPLE,
    },
    modalBtnText: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
    },
    skipButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    skipButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
