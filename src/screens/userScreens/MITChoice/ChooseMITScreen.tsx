import React, {useState, useRef, useEffect} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import MITSwipe from '../../../components/MITSwipe';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import AkcruButtons from '../../../components/akcruButtons';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import {RouteProp} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {acceptAMITInvite, declineAMITInvite} from '../../../lib/api/mit.lib';
import {IMovie, IUserProfile} from '../../../../types';
import moment from 'moment';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {IMessage} from 'react-native-gifted-chat';
import {HMSSDK} from '@100mslive/react-native-hms';
import {getTextMessages} from '../../../lib/api/rooms.lib';
import useAuthStore from '../../../stores/auth.store';
import HexAvatar from '../../../components/HexAvatar';
import {
    capitalizeFirstLetterOfString,
    formatMovieDuration,
    formatNumber,
    getShortenedTimezone,
    selectAvatarBorderColor,
} from '../../../util/util';

type ChooseMITScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'ChooseMITScreen'>;

type ChooseMITScreenRouteProp = RouteProp<UserProfileStackParams, 'ChooseMITScreen'>;

type Props = {
    navigation: ChooseMITScreenNavigationProp;
    route: ChooseMITScreenRouteProp;
};

const ChooseMITScreen = ({navigation, route}: Props) => {
    const MITID: number | undefined = route.params?.MITID ?? null;
    const {user} = useAuthStore();

    const movie: IMovie | null = route.params?.movie ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const invitee: IUserProfile | null = route.params?.invitee ?? null;
    const creatorID: IUserProfile | null = route.params?.creator?.id ?? null;
    const inviteeId: IUserProfile | null = route.params?.invitee?.id ?? null;
    const inviteDate: string | undefined = route.params?.inviteDate ?? null;
    const akcruBadge: IUserProfile = route.params?.akcruBadge ?? null;
    const schedule: string | undefined = route.params?.schedule ?? null;
    const timezone: string | undefined = route.params?.timezone ?? null;

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const [messages, setMessages] = useState<IMessage[]>([]);

    var roomId = '';

    const hmsInstanceRef = useRef<HMSSDK | null>(null);

    useEffect(() => {
        return () => {
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.removeAllListeners();
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.leave();
        };
    }, []);

    const getTextMessage = async (roomId: string) => {
        const response = await getTextMessages(roomId);

        setMessages(response!);
    };

    const handleDecline = () => {
        setIsLoading(true);
        //console.log('decline invite');
        declineAMITInvite({inviteId: MITID})
            .then(res => {
                //console.log('declined res:', res);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error declining invite:', error);
                setIsLoading(false);
            });
    };

    const handleAccept = () => {
        setIsLoading(true);
        //console.log('accept invite');
        acceptAMITInvite({inviteId: MITID})
            .then(res => {
                //console.log('accepted res:', res);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error accepting invite:', error);
                setIsLoading(false);
            });
    };

    const handleDeclineNavigation = () => {
        handleDecline();
        navigation.navigate('DeclineMITScreen', {
            MITID: MITID,
            movie: movie,
            creator: creator,
            inviteDate: inviteDate,
            akcruBadge: akcruBadge,
            schedule: schedule,
            timezone: timezone,
        });
    };

    const handleAcceptNavigation = () => {
        handleAccept();
        navigation.navigate('AcceptMITScreen', {
            MITID: MITID,
            movie: movie,
            creator: creator,
            inviteDate: inviteDate,
            akcruBadge: akcruBadge,
            schedule: schedule,
            timezone: timezone,
        });
    };

    const sayhi = () => {
        const isCurrentUserCreator = user?.id === creatorID;
        const receiverUserId = isCurrentUserCreator ? inviteeId : creatorID;
        const receiverProfilePicture = isCurrentUserCreator ? invitee?.profilePicture : creator?.profilePicture;
        const receiverUsername = isCurrentUserCreator ? invitee?.username : creator?.username;

        navigation.navigate('ViewChat', {
            mItInviteId: MITID,
            userId: receiverUserId,
            profilePicture: receiverProfilePicture,
            username: receiverUsername,
        });
    };

    return (
        <TabContainer>
            <View style={{flex: 1}}>
                <View style={styles.sheetcontainer}>
                    <ScrollView stickyHeaderIndices={[0]}>
                        <View>
                            <Header />
                        </View>
                        <View>
                            <View style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
                                <LinearGradient
                                    colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        height: SIZES.ScreenHeight / 4,
                                    }}
                                />
                                <View style={styles.topcontainer}>
                                    <TouchableOpacity onPress={() => navigation.navigate('UserMITHubScreen')}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                            <Icon
                                                name="chevron-back"
                                                type="ionicon"
                                                size={20}
                                                color={COLORS.LIGHTGREY}
                                            />
                                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={styles.screenTitle}>Movie Invite Ticket</Text>
                                            <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                                        </View>
                                        <TouchableOpacity onPress={() => sayhi()}>
                                            <Icon
                                                name="chatbox-ellipses"
                                                type="ionicon"
                                                size={30}
                                                color={COLORS.PURPLE}
                                                style={{marginRight: 20}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: -60,
                                    marginHorizontal: 15,
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{marginRight: 8}}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.navigate('ViewUserScreen', {userID: creator?.id})
                                            }>
                                            <HexAvatar
                                                source={{uri: creator?.profilePicture}}
                                                size={58}
                                                bordercolor={selectAvatarBorderColor(creator?.badge ?? 'AKCRUIT')}
                                            />
                                        </TouchableOpacity>
                                        <View />

                                        {/* <View
                                            style={{
                                                backgroundColor: 'green',
                                                height: 12,
                                                width: 12,
                                                borderRadius: 8,
                                                position: 'absolute',
                                                right: 8,
                                            }}
                                        /> */}
                                    </View>
                                    <View style={{width: SIZES.ScreenWidth / 2.5}}>
                                        <Text style={{...FONTS.Username}}>{creator?.username}</Text>
                                        <Text style={{...FONTS.paragraph1}}>{creator?.firstName}</Text>
                                        {creator?.badge === 'AKCRUIT' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeAkcruit />
                                            </View>
                                        )}
                                        {creator?.badge === 'GUARDIAN' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeGuardian />
                                            </View>
                                        )}
                                        {creator?.badge === 'HERO' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeHero />
                                            </View>
                                        )}
                                        {creator?.badge === 'SUPERHERO' && (
                                            <View>
                                                <AkcruLevels.AkcruBadgeSuperHero />
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={{marginVertical: 20}}>
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            borderLeftWidth: 1,
                                            borderColor: COLORS.DARKGREY,
                                            paddingLeft: 10,
                                        }}>
                                        <View
                                            style={{
                                                width: 100,
                                                height: 60,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{...FONTS.Title1, color: COLORS.AKCRUBLUE}}>
                                                {formatNumber(creator?.followerCount)}
                                            </Text>
                                            <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>Followers</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={styles.bottomcontainer}>
                                    <View style={{alignItems: 'center', marginBottom: 10}}>
                                        <View style={{marginTop: 10}}>
                                            <View style={{flexDirection: 'row', width: '75%'}}>
                                                <View style={{marginRight: 10}}>
                                                    <Image source={{uri: movie?.portraitURL}} style={styles.poster} />
                                                </View>
                                                <View style={{}}>
                                                    <Text style={{...FONTS.Username}}>{movie?.title}</Text>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            marginBottom: 5,
                                                            alignItems: 'center',
                                                        }}>
                                                        <Text style={{...FONTS.paragraph1}}>{movie?.year}</Text>
                                                        <Text
                                                            style={{
                                                                ...FONTS.paragraph1,

                                                                marginHorizontal: 10,
                                                            }}>
                                                            {formatMovieDuration(movie?.duration)}
                                                        </Text>
                                                    </View>
                                                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                                                        <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                        <Text style={styles.drawfonttag}>
                                                            {capitalizeFirstLetterOfString(movie?.genres[0])}
                                                        </Text>

                                                        <Text style={styles.drawfonttag}>{movie?.rating}/10</Text>
                                                    </View>
                                                    <AkcruButtons.SmallButton
                                                        btnname="Play Trailer"
                                                        onPress={() => {
                                                            navigation.navigate('TrailerPlayer', {
                                                                id: movie?.id,
                                                                trailerURL: movie?.trailerURL,
                                                                landscapeURL: movie?.landscapeURL,
                                                            });
                                                        }}
                                                        color={COLORS.PURPLE}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <Text
                                        style={{
                                            ...FONTS.Title2AkcruBlue,

                                            textAlign: 'center',
                                            color: COLORS.PURPLE,
                                        }}>
                                        "{creator?.firstName}" wants to watch "{movie?.title}" with you on:
                                    </Text>
                                </View>
                                <View style={{alignItems: 'center', marginVertical: 10}}>
                                    <View style={styles.datebox}>
                                        <Text style={styles.datetext}>
                                            {' '}
                                            {moment(schedule).tz(timezone).format('ddd, MMM Do')}{' '}
                                        </Text>
                                        <Text style={styles.datetext}>@ </Text>
                                        <Text style={styles.datetext}>
                                            {moment(schedule).tz(timezone).format('h:mm A')}{' '}
                                            {getShortenedTimezone(timezone)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{marginTop: 25}}>
                                    <MITSwipe decline={handleDeclineNavigation} accept={handleAcceptNavigation} />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </TabContainer>
    );
};

export default ChooseMITScreen;
