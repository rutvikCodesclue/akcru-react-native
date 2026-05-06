import {View, Text, FlatList, ActivityIndicator, Alert, StyleSheet, Platform} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import Header from '../../../components/header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import {getBlockedUsers, unblockUser} from '../../../lib/api/user.lib';
import BlockedUserCard from '../../../components/BlockedUserCard';
import BackButton from '../../../components/General/backbutton';

const BlockedUsers = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        setLoading(true);
        const response = await getBlockedUsers();
        if (response.success) {
            setBlockedUsers(response.blockedUsers || []);
        } else {
        }
        setLoading(false);
    };

    const handleUnblockUser = async userId => {
        const userIdToUnblock = userId;
        const {success, message} = await unblockUser(userIdToUnblock);
        if (success) {
            fetchBlockedUsers();
        } else {
            Alert.alert('Error', `Failed to unblock user: ${message}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={COLORS.AKCRUBLUE} />
            </View>
        );
    }

    return (
        <View style={styles.screenRoot}>
            <View style={{zIndex: 100}}>
                <Header />
            </View>
            <View style={styles.container}>
                <BackButton navigation={navigation} />
                <Text style={styles.title}>BLOCKED USERS</Text>
                <Text style={styles.subtitle}>Manage users you have blocked</Text>
                <View style={styles.listCard}>
                    {blockedUsers.length === 0 ? (
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>You have not blocked any users</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={blockedUsers}
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            renderItem={({item}) => (
                                <View style={styles.listItemWrap}>
                                    <BlockedUserCard
                                        userPicture={item.profilePicture}
                                        userName={item.username}
                                        onPress={() => {
                                            navigation.navigate('ViewUserScreen', {
                                                userID: item.id,
                                            });
                                        }}
                                        influencerStatus={item.influencerStatus}
                                        ownerStatus={item.ownerStatus}
                                        companyStatus={item.companyStatus}
                                        blackCloakStatus={item.blackCloakStatus}
                                        userID={item.id}
                                        akcruBadge={item.badge}
                                        userDesc={item.description}
                                        firstName={item.firstName}
                                        unblock={() => handleUnblockUser(item.id)}
                                    />
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenRoot: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.BLACK,
    },
    container: {
        marginHorizontal: SIZES.ScreenWidth * 0.03,
        marginTop: Platform.OS === 'ios' ? '-2%' : '-1%',
        paddingBottom: 16,
    },
    title: {
        ...FONTS.Title2,
        marginTop: 10,
        textAlign: 'center',
        color: COLORS.AKCRUBLUE,
        textDecorationLine: 'underline',
    },
    subtitle: {
        ...FONTS.paragraph2,
        marginTop: 8,
        textAlign: 'center',
        color: COLORS.LIGHTGREY,
    },
    listCard: {
        marginTop: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10,
    },
    listContent: {
        paddingBottom: 8,
    },
    listItemWrap: {
        marginVertical: 6,
    },
    emptyWrap: {
        paddingVertical: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...FONTS.Title2,
        color: COLORS.DARKGREY,
        textAlign: 'center',
    },
});

export default BlockedUsers;
