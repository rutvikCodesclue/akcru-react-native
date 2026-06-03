import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Pressable,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {Icon} from '@rneui/base';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import movieStyles from './ppvMovieStyles';
import imageindex from '../../../../assets/images/imageindex';

type Props = StackScreenProps<UserProfileStackParams, 'PpvMovieScreen'>;

const trailerThumbnail = imageindex.Thriller;

export default function PpvMovieScreen({navigation}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    return (
        <SafeAreaView style={movieStyles.safeArea}>
            <View style={movieStyles.headerRow}>
                <TouchableOpacity
                    style={movieStyles.backButton}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Go back">
                    <Icon name="chevron-back" type="ionicon" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={movieStyles.headerTitle}>AKCRU Presents</Text>
                <View style={movieStyles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={movieStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <Text style={movieStyles.movieTitle}>Shadows</Text>
                <Text style={movieStyles.filmBy}>A film by Lexington Rye</Text>

                <View style={movieStyles.badge}>
                    <Text style={movieStyles.badgeText}>Limited Access Event</Text>
                </View>

                <View style={movieStyles.videoSection}>
                    <Pressable
                        style={movieStyles.videoCard}
                        accessibilityRole="button"
                        accessibilityLabel="Watch trailer">
                        <Image source={trailerThumbnail} style={movieStyles.videoThumbnail} resizeMode="cover" />
                        <View style={movieStyles.playOverlay}>
                            <View style={movieStyles.playControls}>
                                <View style={movieStyles.playIconCircle}>
                                    <Icon name="play" type="ionicon" size={26} color="#FFFFFF" />
                                </View>
                                <Text style={movieStyles.watchTrailerLabel}>Watch Trailer</Text>
                            </View>
                        </View>
                    </Pressable>
                </View>

                <View style={movieStyles.metaRow}>
                    <Text style={movieStyles.metaText}>Drama / Thriller • 2024 • 1h 47m</Text>
                    <View style={movieStyles.ratingBox}>
                        <Text style={movieStyles.ratingText}>R</Text>
                    </View>
                </View>

                <Text style={movieStyles.synopsis}>
                    When the past refuses to stay buried, one man is forced to confront the truth that changes
                    everything.
                </Text>
                <Text style={movieStyles.synopsisSecondary}>
                    This exclusive screening is available for a limited time only.
                </Text>

                <View style={movieStyles.screeningBox}>
                    <Text style={movieStyles.screeningHeading}>Screening Window</Text>
                    <Text style={movieStyles.screeningDates}>
                        May 24, 2025 7:00PM – May 26, 2025 7:00PM
                    </Text>
                </View>

                <TouchableOpacity style={movieStyles.accessButton} activeOpacity={0.85}>
                    <Text style={movieStyles.accessButtonLabel}>GET ACCESS – $9.99</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
