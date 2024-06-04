import {View, Text, TextInput, Modal, SafeAreaView, Alert, Platform, Pressable} from 'react-native';
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
            console.log('firstname', firstName);

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

    return (
        <View>
            <ScrollView stickyHeaderIndices={[0]} style={styles.backbutton}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>
                <View style={styles.container}>
                    <View>
                        <BackButton navigation={navigation} />
                    </View>
                    <Text style={styles.title}>ACCOUNT SETTINGS</Text>
                    <Text style={{...FONTS.paragraph1, marginBottom: 10, color: COLORS.PINK}}>
                        ( This information will not be shared publicly )
                    </Text>

                    <View>
                        <Text style={styles.inputlabel}>First name</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity onPress={handleFirstNameModalOpen}>
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
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={firstNameModalVisible}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            {Platform.OS === 'ios' ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 20,
                                    }}>
                                    <TouchableOpacity onPress={handleChangeFirstName}>
                                        <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setFirstNameModalVisible(false)}>
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
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
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </Pressable>
                                </View>
                            )}

                            <Text style={styles.inputlabel}>Change Firstname</Text>
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
                        </SafeAreaView>
                    </Modal>

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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmFirstNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmFirstNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>

                    <View>
                        <Text style={styles.inputlabel}>Last name</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity onPress={handleLastNameModalOpen}>
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
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={lastNameModalVisible}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            {Platform.OS === 'ios' ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 20,
                                    }}>
                                    <TouchableOpacity onPress={handleChangeLastName}>
                                        <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setLastNameModalVisible(false)}>
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
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
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </Pressable>
                                </View>
                            )}

                            <Text style={styles.inputlabel}>Change Lastname</Text>
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
                        </SafeAreaView>
                    </Modal>

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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmLastNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmLastNameUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>

                    {/* <View>
                        <Text style={styles.inputlabel}>Phone number</Text>
                        <View style={styles.input}>
                            <TouchableOpacity onPress={handlePhoneModalOpen}>
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
                            </TouchableOpacity>
                        </View>
                    </View> */}
                    <View>
                        <Text style={styles.inputlabel}>Phone number</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity onPress={handlePhoneModalOpen}>
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
                                <Pressable onPress={handlePhoneModalOpen}>
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
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            {Platform.OS === 'ios' ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 20,
                                    }}>
                                    <TouchableOpacity onPress={handleChangePhone}>
                                        <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPhoneModalVisible(false)}>
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
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
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </Pressable>
                                </View>
                            )}
                            <Text style={styles.inputlabel}>Change Phonenumber</Text>
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
                        </SafeAreaView>
                    </Modal>

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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmPhoneUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmPhoneUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>

                    {/* <View>
                        <Text style={styles.inputlabel}>DOB</Text>
                        <View style={styles.input}>
                            <TouchableOpacity onPress={handleDobModalOpen}>
                                <TextInput
                                    placeholder={user?.dateOfBirth || 'Select Date of Birth'}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    onChangeText={text => setDobModified(text)}
                                    value={dob ? formatDateToDayMonthYear(new Date(dob)) : ''}
                                    editable={false}
                                />
                            </TouchableOpacity>
                        </View>
                    </View> */}

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

                    <View>
                        <Text style={styles.inputlabel}>Change Password</Text>
                        <View style={styles.input}>
                            {Platform.OS === 'ios' ? (
                                <TouchableOpacity onPress={handlePasswordModalOpen}>
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
                            )}
                        </View>
                    </View>

                    <Modal animationType="fade" transparent={false} visible={passwordModalVisible}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.AKCRUBACKGROUND,
                                paddingHorizontal: SIZES.ScreenWidth * 0.03,
                                paddingTop: 20,
                            }}>
                            {Platform.OS === 'ios' ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 20,
                                    }}>
                                    <TouchableOpacity onPress={handleChangePassword}>
                                        <Icon name="checkmark-circle" type="ionicon" size={25} color={COLORS.PURPLE} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
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
                                        <Icon
                                            name="close-circle"
                                            type="ionicon"
                                            size={25}
                                            color={COLORS.DARKAKCRUBLUE}
                                        />
                                    </Pressable>
                                </View>
                            )}

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
                                    value={password}
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
                                {passwordError && <Text style={styles.warningText}>Passwords do not match.</Text>}
                            </View>
                        </SafeAreaView>
                    </Modal>

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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={confirmPasswordUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
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
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={confirmPasswordUpdate}
                                            style={{
                                                backgroundColor: COLORS.PURPLE,
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Update</Text>
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
                                    {Platform.OS === 'ios' ? (
                                        <TouchableOpacity
                                            onPress={() => setShowPasswordFormatError(false)}
                                            style={{
                                                backgroundColor: COLORS.DARKAKCRUBLUE,
                                                padding: 10,
                                                borderRadius: 5,
                                                alignSelf: 'center',
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Close</Text>
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
                                            <Text style={{...FONTS.Title3}}>Close</Text>
                                        </Pressable>
                                    )}
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
                            <TouchableOpacity onPress={() => setPrivacySetting('Public')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>Public</Text>
                                    {privacySetting === 'Public' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setPrivacySetting('Followers')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>Only Followers</Text>
                                    {privacySetting === 'Followers' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </TouchableOpacity>
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
                            <TouchableOpacity onPress={() => setWatchStatus('Yes')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>Yes</Text>
                                    {watchStatus === 'Yes' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setWatchStatus('No')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...FONTS.paragraph1, paddingRight: 10}}>No</Text>
                                    {watchStatus === 'No' && (
                                        <Icon name="checkmark-circle" type="ionicon" size={20} color={COLORS.GREEN} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View> */}
                    {/* <View style={{alignItems: 'center', marginTop: 20}}>
                        <AkcruButtons.LrgButton
                            btnname={'Update'}
                            disabled={false}
                            color={COLORS.AKCRUBLUE}
                            onPress={handleUpdateProfile}
                        />
                    </View> */}

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
                                        onPress={() => setShowUpdateConfirmation(false)}
                                        style={{
                                            backgroundColor: 'red',
                                            padding: 10,
                                            borderRadius: 5,
                                        }}>
                                        <Text style={{...FONTS.Title3}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={confirmUpdate}
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
