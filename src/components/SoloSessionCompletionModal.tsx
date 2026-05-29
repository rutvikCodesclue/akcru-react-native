import React, {useEffect, useRef} from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Pressable,
    Image,
    Dimensions,
    Platform,
    Animated,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../assets/constants';
import {IMovie} from '../../types';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface SoloSessionCompletionModalProps {
    visible: boolean;
    onClose: () => void;
    onSendInvite: () => void;
    onFindMatches: () => void;
    onWatchSomethingElse: () => void;
    movie: IMovie | null;
}

const SoloSessionCompletionModal = ({
    visible,
    onClose,
    onSendInvite,
    onFindMatches,
    onWatchSomethingElse,
    movie,
}: SoloSessionCompletionModalProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(60)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 380,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 55,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(60);
        }
    }, [visible]);

    if (!visible) {
        return null;
    }

    const posterUri = movie?.portraitURL || movie?.landscapeURL || null;

    return (
        <Modal
            transparent
            animationType="none"
            visible={visible}
            onRequestClose={onClose}
            supportedOrientations={['portrait', 'landscape']}
            statusBarTranslucent={true}>

            <Animated.View style={[styles.modalOverlay, {opacity: fadeAnim}]}>
                {/* Blurred background */}
                {posterUri ? (
                    <Image
                        source={{uri: posterUri}}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                        blurRadius={Platform.OS === 'ios' ? 18 : 8}
                    />
                ) : (
                    <View style={[styles.backgroundImage, {backgroundColor: '#0D0014'}]} />
                )}

                {/* Gradient overlay */}
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,0.2)',
                        'rgba(10,0,18,0.6)',
                        'rgba(10,0,18,0.92)',
                        '#0A0012',
                    ]}
                    locations={[0, 0.3, 0.65, 1]}
                    style={styles.gradientOverlay}
                />

                {/* Close button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}>
                    <View style={styles.closeButtonInner}>
                        <Icon
                            name="close"
                            type="material"
                            color={COLORS.OVERLAY_WHITE_85}
                            size={18}
                        />
                    </View>
                </TouchableOpacity>

                {/* Scrollable content so nothing gets clipped */}
                <Animated.View
                    style={[
                        styles.contentWrapper,
                        {transform: [{translateY: slideAnim}]},
                    ]}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}>

                        {/* Mini poster */}
                        {posterUri && (
                            <View style={styles.posterWrapper}>
                                <Image
                                    source={{uri: posterUri}}
                                    style={styles.posterImage}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={[COLORS.TRANSPARENT, 'rgba(10,0,18,0.85)']}
                                    style={styles.posterGradient}
                                />
                            </View>
                        )}

                        {/* Movie title */}
                        {movie?.title ? (
                            <Text style={styles.movieTitle} numberOfLines={2}>
                                {movie.title}
                            </Text>
                        ) : null}

                        {/* Accent divider */}
                        <View style={styles.accentDivider}>
                            <View style={styles.accentLine} />
                            <Text style={styles.accentEmoji}>✨</Text>
                            <View style={styles.accentLine} />
                        </View>

                        {/* Heading */}
                        <View style={styles.textSection}>
                            <Text style={styles.heading}>That was a vibe</Text>
                            <Text style={styles.subheading}>
                                Now imagine watching it with someone special 👀
                            </Text>
                        </View>

                        {/* === BUTTON 1: Send Invite === */}
                        <Pressable
                            onPress={onSendInvite}
                            style={({pressed}) => [
                                styles.buttonPressable,
                                pressed && {opacity: 0.85},
                            ]}>
                            <LinearGradient
                                colors={['#C058FF', '#8B3FFF', '#6025D0']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 0}}
                                style={styles.primaryButton}>
                                <Text style={styles.btnEmoji}>💌</Text>
                                <Text style={styles.primaryButtonText}>
                                    Send This Movie as an Invite
                                </Text>
                                <Icon
                                    name="chevron-right"
                                    type="material"
                                    color={COLORS.OVERLAY_WHITE_55}
                                    size={20}
                                />
                            </LinearGradient>
                        </Pressable>

                        {/* === BUTTON 2: Find Matches === */}
                        <Pressable
                            onPress={onFindMatches}
                            style={({pressed}) => [
                                styles.buttonPressable,
                                {marginTop: 12},
                                pressed && {opacity: 0.82},
                            ]}>
                            <View style={styles.secondaryButton}>
                                <Text style={styles.btnEmoji}>🔥</Text>
                                <Text style={styles.secondaryButtonText}>
                                    Find Matches Who Love This
                                </Text>
                                <Icon
                                    name="chevron-right"
                                    type="material"
                                    color={COLORS.OVERLAY_WHITE_40}
                                    size={20}
                                />
                            </View>
                        </Pressable>

                        {/* === BUTTON 3: Watch Something Else === */}
                        <Pressable
                            onPress={onWatchSomethingElse}
                            style={({pressed}) => [
                                styles.buttonPressable,
                                {marginTop: 12},
                                pressed && {opacity: 0.82},
                            ]}>
                            <View style={styles.secondaryButton}>
                                <Text style={styles.btnEmoji}>🎬</Text>
                                <Text style={styles.secondaryButtonText}>
                                    Watch Something Else
                                </Text>
                                <Icon
                                    name="chevron-right"
                                    type="material"
                                    color={COLORS.OVERLAY_WHITE_40}
                                    size={20}
                                />
                            </View>
                        </Pressable>

                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: '#0A0012',
        justifyContent: 'flex-end',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 22,
        right: 18,
        zIndex: 30,
    },
    closeButtonInner: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.OVERLAY_WHITE_10,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentWrapper: {
        width: '100%',
        maxHeight: SCREEN_HEIGHT * 0.88,
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: Platform.OS === 'ios' ? 40 : 26,
        paddingTop: 12,
        alignItems: 'center',
    },
    posterWrapper: {
        width: 160,
        height: 230,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 14,
        shadowColor: '#8F00FF',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.65,
        shadowRadius: 20,
        elevation: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(192, 88, 255, 0.5)',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    posterGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
    },
    movieTitle: {
        ...FONTS.Title2,
        color: COLORS.OVERLAY_WHITE_85,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginBottom: 14,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 12,
    },
    accentDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '65%',
        marginBottom: 14,
    },
    accentLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(192, 88, 255, 0.3)',
        marginHorizontal: 8,
    },
    accentEmoji: {
        fontSize: 13,
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    heading: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontSize: 26,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    subheading: {
        ...FONTS.paragraph3,
        color: 'rgba(255, 255, 255, 0.62)',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 21,
    },
    buttonPressable: {
        width: '100%',
    },
    primaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 18,
        shadowColor: '#8F00FF',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    btnEmoji: {
        fontSize: 18,
        marginRight: 10,
    },
    primaryButtonText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    secondaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    secondaryButtonText: {
        ...FONTS.Title2,
        color: 'rgba(255, 255, 255, 0.88)',
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
});

export default SoloSessionCompletionModal;
