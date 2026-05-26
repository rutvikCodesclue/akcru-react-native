import {View, Image} from 'react-native';
import React from 'react';
import styles from './styles';

type GalleryPicProps = {
    image: string;
};

const GalleryPic = ({image}: GalleryPicProps) => {
    return (
        <View style={styles.pictureFrame}>
            <Image source={{uri: image}} style={{width: '100%', height: '100%'}} resizeMode="contain" />
        </View>
    );
};

export default GalleryPic;
