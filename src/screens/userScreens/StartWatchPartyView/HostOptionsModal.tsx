import {Text, View, SafeAreaView, FlatList, Modal} from 'react-native';
import React from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import SmlMemberCard from '../../../components/SmlMemberCard';
import {selectAvatarBorderColor} from '../../../util/util';

interface Props {
    optionModalVisible: any;
    members: any;
    setShowTransferConfirmation: any;
    isHost: any;
    handleRoomTermination: any;
    confirmOptions: any;
    setSelectedMemberForHost: any;
    currentRoomHost: any;
}

const HostOptionsModal = ({
    optionModalVisible,
    members,
    setShowTransferConfirmation,
    isHost,
    handleRoomTermination,
    confirmOptions,
    setSelectedMemberForHost,
    currentRoomHost,
}: Props) => {
    return (
        <Modal animationType="fade" transparent={true} visible={optionModalVisible}>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <View
                    style={{
                        borderWidth: 0.8,
                        borderRadius: 5,
                        borderColor: COLORS.LIGHTGREY,
                        padding: 10,
                        width: '95%',
                        marginTop: '10%',
                    }}>
                    <Text style={{...FONTS.Title2, marginBottom: 5, textAlign: 'center'}}>Room Host Options</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingBottom: 10,
                            alignSelf: 'center',
                        }}>
                        <Text style={{...FONTS.Title2, paddingRight: 10}}>Transfer Hosting Permissions</Text>
                        <Icon name="body" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                    </View>
                    <Text
                        style={{...FONTS.paragraph1,
                            textAlign: 'center',
                            fontSize: 12,
                            color: COLORS.MIDORANGE,
                        }}>
                        (Once transfer is complete, you won't be able to gain permissions back until it is given
                        back or your next CRU View)
                    </Text>
                    <Text
                        style={{
                            ...FONTS.paragraph1,
                            textAlign: 'center',
                            fontSize: 12,
                        }}>
                        Choose who you are giving host privileges:
                    </Text>
                    <View>
                        <FlatList
                            data={members.filter(member => member.user.id !== currentRoomHost)}
                            horizontal={false}
                            showsHorizontalScrollIndicator={false}
                            numColumns={2}
                            scrollEnabled={false}
                            keyExtractor={item => item.user?.id}
                            renderItem={({item}) => (
                                <View style={{marginVertical: 5}}>
                                    <SmlMemberCard
                                        userPicture={item.user.profilePicture ?? ''}
                                        userName={item.user.username ?? 'Anonymous'}
                                        onPress={() => {
                                            console.log('onPress FIRED');
                                            setSelectedMemberForHost(item);
                                            setShowTransferConfirmation(true);
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

                    <View
                        style={{
                            borderBottomWidth: 0.8,
                            borderColor: COLORS.LIGHTGREY,
                            marginVertical: 20,
                            width: SIZES.ScreenWidth / 4,
                            alignSelf: 'center',
                        }}
                    />

                    <View
                        style={{
                            paddingBottom: 10,
                        }}>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                paddingRight: 10,
                                textAlign: 'center',
                                marginBottom: '5%',
                            }}>
                            Terminate Watchparty and close room
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',

                                paddingBottom: 5,
                            }}>
                            <AkcruButtons.SmallButton
                                btnname="Terminate"
                                color={COLORS.CATREDLGT}
                                disabled={false}
                                onPress={handleRoomTermination}
                            />
                        </View>
                    </View>
                </View>
                <View style={{marginBottom: '10%'}}>
                    <AkcruButtons.XlLrgButton
                        btnname="Close Options"
                        disabled={false}
                        color={COLORS.AKCRUBLUE}
                        onPress={confirmOptions}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
};

export default HostOptionsModal;

