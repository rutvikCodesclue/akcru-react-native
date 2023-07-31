import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import {Icon, color} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import CruMemberCard from '../../../components/CruMemberCard';
import UserSearchCard from '../../../components/UserSearchCard';
import AddMemberCard from '../../../components/AddMemberCard';

const EditCru = () => {
  const [originalCruName, setOriginalCruName] = useState(
    FAKE_USER_PROFILES[0].CRUName,
  );
  const [modifiedCruName, setModifiedCruName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [members, setMembers] = useState(FAKE_USER_PROFILES.slice(1, 7)); // Initial member list

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPicture, setNewMemberPicture] = useState(''); // Assuming you have a mechanism to provide the member's picture URL
  const [newMemberInfluencer, setNewMemberInfluencer] = useState(false); // Set default value to false, user can change it in the modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [showChangeNameConfirmationModal, setShowChangeNameConfirmationModal] =
    useState(false);

    

    const handleChangeCruName = () => {
      // Show the CRU name change confirmation modal
      setShowChangeNameConfirmationModal(true);
    };

    const handleConfirmChangeName = () => {
      // Update the CRU name and hide the confirmation modal
      setOriginalCruName(modifiedCruName);
      setModalVisible(false);
      setShowChangeNameConfirmationModal(false);
    };

    const handleCancelChangeName = () => {
      // Hide the confirmation modal without making any changes
      setShowChangeNameConfirmationModal(false);
    };

  


  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const handleCheckmarkPress = () => {
    setOriginalCruName(modifiedCruName);
    setModalVisible(false);
  };

  const handleModalOpen = () => {
    setModifiedCruName(originalCruName);
    setModalVisible(true);
  };

  const handleDeleteMember = (userID: string) => {
    console.log('Deleting member with userID:', userID);
    const member = members.find(m => m.userID === userID);
    if (member) {
      setMemberToDelete(member);
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      // Remove the member with the given userID from the members state
      setMembers(prevMembers =>
        prevMembers.filter(member => member.userID !== memberToDelete.userID),
      );
      // Hide the confirmation modal
      setShowConfirmationModal(false);
    }
  };

  const getAvailableMembers = () => {
    // Get the userIDs of existing CRU members
    const existingMemberIDs = members.map(member => member.userID);

    // Filter out the existing members from the FAKE_USER_PROFILES data
    return FAKE_USER_PROFILES.slice(1, 8).filter(
      member => !existingMemberIDs.includes(member.userID),
    );
  };

  const [showAddMemberConfirmationModal, setShowAddMemberConfirmationModal] =
    useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

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
    <View>
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
                <Icon
                  name="chevron-back"
                  type="ionicon"
                  size={20}
                  color={COLORS.LIGHTGREY}
                />
                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
              </View>
            </TouchableOpacity>
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
              <Pressable onPress={handleModalOpen}>
                <TextInput
                  placeholder={originalCruName}
                  placeholderTextColor={COLORS.DARKGREY}
                  style={styles.textinput}
                  secureTextEntry={false}
                  onChangeText={setModifiedCruName}
                  value={originalCruName} // Display the original value, not the modified one
                  editable={false}
                />
              </Pressable>
            </View>
          </View>
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
            data={members}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            numColumns={2}
            keyExtractor={item => item.userID}
            ListFooterComponent={
              <View
                style={{
                  borderRadius: 5,
                  backgroundColor: COLORS.AKCRUBACKGROUND,
                  width: SIZES.ScreenWidth / 2.3,
                  height: SIZES.ScreenHeight * 0.08,
                  borderWidth: 1,
                  borderColor: COLORS.AKCRUBLUE,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Pressable onPress={() => setShowAddMemberModal(true)}>
                  <Icon
                    name="add-circle"
                    type="ionicon"
                    size={25}
                    color={COLORS.GREEN}
                  />
                  <Text style={{...FONTS.Title2}}>Add a member</Text>
                </Pressable>
              </View>
            }
            renderItem={({item, index}) => (
              <View style={{marginVertical: 5, alignItems: 'center'}}>
                <CruMemberCard
                  userPicture={item.userPicture}
                  userName={item.userName}
                  onPress={() => {
                    navigation.navigate('ViewUserScreen', {
                      userID: index,
                    });
                  }}
                  influencer={item.influencer}
                  userID={item.userID}
                  akcruBadge={item.akcruBadge}
                  userDesc={item.userDesc}
                  avatarbordercolor={item.avatarbordercolor}
                  DeleteMember={() => handleDeleteMember(item.userID)}
                />
              </View>
            )}
          />
        </View>
        {/* Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showConfirmationModal}>
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
                {`Are you sure you want to delete "${memberToDelete?.userName}" from your Cru?`}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.CATREDLGT,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    marginRight: 10,
                    borderRadius: 5,
                  }}
                  onPress={() => setShowConfirmationModal(false)}>
                  <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.GREEN,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 5,
                  }}
                  onPress={handleConfirmDelete}>
                  <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={false} visible={modalVisible}>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.AKCRUBACKGROUND,
              paddingHorizontal: SIZES.ScreenWidth * 0.03,
              paddingTop: 20,
            }}>
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
                  color={COLORS.GREEN}
                />
              </Pressable>
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon
                  name="close-circle"
                  type="ionicon"
                  size={25}
                  color={COLORS.CATREDLGT}
                />
              </Pressable>
            </View>

            <Text style={styles.inputlabel}>Change your "CRU" Name</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={originalCruName}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                onChangeText={setModifiedCruName}
                value={modifiedCruName} // Use the modified value in the TextInput
                editable={true}
              />
            </View>
          </View>
        </Modal>

        {/* CRU Name Change Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showChangeNameConfirmationModal}>
          <View
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
                {`Are you sure you want to change your CRU's Name to "${modifiedCruName}"?`}
              </Text>
              <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.CATREDLGT,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    marginRight: 10,
                    borderRadius: 5,
                  }}
                  onPress={handleCancelChangeName}>
                  <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.GREEN,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 5,
                  }}
                  onPress={handleConfirmChangeName}>
                  <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          animationType="fade"
          transparent={false}
          visible={showAddMemberModal}>
          <View
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
                <Icon
                  name="close-circle"
                  type="ionicon"
                  size={25}
                  color={COLORS.CATREDLGT}
                />
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
                keyExtractor={item => item.userID}
                renderItem={({item, index}) => (
                  <View style={{marginVertical: 5}}>
                    <AddMemberCard
                      userPicture={item.userPicture}
                      userName={item.userName}
                      onPress={() => {
                        navigation.navigate('ViewUserScreen', {
                          userID: index,
                        });
                      }}
                      influencer={item.influencer}
                      userID={item.userID}
                      akcruBadge={item.akcruBadge}
                      userDesc={item.userDesc}
                      avatarbordercolor={item.avatarbordercolor}
                      AddMember={() => {
                        // Set the selected member when the user clicks on the "Add Member" button
                        setSelectedMember(item);
                        // Show the Add Member confirmation modal
                        setShowAddMemberConfirmationModal(true);
                      }}
                    />
                  </View>
                )}
              />
            </View>

            {/* Add other input fields for member picture, influencer, etc. */}
          </View>
        </Modal>

        {/* Add Member Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAddMemberConfirmationModal}>
          <View
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
                {`Are you sure you want to add "${selectedMember?.userName}" to your Cru?`}
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
                  <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.GREEN,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 5,
                  }}
                  onPress={handleConfirmAddMember}>
                  <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>
                    Add Member
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default EditCru;
