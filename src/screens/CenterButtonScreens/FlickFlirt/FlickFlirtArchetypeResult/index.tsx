import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Modal,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import imageindex from '../../../../../assets/images/imageindex';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {updateUser} from '../../../../lib/api/user.lib';
import useAuthStore from '../../../../stores/auth.store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLICKFLIRT_TOP_GENRES_KEY = 'flickflirt_top_genres';

type FlickFlirtArchetypeResultNavProp = NativeStackNavigationProp<NoBottomTabStackParams, 'FlickFlirtArchetypeResult'>;
type FlickFlirtArchetypeResultRouteProp = RouteProp<NoBottomTabStackParams, 'FlickFlirtArchetypeResult'>;

const FlickFlirtArchetypeResult = () => {
    const navigation = useNavigation<FlickFlirtArchetypeResultNavProp>();
    const route = useRoute<FlickFlirtArchetypeResultRouteProp>();
    const {name, image, description, genres} = route.params ?? {};
    const [isSaving, setIsSaving] = useState(true);
    const [isIntroLoading, setIsIntroLoading] = useState(true);
    const showLoader = isIntroLoading || isSaving;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsIntroLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!name || !genres?.length) {
            navigation.goBack();
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                await AsyncStorage.setItem(FLICKFLIRT_TOP_GENRES_KEY, JSON.stringify(genres));
            } catch (e) {
                console.warn('Could not save FlickFlirt genres to local storage', e);
            }
            try {
                const archetypeData = JSON.stringify({
                    name,
                    image,
                    description,
                    genres,
                });
                const updatedUser = await updateUser({archetype: archetypeData});
                if (!cancelled && updatedUser) {
                    useAuthStore.setState({user: updatedUser});
                }
            } catch (error) {
                console.error('Error updating archetype:', error);
            } finally {
                if (!cancelled) {
                    setIsSaving(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [name, image, description, genres, navigation]);

    const goToPreferences = () => {
        navigation.navigate('FlickFlirtPref');
    };

    return (
        <View style={{flex: 1}}>
            <ImageBackground
                source={showLoader ? imageindex.BgImageSM : image ? {uri: image} : imageindex.FLickFlirt}
                resizeMode="cover"
                style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                <SafeAreaView style={{flex: 1}}>
                    <LinearGradient
                        colors={['rgba(5,7,35,0.7)', 'rgba(5,7,35,0.2)', 'rgba(5,7,35,0.92)']}
                        style={{position: 'absolute', left: 0, right: 0, top: 0, height: SIZES.ScreenHeight}}
                    />
                    {!showLoader && (
                        <>
                            <Header />
                            <BackButton navigation={navigation} />

                            <ScrollView
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    paddingTop: 24,
                                    paddingBottom: 100,
                                    paddingHorizontal: 16,
                                }}
                                keyboardShouldPersistTaps="handled">
                                <View style={{width: '90%', maxWidth: SIZES.ScreenWidth * 0.9, paddingBottom: 32}}>
                                    <Text style={{...FONTS.Title1, textAlign: 'center', color: COLORS.WHITE}}>Your Archetype is</Text>
                                    {name ? (
                                        <Text style={[FONTS.HeroTitle, {textAlign: 'center', marginTop: 8, marginBottom: 16, color: COLORS.PURPLE}]}>
                                            &quot;{name}&quot;
                                        </Text>
                                    ) : null}
                                    {description ? (
                                        <Text style={[FONTS.paragraph1, {textAlign: 'center', marginBottom: 16, color: COLORS.WHITE}]}>
                                            {description}
                                        </Text>
                                    ) : null}
                                    <TouchableOpacity
                                        style={{backgroundColor: COLORS.PURPLE, borderRadius: 8, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, minHeight: 52}}
                                        onPress={goToPreferences}
                                        disabled={showLoader}>
                                        <Text style={{...FONTS.Title3, color: COLORS.WHITE, fontSize: 18, fontWeight: '600'}}>Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </>
                    )}
                </SafeAreaView>
            </ImageBackground>

            <Modal animationType="fade" transparent visible={showLoader}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}>
                    <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
                    <Text style={{...FONTS.Title3, color: COLORS.AKCRUBLUE, marginTop: 10}}>Analyzing Your Movie Taste...</Text>
                </View>
            </Modal>
        </View>
    );
};

export default FlickFlirtArchetypeResult;
