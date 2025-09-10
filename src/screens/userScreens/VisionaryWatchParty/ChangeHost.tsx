import {Text, View, SafeAreaView, FlatList, Modal, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import SmlMemberCard from '../../../components/SmlMemberCard';
import {selectAvatarBorderColor} from '../../../util/util';
import {ChangeHostProps} from './WatchPartyProps';
import DecisionModal from './DecisionModal';
import {MemberInfo} from './WatchPartyProps';

const ChangeHost = ({
    currentRoomHost,
    members,
    showChangeHost,
    setShowChangeHost,
    handleChangeHost,
}: ChangeHostProps) => {
    const [newHostChoice, setNewHostChoice] = useState<MemberInfo | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    return (
        <View>
            <Modal animationType="fade" transparent={true} visible={showChangeHost}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.modalContainer}>
                        <View style={styles.hostOptionsContainer}>
                            <Icon name="users" type="font-awesome" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={[FONTS.Title2, styles.hostOptionText]}>Change Watch Party Session Host</Text>
                        </View>
                        <Text style={styles.warningText}>
                            If you switch hosts, you'll need them to give it back or restart the session.
                        </Text>
                        <View>
                            <FlatList
                                style={styles.guestList}
                                data={members.filter(member => (member.user.id !== currentRoomHost) && (member.user.visionaryStatus))}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                numColumns={2} 
                                scrollEnabled={false}
                                keyExtractor={item => item.user?.id}
                                renderItem={({item}) => (
                                    <View style={styles.memberCardContainer}>
                                        <SmlMemberCard
                                            userPicture={item.user.profilePicture ?? ''}
                                            userName={item.user.username ?? 'Anonymous'}
                                            onPress={() => {
                                                setNewHostChoice(item);
                                                setShowConfirmation(true);
                                            }}
                                            userID={item.user.id}
                                            akcruBadge={item.user.badge}
                                            userDesc={item.user.description ?? ''}
                                            avatarbordercolor={selectAvatarBorderColor(item.user.badge ?? 'AKCRUIT')}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                    <View style={styles.goBackButtonContainer}>
                        <AkcruButtons.XlLrgButton
                            btnname="Go Back"
                            disabled={false}
                            color={COLORS.AKCRUBLUE}
                            onPress={() => setShowChangeHost(false)}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
            {showConfirmation ? (
                <DecisionModal
                    modalType="confirmHostTransfer"
                    username={newHostChoice?.user.username}
                    setShowDecisionModal={setShowConfirmation}
                    handleAccept={() => {
                        const newHostId = newHostChoice?.user.id;
                        handleChangeHost(newHostId);
                        setShowChangeHost(false);
                    }}
                />
            ) : null}
        </View>
    );
};

export default ChangeHost;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalContainer: {
        borderWidth: 0.8,
        borderRadius: 5,
        borderColor: COLORS.LIGHTGREY,
        padding: 10,
        width: '95%',
        marginTop: '10%',
    },
    modalTitle: {
        marginBottom: 5,
        textAlign: 'center',
    },
    hostOptionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        alignSelf: 'center',
    },
    hostOptionText: {
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 5,
    },
    warningText: {
        ...FONTS.paragraph2,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 0,
        fontSize: 10,
        color: COLORS.MIDORANGE,
    },
    instructionText: {
        ...FONTS.paragraph1,
        textAlign: 'center',
        paddingVertical: 5,
        fontSize: 12,
    },
    memberCardContainer: {
        marginVertical: 5,
    },
    divider: {
        borderBottomWidth: 0.8,
        borderColor: COLORS.LIGHTGREY,
        marginVertical: 20,
        width: SIZES.ScreenWidth / 4,
        alignSelf: 'center',
    },
    goBackButtonContainer: {
        marginBottom: '10%',
    },
    guestList: {
        paddingVertical: 10,
    },
});
