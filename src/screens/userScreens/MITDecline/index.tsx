import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, Image, SafeAreaView} from 'react-native';
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {RouteProp} from '@react-navigation/native';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import {IMovie, IUserProfile} from '../../../../types';
import {
    capitalizeFirstLetterOfString,
    formatMovieDuration,
    formatNumber,
    getShortenedTimezone,
    selectAvatarBorderColor,
} from '../../../util/util';
import moment from 'moment';
import HexAvatar from '../../../components/HexAvatar';
import {getFollowers} from '../../../lib/api/user.lib';
import CustomIcon from '../../../components/CustomIcon/CustomIcon';
import AkcruLevels from '../../../components/akcruBadges';
import {ClientTabsParams} from '../../../navigation/ClientTabNavigator';

type ChooseMITScreenNavigationProp = StackNavigationProp<ClientTabsParams, 'UserProfileStack'>;

type ChooseMITScreenRouteProp = RouteProp<ClientTabsParams, 'UserProfileStack'>;

type Props = {
    navigation: ChooseMITScreenNavigationProp;
    route: ChooseMITScreenRouteProp;
};

const DeclineMITScreen = ({navigation, route}: Props) => {
    const MITID: number | undefined = route.params?.MITID ?? null;
    const inviteeName: string | undefined = route.params?.inviteeName ?? null;

    const movie: IMovie | null = route.params?.movie ?? null;
    const creator: IUserProfile | null = route.params?.creator ?? null;
    const inviteDate: string | undefined = route.params?.inviteDate ?? null;
    const akcruBadge: any = route.params?.akcruBadge ?? null;
    const schedule: string | undefined = route.params?.schedule ?? null;
    const timezone: string | undefined = route.params?.timezone ?? null;
    const creatorID: IUserProfile | null = route.params?.creator?.id ?? null;

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('ClientTabNavigator', {screen: 'UserProfileStack'});
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    const [data, setData] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (creatorID) {
                const result = await getFollowers(creatorID);
                if (result && result.followers && Array.isArray(result.followers)) {
                    setData(result.followers);
                }
            }
        };

        fetchData();
    }, [creatorID]);

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.sheetcontainer}>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View>
                        <Header />
                    </View>
                    <View>
                        <View style={{height: SIZES.ScreenHeight * 0.2, marginTop: -60}}>
                            <LinearGradient
                                colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    height: SIZES.ScreenHeight * 0.2,
                                }}
                            />
                            <View style={styles.topcontainer}>
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            color: COLORS.CATPURPLGT,
                                            fontSize: 16,
                                            textAlign: 'center',
                                            paddingTop: '3%',
                                        }}>
                                        NO DATE
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: -50,
                                marginHorizontal: 15,
                                marginBottom: 20,
                            }}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{marginRight: 8}}>
                                    <HexAvatar
                                        source={{uri: creator?.profilePicture}}
                                        size={75}
                                        bordercolor={selectAvatarBorderColor(creator?.badge ?? 'AKCRUIT')}
                                    />
                                    <View />
                                </View>
                                <View>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{...FONTS.Title2}}>{creator?.username}</Text>
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
                                        <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>Followers</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                            <Text
                                style={{
                                    ...FONTS.Title3,
                                    color: COLORS.CATPURPLGT,
                                    textAlign: 'center',
                                    fontSize: 16,
                                    marginLeft: 10,
                                }}>
                                DECLINE
                            </Text>
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
                                                    <Text style={{...FONTS.paragraph1, marginHorizontal: 10}}>
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
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <Text
                                    style={{
                                        ...FONTS.paragraph1,
                                        textAlign: 'center',
                                    }}>
                                    We will notify "{creator?.firstName}" you have DECLINED to watch "{movie?.title}"
                                    on:
                                </Text>
                                <View style={{alignItems: 'center', marginTop: 30}}>
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
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default DeclineMITScreen;
