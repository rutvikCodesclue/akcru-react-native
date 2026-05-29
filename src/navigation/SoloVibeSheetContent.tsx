import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Icon} from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS, FONTS} from '../../assets/constants';

export type SoloVibeOption = {
    id: string;
    emoji: string;
    title: string;
};

type SoloVibeSheetContentProps = {
    selectedSoloVibeId: string | null;
    soloVibeOptions: SoloVibeOption[];
    onSelectSoloVibe: (id: string) => void;
    onBack: () => void;
    onClose: () => void;
    onStartSession: (selectedVibeId?: string) => void;
};

export default function SoloVibeSheetContent({
    selectedSoloVibeId,
    soloVibeOptions,
    onSelectSoloVibe,
    onBack,
    onClose,
    onStartSession,
}: SoloVibeSheetContentProps) {
    return (
        <>
            <View style={styles.soloSheetHeaderWrap}>
                <Pressable style={styles.soloHeaderBackButton} onPress={onBack}>
                    <Icon name="arrow-left" type="material-community" color={COLORS.WHITE} size={20} />
                </Pressable>
                <View style={styles.soloHeaderTitleWrap}>
                    <Text style={styles.soloHeaderTitle}>Your night. Your vibe.</Text>
                    <Text style={styles.soloHeaderSubtitle}>Set the tone for your session</Text>
                </View>
                <Pressable style={styles.sheetCloseButton} onPress={onClose}>
                    <Icon name="close" type="material-community" color={COLORS.WHITE} size={18} />
                </Pressable>
            </View>
            <View style={styles.soloVibesGrid}>
                {soloVibeOptions.map((option) => (
                    <Pressable
                        key={option.id}
                        style={[
                            styles.soloVibeCard,
                            selectedSoloVibeId === option.id ? styles.soloVibeCardSelected : undefined,
                            option.id === 'invite' ? styles.soloVibeInviteCard : undefined,
                        ]}
                        onPress={() => onSelectSoloVibe(option.id)}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0)', COLORS.OVERLAY_WHITE_45, 'rgba(255,255,255,0)']}
                            start={{x: 0, y: 0.5}}
                            end={{x: 1, y: 0.5}}
                            style={styles.soloVibeTextLine}
                        />
                        <Text style={styles.soloVibeEmoji}>{option.emoji}</Text>
                        <Text style={styles.soloVibeTitle}>{option.title}</Text>
                    </Pressable>
                ))}
            </View>
            <View style={styles.soloStartButtonGlow}>
                <Pressable
                    style={styles.soloStartButtonTouchable}
                    onPress={() => onStartSession(selectedSoloVibeId ?? undefined)}>
                    <LinearGradient
                        colors={['#172554', '#3730a3', '#7c3aed', '#c026d3']}
                        start={{x: 0, y: 0.5}}
                        end={{x: 1, y: 0.5}}
                        style={styles.soloStartButtonGradient}>
                        <Text style={styles.soloStartButtonText}>Start Session</Text>
                        <Icon
                            name="arrow-right"
                            type="material-community"
                            color="#c4b5fd"
                            size={18}
                            style={styles.soloStartButtonIcon}
                        />
                    </LinearGradient>
                </Pressable>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    sheetCloseButton: {
        position: 'absolute',
        top: -2,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(176, 132, 255, 0.55)',
        backgroundColor: 'rgba(24, 16, 44, 0.92)',
    },
    soloSheetHeaderWrap: {
        marginBottom: 2,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 30,
    },
    soloHeaderBackButton: {
        position: 'absolute',
        top: -2,
        left: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(176, 132, 255, 0.55)',
        backgroundColor: 'rgba(24, 16, 44, 0.92)',
    },
    soloHeaderTitleWrap: {
        alignItems: 'center',
    },
    soloHeaderTitle: {
        color: COLORS.WHITE,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    soloHeaderSubtitle: {
        marginTop: 4,
        color: COLORS.OVERLAY_WHITE_72,
        fontSize: 13,
        textAlign: 'center',
    },
    soloVibesGrid: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    soloVibeCard: {
        width: '48%',
        minHeight: 116,
        borderRadius: 18,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(176, 132, 255, 0.55)',
        backgroundColor: 'rgba(53, 31, 89, 0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    soloVibeCardSelected: {
        borderColor: '#C78BFF',
        borderWidth: 2,
        backgroundColor: '#1D1332',
        shadowColor: '#BB77FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 18,
        elevation: 12,
    },
    soloVibeInviteCard: {
        width: '100%',
        minHeight: 92,
    },
    soloVibeEmoji: {
        fontSize: 34,
        textShadowColor: 'rgba(210, 160, 255, 0.7)',
        textShadowOffset: {width: 0, height: 0},
        textShadowRadius: 8,
    },
    soloVibeTitle: {
        marginTop: 8,
        marginBottom: 8,
        color: COLORS.WHITE,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    soloVibeTextLine: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
        height: 1.5,
        borderRadius: 999,
    },
    soloStartButtonGlow: {
        marginTop: 14,
        marginBottom: 6,
        alignSelf: 'center',
        width: '64%',
        maxWidth: 320,
        borderRadius: 14,
    },
    soloStartButtonTouchable: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    soloStartButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 18,
    },
    soloStartButtonText: {
        ...FONTS.Title2,
    },
    soloStartButtonIcon: {
        marginLeft: 10,
    },
});
