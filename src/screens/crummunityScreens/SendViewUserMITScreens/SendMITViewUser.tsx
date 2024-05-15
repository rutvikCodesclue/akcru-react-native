import {Text, View, Image, SafeAreaView, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';
import {Avatar, Icon} from '@rneui/base';
import SendMITSearchInput from './SendMITSearchInput';
import GenreCard from '../../../components/GenreCard';
import AkcruLevels from '../../../components/akcruBadges';
import imageindex from '../../../../assets/images/imageindex';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {getMovieGenres} from '../../../lib/api/movies.lib';
import {capitalizeFirstLetterOfString, selectAvatarBorderColor} from '../../../util/util';
import {IGenreItem, IUserProfile} from '../../../../types';
import {findAUser} from '../../../lib/api/user.lib';
import TabContainer from '../../../components/TabContainer/TabContainer';
import styles from '../../contentScreens/PlayContentScreen/styles';
type SendMITViewUserNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITViewUser'>;

type SendMITViewUserRouteProp = RouteProp<CrummunityStackParams, 'SendMITViewUser'>;

type Props = {
    navigation: SendMITViewUserNavigationProp;
    route: SendMITViewUserRouteProp;
};

const SendMITViewUser = ({route, navigation}: Props) => {
    const userID: string | undefined = route.params?.userID ?? null;

    useFocusEffect(
        React.useCallback(() => {
            findAUser({id: userID}).then(user => {
                setUser(user);
            });

            return () => {};
        }, []),
    );

    const [user, setUser] = useState<IUserProfile | undefined>(undefined);

    const [genres, setGenres] = React.useState<IGenreItem[]>([]);
    const [loading, setIsLoading] = React.useState(true);

    const fetchGenres = async () => {
        const genres = await getMovieGenres();
        setGenres(genres);
        setIsLoading(false);
    };

    const handleGenrePress = (genre: IGenreItem) => {
        navigation.navigate('SendMITSearchResult', {
            genre: capitalizeFirstLetterOfString(genre.genre),
            userID: user?.id,
            userName: user?.username,
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
                        <View style={styles.backbutton}>
                            <TouchableOpacity
                                onPress={() => navigation.pop()}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 10,
                                }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <SendMITSearchInput userid={userID} />
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
                                data={loading ? undefined : genres}
                                horizontal={false}
                                numColumns={2}
                                scrollEnabled={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View>
                                        <GenreCard
                                            photo={item.image}
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
