import {View, Text, TextInput, TouchableOpacity, Pressable, Modal, ImageBackground} from 'react-native';
import React, { useState } from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import {ScrollView} from 'react-native-gesture-handler';
import {Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import AkcruButtons from '../../../components/akcruButtons';
import {MaskedTextInput} from 'react-native-mask-text';
import {updateUser} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import {supabase} from '../../../../lib/supabase';

const AccountSettings = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
    const [privacySetting, setPrivacySetting] = useState('Public'); // Add state for privacy setting
    const [watchStatus, setWatchStatus] = useState('Yes'); // Add state for privacy setting
    const [firstName, setFirstName] = useState(user?.firstName);
    const [lastName, setLastName] = useState(user?.lastName);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            console.log('AccountSettings Screen focused [AccountSettings]');
            hydrateUser();

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('AccountSettings Screen unfocused [AccountSettings]');
            };
        }, []),
    );

    const handleUpdateProfile = () => {
        // Show the confirmation modal
        setShowUpdateConfirmation(true);
    };

    const handleConfirmUpdate = () => {
        // Hide the confirmation modal
        setShowUpdateConfirmation(false);

        // Call the UpdateProfile function to update the profile information
        // UpdateProfile({userName, desc});
    };

    const confirmUpdate = async () => {
        try {
            setLoading(true);

            // Call the updateUser function to send the updated data to the backend
            const updatedUser = await updateUser({
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth
            
                // Pass the state update functions to the API function
            });

            if (updatedUser) {
                // Update was successful on both client and backend
                console.log('Profile updated successfully:', updatedUser);
            } else {
                // Handle update failure (e.g., show an error message)
                console.error('Failed to update profile.');
            }
        } catch (error) {
            // Handle any errors (e.g., network issues)
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateConfirmation(false);

            const currentUser = useAuthStore.getState().user;

            // Update the username in the user's profile in the store immediately:
            if (currentUser) {
                currentUser.firstName = firstName;
                currentUser.lastName = lastName;
                currentUser.dateOfBirth = dateOfBirth;
                useAuthStore.setState({user: currentUser}); // Use setState to update the user
            }
        }
    };

    return (
        <View>
            <ScrollView stickyHeaderIndices={[0]}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>
                <View style={styles.container}>
                    <View>
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
                    </View>
                    <Text style={styles.title}>ACCOUNT SETTINGS</Text>
                    <Text style={{...FONTS.paragraph1, marginBottom: 10, fontSize: 12, color: COLORS.MIDORANGE}}>
                        ( This information will not be shared publicly )
                    </Text>
                    <View>
                        <Text style={styles.inputlabel}>First name</Text>
                        <View style={styles.input}>
                            <TextInput
                                placeholder={user?.firstName}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={text => setFirstName(text)}
                                value={firstName || ''}
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={styles.inputlabel}>Last name</Text>
                        <View style={styles.input}>
                            <TextInput
                                placeholder={user?.lastName}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={text => setLastName(text)}
                                value={lastName || ''}
                            />
                        </View>
                    </View>
                    {/* <View>
                        <Text style={styles.inputlabel}>DOB</Text>
                        <View style={styles.input}>
                            <MaskedTextInput
                                mask="99/99/9999"
                                placeholder={user?.dateOfBirth}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={text => setDateOfBirth(text)}
                                value={dateOfBirth || ''}
                                keyboardType="phone-pad" // Set keyboard type to phone-pad
                            />
                        </View>
                    </View> */}
                    <View>
                        <Text style={styles.inputlabel}>Phone number</Text>
                        <View style={styles.input}>
                            <MaskedTextInput
                                mask="+1-999-999-9999"
                                placeholder="+1-123-456-7890"
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={text => setPhoneNumber(text)}
                                value={phoneNumber || ''}
                                keyboardType="phone-pad" // Set keyboard type to phone-pad
                            />
                        </View>
                    </View>
                    {/* <View>
                        <Text style={styles.inputlabel}>New Password</Text>
                        <View style={styles.input}>
                            <TextInput
                                placeholder={lastName}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={true}
                                onChangeText={text => setLastName(text)}
                                value={lastName || ''}
                            />
                        </View>
                    </View>
                    <View>
                        <Text style={styles.inputlabel}>Confirm New Password</Text>
                        <View style={styles.input}>
                            <TextInput
                                placeholder={lastName}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={true}
                                onChangeText={text => setLastName(text)}
                                value={lastName || ''}
                            />
                        </View>
                    </View> */}

                    <View
                        style={{
                            borderBottomWidth: 0.8,
                            borderColor: COLORS.LIGHTGREY,
                            marginTop: 20,
                            marginBottom: 40,
                            width: SIZES.ScreenWidth / 4,
                            alignSelf: 'center',
                        }}
                    />

                    <View style={{borderWidth: 0.8, borderRadius: 5, borderColor: COLORS.LIGHTGREY, padding: 10}}>
                        <Text style={{...FONTS.Title2, marginBottom: 5, textAlign: 'center'}}>Privacy settings</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingBottom: 10,
                                alignSelf: 'center',
                            }}>
                            <Text style={{...FONTS.Title2, paddingRight: 10}}>Control who can see your profile</Text>
                            <Icon name="eye-outline" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',

                                paddingBottom: 5,
                            }}>
                            <Pressable onPress={() => setPrivacySetting('Public')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>Public</Text>
                                    {privacySetting === 'Public' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </Pressable>
                            <Pressable onPress={() => setPrivacySetting('Followers')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>Only Followers</Text>
                                    {privacySetting === 'Followers' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </Pressable>
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
                            <Text style={{...FONTS.Title2, paddingRight: 10, textAlign: 'center'}}>
                                Do you want your followers to see your "Watch Status"?
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',

                                paddingBottom: 5,
                            }}>
                            <Pressable onPress={() => setWatchStatus('Yes')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>Yes</Text>
                                    {watchStatus === 'Yes' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </Pressable>
                            <Pressable onPress={() => setWatchStatus('No')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>No</Text>
                                    {watchStatus === 'No' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{alignItems: 'center', marginTop: 20}}>
                        <AkcruButtons.LrgButton
                            btnname={'Update'}
                            disabled={false}
                            color={COLORS.AKCRUBLUE}
                            onPress={handleUpdateProfile} // Show the confirmation modal
                        />
                    </View>
                    {/* Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdateConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                                        Are you sure you want to update your Account settings?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdateConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: 'red',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: 'green',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </View>
    );
};

export default AccountSettings;
