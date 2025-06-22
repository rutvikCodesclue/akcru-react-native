import {View, TextInput, FlatList, SafeAreaView} from 'react-native';
import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import UserSearchCard from '../../../components/UserSearchCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import {COLORS} from '../../../../assets/constants';
import {ScrollView} from 'react-native-gesture-handler';
import {fetchRandomUsers, fetchCrusaders, searchForUsers} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import CrusaderCard from '../../../components/CrusaderCard';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';

const CrusaderScreen = () => {
    const [data, setData] = useState<IUserProfile[] | []>([]);

    const [, setTextInputFocused] = useState(false);
    const textInputRef = useRef(null);
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const [searchInput, setSearchInput] = useState('');

    const handleSearch = (text: any) => {
        setSearchInput(text);
        if (text.length > 1) {
            searchForUsers(text).then(res => {
                if (res.length > 0) {
                    setData(res);
                }
            });
        }
    };

    const [crusaders, setCrusaders] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const loadUsersWithFollowers = async () => {
            const fetchedUsers = await fetchCrusaders();

            setCrusaders(fetchedUsers); // Directly use the backend order
        };

        loadUsersWithFollowers().catch(console.error);
    }, []);


    return (
        <TabContainer>
            <SafeAreaView>
                <View>
                    <Header />
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.searchinput}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon
                                    name="magnify"
                                    type="material-community"
                                    color={COLORS.AKCRUBLUE}
                                    size={28}
                                    style={{marginRight: 10}}
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
                                    style={{color: COLORS.LIGHTGREY, width: '100%'}}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <ScrollView>
                    {searchInput.length === 0 && (
                        <View style={{marginBottom: '45%', alignItems: 'center'}}>
                            <FlatList
                                data={crusaders}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                numColumns={3}
                                scrollEnabled={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View style={{padding: 5}}>
                                        <CrusaderCard
                                            userPicture={item.profilePicture}
                                            userName={item.username}
                                            onPress={() => {
                                                navigation.navigate('ViewUserScreen', {
                                                    userID: item.id,
                                                });
                                                setTextInputFocused(true);
                                            }}
                                            userID={item.id}
                                            akcruBadge={item.badge}
                                            userDesc={item.description}
                                            firstName={item.firstName}
                                            ownerStatus={item.ownerStatus}
                                            companyStatus={item.companyStatus}
                                            influencerStatus={item.influencerStatus}
                                            blackCloakStatus={item.blackCloakStatus}
                                            isAdmin={item?.isAdmin}
                                            isArchetypeMatch={item.isArchetypeMatch} // Pass the flag from backend
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    )}

                    {searchInput.length > 0 && (
                        <View style={{marginHorizontal: 15, marginBottom: '20%'}}>
                            <FlatList
                                data={data}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={false}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <View style={{marginVertical: 5}}>
                                        <UserSearchCard
                                            userPicture={item.profilePicture}
                                            userName={item.username}
                                            onPress={() => {
                                                navigation.navigate('ViewUserScreen', {
                                                    userID: item.id,
                                                });
                                                setTextInputFocused(true);
                                            }}
                                            userID={item.id}
                                            akcruBadge={item.badge}
                                            userDesc={item.description}
                                            firstName={item.firstName}
                                            ownerStatus={item.ownerStatus}
                                            companyStatus={item.companyStatus}
                                            influencerStatus={item.influencerStatus}
                                            blackCloakStatus={item.blackCloakStatus}
                                            isAdmin={item?.isAdmin}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default CrusaderScreen;
