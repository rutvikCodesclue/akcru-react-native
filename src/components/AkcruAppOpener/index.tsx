import {StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../../assets/constants/theme';
import Video from 'react-native-video';

type AkcruOpenerProps = {
    onAnimationFinish: () => void;
};

const AkcruAppOpener = ({onAnimationFinish}: AkcruOpenerProps) => {
    return (
        <View style={styles.activitycontainer}>
            <Video
                style={styles.video}
                source={require('../../../assets/video/AkcruLogoOpener_NoBkcd.mp4')}
                repeat={false}
                resizeMode="cover"
                onEnd={onAnimationFinish}
                onError={(err) => {
                    // On Android, video can fail to decode; don't hide opener immediately
                    console.warn('AkcruAppOpener video error (may be Android codec):', err);
                }}
            />
        </View>
    );
};

export default AkcruAppOpener;

const styles = StyleSheet.create({
    activitycontainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.BLACK,
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
});
