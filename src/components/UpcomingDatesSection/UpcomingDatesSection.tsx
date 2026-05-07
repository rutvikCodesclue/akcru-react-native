import {View, Text, ScrollView, ActivityIndicator, StyleProp, ViewStyle, Alert} from 'react-native';
import ArchetypeHorizontalDivider from '../ArchetypeHorizontalDivider';
import React, {useState} from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import MitMovieUserPreviewCard from '../MitMovieUserPreviewCard';
import type {MitMovieUserPreviewCounterpart} from '../MitMovieUserPreviewCard';
import {getMyCRUViews} from '../../lib/api/cru.lib';
import {ICruView, IMITInvite, IUserProfile, IVisionaryRoom} from '../../../types';
import useAuthStore from '../../stores/auth.store';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getMyMITInvites} from '../../lib/api/mit.lib';
import {UseTabMenu} from '../../context/TabContext';
import {getAttendingRooms} from '../../lib/api/visionary.lib';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import moment from 'moment-timezone';
import {API} from '../../clients/api.client';
import {getShortenedTimezone} from '../../util/util';
import {navigate as rootNavigate} from '../../util/RootNavigation';

function mitInviteStatusDisplayLabel(statusRaw: string | undefined): string {
    const upper = (statusRaw ?? 'ACCEPTED').toString().trim().toUpperCase();
    return upper.includes('PENDING') ? 'Awaiting Response' : upper;
}

function visionaryStatusDisplayLabel(statusRaw: string | undefined): string {
    const upper = (statusRaw ?? 'ACCEPTED').toString().toUpperCase();
    if (upper === 'PENDING') {
        return 'Awaiting Response';
    }
    return upper.charAt(0) + upper.slice(1).toLowerCase().replace('_', ' ');
}

function counterpartFromUser(u: IUserProfile): MitMovieUserPreviewCounterpart {
    return {
        id: u.id,
        username: u.username,
        profilePicture: u.profilePicture,
        badge: u.badge,
    };
}

function counterpartFromCruCreator(item: ICruView): MitMovieUserPreviewCounterpart {
    const c = item.cru.creator as unknown as IUserProfile;
    return {
        id: item.cru.creatorId,
        username: c.username ?? '',
        profilePicture: c.profilePicture,
        badge: c.badge,
    };
}

export type UpcomingDatesSectionProps = {
    sectionTitle?: string;
    /** Omit inner ScrollView when nested inside another vertical scroll (e.g. profile FlatList header). */
    embeddedInParentScroll?: boolean;
    cardsBottomMargin?: number;
    dividerContainerStyle?: StyleProp<ViewStyle>;
};

const UpcomingDatesSection = ({
    sectionTitle = 'UPCOMING DATES',
    embeddedInParentScroll = false,
    cardsBottomMargin,
    dividerContainerStyle,
}: UpcomingDatesSectionProps) => {
    const user = useAuthStore(state => state.user);
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [myEvents, setMyEvents] = React.useState<(ICruView | IMITInvite | IVisionaryRoom)[]>([]);
    const {refetchDates, setRefetchDates} = UseTabMenu();

    const [loading, setLoading] = useState(true);

    const resolvedCardsBottomMargin =
        cardsBottomMargin ?? (embeddedInParentScroll ? 12 : 75);

    const checkTimeGate = async (
        type: 'MITInvite' | 'CRUView' | 'VisionaryRoom',
        scheduleTime: string,
        timezone: string,
        scheduleDate: string,
        payload: {
            id: string;
            movieId: string;
            isHost: boolean;
            creator: IUserProfile;
            creatorId: string;
            invitee: IUserProfile;
        },
    ) => {
        try {
            const movieTime =
                moment(scheduleTime, 'h:mm A').tz(timezone).format('h:mm A') + getShortenedTimezone(timezone);

            const res: any = await API.get(
                `/v1/user/checkUserPartyTimeZone?scheduleDate=${scheduleDate}&movietime=${movieTime}&movie_timezone=${timezone}`,
            );
            if (res?.data?.success === false) {
                Alert.alert('Unable to start date', res?.data?.message ?? "You can't join the party before time.");
                return;
            }

            navigation.navigate('WatchPartyPreview', {
                id: payload.id,
                type,
                userId: user?.id,
                movieId: payload.movieId,
                isHost: payload.isHost,
                scheduleTime,
                timezone,
                creator: payload.creator,
                creatorId: payload.creatorId,
                invitee: payload.invitee,
            });
        } catch (error: any) {
            const apiMessage =
                error?.response?.data?.message ||
                error?.message ||
                "You can't join the party before time.";
            Alert.alert('Unable to start date', apiMessage);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchMyEvents = async () => {
                try {
                    setLoading(true);
                    const myCRUViews = (await getMyCRUViews({upcoming: true})) ?? [];
                    const [acceptedMITs, pendingMITs] = await Promise.all([
                        getMyMITInvites({accepted: true, me: true}),
                        getMyMITInvites({pending: true}),
                    ]);
                    const myMITs = [...(acceptedMITs ?? []), ...(pendingMITs ?? [])].filter(
                        (invite, index, arr) => arr.findIndex(i => i.id === invite.id) === index,
                    );
                    const myVisionaryRooms = (await getAttendingRooms()) ?? [];

                    if (myCRUViews && myMITs && myVisionaryRooms) {
                        const events = [...myCRUViews, ...myMITs, ...myVisionaryRooms];

                        setMyEvents(
                            [...events].sort((a, b) => {
                                const timeA = new Date(a.startDate).getTime();
                                const timeB = new Date(b.startDate).getTime();

                                if (Number.isNaN(timeA) && Number.isNaN(timeB)) {
                                    return 0;
                                }
                                if (Number.isNaN(timeA)) {
                                    return 1;
                                }
                                if (Number.isNaN(timeB)) {
                                    return -1;
                                }
                                return timeA - timeB;
                            }),
                        );
                    }
                } catch (error) {
                    console.error('Error getting my Events:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchMyEvents();
            if (refetchDates) {
                setRefetchDates(false);
            }
        }, [refetchDates, setRefetchDates]),
    );

    const renderMyEvents = () => {
        if (loading) {
            return (
                <View
                    style={{
                        alignItems: 'center',
                        marginTop: embeddedInParentScroll ? 12 : 50,
                        marginBottom: embeddedInParentScroll ? 8 : 0,
                    }}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={{marginTop: 10, color: COLORS.DARKGREY}}>Fetching your dates...</Text>
                </View>
            );
        }
        if (myEvents.length === 0) {
            return null;
        }
        return myEvents.map(item => {
            if (item instanceof Object && 'cru' in item) {
                const cruItem = item as ICruView;
                const counterpart = counterpartFromCruCreator(cruItem);
                return (
                    <MitMovieUserPreviewCard
                        key={cruItem.id}
                        movie={cruItem.movie}
                        counterpartUser={counterpart}
                        scheduleDate={cruItem.startDate}
                        timezone={cruItem.timezone}
                        statusCodeForDot="ACCEPTED"
                        statusDisplayLabel="Scheduled"
                        buttonName="Start Date"
                    />
                );
            }
            if (item instanceof Object && 'invitee' in item) {
                const mitItem = item as IMITInvite;
                const counterpartUser =
                    mitItem.creator.id === user?.id ? mitItem.invitee : mitItem.creator;
                const counterpart = counterpartFromUser(counterpartUser);
                const mitDot = (mitItem.status ?? 'ACCEPTED').toString().trim().toUpperCase();
                const isPendingMIT = mitDot.includes('PENDING');
                const isAcceptedMIT = mitDot === 'ACCEPTED';
                const navigateToPendingMIT = () =>
                    rootNavigate('NoBottomStack', {
                        screen: 'ChooseMITScreen',
                        params: {
                            MITID: mitItem.id,
                            movie: mitItem.movie,
                            creator: mitItem.creator,
                            inviteDate: mitItem.createdAt,
                            akcruBadge: mitItem.invitee.badge,
                            schedule: mitItem.startDate,
                            timezone: mitItem.timezone,
                            invitee: mitItem.invitee,
                            expiresAt: mitItem.expiresAt,
                            status: mitItem.status,
                        },
                    });
                return (
                    <MitMovieUserPreviewCard
                        key={mitItem.id}
                        movie={mitItem.movie}
                        counterpartUser={counterpart}
                        scheduleDate={mitItem.startDate}
                        timezone={mitItem.timezone}
                        statusCodeForDot={mitDot}
                        statusDisplayLabel={mitInviteStatusDisplayLabel(mitItem.status)}
                        buttonName={isPendingMIT ? 'View Invite' : 'Start Date'}
                        onCardPress={
                            isAcceptedMIT
                                ? () =>
                                      navigation.navigate('ViewChat', {
                                          userId: counterpart.id,
                                          mItInviteId: mitItem.id,
                                          profilePicture: counterpart.profilePicture ?? '',
                                          username: counterpart.username ?? '',
                                          movie: mitItem.movie,
                                          schedule: mitItem.startDate,
                                          timezone: mitItem.timezone,
                                      })
                                : isPendingMIT
                                ? navigateToPendingMIT
                                : undefined
                        }
                        onButtonPress={
                            isPendingMIT
                                ? navigateToPendingMIT
                                : () =>
                                      checkTimeGate(
                                          'MITInvite',
                                          moment(mitItem.startDate).tz(mitItem.timezone).format('h:mm A'),
                                          mitItem.timezone,
                                          mitItem.startDate,
                                          {
                                              id: mitItem.id,
                                              movieId: mitItem.movie.id,
                                              isHost: mitItem.creator.id === user?.id,
                                              creator: mitItem.creator,
                                              creatorId: mitItem.creator.id,
                                              invitee: mitItem.invitee,
                                          },
                                      )
                        }
                    />
                );
            }
            const room = item as IVisionaryRoom;
            const counterpart = counterpartFromUser(room.creator);
            const visionaryDot = (room.status ?? 'ACCEPTED').toString().toUpperCase();
            return (
                <MitMovieUserPreviewCard
                    key={room.id}
                    movie={room.movie}
                    counterpartUser={counterpart}
                    scheduleDate={room.startDate}
                    timezone={room.timezone}
                    statusCodeForDot={visionaryDot}
                    statusDisplayLabel={`Visionary — ${visionaryStatusDisplayLabel(room.status)}`}
                    buttonName="Start Date"
                />
            );
        });
    };

    const body =
        loading || myEvents.length > 0 ? (
            <>
                <View>
                    <ArchetypeHorizontalDivider
                        title={sectionTitle}
                        containerStyle={[{marginBottom: 14}, dividerContainerStyle]}
                    />
                </View>
                <View style={{marginBottom: resolvedCardsBottomMargin}}>{renderMyEvents()}</View>
            </>
        ) : null;

    return (
        <View>
            {embeddedInParentScroll ? body : <ScrollView showsVerticalScrollIndicator={false}>{body}</ScrollView>}
        </View>
    );
};

export default UpcomingDatesSection;
