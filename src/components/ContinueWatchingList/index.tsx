import {View, Text, Image, FlatList, TouchableOpacity, Modal} from 'react-native';
import styles from './styles';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import React, { useState } from 'react';
import { IMovie } from '../../../types';
import { NoBottomTabStackParams } from '../../navigation/NoBottomTabStack';
import CustomIcon from '../CustomIcon/CustomIcon';
import { removeUnfinishedMovie } from '../../lib/api/user.lib';
import RemovalModal from '../RemovalModal/RemovalModal';
import ConfirmationModal from '../ConfirmationModal';
import { FlashList } from '@shopify/flash-list';

interface ContinueWatchingListProps {
    Akcru_Content: {
        id: string;
        title: string;
        movies: IMovie[]; // Update this to match the IMovie structure
    };
    updateUnfinishedMovies: (updatedUnfinishedMovies: IMovie[]) => void;
}

const ContinueWatchingList = ({Akcru_Content, updateUnfinishedMovies}: ContinueWatchingListProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    // const {Akcru_Content} = props;

    

    const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for showing confirmation modal
    const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null); // State to keep track of the selected movie object

    // Handler to show the confirmation modal
    const handleShowConfirmationModal = (movie: IMovie) => {
        console.log('movie', movie);
        setSelectedMovie(movie); // Store the selected movie object
        setShowConfirmationModal(true); // Show the confirmation modal
    };

    const handleConfirmRemoveFromWatchList = async () => {
        setShowConfirmationModal(false); // Hide the confirmation modal
        if (selectedMovie && selectedMovie.id) {
            console.log('selectedMovie', selectedMovie.id);
            const success = await removeUnfinishedMovie(selectedMovie.id);
            if (success) {
                const updatedMovies = Akcru_Content.movies.filter(movie => movie.id !== selectedMovie.id);
                updateUnfinishedMovies(updatedMovies);
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
            <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
            <FlashList
                data={Akcru_Content.movies}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={124}
                renderItem={({item, index}) => (
                    <View style={{margin: 5}}>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('movie:', item.title);
                                navigation.navigate('ResumePlayer', {
                                    id: item.id,
                                    movie: item.title,
                                });
                            }}>
                            <View
                                style={{
                                    position: 'absolute',
                                    zIndex: 20,
                                    top: SIZES.ScreenWidth * 0.1,
                                    left: SIZES.ScreenWidth * 0.04,
                                }}>
                                <CustomIcon
                                    name="play-circle"
                                    color={COLORS.TRANSPINK}
                                    type={'ionicon'}
                                    baseSize={60}
                                />
                            </View>
                            <Image source={{uri: item.portraitURL}} style={styles.poster} />
                        </TouchableOpacity>
                        <View
                            style={{
                                backgroundColor: COLORS.PURPLE,
                                width: SIZES.ScreenWidth / 3.6,
                                paddingVertical: 10,
                                borderBottomRightRadius: 5,
                                borderBottomLeftRadius: 5,
                                justifyContent: 'space-between',
                                flexDirection: 'row',
                                paddingHorizontal: 10,
                            }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('ResumeDetailScreen', {
                                        id: item.id,
                                        movie: item.title,
                                    });
                                }}>
                                <CustomIcon
                                    name={'information-circle'}
                                    type={'ionicon'}
                                    baseSize={20}
                                    color={COLORS.AKCRUBLUE}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleShowConfirmationModal(item)}>
                                <CustomIcon name={'remove-circle'} type={'ionicon'} baseSize={20} color={COLORS.PINK} />
                            </TouchableOpacity>
                        </View>
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
                    confirmationText={`Are you sure you want to remove ${selectedMovie?.title}?`}
                />
            </Modal>
        </>
    );
};

export default ContinueWatchingList;
