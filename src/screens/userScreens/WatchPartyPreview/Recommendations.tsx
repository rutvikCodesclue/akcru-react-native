import React, {Fragment, useState} from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Platform,
    SafeAreaView,
} from 'react-native';
import {COLORS, FONTS} from '../../../../assets/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VoiceIsolationModeGIF = require('../../../../assets/video/voice-isolation-guide.gif');
const VOICE_MODE_RECOMMENDATION_KEY = 'voice-mode-recommendation-shown';

export function Recommendations() {
    const [showHeadphonesModal, setShowHeadphonesModal] = useState(true);
    const [showGifModal, setShowGifModal] = useState(false);
    const [isGifLoading, setIsGifLoading] = useState(true);

    const handlePressOk = async () => {
        setShowHeadphonesModal(false);
        if (Platform.OS !== 'ios') {
            return;
        }
        const isRecommendationAlreadyShown = await AsyncStorage.getItem(VOICE_MODE_RECOMMENDATION_KEY);
        if (!isRecommendationAlreadyShown) {
            await AsyncStorage.setItem(VOICE_MODE_RECOMMENDATION_KEY, 'true');
            setShowGifModal(true);
        }
        setShowGifModal(true);
    };

    const handleSkipGif = () => {
        setShowGifModal(false);
    };

    return (
        <Fragment>
            <Modal animationType="fade" transparent={true} visible={showHeadphonesModal}>
                <View style={styles.container}>
                    <View style={styles.textBackground}>
                        <Text style={styles.text}>Please use headphones for better experience.</Text>
                        <TouchableOpacity onPress={handlePressOk}>
                            <Text style={styles.buttonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={false}
                visible={showGifModal}
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <SafeAreaView style={styles.gifContainer}>
                    <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
                        <Text style={{color: COLORS.PINK, fontSize: 16, fontFamily: 'Montserrat-Bold'}}>
                            Recommended settings for better experience
                        </Text>
                    </View>
                    <View style={styles.loaderContainer}>
                        {isGifLoading && <ActivityIndicator size="large" color={COLORS.PINK} style={styles.loader} />}
                        <Image
                            source={VoiceIsolationModeGIF}
                            style={styles.gif}
                            onLoadStart={() => setIsGifLoading(true)}
                            onLoadEnd={() => setIsGifLoading(false)}
                            resizeMode="contain"
                        />
                    </View>
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkipGif}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.OVERLAY_BLACK_50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBackground: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 15,
    },
    text: {
        ...FONTS.Title3,
        marginBottom: 10,
        textAlign: 'center',
    },
    buttonText: {
        ...FONTS.Title2,
        marginBottom: 10,
        textAlign: 'center',
        color: COLORS.PINK,
    },
    gifContainer: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 30,
    },
    gif: {
        width: '70%',
        aspectRatio: 9 / 16,
        height: 'auto',
        borderColor: COLORS.PINK,
        borderRadius: 10,
        borderWidth: 1,
    },
    loader: {
        position: 'absolute',
        zIndex: 1,
    },
    loaderContainer: {
        height: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    skipButton: {
        padding: 10,
        borderRadius: 5,
    },
    skipButtonText: {
        ...FONTS.Title3,
        color: COLORS.PINK,
    },
});
