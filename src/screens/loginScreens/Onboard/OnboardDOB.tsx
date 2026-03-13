import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    Modal,
    KeyboardAvoidingView,
    Alert,
    Platform,
    StyleSheet,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME, AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import DateTimePicker from '@react-native-community/datetimepicker';
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {updateUser} from '../../../lib/api/user.lib';
import ProgressBar from '../../../components/ProgressBar';
import { isTablet } from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 11;
const CURRENT_STEP = 8;

const OnboardDOB = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const user = useAuthStore(state => state.user);
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date>(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d;
    });
    const [dob, setDob] = useState(user?.dateOfBirth);
    const formatDateToDayMonthYear = (date_val: Date) => {
        const day = date_val.getDate();
        const month = date_val.toLocaleString('default', {month: 'long'});
        const year = date_val.getFullYear();
        return `${month} ${day}, ${year}`;
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

    const [userNameError, setUserNameError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const checkFormCompletion = () => {
        if (dob) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [dob]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [signupErrorMessage, setSignupErrorMessage] = useState('');

    const calculateAge = (dob: Date) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const DOBSet = async () => {
        if (!dob) {
            setUserNameError(true);
            return;
        }

        const age = calculateAge(new Date(dob));
        if (age < 17) {
            Alert.alert('Age Requirement', 'You must be at least 17 years old to use this app.');
            return;
        }

        try {
            setIsLoading(true);
            const updatedUser = await updateUser({dob: dob});
            if (updatedUser) {
                useAuthStore.setState({user: updatedUser});
                navigation.navigate('OnboardName');
            } else {
                Alert.alert('Update Failed', 'Failed to update date of birth.');
            }
        } catch (error) {
            console.error('Error updating DOB:', error);
            Alert.alert('Error', 'An error occurred while updating your date of birth.');
        } finally {
            setIsLoading(false);
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
                        <View style={styles.headerRow}>
                            <View style={styles.headerLeft}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                                </TouchableOpacity>
                                <Text style={AUTH_TEXT_THEME.stepIndicator}>
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
                        <View style={{alignItems: 'center'}}>
                            <View style={{width: '90%'}}>
                                <ProgressBar
                                    currentStep={CURRENT_STEP}
                                    totalSteps={TOTAL_STEPS}
                                    style={styles.progress}
                                />
                            </View>
                            <Text style={AUTH_TEXT_THEME.instruction}>Enter your date of birth.</Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
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
                                <Pressable onPress={toggleDatePicker}>
                                    <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
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
                                            onChangeText={(text: string) => {
                                                setDob(text);
                                            }}
                                            value={dob ? formatDateToDayMonthYear(new Date(dob)) : 'Select date'}
                                            editable={false}
                                            onPress={toggleDatePicker}
                                            containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                        />
                                    </View>
                                </Pressable>
                            )}
                            <Text style={AUTH_TEXT_THEME.highlight}>
                                You must be atleast 17 years old to use this app.
                            </Text>
                        </View>
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={() => {
                                    Keyboard.dismiss();
                                    DOBSet();
                                }}
                                    disabled={!isFormComplete || isLoading}
                                />
                            </View>
                        </View>
                        <Modal animationType="fade" transparent={true} visible={isLoading}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                }}>
                                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                                <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Saving...</Text>
                            </View>
                        </Modal>
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

export default OnboardDOB;
