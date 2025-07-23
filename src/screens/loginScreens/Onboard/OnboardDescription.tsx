import {View, Text, ImageBackground, Modal, KeyboardAvoidingView, Alert, TextInput} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
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
import LinearGradient from 'react-native-linear-gradient';
import {updateUser} from '../../../lib/api/user.lib';
import BackButton from '../../../components/General/backbutton';
import ProgressBar from '../../../components/ProgressBar';
import { isTablet } from '../../../../assets/constants/theme';

const TOTAL_STEPS = 11;
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
                        <BackButton navigation={navigation} />
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
                                Tell the crummunity a little about yourself.
                            </Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <View style={styles.input}>
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
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={COLORS.PURPLE}
                                    btnname={'Next'}
                                    onPress={() => updateDescription()}
                                    disabled={false}
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

export default OnboardDescription;
