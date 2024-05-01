import {View, Text, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import UserSearchCard from '../../../components/UserSearchCard';
import { getFollowers } from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import useAuthStore from '../../../stores/auth.store';

const FollowersTab = () => {
    const [data, setData] = useState<IUserProfile[]>([]);

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

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    const result = await getFollowers(user.id);
                    if (result && result.followers && Array.isArray(result.followers)) {
                        setData(result.followers); // Set the 'following' array as your data
                    }
                } catch (error) {
                    console.error('Error fetching followers:', error);
                    // Optionally, handle the error by showing a message to the user or taking other actions
                }
            }
        };

        fetchData();
    }, [user?.id]);

    return (
        <View style={{marginHorizontal: 15}}>
            <FlatList
                data={data}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => (
                    <View style={{marginVertical: 5}}>
                        <UserSearchCard
                            userPicture={item.profilePicture}
                            userName={item.username}
                            onPress={() => {
                                // console.log(
                                //     'Navigating to ViewUserScreen with userID:',
                                //     item.username,
                                //     item.id,
                                //     item.firstName,
                                // );
                                navigation.navigate('ViewUserScreen', {
                                    userID: item.id,
                                });
                            }}
                            companyStatus={item?.companyStatus}
                            ownerStatus={item?.ownerStatus}
                            influencer={item.influencerStatus}
                            userID={item.id}
                            akcruBadge={item.badge}
                            userDesc={item.description}
                            firstName={item.firstName}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default FollowersTab;
