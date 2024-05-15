import {View, Text, ImageBackground, Modal, TouchableOpacity, Alert, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import AkcruButtons from '../../../components/akcruButtons';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {Icon} from '@rneui/base';
import imageindex from '../../../../assets/images/imageindex';
import Svg, {Path} from 'react-native-svg';
import Inputs from '../../../components/input';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import useAuthStore from '../../../stores/auth.store';
import { API } from '../../../clients/api.client';
import LinearGradient from 'react-native-linear-gradient';


const ResetPassword = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const route = useRoute<RouteProp<AuthStackParams, 'ResetPassword'>>();
    const user = useAuthStore(state => state.user);

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

    
    const email = route.params?.email;
    const phoneNumber = route.params?.phoneNumber;

    

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

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password should be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            
            const payload = email ? {email} : {phoneNumber};

            const response = await API.post('/v1/user/resetPassword', {
                ...payload,
                password,
                confirmPassword,
            });

            const data = response.data;

            if (data.success) {
                
                setResetResultType({
                    messageheader: 'Success',
                    messageheadercolor: COLORS.CATGREENDRK,
                    message: 'Password reset successfully.',
                    iconname: 'happy',
                    iconcolor: COLORS.CATGREENLGT,
                });
                setShowConfirmNewPasswordModal(true);
                
                setTimeout(() => {
                    navigation.navigate('Signin');
                }, 3000);
            } else {
                
                setResetResultType({
                    messageheader: 'Failed',
                    messageheadercolor: COLORS.CATREDDRK,
                    message: data.message || 'Failed to reset password.',
                    iconname: 'alert-circle',
                    iconcolor: COLORS.CATREDLGT,
                });
                console.error('Error resetting password', data.message);
                setShowConfirmNewPasswordModal(true);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setResetResultType({
                messageheader: 'Error',
                messageheadercolor: COLORS.CATREDDRK,
                message: error.response.data.message || 'An error occurred while resetting the password.',
                iconname: 'alert-circle',
                iconcolor: COLORS.CATREDLGT,
            });
            console.error('Error resetting password', error.response.data.message);
            setShowConfirmNewPasswordModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView>
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
                                name="lock-open"
                                type="ionicon"
                                size={80}
                                color={COLORS.MIDORANGE}
                                style={{marginBottom: '8%'}}
                            />
                        </View>
                        <Text style={{...FONTS.Title2, marginBottom: '5%'}}>Let's reset your password below</Text>
                        <View style={{marginBottom: 10, alignItems: 'center'}}>
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
