import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from './styles';
import {FONTS} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {ISeries} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';

interface BasicSeriesCarouselProps {
    Akcru_Content: {
        id: string;
        title: string;
        series: ISeries[];
    };
}

const BasicSeriesCarousel = (props: BasicSeriesCarouselProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {Akcru_Content} = props;

    return (
        <>
            <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
            <FlatList
                data={Akcru_Content.series}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('series:', item.title);
                                navigation.navigate('SeriesDetailScreen', {
                                    id: item.id,
                                    series: item.title,
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

export default BasicSeriesCarousel;
