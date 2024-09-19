import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {TopContainerProps} from './WatchPartyProps';
import DecisionModal from './DecisionModal';
import ChangeHost from './ChangeHost';

const TopContainer = ({
    currentRoomHost,
    user,
    members,
    handleRoomLeaving,
    handleEndRoom,
    handleChangeHost,
}: TopContainerProps) => {
    const [showChangeHost, setShowChangeHost] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [showRoomEnd, setShowRoomEnd] = useState(false);

    const handleHostLeave = () => {
        setShowRoomEnd(true);
    };

    return (
        <View>
            <View style={styles.topcontainer}>
                <TouchableOpacity
                    onPress={() => {
                        setShowDecisionModal(true);
                    }}
                    activeOpacity={0.7}
                    style={styles.topContainerButton}>
                    <View style={styles.rowContainer}>
                        <Icon name="chevron-back" type="ionicon" size={15} color={COLORS.LIGHTGREY} />
                        <Text style={styles.topContainerButtonText}>Leave Room</Text>
                    </View>
                </TouchableOpacity>
                {currentRoomHost === user?.id && (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.topContainerButton}
                        onPress={() => setShowChangeHost(true)}>
                        <View style={styles.rowContainer}>
                            <Text style={styles.topContainerButtonText}>Change Host</Text>
                            <Icon name="people" type="ionicon" size={15} color={COLORS.LIGHTGREY} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {showDecisionModal ? (
                <DecisionModal
                    modalType={currentRoomHost === user?.id ? 'hostLeaveRoom' : 'leaveRoom'}
                    username={undefined}
                    setShowDecisionModal={setShowDecisionModal}
                    handleAccept={() => (currentRoomHost === user?.id ? handleHostLeave() : handleRoomLeaving())}
                />
            ) : null}

            {showRoomEnd && currentRoomHost === user?.id ? (
                <DecisionModal
                    modalType="endRoom"
                    username={undefined}
                    setShowDecisionModal={setShowRoomEnd}
                    handleAccept={() => handleEndRoom()}
                />
            ) : null}

            {showChangeHost && currentRoomHost === user?.id ? (
                <ChangeHost
                    currentRoomHost={currentRoomHost}
                    showChangeHost={showChangeHost}
                    setShowChangeHost={setShowChangeHost}
                    members={members}
                    handleChangeHost={handleChangeHost}
                />
            ) : null}
        </View>
    );
};

export default TopContainer;

const styles = StyleSheet.create({
    topcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginBottom: 15,
    },
    topContainerButton: {
        padding: 8, // Space inside the button
        flexDirection: 'row',
        alignItems: 'center',
    },
    topContainerButtonText: {
        ...FONTS.Title3,
        marginRight: 5,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
