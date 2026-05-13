import {Text, View, Image, SafeAreaView, FlatList, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Avatar} from '@rneui/base';
import SendMITSearchInput from './SendMITSearchInput';
import GenreCard from '../../../components/GenreCard';
import AkcruLevels from '../../../components/akcruBadges';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString, selectAvatarBorderColor} from '../../../util/util';
import {IGenreItem, IUserProfile} from '../../../../types';
import {findAUser} from '../../../lib/api/user.lib';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import {DEFAULT_GENRE_IMAGE} from '../../../../assets/constants/Data';
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
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View>
                        <View style={{marginHorizontal: 15}}>
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
                    <View>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                marginHorizontal: SIZES.marginhorizontal,
                                marginVertical: SIZES.marginvertical,
                            }}>
                            Choose Genre
                        </Text>
                    </View>
                    <View style={{marginBottom: 75}}>
                        <View
                            style={{
                                alignItems: 'center',
                                width: SIZES.ScreenWidth,
                                alignSelf: 'center',
                            }}>
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

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 35,
                    }}>
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: COLORS.TAGCOLOR,
                            width: SIZES.ScreenWidth / 2,
                            height: SIZES.ScreenHeight / 11.5,
                            padding: 10,
                        }}>
                        <LinearGradient
                            colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                width: SIZES.ScreenWidth / 2,
                                borderRadius: 5,
                                height: SIZES.ScreenHeight / 11.5,
                            }}
                        />
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <View>
                                <Avatar
                                    rounded
                                    size={40}
                                    source={{
                                        uri: user?.profilePicture ?? undefined,
                                    }}
                                    avatarStyle={{
                                        borderWidth: 2,
                                        borderColor: selectAvatarBorderColor(user?.badge ?? 'AKCRUIT'),
                                    }}
                                />
                            </View>
                            <View style={{marginLeft: 10}}>
                                <Text style={{...FONTS.Title2}}>{user?.username}</Text>
                                {user?.badge === 'AKCRUIT' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeAkcruit />
                                    </View>
                                )}
                                {user?.badge === 'GUARDIAN' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeGuardian />
                                    </View>
                                )}
                                {user?.badge === 'HERO' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeHero />
                                    </View>
                                )}
                                {user?.badge === 'SUPERHERO' && (
                                    <View>
                                        <AkcruLevels.AkcruBadgeSuperHero />
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                    <View style={{marginLeft: 10}}>
                        <Image source={imageindex.MITticket} />
                    </View>
                </View>
            </SafeAreaView>
        </TabContainer>
    );
};

export default SendMITViewUser;
