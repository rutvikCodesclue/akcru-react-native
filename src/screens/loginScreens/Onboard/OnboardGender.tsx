import {View, Text, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Alert, TextInput} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
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
import LinearGradient from 'react-native-linear-gradient';
import {updateUser} from '../../../lib/api/user.lib';
import ProgressBar from '../../../components/ProgressBar';
import {isTablet} from '../../../../assets/constants/theme';

const TOTAL_STEPS = 7; // updated total
const CURRENT_STEP = 5; // gender + description step

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
                                Please select your gender and tell the crummunity a bit about yourself.
                            </Text>
                        </View>

                        {/* Gender selection */}
                        <View style={{marginHorizontal: 15, marginTop: 10}}>
                            {genders.map(gender => (
                                <View key={gender} style={styles.checkboxContainer}>
                                    <TouchableOpacity
                                        onPress={() => handleGenderSelect(gender)}
                                        style={styles.checkbox}>
                                        {selectedGender === gender && (
                                            <Icon
                                                name="checkmark-sharp"
                                                type="ionicon"
                                                size={18}
                                                color={COLORS.AKCRUBLUE}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <Text style={styles.checkboxText}>{capitalizeFirstLetterOfString(gender)}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Description input */}
                        <View style={{alignItems: 'center', marginTop: 15}}>
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
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={GenderAndDescriptionSet}
                                    disabled={!isFormComplete || loading}
                                />
                            </View>
                        </View>
                    </View>
                    <Text style={{...FONTS.Title2White, textAlign: 'center'}}>version {appVersion[0].version}</Text>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnboardGender;
