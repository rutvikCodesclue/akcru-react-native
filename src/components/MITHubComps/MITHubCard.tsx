import {Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {Avatar} from '@rneui/base';
import {JENNY_INVITES} from '../../../assets/constants/Mockusers';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

import AkcruLevels from '../akcruBadges';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {getShortenedTimezone, selectAvatarBorderColor} from '../../util/util';
import moment from 'moment';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';

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
    // influencer: boolean;
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    } else {
        return text;
    }
};

const MITHubCard = ({
    inviteePicture,
    inviteeName,
    MITDate,
    MITMoviechoice,
    cancel,
    onPressIn,
    akcruBadge,
    scheduleDate,
    scheduleTime,
    timezone,
}: // influencer,
MITHubCardProps) => {
    return (
        <View style={styles.cardcontainer}>
            <LinearGradient
                // Background Linear Gradient
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

                            {/* {post?.author.ownerStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.STARGOLD}
                                    baseSize={12}
                                    style={{marginRight: 5}}
                                />
                            )}
                            {post?.author.companyStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.WHITE}
                                    baseSize={12}
                                    style={{marginRight: 5}}
                                />
                            )}
                            {post?.author.influencerStatus && (
                                <CustomIcon
                                    name="ribbon"
                                    type="ionicon"
                                    color={COLORS.AKCRUBLUE}
                                    baseSize={12}
                                    style={{marginRight: 5}}
                                />
                            )} */}
                        </View>

                        {akcruBadge === 'AKCRUIT' && (
                            <View>
                                <AkcruLevels.AkcruBadgeAkcruit />
                            </View>
                        )}
                        {akcruBadge === 'GUARDIAN' && (
                            <View>
                                <AkcruLevels.AkcruBadgeGuardian />
                            </View>
                        )}
                        {akcruBadge === 'HERO' && (
                            <View>
                                <AkcruLevels.AkcruBadgeHero />
                            </View>
                        )}
                        {akcruBadge === 'SUPERHERO' && (
                            <View>
                                <AkcruLevels.AkcruBadgeSuperHero />
                            </View>
                        )}
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
                {/* DATE */}
                <View style={{marginHorizontal: 5}}>
                    <Text style={styles.cruchat}>{moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}</Text>
                </View>
                <Text style={styles.cruchat2}>at </Text>
                {/* TIME */}
                <View style={{marginRight: 5}}>
                    <Text style={styles.cruchat}>
                        {/* render UTC Time w/ moment */}
                        {moment(scheduleTime).tz(timezone).format('h:mm A')} {getShortenedTimezone(timezone)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default MITHubCard;
