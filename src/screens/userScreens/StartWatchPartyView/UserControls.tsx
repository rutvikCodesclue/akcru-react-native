import {StyleSheet, Text, View, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {UserControlsProps} from './WatchPartyProps';
import DecisionModal from './DecisionModal';
import FeedBackModal from './FeedbackModal';
import {supabase} from '../../../../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import {IUserProfile} from '../../../../types';

const UserControls = ({
    roomId,
    currentRoomHost,
    members,
    user,
    isUserVideoOn,
    setIsUserVideoOn,
    isMicOn,
    setIsMicOn,
    isStreamHost,
    currentHmsInstance,
}: UserControlsProps) => {
    const [userControlsChannel, setUserControlsChannel] = useState<RealtimeChannel | null>(null);
    const [requestingUser, setRequestingUser] = useState<IUserProfile | undefined>(undefined);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [showRequestSentModal, setShowRequestSentModal] = useState(false);
    const [showHostErrorModal, setShowHostErrorModal] = useState(false);

    useEffect(() => {
        const initialChannel = supabase.channel(roomId);
        initialChannel
            .on('broadcast', {event: 'guest-mic-unmute'}, payload => handleUnmuteRequest(payload))
            .on('broadcast', {event: 'mute-all'}, payload => muteLocalPeer(payload))
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    setUserControlsChannel(initialChannel);
                    console.log('Subscribed to the User Controls Channel - ', user?.username);
                }
            });

        return () => {
            initialChannel.unsubscribe();
            setUserControlsChannel(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const muteLocalPeer = async (payload: any) => {
        if (payload.payload.muteAll) {
            const localPeer = await currentHmsInstance?.getLocalPeer();
            console.log('muting personal audio track...');
            localPeer?.localAudioTrack()?.setMute(true);
            setIsMicOn((prevState: boolean) => !prevState);
        }
    };

    const handleUnmuteRequest = async (payload: any) => {
        if (currentRoomHost === user?.id && payload.payload.permissionType! === 'request') {
            setRequestingUser(payload.payload.requestedBy);
            setShowDecisionModal(true);
        }
        if (
            currentRoomHost !== user?.id &&
            payload.payload.permissionType === 'reqans' &&
            payload.payload.requestedBy.id === user?.id
        ) {
            if (payload.payload.unmutePermissionGiven) {
                const localPeer = await currentHmsInstance?.getLocalPeer();
                if (localPeer) {
                    localPeer?.localAudioTrack()?.setMute(false);
                    setIsMicOn(true);
                }
            }
        }
    };

    const requestMicUnmute = (
        permissionGranted: boolean,
        userId: string | undefined,
        permissionType: string,
        requestedBy: IUserProfile | null,
    ) => {
        if (userControlsChannel === null) {
            console.log('User Controls channel not found');
            return;
        }

        if (permissionType === 'request' && isStreamHost) {
            return;
        }

        userControlsChannel.send({
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
                if (isStreamHost) {
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
        if (isStreamHost) {
            try {
                await currentHmsInstance?.remoteMuteAllAudio();
                if (userControlsChannel === null) {
                    console.log('User Controls channel not found');
                    return;
                }

                userControlsChannel.send({
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
                    <Pressable onPress={toggleVideo}>
                        {isUserVideoOn ? (
                            <Icon name="video" type="material-community" size={40} color={COLORS.CATPURPLGT} />
                        ) : (
                            <Icon name="video-off" type="material-community" size={40} color={COLORS.CATREDLGT} />
                        )}
                    </Pressable>
                    <Pressable onPress={toggleMic}>
                        {isMicOn ? (
                            <Icon name="mic-circle" type="ionicon" size={40} color={COLORS.GREEN} />
                        ) : (
                            <Icon name="mic-off-circle" type="ionicon" size={40} color={COLORS.CATREDLGT} />
                        )}
                    </Pressable>
                    {isStreamHost ? (
                        <Pressable onPress={muteAllPeers} style={styles.button}>
                            <Text style={styles.buttonText}>Mute All</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>

            {showRequestSentModal ? <FeedBackModal modalType="unmuteRequestSent" /> : null}

            {showHostErrorModal ? <FeedBackModal modalType="hostNotInRoom" /> : null}

            {showDecisionModal && requestingUser ? (
                <DecisionModal
                    modalType="unmuteRequest"
                    username={requestingUser.username}
                    setShowDecisionModal={setShowDecisionModal}
                    handleAccept={() => requestMicUnmute(true, user?.id, 'reqans', requestingUser)}
                    showDecisionModal={showDecisionModal}
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
        color: 'white',
        fontSize: 12,
    },
    bottombtn: {
        paddingTop: 10,
        position: 'relative',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});
