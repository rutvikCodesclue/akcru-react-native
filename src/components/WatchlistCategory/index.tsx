import {View, Text, Image, FlatList, Pressable, Modal} from 'react-native';
import styles from './styles';
import {FONTS} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React, {useState} from 'react';
import {IMovie} from '../../../types';
import {removeFromWatchlist} from '../../lib/api/movies.lib';
import RemovalModal from '../RemovalModal/RemovalModal';
import ConfirmationModal from '../ConfirmationModal';

interface WatchListCategoryProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[];
    };
    updateWatchlist: (updatedWatchlist: IMovie[]) => void;
}

const WatchListCategory = ({Akcru_Content, updateWatchlist}: WatchListCategoryProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

    const handleShowConfirmationModal = (movie: IMovie) => {
        setSelectedMovie(movie);
        setShowConfirmationModal(true);
    };

    const handleConfirmRemoveFromWatchList = async () => {
        setShowConfirmationModal(false);
        if (selectedMovie && selectedMovie.id) {
            const success = await removeFromWatchlist(selectedMovie.id);
            if (success) {
                const updatedMovies = Akcru_Content.movies.filter(movie => movie.id !== selectedMovie.id);
                updateWatchlist(updatedMovies);

                handleShowRemovalModal('success');
            } else {
                handleShowRemovalModal('failed');
            }
        }
    };

    const handleCancelRemoveFromWatchList = () => {
        setShowConfirmationModal(false);
    };

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
                            onLongPress={() => handleShowConfirmationModal(item)}>
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

export default WatchListCategory;
