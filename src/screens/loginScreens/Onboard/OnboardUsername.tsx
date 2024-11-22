import {View, Text, ImageBackground, Modal, KeyboardAvoidingView, Alert, ActivityIndicator} from 'react-native';
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
import {searchForUsers, updateUser} from '../../../lib/api/user.lib';

const OnboardUsername = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const phoneNumber = route.params?.phoneNumber;

    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [userNameError, setUserNameError] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    const isUserNameValid = (userName: string) => {
        return userName.length > 2;
    };

    const handleUserNameChange = (text: string) => {
        // Convert text to lowercase, remove whitespace, and restrict input to allowed characters
        const formattedText = text
            .toLowerCase()
            .replace(/\s/g, '')
            .replace(/[^a-z0-9._]/g, '');
        setUserName(formattedText);
        setUserNameError(!isUserNameValid(formattedText));
    };

    const checkFormCompletion = () => {
        if (userName && isUserNameValid(userName)) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [userName]);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [resetResultType, setResetResultType] = useState({
        messageheader: '',
        messageheadercolor: '',
        message: '',
        iconname: '',
        iconcolor: '',
    });

    const UserNameSet = async () => {
        if (loading) return; 
        setLoading(true);
    
        try {
            const lowercaseUserName = userName.toLowerCase();

            const usernameExists = await checkUsernameExists(lowercaseUserName);

            if (usernameExists) {
                Alert.alert('Username is already taken', 'Please choose a different username.');
            } else if (lowercaseUserName.includes(' ')) {
                Alert.alert('Username contains spaces', 'Please remove spaces from your username.');
            } else if (!isUserNameValid(userName)) {
                setUserNameError(true);

                Alert.alert('Username must be at least 3 characters', 'Please choose a different username.');
            } else {
                const updatedUser = await updateUser({
                    username: userName,
                    phone: phoneNumber,
                });

                if (updatedUser) {
                    const currentUser = useAuthStore.getState().user;

                    if (currentUser) {
                        currentUser.username = userName;
                        currentUser.phoneNumber = phoneNumber;

                        useAuthStore.setState({user: currentUser});
                    }
                    navigation.navigate('OnboardGender');
                } else {
                    console.error('Failed to update profile.', updatedUser);
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUsernameExists = async (username: string) => {
        try {
            const lowercaseUsername = username.toLowerCase();

            const currentUserUsername = useAuthStore.getState().user?.username.toLowerCase();

            const response = await searchForUsers(lowercaseUsername);

            const filteredResponse = response.filter(user => user.username.toLowerCase() !== currentUserUsername);

            const usernameExists = filteredResponse.some(user => user.username.toLowerCase() === lowercaseUsername);

            return usernameExists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
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
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>Now lets choose a Username.</Text>
                        </View>
                        <View style={{alignItems: 'center', marginTop: 10}}>
                            <Inputs
                                placeholdername={'Choose Username'}
                                iconname={'person'}
                                iconcolor={COLORS.LIGHTGREY}
                                secureTextEntry={false}
                                onChangeText={handleUserNameChange}
                                value={userName}
                                editable={!loading}
                            />
                            {userNameError && <Text style={styles.warningText}>Invalid Username format</Text>}
                            <Text style={{...FONTS.Title2, textAlign: 'center', color: COLORS.PINK}}>
                                Username must be unique and atleast 3 characters long.
                            </Text>
                        </View>
                        <View>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruButtons.LrgButton
                                color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                btnname={'Next'}
                                onPress={() => {
                                    if (!loading) {
                                        UserNameSet();
                                    }
                                }}
                                disabled={!isFormComplete || loading}
                            />
                        </View>
                        {loading && (
                            <ActivityIndicator size="large" color={COLORS.PURPLE} style={{marginTop: 10}} />
                        )}
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

export default OnboardUsername;
