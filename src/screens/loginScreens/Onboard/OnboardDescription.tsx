import {View, Text, ImageBackground, Modal, Alert, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard, ScrollView, KeyboardAvoidingView} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../assets/constants/authTheme';
import styles from './styles';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import {updateUser} from '../../../lib/api/user.lib';
import {Icon} from '@rneui/base';
import StepperDots from '../../../components/StepperDots';
import { isTablet } from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 6;

const OnboardDescription = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const user = useAuthStore(state => state.user);
    const [description, setDescription] = useState('');

    const [loading, setLoading] = useState(false);

    const updateDescription = async () => {
        try {
            setLoading(true);

            const updatedUser = await updateUser({
                description: description,
            });

            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    currentUser.description = description;
                    useAuthStore.setState({user: currentUser});
                }
                navigation.navigate('OnboardCruName');
            } else {
                Alert.alert('Failed to update description', 'Please try again later.');
            }
        } catch (error) {
            console.error('Error updating description:', error);
            Alert.alert('Error', 'An error occurred while updating your description.');
        } finally {
            setLoading(false);
        }
    };

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

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
                <ScrollView
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
                            Tell the crummunity a little about yourself.
                        </Text>
                    <View style={{alignItems: 'center', marginTop: 10}}>
                                <View style={[styles.blurInputWrapper, {height: undefined, minHeight: 100}]}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="light"
                                        blurAmount={Platform.OS === 'ios' ? 10 : 10}
                                        reducedTransparencyFallbackColor={COLORS.TRANSDARKGREY}
                                    />
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            placeholder={'Tell us about yourself...'}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.textinput}
                                            secureTextEntry={false}
                                            onChangeText={text => {
                                                if (text.length <= 250) {
                                                    setDescription(text);
                                                }
                                            }}
                                            value={description}
                                            multiline={true}
                                            maxLength={200}
                                            editable={true}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.LrgButton
                                        variant="auth"
                                        color={COLORS.PURPLE}
                                        btnname={'Next'}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            updateDescription();
                                        }}
                                        disabled={false}
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
                    <Text style={{...FONTS.paragraph2, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardDescription;
