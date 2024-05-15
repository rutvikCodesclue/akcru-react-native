import {View, Text, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {FONTS} from '../../../assets/constants';
import styles from './styles';

interface Props {
    photo: string;
    genre: string;
    onPress: () => void;
}

const GenreCard: React.FC<Props> = ({photo, genre, onPress}) => {
    return (
        <View style={styles.genrecard}>
            <TouchableOpacity onPress={onPress}>
                <View>
                    <Image source={{uri: photo}} resizeMode="cover" style={styles.genrecard} />
                    <View style={styles.genrecardoverlay} />
                </View>
                <View
                    style={{
                        position: 'absolute',
                        top: '45%',
                        right: 0,
                        left: 0,
                    }}>
                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>{genre}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default GenreCard;
