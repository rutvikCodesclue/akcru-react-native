// src/screens/FlickFlirtMatches.tsx

import React, {useState} from 'react';
import {View, Text, SafeAreaView, FlatList, ImageBackground, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../../navigation/NoBottomTabStack';
import LinearGradient from 'react-native-linear-gradient';
import imageindex from '../../../../../assets/images/imageindex';
import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import Header from '../../../../components/header';
import BackButton from '../../../../components/General/backbutton';
import {API} from '../../../../clients/api.client';
import AkcruButtons from '../../../../components/akcruButtons';
import FlickFlirtMatchCard from '../../../../components/FlickFlirtMatchCard';
import {IUserProfile} from '../../../../../types';

const FlickFlirtMatches = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const [matches, setMatches] = useState<IUserProfile[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            let active = true;
            API.get('v1/flickflirt/matches')
                .then(res => {
                    if (active && res.data.success) {
                        setMatches(res.data.matches);
                    }
                })
                .catch(console.error);
            return () => {
                active = false;
            };
        }, []),
    );

    return (
        <View style={{flex: 1}}>
            <ImageBackground source={imageindex.FLickFlirt} resizeMode="cover" style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <LinearGradient
                        colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={StyleSheet.absoluteFill}
                    />

                    <Header />
                    <BackButton navigation={navigation} />

                    <View style={styles.content}>
                        {matches.length > 0 ? (
                            <>
                                <FlatList
                                    data={matches}
                                    numColumns={2}
                                    keyExtractor={item => item.id}
                                    ListHeaderComponent={() => <Text style={styles.headerText}>Your Matches</Text>}
                                    renderItem={({item}) => (
                                        <View style={styles.cardWrapper}>
                                            <FlickFlirtMatchCard
                                                userPicture={item.profilePicture}
                                                userName={item.username}
                                                onPress={() => navigation.navigate('ViewUserScreen', {userID: item.id})}
                                                influencer={false}
                                                akcruBadge={item.badge}
                                                userDesc={item.description}
                                                matchLabel={item.matchLabel}
                                            />
                                        </View>
                                    )}
                                />
                            </>
                        ) : (
                            <View style={styles.noMatchWrapper}>
                                <Text style={styles.noMatchText}>You have no matches.</Text>
                                <AkcruButtons.XlLrgButton
                                    btnname="Start Over"
                                    onPress={() => navigation.navigate('FlickFlirtPref')}
                                    color={COLORS.PURPLE}
                                />
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default FlickFlirtMatches;

const styles = StyleSheet.create({
    background: {
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight,
    },
    container: {
        flex: 1,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        ...FONTS.Title3,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        marginBottom: 10,
    },
    cardWrapper: {
        margin: 5,
    },
    buttonWrapper: {
        marginTop: 20,
        alignSelf: 'center',
    },
    noMatchWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noMatchText: {
        ...FONTS.Title3,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        marginBottom: 20,
    },
});
