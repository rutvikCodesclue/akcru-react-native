import React, {useCallback, useMemo, useState} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {Icon} from '@rneui/base';
import LinearGradient from 'react-native-linear-gradient';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {useHideBottomTabBarWhileFocused} from '../../ChatScreens/useHideBottomTabBarWhileFocused';
import {COLORS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import thankYouStyles from './ppvThankYouStyles';
import {
    getDirectorName,
    getPpvCreatorSubtitle,
    getPpvMovieHeroUri,
    followPpvAkruUser,
    getPpvThankYouActors,
    getPpvThankYouDirectors,
    PpvCastMember,
    showPpvToast,
} from './ppvHelpers';

type Props = StackScreenProps<UserProfileStackParams, 'PpvThankYouScreen'>;

type CastRowProps = {
    name: string;
    avatarUri?: string;
};

type ActionRowProps = {
    title: string;
    subtitle?: string;
    fallbackLabel?: string;
    onPress: () => void;
};

const fallbackThumbnail = imageindex.Thriller;

function CastAvatar({avatarUri, fallbackLabel}: {avatarUri?: string; fallbackLabel: string}) {
    const [avatarFailed, setAvatarFailed] = useState(false);
    const showAvatar = Boolean(avatarUri) && !avatarFailed;

    if (showAvatar) {
        return (
            <Image
                source={{uri: avatarUri}}
                style={thankYouStyles.connectAvatar}
                onError={() => setAvatarFailed(true)}
            />
        );
    }

    return (
        <View style={thankYouStyles.connectAvatarFallback}>
            <Text style={thankYouStyles.connectAvatarFallbackLabel}>{fallbackLabel}</Text>
        </View>
    );
}

function CastRow({name, avatarUri}: CastRowProps) {
    const displayName = name.toUpperCase();

    return (
        <View style={thankYouStyles.connectRow}>
            <CastAvatar avatarUri={avatarUri} fallbackLabel={name.slice(0, 2).toUpperCase()} />
            <View style={thankYouStyles.connectCopy}>
                <Text style={thankYouStyles.connectTitle}>{displayName}</Text>
            </View>
        </View>
    );
}

function ActionRow({title, subtitle, fallbackLabel, onPress}: ActionRowProps) {
    return (
        <TouchableOpacity
            style={thankYouStyles.connectRow}
            activeOpacity={0.85}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title}>
            <CastAvatar avatarUri={undefined} fallbackLabel={fallbackLabel ?? title.slice(0, 2).toUpperCase()} />
            <View style={thankYouStyles.connectCopy}>
                <Text style={thankYouStyles.connectTitle}>{title}</Text>
                {subtitle ? <Text style={thankYouStyles.connectSubtitle}>{subtitle}</Text> : null}
            </View>
            <Icon name="chevron-forward" type="ionicon" size={18} color={COLORS.OVERLAY_WHITE_45} />
        </TouchableOpacity>
    );
}

function CastConnectList({members, label}: {members: PpvCastMember[]; label: string}) {
    if (members.length === 0) {
        return null;
    }

    return (
        <View style={thankYouStyles.castSection}>
            <Text style={thankYouStyles.castSectionLabel}>{label}</Text>
            {members.map(member => (
                <CastRow
                    key={`${label}-${member.id ?? member.name}`}
                    name={member.name}
                    avatarUri={member.avatarUri}
                />
            ))}
        </View>
    );
}

export default function PpvThankYouScreen({navigation, route}: Props) {
    useHideBottomTabBarWhileFocused(navigation);

    const movie = route.params.movie;
    const [heroImageFailed, setHeroImageFailed] = useState(false);

    const heroUri = useMemo(() => getPpvMovieHeroUri(movie), [movie]);
    const heroSource = useMemo(() => {
        if (!heroUri || heroImageFailed) {
            return fallbackThumbnail;
        }
        return {uri: heroUri};
    }, [heroUri, heroImageFailed]);

    const directorName = useMemo(() => getDirectorName(movie), [movie]);
    const creatorSubtitle = useMemo(() => getPpvCreatorSubtitle(movie), [movie]);
    const directors = useMemo(() => getPpvThankYouDirectors(movie), [movie]);
    const actors = useMemo(() => getPpvThankYouActors(movie), [movie]);

    const handleBackToHome = useCallback(() => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{name: 'PpvScreen'}],
            }),
        );
    }, [navigation]);

    const handleJoinAkru = useCallback(async () => {
        const result = await followPpvAkruUser();
        showPpvToast(result.message);
    }, []);

    const creatorDisplayName = directorName || movie.title;

    return (
        <SafeAreaView style={thankYouStyles.safeArea}>
            <View style={thankYouStyles.screenBody}>
            <ScrollView
                style={thankYouStyles.scrollView}
                contentContainerStyle={thankYouStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <Text style={thankYouStyles.title}>THANK YOU FOR{'\n'}SUPPORTING INDEPENDENT FILM.</Text>
                <Text style={thankYouStyles.subtitle}>
                    Your support helps creators like us continue telling stories that matter.
                </Text>

                <View style={thankYouStyles.creatorCard}>
                    <Image
                        source={heroSource}
                        style={thankYouStyles.creatorImage}
                        resizeMode="cover"
                        onError={() => setHeroImageFailed(true)}
                    />
                    <LinearGradient
                        colors={[
                            COLORS.TRANSPARENT,
                            'rgba(0,0,0,0.18)',
                            'rgba(0,0,0,0.55)',
                            'rgba(0,0,0,0.88)',
                            COLORS.BLACK,
                        ]}
                        locations={[0, 0.28, 0.55, 0.78, 1]}
                        style={thankYouStyles.creatorImageBottomShadow}
                        pointerEvents="none"
                    />
                    <View style={thankYouStyles.creatorOverlay} pointerEvents="none">
                        <Text style={thankYouStyles.creatorName}>— {creatorDisplayName}</Text>
                        <Text style={thankYouStyles.creatorRole}>{creatorSubtitle}</Text>
                    </View>
                </View>

                <Text style={thankYouStyles.sectionHeading}>STAY CONNECTED</Text>

                <View style={thankYouStyles.connectList}>
                    <CastConnectList members={directors} label="DIRECTOR" />
                    <CastConnectList members={actors} label="STARRING" />
                </View>
            </ScrollView>

            <View style={thankYouStyles.bottomFooter}>
                <Text style={thankYouStyles.joinAkruPrompt}>Join the AKCRU team for future update</Text>
                <ActionRow
                    title="JOIN AKCRU"
                    subtitle="Be first for future screenings"
                    fallbackLabel="AK"
                    onPress={handleJoinAkru}
                />
                <TouchableOpacity
                    style={thankYouStyles.homeButton}
                    activeOpacity={0.85}
                    onPress={handleBackToHome}
                    accessibilityRole="button"
                    accessibilityLabel="Back to home">
                    <Text style={thankYouStyles.homeButtonLabel}>BACK TO HOME</Text>
                </TouchableOpacity>
            </View>
            </View>
        </SafeAreaView>
    );
}
