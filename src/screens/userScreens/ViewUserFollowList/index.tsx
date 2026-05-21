import {View, Text, useWindowDimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import {COLORS} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {TabView, TabBar} from 'react-native-tab-view';
import ViewUserFollowersTab from '../ViewUserFollowListTabs/ViewUserFollowersTab';
import ViewUserFollowingTab from '../ViewUserFollowListTabs/ViewUserFollowingTab';
import {getFollowers, getUserFollowing} from '../../../lib/api/user.lib';
import {IUserProfile} from '../../../../types';
import styles from './styles';
import BackButton from '../../../components/General/backbutton';

type ViewUserFollowListNavigationProp = StackNavigationProp<UserProfileStackParams, 'ViewUserFollowList'>;

type ViewUserFollowListRouteProp = RouteProp<UserProfileStackParams, 'ViewUserFollowList'>;

type Props = {
    navigation: ViewUserFollowListNavigationProp;
    route: ViewUserFollowListRouteProp;
};

const FirstRoute = ({userID}) => (
    <View style={styles.sceneContainer}>
        <ViewUserFollowersTab userID={userID} />
    </View>
);

const SecondRoute = ({userID}) => (
    <View style={styles.sceneContainer}>
        <ViewUserFollowingTab userID={userID} />
    </View>
);

const ViewUserFollowList = ({route}: Props) => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();
    const userID: string | undefined = route.params?.userID ?? null;
    const tabKey = route.params?.tabKey ?? 'first';

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            scrollEnabled={false}
            tabStyle={styles.tabItem}
            labelStyle={styles.tabLabel}
            style={styles.tabBar}
            contentContainerStyle={styles.tabBarContent}
            activeColor={COLORS.PURPLE}
            inactiveColor={COLORS.LIGHTGREY}
        />
    );

    const layout = useWindowDimensions();

    const [followingData, setFollowingData] = useState<IUserProfile[]>([]);
    const [followersData, setFollowersData] = useState<IUserProfile[]>([]);
    const [index, setIndex] = useState(tabKey === 'second' ? 1 : 0);
    const [routes, setRoutes] = useState([
        {key: 'first', title: 'Followers (0)'},
        {key: 'second', title: 'Following (0)'},
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getUserFollowing(userID);
            if (result && result.following && Array.isArray(result.following)) {
                setFollowingData(result.following);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getFollowers(userID);
            if (result && result.followers && Array.isArray(result.followers)) {
                setFollowersData(result.followers);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const numberOfFollowers = followersData.length;
        const numberOfFollowing = followingData.length;

        setRoutes([
            {key: 'first', title: `Followers (${numberOfFollowers})`},
            {key: 'second', title: `Following (${numberOfFollowing})`},
        ]);
    }, [followingData, followersData]);

    const renderScene = ({route}) => {
        switch (route.key) {
            case 'first':
                return <FirstRoute userID={userID} />;
            case 'second':
                return <SecondRoute userID={userID} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerShell}>
                <View style={styles.headerWrap}>
                    <Header />
                </View>
                <View style={styles.backButtonWrap}>
                    <BackButton navigation={navigation} />
                </View>
            </View>
            <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{width: layout.width}}
                swipeEnabled={true}
                renderTabBar={renderTabBar}
            />
        </View>
    );
};

export default ViewUserFollowList;
