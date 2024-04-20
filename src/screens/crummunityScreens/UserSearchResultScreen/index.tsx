import {
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  FlatList
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import styles from './styles';
import React, {useState, useRef, useEffect} from 'react';
import Header from '../../../components/header';
import UserSearchCard from '../../../components/UserSearchCard';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';

import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import {FONTS, COLORS} from '../../../../assets/constants';
import {ScrollView} from 'react-native-gesture-handler';
import { fetchRandomUsers, searchForUsers } from '../../../lib/api/user.lib';
import { IUserProfile } from '../../../../types';
import { ClientStackParams } from '../../../navigation/ClientStack';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import TabContainer from '../../../components/TabContainer/TabContainer';



const UserSearchResultScreen = () => {
    const [data, setData] = useState<IUserProfile[] | []>([]);

    const [textInputFocused, setTextInputFocused] = useState(false);
    const textInputRef = useRef(null);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const [searchInput, setSearchInput] = useState(''); // track search input

    const contains = ({userName}: {userName: string}, query: string) => {
        if (userName.toLowerCase().includes(query.toLowerCase())) {
            return true;
        }
        return false;
    };
    const handleSearch = (text: any) => {
        setSearchInput(text); // Update searchInput whenever the text changes
        if (text.length > 1) {
            // send search request to backend when text is 2 or more characte
            searchForUsers(text).then(res => {
                if (res.length > 0) {
                    setData(res);
                }
            });
        }
    };

    const [randomUsers, setRandomUsers] = useState<IUserProfile[]>([]);

    useEffect(() => {
        const loadRandomUsers = async () => {
            const fetchedUsers = await fetchRandomUsers();
            setRandomUsers(fetchedUsers);
        };

        loadRandomUsers().catch(console.error);
    }, []);

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
                        <Header />
                        <TouchableOpacity
                            style={{marginHorizontal: 15, marginBottom: 10}}
                            onPress={() => navigation.pop()}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                            </View>
                        </TouchableOpacity>
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

                                <TouchableWithoutFeedback onPress={() => {}}>
                                    <Icon
                                        name="close-circle"
                                        type="material-community"
                                        size={25}
                                        color={COLORS.DARKGREY}
                                        style={{}}
                                        onPress={() => {
                                            textInputRef.current.clear();
                                            handleSearch(textInputRef);
                                            setTextInputFocused(true);
                                        }}
                                    />
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </View>
                    {searchInput.length === 0 && (
                    <View style={{marginHorizontal: 15, marginBottom: '20%'}}>
                        <FlatList
                            data={randomUsers}
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
                                            //console.log('Navigating to ViewUserScreen with userID:', item.username, item.id);
                                            navigation.navigate('ViewUserScreen', {
                                                userID: item.id,
                                            });
                                            setTextInputFocused(true);
                                        }}
                                        // influencer={item.influencer} // TODO: handle this
                                        userID={item.id}
                                        akcruBadge={item.badge}
                                        userDesc={item.description}
                                        firstName={item.firstName}
                                        ownerStatus={item.ownerStatus} // Dynamically passed
                                        companyStatus={item.companyStatus} // Dynamically passed
                                        influencerStatus={item.influencerStatus} // Dynamically passed
                                    />
                                </View>
                            )}
                        />
                    </View>)}
                    
                    {/* Render this FlatList only if there is search input */}
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
                                            //console.log('Navigating to ViewUserScreen with userID:', item.username, item.id);
                                            navigation.navigate('ViewUserScreen', {
                                                userID: item.id,
                                            });
                                            setTextInputFocused(true);
                                        }}
                                        // influencer={item.influencer} // TODO: handle this
                                        userID={item.id}
                                        akcruBadge={item.badge}
                                        userDesc={item.description}
                                        firstName={item.firstName}
                                        ownerStatus={item.ownerStatus} // Dynamically passed
                                        companyStatus={item.companyStatus} // Dynamically passed
                                        influencerStatus={item.influencerStatus} // Dynamically passed
                                    />
                                </View>
                            )}
                        />
                    </View>)}
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default UserSearchResultScreen;
