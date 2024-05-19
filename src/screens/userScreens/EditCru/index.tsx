import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
    SafeAreaView,
    Platform,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, {useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import CruMemberCard from '../../../components/CruMemberCard';
import AddMemberCard from '../../../components/AddMemberCard';
import {addPotentialMemberToCRU, getMyCRU, removeAUserFromCRU, updateCRUInfo} from '../../../lib/api/cru.lib';
import {ICru, IUserProfile} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';

const EditCru = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const [CRU, setCRU] = useState<ICru | undefined>(undefined);

    const [loading, setLoading] = useState(false);

    const [originalCruName, setOriginalCruName] = useState('');
    const [modifiedCruName, setModifiedCruName] = useState('');
    const [cruNameChangeModalVisible, setCruNameChangeModalVisible] = useState(false);

    const [potentialMembers, setPotentialMembers] = useState<IUserProfile[] | []>([]);
    const [members, setMembers] = useState<IUserProfile[] | []>([]);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<IUserProfile | null>(null);

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const [showChangeNameConfirmationModal, setShowChangeNameConfirmationModal] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            getMyCRU().then(res => {
                //console.log('Data from getMyCRU:', res);
                setCRU(res?.CRU);
                if (res?.CRU.members) {
                    setMembers(res.CRU.members);
                    setPotentialMembers(res.acceptedMembers);
                }
            });

            return () => {
                //console.log('Screen unfocused [EditCruScreen]');
            };
        }, []),
    );

    const handleChangeCruName = () => {
        setShowChangeNameConfirmationModal(true);
        setCruNameChangeModalVisible(false);
    };

    const handleCruNameChangeModalOpen = () => {
        setModifiedCruName(CRU?.name || '');
        setCruNameChangeModalVisible(true);
    };

    const ConfirmChangeCruName = async () => {
        try {
            setLoading(true);

            if (CRU && modifiedCruName.trim() !== '') {
                const updatedCRU = await updateCRUInfo({name: modifiedCruName});

                if (updatedCRU) {
                    setCRU(updatedCRU);

                    //console.log('Modified CRU Name:', updatedCRU.name);
                }
            } else {
                console.error('Invalid CRU name');
            }

            setShowChangeNameConfirmationModal(false);
            setCruNameChangeModalVisible(false);
        } catch (error) {
            console.error('Error updating CRU name:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelChangeCruName = () => {
        setShowChangeNameConfirmationModal(false);
    };

    const handleDeleteMember = (userID: string) => {
        const member = members.find(m => m.id === userID);
        if (member) {
            setMemberToDelete(member);

            setShowConfirmationModal(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (memberToDelete && CRU?.id) {
            try {
                const updatedCRU = await removeAUserFromCRU(memberToDelete.id, CRU?.id);

                if (updatedCRU) {
                    setCRU(updatedCRU);

                    setMembers(prevMembers => prevMembers.filter(member => member.id !== memberToDelete.id));

                    setShowConfirmationModal(false);
                    //console.log('User removed from CRU:', memberToDelete.id);
                }
            } catch (error) {
                console.error('Error removing user from CRU:', error);
            }
        }
    };

    const getAvailableMembers = (): IUserProfile[] | [] => {
        return potentialMembers;
    };

    const cruMembers = (): IUserProfile[] | [] => {
        return members;
    };

    const [showAddMemberConfirmationModal, setShowAddMemberConfirmationModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<IUserProfile | null>(null);

    const handleAddMember = () => {
        setShowAddMemberConfirmationModal(true);
    };

    const handleConfirmAddMember = () => {
        if (selectedMember) {
            setMembers(prevMembers => [...prevMembers, selectedMember]);
            setShowAddMemberModal(false);
            setShowAddMemberConfirmationModal(false);
        }
    };

    const handleCancelAddMember = () => {
        setShowAddMemberConfirmationModal(false);
    };

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
                        <Header />
                        <View style={styles.container}>
                            <TouchableOpacity onPress={() => navigation.pop()}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{alignItems: 'center', marginTop: 10}}>
                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        navigation.navigate('UserSearchResultScreen');
                                    }}>
                                    <View style={styles.searchinput}>
                                        <Icon
                                            name="magnify"
                                            type="material-community"
                                            color={COLORS.AKCRUBLUE}
                                            size={28}
                                            style={{marginRight: 10}}
                                        />
                                        <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Search users</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    marginTop: 10,
                                    textAlign: 'center',
                                    fontSize: 14,
                                }}>
                                EDIT YOUR CRU NAME
                            </Text>
                        </View>
                        <View style={styles.container}>
                            <Text style={styles.inputlabel}>CRU Name</Text>
                            <View style={styles.input}>
                                {Platform.OS == 'ios' ? (
                                    <TouchableOpacity onPress={handleCruNameChangeModalOpen}>
                                        <TextInput
                                            placeholder={CRU?.name}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => setModifiedCruName(text)}
                                            value={originalCruName || ''}
                                            editable={false}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <Pressable onPress={handleCruNameChangeModalOpen}>
                                        <TextInput
                                            placeholder={CRU?.name}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => setModifiedCruName(text)}
                                            value={originalCruName || ''}
                                            editable={false}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        <Modal animationType="fade" transparent={false} visible={cruNameChangeModalVisible}>
                            <SafeAreaView
                                style={{
                                    flex: 1,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                    paddingTop: 20,
                                }}>
                                {Platform.OS == 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 20,
                                        }}>
                                        <Pressable onPress={handleChangeCruName}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </Pressable>
                                        <Pressable onPress={() => setCruNameChangeModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 20,
                                        }}>
                                        <Pressable onPress={handleChangeCruName}>
                                            <Icon
                                                name="checkmark-circle"
                                                type="ionicon"
                                                size={25}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        </Pressable>
                                        <Pressable onPress={() => setCruNameChangeModalVisible(false)}>
                                            <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                        </Pressable>
                                    </View>
                                )}

                                <Text style={styles.inputlabel}>Change your "CRU" Name</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={CRU?.name}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => {
                                            if (text.length <= 18) {
                                                setModifiedCruName(text);
                                            }
                                        }}
                                        maxLength={18}
                                        value={modifiedCruName}
                                        editable={true}
                                    />
                                </View>
                            </SafeAreaView>
                        </Modal>

                        <Modal animationType="fade" transparent={true} visible={showChangeNameConfirmationModal}>
                            <SafeAreaView
                                style={{
                                    flex: 1,
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                    paddingTop: 20,
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                        padding: 20,
                                        borderRadius: 10,
                                    }}>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Update</Text>
                                        <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                                            Are you sure you want to update your Cru's name?
                                        </Text>
                                    </View>

                                    <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                                        <Pressable
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                                marginRight: 10,
                                                borderRadius: 5,
                                            }}
                                            onPress={() => handleCancelChangeCruName}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            style={{
                                                backgroundColor: COLORS.AKCRUBLUE,
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                                borderRadius: 5,
                                            }}
                                            onPress={ConfirmChangeCruName}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Confirm</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </SafeAreaView>
                        </Modal>
                    </View>

                    <View style={{marginVertical: 10, alignItems: 'center'}}>
                        <FlatList
                            data={cruMembers()}
                            horizontal={false}
                            showsHorizontalScrollIndicator={false}
                            scrollEnabled={false}
                            numColumns={2}
                            keyExtractor={item => item.id}
                            ListHeaderComponent={
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title2,
                                            marginBottom: 20,
                                            textAlign: 'center',
                                        }}>
                                        EDIT YOUR CRU MEMBERS
                                    </Text>
                                </View>
                            }
                            ListFooterComponent={
                                <View>
                                    {cruMembers().length < 6 && potentialMembers.length > 0 && (
                                        <View style={styles.listfooter}>
                                            {/* <Pressable onPress={() => setShowAddMemberModal(true)}>
                                                <Icon name="add-circle" type="ionicon" size={25} color={COLORS.PINK} />
                                                <Text style={{...FONTS.Title2}}>Add a member</Text>
                                            </Pressable> */}
                                            <View>
                                                <Icon name="add-circle" type="ionicon" size={18} color={COLORS.PINK} />
                                                <Text style={{...FONTS.Title2, textAlign: 'center'}}>Add a potential member</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            }
                            renderItem={({item, index}) => (
                                <View style={{marginVertical: 5, alignItems: 'center'}}>
                                    <CruMemberCard
                                        userPicture={item.profilePicture}
                                        userName={item.username}
                                        onPress={() => {
                                            navigation.navigate('ViewUserScreen', {
                                                userID: item.id,
                                            });
                                        }}
                                        influencer={false}
                                        userID={item.id}
                                        akcruBadge={item.badge}
                                        userDesc={item.description}
                                        DeleteMember={() => handleDeleteMember(item.id)}
                                    />
                                </View>
                            )}
                        />
                    </View>

                    {potentialMembers.length > 0 && (
                        <View style={{marginTop: 20, alignItems: 'center', marginBottom: '25%'}}>
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    marginBottom: 20,
                                    textAlign: 'center',
                                }}>
                                POTENTIAL MEMBERS
                            </Text>
                            <FlatList
                                data={getAvailableMembers()}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={false}
                                numColumns={2}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View style={{marginVertical: 5, alignItems: 'center'}}>
                                        <AddMemberCard
                                            userPicture={item.profilePicture}
                                            userName={item.username}
                                            onPress={() => {
                                                navigation.navigate('ViewUserScreen', {
                                                    userID: item.id,
                                                });
                                            }}
                                            influencer={item.private ?? false}
                                            userID={item.id}
                                            akcruBadge={item.badge}
                                            userDesc={item.description ?? ''}
                                            AddMember={async () => {
                                                const response = await addPotentialMemberToCRU(item.id);

                                                if (response) {
                                                    setShowAddMemberModal(false);

                                                    const res = await getMyCRU();
                                                    if (res?.CRU) {
                                                        setCRU(res.CRU);
                                                        if (res.CRU.members) {
                                                            setMembers(res.CRU.members);
                                                        }
                                                        setPotentialMembers(res.acceptedMembers);
                                                    }
                                                }
                                            }}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    )}

                    <Modal animationType="fade" transparent={false} visible={showAddMemberModal}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={() => setShowAddMemberModal(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </Pressable>
                                <Text style={{...FONTS.Title1, marginLeft: 5}}>Cancel</Text>
                            </View>

                            <Text style={styles.inputlabel}>Add a new member</Text>

                            <View style={{marginBottom: 70, marginTop: 10}}>
                                <FlatList
                                    data={getAvailableMembers()}
                                    horizontal={false}
                                    showsHorizontalScrollIndicator={false}
                                    scrollEnabled={false}
                                    numColumns={2}
                                    keyExtractor={item => item.id}
                                    renderItem={({item, index}) => (
                                        <View style={{marginVertical: 5}}>
                                            <AddMemberCard
                                                userPicture={item.profilePicture}
                                                userName={item.username}
                                                onPress={() => {
                                                    navigation.navigate('ViewUserScreen', {
                                                        userID: item.id,
                                                    });
                                                }}
                                                influencer={item.private ?? false}
                                                userID={item.id}
                                                akcruBadge={item.badge}
                                                userDesc={item.description ?? ''}
                                                AddMember={async () => {
                                                    const response = await addPotentialMemberToCRU(item.id);

                                                    if (response) {
                                                        setShowAddMemberModal(false);

                                                        const res = await getMyCRU();
                                                        if (res?.CRU) {
                                                            setCRU(res.CRU);
                                                            if (res.CRU.members) {
                                                                setMembers(res.CRU.members);
                                                            }
                                                            setPotentialMembers(res.acceptedMembers);
                                                        }
                                                    }
                                                }}
                                            />
                                        </View>
                                    )}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
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
                                }}>
                                <Text
                                    style={{
                                        ...FONTS.Title3,
                                        marginBottom: 10,
                                        textAlign: 'center',
                                    }}>
                                    {`Are you sure you want to delete "${memberToDelete?.username}" from your Cru?`}
                                </Text>
                                <View style={{flexDirection: 'row'}}>
                                    <Pressable
                                        style={{
                                            backgroundColor: COLORS.PURPLE,
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            marginRight: 10,
                                            borderRadius: 5,
                                        }}
                                        onPress={() => setShowConfirmationModal(false)}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        style={{
                                            backgroundColor: COLORS.PINK,
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            borderRadius: 5,
                                        }}
                                        onPress={handleConfirmDelete}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Delete</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showAddMemberConfirmationModal}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            <View>
                                <Text
                                    style={{
                                        ...FONTS.Title3,
                                        marginBottom: 10,
                                        textAlign: 'center',
                                    }}>
                                    {`Are you sure you want to add "${selectedMember?.username}" to your Cru?`}
                                </Text>
                                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: COLORS.PURPLE,
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            marginRight: 10,
                                            borderRadius: 5,
                                        }}
                                        onPress={handleCancelAddMember}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: COLORS.AKCRUBLUE,
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            borderRadius: 5,
                                        }}
                                        onPress={handleConfirmAddMember}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Add Member</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default EditCru;
