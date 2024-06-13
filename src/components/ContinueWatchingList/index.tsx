import {View, Text, Image, TouchableOpacity, Modal} from 'react-native';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {IEpisode, IMovie, ISeries} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import CustomIcon from '../CustomIcon/CustomIcon';
import {removeUnfinishedContent} from '../../lib/api/user.lib'; // Updated function
import RemovalModal from '../RemovalModal/RemovalModal';
import ConfirmationModal from '../ConfirmationModal';
import {FlashList} from '@shopify/flash-list';

interface ContinueWatchingListProps {
    Akcru_Content: {
        id: string;
        title: string;
        content: (IMovie | ISeries)[];
    };
    updateUnfinishedContent: (updatedUnfinishedContent: (IMovie | ISeries)[]) => void;
}

const ContinueWatchingList = ({Akcru_Content, updateUnfinishedContent}: ContinueWatchingListProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState<IMovie | ISeries | null>(null);

    const handleShowConfirmationModal = (content: IMovie | ISeries) => {
        console.log('content', content);
        setSelectedContent(content);
        setShowConfirmationModal(true);
    };

    const handleConfirmRemoveFromWatchList = async () => {
        setShowConfirmationModal(false);
        if (selectedContent && selectedContent.id) {
            console.log('selectedContent', selectedContent.id);
            const success = await removeUnfinishedContent(selectedContent.id, 'episodeId' in selectedContent);
            if (success) {
                const updatedContent = Akcru_Content.content.filter(content => content.id !== selectedContent.id);
                updateUnfinishedContent(updatedContent);

                handleShowRemovalModal('success');
            } else {
                handleShowRemovalModal('failed');
            }
        }
    };

    const handleCancelRemoveFromWatchList = () => {
        setShowConfirmationModal(false);
    };

    const [typeRemovalModal, setTypeRemovalModal] = useState('');
    const [showRemovalModal, setShowRemovalModal] = useState(false);

    const handleShowRemovalModal = (typeRemovalModalVal: React.SetStateAction<string>) => {
        setTypeRemovalModal(typeRemovalModalVal);
        setShowRemovalModal(true);
    };

    const handleCloseRemovalModal = () => {
        if (typeRemovalModal === 'success') {
        }
        setShowRemovalModal(false);
    };

    return (
        <>
            <Text style={{...FONTS.Title2, marginTop: 10, marginLeft: '2%'}}>{Akcru_Content.title}</Text>
            <FlashList
                data={Akcru_Content.content}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={124}
                renderItem={({item}) => (
                    <View style={{margin: 5}}>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('id:', item.id);
                                console.log('content:', item.title);
                                if (item.type === 'episode') {
                                    navigation.navigate('EpisodePlayer', {
                                        seriesId: item.seriesId,
                                        seasonId: item.seasonId,
                                        episodeId: item.id,
                                    });
                                } else {
                                    navigation.navigate('ResumePlayer', {
                                        id: item.id,
                                        title: item.title,
                                    });
                                }
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
                                    console.log('id:', item.id);
                                    console.log('content:', item.title);
                                    console.log('type:', item.type);
                                    console.log('Season Id:', item.seasonId);
                                    console.log('Episode Id:', item.episodeId);
                                    if (item.type === 'episode') {
                                        console.log('Navigating to EpisodeDetailScreen with id:', item.seriesId);
                                        navigation.navigate('EpisodeDetailScreen', {
                                            seriesId: item.seriesId,
                                            seasonId: item.seasonId,
                                            episodeId: item.id,
                                        });
                                    } else {
                                        navigation.navigate('ResumeDetailScreen', {
                                            id: item.id,
                                            title: item.title,
                                        });
                                    }
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
                    confirmationText={`Are you sure you want to remove ${selectedContent?.title}?`}
                />
            </Modal>
        </>
    );
};

export default ContinueWatchingList;
