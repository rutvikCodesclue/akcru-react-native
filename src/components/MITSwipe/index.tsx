import React, {useState} from 'react';
import {View, Text, PanResponder, Animated, Dimensions} from 'react-native';
import styles from './styles';
import {COLORS} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../navigation/UserProfileStack';
import {Icon} from '@rneui/base';
import {AkcruControlBtn} from '../../../assets/svg';
import {MULTISIZES} from '../../../assets/constants/theme';

const {width} = Dimensions.get('window');
const MAX_SWIPE_DISTANCE = width / 6;

type MITSwipeProps = {
    decline: any;
    accept: any;
};

const MITSwipe = ({decline, accept}: MITSwipeProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const [swipeValue] = useState(new Animated.Value(0));

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
            const clampedDx = Math.max(-MAX_SWIPE_DISTANCE, Math.min(MAX_SWIPE_DISTANCE, gesture.dx));
            swipeValue.setValue(clampedDx);
        },
        onPanResponderRelease: (event, gesture) => {
            if (gesture.dx > 50) {
                Animated.timing(swipeValue, {
                    toValue: MAX_SWIPE_DISTANCE,
                    duration: 400,
                    useNativeDriver: false,
                }).start(() => accept());
            } else if (gesture.dx < -50) {
                Animated.timing(swipeValue, {
                    toValue: -MAX_SWIPE_DISTANCE,
                    duration: 400,
                    useNativeDriver: false,
                }).start(() => {
                    decline();
                });
            } else {
                Animated.timing(swipeValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const animatedStyle = {
        transform: [{translateX: swipeValue}],
    };

    return (
        <View>
            <View style={styles.container}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.decline}>DECLINE </Text>
                    <Icon name="chevron-back" type="ionicon" size={MULTISIZES.Xlarge28} color={COLORS.DARKERGREY} />
                    <Icon name="chevron-back" type="ionicon" size={MULTISIZES.Xlarge28} color={COLORS.DARKERGREY} />
                </View>

                <Animated.View style={[styles.buttonContainer, animatedStyle]} {...panResponder.panHandlers}>
                    <AkcruControlBtn />
                </Animated.View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="chevron-forward" type="ionicon" size={MULTISIZES.Xlarge28} color={COLORS.DARKERGREY} />
                    <Icon name="chevron-forward" type="ionicon" size={MULTISIZES.Xlarge28} color={COLORS.DARKERGREY} />
                    <Text style={styles.accept}>ACCEPT</Text>
                </View>
            </View>
        </View>
    );
};

export default MITSwipe;
