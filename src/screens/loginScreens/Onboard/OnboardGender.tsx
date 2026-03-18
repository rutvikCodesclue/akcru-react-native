import {View, Text, TouchableOpacity, ImageBackground, Alert, TextInput, StyleSheet, Platform, Keyboard, Modal, ScrollView, KeyboardAvoidingView} from 'react-native';
import {BlurView} from '@react-native-community/blur';
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
import {Icon} from '@rneui/base';
import useAuthStore from '../../../stores/auth.store';
import {appVersion} from '../../../../assets/constants/Data';
import {API} from '../../../clients/api.client';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {updateUser} from '../../../lib/api/user.lib';
import StepperDots from '../../../components/StepperDots';
import {isTablet} from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 4;

const OnboardGender = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const user = useAuthStore(state => state.user);

    const [userName, setUserName] = useState<string>('');
    const [genders, setGenders] = useState<string[]>([]);
    const [selectedGender, setSelectedGender] = useState<string | null>(null);
    const [description, setDescription] = useState<string>(user?.description || '');
    const [loading, setLoading] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);

    useEffect(() => {
        const fetchGenders = async () => {
            try {
                setLoading(true);
                const response = await API.get('v1/user/genders', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data && response.data.success) {
                    setGenders(response.data.genders);
                } else {
                    console.error('Failed to fetch genders:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching genders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGenders();
    }, []);

    const handleGenderSelect = (gender: string) => {
        setSelectedGender(gender);
    };

    const checkFormCompletion = () => {
        // Keep description optional; only require gender to move on
        if (selectedGender) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [selectedGender]);

    const GenderAndDescriptionSet = async () => {
        if (!isFormComplete || !selectedGender) return;

        try {
            setLoading(true);
            const updatedUser = await updateUser({
                gender: selectedGender,
                description: description, // can be empty string, same as old screen
            });

            if (updatedUser) {
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    currentUser.gender = selectedGender;
                    currentUser.description = description;
                    useAuthStore.setState({user: currentUser});
                } else {
                    useAuthStore.setState({user: updatedUser});
                }

                navigation.navigate('OnboardCruName', {userName});
            } else {
                Alert.alert('Update Failed', 'Failed to update gender and description.');
            }
        } catch (error) {
            console.error('Error updating gender/description:', error);
            Alert.alert('Update Error', 'An error occurred while updating your profile.');
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
                        <Text style={[AUTH_TEXT_THEME.instruction, {marginBottom: 20, paddingHorizontal: 16, textAlign: 'center'}]}>
                            Please select your gender and tell the crummunity a bit about yourself.
                        </Text>
                    {/* Gender selection - chips */}
                        <View style={styles.chipContainer}>
                            {genders.map(gender => (
                                <TouchableOpacity
                                    key={gender}
                                    onPress={() => handleGenderSelect(gender)}
                                    style={selectedGender === gender ? styles.chipSelected : styles.chip}>
                                    <Text style={selectedGender === gender ? styles.chipTextSelected : styles.chipText}>
                                        {capitalizeFirstLetterOfString(gender)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Description input */}
                        <View style={{alignItems: 'center', marginTop: 15}}>
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
                                        editable={!loading}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruButtons.LrgButton
                                variant="auth"
                                color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                btnname={'Next'}
                                onPress={() => {
                                Keyboard.dismiss();
                                GenderAndDescriptionSet();
                            }}
                                disabled={!isFormComplete || loading}
                                loading={loading}
                            />
                        </View>
                    </View>
                    <Text style={{...FONTS.paragraph2, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 8, marginTop: 10}}>version {appVersion[0].version}</Text>
                </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardGender;
