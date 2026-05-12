import React from 'react';
import {View, Text, Modal, StyleSheet, Pressable, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../assets/constants';
import {IMovie} from '../../types';

/** Static fog layer opacity (no pulse). */
const FOG_LAYER_OPACITY = 0.58;

type ModalFogOrb = {
    size: number;
    opacity: number;
    top?: number;
    bottom?: number;
    left?: number | string;
    right?: number;
};

/** Soft orbs positioned for the compact dialog (mirrors ChooseMITScreen layout spirit). */
const MODAL_FOG_ORBS: ModalFogOrb[] = [
    {size: 128, top: -28, right: -24, opacity: 0.28},
    {size: 92, top: 32, left: -16, opacity: 0.24},
    {size: 108, bottom: -20, left: '18%', opacity: 0.22},
];

const BetterTogetherFogLayer = ({active}: {active: boolean}) => {
    if (!active) {
        return null;
    }

    return (
        <View pointerEvents="none" style={[styles.fogField, {opacity: FOG_LAYER_OPACITY}]}>
            <LinearGradient
                colors={[
                    'rgba(255, 95, 184, 0.28)',
                    'rgba(220, 100, 255, 0.38)',
                    'rgba(192, 88, 255, 0.42)',
                    'rgba(124, 58, 255, 0.36)',
                    'rgba(143, 0, 255, 0.22)',
                ]}
                locations={[0, 0.22, 0.45, 0.72, 1]}
                start={{x: 0.1, y: 0}}
                end={{x: 0.95, y: 1}}
                style={StyleSheet.absoluteFill}
            />
            {MODAL_FOG_ORBS.map((orb, idx) => (
                <View
                    key={`better-together-fog-${idx}`}
                    style={[
                        styles.fogOrb,
                        {
                            width: orb.size,
                            height: orb.size,
                            borderRadius: orb.size / 2,
                            opacity: orb.opacity,
                            ...(orb.top !== undefined ? {top: orb.top} : {}),
                            ...(orb.bottom !== undefined ? {bottom: orb.bottom} : {}),
                            ...(orb.left !== undefined ? {left: orb.left} : {}),
                            ...(orb.right !== undefined ? {right: orb.right} : {}),
                        },
                    ]}
                />
            ))}
        </View>
    );
};

interface BetterTogetherModalProps {
    visible: boolean;
    onClose: () => void;
    onSendInvite: () => void;
    onWatchSolo: () => void;
    movie: IMovie | null;
}

const BetterTogetherModal = ({
    visible,
    onClose,
    onSendInvite,
    onWatchSolo,
    movie,
}: BetterTogetherModalProps) => {
    if (!movie) {
        return null;
    }

    const tags = (movie.genres ?? []).slice(0, 3);

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                {/* Gradient Border Effect */}
                <LinearGradient
                    colors={['rgba(255, 95, 184, 0.4)', 'rgba(143, 0, 255, 0.4)', 'rgba(255, 95, 184, 0.2)']}
                    style={styles.gradientBorderWrap}>

                    <LinearGradient
                        colors={['rgba(26, 11, 46, 0.75)', 'rgba(13, 5, 24, 0.9)']}
                        style={styles.modalContainer}>
                        <BetterTogetherFogLayer active={visible} />

                        <View style={styles.modalContent}>
                            <View style={styles.moviePreviewCard}>
                                <Image
                                    source={{uri: movie.portraitURL || movie.landscapeURL}}
                                    style={styles.poster}
                                    resizeMode="cover"
                                />
                                <View style={styles.movieInfo}>
                                    <Text
                                        style={styles.movieTitle}
                                        numberOfLines={2}
                                        ellipsizeMode="tail">
                                        {movie.title}
                                    </Text>
                                    {movie.year ? (
                                        <Text style={styles.movieYear}>{movie.year}</Text>
                                    ) : null}
                                    <View style={styles.tagRow}>
                                        {tags.map(tag => (
                                            <View key={tag} style={styles.tagBadge}>
                                                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.heading}>Better together?</Text>
                            <Text style={styles.subheading}>
                                Movies hit different when you're not watching alone.
                            </Text>

                            <View style={styles.buttonContainer}>
                                <Pressable onPress={onSendInvite} style={styles.inviteButtonPressable}>
                                    <LinearGradient
                                        colors={['#C058FF', '#7C3AFF']}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 0}}
                                        style={styles.inviteButton}>
                                        <Icon
                                            name="heart"
                                            type="material-community"
                                            color={COLORS.WHITE}
                                            size={24}
                                            style={{marginRight: 10}}
                                        />
                                        <Text style={styles.inviteButtonText}>Send Invite</Text>
                                    </LinearGradient>
                                </Pressable>

                                <Pressable onPress={onWatchSolo} style={styles.dismissButton}>
                                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                                </Pressable>
                            </View>
                        </View>
                    </LinearGradient>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    gradientBorderWrap: {
        width: '100%',
        padding: 1.5,
        borderRadius: 28,
    },
    modalContainer: {
        width: '100%',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    fogField: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    fogOrb: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 130, 210, 0.18)',
        borderWidth: 2,
        borderColor: 'rgba(210, 140, 255, 0.42)',
    },
    modalContent: {
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
    },
    moviePreviewCard: {
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 4,
        marginBottom: 12,
    },
    poster: {
        width: 100,
        height: 145,
        borderRadius: 12,
    },
    movieInfo: {
        flex: 1,
        marginLeft: 18,
        paddingTop: 4,
    },
    movieTitle: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontSize: 20,
        letterSpacing: 0.5,
    },
    movieYear: {
        ...FONTS.paragraph5,
        color: '#9D62FF',
        fontSize: 15,
        marginTop: 2,
        fontWeight: '600',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 6,
    },
    tagBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    tagText: {
        ...FONTS.paragraph6,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    heading: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 8,
    },
    subheading: {
        ...FONTS.paragraph4,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 18,
        paddingHorizontal: 10,
        fontSize: 13,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    inviteButtonPressable: {
        width: '100%',
    },
    inviteButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8F00FF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    inviteButtonText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    dismissButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dismissButtonText: {
        ...FONTS.Title2,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
    },
});

export default BetterTogetherModal;
