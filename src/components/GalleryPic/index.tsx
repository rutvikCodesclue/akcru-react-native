import {View, Image, Animated, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import {TouchableOpacity} from 'react-native-gesture-handler';
import styles from './styles';

type GalleryPicProps = {
    image: string;
};

const GalleryPic = ({image}: GalleryPicProps) => {
    const index2 = 10;

    const currentValue = new Animated.Value(1);

    const [likeImage, setlikeImage] = useState(false);
    const [counter, setcounter] = useState(-2);
    const [visible, setvisible] = useState(false);

    const likeHandler = () => {
        if (likeImage == false) {
            setvisible(true);
        }

        setlikeImage(!likeImage);
        setcounter(index2);
    };

    useEffect(() => {
        if (likeImage == true) {
            Animated.spring(currentValue, {
                useNativeDriver: true,
                toValue: 3,
                friction: 2,
            }).start(() => {
                Animated.spring(currentValue, {
                    useNativeDriver: true,
                    toValue: 1,
                    friction: 2,
                }).start(() => {
                    setvisible(false);
                });
            });
        }
    }, [likeImage]);

    return (
        <View style={styles.pictureFrame}>
            <View style={styles.floatingicon}>
                <TouchableOpacity onPress={likeHandler}>
                    <Icon
                        type="material-community"
                        name={likeImage && index2 == counter ? 'heart' : 'heart-outline'}
                        color={COLORS.PINK}
                        size={30}
                    />
                </TouchableOpacity>
                <View>
                    <Text style={styles.count}>0</Text>
                </View>
            </View>
            <View style={styles.heartAnimation}>
                {visible && index2 == counter && (
                    <Animated.View style={{transform: [{scale: currentValue}]}}>
                        <Icon name="heart" type="material-community" color={COLORS.PINK} size={60} />
                    </Animated.View>
                )}
            </View>

            <Image
                source={{uri: image}}
                style={{width: SIZES.ScreenWidth * 0.9, height: SIZES.ScreenHeight * 0.5}}
                resizeMode="cover"
            />
        </View>
    );
};

export default GalleryPic;
