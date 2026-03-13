import {View, Text, ImageBackground, Modal, KeyboardAvoidingView, Alert, TouchableOpacity, StyleSheet, Platform, Keyboard, ActivityIndicator} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Icon} from '@rneui/base';
import React, {useState, useEffect} from 'react';
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
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {updateUser} from '../../../lib/api/user.lib';
import ProgressBar from '../../../components/ProgressBar';
import { isTablet } from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 11;
const CURRENT_STEP = 9;

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
                            <Text style={AUTH_TEXT_THEME.instruction}>Enter your first and last name.</Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
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
                                    containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                />
                            </View>
                            <View style={AUTH_TEXT_FIELD_THEME.getBlurWrapperStyle()}>
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
                                    containerStyle={AUTH_TEXT_FIELD_THEME.getInnerRowStyle()}
                                />
                            </View>
                            {nameError && <Text style={AUTH_TEXT_THEME.error}>Please input first and last name</Text>}
                            <Text style={AUTH_TEXT_THEME.highlight}>
                                We will not display your last name publicly.
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
                                    UserNameSet();
                                }}
                                    disabled={!isFormComplete}
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
                        <Modal animationType="fade" transparent={true} visible={loading}>
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
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardName;
