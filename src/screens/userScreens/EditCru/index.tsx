import {
    View,
    Text,
    Image,
    ScrollView,
    Pressable,
    
    TextInput,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
    SafeAreaView,
    Platform,
} from 'react-native';
import {TouchableOpacity } from 'react-native-gesture-handler';
import React, {useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import {Icon, color} from '@rneui/base';
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

    const [CRU, setCRU] = useState<ICru | undefined>(undefined); // CRU object from the API

    const [loading, setLoading] = useState(false);

    const [originalCruName, setOriginalCruName] = useState('');
    const [modifiedCruName, setModifiedCruName] = useState('');
    const [cruNameChangeModalVisible, setCruNameChangeModalVisible] = useState(false);

    const [potentialMembers, setPotentialMembers] = useState<IUserProfile[] | []>([]); // Possible member list
    const [members, setMembers] = useState<IUserProfile[] | []>([]); // Initial member list

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<IUserProfile | null>(null);

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const [showChangeNameConfirmationModal, setShowChangeNameConfirmationModal] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            getMyCRU().then(res => {
                //console.log('Data from getMyCRU:', res); // Log the data
                setCRU(res?.CRU);
                if (res?.CRU.members) {
                    setMembers(res.CRU.members);
                    setPotentialMembers(res.acceptedMembers);
                }
            });

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                //console.log('Screen unfocused [EditCruScreen]');

                // cleanup (if app crashes or user leaves the screen unexpectedly)
            };
        }, []),
    );

    const handleChangeCruName = () => {
        // Show the CRU name change confirmation modal
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
                // Call the updateCRUInfo function to send the updated CRU name to the backend
                const updatedCRU = await updateCRUInfo({name: modifiedCruName});

                if (updatedCRU) {
                    // Update the CRU object in your state
                    setCRU(updatedCRU);
                    // Log the modified CRU name
                    //console.log('Modified CRU Name:', updatedCRU.name);
                }
            } else {
                console.error('Invalid CRU name');
                // Handle invalid CRU name here if needed
            }

            // Hide the confirmation modal and update loading state
            setShowChangeNameConfirmationModal(false);
            setCruNameChangeModalVisible(false);
        } catch (error) {
            console.error('Error updating CRU name:', error);
            // Handle API error here if needed
        } finally {
            setLoading(false);
        }
    };

    

    const handleCancelChangeCruName = () => {
        // Hide the confirmation modal without making any changes
        setShowChangeNameConfirmationModal(false);
    };

    const handleDeleteMember = (userID: string) => {
        // Find the member in the local state
        const member = members.find(m => m.id === userID);
        if (member) {
            // Set memberToDelete to the found member
            setMemberToDelete(member);
            // Show the confirmation modal
            setShowConfirmationModal(true);
        }
    };


    const handleConfirmDelete = async () => {
        if (memberToDelete && CRU?.id) {
            try {
                // Make an API call to remove the user from the CRU
                const updatedCRU = await removeAUserFromCRU(memberToDelete.id, CRU?.id);
                // console.log('User removed from CRU:', memberToDelete.id);
                // console.log('CRU Id:', CRU.id);
                // console.log("updatedCRU:", updatedCRU)

                if (updatedCRU) {
                    // Update the local state with the updated CRU
                    setCRU(updatedCRU);
                    // Remove the member with the given userID from the members state
                    setMembers(prevMembers => prevMembers.filter(member => member.id !== memberToDelete.id));
                    // Hide the confirmation modal
                    setShowConfirmationModal(false);
                    //console.log('User removed from CRU:', memberToDelete.id);
                }
            } catch (error) {
                console.error('Error removing user from CRU:', error);
                // Handle API error here if needed
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
        // Show the Add Member confirmation modal
        setShowAddMemberConfirmationModal(true);
    };

    const handleConfirmAddMember = () => {
        if (selectedMember) {
            // Add the selected member to the CRU
            setMembers(prevMembers => [...prevMembers, selectedMember]);
            setShowAddMemberModal(false);
            setShowAddMemberConfirmationModal(false);
        }
    };

    const handleCancelAddMember = () => {
        // Hide the confirmation modal without adding the member
        setShowAddMemberConfirmationModal(false);
    };

    return (
        <TabContainer>
            <SafeAreaView>
            <ScrollView stickyHeaderIndices={[0]}>
                <View style={styles.backbutton}>
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
                            {
                            Platform.OS == 'ios' ?
                            <TouchableOpacity onPress={handleCruNameChangeModalOpen}>
                                <TextInput
                                    placeholder={CRU?.name}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setModifiedCruName(text)}
                                    value={originalCruName || ''} // Display the original value, not the modified one
                                    editable={false}
                                />
                            </TouchableOpacity>:
                            <Pressable onPress={handleCruNameChangeModalOpen}>
                                <TextInput
                                    placeholder={CRU?.name}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setModifiedCruName(text)}
                                    value={originalCruName || ''} // Display the original value, not the modified one
                                    editable={false}
                                />
                            </Pressable>



                            }
                            
                        </View>
                    </View>
                    {/* CRU Name Change Modal */}
                    <Modal animationType="fade" transparent={false} visible={cruNameChangeModalVisible}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>

                            {
                            Platform.OS == 'ios' ?
                            (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <TouchableOpacity onPress={handleChangeCruName}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.GREEN} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setCruNameChangeModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.CATREDLGT} />
                                </TouchableOpacity>
                            </View>
                            )
                            :(
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangeCruName}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.GREEN} />
                                </Pressable>
                                <Pressable onPress={() => setCruNameChangeModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.CATREDLGT} />
                                </Pressable>
                            </View>)}

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
                                    maxLength={18} // Limit the input to 18 characters
                                    value={modifiedCruName} // Use the modified value in the TextInput
                                    editable={true}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* CRU Name Change Confirmation Modal */}
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
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: COLORS.CATREDLGT,
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            marginRight: 10,
                                            borderRadius: 5,
                                        }}
                                        onPress={() => handleCancelChangeCruName}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: 'green',
                                            paddingHorizontal: 20,
                                            paddingVertical: 10,
                                            borderRadius: 5,
                                        }}
                                        onPress={ConfirmChangeCruName}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                    <Text
                        style={{
                            ...FONTS.Title2,
                            marginBottom: 20,
                            textAlign: 'center',
                            fontSize: 14,
                        }}>
                        EDIT YOUR CRU MEMBERS
                    </Text>
                </View>

                <View style={{marginBottom: 75, alignItems: 'center'}}>
                    <FlatList
                        data={cruMembers()}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                        numColumns={2}
                        keyExtractor={item => item.id}
                        ListFooterComponent={
                        <View>
                            {cruMembers().length < 6 && (
                                <View style={styles.listfooter}>
                                <Pressable onPress={() => setShowAddMemberModal(true)}>
                                    <Icon name="add-circle" type="ionicon" size={25} color={COLORS.PINK} />
                                    <Text style={{ ...FONTS.Title2 }}>Add a member</Text>
                                </Pressable>
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
                                    influencer={false} // TODO: make this work
                                    userID={item.id}
                                    akcruBadge={item.badge}
                                    userDesc={item.description}
                                    DeleteMember={() => handleDeleteMember(item.id)}
                                />
                            </View>
                        )}
                    />
                </View>
                {/* Add Member Modal */}
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
                                                // Set the selected member when the user clicks on the "Add Member" button
                                                // setSelectedMember(item);
                                                const response = await addPotentialMemberToCRU(item.id);

                                                if (response) {
                                                    // Show the Add Member confirmation modal
                                                    setShowAddMemberModal(false);
                                                    // setShowAddMemberConfirmationModal(true);
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

                        {/* Add other input fields for member picture, influencer, etc. */}
                    </SafeAreaView>
                </Modal>
                {/* Confirmation Modal */}
                <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                    <SafeAreaView
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
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: COLORS.PURPLE,
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        marginRight: 10,
                                        borderRadius: 5,
                                    }}
                                    onPress={() => setShowConfirmationModal(false)}>
                                    <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: COLORS.PINK,
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        borderRadius: 5,
                                    }}
                                    onPress={handleConfirmDelete}>
                                    <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </Modal>

                {/* Add Member Confirmation Modal */}
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
                                        backgroundColor: COLORS.CATREDLGT,
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
                                        backgroundColor: COLORS.GREEN,
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
