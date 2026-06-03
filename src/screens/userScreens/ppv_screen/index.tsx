import React from 'react';
import {View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, Pressable} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {Icon} from '@rneui/base';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import styles from './styles';
import {PPV_TOTAL_STEPS} from './ppvConstants';

type Props = StackScreenProps<UserProfileStackParams, 'PpvScreen'>;

const PPV_CURRENT_STEP = 1;

const creatorThumbnail = require('../../../../assets/images/intro_image.png');

export default function PpvScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    const handleContinue = () => {
        navigation.navigate('PpvMovieScreen');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <Text style={styles.brandTitle}>AKCRU</Text>
                <Text style={styles.welcomeLabel}>Welcome to</Text>
                <Text style={styles.presentsTitle}>AKCRU Presents</Text>

                <View style={styles.videoSection}>
                    <Pressable
                        style={styles.videoCard}
                        accessibilityRole="button"
                        accessibilityLabel="Play creator message">
                        <Image source={creatorThumbnail} style={styles.videoThumbnail} resizeMode="cover" />
                        <View style={styles.playOverlay}>
                            <View style={styles.playIconCircle}>
                                <Icon name="play" type="ionicon" size={28} color="#FFFFFF" />
                            </View>
                        </View>
                    </Pressable>
                </View>

                <Text style={styles.description}>A personal message from the creator.</Text>
                <Text style={styles.creatorName}>Lexington Rye</Text>
                <Text style={styles.creatorTagline}>Writer. Director. Storyteller.</Text>

                <View style={styles.spacer} />

                <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
                    <Text style={styles.continueLabel}>CONTINUE</Text>
                </TouchableOpacity>

                <View style={styles.paginationRow}>
                    {Array.from({length: PPV_TOTAL_STEPS}, (_, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === PPV_CURRENT_STEP;
                        return (
                            <View
                                key={stepNumber}
                                style={[
                                    styles.paginationDot,
                                    isActive ? styles.paginationDotActive : styles.paginationDotInactive,
                                ]}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
