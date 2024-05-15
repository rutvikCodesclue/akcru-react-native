import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Avatar} from '@rneui/base';
import {FAKE_USER_PROFILES} from '../../../assets/constants/Mockusers';
import {COLORS, FONTS} from '../../../assets/constants';

const MITChatCard = () => {
    return (
        <View style={styles.cardcontainer}>
            <Avatar
                rounded
                size={40}
                source={{
                    uri: FAKE_USER_PROFILES[0].userPicture,
                }}
                avatarStyle={{
                    borderWidth: 2,
                    borderColor: COLORS.AKCRUBLUE,
                }}
            />
            <View style={{marginLeft: 8}}>
                <Text style={{...FONTS.Title2}}>{FAKE_USER_PROFILES[0].userName}</Text>
                <Text style={styles.post}>{FAKE_USER_PROFILES[0].crummunityPost}</Text>
            </View>
        </View>
    );
};

export default MITChatCard;

const styles = StyleSheet.create({
    cardcontainer: {
        backgroundColor: '#1C202A',
        borderRadius: 5,
        padding: 10,

        flexDirection: 'row',
        marginBottom: 10,
    },
    post: {
        ...FONTS.paragraph1,
        fontSize: 12,
    },
});
