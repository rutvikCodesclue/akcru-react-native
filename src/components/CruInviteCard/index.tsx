import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {IUserProfile} from '../../../types';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import AkcruButtons from '../akcruButtons';

type CruInviteCardProp = {
    cruInviteID: any;
    inviteeName: string;
    inviteePicture?: string | undefined;
    inviteDate: string;
    invitee: IUserProfile;
    onPress: () => void;
    decline: any;
    accept: any;
};

const CruInviteCard = ({inviteeName, inviteDate, invitee, onPress, decline, accept}: CruInviteCardProp) => {
    return (
        <View
            style={{
                backgroundColor: '#1C202A',
                borderRadius: 5,
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
            <View style={{padding: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                    <View style={{marginRight: 10}}>
                        <TouchableOpacity onPress={onPress}>
                            <HexAvatar
                                source={{uri: invitee?.profilePicture}}
                                size={55}
                                bordercolor={selectAvatarBorderColor(invitee?.badge ?? 'AKCRUIT')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            <View>
                                <Text style={styles.paragraphText2}>{inviteeName}</Text>
                            </View>

                            <Text style={styles.paragraphText}>has sent you a CRU Invite on</Text>
                            <View>
                                <Text style={styles.paragraphText3}>
                                    {new Date(inviteDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <AkcruButtons.SmallButton
                        btnname="ACCEPT"
                        color={COLORS.AKCRUBLUE}
                        disabled={false}
                        onPress={accept}
                    />
                    <AkcruButtons.SmallButton
                        btnname="DECLINE"
                        color={COLORS.PURPLE}
                        disabled={false}
                        onPress={decline}
                    />
                </View>
            </View>
        </View>
    );
};

export default CruInviteCard;
