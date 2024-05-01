import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import styles from './styles';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { AkcruLogo } from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import Inputs from '../../../components/input';
import {Icon} from '@rneui/base';
import useAuthStore from '../../../stores/auth.store';
import { appVersion } from '../../../../assets/constants/Data';
import axios from 'axios';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import ResetPasswordResultModal from '../../../components/ResetPasswordResultModal/ResetPasswordResultModal';
import LinearGradient from 'react-native-linear-gradient';
import { searchForUsers, updateUser } from '../../../lib/api/user.lib';
import { ICru } from '../../../../types';
import { searchCRUs, updateCRUInfo } from '../../../lib/api/cru.lib';

const OnboardCruName = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const phoneNumber = route.params?.phoneNumber;
    //console.log('Phone number passed to username:', phoneNumber);

    const [CRU, setCRU] = useState<ICru | undefined>(undefined); // CRU object from the AP

    const [cruName, setCruName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [userNameError, setUserNameError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    // Enhanced Email Validation
    const isCruNameValid = (cruName: string) => {
       
        return cruName.length > 2;
    };

    // const handleCruNameChange = (text: string) => {
    //     setCruName(text);
    //     setUserNameError(!isCruNameValid(text));
    // };

    const checkFormCompletion = () => {
        if (
            cruName &&
            isCruNameValid(cruName) // Check email format
        ) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [cruName]);

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

    const checkCruNameExists = async (cruName: string) => {
        try {
            // Convert the CRU name to lowercase for consistency in checking
            const lowercaseCruName = cruName.toLowerCase();

            // Perform a search to find any existing CRUs with the same name
            const response = await searchCRUs(lowercaseCruName);

            // Check if the API call was successful and if there are any CRUs with the same name
            if (response && response.success) {
                // Assuming no current CRU name is set or comparing against the previous name if updating an existing CRU
                const currentCruName = useAuthStore.getState().user?.Cru?.name.toLowerCase();

                // Filter the results to exclude the current CRU if updating
                const filteredCrus = response.data.filter(cru => cru.name.toLowerCase() !== currentCruName);

                // Check if there's any CRU with the exact name
                const cruNameExists = filteredCrus.some(cru => cru.name.toLowerCase() === lowercaseCruName);

                return cruNameExists;
            }
            return false;
        } catch (error) {
            console.error('Error checking CRU name:', error);
            return false; // Assume CRU name doesn't exist in case of an error
        }
    };


    // const ConfirmChangeCruName = async () => {
    //     setLoading(true);

    //     try {
    //         const cruNameExists = await checkCruNameExists(cruName);

    //         if (cruNameExists) {
    //             // If the CRU name already exists, show an alert and prevent further actions
    //             Alert.alert('CRU Name Taken', 'This CRU name is already in use. Please choose a different name.');
    //             setLoading(false); // Stop the loading state
    //         } else {
    //             // Proceed with updating the CRU name if it's unique
    //             if (CRU && cruName.trim() !== '') {
    //                 console.log('CRU:', CRU);
    //                 const updatedCRU = await updateCRUInfo({name: cruName});
    //                 console.log('Updated CRU:', updatedCRU);
    //                 if (updatedCRU) {
    //                     setCRU(updatedCRU);
    //                     navigation.navigate('OnboardDOB'); // Navigate to the next screen or update state
    //                 } else {
    //                     Alert.alert('Update Failed', 'Failed to update CRU name. Please try again.');
    //                 }
    //             } else {
    //                 Alert.alert('Invalid CRU Name', 'Please enter a valid CRU name.');
    //             }
    //             setLoading(false); // Stop the loading state
    //         }
    //     } catch (error) {
    //         console.error('Error during CRU name confirmation:', error);
    //         Alert.alert('Error', 'An error occurred while checking the CRU name.');
    //         setLoading(false); // Stop the loading state
    //     }
    // };

    const ConfirmChangeCruName = async () => {
        if (!isCruNameValid(cruName)) {
            Alert.alert('Invalid CRU Name', 'Please enter a valid CRU name.');
            return; // Exit the function early
        }

        setLoading(true);

        try {
            const cruNameExists = await checkCruNameExists(cruName);

            if (cruNameExists) {
                Alert.alert('CRU Name Taken', 'This CRU name is already in use. Please choose a different name.');
            } else {
                // If the name is valid and does not exist, proceed to update or set the name
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
                    // Background Linear Gradient
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
