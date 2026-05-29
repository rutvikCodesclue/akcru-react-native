import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import {AUTH_BUTTON_THEME} from '../../../assets/constants/authTheme';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {IMovie, IUserProfile} from '../../../types';
import {getShortenedTimezone, selectAvatarBorderColor} from '../../util/util';
import moment from 'moment';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';
import { Icon } from '@rneui/themed';
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
                backgroundColor: COLORS.SURFACE_ELEVATED,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: COLORS.AKCRUBLUE,
            }}>
            <LinearGradient
                colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{...FONTS.Title2}}>{` ${creator.username}`}</Text>
                                {creator.ownerStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.STARGOLD}
                                        size={18}
                                        style={{marginRight: 5}}
                                    />
                                )}
                                {creator.companyStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        size={18}
                                        style={{marginRight: 5}}
                                    />
                                )}
                                {creator.blackCloakStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        size={18}
                                        style={{marginRight: 5}}
                                    />
                                )}
                                {creator.influencerStatus && (
                                    <Icon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        size={18}
                                        style={{marginRight: 5}}
                                    />
                                )}
                            </View>

                            <DisplayBadge akcruBadge={creator.badge} />
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
