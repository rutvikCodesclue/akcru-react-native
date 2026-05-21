import {View, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import UserDiscoveryCard from '../../../components/UserDiscoveryCard';
import {getFollowers} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';

const ViewUserFollowersTab = ({userID}) => {
    const [data, setData] = useState<IUserProfile[]>([]);

    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    useEffect(() => {
        const fetchData = async () => {
            const result = await getFollowers(userID);

            if (result && result.followers && Array.isArray(result.followers)) {
                setData(result.followers);
            }
        };

        fetchData();
    }, [userID]);

    return (
        <View style={{marginHorizontal: 15}}>
            <FlatList
                data={data}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => (
                    <View style={{marginVertical: 0}}>
                        <UserDiscoveryCard
                            user={item}
                            displayName={`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || item.username}
                            handle={`@${item.username ?? ''}`}
                            fallbackDescription="Tap to view profile"
                            onPress={() => {
                                navigation.navigate('ViewUserScreen', {
                                    userID: item.id,
                                });
                            }}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default ViewUserFollowersTab;
