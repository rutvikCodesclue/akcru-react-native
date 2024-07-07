import {View, Text, ImageBackground, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {appVersion} from '../../../../assets/constants/Data';
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
                    colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: SIZES.ScreenHeight,
                    }}
                />
                <View style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Last but not least our goal here at Akcru is to bring people together in a safe setting.
                                Here is where you can start building your "Cru" that you'll be able to watch your
                                favorite content with. (You will have the option to do this later if you decide to skip
                                this).
                            </Text>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <TouchableOpacity onPress={() => handleNavigateCruBuilder()}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        paddingTop: SIZES.ScreenHeight * 0.1,
                                        color: COLORS.PINK,
                                    }}>
                                    Start building your Cru
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleNavigateToSwipe()}>
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        paddingTop: SIZES.ScreenHeight * 0.025,
                                        color: COLORS.PINK,
                                    }}>
                                    Skip to watch content
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

export default OnboardBuildCru;
