import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment-timezone';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import chooseMitStyles from '../../screens/userScreens/MITChoice/styles';
import {COLORS} from '../../../assets/constants';
import HexAvatar from '../HexAvatar';
import {getFollowers} from '../../lib/api/user.lib';
import {IMovie} from '../../../types';
import type {MitMovieUserPreviewCounterpart} from './types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import {
    capitalizeFirstLetterOfString,
    formatMovieDuration,
    formatNumber,
    getShortenedTimezone,
    mitStatusValueColor,
    selectAvatarBorderColor,
} from '../../util/util';

const COMBINED_CARD_GRADIENT: [string, string, string] = [
    'rgba(104, 214, 255, 0.96)',
    'rgba(154, 132, 255, 0.96)',
    'rgba(210, 136, 255, 0.96)',
];

export type MitMovieUserPreviewCardProps = {
    movie: IMovie;
    counterpartUser: MitMovieUserPreviewCounterpart;
    scheduleDate: string;
    timezone: string;
    /** Raw status for dot color (`mitStatusValueColor`) e.g. ACCEPTED, PENDING */
    statusCodeForDot: string;
    /** Matches ChooseMIT invite status row: "Awaiting Response" for pending, else code */
    statusDisplayLabel: string;
    buttonName?: string;
    onButtonPress?: () => void;
    onCardPress?: () => void;
};

/**
 * Movie + counterpart block from ChooseMITScreen `renderPendingInviteCombinedCard`
 * (used on ACCEPTED invite flow — gradient border user row, divider, poster + trailer strip).
 */
const MitMovieUserPreviewCard = ({
    movie,
    counterpartUser,
    scheduleDate,
    timezone,
    statusCodeForDot,
    statusDisplayLabel,
    buttonName = 'Movie Trailer',
    onButtonPress,
    onCardPress,
}: MitMovieUserPreviewCardProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [followerProfiles, setFollowerProfiles] = useState<Array<{id?: string}>>([]);

    useEffect(() => {
        let cancelled = false;
        const fetchFollowers = async () => {
            if (!counterpartUser.id) {
                return;
            }
            try {
                const result = await getFollowers(counterpartUser.id);
                if (cancelled || !result || typeof result !== 'object' || result === null) {
                    return;
                }
                const rec = result as {followers?: Array<{id?: string}>};
                if (Array.isArray(rec.followers)) {
                    setFollowerProfiles(rec.followers);
                }
            } catch {
                /* keep empty follower count */
            }
        };
        fetchFollowers();
        return () => {
            cancelled = true;
        };
    }, [counterpartUser.id]);

    const inviteStatusColor = mitStatusValueColor(statusCodeForDot);

    const inviteDayLabel =
        scheduleDate && timezone ? moment(scheduleDate).tz(timezone).format('dddd') : '';
    const inviteDateTimeLabel =
        scheduleDate && timezone
            ? `${moment(scheduleDate).tz(timezone).format('MMM D')} • ${moment(scheduleDate)
                  .tz(timezone)
                  .format('h:mm A')} ${getShortenedTimezone(timezone)}`
            : '';

    return (
        <LinearGradient
            colors={COMBINED_CARD_GRADIENT}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[chooseMitStyles.inviteInfoCardBorder, {marginTop: 12}]}>
            <TouchableOpacity
                activeOpacity={onCardPress ? 0.9 : 1}
                onPress={onCardPress}
                disabled={!onCardPress}
                style={{backgroundColor: 'rgba(0,0,0,0.82)', borderRadius: 16, padding: 8}}>
                <View
                    style={[
                        chooseMitStyles.inviteInfoCard,
                        {backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0},
                    ]}>
                    <View style={chooseMitStyles.inviteAvatarWrap}>
                        <TouchableOpacity
                            onPress={() =>
                                counterpartUser.id
                                    ? navigation.navigate('ViewUserScreen', {
                                          userID: counterpartUser.id,
                                      })
                                    : undefined
                            }
                            disabled={!counterpartUser.id}
                            accessibilityRole="button">
                            <HexAvatar
                                source={{uri: counterpartUser.profilePicture}}
                                size={54}
                                bordercolor={selectAvatarBorderColor(counterpartUser.badge ?? 'AKCRUIT')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={chooseMitStyles.inviteInfoBody}>
                        <Text style={chooseMitStyles.inviteInfoUsername} numberOfLines={1}>
                            @{counterpartUser.username ?? 'user'}
                        </Text>
                        <View style={chooseMitStyles.inviteInfoMetaRow}>
                            <Icon name="calendar-outline" type="ionicon" size={14} color={COLORS.WHITE} />
                            <Text style={chooseMitStyles.inviteInfoMetaText}>{inviteDayLabel}</Text>
                        </View>
                        <View style={chooseMitStyles.inviteInfoMetaRow}>
                            <Icon name="time-outline" type="ionicon" size={14} color={COLORS.WHITE} />
                            <Text style={chooseMitStyles.inviteInfoMetaText}>{inviteDateTimeLabel}</Text>
                        </View>
                        <View style={chooseMitStyles.inviteInfoStatusRow}>
                            <View
                                style={[
                                    chooseMitStyles.inviteInfoStatusDot,
                                    {backgroundColor: inviteStatusColor},
                                ]}
                            />
                            <Text
                                style={[
                                    chooseMitStyles.inviteInfoStatusText,
                                    {
                                        color: COLORS.WHITE,
                                        textDecorationLine: 'underline',
                                        textDecorationColor: COLORS.WHITE,
                                    },
                                ]}>
                                {statusDisplayLabel}
                            </Text>
                        </View>
                    </View>
                    <View style={chooseMitStyles.inviteFollowerWrap}>
                        <Text style={chooseMitStyles.inviteFollowerCount}>
                            {formatNumber(followerProfiles.length)}
                        </Text>
                        <Text style={chooseMitStyles.inviteFollowerLabel}>Followers</Text>
                    </View>
                </View>
                <View style={{height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 8}} />
                <View
                    style={[
                        chooseMitStyles.inviteMovieCard,
                        {marginTop: 0, backgroundColor: 'transparent', paddingHorizontal: 0},
                    ]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() =>
                            navigation.navigate('ContentDetailScreen', {
                                id: movie.id,
                                movie: movie.title,
                            })
                        }>
                        <Image
                            source={{uri: movie.portraitURL || movie.landscapeURL}}
                            style={chooseMitStyles.inviteMoviePoster}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                    <View style={chooseMitStyles.inviteMovieInfo}>
                        <Text style={chooseMitStyles.inviteMovieTitle} numberOfLines={2}>
                            {movie.title}
                        </Text>
                        <Text style={chooseMitStyles.inviteMovieMeta}>
                            {movie.year} • {formatMovieDuration(movie.duration)}
                        </Text>
                        <View style={chooseMitStyles.inviteMovieTagRow}>
                            {movie.rated ? (
                                <Text style={chooseMitStyles.inviteMovieTag} numberOfLines={1}>
                                    {movie.rated}
                                </Text>
                            ) : null}
                            {movie.genres?.[0] ? (
                                <Text style={chooseMitStyles.inviteMovieTag} numberOfLines={1}>
                                    {capitalizeFirstLetterOfString(movie.genres[0])}
                                </Text>
                            ) : null}
                            {movie.rating != null ? (
                                <Text style={chooseMitStyles.inviteMovieTag} numberOfLines={1}>
                                    {movie.rating}/10
                                </Text>
                            ) : null}
                        </View>
                    </View>
                    {movie.trailerURL ? (
                        <View style={chooseMitStyles.inviteTrailerWrap}>
                            <LinearGradient
                                colors={['#00E5FF', '#7C4DFF', '#FF4FD8']}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                                style={chooseMitStyles.inviteTrailerGradient}>
                                <TouchableOpacity
                                    style={chooseMitStyles.inviteTrailerSideButton}
                                    activeOpacity={0.85}
                                    onPress={
                                        onButtonPress ??
                                        (() =>
                                            navigation.navigate('TrailerPlayer', {
                                                id: movie.id,
                                                trailerURL: movie.trailerURL,
                                                landscapeURL: movie.landscapeURL,
                                            }))
                                    }>
                                    <Icon
                                        name="play"
                                        type="ionicon"
                                        size={12}
                                        color={COLORS.WHITE}
                                        style={chooseMitStyles.inviteTrailerIcon}
                                    />
                                    <Text style={chooseMitStyles.inviteTrailerButtonText}>{buttonName}</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ) : null}
                </View>
            </TouchableOpacity>
        </LinearGradient>
    );
};

export default MitMovieUserPreviewCard;
