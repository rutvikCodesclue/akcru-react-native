import {
    View,
    Text,
    ImageBackground,
    Modal,
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
    Platform,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import LinearGradient from 'react-native-linear-gradient';
import {searchForUsers, updateUser} from '../../../lib/api/user.lib';
import ProgressBar from '../../../components/ProgressBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import {isTablet} from '../../../../assets/constants/theme';

const TOTAL_STEPS = 7; // username+name+DOB on one screen, remove old DOB + Name steps
const CURRENT_STEP = 4;

const OnboardUsername = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const phoneNumber = route.params?.phoneNumber;
    const user = useAuthStore(state => state.user);

    // Name + username
    const [firstName, setFirstName] = useState<string>(user?.firstName || '');
    const [lastName, setLastName] = useState<string>(user?.lastName || '');
    const [userName, setUserName] = useState<string>(user?.username || '');

    // DOB
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date>(user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date());
    const [dob, setDob] = useState<string | undefined>(user?.dateOfBirth);

    const [loading, setLoading] = useState<boolean>(false);
    const [userNameError, setUserNameError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [dobError, setDobError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const isUserNameValid = (value: string) => value.length > 2;
    const isFirstNameValid = (value: string) => value.trim().length > 0;
    const isLastNameValid = (value: string) => value.trim().length > 0;

    const formatDateToDayMonthYear = (dateVal: Date) => {
        const day = dateVal.getDate();
        const month = dateVal.toLocaleString('default', {month: 'long'});
        const year = dateVal.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const toggleDatePicker = () => {
        setShowPicker(prev => !prev);
    };

    const onChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            // Android fires with type: 'set' or 'dismissed'
            if (event.type === 'set' && selectedDate) {
                const currentDate = new Date(selectedDate);
                currentDate.setHours(0, 0, 0, 0);

                setDate(currentDate);
                setDob(currentDate.toISOString()); // commit once
                setDobError(false);
                setShowPicker(false); // close picker
            } else {
                setShowPicker(false); // dismissed
            }
        } else {
            // iOS: just update the temp date; commit on Confirm button
            if (selectedDate) {
                const currentDate = new Date(selectedDate);
                currentDate.setHours(0, 0, 0, 0);
                setDate(currentDate);
            }
        }
    };

    const confirmIOSDate = () => {
        const selectedDate = date;
        if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
            console.error('Invalid date provided:', selectedDate);
            return;
        }
        const currentDate = new Date(selectedDate);
        currentDate.setHours(0, 0, 0, 0);
        setDob(currentDate.toISOString()); // commit once
        setDobError(false);
        setShowPicker(false); // close picker
    };

    const isAtLeast17 = (dobIsoString: string) => {
        const birthDate = new Date(dobIsoString);
        const today = new Date();

        const minAllowedDob = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

        return birthDate <= minAllowedDob;
    };


    const handleUserNameChange = (text: string) => {
        const formattedText = text
            .toLowerCase()
            .replace(/\s/g, '')
            .replace(/[^a-z0-9._]/g, '');
        setUserName(formattedText);
        setUserNameError(!isUserNameValid(formattedText));
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
        setNameError(!(isFirstNameValid(text) && isLastNameValid(lastName)));
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
        setNameError(!(isFirstNameValid(firstName) && isLastNameValid(text)));
    };

    const checkFormCompletion = () => {
        if (
            userName &&
            isUserNameValid(userName) &&
            isFirstNameValid(firstName) &&
            isLastNameValid(lastName) &&
            dob &&
            isAtLeast17(dob) // <-- THIS prevents the button from enabling
        ) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [userName, firstName, lastName, dob]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const checkUsernameExists = async (username: string) => {
        try {
            const lowercaseUsername = username.toLowerCase();
            const currentUserUsername = useAuthStore.getState().user?.username?.toLowerCase();

            const response = await searchForUsers(lowercaseUsername);

            const filteredResponse = response.filter(u => u.username.toLowerCase() !== currentUserUsername);

            const usernameExists = filteredResponse.some(u => u.username.toLowerCase() === lowercaseUsername);

            return usernameExists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    };

    const handleNext = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const lowercaseUserName = userName.toLowerCase();

            // Validate name
            if (!isFirstNameValid(firstName) || !isLastNameValid(lastName)) {
                setNameError(true);
                Alert.alert('Invalid Name', 'Please enter a valid first and last name.');
                return;
            }

            // Validate DOB
            if (!dob) {
                setDobError(true);
                Alert.alert('Date of Birth', 'Please select your date of birth.');
                return;
            }

            if (!isAtLeast17(dob)) {
                setDobError(true);
                Alert.alert('Age Requirement', 'You must be at least 17 years old to use this app.');
                return;
            }

            // Username validations
            const usernameExists = await checkUsernameExists(lowercaseUserName);

            if (usernameExists) {
                Alert.alert('Username is already taken', 'Please choose a different username.');
                return;
            } else if (lowercaseUserName.includes(' ')) {
                Alert.alert('Username contains spaces', 'Please remove spaces from your username.');
                return;
            } else if (!isUserNameValid(userName)) {
                setUserNameError(true);
                Alert.alert('Username must be at least 3 characters', 'Please choose a different username.');
                return;
            }

            const updatedUser = await updateUser({
                username: userName,
                phone: phoneNumber,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dob: dob, // keep key name consistent with your existing DOB screen
            });

            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;

                if (currentUser) {
                    currentUser.username = userName;
                    currentUser.phoneNumber = phoneNumber;
                    currentUser.firstName = firstName.trim();
                    currentUser.lastName = lastName.trim();
                    // store original dateOfBirth field if backend returns it, otherwise fall back to dob
                    currentUser.dateOfBirth = updatedUser.dateOfBirth || dob;
                    useAuthStore.setState({user: currentUser});
                } else {
                    useAuthStore.setState({user: updatedUser});
                }

                navigation.navigate('OnboardGender');
            } else {
                console.error('Failed to update profile.', updatedUser);
                Alert.alert('Update Failed', 'There was an issue saving your details.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'An error occurred while updating your profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <LinearGradient
                    colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: SIZES.ScreenHeight,
                    }}
                />
                <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            <View style={{width: '90%'}}>
                                <Text style={{...FONTS.Title2}}>
                                    {CURRENT_STEP}/{TOTAL_STEPS}
                                </Text>
                                <ProgressBar
                                    currentStep={CURRENT_STEP}
                                    totalSteps={TOTAL_STEPS}
                                    style={styles.progress}
                                />
                            </View>
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Tell us your name, username, and date of birth.
                            </Text>
                        </View>

                        <View style={{alignItems: 'center', marginTop: 10}}>
                            {/* First Name */}
                            <Inputs
                                placeholdername={'First Name'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleFirstNameChange}
                                value={firstName}
                                editable={!loading}
                            />

                            {/* Last Name */}
                            <Inputs
                                placeholdername={'Last Name'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleLastNameChange}
                                value={lastName}
                                editable={!loading}
                            />
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    textAlign: 'center',
                                    color: COLORS.PINK,
                                    marginTop: 5,
                                }}>
                                We will not display your last name publicly.
                            </Text>

                            {/* Username */}
                            <Inputs
                                placeholdername={'Choose Username'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleUserNameChange}
                                value={userName}
                                editable={!loading}
                            />
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    textAlign: 'center',
                                    color: COLORS.PINK,
                                }}>
                                Username must be unique and at least 3 characters long.
                            </Text>

                            {/* DOB */}
                            {showPicker && Platform.OS === 'android' && (
                                <DateTimePicker
                                    display="spinner"
                                    mode="date"
                                    value={date}
                                    onChange={onChange}
                                    style={styles.datepicker}
                                />
                            )}

                            {showPicker && Platform.OS === 'ios' && (
                                <View>
                                    <DateTimePicker
                                        display="spinner"
                                        mode="date"
                                        value={date}
                                        onChange={onChange}
                                        textColor="white"
                                    />
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
                                </View>
                            )}

                            {!showPicker && (
                                <TouchableOpacity onPress={toggleDatePicker} activeOpacity={0.8}>
                                    <Inputs
                                        placeholdername={'DOB'}
                                        iconname={'calendar'}
                                        iconcolor={COLORS.LIGHTGREY}
                                        secureTextEntry={false}
                                        // do NOT let user type in DOB; picker only
                                        onChangeText={() => {}}
                                        value={dob ? formatDateToDayMonthYear(new Date(dob)) : 'Select date'}
                                        editable={false}
                                    />
                                </TouchableOpacity>
                            )}

                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    textAlign: 'center',
                                    color: COLORS.PINK,
                                }}>
                                You must be at least 17 years old to use this app.
                            </Text>

                            {(nameError || userNameError || dobError) && (
                                <Text style={styles.warningText}>
                                    Please enter first name, last name, a valid username, and your date of birth.
                                </Text>
                            )}
                        </View>

                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={handleNext}
                                    disabled={!isFormComplete || loading}
                                />
                            </View>
                            {loading && (
                                <ActivityIndicator size="large" color={COLORS.PURPLE} style={{marginTop: 10}} />
                            )}
                        </View>

                        <Modal animationType="fade" transparent={true} visible={showEmailModal}>
                            <ResetPasswordResultModal
                                closeModal={() => setShowEmailModal(false)}
                                messageheader={resetResultType.messageheader}
                                messageheadercolor={resetResultType.messageheadercolor}
                                message={resetResultType.message}
                                iconname={resetResultType.iconname}
                                iconcolor={resetResultType.iconcolor}
                            />
                        </Modal>
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardUsername;
