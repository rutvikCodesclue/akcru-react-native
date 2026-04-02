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

export enum IHeightBracket {
    HEIGHT_0_48 = 'HEIGHT_0_48',
    HEIGHT_49_54 = 'HEIGHT_49_54',
    HEIGHT_55_62 = 'HEIGHT_55_62',
    HEIGHT_63_66 = 'HEIGHT_63_66',
    HEIGHT_67_70 = 'HEIGHT_67_70',
    HEIGHT_71_74 = 'HEIGHT_71_74',
    HEIGHT_75_78 = 'HEIGHT_75_78',
    HEIGHT_79_PLUS = 'HEIGHT_79_PLUS',
}

const HEIGHT_LABELS: Record<IHeightBracket, string> = {
    HEIGHT_0_48: "4'0 and under",
    HEIGHT_49_54: "4'1 – 4'6",
    HEIGHT_55_62: "4'7 – 5'2",
    HEIGHT_63_66: "5'3 – 5'6",
    HEIGHT_67_70: "5'7 – 5'10",
    HEIGHT_71_74: "5'11 – 6'2",
    HEIGHT_75_78: "6'3 – 6'6",
    HEIGHT_79_PLUS: "6'7 and up",
};

const FlickFlirtPrefC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    type RouteProps = RouteProp<NoBottomTabStackParams, 'FlickFlirtPrefC'>;
    const route = useRoute<RouteProps>();
    const {gender, relationIntent, ageBrackets} = route.params;

    const [heightBrackets, setHeightBrackets] = useState<IHeightBracket[]>([]);
    const [selectedHeights, setSelectedHeights] = useState<IHeightBracket[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (submitting) {
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                gender,
                ageBrackets,
                relationIntent,
                preferredHeight: selectedHeights,
            };
            const res = await API.post('v1/flickflirt/preferences', payload);
            if (res.data?.success) {
                navigation.navigate('FlickFlirtPrefD', {
                    gender,
                    relationIntent,
                    ageBrackets,
                    preferredHeight: selectedHeights,
                });
            } else {
                console.error('Failed to submit height preference:', res.data.message);
            }
        } catch (error) {
            console.error('Error submitting height preferences:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchHeights = async () => {
        try {
            setLoading(true);
            const response = await API.get('v1/flickflirt/height-bracket');
            if (response.data?.success) {
                setHeightBrackets(response.data.heightBracket);
            } else {
                console.error('Error loading height brackets:', response.data.message);
            }
        } catch (error) {
            console.error('Error loading height brackets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeights();
    }, []);

    const toggleHeight = (key: IHeightBracket) => {
        setSelectedHeights(prev => (prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]));
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
                    <FlickFlirtPrefOnboardHeader currentStep={3} />
                    <View style={{marginTop: 20, marginHorizontal: 15}}>
                        <Text style={[FONTS.Title2, {textAlign: 'center', marginBottom: 10}]}>
                            Preferred Height Range(s)?
                        </Text>
                        {loading ? (
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <ActivityIndicator size="large" color={COLORS.PURPLE} />
                            </View>
                        ) : (
                            heightBrackets.map((bracket: IHeightBracket) => (
                                <TouchableOpacity
                                    key={bracket}
                                    onPress={() => toggleHeight(bracket)}
                                    style={[
                                        styles.intentOption,
                                        selectedHeights.includes(bracket) && styles.intentOptionSelected,
                                    ]}>
                                    <Text style={styles.intentText}>{HEIGHT_LABELS[bracket]}</Text>
                                    {selectedHeights.includes(bracket) && (
                                        <Icon name="checkmark" type="ionicon" size={18} color={COLORS.AKCRUBLUE} />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {selectedHeights.length > 0 && (
                        <View style={{alignItems: 'center', marginTop: 50}}>
                            <AkcruButtons.LrgButton
                                btnname={'Next'}
                                onPress={handleSubmit}
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

export default FlickFlirtPrefC;
