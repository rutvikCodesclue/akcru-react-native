import {
    View,
    Text,
    ImageBackground,
    Modal,
    Alert,
    Platform,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
import {Icon} from '@rneui/base';
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
import {searchForUsers, updateUser} from '../../../lib/api/user.lib';
import StepperDots from '../../../components/StepperDots';
import DateTimePicker from '@react-native-community/datetimepicker';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 3;

const OnboardUsername = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const phoneNumber = route.params?.phoneNumber;
    const user = useAuthStore(state => state.user);

    // Name + username
    const [firstName, setFirstName] = useState<string>(user?.firstName || '');
    const [lastName, setLastName] = useState<string>(user?.lastName || '');
    const [userName, setUserName] = useState<string>('');

    // DOB - default picker to 18 years ago when no existing date
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date>(() => {
        if (user?.dateOfBirth) return new Date(user.dateOfBirth);
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d;
    });
    const [dob, setDob] = useState<string | undefined>(user?.dateOfBirth);

    const [loading, setLoading] = useState<boolean>(false);
    // store error messages (empty string = no error)
    const [userNameError, setUserNameError] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');
    const [dobError, setDobError] = useState<string>('');
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
                setDobError('');
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
        setDobError('');
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
        if (!isUserNameValid(formattedText)) {
            setUserNameError('Username must be at least 3 characters');
        } else {
            setUserNameError('');
        }
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
        setNameError(isFirstNameValid(text) && isLastNameValid(lastName) ? '' : 'Please enter both first and last name.');
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
        setNameError(isFirstNameValid(firstName) && isLastNameValid(text) ? '' : 'Please enter both first and last name.');
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

            if (!isFirstNameValid(firstName) || !isLastNameValid(lastName)) {
                setNameError('Please enter a valid first and last name.');
                setUserNameError('');
                setDobError('');
                Alert.alert('Invalid Name', 'Please enter a valid first and last name.');
                return;
            }

            if (!dob) {
                setDobError('Please select your date of birth.');
                setUserNameError('');
                setNameError('');
                Alert.alert('Date of Birth', 'Please select your date of birth.');
                return;
            }

            if (!isAtLeast17(dob)) {
                setDobError('You must be at least 17 years old to use this app.');
                setUserNameError('');
                setNameError('');
                Alert.alert('Age Requirement', 'You must be at least 17 years old to use this app.');
                return;
            }

            const usernameExists = await checkUsernameExists(lowercaseUserName);

            if (usernameExists) {
                setUserNameError('Username is already taken. Please choose a different username.');
                setNameError('');
                setDobError('');
                return;
            } else if (lowercaseUserName.includes(' ')) {
                setUserNameError('Username contains spaces. Please remove spaces from your username.');
                setNameError('');
                setDobError('');
                return;
            } else if (!isUserNameValid(userName)) {
                setUserNameError('Username must be at least 3 characters. Please choose a different username.');
                setNameError('');
                setDobError('');
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
        <View style={{flex: 1}}>
            <ImageBackground style={[styles.bgimage, {flex: 1}]} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <LinearGradient
                    colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
                {/* Fixed Header Section */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                        </TouchableOpacity>
                        <Text style={styles.stepIndicator}>
                            {CURRENT_STEP}/{TOTAL_STEPS}
                        </Text>
                    </View>
                    <View style={styles.logoCenter}>
                        <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                    </View>
                    <View style={[styles.backButton, {opacity: 0}]}>
                        <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                    </View>
                </View>
                <View style={{alignItems: 'center', marginBottom: 16}}>
                    <StepperDots
                        currentStep={CURRENT_STEP}
                        totalSteps={TOTAL_STEPS}
                    />
                </View>

                {/* Centered Content Section */}
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 24,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={{width: '90%', alignItems: 'center'}}>
                        <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>
                            Tell us your name, username, and date of birth.
                        </Text>
                    <View style={{alignItems: 'center', marginTop: 10}}>
                                {/* First Name */}
                                <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <Inputs
                                        placeholdername={'First Name'}
                                        iconname={'person'}
                                        iconcolor={COLORS.LIGHTGREY}
                                        secureTextEntry={false}
                                        onChangeText={handleFirstNameChange}
                                        value={firstName}
                                        editable={!loading}
                                        containerStyle={styles.inputRow}
                                    />
                                </View>

                                {/* Last Name */}
                                <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <Inputs
                                        placeholdername={'Last Name'}
                                        iconname={'person'}
                                        iconcolor={COLORS.LIGHTGREY}
                                        secureTextEntry={false}
                                        onChangeText={handleLastNameChange}
                                        value={lastName}
                                        editable={!loading}
                                        containerStyle={styles.inputRow}
                                    />
                                </View>
                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        textAlign: 'center',
                                        color: COLORS.OVERLAY_WHITE_65,
                                        marginTop: 5,
                                        marginBottom: 8,
                                    }}>
                                    We will not display your last name publicly.
                                </Text>

                                {/* Username */}
                                <View style={styles.blurInputWrapper}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <Inputs
                                        placeholdername={'Choose Username'}
                                        iconname={'person'}
                                        iconcolor={COLORS.LIGHTGREY}
                                        secureTextEntry={false}
                                        onChangeText={handleUserNameChange}
                                        value={userName}
                                        editable={!loading}
                                        containerStyle={styles.inputRow}
                                    />
                                </View>
                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        textAlign: 'center',
                                        color: COLORS.OVERLAY_WHITE_65,
                                        marginBottom: 8,
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
                                            textColor={COLORS.WHITE}
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
                                        <View style={styles.blurInputWrapper}>
                                            <BlurView
                                                style={StyleSheet.absoluteFill}
                                                blurType="light"
                                                blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                                reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                            />
                                            <Inputs
                                                placeholdername={'DOB'}
                                                iconname={'calendar'}
                                                iconcolor={COLORS.LIGHTGREY}
                                                secureTextEntry={false}
                                                onChangeText={() => {}}
                                                value={dob ? formatDateToDayMonthYear(new Date(dob)) : 'Select date'}
                                                editable={false}
                                                containerStyle={styles.inputRow}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                )}

                                <Text
                                    style={{
                                        ...FONTS.paragraph2,
                                        textAlign: 'center',
                                        color: COLORS.OVERLAY_WHITE_65,
                                        marginTop: 5,
                                    }}>
                                    You must be at least 17 years old to use this app.
                                </Text>

                                {nameError !== '' && (
                                    <Text style={styles.errorText}>{nameError}</Text>
                                )}
                                {userNameError !== '' && (
                                    <Text style={styles.errorText}>{userNameError}</Text>
                                )}
                                {dobError !== '' && (
                                    <Text style={styles.errorText}>{dobError}</Text>
                                )}

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={() => {
                                    Keyboard.dismiss();
                                    handleNext();
                                }}
                                    disabled={!isFormComplete || loading}
                                    loading={loading}
                                />
                            </View>
                        </View>
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
                    <Text style={{...FONTS.paragraph2, color: COLORS.OVERLAY_WHITE_55, textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardUsername;
