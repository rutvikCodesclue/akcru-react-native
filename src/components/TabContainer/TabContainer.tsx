import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {UseTabMenu} from '../../context/TabContext';
import { COLORS } from '../../../assets/constants';

const TabContainer = ({children}) => {
    const {opened} = UseTabMenu();

    

    const animation = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        console.log('Tab Container');
        Animated.timing(animation, {
            toValue: opened ? 1 : 0,
            duration: 300,
            friction: 2,
            useNativeDriver: false,
        }).start();
    }, [opened, animation]);

    return (
        <View style={styles.container}>
            {children}
            {opened && (
                <Animated.View
                    style={[
                        styles.overlay,
                        {
                            backgroundColor: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['transparent', COLORS.BLACK],
                            }),
                        },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        opacity: 0.7,
    },
});

export default TabContainer;
