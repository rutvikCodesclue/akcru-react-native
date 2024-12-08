import {View, Image, Animated, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import {TouchableOpacity} from 'react-native-gesture-handler';
import styles from './styles';
import {getGalleryLikeCount, likeGalleryItem, unlikeGalleryItem} from '../../lib/api/user.lib';

type GalleryPicProps = {
    image: string;
};

const GalleryPic = ({image}: GalleryPicProps) => {
    const currentValue = new Animated.Value(1);
    const [likeImage, setlikeImage] = useState(false);
    const [likeCount, setLikeCount] = useState<number | null>(null);
    const [visible, setvisible] = useState(false);

    useEffect(() => {
        // Fetch the initial like count when the component mounts
        fetchLikeCount();
    }, []);

    const fetchLikeCount = async () => {
    try {
        const likeInfo = await getGalleryLikeCount(image);
        if (likeInfo.likeExists) {
            setlikeImage(true);
        } else {
            console.log('Image not liked');
            setlikeImage(false);
        }
        if (likeInfo.count !== undefined) {
            setLikeCount(likeInfo.count);
        }
    } catch (error) {
        console.error('Error fetching like count:', error);
        }
    };

    const likeUnlikeHandler = async () => {
    try {
        if (likeImage === false) {
            console.log('Liking the image.');
            if (likeCount != null) {
                let currLikeCount = likeCount + 1;
                setLikeCount(currLikeCount);
            }
            setlikeImage(!likeImage);
            setvisible(!visible);
            await likeGalleryItem(image);
            await fetchLikeCount();
        } else {
            console.log('Unliking the image.');
            if (likeCount != null) {
                let currLikeCount = likeCount - 1;
                setLikeCount(currLikeCount);
            }
            setlikeImage(!likeImage);
            await unlikeGalleryItem(image);
            await fetchLikeCount();
        }
    } catch (error) {
        console.error('Error during like/unlike operation:', error);
        }
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
                <TouchableOpacity onPress={likeUnlikeHandler}>
                    <Icon
                        type="ionicon"
                        name={likeImage ? 'happy' : 'happy-outline'}
                        color={COLORS.PURPLE}
                        size={30}
                    />
                </TouchableOpacity>
                <View>
                    <Text style={styles.count}>{likeCount !== null ? likeCount : 'Loading...'}</Text>
                </View>
            </View>
            <View style={styles.heartAnimation}>
                {visible && (
                    <Animated.View style={{transform: [{scale: currentValue}]}}>
                        <Icon name="happy" type="ionicon" color={COLORS.PURPLE} size={60} />
                    </Animated.View>
                )}
            </View>

            <Image source={{uri: image}} style={{width: '100%', height: '100%'}} resizeMode="cover" />
        </View>
    );
};

export default GalleryPic;
