import {View} from 'react-native';
import React from 'react';
import {SIZES} from '../../../../assets/constants';
import UpcomingDatesSection from '../../../components/UpcomingDatesSection';

const UserProfileDatesTab = () => {
    return (
        <View style={{marginHorizontal: SIZES.marginhorizontal}}>
            <UpcomingDatesSection sectionTitle="YOUR SCHEDULE" embeddedInParentScroll={false} cardsBottomMargin={75} />
        </View>
    );
};

export default UserProfileDatesTab;
