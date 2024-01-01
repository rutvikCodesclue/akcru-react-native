import {View, Text, ImageBackground, Modal, TouchableOpacity, Alert, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import Svg, {Path} from 'react-native-svg';
import Inputs from '../../../components/input';
import {supabase} from '../../../../lib/supabase';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';

const ResetPassword = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';

    const [loading, setLoading] = useState<boolean>(false);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordLengthError, setPasswordLengthError] = useState(false);
    const [showConfirmNewPasswordModal, setShowConfirmNewPasswordModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    // Extract route parameters
    const route = useRoute();
    const accessToken = route.params?.accessToken; // Retrieve the access token

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setPasswordLengthError(text.length < 8);
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
    };

    const checkPasswordMatch = () => {
        if (password !== confirmPassword) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }
    };

    const checkFormCompletion = () => {
        if (password && confirmPassword) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
        checkPasswordMatch();
    }, [password, confirmPassword]);

    const handleConfirmNewPassword = async () => {
        if (!isFormComplete) {
            Alert.alert('Error', 'Please ensure all fields are correctly filled.');
            return;
        }

        if (!accessToken) {
            console.log('Token', accessToken);
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
                message: 'Error, Invalid or missing token for password reset.',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            Alert.alert('Error', 'Invalid or missing token for password reset.');
            return;
        }

        setLoading(true);
        try {
            // Use the Supabase function designed for password resets
            const {error} = await supabase.auth.updateUser({password: password});

            if (error) {
                console.log('Token', accessToken);
                setResetResultType({
                    messageheader: 'Error',
                    messageheadercolor: COLORS.CATREDDRK,
                    message: 'Failed to update password: ' + error.message,
                    iconname: 'alert-circle',
                    iconcolor: COLORS.CATREDLGT,
                });
                // Alert.alert('Error', 'Failed to update password: ' + error.message);
            } else {
                setResetResultType({
                    messageheader: 'Success',
                    messageheadercolor: COLORS.CATGREENDRK,
                    message: 'Password updated successfully.',
                    iconname: 'happy',
                    iconcolor: COLORS.CATGREENLGT,
                });
                Alert.alert('Success', 'Password updated successfully.');
                navigation.navigate('Signin'); // Redirect to signin page
            }
            console.log(error);
        } catch (error) {
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
                message: 'An error occurred while updating your password.',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            Alert.alert('Error', 'An error occurred while updating your password.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back to Signin</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{flex: 1, alignItems: 'center', marginTop: '45%'}}>
                        <View>
                            <Svg
                                height={150}
                                width={150}
                                viewBox={`0 0 270 234`}
                                style={{position: 'absolute', bottom: 0, alignSelf: 'center'}}>
                                <Path d={hexagonPath} fill={COLORS.AKCRUBLUE} />
                            </Svg>
                            <Icon
                                name="key"
                                type="ionicon"
                                size={80}
                                color={COLORS.MIDORANGE}
                                style={{marginBottom: '8%'}}
                            />
                        </View>
                        <Text style={{...FONTS.Title2, marginBottom: '5%'}}>Let's reset your password below</Text>
                        <View style={{marginBottom: 10}}>
                            <Inputs
                                placeholdername={'Choose New Password'}
                                iconname={'lock-closed'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={true}
                                onChangeText={handlePasswordChange}
                                value={password}
                                editable={!loading}
                            />
                            {passwordLengthError && (
                                <Text style={styles.warningText}>Password must be at least 8 characters long</Text>
                            )}
                            <Inputs
                                placeholdername={'Confirm New Password'}
                                iconname={'lock-closed'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={true}
                                onChangeText={handleConfirmPasswordChange}
                                value={confirmPassword}
                                editable={!loading}
                            />
                            {passwordError && <Text style={styles.warningText}>Passwords do not match.</Text>}
                        </View>
                        <AkcruButtons.LrgButton
                            color={isFormComplete ? COLORS.MIDORANGE : COLORS.DARKGREY}
                            btnname={'Confirm'}
                            onPress={() => handleConfirmNewPassword()}
                            disabled={!isFormComplete}
                        />
                    </View>
                    <Modal animationType="fade" transparent={true} visible={showConfirmNewPasswordModal}>
                        <ResetPasswordResultModal
                            closeModal={() => setShowConfirmNewPasswordModal(false)}
                            messageheader={resetResultType.messageheader}
                            messageheadercolor={resetResultType.messageheadercolor}
                            message={resetResultType.message}
                            iconname={resetResultType.iconname}
                            iconcolor={resetResultType.iconcolor}
                        />
                    </Modal>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

export default ResetPassword;
