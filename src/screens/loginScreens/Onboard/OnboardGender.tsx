import {View, Text, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Alert} from 'react-native';
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

const OnboardGender = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [userName, setUserName] = useState<string>('');
    const [isFormComplete, setIsFormComplete] = useState(false);

    const [genders, setGenders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedGender, setSelectedGender] = useState(null);

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

    const handleGenderSelect = (gender: any) => {
        setSelectedGender(gender);
    };

    const checkFormCompletion = () => {
        if (selectedGender) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
    }, [selectedGender]);

    const GenderSet = async () => {
        if (isFormComplete) {
            try {
                setLoading(true);
                const updatedUser = await updateUser({gender: selectedGender});
                if (updatedUser) {
                    useAuthStore.setState({user: updatedUser});
                    navigation.navigate('OnboardDescription', {userName});
                } else {
                    Alert.alert('Update Failed', 'Failed to update gender.');
                }
            } catch (error) {
                console.error('Error updating gender:', error);
                Alert.alert('Update Error', 'An error occurred while updating gender.');
            } finally {
                setLoading(false);
            }
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
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>Please select your gender:</Text>
                        </View>
                        <View style={{marginHorizontal: 15}}>
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
                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.LrgButton
                                    color={isFormComplete ? COLORS.PURPLE : COLORS.DARKGREY}
                                    btnname={'Next'}
                                    onPress={() => GenderSet()}
                                    disabled={!isFormComplete}
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
