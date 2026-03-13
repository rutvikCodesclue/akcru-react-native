import {View, Text, ImageBackground, KeyboardAvoidingView, TextInput, FlatList, ScrollView} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Icon} from '@rneui/themed';
import {IUserProfile} from '../../../../types';
import {fetchRandomUsers, searchForUsers} from '../../../lib/api/user.lib';
import UserCruBuilderCard from '../../../components/UserCruBuilderCard';
import useAuthStore from '../../../stores/auth.store';
import {getCruInviteStatus, createACRUInvite, checkUserMembership} from '../../../lib/api/cru.lib';
import LinearGradient from 'react-native-linear-gradient';

const OnboardCruSuggestions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const {user: currentUser} = useAuthStore();

    const [data, setData] = useState<IUserProfile[] | []>([]);
    const [, setTextInputFocused] = useState(false);
    const textInputRef = useRef(null);
    const [searchInput, setSearchInput] = useState('');
    const [randomUsers, setRandomUsers] = useState<IUserProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [inviteStatuses, setInviteStatuses] = useState<{[key: string]: {status: string; isMember: boolean}}>({});

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

    useEffect(() => {
        const loadRandomUsers = async () => {
            const fetchedUsers = await fetchRandomUsers();
            setRandomUsers(fetchedUsers);
            fetchedUsers.forEach(async user => {
                const status = await getCruInviteStatus(user.id);
                const isMember = await checkUserMembership(user.id);
                setInviteStatuses(prevStatuses => ({
                    ...prevStatuses,
                    [user.id]: {status, isMember},
                }));
            });
        };

        loadRandomUsers().catch(console.error);
    }, []);

    const handleSendCruInvite = async (username: string, userID: string) => {
        try {
            const senderId = currentUser?.id as string;
            const response = await createACRUInvite({username, senderId});

            if (response) {
                const status = await getCruInviteStatus(userID);
                setInviteStatuses(prevStatuses => ({
                    ...prevStatuses,
                    [userID]: {status, isMember: prevStatuses[userID]?.isMember ?? false},
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleNavigateToSwipe = () => {
        navigation.navigate('NoBottomStack', {screen: 'ContentSwipe'});
    };

    return (
        <View>
            <ImageBackground style={styles.bgimage} source={imageindex.BgImageSM} resizeMode={'cover'}>
                          <LinearGradient
                                            colors={[COLORS.AKCRUBACKGROUND, 'transparent', COLORS.AKCRUBACKGROUND]}
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                height: SIZES.ScreenHeight,
                                            }}
                                        />
                <View style={{flex: 1}}>
                    <View style={styles.container}>
                        {/* <BackButton navigation={navigation} /> */}
                        <View>
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
                                <View style={{marginBottom: '35%'}}>
                                    <FlatList
                                        data={randomUsers}
                                        horizontal={false}
                                        showsHorizontalScrollIndicator={false}
                                        scrollEnabled={false}
                                        keyExtractor={item => item.id}
                                        renderItem={({item, index}) => (
                                            <View style={{marginVertical: 5}}>
                                                <UserCruBuilderCard
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
                                                    isAdmin={item.isAdmin}
                                                    handleSendCruInvite={handleSendCruInvite}
                                                    inviteStatus={inviteStatuses[item.id]?.status || ''}
                                                    isMember={inviteStatuses[item.id]?.isMember || false}
                                                />
                                            </View>
                                        )}
                                    />
                                </View>
                            )}

                            {searchInput.length > 0 && (
                                <View style={{marginBottom: '15%'}}>
                                    <FlatList
                                        data={data}
                                        horizontal={false}
                                        showsHorizontalScrollIndicator={false}
                                        scrollEnabled={false}
                                        keyExtractor={item => item.id}
                                        renderItem={({item, index}) => (
                                            <View style={{marginVertical: 5}}>
                                                <UserCruBuilderCard
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
                                                    handleSendCruInvite={handleSendCruInvite}
                                                    inviteStatus={inviteStatuses[item.id]?.status || ''}
                                                    isMember={inviteStatuses[item.id]?.isMember || false}
                                                />
                                            </View>
                                        )}
                                    />
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

export default OnboardCruSuggestions;
