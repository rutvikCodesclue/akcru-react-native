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

type MITHubCardProps = {
    inviteePicture: string;
    inviteeName: string;
    MITDate: string;
    MITMoviechoice: string;
    onPress?: () => void;
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
    onPress,
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
                            <Avatar
                                rounded
                                size={50}
                                source={
                                    inviteePicture
                                        ? {
                                              uri: inviteePicture,
                                          }
                                        : imageindex.Akcruplaceholder
                                }
                                avatarStyle={{
                                    borderWidth: 2,
                                    borderColor: selectAvatarBorderColor(akcruBadge),
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{...FONTS.Title2}}>{inviteeName}</Text>
                            {/* {influencer && (
                <Icon
                  name="ribbon"
                  type="ionicon"
                  color={COLORS.AKCRUBLUE}
                  size={20}
                  style={{ marginLeft: 5 }}
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
                    {/* <Text style={styles.stamps}>{MITDate}</Text> */}
                    {/* <TouchableOpacity onPress={onPress}>
                      <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                  </TouchableOpacity> */}
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
                        {/* {new Date(scheduleTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                        })} */}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default MITHubCard;
