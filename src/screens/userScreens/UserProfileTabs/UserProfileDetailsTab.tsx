import {View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Modal, FlatList} from 'react-native';
import React, { useEffect, useState } from 'react'
import styles from './styles';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import imageindex from '../../../../assets/images/imageindex';
import { Icon } from '@rneui/base';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BasicListCategories from '../../../components/BasicListCategories';
import useAuthStore from '../../../stores/auth.store';
import { ICru, IMovie, IUserProfile } from '../../../../types';
import { findMovies } from '../../../lib/api/movies.lib';
import CruMemberPic from '../../../components/CruMemberPic';
import { getMyCRU } from '../../../lib/api/cru.lib';

const UserProfileDetailsTab = () => {
    const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const [newerYearMovies, setNewerYearMovies] = useState<IMovie[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const {user, hydrateUser} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            hydrateUser();
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                hydrateUser();
            };
        }, []),
    );

    const [CRU, setCRU] = useState<ICru | undefined>(undefined); // CRU object from the API
    const [potentialMembers, setPotentialMembers] = useState<IUserProfile[] | []>([]); // Possible member list
    const [members, setMembers] = useState<IUserProfile[] | []>([]);
    const cruMembers = (): IUserProfile[] | [] => {
        return members;
    };

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            getMyCRU().then(res => {
                console.log('Data from getMyCRU:', res); // Log the data
                setCRU(res?.CRU);
                if (res?.CRU.members) {
                    setMembers(res.CRU.members);
                    setPotentialMembers(res.acceptedMembers);
                }
            });

            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                console.log('Screen unfocused [EditCruScreen]');

                // cleanup (if app crashes or user leaves the screen unexpectedly)
            };
        }, []),
    );

    useEffect(() => {
        const fetchNewerYearMovies = async () => {
            try {
                const allMovies: IMovie[] = await findMovies(/* specify parameters if needed */);

                // Sort allMovies by year in descending order
                const sortedMovies = allMovies.sort((a, b) => b.year - a.year);

                // Get the 5 oldest movies
                const Newer5Movies = sortedMovies.slice(0, 5);

                setNewerYearMovies(Newer5Movies);
            } catch (error) {
                console.error('Error fetching top rated movies:', error);
            }
        };
        fetchNewerYearMovies();
    }, []);

    return (
        <View style={{marginHorizontal: SIZES.marginhorizontal}}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <Text
                        style={{
                            ...FONTS.Title2,
                            marginTop: 10,
                            marginBottom: 20,
                            textAlign: 'center',
                            fontSize: 14,
                            textDecorationLine: 'underline',
                        }}>
                        PROFILE DETAILS
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                    }}>
                    <View style={{width: SIZES.ScreenWidth / 2}}>
                        <View>
                            <FlatList
                                data={cruMembers()}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View style={{marginRight: index < cruMembers().length - 1 ? -10 : 0}}>
                                        <CruMemberPic userPicture={item.profilePicture} akcruBadge={item.badge} />
                                    </View>
                                )}
                            />
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('EditCru')} style={{marginVertical: 20}}>
                            <View style={{flexDirection: 'row'}}>
                                <Icon
                                    name="square-edit-outline"
                                    type="material-community"
                                    color={COLORS.MIDORANGE}
                                    size={15}
                                    style={{marginRight: 5}}
                                />
                                <Text
                                    style={{
                                        ...FONTS.Title2,
                                        color: COLORS.MIDORANGE,
                                        fontSize: 12,
                                    }}>
                                    Edit your CRU
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <Text
                                style={{
                                    ...FONTS.Title2,
                                    fontSize: 12,
                                    color: COLORS.LIGHTGREY,
                                }}>
                                Schedule a CRU View through the CRU VIEW scheduler
                            </Text>
                        </View>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <View>
                            <Image source={imageindex.NewCru} style={{width: 120, height: 120}} resizeMode="cover" />
                        </View>

                        <TouchableOpacity onPress={() => navigation.navigate('UserCruChatScreen')}>
                            <View
                                style={{
                                    padding: 8,
                                    backgroundColor: COLORS.MIDORANGE,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 3,
                                    marginTop: 15,
                                    flexDirection: 'row',
                                }}>
                                <Text style={{...FONTS.Title2}}>CRU VIEW </Text>
                                <Icon
                                    name="calendar"
                                    type="material-community"
                                    color={COLORS.WHITE}
                                    size={20}
                                    style={{marginRight: 5}}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View
                    style={{
                        borderBottomWidth: 1.5,
                        borderColor: COLORS.DARKERGREY,
                        marginTop: 20,
                        marginBottom: 10,
                    }}
                />

                <View>
                    <View style={{marginBottom: 75}}>
                        <BasicListCategories
                            Akcru_Content={{
                                id: 'recommendedForYou',
                                title: 'Recommended to you',
                                movies: newerYearMovies,
                            }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default UserProfileDetailsTab;
