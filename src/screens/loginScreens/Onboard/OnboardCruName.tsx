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
import {ICru} from '../../../../types';
import {searchCRUs, updateCRUInfo} from '../../../lib/api/cru.lib';
import ProgressBar from '../../../components/ProgressBar';

const TOTAL_STEPS = 11;
const CURRENT_STEP = 7;

const OnboardCruName = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [, setCRU] = useState<ICru | undefined>(undefined);

    const [cruName, setCruName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [userNameError, setUserNameError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const isCruNameValid = (cruName: string) => {
        return cruName.length > 2;
    };

    const checkFormCompletion = () => {
        if (cruName && isCruNameValid(cruName)) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [cruName]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, _] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const checkCruNameExists = async (cruName: string) => {
        try {
            const lowercaseCruName = cruName.toLowerCase();

            const response = await searchCRUs(lowercaseCruName);

            if (response && response.success) {
                const currentCruName = useAuthStore.getState().user?.Cru?.name.toLowerCase();

                const filteredCrus = response.data.filter(cru => cru.name.toLowerCase() !== currentCruName);

                const cruNameExists = filteredCrus.some(cru => cru.name.toLowerCase() === lowercaseCruName);

                return cruNameExists;
            }
            return false;
        } catch (error) {
            console.error('Error checking CRU name:', error);
            return false;
        }
    };

    const ConfirmChangeCruName = async () => {
        if (!isCruNameValid(cruName)) {
            Alert.alert('Invalid CRU Name', 'Please enter a valid CRU name.');
            return;
        }

        setLoading(true);

        try {
            const cruNameExists = await checkCruNameExists(cruName);

            if (cruNameExists) {
                Alert.alert('CRU Name Taken', 'This CRU name is already in use. Please choose a different name.');
            } else {
                const updatedCRU = await updateCRUInfo({name: cruName});
                if (updatedCRU) {
                    setCRU(updatedCRU);
                    navigation.navigate('OnboardDOB');
                } else {
                    Alert.alert('Update Failed', 'Failed to update CRU name. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error during CRU name confirmation:', error);
            Alert.alert('Error', 'An error occurred while checking the CRU name.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [cruName]);

    const handleCruNameChange = (text: string) => {
        setCruName(text.trim());
        setUserNameError(!isCruNameValid(text));
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
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>Now create a Cru name.</Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <Inputs
                                placeholdername={'Create a Cru name'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleCruNameChange}
                                value={cruName}
                                editable={!loading}
                            />
                            {userNameError && <Text style={styles.warningText}>Invalid Username format</Text>}
                            <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.PINK}}>
                                Your Cru name must be unique and atleast 3 characters long.
                            </Text>
                        </View>
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={() => ConfirmChangeCruName()}
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

export default OnboardCruName;
