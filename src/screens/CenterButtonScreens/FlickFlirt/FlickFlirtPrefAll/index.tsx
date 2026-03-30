import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../../assets/images/imageindex';
import styles from '../FlickFlirtPref/styles';
import Header from '../../../../components/header';
import {API} from '../../../../clients/api.client';
import {capitalizeFirstLetterOfString} from '../../../../util/util';
import AkcruButtons from '../../../../components/akcruButtons';
import {IAgeBracket} from '../../../../../types';

enum IHeightBracket {
    HEIGHT_0_48 = 'HEIGHT_0_48',
    HEIGHT_49_54 = 'HEIGHT_49_54',
    HEIGHT_55_62 = 'HEIGHT_55_62',
    HEIGHT_63_66 = 'HEIGHT_63_66',
    HEIGHT_67_70 = 'HEIGHT_67_70',
    HEIGHT_71_74 = 'HEIGHT_71_74',
    HEIGHT_75_78 = 'HEIGHT_75_78',
    HEIGHT_79_PLUS = 'HEIGHT_79_PLUS',
}

const AGE_BRACKET_LABELS: Record<IAgeBracket, string> = {
    AGE_18_24: '18–24',
    AGE_25_34: '25–34',
    AGE_35_39: '35–39',
    AGE_40_49: '40–49',
    AGE_50_PLUS: '50+',
};

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

const FlickFlirtPrefAll = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [genders, setGenders] = useState<string[]>([]);
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [relationIntents, setRelationIntents] = useState<string[]>([]);
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
    const [ageBrackets, setAgeBrackets] = useState<IAgeBracket[]>([]);
    const [selectedAgeBrackets, setSelectedAgeBrackets] = useState<IAgeBracket[]>([]);
    const [heightBrackets, setHeightBrackets] = useState<IHeightBracket[]>([]);
    const [selectedPreferredHeights, setSelectedPreferredHeights] = useState<IHeightBracket[]>([]);
    const [selectedUserHeight, setSelectedUserHeight] = useState<IHeightBracket | null>(null);

    const [loadingLists, setLoadingLists] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadingLists(true);
            try {
                const [gRes, iRes, aRes, hRes] = await Promise.all([
                    API.get('v1/user/genders', {headers: {'Content-Type': 'application/json'}}),
                    API.get('v1/flickflirt/relation-intent', {headers: {'Content-Type': 'application/json'}}),
                    API.get('v1/flickflirt/age-bracket', {headers: {'Content-Type': 'application/json'}}),
                    API.get('v1/flickflirt/height-bracket'),
                ]);
                if (cancelled) return;
                if (gRes.data?.success && Array.isArray(gRes.data.genders)) {
                    setGenders(gRes.data.genders);
                }
                if (iRes.data?.success && Array.isArray(iRes.data.relationIntent)) {
                    setRelationIntents(iRes.data.relationIntent);
                }
                if (aRes.data?.success && Array.isArray(aRes.data.ageBracket)) {
                    setAgeBrackets(aRes.data.ageBracket);
                }
                if (hRes.data?.success && Array.isArray(hRes.data.heightBracket)) {
                    setHeightBrackets(hRes.data.heightBracket);
                }
            } catch (e) {
                console.error('Error loading FlickFlirt preference options:', e);
            } finally {
                if (!cancelled) {
                    setLoadingLists(false);
                }
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const formatEnumLabel = (value: string) =>
        value
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const handleGenderSelect = (gender: string) => {
        setSelectedGenders(prev => (prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]));
    };

    const handleAgeSelect = (key: IAgeBracket) => {
        setSelectedAgeBrackets(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
    };

    const togglePreferredHeight = (key: IHeightBracket) => {
        setSelectedPreferredHeights(prev =>
            prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
        );
    };

    const canSubmit =
        Boolean(selectedIntent) &&
        selectedGenders.length > 0 &&
        selectedAgeBrackets.length > 0 &&
        selectedPreferredHeights.length > 0 &&
        selectedUserHeight !== null;

    const handleSubmitAll = async () => {
        if (!canSubmit || submitting || !selectedIntent || !selectedUserHeight) {
            return;
        }
        try {
            setSubmitting(true);
            const gender = selectedGenders;
            const relationIntent = selectedIntent;
            const age = selectedAgeBrackets;
            const preferredHeight = selectedPreferredHeights;
            const userHeight = selectedUserHeight;

            const res1 = await API.post('v1/flickflirt/preferences', {gender, ageBrackets: age, relationIntent});
            if (!res1.data?.success) {
                console.error('Failed preferences (step 1):', res1.data?.message);
                return;
            }
            const res2 = await API.post('v1/flickflirt/preferences', {
                gender,
                ageBrackets: age,
                relationIntent,
                preferredHeight,
            });
            if (!res2.data?.success) {
                console.error('Failed preferences (step 2):', res2.data?.message);
                return;
            }
            const res3 = await API.post('v1/flickflirt/preferences', {
                gender,
                ageBrackets: age,
                relationIntent,
                preferredHeight,
                userHeight,
            });
            if (res3.data?.success) {
                navigation.navigate('FlickFlirtResults', {startedAt: Date.now()});
            } else {
                console.error('Failed preferences (step 3):', res3.data?.message);
            }
        } catch (error) {
            console.error('Error submitting preferences:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground
                source={imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, minHeight: SIZES.ScreenHeight}}>
                <SafeAreaView style={{flex: 1}}>
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
                    <Header />
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{
                            paddingHorizontal: 15,
                            paddingBottom: 48,
                        }}
                        showsVerticalScrollIndicator>
                        <Text style={[FONTS.Title2, {textAlign: 'center', marginBottom: 16}]}>
                            Match preferences
                        </Text>
                        {loadingLists ? (
                            <View style={{alignItems: 'center', paddingVertical: 24}}>
                                <ActivityIndicator size="large" color={COLORS.PURPLE} />
                                <Text style={[FONTS.Username, {color: COLORS.LIGHTGREY, marginTop: 10}]}>
                                    Loading options...
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={[FONTS.Title3, {color: COLORS.LIGHTGREY, marginBottom: 8}]}>
                                    Why do you want to use Flick Flirt?
                                </Text>
                                {relationIntents.length === 0 ? (
                                    <Text style={{textAlign: 'center', color: COLORS.LIGHTGREY, marginBottom: 24}}>
                                        No relationship intents available.
                                    </Text>
                                ) : (
                                    relationIntents.map(intent => (
                                        <TouchableOpacity
                                            key={intent}
                                            onPress={() => setSelectedIntent(intent)}
                                            style={[
                                                styles.intentOption,
                                                selectedIntent === intent && styles.intentOptionSelected,
                                            ]}>
                                            <Text style={styles.intentText}>{formatEnumLabel(intent)}</Text>
                                            {selectedIntent === intent && (
                                                <Icon name="checkmark" type="ionicon" size={18} color={COLORS.AKCRUBLUE} />
                                            )}
                                        </TouchableOpacity>
                                    ))
                                )}

                                <Text
                                    style={[
                                        FONTS.Title2,
                                        {textAlign: 'center', marginTop: 28, marginBottom: 10},
                                    ]}>
                                    Preferred gender(s)
                                </Text>
                                {genders.map(gender => (
                                    <TouchableOpacity
                                        key={gender}
                                        onPress={() => handleGenderSelect(gender)}
                                        style={[
                                            styles.intentOption,
                                            selectedGenders.includes(gender) && styles.intentOptionSelected,
                                        ]}>
                                        <Text style={styles.intentText}>{capitalizeFirstLetterOfString(gender)}</Text>
                                        {selectedGenders.includes(gender) && (
                                            <Icon name="checkmark" type="ionicon" size={18} color={COLORS.AKCRUBLUE} />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <Text
                                    style={[
                                        FONTS.Title2,
                                        {textAlign: 'center', marginTop: 28, marginBottom: 10},
                                    ]}>
                                    What age range(s) are you interested in?
                                </Text>
                                {ageBrackets.length === 0 ? (
                                    <Text style={{textAlign: 'center', color: COLORS.LIGHTGREY, marginBottom: 8}}>
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

                                <Text
                                    style={[
                                        FONTS.Title2,
                                        {textAlign: 'center', marginTop: 28, marginBottom: 10},
                                    ]}>
                                    Preferred height range(s)
                                </Text>
                                {heightBrackets.map((bracket: IHeightBracket) => (
                                    <TouchableOpacity
                                        key={bracket}
                                        onPress={() => togglePreferredHeight(bracket)}
                                        style={[
                                            styles.intentOption,
                                            selectedPreferredHeights.includes(bracket) && styles.intentOptionSelected,
                                        ]}>
                                        <Text style={styles.intentText}>{HEIGHT_LABELS[bracket]}</Text>
                                        {selectedPreferredHeights.includes(bracket) && (
                                            <Icon name="checkmark" type="ionicon" size={18} color={COLORS.AKCRUBLUE} />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <Text
                                    style={[
                                        FONTS.Title2,
                                        {textAlign: 'center', marginTop: 28, marginBottom: 10},
                                    ]}>
                                    Your height
                                </Text>
                                {heightBrackets.map((bracket: IHeightBracket) => (
                                    <TouchableOpacity
                                        key={`mine-${bracket}`}
                                        onPress={() => setSelectedUserHeight(bracket)}
                                        style={[
                                            styles.intentOption,
                                            selectedUserHeight === bracket && styles.intentOptionSelected,
                                        ]}>
                                        <Text style={styles.intentText}>{HEIGHT_LABELS[bracket]}</Text>
                                        {selectedUserHeight === bracket && (
                                            <Icon name="checkmark" type="ionicon" size={18} color={COLORS.AKCRUBLUE} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}

                        <View style={{alignItems: 'center', marginTop: 32,marginBottom:100}}>
                            <AkcruButtons.LrgButton
                                btnname="Set preferences"
                                onPress={handleSubmitAll}
                                color={COLORS.PURPLE}
                                variant="auth"
                                disabled={!canSubmit || submitting || loadingLists}
                                loading={submitting}
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default FlickFlirtPrefAll;
