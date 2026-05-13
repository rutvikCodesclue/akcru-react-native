import React from 'react';
import {View, Text, Modal, StyleSheet, Pressable, Image, useWindowDimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../assets/constants';
import {IMovie} from '../../types';

interface SoloPauseModalProps {
    visible: boolean;
    onClose: () => void;
    onSendInvite: () => void;
    movie: IMovie | null;
}

const SoloPauseModal = ({
    visible,
    onClose,
    onSendInvite,
    movie,
}: SoloPauseModalProps) => {
    const {width, height} = useWindowDimensions();
    const isLandscape = width > height;

    if (!movie) {
        return (
            <Modal
                transparent
                animationType="fade"
                visible={visible}
                onRequestClose={onClose}
                supportedOrientations={['portrait', 'landscape']}>
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                    <View style={[styles.modalContainer, {padding: 24, minWidth: 280}]}>
                        <Text style={[styles.heading, {marginBottom: 20}]}>Paused</Text>
                        <Pressable onPress={onClose} style={[styles.dismissButton, {height: 48}]}>
                            <Text style={styles.dismissButtonText}>Resume</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        );
    }

    const tags = (movie.genres ?? []).slice(0, 3);

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
            supportedOrientations={['portrait', 'landscape']}>
            <View style={styles.modalOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                {/* Gradient Border Effect */}
                <LinearGradient
                    colors={['rgba(255, 95, 184, 0.4)', 'rgba(143, 0, 255, 0.4)', 'rgba(255, 95, 184, 0.2)']}
                    style={[
                        styles.gradientBorderWrap,
                        isLandscape ? {width: '85%', maxWidth: 700} : {width: '100%'}
                    ]}>

                    <LinearGradient
                        colors={['rgba(26, 11, 46, 0.75)', 'rgba(13, 5, 24, 0.9)']}
                        style={styles.modalContainer}>

                        <View style={[
                            styles.modalContent,
                            isLandscape ? {flexDirection: 'row', alignItems: 'flex-start'} : {alignItems: 'center'}
                        ]}>
                            <View style={[
                                styles.moviePreviewCard,
                                isLandscape ? {flex: 0.4, marginBottom: 0, marginRight: 20} : {width: '100%'}
                            ]}>
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

                            <View style={isLandscape ? {flex: 0.6} : {width: '100%'}}>
                                <Text style={[
                                    styles.heading,
                                    isLandscape ? {textAlign: 'left', fontSize: 20, marginBottom: 16} : {}
                                ]}>
                                    Pause… or bring someone in?
                                </Text>

                                <View style={styles.buttonContainer}>
                                    <Pressable onPress={onSendInvite} style={styles.inviteButtonPressable}>
                                        <LinearGradient
                                            colors={['#C058FF', '#7C3AFF']}
                                            start={{x: 0, y: 0}}
                                            end={{x: 1, y: 0}}
                                            style={[styles.inviteButton, isLandscape ? {height: 44} : {}]}>
                                            <Icon
                                                name="heart"
                                                type="material-community"
                                                color={COLORS.WHITE}
                                                size={isLandscape ? 20 : 24}
                                                style={{marginRight: 10}}
                                            />
                                            <Text style={[styles.inviteButtonText, isLandscape ? {fontSize: 14} : {}]}>
                                                Invite Someone
                                            </Text>
                                        </LinearGradient>
                                    </Pressable>

                                    <Pressable onPress={onClose} style={[styles.dismissButton, isLandscape ? {height: 44} : {}]}>
                                        <Text style={[styles.dismissButtonText, isLandscape ? {fontSize: 14} : {}]}>
                                            Resume
                                        </Text>
                                    </Pressable>
                                </View>
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
    modalContent: {
        width: '100%',
        zIndex: 1,
    },
    moviePreviewCard: {
        flexDirection: 'row',
        paddingVertical: 4,
        marginBottom: 12,
    },
    poster: {
        width: 80,
        height: 120,
        borderRadius: 12,
    },
    movieInfo: {
        flex: 1,
        marginLeft: 14,
        paddingTop: 2,
    },
    movieTitle: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontSize: 18,
        letterSpacing: 0.5,
    },
    movieYear: {
        ...FONTS.paragraph5,
        color: '#9D62FF',
        fontSize: 13,
        marginTop: 2,
        fontWeight: '600',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        gap: 4,
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    tagText: {
        ...FONTS.paragraph6,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '600',
    },
    heading: {
        ...FONTS.Title1,
        color: COLORS.WHITE,
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
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

export default SoloPauseModal;
