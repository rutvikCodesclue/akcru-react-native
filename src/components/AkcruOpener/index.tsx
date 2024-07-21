import {StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS, SIZES} from '../../../assets/constants/theme';
import LottieView from 'lottie-react-native';
import Video from 'react-native-video';

type AkcruOpenerProps = {
    onAnimationFinish: () => void;
};

const AkcruOpener = ({onAnimationFinish}: AkcruOpenerProps) => {
    return (
        <View style={styles.activitycontainer}>
            <Video source={require('../../../assets/sounds/akcrusound1.mp3')} repeat={false} />
            <LottieView
                source={require('../../../assets/lottie/Akcruopener1.json')}
                autoPlay
                loop={false}
                style={{width: SIZES.ScreenHeight, height: SIZES.ScreenWidth}}
                onAnimationFinish={onAnimationFinish}
            />
        </View>
    );
};

export default AkcruOpener;

const styles = StyleSheet.create({
    activitycontainer: {
        backgroundColor: COLORS.BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
