import * as React from 'react';
import {View, SafeAreaView} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import BackButton from '../../../components/General/backbutton';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {
    UserProfileCruInvites,
    UserProfileDatesTab,
    UserProfileDetailsTab,
    UserProfileWalletTab,
} from '../UserProfileTabs';

export type ProfileHubTab = 'details' | 'dates' | 'cru' | 'wallet';

/** Maps legacy `UserProfileScreen` route params to a hub tab for stack push. */
export function hubTabFromProfileRouteParams(
    params: Record<string, unknown> | undefined,
): ProfileHubTab | null {
    if (!params) {
        return null;
    }
    const {index, tabKey} = params;
    if (typeof index === 'number') {
        if (index === 1) {
            return 'dates';
        }
        if (index === 2) {
            return 'cru';
        }
        if (index === 3) {
            return 'wallet';
        }
        return null;
    }
    if (typeof tabKey === 'string') {
        if (tabKey === 'second') {
            return 'dates';
        }
        if (tabKey === 'third') {
            return 'cru';
        }
        if (tabKey === 'fourth') {
            return 'wallet';
        }
        return null;
    }
    if (typeof tabKey === 'number') {
        if (tabKey === 1) {
            return 'dates';
        }
        if (tabKey === 2) {
            return 'cru';
        }
        if (tabKey === 3) {
            return 'wallet';
        }
        if (tabKey === 4) {
            return 'wallet';
        }
        return null;
    }
    return null;
}

type UserProfileHubTabScreenNav = StackNavigationProp<UserProfileStackParams, 'UserProfileHubTabScreen'>;
type UserProfileHubTabScreenRoute = RouteProp<UserProfileStackParams, 'UserProfileHubTabScreen'>;

type Props = {
    navigation: UserProfileHubTabScreenNav;
    route: UserProfileHubTabScreenRoute;
};

export default function UserProfileHubTabScreen({navigation, route}: Props) {
    const {hubTab} = route.params;

    return (
        <TabContainer>
            <SafeAreaView style={{flex: 1}}>
                <BackButton navigation={navigation} />
                <View style={{flex: 1}}>
                    {hubTab === 'details' ? (
                        <View style={{flex: 1, minHeight: 0}}>
                            <UserProfileDetailsTab />
                        </View>
                    ) : null}
                    {hubTab === 'dates' ? <UserProfileDatesTab /> : null}
                    {hubTab === 'cru' ? (
                        <View style={{flex: 1}}>
                            <UserProfileCruInvites />
                        </View>
                    ) : null}
                    {hubTab === 'wallet' ? <UserProfileWalletTab /> : null}
                </View>
            </SafeAreaView>
        </TabContainer>
    );
}
