import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS} from '../../../assets/constants';

import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {getShortenedTimezone, selectAvatarBorderColor} from '../../util/util';
import moment from 'moment';
import 'moment-timezone';
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
        <View style={styles.panelBody}>
            <View style={styles.cardTouch}>
                <LinearGradient
                    colors={['#FF2F92', '#A43EFF', '#5BE0FF']}
                    start={{x: 0, y: 0.5}}
                    end={{x: 1, y: 0.5}}
                    style={styles.cardGradientBorder}>
                    <View style={styles.cardcontainer}>
                        <View style={styles.cardContent}>
                            <View style={styles.topRow}>
                                <View style={styles.leftSection}>
                                    <View style={styles.avatarWrap}>
                                        <TouchableOpacity onPressIn={onPressIn}>
                                            <HexAvatar
                                                source={{uri: inviteePicture}}
                                                size={58}
                                                bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.nameSection}>
                                        <View style={styles.nameRow}>
                                            <Text style={styles.name} numberOfLines={1}>
                                                {inviteeName}
                                            </Text>
                                            {ownerStatus && (
                                                <Icon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.STARGOLD}
                                                    size={18}
                                                    style={styles.ribbon}
                                                />
                                            )}
                                            {companyStatus && (
                                                <Icon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.WHITE}
                                                    size={18}
                                                    style={styles.ribbon}
                                                />
                                            )}
                                            {blackCloakStatus && (
                                                <Icon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.BLACKCLOAK}
                                                    size={18}
                                                    style={styles.ribbon}
                                                />
                                            )}
                                            {influencerStatus && (
                                                <Icon
                                                    name="ribbon"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    size={18}
                                                    style={styles.ribbon}
                                                />
                                            )}
                                        </View>
                                        <View style={styles.badgeWrap}>
                                            <DisplayBadge akcruBadge={akcruBadge} />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.dateTimeCol}>
                                    <Text style={styles.dateLine}>
                                        {moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}
                                    </Text>
                                    <Text style={styles.time}>{moment(scheduleTime).tz(timezone).format('h:mm A')}</Text>
                                </View>
                            </View>
                            <Text style={styles.previewText}>
                                You invited {inviteeName} to watch "{MITMoviechoice}" scheduled for{' '}
                                <Text style={styles.cruchat}>
                                    {moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}
                                </Text>{' '}
                                at{' '}
                                <Text style={styles.cruchat}>
                                    {moment(scheduleTime).tz(timezone).format('h:mm A')} {getShortenedTimezone(timezone)}
                                </Text>
                                .
                            </Text>
                            <View style={styles.footerRow}>
                                <Text style={styles.statusLabel}>MIT Pending</Text>
                                <TouchableOpacity onPress={cancel} style={styles.cancelButton}>
                                    <Text style={styles.cancelText}>Cancel Invite</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        </View>
                </LinearGradient>
            </View>
        </View>
    );
};

export default MITHubCard;
