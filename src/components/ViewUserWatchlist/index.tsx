import {View, Text, Image, FlatList, TouchableOpacity, Pressable, Alert, Modal} from 'react-native';
import styles from './styles';
import { FONTS } from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React, { useState } from 'react';
import { IMovie } from '../../../types';
import { removeFromWatchlist } from '../../lib/api/movies.lib';
import RemovalModal from '../RemovalModal/RemovalModal';
import ConfirmationModal from '../ConfirmationModal';

interface ViewUserWatchListCategoryProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[]; // Update this to match the IMovie structure
    };
    updateWatchlist: (updatedWatchlist: IMovie[]) => void;
}



const ViewUserWatchListCategory = ({Akcru_Content, updateWatchlist}: ViewUserWatchListCategoryProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for showing confirmation modal
    const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null); // State to keep track of the selected movie object

    // Handler to show the confirmation modal
    const handleShowConfirmationModal = (movie: IMovie) => {
        setSelectedMovie(movie); // Store the selected movie object
        setShowConfirmationModal(true); // Show the confirmation modal
    };

    const handleConfirmRemoveFromWatchList = async () => {
        setShowConfirmationModal(false); // Hide the confirmation modal
        if (selectedMovie && selectedMovie.id) {
            const success = await removeFromWatchlist(selectedMovie.id);
            if (success) {
                const updatedMovies = Akcru_Content.movies.filter(movie => movie.id !== selectedMovie.id);
                updateWatchlist(updatedMovies);
                // Success message if needed
                handleShowRemovalModal('success');
            } else {
                // Error message if needed
                handleShowRemovalModal('failed');
            }
        }
    };

    // Handler for cancel removal in the ConfirmationModal
    const handleCancelRemoveFromWatchList = () => {
        setShowConfirmationModal(false); // Hide the confirmation modal
    };

    // const handleRemoveFromWatchlist = async (movieId: string) => {
    //     Alert.alert('Remove Movie', 'Are you sure you want to remove this movie from your watchlist?', [
    //         {text: 'Cancel', style: 'cancel'},

    //         {
    //             text: 'Remove',
    //             onPress: async () => {
    //                 setWatchlistRemoval(true);
    //                 const success = await removeFromWatchlist(movieId);
    //                 if (success) {
    //                     const updatedMovies = Akcru_Content.movies.filter(movie => movie.id !== movieId);
    //                     updateWatchlist(updatedMovies);
    //                     setWatchlistRemoval(false);
    //                     handleShowRemovalModal('success');
    //                     // Alert.alert('Success', 'Movie has been removed from the watchlist.');
    //                 } else {
    //                     setWatchlistRemoval(false);
    //                     handleShowRemovalModal('failed');
    //                     // Alert.alert('Error', 'Failed to remove the movie from the watchlist.');
    //                 }
    //             },
    //         },
    //     ]);
    // };

    const [watchlistremoval, setWatchlistRemoval] = useState(false);
    const [typeRemovalModal, setTypeRemovalModal] = useState('');
    const [showRemovalModal, setShowRemovalModal] = useState(false);

    const handleShowRemovalModal = (typeRemovalModal: React.SetStateAction<string>) => {
        setTypeRemovalModal(typeRemovalModal);
        setShowRemovalModal(true);
    };

    const handleCloseRemovalModal = () => {
        if (typeRemovalModal === 'success') {
            //do something
        }
        setShowRemovalModal(false);
    };

    return (
        <>
            <Text style={{...FONTS.Title2, marginTop: 10}}>{Akcru_Content.title}</Text>
            <FlatList
                data={Akcru_Content.movies}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => (
                    <View>
                        <Pressable
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('movie:', item.title);
                                navigation.navigate('ContentDetailScreen', {
                                    id: item.id,
                                    movie: item.title,
                                });
                            }}
                            >
                            <Image source={{uri: item.portraitURL}} style={styles.poster} />
                        </Pressable>
                    </View>
                )}
            />
            <Modal animationType="fade" transparent={true} visible={showRemovalModal}>
                <RemovalModal closeModal={handleCloseRemovalModal} type={typeRemovalModal} />
            </Modal>
            <Modal animationType="fade" transparent={true} visible={showConfirmationModal}>
                <ConfirmationModal
                    onPressYes={handleConfirmRemoveFromWatchList}
                    onPressNo={handleCancelRemoveFromWatchList}
                    confirmationText={`Are you sure you want to remove "${selectedMovie?.title}" from your watchlist?`}
                />
            </Modal>
        </>
    );
};

export default ViewUserWatchListCategory;
