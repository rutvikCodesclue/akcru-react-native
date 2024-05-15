import {View} from 'react-native';
import React from 'react';
import {FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';

const Bulletin = () => {
    const bulletin = FAKE_USER_PROFILES[0].bulletin;

    return (
        <>
            <View>
                <View style={{marginHorizontal: 15, marginTop: 10}}>
                    {bulletin.map((_, index) => {
                        return <View key={index} />;
                    })}
                </View>
            </View>
        </>
    );
};

export default Bulletin;
