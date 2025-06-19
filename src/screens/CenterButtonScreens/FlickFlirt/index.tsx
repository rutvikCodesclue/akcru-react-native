
import {ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, { useState } from 'react';

import imageindex from '../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import Header from '../../../components/header';
import {Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruButtonStackParams} from '../../../navigation/AkcruButtonStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import AkcruButtons from '../../../components/akcruButtons';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import { API } from '../../../clients/api.client';

type FlickFlirtScreenProps = {
    contentButtonName: string;
    preference: () => void;
};

const FlickFlirtScreen = ({contentButtonName, preference}: FlickFlirtScreenProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [hasMatches, setHasMatches] = useState(false);

    // On focus, check if user has any matches
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            API.get('v1/flickflirt/matches')
                .then(res => {
                    if (isActive && res.data.success) {
                        setHasMatches(Array.isArray(res.data.matches) && res.data.matches.length > 0);
                    }
                })
                .catch(console.error);
            return () => {
                isActive = false;
            };
        }, []),
    );
    return (
        <TabContainer>
            <View>
                <ImageBackground
                    source={imageindex.FLickFlirt}
                    resizeMode="cover"
                    style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                    <SafeAreaView>
                        <View>
                            <Header />
                        </View>
                        <BackButton navigation={navigation} />
                        <View style={{justifyContent: 'center', height: SIZES.ScreenHeight * 0.65}}>
                            <View style={styles.textcontainer}>
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>"Flick Flirt"</Text>
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
                                    btnname={'Open FlickFlirt'}
                                    onPress={() => navigation.navigate('FlickFlirtPref')}
                                    color={COLORS.PURPLE}
                                    disabled={false}
                                />
                            </View>
                            {/* Show this only if there are matches */}
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
                                    btnname={'Reset Preferences'}
                                    onPress={async () => {
                                        try {
                                            const res = await API.delete('v1/flickflirt/reset-preferences');
                                            if (res.data.success) {
                                                console.log('Preferences reset successfully');
                                            } else {
                                                console.error('Reset failed:', res.data.message);
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
