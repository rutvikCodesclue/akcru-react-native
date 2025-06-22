import {View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import {ImageBackground} from 'react-native';
import imageindex from '../../../../../assets/images/imageindex';
import styles from './styles';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {API} from '../../../../clients/api.client';
import {capitalizeFirstLetterOfString} from '../../../../util/util';
import {AkcruLogo} from '../../../../../assets/svg';
import AkcruButtons from '../../../../components/akcruButtons';

const FlickFlirtPref = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [genders, setGenders] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const [relationIntents, setRelationIntents] = useState<string[]>([]);
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

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

    useEffect(() => {
        const fetchRelationIntents = async () => {
            try {
                setLoading(true);
                const response = await API.get('v1/flickflirt/relation-intent', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data?.success && Array.isArray(response.data.relationIntent)) {
                    setRelationIntents(response.data.relationIntent);
                } else {
                    console.error('Failed to fetch relation intents:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching relation intents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelationIntents();
    }, []);

    const formatEnumLabel = (value: string) =>
        value
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const handleGenderSelect = (gender: string) => {
        if (selectedGenders.includes(gender)) {
            setSelectedGenders(prev => prev.filter(g => g !== gender));
        } else {
            setSelectedGenders(prev => [...prev, gender]);
        }
    };

    return (
        <View>
            <ImageBackground
                source={imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView>
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: SIZES.ScreenHeight,
                        }}
                    />
                    <View>
                        <Header />
                    </View>
                    <BackButton navigation={navigation} />
                    <View style={{marginHorizontal: 15}}>
                        <Text style={[FONTS.Title2, {textAlign: 'center', marginBottom: 10}]}>
                            Why do you want to use Flick Flirt?
                        </Text>
                        {loading ? (
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <ActivityIndicator size="large" color={COLORS.PURPLE} />
                                <Text style={[FONTS.Username, {color: COLORS.LIGHTGREY, marginTop: 10}]}>
                                    Loading relationship intents...
                                </Text>
                            </View>
                        ) : relationIntents.length === 0 ? (
                            <Text style={{textAlign: 'center', color: COLORS.LIGHTGREY, marginTop: 20}}>
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
                    </View>
                    <View style={{alignItems: 'center', marginTop: 20, marginHorizontal: 15}}>
                        <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                            Please select the perferred gender(s) you wish to match with
                        </Text>
                    </View>
                    <View style={{marginTop: 10, marginHorizontal: 15}}>
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
                    </View>
                    {selectedIntent && selectedGenders.length > 0 && (
                        <View style={{alignItems: 'center', marginTop: 50}}>
                            <AkcruButtons.XlLrgButton
                                btnname={'Next'}
                                onPress={() =>
                                    navigation.navigate('FlickFlirtPrefB', {
                                        gender: selectedGenders,
                                        relationIntent: selectedIntent,
                                    })
                                }
                                color={COLORS.PURPLE}
                            />
                        </View>
                    )}
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default FlickFlirtPref;
