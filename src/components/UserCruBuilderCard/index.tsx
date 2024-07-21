import {Text, View, TouchableOpacity, Modal} from 'react-native';
import React, {useState, useEffect} from 'react';
import {SIZES, FONTS, COLORS} from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {selectAvatarBorderColor} from '../../util/util';
import HexAvatar from '../HexAvatar';
import CustomIcon from '../CustomIcon/CustomIcon';
import DisplayBadge from '../General/akcrubadge';
import AkcruButtons from '../akcruButtons';
import ComfirmationModal from '../ConfirmationModal';
import {checkUserMembership, getCruInviteStatus} from '../../lib/api/cru.lib';

const MAX_USERDESC_LENGTH = 50;

type UserCruBuilderCardProps = {
    userPicture?: string;
    userName: string;
    influencer?: boolean;
    akcruBadge: any;
    onPress: () => void;
    userID: any;
    userDesc?: string;
    firstName?: string;
    ownerStatus?: boolean;
    companyStatus?: boolean;
    influencerStatus?: boolean;
    blackCloakStatus?: boolean;
    handleSendCruInvite: (username: string, userID: string) => void;
    inviteStatus: string;
    isMember: boolean;
    isAdmin: boolean;
};

const UserCruBuilderCard = ({
    userPicture,
    userName,
    akcruBadge,
    onPress,
    userDesc,
    firstName,
    ownerStatus,
    companyStatus,
    influencerStatus,
    blackCloakStatus,
    handleSendCruInvite,
    userID,
    inviteStatus,
    isMember,
    isAdmin,
}: UserCruBuilderCardProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showCruInviteSent, setShowCruInviteSent] = useState(false);

    useEffect(() => {
        if (showCruInviteSent) {
            const timer = setTimeout(() => {
                setShowCruInviteSent(false);
            }, 4000);

            // Clear timeout if component is unmounted
            return () => clearTimeout(timer);
        }
    }, [showCruInviteSent]);

    const truncateduserDesc =
        userDesc && userDesc.length > MAX_USERDESC_LENGTH ? userDesc.slice(0, MAX_USERDESC_LENGTH) + '...' : userDesc;

    let btnName = 'CRU Invite';
    let btnDisabled = false;
    let btnColor = COLORS.AKCRUBLUE;

    if (inviteStatus === 'PENDING') {
        btnName = 'PENDING';
        btnDisabled = true;
        btnColor = COLORS.DARKGREY;
    } else if (isMember) {
        btnName = 'CRU MEMBER';
        btnDisabled = true;
        btnColor = COLORS.PINK;
    }

    return (
        <View
            style={{
                borderRadius: 5,
                backgroundColor: COLORS.TAGCOLOR,
                width: SIZES.ScreenWidth,
            }}>
            <LinearGradient
                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    width: '100%',
                    borderRadius: 5,
                    height: '100%',
                }}
            />
            <View style={{padding: 10}}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginRight: 30,
                    }}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{marginRight: 8}}>
                            <TouchableOpacity onPress={onPress}>
                                <HexAvatar
                                    source={{uri: userPicture}}
                                    size={58}
                                    bordercolor={selectAvatarBorderColor(akcruBadge ?? 'AKCRUIT')}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{...FONTS.Username, marginRight: 2}}>{userName}</Text>
                                {ownerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.STARGOLD}
                                        baseSize={12}
                                        style={{marginRight: 0}}
                                    />
                                )}
                                {companyStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.WHITE}
                                        baseSize={12}
                                        style={{marginRight: 0}}
                                    />
                                )}
                                {influencerStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.AKCRUBLUE}
                                        baseSize={12}
                                        style={{marginRight: 0}}
                                    />
                                )}
                                {blackCloakStatus && (
                                    <CustomIcon
                                        name="ribbon"
                                        type="ionicon"
                                        color={COLORS.BLACKCLOAK}
                                        baseSize={12}
                                        style={{marginRight: 0}}
                                    />
                                )}
                                {isAdmin && (
                                    <CustomIcon
                                        name="shield-sword"
                                        type="material-community"
                                        color={COLORS.STARGOLD}
                                        baseSize={12}
                                        style={{marginRight: 0}}
                                    />
                                )}
                            </View>
                            <Text style={{...FONTS.paragraph1}}>{firstName}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <DisplayBadge akcruBadge={akcruBadge} />
                            </View>
                        </View>
                    </View>
                    <View>
                        <AkcruButtons.XSmallButton
                            btnname={btnName}
                            onPress={() => setShowConfirmationModal(true)}
                            color={btnColor}
                            disabled={btnDisabled}
                        />
                        <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                            <ComfirmationModal
                                confirmationText={`Are you sure you want to send "${userName}" a Cru invite?`}
                                onPressYes={() => {
                                    handleSendCruInvite(userName, userID);
                                    setShowConfirmationModal(false);
                                    setShowCruInviteSent(true);
                                }}
                                onPressNo={() => setShowConfirmationModal(false)}
                            />
                        </Modal>
                        <Modal animationType="fade" transparent={true} visible={showCruInviteSent}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                        padding: 20,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        marginHorizontal: 15,
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            marginBottom: 10,
                                            textAlign: 'center',
                                        }}>
                                        {`You have sent "${userName}" a Cru invite! You will be notified if they ACCEPT or DECLINE the invite`}
                                    </Text>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
                <View>
                    <Text style={{...FONTS.paragraph1}}>{truncateduserDesc}</Text>
                </View>
            </View>
        </View>
    );
};

export default UserCruBuilderCard;
