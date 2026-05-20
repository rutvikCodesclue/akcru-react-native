import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    FlatList,
    TouchableOpacity,
    Keyboard,
    Image,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {findMovies} from '../../../lib/api/movies.lib';
import {IMovie, IUserProfile} from '../../../../types';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {capitalizeFirstLetterOfString} from '../../../util/util';

type SendMITSearchInputProps = {
    userid?: string;
    receiverUser?: IUserProfile;
    isFromChangeMovie?: boolean;
    inviteId?: string;
    currentMovieId?: string;
};

const SendMITSearchInput = ({
    userid,
    receiverUser,
    isFromChangeMovie = false,
    inviteId,
    currentMovieId,
}: SendMITSearchInputProps) => {
    const normalizedIsFromChangeMovie = isFromChangeMovie === true || isFromChangeMovie === 'true';

    const [allMovies, setAllMovies] = useState<IMovie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [textInputFocused, setTextInputFocused] = useState(false);
    const textInputRef = useRef<TextInput | null>(null);

    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const trimmedQuery = searchInput.trim();

    const handleSearch = (text: string) => {
        setSearchInput(text);
        const query = text.trim().toLowerCase();
        if (!query.length) {
            setFilteredMovies(allMovies);
            return;
        }
        const next = allMovies.filter(movie => String(movie?.title ?? '').toLowerCase().includes(query));
        setFilteredMovies(next);
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const fetchedMovies: IMovie[] = await findMovies();
                setAllMovies(fetchedMovies);
                setFilteredMovies(fetchedMovies);
            } catch (error) {
                console.error('Error fetching movies:', error);
                setAllMovies([]);
                setFilteredMovies([]);
            } finally {
                setIsLoadingMovies(false);
            }
        };

        fetchMovies();
    }, []);

    const closeModal = () => {
        setModalVisible(false);
        setTextInputFocused(false);
        setSearchInput('');
        setFilteredMovies(allMovies);
        Keyboard.dismiss();
    };

    const handleOpenModal = () => {
        setModalVisible(true);
    };

    const handlePressMovie = (item: IMovie) => {
        Keyboard.dismiss();
        navigation.navigate('SendMITSchedule', {
            id: item.id,
            movieData: item,
            movie: item.title,
            userID: userid,
            receiverUser,
            isFromChangeMovie: Boolean(normalizedIsFromChangeMovie),
            inviteId,
            currentMovieId,
        });
        closeModal();
    };

    const renderMovieRow = ({item}: {item: IMovie}) => (
        <TouchableOpacity onPress={() => handlePressMovie(item)} activeOpacity={0.85} style={styles.mitMovieRow}>
            <Image source={{uri: item.portraitURL}} style={styles.mitMoviePoster} />
            <View style={styles.mitMovieMeta}>
                <Text style={styles.mitMovieTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.mitMovieYear}>{item.year || '—'}</Text>
                <View style={styles.mitMovieChipRow}>
                    {item.genres?.[0] ? (
                        <Text style={styles.mitMovieChip}>
                            {capitalizeFirstLetterOfString(String(item.genres[0]))}
                        </Text>
                    ) : null}
                    {item.rating ? <Text style={styles.mitMovieChip}>{item.rating}/10</Text> : null}
                </View>
            </View>
            <Icon name="chevron-forward" type="ionicon" size={16} color={COLORS.DARKGREY} />
        </TouchableOpacity>
    );

    return (
        <TabContainer>
            <View style={styles.mitSearchRoot}>
                <LinearGradient
                    colors={[COLORS.AKCRUBACKGROUND, 'transparent']}
                    style={styles.mitSearchTopGradient}
                />
                <View style={styles.mitSearchLauncherWrap}>
                    <TouchableWithoutFeedback onPress={handleOpenModal}>
                        <View style={styles.mitSearchLauncher}>
                            <Icon
                                name="magnify"
                                type="material-community"
                                color={COLORS.DARKGREY}
                                size={24}
                                style={styles.mitSearchLauncherIcon}
                            />
                            <Text style={styles.mitSearchLauncherText}>Choose your movie</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <Modal animationType="fade" transparent={false} visible={modalVisible}>
                        <SafeAreaView style={styles.mitModalRoot}>
                            <View style={styles.mitModalTopRow}>
                                <TouchableOpacity onPress={closeModal} style={styles.mitBackButton}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={styles.mitBackButtonText}>Back</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.mitSearchModalBody}>
                                <View style={styles.mitSearchInput}>
                                    <Icon
                                        name="magnify"
                                        type="material-community"
                                        color={COLORS.DARKGREY}
                                        size={24}
                                        style={styles.mitSearchIcon}
                                    />
                                    <TextInput
                                        textAlignVertical="center"
                                        placeholder="Search movie"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.mitSearchInputText}
                                        autoFocus
                                        ref={textInputRef}
                                        onFocus={() => setTextInputFocused(true)}
                                        onBlur={() => setTextInputFocused(false)}
                                        onChangeText={handleSearch}
                                        value={searchInput}
                                    />
                                    {trimmedQuery.length > 0 ? (
                                        <TouchableOpacity
                                            onPress={() => handleSearch('')}
                                            style={styles.mitSearchClearButton}>
                                            <Icon name="close" type="ionicon" size={16} color={COLORS.DARKGREY} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                                <Text style={styles.mitSearchHint}>
                                    {textInputFocused ? 'Type to filter movie titles' : 'Pick a movie to continue'}
                                </Text>
                            </View>

                            <View style={styles.mitMovieListWrap}>
                                {isLoadingMovies ? (
                                    <View style={styles.mitLoaderWrap}>
                                        <ActivityIndicator size="small" color={COLORS.CATPURPLGT} />
                                    </View>
                                ) : (
                                    <FlatList
                                        data={filteredMovies}
                                        ListFooterComponent={<View style={{marginBottom: 70}} />}
                                        renderItem={renderMovieRow}
                                        keyExtractor={item => item.id}
                                        keyboardShouldPersistTaps="handled"
                                        ListEmptyComponent={
                                            <View style={styles.mitEmptyWrap}>
                                                <Text style={styles.mitEmptyText}>
                                                    {trimmedQuery.length > 0
                                                        ? 'No movies match your search.'
                                                        : 'No movies available.'}
                                                </Text>
                                            </View>
                                        }
                                    />
                                )}
                            </View>
                        </SafeAreaView>
                    </Modal>
                </View>
            </View>
        </TabContainer>
    );
};

export default SendMITSearchInput;
