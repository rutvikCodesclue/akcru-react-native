import {View, TextInput, FlatList, SafeAreaView, Text, ActivityIndicator} from 'react-native';
import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import {COLORS} from '../../../../assets/constants';
import {fetchRandomUsers, searchForUsers} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import UserDiscoveryCard from '../../../components/UserDiscoveryCard';

const UserSearchResultScreen = () => {
    const [data, setData] = useState<IUserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingRandomUsers, setIsLoadingRandomUsers] = useState(true);

    const [, setTextInputFocused] = useState(false);
    const textInputRef = useRef<TextInput | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const [searchInput, setSearchInput] = useState('');
    const trimmedQuery = searchInput.trim();

    const handleSearch = (text: string) => {
        setSearchInput(text);
        if (text.trim().length <= 1) {
            setData([]);
            return;
        }
        setIsSearching(true);
        searchForUsers(text.trim())
            .then(res => {
                setData(Array.isArray(res) ? res : []);
            })
            .catch(() => setData([]))
            .finally(() => setIsSearching(false));
    };

    const [randomUsers, setRandomUsers] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const loadRandomUsers = async () => {
            try {
                const fetchedUsers = await fetchRandomUsers();
                setRandomUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
            } finally {
                setIsLoadingRandomUsers(false);
            }
        };

        loadRandomUsers().catch(console.error);
    }, []);

    const activeData = trimmedQuery.length > 0 ? data : randomUsers;
    const showEmptySearch = trimmedQuery.length > 1 && !isSearching && data.length === 0;
    const titleText = trimmedQuery.length > 0 ? 'Search Results' : 'Suggested Users';

    const renderUserCard = ({item}: {item: IUserProfile}) => {
        const fullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
        return (
            <View style={styles.cardWrap}>
                <UserDiscoveryCard
                    user={item}
                    subtitle={fullName || item.firstName || item.username}
                    fallbackDescription="Tap to view profile"
                    onPress={() => {
                        navigation.navigate('ViewUserScreen', {
                            userID: item.id,
                        });
                        setTextInputFocused(true);
                    }}
                />
            </View>
        );
    };

    const listHeader = (
        <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>{titleText}</Text>
            {isSearching ? (
                <View style={styles.inlineLoader}>
                    <ActivityIndicator size="small" color={COLORS.CATPURPLGT} />
                </View>
            ) : null}
        </View>
    );

    const listEmpty = (
        <View style={styles.emptyWrap}>
            {isLoadingRandomUsers && trimmedQuery.length === 0 ? (
                <ActivityIndicator size="small" color={COLORS.CATPURPLGT} />
            ) : (
                <Text style={styles.emptyText}>
                    {showEmptySearch ? 'No users found for your search.' : 'No users to display.'}
                </Text>
            )}
        </View>
    );

    return (
        <TabContainer>
            <SafeAreaView style={styles.container}>
                <View style={styles.topBlock}>
                    <Header />
                    <View style={styles.backButtonWrap}>
                        <BackButton navigation={navigation} />
                    </View>

                    <View style={styles.searchWrap}>
                        <View style={styles.searchinput}>
                            <View style={styles.searchInputInner}>
                                <Icon
                                    name="magnify"
                                    type="material-community"
                                    color={COLORS.AKCRUBLUE}
                                    size={28}
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    placeholder="Search for user"
                                    placeholderTextColor={COLORS.DARKGREY}
                                    autoCorrect={false}
                                    autoFocus={false}
                                    ref={textInputRef}
                                    onFocus={() => {
                                        setTextInputFocused(true);
                                    }}
                                    onBlur={() => {
                                        setTextInputFocused(false);
                                    }}
                                    onChangeText={handleSearch}
                                    style={styles.searchInputText}
                                    value={searchInput}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <FlatList
                    data={activeData}
                    keyExtractor={item => item.id}
                    renderItem={renderUserCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={listHeader}
                    ListEmptyComponent={listEmpty}
                    keyboardShouldPersistTaps="handled"
                />
            </SafeAreaView>
        </TabContainer>
    );
};

export default UserSearchResultScreen;
