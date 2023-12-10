import {Animated, Image, Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import React, { useState } from 'react';
import {AkcruControlBtn} from '../../../assets/svg';
import {TouchableOpacity} from 'react-native-gesture-handler';
import imageindex from '../../../assets/images/imageindex';
import { Icon } from '@rneui/base';
import { COLORS, FONTS } from '../../../assets/constants';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../navigation/CrummunityStack';
import {useNavigation} from '@react-navigation/native';
import { ClientStackParams } from '../../navigation/ClientStack';
import { AkcruButtonStackParams } from '../../navigation/AkcruButtonStack';



const AkcruCenterButton = ({opened, toggleOpened}) => {
    const animation = React.useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<NativeStackNavigationProp<AkcruButtonStackParams>>();

    console.log('Akcru Button opened:', opened); // Check if this log is showing in the console

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
    }

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
                                            outputRange: [0, 5],
                                        }),
                                    },
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -200],
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
                                            outputRange: [0, 5],
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
                                            outputRange: [0, 5],
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
                                zIndex: opened ? 0 : 1, // Adjust the zIndex based on the opened state
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
}

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
