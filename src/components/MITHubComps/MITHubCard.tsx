import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';

import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {getShortenedTimezone, selectAvatarBorderColor} from '../../util/util';
import moment from 'moment';
import HexAvatar from '../HexAvatar';
import DisplayBadge from '../General/akcrubadge';
import {Icon} from '@rneui/themed';

type MITHubCardProps = {
    inviteePicture: string;
    inviteeName: string;
    MITDate: string;
    MITMoviechoice: string;
    cancel?: () => void;
    onPressIn: () => void;
    akcruBadge: any;
    scheduleDate: string;
    scheduleTime: string;
    timezone: string;
    ownerStatus: boolean;
    influencerStatus: boolean;
    blackCloakStatus: boolean;
    companyStatus: boolean;
};

const MITHubCard = ({
    inviteePicture,
    inviteeName,
    MITMoviechoice,
    cancel,
    onPressIn,
    akcruBadge,
    scheduleDate,
    scheduleTime,
    timezone,
    ownerStatus,
    influencerStatus,
    blackCloakStatus,
    companyStatus,
}: MITHubCardProps) => {
    return (
        <View style={styles.cardcontainer}>
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

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginRight: 8}}>
                        <TouchableOpacity onPressIn={onPressIn}>
                            <HexAvatar
                                source={{uri: inviteePicture}}
                                size={55}
                                bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{...FONTS.Title2}}>{inviteeName}</Text>
                            {ownerStatus && (
                                <Icon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.STARGOLD}
                                    size={18}
                                    style={{marginRight: 5}}
                                />
                            )}
                            {companyStatus && (
                                <Icon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.WHITE}
                                    size={18}
                                    style={{marginRight: 5}}
                                />
                            )}
                            {blackCloakStatus && (
                                <Icon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.BLACKCLOAK}
                                    size={18}
                                    style={{marginRight: 5}}
                                />
                            )}
                            {influencerStatus && (
                                <Icon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.AKCRUBLUE}
                                    size={18}
                                    style={{marginRight: 5}}
                                />
                            )}
                        </View>

                        <DisplayBadge akcruBadge={akcruBadge} />
                    </View>
                </View>

                <View>
                    <TouchableOpacity onPress={cancel}>
                        <Text style={{...FONTS.Title2AkcruBlue, color: COLORS.PINK}}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{marginTop: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
                <Text style={styles.cruchat2}>
                    You invited {inviteeName} to watch "{MITMoviechoice}".
                </Text>

                <Text style={styles.cruchat2}>scheduled for</Text>

                <View style={{marginHorizontal: 5}}>
                    <Text style={styles.cruchat}>{moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}</Text>
                </View>
                <Text style={styles.cruchat2}>at </Text>

                <View style={{marginRight: 5}}>
                    <Text style={styles.cruchat}>
                        {moment(scheduleTime).tz(timezone).format('h:mm A')} {getShortenedTimezone(timezone)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default MITHubCard;
