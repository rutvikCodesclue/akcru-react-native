import {View} from 'react-native';
import React from 'react';
import AkcruLevels from '../akcruBadges';

const DisplayBadge = ({akcruBadge}: any) => {
    return (
        <View>
            {akcruBadge === 'AKCRUIT' && (
                <View>
                    <AkcruLevels.AkcruBadgeAkcruit />
                </View>
            )}
            {akcruBadge === 'GUARDIAN' && (
                <View>
                    <AkcruLevels.AkcruBadgeGuardian />
                </View>
            )}
            {akcruBadge === 'HERO' && (
                <View>
                    <AkcruLevels.AkcruBadgeHero />
                </View>
            )}
            {akcruBadge === 'SUPERHERO' && (
                <View>
                    <AkcruLevels.AkcruBadgeSuperHero />
                </View>
            )}
        </View>
    );
};

export default DisplayBadge;
