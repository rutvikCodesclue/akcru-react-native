import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {IMovie, IUserProfile} from '../../../types';
import AkcruLevels from '../akcruBadges';
import {getShortenedTimezone, selectAvatarBorderColor} from '../../util/util';
import moment from 'moment';
import HexAvatar from '../HexAvatar';

type MITInviteHubCardProp = {
    MITInviteID: any;
    movie: IMovie;
    creator: IUserProfile;
    inviteDate: string;
    onPress: () => void;
    akcruBadge: any;
    scheduleDate: string;
    scheduleTime: string;
    timezone: string;
};

const MITInviteHubCard = ({movie, creator, onPress, scheduleDate, scheduleTime, timezone}: MITInviteHubCardProp) => {
    return (
        <View
            style={{
                backgroundColor: '#1C202A',
                borderRadius: 5,
                borderWidth: 1,
                borderColor: COLORS.AKCRUBLUE,
            }}>
            <LinearGradient
                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 5,
                }}
            />
            <View style={{padding: 10}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{marginRight: 10}}>
                            <HexAvatar
                                source={{uri: creator?.profilePicture}}
                                size={55}
                                bordercolor={selectAvatarBorderColor(creator?.badge ?? 'AKCRUIT')}
                            />
                        </View>
                        <View>
                            <Text style={{...FONTS.Title2}}>{` ${creator.username}`}</Text>

                            {creator.badge === 'GUARDIAN' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeGuardian />
                                </View>
                            )}
                            {creator.badge === 'AKCRUIT' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeAkcruit />
                                </View>
                            )}
                            {creator.badge === 'HERO' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeHero />
                                </View>
                            )}
                            {creator.badge === 'SUPERHERO' && (
                                <View>
                                    <AkcruLevels.AkcruBadgeSuperHero />
                                </View>
                            )}
                        </View>
                    </View>

                    <View>
                        <TouchableOpacity onPress={onPress} style={{alignItems: 'center'}}>
                            <Text style={{...FONTS.Title2AkcruBlue}}>VIEW</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    <Text style={styles.paragraphText}>
                        "{creator?.username}" has sent you a MIT Invite for{' '}
                        <Text style={styles.paragraphText3}>"{movie.title}"</Text> on
                        <Text style={styles.paragraphText3}>
                            {' '}
                            {moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}{' '}
                        </Text>
                        <Text style={styles.paragraphText}>at </Text>
                        <Text style={styles.paragraphText3}>
                            {moment(scheduleTime).tz(timezone).format('h:mm A')} {getShortenedTimezone(timezone)}
                        </Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default MITInviteHubCard;
