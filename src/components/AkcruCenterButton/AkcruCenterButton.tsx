import {Animated, Image, Pressable, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import React from 'react';
import {AkcruControlBtn} from '../../../assets/svg';
import imageindex from '../../../assets/images/imageindex';
import {Icon} from '@rneui/base';
import {COLORS} from '../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {AkcruButtonStackParams} from '../../navigation/AkcruButtonStack';

const AkcruCenterButton: React.FC<{opened: any; toggleOpened: () => void}> = ({opened, toggleOpened}) => {
    const animation = React.useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();

    const handlePressShop = () => {
        navigation.navigate('PurchaseMITScreen');
        toggleOpened();
        console.log('handlePressShop');
    };
    const handlePressRobot = () => {
        navigation.navigate('FlickFlirtScreen');
        toggleOpened();
        console.log('handlePressRobot');
    };
    const handlePressBullhorn = () => {
        navigation.navigate('AkcruNetworkScreen');
        toggleOpened();
        console.log('handlePressBullhorn');
    };

    const handlePressCenterButton = () => {
        toggleOpened();
        console.log('handlePressCenterButton');
    };
    const handlePressAwards = () => {
        navigation.navigate('AwardScreen');
        toggleOpened();
        console.log('handlePressAwards');
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
                <Pressable onPressIn={handlePressAwards}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -40],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -140],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="shield-crown"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={25}
                            style={styles.itemIcon}
                        />
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressRobot}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 50],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -140],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="robot-love"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={25}
                            style={styles.itemIcon}
                        />
                    </Animated.View>
                </Pressable>
                <Pressable onPressIn={handlePressBullhorn}>
                    <Animated.View
                        style={[
                            styles.item,
                            opacity,
                            {
                                transform: [
                                    {
                                        translateX: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -90],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -85],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="bullhorn"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={25}
                            style={styles.itemIcon}
                        />
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
                                            outputRange: [0, 100],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -85],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <Image source={imageindex.AkcruHexBlank} resizeMode="contain" style={styles.item} />
                        <Icon
                            name="store"
                            type="material-community"
                            color={COLORS.WHITE}
                            size={25}
                            style={styles.itemIcon}
                        />
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
                                            outputRange: [0, -28],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <AkcruControlBtn />
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
    },
    box: {
        position: 'relative',
        width: 70,
        height: 60,
        marginTop: -3,
    },
    item: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    itemIcon: {
        marginBottom: 5,
    },
});

export default AkcruCenterButton;
