import React from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import MITDateSchedule from '../../contentScreens/MovieMITScheduleScreen/MITDateSchedule';

type SendMITScheduleNavigationProp = StackNavigationProp<CrummunityStackParams, 'SendMITSchedule'>;
type SendMITScheduleRouteProp = RouteProp<CrummunityStackParams, 'SendMITSchedule'>;

type Props = {
    navigation: SendMITScheduleNavigationProp;
    route: SendMITScheduleRouteProp;
};

export default function SendMITSchedule({route, navigation}: Props) {
    const adaptedRoute = {
        ...route,
        params: {
            ...route.params,
            userId: route.params?.userID ?? (route.params as {userId?: string} | undefined)?.userId,
        },
    };

    return <MITDateSchedule route={adaptedRoute as any} navigation={navigation as any} />;
}
