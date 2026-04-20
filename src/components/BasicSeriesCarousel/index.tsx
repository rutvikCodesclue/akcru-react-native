import {View, Text, FlatList, Image} from 'react-native';
import categoryRowStyles from '../BasicListCategories/styles';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {ISeries} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import HighlightMediaCard from '../HighlightMediaCard';
import imageindex from '../../../assets/images/imageindex';

const HIGHLIGHT_NAV_DELAY_MS = 130;

interface BasicSeriesCarouselProps {
    Akcru_Content: {
        id: string;
        title: string;
        series: ISeries[];
    };
    showTitleIcon?: boolean;
    titleIconUri?: string;
}

const BasicSeriesCarousel = (props: BasicSeriesCarouselProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {Akcru_Content, showTitleIcon = false, titleIconUri} = props;
    const [pressedSeriesId, setPressedSeriesId] = useState<string | null>(null);
    const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (navTimerRef.current) {
                clearTimeout(navTimerRef.current);
            }
        };
    }, []);

    const handleItemPress = (series: ISeries) => {
        if (navTimerRef.current) {
            clearTimeout(navTimerRef.current);
        }
        setPressedSeriesId(series.id);
        navTimerRef.current = setTimeout(() => {
            navTimerRef.current = null;
            setPressedSeriesId(null);
            navigation.navigate('SeriesDetailScreen', {
                id: series.id,
                series: series.title,
                episodes: series.episodes,
            });
        }, HIGHLIGHT_NAV_DELAY_MS);
    };

    return (
        <View style={categoryRowStyles.featuredSectionContainer}>
            {showTitleIcon ? (
                <View style={categoryRowStyles.homeSectionTitleRow}>
                    <Image source={titleIconUri ? {uri: titleIconUri} : imageindex.AkcruHexLogo} style={categoryRowStyles.homeSectionTitleIcon} resizeMode="contain" />
                    <Text style={categoryRowStyles.homeSectionTitle}>{Akcru_Content.title}</Text>
                </View>
            ) : (
                <Text style={categoryRowStyles.homeSectionTitle}>{Akcru_Content.title}</Text>
            )}
            <FlatList
                data={Akcru_Content.series}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={{
                    ...categoryRowStyles.featuredListContainer,
                    paddingHorizontal: '2%',
                }}
                renderItem={({item}) => (
                    <View style={categoryRowStyles.highlightCardWrap}>
                        <HighlightMediaCard
                            active={pressedSeriesId === item.id}
                            uri={item.portraitURL}
                            imageStyle={categoryRowStyles.featuredPoster}
                            onPress={() => handleItemPress(item)}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default BasicSeriesCarousel;
