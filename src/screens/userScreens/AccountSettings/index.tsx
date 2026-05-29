import {
    View,
    Text,
    TextInput,
    Modal,
    SafeAreaView,
    Alert,
    Platform,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import {ScrollView} from 'react-native-gesture-handler';
import {Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {updateUser} from '../../../lib/api/user.lib';
import useAuthStore from '../../../stores/auth.store';
import DateTimePicker from '@react-native-community/datetimepicker';
import {TouchableOpacity} from 'react-native-gesture-handler';
import BackButton from '../../../components/General/backbutton';
import {deleteMyAccount} from '../../../lib/api/userDelete.lib';
import ConfirmationModal from '../../../components/ConfirmationModal';
const date = new Date('2000-01-07');
date.setHours(0, 0, 0, 0);

const AccountSettings = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const user = useAuthStore(state => state.user);
    const {hydrateUser} = useAuthStore();

    const [, setShowUpdateConfirmation] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [, setFirstNameModified] = useState('');
    const [firstNameModalVisible, setFirstNameModalVisible] = useState(false);

    const [lastName, setLastName] = useState('');
    const [, setLastNameModified] = useState('');
    const [lastNameModalVisible, setLastNameModalVisible] = useState(false);

    const [phone, setPhone] = useState('');
    const [, setPhoneModified] = useState('');
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);

    const [, setLoading] = useState(false);

    const formatDateToDayMonthYear = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', {month: 'long'});
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    useFocusEffect(
        React.useCallback(() => {
            hydrateUser();
            return () => {};
        }, []),
    );

    const handleFirstNameModalOpen = () => {
        setFirstNameModified(firstName);
        setFirstName(user?.firstName ?? '');
        setFirstNameModalVisible(true);
    };

    const handleLastNameModalOpen = () => {
        setLastNameModified(lastName);
        setLastName(user?.lastName ?? '');
        setLastNameModalVisible(true);
    };

    const handlePhoneModalOpen = () => {
        setPhoneModified(phone);
        setPhone(user?.phoneNumber ?? '');
        setPhoneModalVisible(true);
    };

    const handlePasswordModalOpen = () => {
        setPasswordModified(password);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setPasswordModalVisible(true);
    };

    const handleUpdateProfile = () => {
        setShowUpdateConfirmation(true);
    };

    const handleConfirmUpdate = () => {
        setShowUpdateConfirmation(false);
    };

    const [showUpdateFirstNameConfirmation, setShowUpdateFirstNameConfirmation] = useState(false);

    const handleChangeFirstName = () => {
        setFirstNameModalVisible(false);

        setShowUpdateFirstNameConfirmation(true);
    };

    const confirmFirstNameUpdate = async () => {
        try {
            setLoading(true);
            const updatedFields = {
                firstName: firstName,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
            } else {
                console.error('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateFirstNameConfirmation(false);
            setFirstNameModalVisible(false);

            const currentUser = useAuthStore.getState().user;

            if (currentUser) {
                currentUser.firstName = firstName;
                useAuthStore.setState({user: currentUser});
            }
        }
    };

    const [showUpdateLastNameConfirmation, setShowUpdateLastNameConfirmation] = useState(false);

    const handleChangeLastName = () => {
        setLastNameModalVisible(false);
        setShowUpdateLastNameConfirmation(true);
    };

    const confirmLastNameUpdate = async () => {
        try {
            setLoading(true);

            const updatedFields = {
                lastName: lastName,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
            } else {
                console.error('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdateLastNameConfirmation(false);
            setLastNameModalVisible(false);

            const currentUser = useAuthStore.getState().user;

            if (currentUser) {
                currentUser.lastName = lastName;
                useAuthStore.setState({user: currentUser});
            }
        }
    };

    const [showUpdatePhoneConfirmation, setShowUpdatePhoneConfirmation] = useState(false);

    const handleChangePhone = () => {
        if (phone.length < 10) {
            Alert.alert('Invalid Phone Number', 'Phone number must have at least 10 digits.');
        } else {
            setPhoneModalVisible(false);
            setShowUpdatePhoneConfirmation(true);
        }
    };

    const confirmPhoneUpdate = async () => {
        try {
            setLoading(true);

            const updatedFields = {phone};

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
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

    const onChange = ({type}: {type: string}, selectedDate: Date) => {
        if (type === 'set') {
            const currentDate = new Date(selectedDate);
            currentDate.setHours(0, 0, 0, 0);
            setDate(currentDate);

            if (Platform.OS === 'android') {
                toggleDatePicker();
                setDob(currentDate.toISOString());
            }
        } else {
            toggleDatePicker();
        }
    };

    const confirmIOSDate = (selectedDate: Date) => {
        selectedDate = date;
        if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
            console.error('Invalid date provided:', selectedDate);
            return;
        }

        const currentDate = new Date(selectedDate);
        currentDate.setHours(0, 0, 0, 0);

        const isoString = currentDate.toISOString();

        setDob(isoString);
        toggleDatePicker();
    };

    const confirmDobUpdate = async () => {
        try {
            setLoading(true);

            const updatedFields = {
                dob: dob,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
            } else {
                console.error('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setDobModalVisible(false);
            const currentUser = useAuthStore.getState().user;

            if (currentUser) {
                currentUser.dateOfBirth = dob;
                useAuthStore.setState({user: currentUser});
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = () => {
        if (password.length >= 8) {
            if (password === confirmPassword) {
                setPasswordError(false);
                setPasswordModalVisible(false);
                setShowUpdatePasswordConfirmation(true);
            } else {
                setPasswordError(true);
            }
        } else {
            setShowPasswordFormatError(true);
        }
    };

    const confirmPasswordUpdate = async () => {
        try {
            setLoading(true);

            const updatedFields = {
                password: password,
            };

            const updatedUser = await updateUser(updatedFields);

            if (updatedUser) {
            } else {
                console.error('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
            setShowUpdatePasswordConfirmation(false);
            setPasswordModalVisible(false);

            const currentUser = useAuthStore.getState().user;

            if (currentUser) {
                currentUser.password = password;
                useAuthStore.setState({user: currentUser});
            }
        }
    };

    const {logout} = useAuthStore();
    const [busy, setBusy] = useState(false);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

    const onDelete = async () => {
        if (busy) return;
        try {
            setBusy(true);
            const res = await deleteMyAccount();
            setConfirmationModalVisible(false);
            // Regardless of PENDING/DELETED, app should sign out locally.
            await logout?.()
            Alert.alert('Account deleted', `Status: ${res.status}`);
        } catch (e: any) {
            Alert.alert('Delete failed', e.message ?? 'Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.screenRoot}>
            <ScrollView stickyHeaderIndices={[0]} style={styles.backbutton}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>
                <View style={styles.container}>
                    <View>
                        <BackButton navigation={navigation} />
                    </View>
                    <Text style={styles.title}>ACCOUNT SETTINGS</Text>
                    <Text style={styles.privacyNote}>
                        ( This information will not be shared publicly )
                    </Text>

                    <View style={styles.profileCard}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputlabel}>First name</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity style={styles.fieldPressArea} onPress={handleFirstNameModalOpen}>
                                    <TextInput
                                        placeholder={user?.firstName}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => setFirstNameModified(text)}
                                        value={firstName || ''}
                                        editable={false}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Pressable style={styles.fieldPressArea} onPress={handleFirstNameModalOpen}>
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
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={firstNameModalVisible}>
                        <SafeAreaView style={styles.editModalRoot}>
                            <View style={styles.editModalCard}>
                                <Text style={styles.editModalTitle}>Change First Name</Text>
                                <Text style={styles.inputlabel}>First name</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={user?.firstName}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => setFirstName(text)}
                                        value={firstName}
                                        editable={true}
                                    />
                                </View>
                                <View style={styles.editModalActions}>
                                    <Pressable
                                        style={styles.editModalCancelBtn}
                                        onPress={() => setFirstNameModalVisible(false)}>
                                        <Text style={styles.editModalBtnText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={styles.editModalUpdateBtn} onPress={handleChangeFirstName}>
                                        <Text style={styles.editModalBtnText}>Update</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showUpdateFirstNameConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_50,
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
                                {Platform.OS === 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <TouchableOpacity
                                            onPress={() => setShowUpdateFirstNameConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmFirstNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <Pressable
                                            onPress={() => setShowUpdateFirstNameConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmFirstNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputlabel}>Last name</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity style={styles.fieldPressArea} onPress={handleLastNameModalOpen}>
                                    <TextInput
                                        placeholder={user?.lastName}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => setLastNameModified(text)}
                                        value={lastName || ''}
                                        editable={false}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Pressable style={styles.fieldPressArea} onPress={handleLastNameModalOpen}>
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
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={lastNameModalVisible}>
                        <SafeAreaView style={styles.editModalRoot}>
                            <View style={styles.editModalCard}>
                                <Text style={styles.editModalTitle}>Change Last Name</Text>
                                <Text style={styles.inputlabel}>Last name</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={user?.lastName}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => setLastName(text)}
                                        value={lastName}
                                        editable={true}
                                    />
                                </View>
                                <View style={styles.editModalActions}>
                                    <Pressable
                                        style={styles.editModalCancelBtn}
                                        onPress={() => setLastNameModalVisible(false)}>
                                        <Text style={styles.editModalBtnText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={styles.editModalUpdateBtn} onPress={handleChangeLastName}>
                                        <Text style={styles.editModalBtnText}>Update</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showUpdateLastNameConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_50,
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
                                {Platform.OS === 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <TouchableOpacity
                                            onPress={() => setShowUpdateLastNameConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmLastNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <Pressable
                                            onPress={() => setShowUpdateLastNameConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmLastNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputlabel}>Phone number</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity style={styles.fieldPressArea} onPress={handlePhoneModalOpen}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{color: COLORS.DARKGREY}}>+1</Text>
                                        <TextInput
                                            placeholder={user?.phoneNumber}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            onChangeText={text => {
                                                const numericText = text.replace(/[^0-9]/g, '');
                                                setPhoneModified(numericText);
                                            }}
                                            value={phone || ''}
                                            editable={false}
                                        />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <Pressable style={styles.fieldPressArea} onPress={handlePhoneModalOpen}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{color: COLORS.DARKGREY}}>+1</Text>
                                        <TextInput
                                            placeholder={user?.phoneNumber}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            onChangeText={text => {
                                                const numericText = text.replace(/[^0-9]/g, '');
                                                setPhoneModified(numericText);
                                            }}
                                            value={phone || ''}
                                            editable={false}
                                        />
                                    </View>
                                </Pressable>
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={phoneModalVisible}>
                        <SafeAreaView style={styles.editModalRoot}>
                            <View style={styles.editModalCard}>
                                <Text style={styles.editModalTitle}>Change Phone Number</Text>
                                <Text style={styles.inputlabel}>Phone number</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={user?.phoneNumber}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            const limitedText = numericText.substring(0, 10);
                                            setPhone(limitedText);
                                        }}
                                        value={phone}
                                        keyboardType="phone-pad"
                                        editable={true}
                                    />
                                </View>
                                <View style={styles.editModalActions}>
                                    <Pressable
                                        style={styles.editModalCancelBtn}
                                        onPress={() => setPhoneModalVisible(false)}>
                                        <Text style={styles.editModalBtnText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={styles.editModalUpdateBtn} onPress={handleChangePhone}>
                                        <Text style={styles.editModalBtnText}>Update</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showUpdatePhoneConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_50,
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
                                {Platform.OS === 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <TouchableOpacity
                                            onPress={() => setShowUpdatePhoneConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmPhoneUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <Pressable
                                            onPress={() => setShowUpdatePhoneConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmPhoneUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>
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
                                <TouchableOpacity onPress={confirmDobUpdate}>
                                    <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setDobModalVisible(false)}>
                                    <Icon name="close-circle" type="ionicon" size={25} color={COLORS.DARKAKCRUBLUE} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputlabel}>Change Date of Birth</Text>
                            <View style={styles.input}>
                                {showPicker && (
                                    <DateTimePicker
                                        display="spinner"
                                        mode="date"
                                        value={date}
                                        onChange={onChange}
                                        style={Platform.OS == 'ios' ? styles.datepickios : styles.datepicker}
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
                                    <TouchableOpacity onPress={toggleDatePicker}>
                                        <TextInput
                                            placeholder={user?.dateOfBirth || 'Select Date of Birth'}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={(text: string) => {
                                                setDob(text);
                                            }}
                                            value={dob ? formatDateToDayMonthYear(new Date(dob)) : ''}
                                            editable={true}
                                            onPressIn={toggleDatePicker}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </SafeAreaView>
                    </Modal>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputlabel}>Change Password</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity style={styles.fieldPressArea} onPress={handlePasswordModalOpen}>
                                    <TextInput
                                        placeholder={'**********'}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={true}
                                        onChangeText={text => setPasswordModified(text)}
                                        value={password || ''}
                                        editable={false}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Pressable style={styles.fieldPressArea} onPress={handlePasswordModalOpen}>
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
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={passwordModalVisible}>
                        <SafeAreaView style={styles.editModalRoot}>
                            <View style={styles.editModalCard}>
                                <Text style={styles.editModalTitle}>Change Password</Text>
                                <Text style={styles.inputlabel}>
                                    New Password <Text style={{color: COLORS.MIDORANGE}}>(Min 8 characters)</Text>
                                </Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={user?.password}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.passwordTextInput}
                                        secureTextEntry={!showPassword}
                                        onChangeText={text => setPassword(text)}
                                        value={password}
                                        editable={true}
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(prev => !prev)}>
                                        <Icon
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            type="ionicon"
                                            size={20}
                                            color={COLORS.AKCRUBLUE}
                                        />
                                    </Pressable>
                                </View>
                                <Text style={styles.inputlabel}>Confirm New Password</Text>
                                <View style={styles.input}>
                                    <TextInput
                                        placeholder={user?.password}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.passwordTextInput}
                                        secureTextEntry={!showConfirmPassword}
                                        onChangeText={text => {
                                            setConfirmPassword(text);

                                            if (password === text) {
                                                setPasswordError(false);
                                            } else {
                                                setPasswordError(true);
                                            }
                                        }}
                                        value={confirmPassword}
                                        editable={true}
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPassword(prev => !prev)}>
                                        <Icon
                                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                            type="ionicon"
                                            size={20}
                                            color={COLORS.AKCRUBLUE}
                                        />
                                    </Pressable>
                                    {passwordError && <Text style={styles.warningText}>Passwords do not match.</Text>}
                                </View>
                                <View style={styles.editModalActions}>
                                    <Pressable
                                        style={styles.editModalCancelBtn}
                                        onPress={() => setPasswordModalVisible(false)}>
                                        <Text style={styles.editModalBtnText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={styles.editModalUpdateBtn} onPress={handleChangePassword}>
                                        <Text style={styles.editModalBtnText}>Update</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showUpdatePasswordConfirmation}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_50,
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
                                {Platform.OS === 'ios' ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <TouchableOpacity
                                            onPress={() => setShowUpdatePasswordConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmPasswordUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <Pressable
                                            onPress={() => setShowUpdatePasswordConfirmation(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmPasswordUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType="fade" transparent={true} visible={showPasswordFormatError}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: COLORS.OVERLAY_BLACK_50,
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
                                    {Platform.OS === 'ios' ? (
                                        <TouchableOpacity
                                            onPress={() => setShowPasswordFormatError(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                                alignSelf: 'center',
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Close</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Pressable
                                            onPress={() => setShowPasswordFormatError(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                                alignSelf: 'center',
                                            }}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Close</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        </View>
                    </Modal>
                    </View>
                    <View style={styles.sectionDivider} />
                    <View style={styles.dangerCard}>
                        <Text style={styles.dangerTitle}>Delete Account</Text>
                        <Text style={styles.dangerText}>
                            Permanently removes your account and can not be recovered.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setConfirmationModalVisible(true)}
                            disabled={busy}
                            style={[
                                styles.dangerButton,
                                {backgroundColor: busy ? COLORS.DARKGREY : COLORS.CATREDLGT},
                            ]}>
                            {busy ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={styles.dangerButtonText}>Delete my account</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal
                    visible={confirmationModalVisible}
                    transparent
                    statusBarTranslucent
                    presentationStyle="overFullScreen"
                    animationType="fade"
                    onRequestClose={() => setConfirmationModalVisible(false)}>
                    <ConfirmationModal
                        onPressYes={onDelete}
                        onPressNo={() => setConfirmationModalVisible(false)}
                        variant="continueWatching"
                        yesLabel={busy ? 'Deleting...' : 'Delete'}
                        noLabel="Cancel"
                        confirmationText={
                            'Confirm Account Deletion?\n\nThis will delete your account. Are you sure you want to proceed?'
                        }
                    />
                </Modal>
            </ScrollView>
        </View>
    );
};

export default AccountSettings;
