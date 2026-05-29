import {StyleSheet, Text, View, Pressable} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {UserControlsProps} from './WatchPartyProps';
import DecisionModal from './DecisionModal';
import FeedBackModal from './FeedbackModal';
import {IUserProfile} from '../../../../types';

const UserControls = ({
    channel,
    currentRoomHost,
    members,
    user,
    requestingUser,
    showUnmuteModal,
    setShowUnmuteModal,
    isUserVideoOn,
    setIsUserVideoOn,
    isMicOn,
    setIsMicOn,
    currentHmsInstance,
    videoRoomPrivileges,
}: UserControlsProps) => {
    const [showRequestSentModal, setShowRequestSentModal] = useState(false);
    const [showHostErrorModal, setShowHostErrorModal] = useState(false);

    const requestMicUnmute = (
        permissionGranted: boolean,
        userId: string | undefined,
        permissionType: string,
        requestedBy: IUserProfile | null,
    ) => {
        if (channel === null) {
            console.log('User Controls channel not found');
            return;
        }

        if (permissionType === 'request' && currentRoomHost === user?.id) {
            return;
        }

        channel.send({
            type: 'broadcast',
            event: 'guest-mic-unmute',
            payload: {
                unmutePermissionGiven: permissionGranted,
                senderId: userId,
                permissionType: permissionType,
                requestedBy: requestedBy,
            },
        });
    };

    const toggleMic = async () => {
        const localPeer = await currentHmsInstance?.getLocalPeer();
        if (localPeer) {
            if (isMicOn) {
                console.log('muting personal audio track...');
                localPeer?.localAudioTrack()?.setMute(true);
                setIsMicOn((prevState: boolean) => !prevState);
            } else {
                if (currentRoomHost === user?.id) {
                    console.log('unmuting personal audio track...');
                    localPeer?.localAudioTrack()?.setMute(false);
                    setIsMicOn((prevState: boolean) => !prevState);
                } else {
                    const hostInRoom = members ? members.find(member => member.user.id === currentRoomHost) : undefined;
                    if (hostInRoom) {
                        requestMicUnmute(false, user?.id, 'request', user);
                        setShowRequestSentModal(true);

                        setTimeout(() => {
                            setShowRequestSentModal(false);
                        }, 2000);
                    } else {
                        setShowHostErrorModal(true);

                        setTimeout(() => {
                            setShowHostErrorModal(false);
                        }, 2000);
                    }
                }
            }
        }
    };

    const toggleVideo = async () => {
        const localPeer = await currentHmsInstance?.getLocalPeer();
        if (localPeer) {
            if (isUserVideoOn) {
                console.log('muting personal video track...');
                localPeer?.localVideoTrack()?.setMute(true);
                setIsUserVideoOn(true);
            } else {
                console.log('unmuting personal video track...');
                localPeer?.localVideoTrack()?.setMute(false);
                setIsUserVideoOn(false);
            }
        }

        setIsUserVideoOn((prevState: boolean) => !prevState);
    };

    const muteAllPeers = async () => {
        if (currentRoomHost === user?.id) {
            try {
                await currentHmsInstance?.remoteMuteAllAudio();
                if (channel === null) {
                    console.log('User Controls channel not found');
                    return;
                }

                channel.send({
                    type: 'broadcast',
                    event: 'mute-all',
                    payload: {muteAll: true},
                });
            } catch (error) {
                console.error('Failed to mute all peers or broadcast: ', error);
            }
        }
    };

    return (
        <View>
            <View style={styles.bottombtn}>
                <View style={styles.rowContainer}>
                    {videoRoomPrivileges && (
                        <Pressable onPress={toggleVideo}>
                            {isUserVideoOn ? (
                                <Icon name="video" type="material-community" size={40} color={COLORS.CATPURPLGT} />
                            ) : (
                                <Icon name="video-off" type="material-community" size={40} color={COLORS.CATREDLGT} />
                            )}
                        </Pressable>
                    )}
                    <Pressable onPress={toggleMic}>
                        {isMicOn ? (
                            <Icon name="mic-circle" type="ionicon" size={40} color={COLORS.GREEN} />
                        ) : (
                            <Icon name="mic-off-circle" type="ionicon" size={40} color={COLORS.CATREDLGT} />
                        )}
                    </Pressable>
                    {currentRoomHost === user?.id ? (
                        <Pressable onPress={muteAllPeers} style={styles.button}>
                            <Text style={styles.buttonText}>Mute All</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>

            {showRequestSentModal ? <FeedBackModal modalType="unmuteRequestSent" /> : null}

            {showHostErrorModal ? <FeedBackModal modalType="hostNotInRoom" /> : null}

            {showUnmuteModal && requestingUser ? (
                <DecisionModal
                    modalType="unmuteRequest"
                    username={requestingUser.username}
                    setShowDecisionModal={setShowUnmuteModal}
                    handleAccept={() => requestMicUnmute(true, user?.id, 'reqans', requestingUser)}
                />
            ) : null}
        </View>
    );
};

export default UserControls;

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.CATREDLGT,
        width: 80,
        height: 40,
        borderRadius: 5,
    },
    buttonText: {
        color: COLORS.WHITE,
        fontSize: 12,
    },
    bottombtn: {
        paddingTop: 10,
        paddingBottom: 20,
        marginBottom: 8,
        paddingHorizontal: 16,
        position: 'relative',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
});
