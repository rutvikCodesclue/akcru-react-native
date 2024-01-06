import {View, Text, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import UserSearchCard from '../../../components/UserSearchCard';
import { getFollowers } from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';

const FollowersTab = () => {
    const [data, setData] = useState<IUserProfile[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    useEffect(() => {
        const fetchData = async () => {
            const result = await getFollowers();
            // console.log('Data received:', result);
            if (result && result.followers && Array.isArray(result.followers)) {
                setData(result.followers); // Set the 'following' array as your data
            }
        };

        fetchData();
    }, []);

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
                                console.log(
                                    'Navigating to ViewUserScreen with userID:',
                                    item.username,
                                    item.id,
                                    item.firstName,
                                );
                                navigation.navigate('ViewUserScreen', {
                                    userID: item.id,
                                });
                            }}
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
