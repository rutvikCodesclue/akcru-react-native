import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {COLORS, FONTS, SIZES} from '../../../../../assets/constants';
import {AUTH_TEXT_THEME} from '../../../../../assets/constants/authTheme';
import AkcruButtons from '../../../../components/akcruButtons';
import {navigate} from '../../../../util/RootNavigation';
import {isTablet} from '../../../../../assets/constants/theme';

const DiscoverArchetypeScreen = () => {
    const handleDiscover = () => {
        navigate('OnboardArchetypeStandalone');
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                style={styles.bgimage}
                source={require('../../../../../assets/images/intro_image.png')}
                resizeMode="cover">
                <LinearGradient
                    colors={['rgba(5,7,35,0.95)', 'rgba(8,8,52,0.45)', 'rgba(5,7,35,0.95)']}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView style={styles.safe}>

                    <View style={styles.mainColumn}>
                        <View style={styles.topBlock}>
                            <Text style={[AUTH_TEXT_THEME.highlight, styles.title]}>
                                Discover Your Archetype
                            </Text>
                        </View>
                        <View style={styles.spacer} />
                        <View style={styles.bottomBlock}>
                            <Text style={[styles.description, AUTH_TEXT_THEME.instruction]}>
                                Swipe through movies to reveal your archetype.
                            </Text>
                            <View style={styles.buttonWrap}>
                                <AkcruButtons.LrgButton
                                    variant="auth"
                                    color={COLORS.PURPLE}
                                    btnname="Get Started"
                                    onPress={handleDiscover}
                                />
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default DiscoverArchetypeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgimage: {
        flex: 1,
        height: SIZES.ScreenHeight,
    },
    safe: {
        flex: 1,
        paddingTop: SIZES.ScreenHeight * 0.02,
    },
    backButton: {
        padding: 8,
        alignSelf: 'flex-start',
        marginLeft: 4,
    },
    mainColumn: {
        flex: 1,
        paddingHorizontal: 24,
    },
    topBlock: {
        alignItems: 'center',
        paddingTop: isTablet() ? 24 : 12,
        paddingHorizontal: 8,
    },
    spacer: {
        flex: 1,
    },
    bottomBlock: {
        alignItems: 'center',
        paddingBottom: isTablet() ? 40 : 28,
        paddingHorizontal: 8,
    },
    /** fontSize 30; pink + base type from AUTH_TEXT_THEME.highlight (applied before this) */
    title: {
        fontSize: 25,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    description: {
        ...FONTS.paragraph1,
        textAlign: 'center',
        color: COLORS.LIGHTGREY,
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    buttonWrap: {
        alignItems: 'center',
        width: '100%',
    },
});
