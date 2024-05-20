import {ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import TabContainer from '../../../components/TabContainer/TabContainer';
import Header from '../../../components/header';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import imageindex from '../../../../assets/images/imageindex';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AkcruButtonStackParams} from '../../../navigation/AkcruButtonStack';
import {Icon} from '@rneui/base';
import BackButton from '../../../components/General/backbutton';

const AkcruNetworkScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();
    return (
        <TabContainer>
            <View>
                <ImageBackground
                    source={imageindex.Akcrunetwork2}
                    resizeMode="cover"
                    style={{width: SIZES.ScreenWidth, height: SIZES.ScreenHeight}}>
                    <SafeAreaView>
                        <View>
                            <Header />
                        </View>
                        <BackButton navigation={navigation} />
                        <View style={{justifyContent: 'center', marginTop: '10%'}}>
                            <View style={styles.textcontainer}>
                                <Text style={[styles.title, {color: COLORS.LIGHTGREY}]}>"Akcru Network"</Text>
                                <Text style={[styles.title, {color: COLORS.PINK, marginBottom: 15}]}>
                                    Connecting Users to the Pulse of Akcru
                                </Text>
                                <Text style={styles.paragraph}>
                                    The Akcru Network stands as a revolutionary feature within the Akcru app, designed
                                    to establish a direct line of communication from the Akcru admin to every user on
                                    the platform. This feature ensures that users are promptly informed about crucial
                                    updates, community events, celebrity interviews, new releases, private screenings,
                                    and various other exciting events happening both on and offline.
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>
        </TabContainer>
    );
};

export default AkcruNetworkScreen;

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
