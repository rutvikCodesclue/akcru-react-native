import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard,
    Image,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../assets/constants';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {ClientStackParams} from '../../navigation/ClientStack';
import {findMovies} from '../../lib/api/movies.lib';
import {IMovie} from '../../../types';
import {capitalizeFirstLetterOfString} from '../../util/util';

const SearchInput = () => {
    const [allMovies, setAllMovies] = useState<IMovie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<IMovie[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [textInputFocused, setTextInputFocused] = useState(false);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const textInputRef = useRef<TextInput>(null);

    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const query = text.trim().toLowerCase();
        if (!query.length) {
            setFilteredMovies(allMovies);
            return;
        }
        setFilteredMovies(allMovies.filter(movie => String(movie.title ?? '').toLowerCase().includes(query)));
    };

    const fetchMovies = async () => {
        setIsLoadingMovies(true);
        try {
            const fetchedMovies: IMovie[] = await findMovies('');
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

    useEffect(() => {
        if (modalVisible) {
            fetchMovies();
        }
    }, [modalVisible]);

    const closeModal = () => {
        setModalVisible(false);
        setSearchQuery('');
        setFilteredMovies(allMovies);
        setTextInputFocused(false);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.searchRoot}>
            <LinearGradient colors={[COLORS.BLACK, 'transparent']} style={styles.topGradient} />
            <View style={styles.searchLauncherWrap}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
                    <View style={styles.searchLauncher}>
                        <Icon name="magnify" type="material-community" color={COLORS.DARKGREY} size={24} style={styles.launcherIcon} />
                        <Text style={styles.launcherText}>What movie are you searching for?</Text>
                    </View>
                </TouchableWithoutFeedback>

                <Modal animationType="fade" transparent={false} visible={modalVisible}>
                    <SafeAreaView style={styles.modalRoot}>
                        <View style={styles.backbutton}>
                            <TouchableOpacity onPress={closeModal} style={styles.backTouch}>
                                <View style={styles.backRow}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={styles.backText}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchmodal}>
                            <View style={styles.searchinput}>
                                <Icon name="magnify" type="material-community" style={styles.icon} color={COLORS.DARKGREY} size={28} />
                                <TextInput
                                    textAlignVertical="center"
                                    placeholder="Search Movie"
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    autoFocus
                                    ref={textInputRef}
                                    onFocus={() => setTextInputFocused(true)}
                                    onBlur={() => setTextInputFocused(false)}
                                    onChangeText={handleSearch}
                                    value={searchQuery}
                                />
                                <TouchableWithoutFeedback onPress={() => handleSearch('')}>
                                    <Icon name="close-circle" type="material-community" size={22} color={COLORS.DARKGREY} style={styles.clearIcon} />
                                </TouchableWithoutFeedback>
                            </View>
                            <Text style={styles.searchHint}>
                                {textInputFocused ? 'Type to filter movie titles' : 'Pick a movie to continue'}
                            </Text>
                        </View>

                        <View style={styles.modalListWrap}>
                            {isLoadingMovies ? (
                                <View style={styles.loaderWrap}>
                                    <ActivityIndicator size="small" color={COLORS.CATPURPLGT} />
                                </View>
                            ) : (
                                <FlatList
                                    data={filteredMovies}
                                    ListFooterComponent={<View style={{marginBottom: 70}} />}
                                    renderItem={({item}) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                navigation.navigate('ContentDetailScreen', {
                                                    id: item.id,
                                                    movie: item.id,
                                                });
                                                closeModal();
                                            }}
                                            style={styles.movieRow}>
                                            <Image source={{uri: item.portraitURL}} style={styles.moviePoster} />
                                            <View style={styles.movieMeta}>
                                                <Text style={styles.movieTitle} numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.movieYear}>{item.year}</Text>
                                                <View style={styles.movieChipRow}>
                                                    {item.genres?.[0] ? (
                                                        <Text style={styles.movieChip}>
                                                            {capitalizeFirstLetterOfString(String(item.genres[0]))}
                                                        </Text>
                                                    ) : null}
                                                    {item.rating ? <Text style={styles.movieChip}>{item.rating}/10</Text> : null}
                                                </View>
                                            </View>
                                            <Icon name="chevron-forward" type="ionicon" size={16} color={COLORS.DARKGREY} />
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={item => item.id}
                                    keyboardShouldPersistTaps="handled"
                                    ListEmptyComponent={
                                        <View style={styles.emptyWrap}>
                                            <Text style={styles.emptyText}>No movies found.</Text>
                                        </View>
                                    }
                                />
                            )}
                        </View>
                    </SafeAreaView>
                </Modal>
            </View>
        </View>
    );
};

export default SearchInput;
