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
        console.log('Checking like count...');
        const likeInfo = await getGalleryLikeCount(image);
        console.log('Number of likes: ', likeInfo.count);
        if(likeInfo.likeExists){
            console.log('Image already liked');
            setlikeImage(true);
        }
        else{
            console.log('Image not liked');
            setlikeImage(false);
        }
        if (likeInfo.count !== undefined) {
            setLikeCount(likeInfo.count);
        }
    };

    const likeUnlikeHandler = async () => {
        if (likeImage === false) {
            console.log('Liking the image.');
            if (likeCount != null){
                let currLikeCount = likeCount + 1;
                setLikeCount(currLikeCount);
            }
            setlikeImage(!likeImage);
            setvisible(!visible);
            await likeGalleryItem(image);
            await fetchLikeCount();
        }

        else{
            console.log('Unliking the image.');
            if (likeCount != null){
                let currLikeCount = likeCount - 1;
                setLikeCount(currLikeCount);
            }
            setlikeImage(!likeImage);
            await unlikeGalleryItem(image);
            await fetchLikeCount();
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
                        type="material-community"
                        name={likeImage ? 'heart' : 'heart-outline'}
                        color={COLORS.PINK}
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
