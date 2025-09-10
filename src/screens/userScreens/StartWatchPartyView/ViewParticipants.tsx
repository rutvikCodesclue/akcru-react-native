import {Text, View, SafeAreaView, FlatList, Modal, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import SmlMemberCard from '../../../components/SmlMemberCard';
import {selectAvatarBorderColor} from '../../../util/util';
import {ChangeHostProps} from './WatchPartyProps';
import DecisionModal from './DecisionModal';
import {MemberInfo} from './WatchPartyProps';
import useAuthStore from '../../../stores/auth.store';
import SmlMemberCardWithIcon from '../../../components/SmlMemberCardWithIcon';

const ViewParticipants = ({
    members,
    setShowParticipants,
}: {
    members: MemberInfo[];
    setShowParticipants: (v: boolean) => void;
}) => {
    const [newHostChoice, setNewHostChoice] = useState<MemberInfo | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const user = useAuthStore()

    return (
        <View>
            <Modal animationType="fade" transparent={true}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.modalContainer}>
                        <View style={styles.hostOptionsContainer}>
                            <Icon name="users" type="font-awesome" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={[FONTS.Title2, styles.hostOptionText]}>Visionary Room Participants</Text>
                        </View>
                        <Text style={styles.warningText}>
                            As host, you can allow participants to speak by handing the mic to them
                        </Text>
                        <View>
                            <FlatList
                                style={styles.guestList}
                                data={members}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                numColumns={2}
                                scrollEnabled={true}
                                keyExtractor={item => item.user?.id}
                                renderItem={({item}) => (
                                    <View style={styles.memberCardContainer}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            {/* Member Card */}
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
                                                    avatarbordercolor={selectAvatarBorderColor(
                                                        item.user.badge ?? 'AKCRUIT',
                                                    )}
                                                />
                                        </View>
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
                            onPress={() => setShowParticipants(false)}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

export default ViewParticipants;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        borderWidth: 0.8,
        borderRadius: 5,
        borderColor: COLORS.LIGHTGREY,
        padding: 10,
        width: '95%',
        marginTop: '10%',
        marginBottom: 50,
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
