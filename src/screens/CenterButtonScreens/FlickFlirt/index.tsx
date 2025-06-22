import React, {useState, useCallback} from 'react';
import {ImageBackground, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import imageindex from '../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import Header from '../../../components/header';
import BackButton from '../../../components/General/backbutton';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {API} from '../../../clients/api.client';

const FlickFlirtScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [hasMatches, setHasMatches] = useState(false);

    // Fetch match status and guard against different API return shapes
    const fetchMatches = useCallback(async () => {
        try {
            const response = await API.get('/v1/flickflirt/matches');
            // Handle Axios style (response.data) or direct-data style
            const payload = response?.data ?? response;
            const success = payload.success;
            const matches = payload.matches;

            if (typeof success === 'boolean') {
                setHasMatches(success && Array.isArray(matches) && matches.length > 0);
            } else {
                setHasMatches(false);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            setHasMatches(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMatches();
        }, [fetchMatches]),
    );

    return (
        <TabContainer>
            <View>
                <ImageBackground
                    source={imageindex.FLickFlirt}
                    resizeMode="cover"
                    style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                    <SafeAreaView>
                        <Header />
                        <BackButton navigation={navigation} />
                        <View style={{justifyContent: 'center', height: SIZES.ScreenHeight * 0.65}}>
                            <View style={styles.textcontainer}>
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>Flick Flirt</Text>
                                <Text style={[styles.title, {color: COLORS.PINK, marginBottom: 15}]}>
                                    Elevate Your Movie Nights with a Dash of Romance!
                                </Text>
                                <Text style={styles.paragraph}>
                                    Welcome to Flick Flirt, the charming and playful side of Akcru designed to bring a
                                    touch of romance to your cinematic experiences. Flick Flirt is not just about
                                    watching movies; it's about connecting with someone special over shared film
                                    interests.
                                </Text>
                            </View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.XlLrgButton
                                    btnname="Open FlickFlirt"
                                    onPress={() => navigation.navigate('FlickFlirtPref')}
                                    color={COLORS.PURPLE}
                                />
                            </View>

                            {hasMatches && (
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.XlLrgButton
                                        btnname="You Have Matches"
                                        onPress={() => navigation.navigate('FlickFlirtMatches')}
                                        color={COLORS.PURPLE}
                                    />
                                </View>
                            )}

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.XlLrgButton
                                    btnname="Reset Preferences"
                                    onPress={async () => {
                                        try {
                                            const res = await API.delete('/v1/flickflirt/reset-preferences');
                                            const payload = res?.data ?? res;
                                            if (payload.success) {
                                                console.log('Preferences reset successfully');
                                                await fetchMatches();
                                            } else {
                                                console.error('Reset failed:', payload.message);
                                            }
                                        } catch (error) {
                                            console.error('Error resetting preferences:', error);
                                        }
                                    }}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>
        </TabContainer>
    );
};

export default FlickFlirtScreen;

const styles = StyleSheet.create({
    title: {
        ...FONTS.Title3,
        textAlign: 'center',
    },
    textcontainer: {
        backgroundColor: COLORS.TRANSPURPLGT,
        alignSelf: 'center',
        width: SIZES.ScreenWidth * 0.93,
        padding: 15,
        borderRadius: 5,
    },
    paragraph: {
        ...FONTS.Title2,
        fontSize: 12,
        textAlign: 'center',
    },
});
