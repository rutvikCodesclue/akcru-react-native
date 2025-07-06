import {View, TouchableWithoutFeedback, TextInput, FlatList, SafeAreaView} from 'react-native';
import styles from './styles';
import React, {useState, useRef} from 'react';
import Header from '../../../components/header';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@rneui/base';

import {COLORS} from '../../../../assets/constants';
import {ScrollView} from 'react-native-gesture-handler';
import {searchForUsers} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import UserWalletSearchCard from '../../../components/UserWalletSearchCard';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';

const AdminWalletSearch = () => {
    const [data, setData] = useState<IUserProfile[] | []>([]);

    const [textInputFocused, setTextInputFocused] = useState(false);
    const textInputRef = useRef(null);
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();


    const handleSearch = (text: any) => {
        if (text.length > 1) {
            searchForUsers(text).then(res => {
                if (res.length > 0) {
                    setData(res);
                }
            });
        }
    };

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <BackButton navigation={navigation} />
                    <View style={styles.backbutton}>
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

                    <View style={{marginHorizontal: 15, marginBottom: 70}}>
                        <FlatList
                            data={data}
                            horizontal={false}
                            showsHorizontalScrollIndicator={false}
                            scrollEnabled={false}
                            keyExtractor={item => item.id}
                            renderItem={({item, index}) => (
                                <View style={{marginVertical: 5}}>
                                    <UserWalletSearchCard
                                        userPicture={item.profilePicture}
                                        userName={item.username}
                                        onPress={() => {
                                            //console.log('Navigating to ViewUserScreen with userID:', item.username, item.id);
                                            navigation.navigate('ViewUserScreen', {
                                                userID: item.id,
                                            });
                                            setTextInputFocused(true);
                                        }}
                                        userID={item.id}
                                        akcruBadge={item.badge}
                                        userDesc={item.description}
                                        onPressIn={() => {
                                            navigation.navigate('AdminGrantADScreen', {
                                                selectedUser: item,
                                            });
                                            setTextInputFocused(true);
                                        }}
                                        firstName={item.firstName}
                                        ownerStatus={item.ownerStatus}
                                        companyStatus={item.companyStatus}
                                        influencerStatus={item.influencerStatus}
                                        blackcloakStatus={item.blackCloakStatus}
                                    />
                                </View>
                            )}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};

export default AdminWalletSearch;
