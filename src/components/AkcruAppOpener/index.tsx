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
                style={{
                    width: '100%',
                    height: '100%',
                }}
                source={require('../../../assets/video/AkcruLogoOpener_NoBkcd.mp4')}
                repeat={false}
                resizeMode="cover"
                onEnd={onAnimationFinish}
                onError={onAnimationFinish}
            />
        </View>
    );
};

export default AkcruAppOpener;

const styles = StyleSheet.create({
    activitycontainer: {
        backgroundColor: COLORS.BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
