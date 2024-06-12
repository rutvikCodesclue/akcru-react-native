import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from './styles';
import {FONTS} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {ITrailer} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';

interface BasicSizzleCarouselProps {
    Akcru_Content: {
        id: string;
        title: string;
        sizzle: ITrailer[];
    };
}

const BasicSizzleCarousel = (props: BasicSizzleCarouselProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {Akcru_Content} = props;

    return (
        <>
            <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
            <FlatList
                data={Akcru_Content.sizzle}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('sizzle:', item.title);
                                navigation.navigate('SizzleDetailScreen', {
                                    id: item.id,
                                    sizzle: item.title,
                                });
                            }}>
                            <Image source={{uri: item.portraitURL}} style={styles.poster} />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </>
    );
};

export default BasicSizzleCarousel;
