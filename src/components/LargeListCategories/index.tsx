import {View, Text, FlatList, Image} from 'react-native';
import styles from './styles';
import categoryRowStyles from '../BasicListCategories/styles';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React, {useEffect, useRef, useState} from 'react';
import {IMovie} from '../../../types';
import HighlightMediaCard from '../HighlightMediaCard';
import imageindex from '../../../assets/images/imageindex';

const HIGHLIGHT_NAV_DELAY_MS = 130;

interface LargeListCategoriesProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[];
    };
    showTitleIcon?: boolean;
    titleIconUri?: string;
}

const LargeListCategories = (props: LargeListCategoriesProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
    const {Akcru_Content, showTitleIcon = false, titleIconUri} = props;
    const titleIconSource = titleIconUri ? {uri: titleIconUri} : imageindex.AkcruHexLogo;
    const [pressedMovieId, setPressedMovieId] = useState<string | null>(null);
    const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (navTimerRef.current) {
                clearTimeout(navTimerRef.current);
            }
        };
    }, []);

    const handleItemPress = (movie: IMovie) => {
        if (navTimerRef.current) {
            clearTimeout(navTimerRef.current);
        }
        setPressedMovieId(movie.id);
        navTimerRef.current = setTimeout(() => {
            navTimerRef.current = null;
            setPressedMovieId(null);
            navigation.navigate('ContentDetailScreen', {id: movie.id, movie: movie.id});
        }, HIGHLIGHT_NAV_DELAY_MS);
    };

    return (
        <View style={categoryRowStyles.featuredSectionContainer}>
            {showTitleIcon ? (
                <View style={categoryRowStyles.homeSectionTitleRow}>
                    <Image source={titleIconSource} style={categoryRowStyles.homeSectionTitleIcon} resizeMode="contain" />
                    <Text style={categoryRowStyles.homeSectionTitle}>{Akcru_Content.title}</Text>
                </View>
            ) : (
                <Text style={categoryRowStyles.homeSectionTitle}>{Akcru_Content.title}</Text>
            )}
            <FlatList
                data={Akcru_Content.movies}
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
                            active={pressedMovieId === item.id}
                            uri={item.landscapeURL}
                            imageStyle={styles.largeHighlightPoster}
                            onPress={() => handleItemPress(item)}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default LargeListCategories;
