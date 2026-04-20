import {View, Text, FlatList, Image} from 'react-native';
import categoryRowStyles from '../BasicListCategories/styles';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {ITrailer} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import HighlightMediaCard from '../HighlightMediaCard';
import imageindex from '../../../assets/images/imageindex';

const HIGHLIGHT_NAV_DELAY_MS = 130;

interface BasicSizzleCarouselProps {
    Akcru_Content: {
        id: string;
        title: string;
        sizzle: ITrailer[];
    };
    showTitleIcon?: boolean;
    titleIconUri?: string;
}

const BasicSizzleCarousel = (props: BasicSizzleCarouselProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {Akcru_Content, showTitleIcon = false, titleIconUri} = props;
    const [pressedSizzleId, setPressedSizzleId] = useState<string | null>(null);
    const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (navTimerRef.current) {
                clearTimeout(navTimerRef.current);
            }
        };
    }, []);

    const handleItemPress = (sizzle: ITrailer) => {
        if (navTimerRef.current) {
            clearTimeout(navTimerRef.current);
        }
        setPressedSizzleId(sizzle.id);
        navTimerRef.current = setTimeout(() => {
            navTimerRef.current = null;
            setPressedSizzleId(null);
            navigation.navigate('SizzleDetailScreen', {
                id: sizzle.id,
                sizzle: sizzle.title,
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
                data={Akcru_Content.sizzle}
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
                            active={pressedSizzleId === item.id}
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

export default BasicSizzleCarousel;
