import {View, Text, Image, TouchableOpacity} from 'react-native';
import React, {useMemo, useState} from 'react';
import {FONTS} from '../../../assets/constants';
import styles from './styles';
import { DEFAULT_GENRE_IMAGE } from '../../../assets/constants/Data';

interface Props {
    image?: string; // make optional
    genre: string;
    onPress: () => void;
}

const GenreCard: React.FC<Props> = ({image, genre, onPress}) => {
    const [failed, setFailed] = useState(false);

    // choose a safe src: use image if non-empty string and not failed, else placeholder
    const src = useMemo(() => {
        const hasUri = typeof image === 'string' && image.trim().length > 0 && !failed;
        return {uri: hasUri ? image! : DEFAULT_GENRE_IMAGE};
    }, [image, failed]);

    return (
        <View style={styles.genrecard}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <View>
                    <Image
                        source={src}
                        resizeMode="cover"
                        style={styles.genrecard}
                        onError={() => setFailed(true)} // swap to placeholder if load fails
                        defaultSource={
                            // (optional) iOS-only local fallback; remove if you don't have it
                            // require('../../../assets/placeholder-genre.png')
                            undefined as any
                        }
                    />
                    <View style={styles.genrecardoverlay} />
                </View>
                <View style={{position: 'absolute', top: '45%', right: 0, left: 0}}>
                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>{genre}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default GenreCard;
