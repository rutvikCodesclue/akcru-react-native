import {View, Text, ImageBackground, Modal, Alert, TouchableOpacity, StyleSheet, Platform, Keyboard, ScrollView, KeyboardAvoidingView} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Icon} from '@rneui/base';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
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
import {updateUser} from '../../../lib/api/user.lib';
import StepperDots from '../../../components/StepperDots';
import { isTablet } from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 6;

const OnboardName = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [nameError, setNameError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const isFirstNameValid = (firstName: string) => {
        return firstName.length > 0;
    };

    const isLastNameValid = (lastName: string) => {
        return lastName.length > 0;
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
        setNameError(!isFirstNameValid(text));
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
        setNameError(!isLastNameValid(text));
    };

    const checkFormCompletion = () => {
        if (firstName && lastName && isLastNameValid(lastName) && isFirstNameValid(firstName)) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [firstName, lastName]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const UserNameSet = async () => {
        if (!isFirstNameValid(firstName) || !isLastNameValid(lastName)) {
            setNameError(true);
            Alert.alert('Invalid Input', 'Please input valid first and last names.');
            return;
        }

        try {
            setLoading(true);
            const updatedUser = await updateUser({
                firstName: firstName,
                lastName: lastName,
            });

            if (updatedUser) {
                useAuthStore.setState({user: updatedUser});
                navigation.navigate('OnboardProfilePicture');
            } else {
                Alert.alert('Update Failed', 'Failed to update name.');
            }
        } catch (error) {
            console.error('Error updating name:', error);
            Alert.alert('Error', 'An error occurred while updating your name.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
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
                <ScrollView contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 24,
                }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={{width: '90%', alignItems: 'center'}}>
                        <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>Enter your first and last name.</Text>
                    <View style={{alignItems: 'center', marginTop: 10}}>
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
                            {nameError && <Text style={styles.errorText}>Please input first and last name</Text>}
                            <Text style={[AUTH_TEXT_THEME.highlight, {marginTop: 12}]}>
                                We will not display your last name publicly.
                            </Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruButtons.LrgButton
                                variant="auth"
                                color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                btnname={'Next'}
                                onPress={() => {
                                Keyboard.dismiss();
                                UserNameSet();
                            }}
                                disabled={!isFormComplete}
                                loading={loading}
                            />
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

export default OnboardName;
