import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import Header from '../../../components/header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruButtonStackParams} from '../../../navigation/AkcruButtonStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';

const AwardScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
    return (
        <TabContainer>
            <View>
                <SafeAreaView>
                    <View>
                        <Header />
                    </View>
                    <BackButton navigation={navigation} />
                    <View style={{justifyContent: 'center', height: SIZES.ScreenHeight * 0.65}}>
                        <View style={styles.textcontainer}>
                            <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>"Trophies"</Text>
                            <Text style={[styles.title, {color: COLORS.PINK, marginBottom: 15}]}>
                                Awards that are locked and the ones you need to unlock
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </TabContainer>
    );
};

export default AwardScreen;

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
