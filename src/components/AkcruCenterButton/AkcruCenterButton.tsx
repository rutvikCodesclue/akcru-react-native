import {Animated, Pressable, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import React from 'react';
import {AkcruControlBtn} from '../../../assets/svg';
import {Icon} from '@rneui/base';
import {COLORS} from '../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {AkcruButtonStackParams} from '../../navigation/AkcruButtonStack';
import {isTablet} from '../../../assets/constants/theme';

import SatelliteAuthHex from './SatelliteAuthHex';

const HEX_ASPECT = 234 / 270;

const AkcruCenterButton: React.FC<{opened: any; toggleOpened: () => void}> = ({opened, toggleOpened}) => {
    const animation = React.useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();

    const centerButtonLift = isTablet() ? -40 : -28;
    const iconSize = isTablet() ? 32 : 25;
    const satelliteHexW = isTablet() ? 75 : 60;
    const satelliteHexH = satelliteHexW * HEX_ASPECT;

    const handlePressShop = () => {
        navigation.navigate('AkcruButtonStack', {screen: 'PurchaseAdScreen'});
        toggleOpened();
        console.log('handlePressShop');
    };
    // new
    const handlePressWorld = () => {
        navigation.navigate('AkcruButtonStack', {
            screen: 'CrusaderScreen',
        });
        toggleOpened();
    };
    const handlePressCalendar = () => {
        navigation.navigate('AkcruButtonStack', {
            screen: 'VisionaryRooms',
        });
        toggleOpened();
    };

    const handlePressCenterButton = () => {
        toggleOpened();
        console.log('handlePressCenterButton');
    };

    React.useEffect(() => {
        Animated.timing(animation, {
            toValue: opened ? 1 : 0,
            duration: 300,
            friction: 2,
            useNativeDriver: false,
        }).start();
    }, [opened, animation]);

    const opacity = {
        opacity: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        }),
    };

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Pressable onPressIn={handlePressCalendar}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, isTablet() ? -108 : -78],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -90],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <View style={styles.satelliteStack}>
                            <SatelliteAuthHex width={satelliteHexW} height={satelliteHexH} />
                            <View style={styles.satelliteIconOverlay} pointerEvents="none">
                                <Icon
                                    name="calendar"
                                    type="material-community"
                                    color={COLORS.WHITE}
                                    size={iconSize}
                                    style={styles.itemIcon}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressShop}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 8],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, isTablet() ? -180 : -150],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <View style={styles.satelliteStack}>
                            <SatelliteAuthHex width={satelliteHexW} height={satelliteHexH} />
                            <View style={styles.satelliteIconOverlay} pointerEvents="none">
                                <Icon
                                    name="store"
                                    type="material-community"
                                    color={COLORS.WHITE}
                                    size={iconSize}
                                    style={styles.itemIcon}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressWorld}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, isTablet() ? 120 : 90],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -90],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <View style={styles.satelliteStack}>
                            <SatelliteAuthHex width={satelliteHexW} height={satelliteHexH} />
                            <View style={styles.satelliteIconOverlay} pointerEvents="none">
                                <Icon
                                    name="earth"
                                    type="material-community"
                                    color={COLORS.WHITE}
                                    size={iconSize}
                                    style={styles.itemIcon}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </Pressable>
                <TouchableWithoutFeedback onPressIn={handlePressCenterButton}>
                    <Animated.View
                        style={[
                            {
                                zIndex: opened ? 0 : 1,
                                transform: [
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, centerButtonLift],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        {isTablet() ? <AkcruControlBtn width={90} height={90} /> : <AkcruControlBtn />}
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        overflow: 'visible',
    },
    box: {
        position: 'relative',
        width: 70,
        height: 60,
        marginTop: -3,
        overflow: 'visible',
    },
    item: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: isTablet() ? 75 : 60,
        height: isTablet() ? 75 : 60,
    },
    satelliteStack: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    satelliteIconOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemIcon: {
        marginBottom: 5,
    },
});

export default AkcruCenterButton;
