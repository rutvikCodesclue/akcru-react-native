import {View, Text, ImageBackground, KeyboardAvoidingView, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {Icon} from '@rneui/base';
import React from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import { isTablet } from '../../../../assets/constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const OnboardBuildCru = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const handleNavigateToSwipe = () => {
        navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
    };

    const handleNavigateCruBuilder = () => {
        navigation.navigate('OnboardCruBuilder');
    };

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                          <LinearGradient
                                            colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                                            style={StyleSheet.absoluteFill}
                                        />
                <View style={{flex: 1, marginBottom: 50}}>
                    <ScrollView contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 24,
                    }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                            </TouchableOpacity>
                            <View style={styles.logoCenter}>
                                <AkcruLogo width={isTablet() ? 300 : 200} height={isTablet() ? 90 : 60} />
                            </View>
                            <View style={[styles.backButton, {opacity: 0}]}>
                                <Icon name="chevron-back" type="ionicon" size={isTablet() ? 28 : 20} color={COLORS.LIGHTGREY} />
                            </View>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <Text style={[FONTS.Title2, {textAlign: 'center', marginTop: 8, paddingHorizontal: 16}]}>
                                Last but not least our goal here at Akcru is to bring people together in a safe setting.
                                Here is where you can start building your "Cru" that you'll be able to watch your
                                favorite content with. (You will have the option to do this later if you decide to skip
                                this).
                            </Text>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <TouchableOpacity onPress={() => handleNavigateCruBuilder()}>
                                <Text style={[FONTS.Title2, {color: COLORS.PINK, paddingTop: SIZES.ScreenHeight * 0.1}]}>
                                    Start building your Cru
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleNavigateToSwipe()}>
                                <Text style={[FONTS.Title2, {color: COLORS.PINK, paddingTop: SIZES.ScreenHeight * 0.025}]}>
                                    Skip to watch content
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    </ScrollView>
                </View>
            </ImageBackground>
        </View>
    );
};

export default OnboardBuildCru;
