import {View, Text, ImageBackground, Modal, KeyboardAvoidingView, Alert} from 'react-native';
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
import {updateUser} from '../../../lib/api/user.lib';
import ProgressBar from '../../../components/ProgressBar';

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
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
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
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>Enter your first and last name.</Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <Inputs
                                placeholdername={'First Name'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleFirstNameChange}
                                value={firstName}
                                editable={!loading}
                            />
                            <Inputs
                                placeholdername={'Last Name'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleLastNameChange}
                                value={lastName}
                                editable={!loading}
                            />
                            {nameError && <Text style={styles.warningText}>Please input first and last name</Text>}
                            <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.PINK}}>
                                We will not display your last name publicly.
                            </Text>
                        </View>
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={() => UserNameSet()}
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
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardName;
