import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';

type BasicMovieCardProps = {
    image: string;
    onPress: () => void;
};

const BasicMovieCard = ({image, onPress}: BasicMovieCardProps) => {
    return (
        <View style={styles.cardWrap}>
            <TouchableOpacity onPress={onPress}>
                <View>
                    <Image
                        source={{
                            uri: image,
                        }}
                        style={styles.poster}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardWrap: {
        marginHorizontal: 4,
    },
    poster: {
        width: 115,
        height: 170,
        borderRadius: 5,
    },
});

export default BasicMovieCard;
