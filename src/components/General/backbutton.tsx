import {View, Text, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';
import {COLORS} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';

const BackButton = ({ navigation }: Props) => {
    const [isNavigating, setIsNavigating] = useState(false);

    const handleBackPress = () => {
        if (isNavigating) return;
        setIsNavigating(true);

        if (navigation.getState().routes.length > 1) {
            navigation.pop();
        } else {
            navigation.navigate('NoBottomStack', { screen: 'ClientTabNavigator' });
        }

        setTimeout(() => {
            setIsNavigating(false);
        }, 300);
    };

    return (
        <View style={styles.backbutton}>
            <TouchableOpacity onPress={handleBackPress} style={styles.box}>
                <View style={styles.flexCenter}>
                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                    <Text style={styles.fontstyle}>Back</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default BackButton;
