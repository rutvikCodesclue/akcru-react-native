import {View, Text, TouchableOpacity, Modal, FlatList, Image} from 'react-native';
import styles from './styles';
import categoryRowStyles from '../BasicListCategories/styles';
import {COLORS} from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {IMovie, ISeries} from '../../../types';
import {NoBottomTabStackParams} from '../../navigation/NoBottomTabStack';
import CustomIcon from '../CustomIcon/CustomIcon';
import {removeUnfinishedContent} from '../../lib/api/user.lib';
import RemovalModal from '../RemovalModal/RemovalModal';
import ConfirmationModal from '../ConfirmationModal';
import {isTablet} from '../../../assets/constants/theme';
import HighlightMediaCard from '../HighlightMediaCard';
import imageindex from '../../../assets/images/imageindex';

/** API rows include `type` and episode fields not on base IMovie/ISeries */
type ContinueWatchingEntry = (IMovie | ISeries) & {
    type?: string;
    seasonId?: string;
    episodeId?: string;
    seriesId?: string;
};

interface ContinueWatchingListProps {
    Akcru_Content: {
        id: string;
        title: string;
        content: (IMovie | ISeries)[];
    };
    updateUnfinishedContent: (updatedUnfinishedContent: (IMovie | ISeries)[]) => void;
    showTitleIcon?: boolean;
    titleIconUri?: string;
}

const HIGHLIGHT_NAV_DELAY_MS = 130;

/** AKCRUBLUE (#00bdf4) at 30% opacity = 70% transparent */
const PLAY_ICON_COLOR = 'rgba(0, 189, 244, 0.5)';

const INFO_ICON_COLOR = '#FFCC00';

type ContinueWatchingRowProps = {
    entry: ContinueWatchingEntry;
    showPosterBorder: boolean;
    onPosterPress: () => void;
    onDetailsPress: () => void;
    onRemovePress: () => void;
};

const ContinueWatchingRow = React.memo(
    ({entry, showPosterBorder, onPosterPress, onDetailsPress, onRemovePress}: ContinueWatchingRowProps) => {
        const playIconSize = isTablet() ? 125 : 60;
        const actionIconSize = isTablet() ? 30 : 20;
        return (
            <View style={styles.card}>
                <View style={styles.posterWrap}>
                    <HighlightMediaCard
                        active={showPosterBorder}
                        uri={entry.portraitURL}
                        imageStyle={styles.posterImage}
                        onPress={onPosterPress}
                    />
                    <View pointerEvents="none" style={styles.playOverlay}>
                        <CustomIcon name="play-circle" color={PLAY_ICON_COLOR} type="ionicon" baseSize={playIconSize} />
                    </View>
                </View>
                <View style={styles.actionBar}>
                    <TouchableOpacity onPress={onDetailsPress} style={styles.actionHit} accessibilityRole="button" accessibilityLabel="Details">
                        <CustomIcon name="information-circle" type="ionicon" baseSize={actionIconSize} color={INFO_ICON_COLOR} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onRemovePress} style={styles.actionHit} accessibilityRole="button" accessibilityLabel="Remove from continue watching">
                        <CustomIcon name="remove-circle" type="ionicon" baseSize={actionIconSize} color={COLORS.PINK} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
);

ContinueWatchingRow.displayName = 'ContinueWatchingRow';

const ContinueWatchingList = ({Akcru_Content, updateUnfinishedContent, showTitleIcon = false, titleIconUri}: ContinueWatchingListProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState<IMovie | ISeries | null>(null);
    const [pressedContentId, setPressedContentId] = useState<string | null>(null);
    const [typeRemovalModal, setTypeRemovalModal] = useState('');
    const [showRemovalModal, setShowRemovalModal] = useState(false);

    const posterNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (posterNavTimerRef.current) {
                clearTimeout(posterNavTimerRef.current);
            }
        };
    }, []);

    const handleShowRemovalModal = useCallback((typeRemovalModalVal: string) => {
        setTypeRemovalModal(typeRemovalModalVal);
        setShowRemovalModal(true);
    }, []);

    const handleCloseRemovalModal = useCallback(() => {
        setShowRemovalModal(false);
    }, []);

    const handleShowConfirmationModal = useCallback((content: IMovie | ISeries) => {
        setSelectedContent(content);
        setShowConfirmationModal(true);
    }, []);

    const handleCancelRemoveFromWatchList = useCallback(() => {
        setShowConfirmationModal(false);
    }, []);

    const handleConfirmRemoveFromWatchList = useCallback(async () => {
        setShowConfirmationModal(false);
        if (!selectedContent?.id) {
            return;
        }
        try {
            const success = await removeUnfinishedContent(selectedContent.id, 'episodeId' in selectedContent);
            if (success) {
                const updatedContent = Akcru_Content.content.filter(c => c.id !== selectedContent.id);
                updateUnfinishedContent(updatedContent);
                handleShowRemovalModal('success');
            } else {
                handleShowRemovalModal('failed');
            }
        } catch (error) {
            console.error('Error removing content from watch list:', error);
            handleShowRemovalModal('failed');
        }
    }, [Akcru_Content.content, handleShowRemovalModal, selectedContent, updateUnfinishedContent]);

    const navigateDetails = useCallback(
        (entry: ContinueWatchingEntry) => {
            if (entry.type === 'episode') {
                navigation.navigate('EpisodeDetailScreen', {
                    seriesId: entry.seriesId,
                    seasonId: entry.seasonId,
                    episodeId: entry.id,
                });
                return;
            }
            navigation.navigate('ResumeDetailScreen', {
                id: entry.id,
                title: entry.title,
            });
        },
        [navigation],
    );

    const schedulePosterNavigation = useCallback(
        (entry: ContinueWatchingEntry) => {
            if (posterNavTimerRef.current) {
                clearTimeout(posterNavTimerRef.current);
            }
            setPressedContentId(entry.id);
            posterNavTimerRef.current = setTimeout(() => {
                posterNavTimerRef.current = null;
                setPressedContentId(null);
                if (entry.type === 'movie') {
                    navigation.navigate('ContentPlayer', {id: entry.id});
                }
            }, HIGHLIGHT_NAV_DELAY_MS);
        },
        [navigation],
    );

    const renderItem = useCallback(
        ({item}: {item: IMovie | ISeries}) => {
            const entry = item as ContinueWatchingEntry;
            return (
                <ContinueWatchingRow
                    entry={entry}
                    showPosterBorder={pressedContentId === entry.id}
                    onPosterPress={() => schedulePosterNavigation(entry)}
                    onDetailsPress={() => navigateDetails(entry)}
                    onRemovePress={() => handleShowConfirmationModal(entry)}
                />
            );
        },
        [handleShowConfirmationModal, navigateDetails, pressedContentId, schedulePosterNavigation],
    );

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
                data={Akcru_Content.content}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={[categoryRowStyles.featuredListContainer, styles.listContent]}
                renderItem={renderItem}
            />
            <Modal animationType="fade" transparent visible={showRemovalModal}>
                <RemovalModal closeModal={handleCloseRemovalModal} type={typeRemovalModal} />
            </Modal>
            <Modal animationType="fade" transparent visible={showConfirmationModal}>
                <ConfirmationModal
                    onPressYes={handleConfirmRemoveFromWatchList}
                    onPressNo={handleCancelRemoveFromWatchList}
                    variant="continueWatching"
                    yesLabel="Yes"
                    noLabel="No"
                    confirmationText={`Are you sure you want to remove ${selectedContent?.title}?`}
                />
            </Modal>
        </View>
    );
};

export default ContinueWatchingList;
