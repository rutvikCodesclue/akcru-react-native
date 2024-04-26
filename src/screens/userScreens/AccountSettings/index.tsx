import {View, Text, TextInput, TouchableOpacity, Pressable, Modal, ImageBackground, SafeAreaView, Alert, Platform} from 'react-native';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import InputsLrg from '../../../components/inputLrg';

const date = new Date('2000-01-07');
date.setHours(0, 0, 0, 0); // Set the time to midnight

const day = date.getDate();
const month = date.toLocaleString('default', {month: 'long'});
const year = date.getFullYear();
const formattedDate = `${day} ${month} ${year}`;


const AccountSettings = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();

    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
    const [privacySetting, setPrivacySetting] = useState('Public'); // Add state for privacy setting
    const [watchStatus, setWatchStatus] = useState('Yes'); // Add state for privacy setting

    const [firstName, setFirstName] = useState('');
    const [firstNameModified, setFirstNameModified] = useState('');
    const [firstNameModalVisible, setFirstNameModalVisible] = useState(false);

    const [lastName, setLastName] = useState('');
    const [lastNameModified, setLastNameModified] = useState('');
    const [lastNameModalVisible, setLastNameModalVisible] = useState(false);

    const [phone, setPhone] = useState('');
    const [phoneModified, setPhoneModified] = useState('');
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    const formatDateToDayMonthYear = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', {month: 'long'});
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            //console.log('AccountSettings Screen focused [AccountSettings]');
            hydrateUser();
            //console.log(user?.username)
            //console.log(user?.password)
            //console.log(user?.dateOfBirth)
            //console.log(user?.firstName)
            //console.log(user?.email)

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                //console.log('AccountSettings Screen unfocused [AccountSettings]');
            };
        }, []),
    );

    const handleFirstNameModalOpen = () => {
        setFirstNameModified(firstName);
        setFirstNameModalVisible(true);
    };

    const handleLastNameModalOpen = () => {
        setLastNameModified(lastName);
        setLastNameModalVisible(true);
    };

    const handlePhoneModalOpen = () => {
        setPhoneModified(phone);
        setPhoneModalVisible(true);
    };

    const handlePasswordModalOpen = () => {
        setPasswordModified(password);
        setPasswordModalVisible(true);
    };

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

    // const handlePhoneChange = (text: React.SetStateAction<string | undefined>) => {
    //     console.log('New Phone Number:', text);
    //     setPhone(text);
    // };

    const [showUpdateFirstNameConfirmation, setShowUpdateFirstNameConfirmation] = useState(false);

    const handleChangeFirstName = () => {
        setShowUpdateFirstNameConfirmation(true);
    };

    const confirmFirstNameUpdate = async () => {
        try {
            setLoading(true);

            // Create an object with only the `firstName` field to update
            const updatedFields = {
                firstName: firstName,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
                // Update was successful on both client and backend
                //console.log('Profile updated successfully:', updatedUser);
            } else {
                // Handle update failure (e.g., show an error message)
                console.error('Failed to update profile.');
            }
        } catch (error) {
            // Handle any errors (e.g., network issues)
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateFirstNameConfirmation(false);
            setFirstNameModalVisible(false);

            const currentUser = useAuthStore.getState().user;

            // Update the username in the user's profile in the store immediately:
            if (currentUser) {
                currentUser.firstName = firstName;
                useAuthStore.setState({user: currentUser}); // Use setState to update the user
            }
        }
    };

    const [showUpdateLastNameConfirmation, setShowUpdateLastNameConfirmation] = useState(false);

    const handleChangeLastName = () => {
        setShowUpdateLastNameConfirmation(true);
    };

    const confirmLastNameUpdate = async () => {
        try {
            setLoading(true);

            // Create an object with only the `firstName` field to update
            const updatedFields = {
                lastName: lastName,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
                // Update was successful on both client and backend
                //console.log('Profile updated successfully:', updatedUser);
            } else {
                // Handle update failure (e.g., show an error message)
                console.error('Failed to update profile.');
            }
        } catch (error) {
            // Handle any errors (e.g., network issues)
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateLastNameConfirmation(false);
            setLastNameModalVisible(false);

            const currentUser = useAuthStore.getState().user;

            // Update the username in the user's profile in the store immediately:
            if (currentUser) {
                currentUser.lastName = lastName;
                useAuthStore.setState({user: currentUser}); // Use setState to update the user
            }
        }
    };

    const [showUpdatePhoneConfirmation, setShowUpdatePhoneConfirmation] = useState(false);

    const handleChangePhone = () => {
        // Check if the phone number has at least 11 digits
        if (phone.length < 10) {
            // Show an alert to inform the user
            Alert.alert('Invalid Phone Number', 'Phone number must have at least 10 digits.');
        } else {
            // If the phone number is valid, show the confirmation modal
            setShowUpdatePhoneConfirmation(true);
        }
    };

    const confirmPhoneUpdate = async () => {
        try {
            setLoading(true);

            // Create an object with only the `phone` field to update
            const updatedFields = {phone};

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
                //console.log('Profile updated successfully:', updatedUser);
            } else {
                console.error('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);

            if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                console.error('Unhandled error:', error);
            }
        } finally {
            setLoading(false);
            setShowUpdatePhoneConfirmation(false);
            setPhoneModalVisible(false);

            // Update the phone number in the user's profile in the store immediately:
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                currentUser.phoneNumber = phone;
                useAuthStore.setState({user: currentUser});
            }
        }
    };

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [dob, setDob] = useState(user?.dateOfBirth || '');
    const [dobModified, setDobModified] = useState('');
    const [dobModalVisible, setDobModalVisible] = useState(false);

    
    const handleDobModalOpen = () => {
        setDobModified(dob);
        setDobModalVisible(true);
    };

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = ({ type }: { type: string }, selectedDate: Date) => {
    if (type === 'set') {
        const currentDate = new Date(selectedDate);
        currentDate.setHours(0, 0, 0, 0); // Set the time to midnight
        setDate(currentDate);
        //console.log('DOB setDate:', currentDate);

        if (Platform.OS === 'android') {
            toggleDatePicker();
            setDob(currentDate.toISOString()); // Convert to ISO string format with midnight time
            //console.log('DOB setDate to string:', currentDate);
        }
    } else {
        toggleDatePicker();
    }
};

const confirmIOSDate = ({ type }: { type: string }, selectedDate: Date) => {
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight
    setDob(currentDate.toISOString()); // Convert to ISO string format with midnight time
    toggleDatePicker();
};

    const confirmDobUpdate = async () => {
        try {
            setLoading(true);

            // Call the updateUser function to send the updated data to the backend
            const updatedFields = {
                dob: dob, // Use dob as a string
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
                // Update was successful on both client and backend
                //console.log('Profile updated successfully:', updatedUser);
            } else {
                // Handle update failure (e.g., show an error message)
                console.error('Failed to update profile.');
            }
        } catch (error) {
            // Handle any errors (e.g., network issues)
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setDobModalVisible(false);
            const currentUser = useAuthStore.getState().user;

            // Update the username and dob in the user's profile in the store immediately:
            if (currentUser) {
                currentUser.dateOfBirth = dob; // Update dob
                useAuthStore.setState({user: currentUser}); // Use setState to update the user
            }
        }
    };

    const [password, setPassword] = useState('');
    const [passwordModified, setPasswordModified] = useState('');
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    const [showUpdatePasswordConfirmation, setShowUpdatePasswordConfirmation] = useState(false);
    const [showPasswordFormatError, setShowPasswordFormatError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = () => {
        if (password.length >= 8) {
            if (password === confirmPassword) {
                // Check if passwords match
                setPasswordError(false);
                setShowUpdatePasswordConfirmation(true);
            } else {
                setPasswordError(true); // Set a password error state
            }
        } else {
            setShowPasswordFormatError(true);
        }
    };

    const confirmPasswordUpdate = async () => {
        try {
            setLoading(true);

            // Create an object with only the `Password` field to update
            const updatedFields = {
                password: password,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
                // Update was successful on both client and backend
                //console.log('Profile updated successfully:', updatedUser);
            } else {
                // Handle update failure (e.g., show an error message)
                console.error('Failed to update profile.');
            }
        } catch (error) {
            // Handle any errors (e.g., network issues)
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdatePasswordConfirmation(false);
            setPasswordModalVisible(false);

            const currentUser = useAuthStore.getState().user;

            // Update the username in the user's profile in the store immediately:
            if (currentUser) {
                currentUser.password = password;
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
                    <Text style={{...FONTS.paragraph1, marginBottom: 10, color: COLORS.PINK}}>
                        ( This information will not be shared publicly )
                    </Text>
                    {/* firstName */}
                    <View>
                        <Text style={styles.inputlabel}>First name</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handleFirstNameModalOpen}>
                                <TextInput
                                    placeholder={user?.firstName}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setFirstNameModified(text)}
                                    value={firstName || ''}
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>
                    {/* firstName Modal */}
                    <Modal animationType="fade" transparent={false} visible={firstNameModalVisible}>
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
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangeFirstName}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </Pressable>
                                <Pressable onPress={() => setFirstNameModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.DARKAKCRUBLUE} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>Change Firstname</Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.firstName}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setFirstName(text)}
                                    value={firstName} // Use the modified value in the TextInput
                                    editable={true}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* firstName Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdateFirstNameConfirmation}>
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
                                        Are you sure you want to update your Firstname?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdateFirstNameConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: COLORS.DARKAKCRUBLUE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmFirstNameUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: COLORS.PURPLE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    {/* lastName*/}
                    <View>
                        <Text style={styles.inputlabel}>Last name</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handleLastNameModalOpen}>
                                <TextInput
                                    placeholder={user?.lastName}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setLastNameModified(text)}
                                    value={lastName || ''}
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>
                    {/* lastName Modal */}
                    <Modal animationType="fade" transparent={false} visible={lastNameModalVisible}>
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
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangeLastName}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </Pressable>
                                <Pressable onPress={() => setLastNameModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.DARKAKCRUBLUE} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>Change Lastname</Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.lastName}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setLastName(text)}
                                    value={lastName} // Use the modified value in the TextInput
                                    editable={true}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* lastName Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdateLastNameConfirmation}>
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
                                        Are you sure you want to update your Lastname?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdateLastNameConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: COLORS.DARKAKCRUBLUE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmLastNameUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: COLORS.PURPLE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    {/* phone*/}
                    {/* <View>
                        <Text style={styles.inputlabel}>Phone number</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handlePhoneModalOpen}>
                                <MaskedTextInput
                                    mask="1-999-999-9999"
                                    placeholder={user?.phoneNumber}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setPhoneModified(text)}
                                    value={phone || ''}
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View> */}
                    <View>
                        <Text style={styles.inputlabel}>Phone number</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handlePhoneModalOpen}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{color: COLORS.DARKGREY}}>+1</Text>
                                    <TextInput
                                        placeholder={user?.phoneNumber}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        keyboardType="number-pad"
                                        maxLength={10}  // Limit input to 10 digits
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            setPhoneModified(numericText);
                                        }}
                                        value={phone || ''}
                                        editable={false}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    </View>

                    {/* phone Modal */}
                    <Modal animationType="fade" transparent={false} visible={phoneModalVisible}>
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
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangePhone}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </Pressable>
                                <Pressable onPress={() => setPhoneModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.DARKAKCRUBLUE} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>Change Phonenumber</Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.phoneNumber}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => {
                                        // Remove non-numeric characters from the input
                                        const numericText = text.replace(/[^0-9]/g, '');

                                        // Limit the input to 10 characters
                                        const limitedText = numericText.substring(0, 10);

                                        // Update the state with the limited and formatted text
                                        setPhone(limitedText);
                                    }}
                                    value={phone} // Use the modified value in the TextInput
                                    keyboardType="phone-pad" // Set keyboard type to phone-pad
                                    editable={true}
                                />
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* phone Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdatePhoneConfirmation}>
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
                                        Are you sure you want to update your Phone Number?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdatePhoneConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: COLORS.DARKAKCRUBLUE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmPhoneUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: COLORS.PURPLE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    {/* DOB */}
                    <View>
                        <Text style={styles.inputlabel}>DOB</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handleDobModalOpen}>
                                <TextInput
                                    placeholder={user?.dateOfBirth || 'Select Date of Birth'}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setDobModified(text)}
                                    value={dob ? formatDateToDayMonthYear(new Date(dob)) : ''}
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>
                    {/* DOB Modal */}
                    <Modal animationType="fade" transparent={false} visible={dobModalVisible}>
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
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={confirmDobUpdate}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </Pressable>
                                <Pressable onPress={() => setDobModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.DARKAKCRUBLUE} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>Change Date of Birth</Text>
                            <View style={styles.input}>
                                {/* Dob picker */}
                                {showPicker && (
                                    <DateTimePicker
                                        display="spinner"
                                        mode="date"
                                        value={date}
                                        onChange={onChange}
                                        style={styles.datepicker}
                                    />
                                )}

                                {showPicker && Platform.OS === 'ios' && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-around',
                                        }}>
                                        <TouchableOpacity
                                            style={[styles.iosbutton, styles.iospickerbutton]}
                                            onPress={toggleDatePicker}>
                                            <Text style={{...FONTS.paragraph1, color: COLORS.BLACK}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iosbutton, styles.iospickerbutton]}
                                            onPress={confirmIOSDate}>
                                            <Text style={{...FONTS.paragraph1, color: COLORS.BLACK}}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {!showPicker && (
                                    <Pressable onPress={toggleDatePicker}>
                                        <TextInput
                                            placeholder={user?.dateOfBirth || 'Select Date of Birth'} // Use placeholder instead of placeholdername
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={(text: string) => {
                                                //console.log('Input Changed:', text); // Log input changes
                                                setDob(text); // Call handleDobChange
                                            }}
                                            value={dob ? formatDateToDayMonthYear(new Date(dob)) : ''} // Use the dob state
                                            editable={true}
                                            onPressIn={toggleDatePicker}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* Password */}
                    <View>
                        <Text style={styles.inputlabel}>Change Password</Text>
                        <View style={styles.input}>
                            <Pressable onPress={handlePasswordModalOpen}>
                                <TextInput
                                    placeholder={'**********'}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={true}
                                    onChangeText={text => setPasswordModified(text)}
                                    value={password || ''}
                                    editable={false}
                                />
                            </Pressable>
                        </View>
                    </View>
                    {/* Password Modal */}
                    <Modal animationType="fade" transparent={false} visible={passwordModalVisible}>
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
                                    justifyContent: 'space-between',
                                    marginBottom: 20,
                                }}>
                                <Pressable onPress={handleChangePassword}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </Pressable>
                                <Pressable onPress={() => setPasswordModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.DARKAKCRUBLUE} />
                                </Pressable>
                            </View>

                            <Text style={styles.inputlabel}>
                                Change Password{' '}
                                <Text style={{color: COLORS.MIDORANGE}}>(Must be atleast 8 characters)</Text>
                            </Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.password}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={true}
                                    onChangeText={text => setPassword(text)}
                                    value={password} // Use the modified value in the TextInput
                                    editable={true}
                                />
                            </View>
                            <Text style={styles.inputlabel}>Confirm New Password </Text>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={user?.password}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={true}
                                    onChangeText={text => {
                                        setConfirmPassword(text); // Update confirmPassword state
                                        // Check if the passwords match in real-time
                                        if (password === text) {
                                            setPasswordError(false); // Clear the error if they match
                                        } else {
                                            setPasswordError(true);
                                        }
                                    }}
                                    value={confirmPassword} // Use the modified value in the TextInput
                                    editable={true}
                                />
                                {passwordError && <Text style={styles.warningText}>Passwords do not match.</Text>}
                            </View>
                        </SafeAreaView>
                    </Modal>
                    {/* Password Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showUpdatePasswordConfirmation}>
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
                                        Are you sure you want to update your Password?
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <TouchableOpacity
                                        onPress={() => setShowUpdatePasswordConfirmation(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: COLORS.DARKAKCRUBLUE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmPasswordUpdate} // Confirm the update
                                        style={{
                                            backgroundColor: COLORS.PURPLE,
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    {/* Password Format Error Modal */}
                    <Modal animationType="fade" transparent={true} visible={showPasswordFormatError}>
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
                                    <Text style={{...FONTS.Title3, marginBottom: 10}}>Error</Text>
                                    <Text style={{marginBottom: 20, ...FONTS.Title3}}>
                                        Password must be atleat 8 characters
                                    </Text>
                                </View>

                                <View>
                                    <TouchableOpacity
                                        onPress={() => setShowPasswordFormatError(false)} // Hide the confirmation modal
                                        style={{
                                            backgroundColor: COLORS.DARKAKCRUBLUE,
                                            padding: 10,
                                            borderRadius: 5,
                                            alignSelf: 'center',
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

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

                    {/* <View style={{borderWidth: 0.8, borderRadius: 5, borderColor: COLORS.LIGHTGREY, padding: 10}}>
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
                    </View> */}
                    {/* <View style={{alignItems: 'center', marginTop: 20}}>
                        <AkcruButtons.LrgButton
                            btnname={'Update'}
                            disabled={false}
                            color={COLORS.AKCRUBLUE}
                            onPress={handleUpdateProfile} // Show the confirmation modal
                        />
                    </View> */}
                    {/* Confirmation Modal */}
                    {/* <Modal animationType="fade" transparent={true} visible={showUpdateConfirmation}>
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
                    </Modal> */}
                </View>
            </ScrollView>
        </View>
    );
};

export default AccountSettings;
