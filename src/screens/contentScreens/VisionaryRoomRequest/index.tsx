import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
    View,
    Text,
    ScrollView,
    ImageBackground,
    Image,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import MITSwipe from '../../../components/MITSwipe';
import Header from '../../../components/header';
import AkcruLevels from '../../../components/akcruBadges';
import AkcruButtons from '../../../components/akcruButtons';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {acceptAMITInvite, declineAMITInvite} from '../../../lib/api/mit.lib';
import {IMovie, IUserProfile} from '../../../../types';
import moment from 'moment';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {IMessage} from 'react-native-gifted-chat';
import {HMSSDK} from '@100mslive/react-native-hms';
import {getMitMessages} from '../../../lib/api/rooms.lib';
import useAuthStore from '../../../stores/auth.store';
import HexAvatar from '../../../components/HexAvatar';
import {
    capitalizeFirstLetterOfString,
    formatMovieDuration,
    formatNumber,
    getShortenedTimezone,
    selectAvatarBorderColor,
} from '../../../util/util';
import FingerAnimation from '../../../components/FingerAnimation';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import {findAUser, getFollowers} from '../../../lib/api/user.lib';
import {getVisionaryRoom, requestDecision} from '../../../lib/api/visionary.lib';
import {MULTISIZES} from '../../../../assets/constants/theme';
import LoadingComponent from '../../../components/Loading';
import {findMovieById} from '../../../lib/api/movies.lib';
import { ClientStackParams } from '../../../navigation/ClientStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ChooseMITScreenNavigationProp = StackNavigationProp<UserProfileStackParams, 'ChooseMITScreen'>;

type ChooseMITScreenRouteProp = RouteProp<UserProfileStackParams, 'ChooseMITScreen'>;

type Props = {
    navigation: ChooseMITScreenNavigationProp;
    route: ChooseMITScreenRouteProp;
};

interface VisionaryRoom {
    id: string;
    movieId: string;
    movie: IMovie;
    startDate: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
    hostId: string;
    invitees: IUserProfile[];
    status: string;
}

const VisionaryRoomRequest = ({navigation, route}: Props) => {
    const navigation2 = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    const roomId = route.params?.roomId;
    const {user} = useAuthStore();
    const [visionaryRoom, setVisionaryRoom] = useState<VisionaryRoom>();
    const [creator, setCreator] = useState<IUserProfile>();
    const [movie, setMovie] = useState<IMovie | null>();
    const [isLoading, setIsLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [decisionMadeModal, setDecisionMadeModalVisible] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the visionary room
                const roomRes = await getVisionaryRoom(roomId);
                console.log('Fetched room:', roomRes);
                const room = roomRes?.visionaryRoom;

                setVisionaryRoom(room);

                if (room) {
                    
                    if (room.status !== 'PENDING') {
                        setDecisionMadeModalVisible(true);
                    } else {
                        setDecisionMadeModalVisible(false);
                    }
                    // Fetch the creator
                    try {
                        const creatorRes = await findAUser({id: room.hostId});
                        console.log('Creator:', creatorRes?.MITCount);
                        setCreator(creatorRes);
                    } catch (err) {
                        console.error('Failed to fetch room creator:', err);
                    }

                    // Fetch the movie
                    try {
                        const movieRes = await findMovieById(room.movieId);
                        console.log('Movie fetched:', movieRes);
                        setMovie(movieRes);
                    } catch (err) {
                        console.error('Failed to fetch movie:', err);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch visionary room:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (roomId) {
            fetchData();
        }
    }, [roomId]);

    // 👇 add to a list
    const users = [];
    users.push(user);
    // Access other passed parameters

    const [loading, setLoading] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const [invitedUsers, setInvitedUsers] = useState<IUserProfile[]>([]);
    // var roomId = '';

    const hmsInstanceRef = useRef<HMSSDK | null>(null);

    useEffect(() => {
        return () => {
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.removeAllListeners();
            hmsInstanceRef.current != null ?? hmsInstanceRef.current?.leave();
        };
    }, []);

    const handleDecision = async (decision: 'accept' | 'decline') => {
        setLoading(true);
        setAccepted(decision === 'accept');

        try {
            const apiDecision = decision === 'accept' ? 'ACCEPTED' : 'DECLINED';

            if (creator) {
                const data = await requestDecision(creator.id, roomId, apiDecision);
                console.log('data decision: ', data);
                if (data.success) {
                    if (decision === 'accept') {
                        setModalMessage(data.message || 'Success');
                        setModalVisible(true);
                    } else {
                        setModalMessage(data?.message || 'Something went wrong');
                        setModalVisible(true);
                    }
                } else {
                    console.error('API responded with failure.');
                }
            }
        } catch (err) {
            console.error('Failed to send decision:', err);
            setModalMessage('Request failed. Please try again.');
            setModalVisible(true);
        } finally {
            setLoading(false);
            setTimeout(() => setModalVisible(false), 2000);
            navigation2.navigate('HomeScreen');
        }
    };

    //Playing Trailer functions

    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
            Alert.alert('Trailer has finished playing!');
        }
    }, []);

    const toggleTrailerPlaying = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

    const handleAvatarPress = (user: any) => {
        // Navigate to the user's profile screen
        navigation.navigate('ViewUserScreen', {userID: user._id});
    };

    const [data, setData] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (visionaryRoom?.hostId) {
                const result = await getFollowers(visionaryRoom.hostId);

                if (result && result.followers && Array.isArray(result.followers)) {
                    setData(result.followers);
                }
            }
        };

        fetchData();
    }, [visionaryRoom?.hostId]);

    return (
        <TabContainer>
            {isLoading && <LoadingComponent />}

            {!isLoading && (
                <View style={{flex: 1}}>
                    <View style={styles.sheetcontainer}>
                        <ScrollView stickyHeaderIndices={[0]}>
                            <View>
                                <Header />
                            </View>
                            <View>
                                <View
                                    //   source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                                    //   resizeMode="cover"
                                    style={{height: SIZES.ScreenHeight / 4, marginTop: -60}}>
                                    <LinearGradient
                                        // Background Linear Gradient
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
                                                marginTop: 10,
                                            }}>
                                            <Text style={styles.screenTitle}>Visionary Room Request</Text>
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
                                        </View>
                                        <View>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={{...FONTS.Username}}>{creator?.username}</Text>
                                                {creator?.ownerStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.STARGOLD}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                                {creator?.companyStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.WHITE}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                                {creator?.influencerStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.AKCRUBLUE}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                                {creator?.blackCloakStatus && (
                                                    <CustomIcon
                                                        name="ribbon"
                                                        type="ionicon"
                                                        color={COLORS.BLACKCLOAK}
                                                        baseSize={12}
                                                        style={{marginRight: 5}}
                                                    />
                                                )}
                                            </View>
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
                                                    {formatNumber(data.length)}
                                                </Text>
                                                <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>
                                                    Followers
                                                </Text>
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
                                                        {/* <Image source={{uri: movie?.portraitURL}} style={styles.poster} /> */}
                                                        <View style={styles.ticketContainer}>
                                                            <ImageBackground
                                                                source={{uri: movie?.portraitURL}}
                                                                style={styles.ticketImage}
                                                                resizeMode="cover">
                                                                <LinearGradient
                                                                    colors={['transparent', COLORS.AKCRUBLUE]}
                                                                    style={styles.linearGradient}>
                                                                    <View
                                                                        style={[
                                                                            styles.ticketCircle,
                                                                            {
                                                                                position: 'absolute',
                                                                                bottom: -10,
                                                                                left: -10,
                                                                            },
                                                                        ]}
                                                                    />
                                                                    <View
                                                                        style={[
                                                                            styles.ticketCircle,
                                                                            {
                                                                                position: 'absolute',
                                                                                bottom: -10,
                                                                                right: -10,
                                                                            },
                                                                        ]}
                                                                    />
                                                                </LinearGradient>
                                                            </ImageBackground>
                                                        </View>
                                                        <View style={styles.ticketFooter}>
                                                            <View
                                                                style={[
                                                                    styles.ticketCircle,
                                                                    {position: 'absolute', top: -10, left: -10},
                                                                ]}
                                                            />
                                                            <View
                                                                style={[
                                                                    styles.ticketCircle,
                                                                    {position: 'absolute', top: -10, right: -10},
                                                                ]}
                                                            />
                                                            <View style={{alignItems: 'center', marginVertical: 10}}>
                                                                <Image
                                                                    source={imageindex.barcode}
                                                                    style={{
                                                                        width: '75%',
                                                                        height: '100%',
                                                                    }}
                                                                />
                                                            </View>
                                                        </View>
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
                                                                {formatMovieDuration(movie?.duration ?? 0)}
                                                            </Text>
                                                        </View>
                                                        <View style={{flexDirection: 'row', marginVertical: 5}}>
                                                            <Text style={styles.drawfonttag}>{movie?.rated}</Text>
                                                            <Text style={styles.drawfonttag}>
                                                                {capitalizeFirstLetterOfString(movie?.genres[0] ?? '')}
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
                                                        {visionaryRoom && (
                                                            <View style={{marginVertical: 10}}>
                                                                <View style={styles.datebox}>
                                                                    <Text style={styles.datetext}>
                                                                        {' '}
                                                                        {moment(visionaryRoom?.startDate)
                                                                            .tz(visionaryRoom?.timezone ?? '')
                                                                            .format('ddd, MMM Do')}{' '}
                                                                    </Text>
                                                                    <Text style={styles.datetext}>@ </Text>
                                                                    <Text style={styles.datetext}>
                                                                        {/* render UTC Time w/ moment */}
                                                                        {moment(visionaryRoom?.startDate)
                                                                            .tz(visionaryRoom?.timezone ?? '')
                                                                            .format('h:mm A')}{' '}
                                                                        {getShortenedTimezone(
                                                                            visionaryRoom?.timezone ?? '',
                                                                        )}
                                                                    </Text>

                                                                    {/* <Text style={styles.datetext}>@ {MITTime}</Text> */}
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <Text
                                            style={{
                                                ...FONTS.Title2,
                                                color: COLORS.PINK,

                                                textAlign: 'center',
                                            }}>
                                            "{creator?.firstName}" wants to create a Visionary Room for "{movie?.title}
                                            ".
                                        </Text>
                                    </View>
                                    {/* Invited Users list */}
                                    {invitedUsers.length > 0 && (
                                        <>
                                            <View style={{marginTop: 20}}></View>
                                            <Text
                                                style={{
                                                    ...FONTS.Title3,
                                                    marginTop: 10,
                                                    marginBottom: 10,
                                                    marginRight: 10,
                                                    textAlign: 'center',
                                                    textDecorationLine: 'underline',
                                                }}>
                                                Invited Users
                                            </Text>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={{
                                                    paddingHorizontal: 10,
                                                    marginTop: 10,
                                                }}>
                                                {invitedUsers.map(user => (
                                                    <View
                                                        key={user.id}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginRight: 10, // spacing between cards
                                                        }}>
                                                        <View
                                                            style={{
                                                                borderRadius: 5,
                                                                backgroundColor: COLORS.TAGCOLOR,
                                                                width: SIZES.ScreenWidth / 1.8,
                                                                padding: 10,
                                                            }}>
                                                            <LinearGradient
                                                                colors={[
                                                                    COLORS.FADEDBLACK,
                                                                    'transparent',
                                                                    COLORS.FADEDBLACK,
                                                                ]}
                                                                style={{
                                                                    position: 'absolute',
                                                                    left: 0,
                                                                    right: 0,
                                                                    top: 0,
                                                                    bottom: 0,
                                                                    width: SIZES.ScreenWidth / 1.8,
                                                                    borderRadius: 5,
                                                                }}
                                                            />
                                                            <View
                                                                style={{
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'center',
                                                                }}>
                                                                <View>
                                                                    <HexAvatar
                                                                        source={
                                                                            user.profilePicture
                                                                                ? {uri: user.profilePicture}
                                                                                : imageindex.Akcruplaceholder
                                                                        }
                                                                        size={MULTISIZES.Xlarge43}
                                                                        bordercolor={selectAvatarBorderColor(
                                                                            user.badge ?? '',
                                                                        )}
                                                                    />
                                                                </View>
                                                                <View style={{marginLeft: 10}}>
                                                                    <Text style={{...FONTS.Title2}}>
                                                                        {user.username}
                                                                    </Text>
                                                                    {user.badge === 'AKCRUIT' && (
                                                                        <AkcruLevels.AkcruBadgeAkcruit />
                                                                    )}
                                                                    {user.badge === 'GUARDIAN' && (
                                                                        <AkcruLevels.AkcruBadgeGuardian />
                                                                    )}
                                                                    {user.badge === 'HERO' && (
                                                                        <AkcruLevels.AkcruBadgeHero />
                                                                    )}
                                                                    {user.badge === 'SUPERHERO' && (
                                                                        <AkcruLevels.AkcruBadgeSuperHero />
                                                                    )}
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </>
                                    )}
                                    <View style={{marginTop: 25}}>
                                        <MITSwipe
                                            decline={() => handleDecision('decline')}
                                            accept={() => handleDecision('accept')}
                                        />
                                    </View>
                                    <FingerAnimation />
                                    <View>
                                        <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center'}}>
                                            SWIPE BUTTON LEFT OR RIGHT.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {loading && (
                                <View
                                    style={{
                                        ...StyleSheet.absoluteFillObject,
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 10,
                                    }}>
                                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                    <Text style={{marginTop: 10}}>{accepted ? 'Accepting...' : 'Declining...'}</Text>
                                </View>
                            )}
                            {modalVisible && (
                                <View
                                    style={{
                                        ...StyleSheet.absoluteFillObject,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 20,
                                    }}>
                                    <View
                                        style={{
                                            backgroundColor: COLORS.WHITE,
                                            padding: 20,
                                            borderRadius: 12,
                                            minWidth: '70%',
                                            alignItems: 'center',
                                        }}>
                                        <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.BLACK}}>
                                            {modalMessage}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                        {decisionMadeModal && (
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 30,
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.WHITE,
                                        padding: 25,
                                        borderRadius: 15,
                                        minWidth: '75%',
                                        alignItems: 'center',
                                    }}>
                                    <Text style={{...FONTS.Title2, color: COLORS.BLACK, textAlign: 'center'}}>
                                        This Visionary Room request is already accepted/declined.
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setDecisionMadeModalVisible(false)
                                            navigation2.navigate('HomeScreen');
                                        }}
                                        style={{
                                            marginTop: 20,
                                            paddingVertical: 8,
                                            paddingHorizontal: 20,
                                            borderRadius: 8,
                                            backgroundColor: COLORS.AKCRUBLUE,
                                        }}>
                                        <Text style={{color: COLORS.WHITE, ...FONTS.Title3}}>Got it</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </TabContainer>
    );
};

export default VisionaryRoomRequest;
