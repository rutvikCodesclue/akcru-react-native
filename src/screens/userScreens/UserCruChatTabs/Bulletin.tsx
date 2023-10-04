import {View, Text, TouchableOpacity, ScrollView, ImageBackground} from 'react-native';
import React from 'react';
import Header from '../../../components/header';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {DIGITAL_PASS, FAKE_USER_PROFILES} from '../../../../assets/constants/Mockusers';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';

const Bulletin = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    const bulletin = FAKE_USER_PROFILES[0].bulletin;

    return (
        <>
        <View>      
            <View style={{marginHorizontal: 15, marginTop: 10}}>
                    {/* Render user notifications */}
                    {bulletin.map((bulletin, index) => {
                        const type = Object.keys(bulletin)[0];
                        const message = bulletin[type];

                        return (
                            <View key={index} >
                                {/* <Text style={{...FONTS.Title2, color: COLORS.AKCRUBLUE}}>{`${type}:`}</Text>
                                <Text style={{...FONTS.paragraph1}}>{`${message}`}</Text> */}
                            </View>
                        );
                    })}
            </View> 
        </View>
        </>
        
    );
};

export default Bulletin;
