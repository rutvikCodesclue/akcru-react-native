import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from './styles'
import Header from '../../../components/header'
import { Icon } from '@rneui/base'
import { COLORS, FONTS } from '../../../../assets/constants'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { UserProfileStackParams } from '../../../navigation/UserProfileStack'

import { Akcru_Content } from '../../../../assets/constants/ListData'
import { ClientStackParams } from '../../../navigation/ClientStack'
import LinearGradient from 'react-native-linear-gradient'
import { findMovies } from '../../../lib/api/movies.lib'
import { IMovie } from '../../../../types'
import { capitalizeFirstLetterOfString, formatMovieDuration } from '../../../util/util'

// interface EditWatchListProps {
//     Akcru_Content: {
//         id: string;
//         title: string;
//         movies: {
//             name: string;
//             desc: string;
//             actors: string[];
//             directors: string[];
//             genre: string[];
//             portrait_poster: string;
//             landscape_poster: string;
//             rating: number;
//             year: number;
//             rated: string;
//             length: string;
//             id: string;
//             movie_url: string;
//             youtubetrailer: string;
//         }[];
//     };
// }

const Userwatchlist = Akcru_Content[5];

const EditWatchList = () => {

    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();
  

useEffect(() => {
    const fetchNewerYearMovies = async () => {
        try {
            const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

            // Sort allMovies by year in descending order
            const sortedMovies = allMovies.sort((a, b) => b.year - a.year);

            // Get the 5 oldest movies
            const Newer5Movies = sortedMovies.slice(0, 5);

            setNewerYearMovies(Newer5Movies);
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
        }
    };
    fetchNewerYearMovies();
}, []);


    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const [content, setContent] = useState(newerYearMovies);

    const [contentToDeleteIndex, setContentToDeleteIndex] = useState(null);

    const deleteContent = index => {
        setContentToDeleteIndex(index);
        setShowDeleteConfirmation(true);
    };

    const handleCancelDelete = () => {
        // Hide the confirmation modal
        setShowDeleteConfirmation(false);
    };

    const handleDeleteContent = () => {
        // Delete the content at the specified index
        const updatedcontent = [...content];
        updatedcontent.splice(contentToDeleteIndex, 1);
        setContent(updatedcontent);

        // Hide the confirmation modal
        setShowDeleteConfirmation(false);
    };

    

    return (
        <View>
            <ScrollView stickyHeaderIndices={[0]}>
                <View style={{zIndex: 20}}>
                    <Header />
                </View>
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.pop()}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 15,
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                        </View>
                    </TouchableOpacity>

                    <View>
                        <Text style={{...FONTS.Title2, textAlign: 'center', marginBottom: 15}}>YOUR WATCHLIST</Text>
                    </View>

                    <View>
                        <FlatList
                            data={newerYearMovies}
                            horizontal={false}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({item, index}) => (
                                <View
                                    style={{
                                        borderRadius: 5,
                                        marginBottom: 10,
                                        padding: 5,
                                    }}>
                                    <LinearGradient
                                        // Background Linear Gradient
                                        colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            borderRadius: 5,
                                        }}
                                    />
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{paddingRight: 5}}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    console.log('id:', item.id);
                                                    console.log('movie:', item.title);
                                                    navigation.navigate('ContentDetailScreen', {
                                                        id: item.id,
                                                        movie: item.title,
                                                    });
                                                }}>
                                                <Image source={{uri: item.portraitURL}} style={styles.poster} />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{flex: 1}}>
                                            <Text style={{...FONTS.Title2, marginBottom: 5}}>{item.title}</Text>
                                            <View style={{flexDirection: 'row', alignContent: 'center'}}>
                                                <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.MIDORANGE}}>
                                                    {item.year}
                                                </Text>
                                                <Text style={{...FONTS.Title2, fontSize: 12, marginHorizontal: 10}}>
                                                    {formatMovieDuration(item.duration)}
                                                </Text>

                                                <Text style={styles.drawfonttag}>{item.rated}</Text>
                                                <Text style={styles.drawfonttag}>
                                                    {capitalizeFirstLetterOfString(item.genres[0])}
                                                </Text>
                                                <Text style={styles.drawfonttag}>{item.rating}/10</Text>
                                            </View>
                                            <View style={{marginTop: 5}}>
                                                <Text style={{...FONTS.Title2, fontSize: 12}}>{item.description}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Pressable onPress={() => deleteContent(index)}>
                                        <Text style={{...FONTS.Title2Orange, textAlign: 'center'}}>
                                            Delete from your watchlist
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                        <Modal animationType="fade" transparent={true} visible={showDeleteConfirmation}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                        padding: 20,
                                        borderRadius: 10,
                                    }}>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{...FONTS.Title3, marginBottom: 10}}>Confirm Deletion</Text>
                                        <Text style={{marginBottom: 20, ...FONTS.Title3, textAlign: 'center'}}>
                                            Are you sure you want to delete this content from your watchlist?
                                        </Text>
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                        <TouchableOpacity
                                            onPress={handleCancelDelete}
                                            style={{
                                                backgroundColor: 'red',
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleDeleteContent}
                                            style={{
                                                backgroundColor: 'green',
                                                padding: 10,
                                                borderRadius: 5,
                                            }}>
                                            <Text style={{...FONTS.Title3}}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default EditWatchList