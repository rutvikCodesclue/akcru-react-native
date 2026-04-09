import {View, Text, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import {isTablet} from '../../../assets/constants/theme';

type BackButtonProps = {
    navigation: any;
    /** When set, called instead of default pop / home navigation */
    onBack?: () => void;
    /** Merged with default wrapper (e.g. absolute overlay + marginTop: 0) */
    containerStyle?: StyleProp<ViewStyle>;
};

const BackButton = ({navigation, onBack, containerStyle}: BackButtonProps) => {
    const [isNavigating, setIsNavigating] = useState(false);

    const handleBackPress = () => {
        if (isNavigating) return;
        setIsNavigating(true);

        if (onBack) {
            onBack();
        } else if (navigation.getState().routes.length > 1) {
            navigation.pop();
        } else {
            navigation.navigate('NoBottomStack', { screen: 'ClientTabNavigator' });
        }

        setTimeout(() => {
            setIsNavigating(false);
        }, 300);
    };

    return (
        <View style={[styles.backbutton, containerStyle]}>
            <TouchableOpacity onPress={handleBackPress} style={styles.box}>
                <View style={styles.flexCenter}>
                    <Icon name="chevron-back" type="ionicon" size={isTablet() ? 30 : 20} color={COLORS.LIGHTGREY} />
                    <Text style={styles.fontstyle}>Back</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default BackButton;
