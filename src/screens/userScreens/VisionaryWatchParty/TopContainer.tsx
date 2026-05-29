import {StyleSheet, Text, View, TouchableOpacity, Modal} from 'react-native';
import React, {useState} from 'react';
import {FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {TopContainerProps} from './WatchPartyProps';
import DecisionModal from './DecisionModal';
import ChangeHost from './ChangeHost';
import ViewParticipants from '../StartWatchPartyView/ViewParticipants';

const TopContainer = ({
    currentRoomHost,
    user,
    members,
    handleRoomLeaving,
    handleEndRoom,
    handleChangeHost,
    handleHandMic,
    participantMicAccess,
}: TopContainerProps) => {
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChangeHost, setShowChangeHost] = useState(false);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [showRoomEnd, setShowRoomEnd] = useState(false);

    const [showOptionsModal, setShowOptionsModal] = useState(false)

    const handleHostLeave = () => {
        setShowRoomEnd(true);
    };

    return (
        <View>
      <View style={styles.topcontainer}>
        {/* Leave Room Button */}
        <TouchableOpacity
          onPress={() => {
            setShowDecisionModal(true);
          }}
          activeOpacity={0.7}
          style={styles.topContainerButton}
        >
          <View style={styles.rowContainer}>
            <Icon
              name="chevron-back"
              type="ionicon"
              size={15}
              color={COLORS.LIGHTGREY}
            />
            <Text style={styles.topContainerButtonText}>Leave Room</Text>
          </View>
        </TouchableOpacity>

        {/* Three Dots Menu (only visible for host) */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.topContainerButton}
            onPress={() => setShowOptionsModal(true)}
          >
            <Icon
              name="ellipsis-vertical"
              type="ionicon"
              size={20}
              color={COLORS.LIGHTGREY}
            />
          </TouchableOpacity>
      </View>

      {/* Leave Room Confirmation */}
      {showDecisionModal && (
        <DecisionModal
          modalType={currentRoomHost === user?.id ? 'hostLeaveRoom' : 'leaveRoom'}
          username={undefined}
          setShowDecisionModal={setShowDecisionModal}
          handleAccept={() =>
            currentRoomHost === user?.id ? handleHostLeave() : handleRoomLeaving()
          }
        />
      )}

      {/* End Room Confirmation */}
      {showRoomEnd && currentRoomHost === user?.id && (
        <DecisionModal
          modalType="endRoom"
          username={undefined}
          setShowDecisionModal={setShowRoomEnd}
          handleAccept={handleEndRoom}
        />
      )}

      {showChangeHost && currentRoomHost === user?.id ? (
        <ChangeHost
            currentRoomHost={currentRoomHost}
            showChangeHost={showChangeHost}
            setShowChangeHost={setShowChangeHost}
            members={members}
            handleChangeHost={handleChangeHost}
        />
      ) : null}

      {showParticipants && (
        <ViewParticipants
          members={members}
          setShowParticipants={setShowParticipants}
        />
      )}

      {/* Options Modal */}
      <Modal
        transparent={true}
        visible={showOptionsModal}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsContainer}>
            {user?.id === currentRoomHost && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  setShowOptionsModal(false);
                  setShowChangeHost(true)
                }}
              >
                <Text style={styles.optionText}>Change Host</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setShowOptionsModal(false);
                setShowParticipants(true);
              }}
            >
              <Text style={styles.optionText}>View Participants</Text>
            </TouchableOpacity>

            {user?.id === currentRoomHost && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  setShowOptionsModal(false);
                  handleHandMic();
                }}
              >
                <Text style={styles.optionText}>{`${participantMicAccess ? 'Take' : 'Give'} mic access ${participantMicAccess ? 'from' : 'to'} participants`}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY_BLACK_40,
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: COLORS.AKCRUBACKGROUND,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
  },
  optionButton: {
    paddingVertical: 12,
  },
  optionText: {
    ...FONTS.Title2,
    color: COLORS.WHITE,
  },
});
