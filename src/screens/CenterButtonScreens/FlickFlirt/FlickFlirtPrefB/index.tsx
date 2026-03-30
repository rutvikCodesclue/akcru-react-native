import {View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, RouteProp, useRoute} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import {ImageBackground} from 'react-native';
import imageindex from '../../../../../assets/images/imageindex';
import styles from './styles';
import {API} from '../../../../clients/api.client';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import FlickFlirtPrefOnboardHeader from '../FlickFlirtPrefOnboardHeader';
import AkcruButtons from '../../../../components/akcruButtons';
import {IAgeBracket} from '../../../../../types';

const FlickFlirtPrefB = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    type RouteProps = RouteProp<NoBottomTabStackParams, 'FlickFlirtPrefB'>;
    const route = useRoute<RouteProps>();
    const {gender, relationIntent} = route.params;

    const AGE_BRACKET_LABELS: Record<IAgeBracket, string> = {
        AGE_18_24: '18–24',
        AGE_25_34: '25–34',
        AGE_35_39: '35–39',
        AGE_40_49: '40–49',
        AGE_50_PLUS: '50+',
    };

    const [ageBrackets, setAgeBrackets] = useState<IAgeBracket[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [selectedAgeBrackets, setSelectedAgeBrackets] = useState<IAgeBracket[]>([]);

    const handleSubmitPreferences = async () => {
        if (submitting) {
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                gender,
                ageBrackets: selectedAgeBrackets,
                relationIntent,
            };

            const res = await API.post('v1/flickflirt/preferences', payload);
            if (!gender || !relationIntent || !ageBrackets) {
                console.warn('Missing params in FlickFlirtPrefC', {gender, relationIntent, ageBrackets});
                return null;
            }
            if (res.data?.success) {
                navigation.navigate('FlickFlirtPrefC', {
                    gender,
                    relationIntent,
                    ageBrackets: selectedAgeBrackets,
                }); // or wherever the next screen is
            } else {
                console.error('Failed to submit preferences:', res.data?.message);
            }
        } catch (error) {
            console.error('Error submitting preferences:', error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchAgeBracket = async () => {
            try {
                setLoading(true);
                const response = await API.get('v1/flickflirt/age-bracket', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data && response.data.success) {
                    setAgeBrackets(response.data.ageBracket);
                } else {
                    console.error('Failed to fetch genders:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching genders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgeBracket();
    }, []);

    const handleAgeSelect = (key: string) => {
        setSelectedAgeBrackets(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
    };

    return (
        <View>
            <ImageBackground
                source={imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView>
                    <LinearGradient
                        colors={['rgba(5,7,35,0.7)', 'rgba(5,7,35,0.2)', 'rgba(5,7,35,0.92)']}
                        style={{position: 'absolute', left: 0, right: 0, top: 0, height: SIZES.ScreenHeight}}
                    />
                    <Header />
                    <BackButton navigation={navigation} />
                    <FlickFlirtPrefOnboardHeader currentStep={2} />
                    <View style={{marginTop: 20, marginHorizontal: 15}}>
                        <Text style={[FONTS.Title2, {textAlign: 'center', marginBottom: 10}]}>
                            What age range(s) are you interested in?
                        </Text>
                        {loading ? (
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <ActivityIndicator size="large" color={COLORS.PURPLE} />
                                <Text style={[FONTS.Username, {color: COLORS.LIGHTGREY, marginTop: 10}]}>
                                    Loading age brackets...
                                </Text>
                            </View>
                        ) : ageBrackets.length === 0 ? (
                            <Text style={{textAlign: 'center', color: COLORS.LIGHTGREY, marginTop: 20}}>
                                No age brackets available.
                            </Text>
                        ) : (
                            ageBrackets.map((bracket: IAgeBracket) => (
                                <TouchableOpacity
                                    key={bracket}
                                    onPress={() => handleAgeSelect(bracket)}
                                    style={[
                                        styles.intentOption,
                                        selectedAgeBrackets.includes(bracket) && styles.intentOptionSelected,
                                    ]}>
                                    <Text style={styles.intentText}>{AGE_BRACKET_LABELS[bracket]}</Text>
                                    {selectedAgeBrackets.includes(bracket) && (
                                        <Icon name="checkmark" type="ionicon" size={18} color={COLORS.AKCRUBLUE} />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {selectedAgeBrackets.length > 0 && (
                        <View style={{alignItems: 'center', marginTop: 50}}>
                            <AkcruButtons.LrgButton
                                btnname={'Next'}
                                onPress={handleSubmitPreferences}
                                color={COLORS.PURPLE}
                                variant="auth"
                                disabled={submitting}
                                loading={submitting}
                            />
                        </View>
                    )}
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default FlickFlirtPrefB;
