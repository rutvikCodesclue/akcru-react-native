import {Text, View, SafeAreaView, FlatList, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../../assets/constants';
import styles from './styles';
import SendMITSearchInput from './SendMITSearchInput';
import GenreCard from '../../../components/GenreCard';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString} from '../../../util/util';
import {IGenreItem, IUserProfile} from '../../../../types';
import {findAUser} from '../../../lib/api/user.lib';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import {DEFAULT_GENRE_IMAGE} from '../../../../assets/constants/Data';
import UserDiscoveryCard from '../../../components/UserDiscoveryCard';
type SendMITViewUserNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITViewUser'>;

type SendMITViewUserRouteProp = RouteProp<CrummunityStackParams, 'SendMITViewUser'>;

type Props = {
    navigation: SendMITViewUserNavigationProp;
    route: SendMITViewUserRouteProp;
};

const SendMITViewUser = ({route, navigation}: Props) => {
    const userID: string | undefined = route.params?.userID ?? route.params?.userid ?? null;
    const receiverUser: IUserProfile | undefined = (route.params as any)?.receiverUser;
    const rawIsFromChangeMovie = route.params?.isFromChangeMovie;
    const isFromChangeMovie = rawIsFromChangeMovie === true || rawIsFromChangeMovie === 'true';
    const inviteId: string | undefined = route.params?.inviteId ? String(route.params.inviteId) : undefined;
    const currentMovieId: string | undefined = route.params?.currentMovieId
        ? String(route.params.currentMovieId)
        : undefined;

    useFocusEffect(
        React.useCallback(() => {
            if (receiverUser) {
                setUser(receiverUser);
                return () => {};
            }
            findAUser({id: userID}).then(user => {
                setUser(user);
            });

            return () => {};
        }, [receiverUser, userID]),
    );

    const [user, setUser] = useState<IUserProfile | undefined>(receiverUser);

    const [genres, setGenres] = React.useState<IGenreItem[]>([]);
    const [loading, setIsLoading] = React.useState(true);

    const fetchGenres = async () => {
        const serverGenres = await getMovieGenres(); // [{ id, genre, image }]
        const normalized = (serverGenres ?? []).map(g => ({
            ...g,
            id: (g.id ?? g.genre ?? '').toString(), // ensure string id
            image: g.image && g.image.trim() ? g.image : DEFAULT_GENRE_IMAGE,
        }));

        const seen = new Set<string>();
        const unique = normalized.filter(g => {
            const k = (g.id || g.genre).toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        setGenres(unique);
        setIsLoading(false);
    };


    const handleGenrePress = (genre: IGenreItem) => {
        navigation.navigate('SendMITSearchResult', {
            genre: capitalizeFirstLetterOfString(genre.genre),
            // Use route param directly so userID is always available.
            userID: userID,
            userName: user?.username,
            receiverUser: user,
            isFromChangeMovie: Boolean(isFromChangeMovie),
            inviteId,
            currentMovieId,
        });
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    return (
        <TabContainer>
            <SafeAreaView style={styles.mitViewContainer}>
                <ScrollView contentContainerStyle={styles.mitViewScrollContent}>
                    <View style={styles.mitViewTopSection}>
                        <View style={styles.mitViewBackWrap}>
                            <BackButton navigation={navigation} />
                        </View>

                        <SendMITSearchInput
                            userid={userID}
                            receiverUser={user}
                            isFromChangeMovie={isFromChangeMovie}
                            inviteId={inviteId}
                            currentMovieId={currentMovieId}
                        />
                    </View>

                    <View style={styles.mitViewSelectedUserRow}>
                        <View style={styles.mitViewSelectedUserCard}>
                            {user ? (
                                <UserDiscoveryCard
                                    user={user}
                                    subtitle="Selected Invitee"
                                    fallbackDescription="Ready to send MIT invite"
                                    onPress={() => {}}
                                />
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.mitViewGenresSection}>
                        <Text style={styles.mitViewGenreTitle}>Choose Genre</Text>
                        <View style={styles.mitViewGenresWrap}>
                            <FlatList
                                data={loading ? [] : genres}
                                horizontal={false}
                                numColumns={2}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => {
                                    // Prefer a real id if present
                                    const raw = (item?.id ?? item?.genre ?? '').toString().trim();
                                    // Sanitize to avoid weird characters-only keys like ":" or ""
                                    const base = raw.length > 0 ? raw : `genre-${index}`;
                                    return `${base}-${index}`; // ensure uniqueness even if duplicates exist
                                }}
                                renderItem={({item}) => (
                                    <View>
                                        <GenreCard
                                            image={item.image}
                                            genre={capitalizeFirstLetterOfString(item.genre)}
                                            onPress={() => handleGenrePress(item)}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default SendMITViewUser;
