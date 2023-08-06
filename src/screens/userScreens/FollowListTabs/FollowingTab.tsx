import { View, Text, FlatList } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import { FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';
import UserSearchCard from '../../../components/UserSearchCard';

const FollowingTab = () => {
const [data, setData] = useState([...FAKE_USER_PROFILES]);
const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

return (
    <View style={{marginHorizontal: 15, marginBottom: 70}}>
        <FlatList
            data={data}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            keyExtractor={item => item.userID}
            renderItem={({item, index}) => (
                <View style={{marginVertical: 5}}>
                    <UserSearchCard
                        userPicture={item.userPicture}
                        userName={item.userName}
                        onPress={() => {
                            navigation.navigate('ViewUserScreen', {
                                userID: index,
                            });
                        }}
                        influencer={item.influencer}
                        userID={item.userID}
                        akcruBadge={item.akcruBadge}
                        userDesc={item.userDesc}
                        avatarbordercolor={item.avatarbordercolor}
                    />
                </View>
            )}
        />
    </View>
);
}

export default FollowingTab