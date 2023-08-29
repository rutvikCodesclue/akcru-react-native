import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    Platform,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';

import {Icon} from '@rneui/base';

import {API} from '../../../clients/api.client';
import {supabase} from '../../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MOVIE_GENRES} from '../../../../assets/constants/Data';
import { archetypeMapping } from '../../../../assets/constants/archetypeMapping';

const OnBoard3 = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [checkedGenres, setCheckedGenres] = useState<Record<string, boolean>>({});
    
    const handleCheckboxChange = (genreId: string) => {
        // Check if the genre is already selected
        if (checkedGenres[genreId]) {
            // If it's selected, unselect it
            setCheckedGenres(prevState => ({
                ...prevState,
                [genreId]: false,
            }));
        } else {
            // Check if the limit of two genres is reached
            if (Object.values(checkedGenres).filter(Boolean).length < 2) {
                // If not reached, select the genre
                setCheckedGenres(prevState => ({
                    ...prevState,
                    [genreId]: true,
                }));
            } else {
                // If limit is reached, show a message or perform an action
                console.log('You can only select up to two genres.');
            }
        }
    };

    const handleFinishButton = () => {
        const selectedGenres = Object.keys(checkedGenres).filter(genreId => checkedGenres[genreId]);

        console.log('Selected Genres:', selectedGenres);

        if (selectedGenres.length === 2) {
            const genreNames = selectedGenres.map(genreId => {
                const genreObject = MOVIE_GENRES.find(item => item.id === genreId);
                return genreObject ? genreObject.genre : '';
            });

            const archetypeKey = genreNames.sort().join(', ');

            console.log('Archetype Key:', archetypeKey);

            const selectedArchetype = archetypeMapping[archetypeKey];

            if (selectedArchetype) {
                console.log('Selected Archetype:', selectedArchetype);
                // You can also navigate or perform any other action here
                navigation.navigate('NoBottomStack')
            } else {
                console.log('No matching archetype found for the selected genres.');
            }
        } else {
            console.log('Please select exactly 2 genres.');
        }
    };


   

    const filteredGenres = MOVIE_GENRES.filter(genre => genre.id !== '0');



    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.AkcruonboardBG} resizeMode={'cover'}>
                <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                    <View style={styles.container}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                </View>
                            </TouchableOpacity>
                            <View
                                style={{
                                    alignItems: 'flex-end',
                                }}>
                                <Text style={{...FONTS.Title3, marginRight: 20}}>3/3</Text>
                            </View>
                        </View>

                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <AkcruLogo width={200} height={60} />
                        </View>

                        <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                            At Akcru, your movie-watching preferences shape your unique archetype. This personalized
                            archetype guides us in curating the finest movie recommendations for you, as well as
                            connecting you with like-minded users who share similar tastes. At Akcru, we go beyond being
                            a simple streaming platform; we are a multifaceted streaming experience that caters to your
                            individuality.
                        </Text>
                        <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, textAlign: 'center', marginTop: 20}}>
                            Please choose 2 genres to get you started:
                        </Text>

                        <View style={{marginBottom: 20}}>
                            <FlatList
                                data={filteredGenres}
                                horizontal={false}
                                numColumns={3}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View>
                                        <View style={styles.checkboxContainer}>
                                            <TouchableOpacity onPress={() => handleCheckboxChange(item.id)}>
                                                <View style={styles.checkbox}>
                                                    {checkedGenres[item.id] && (
                                                        <Icon
                                                            name="checkmark-sharp"
                                                            type="ionicon"
                                                            size={18}
                                                            color={COLORS.MIDORANGE}
                                                            style={{marginTop: -3}}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                            <View>
                                                <Text style={styles.checkboxText}>{item.genre}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>

                        <View>
                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruButtons.XlLrgButton
                                    color={COLORS.MIDORANGE}
                                    btnname={'Finish'}
                                    onPress={handleFinishButton}
                                    disabled={false}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

export default OnBoard3;
