import {View, Text, TextInput, TouchableOpacity, Pressable, Modal, ImageBackground, SafeAreaView, Alert, Platform} from 'react-native';
import React, { useState } from 'react';
import styles from './styles';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import Header from '../../../components/header';
import {ScrollView} from 'react-native-gesture-handler';
import {Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import { helpData } from '../../../../assets/constants/helpData';
import Accordian from '../../../components/Accordian/Accordian';


const Help = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>()

    return (
        <View>
            <ScrollView stickyHeaderIndices={[0]}>
                <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                    <Header />
                    <View style={styles.container}>
                        <View style={{backgroundColor: COLORS.AKCRUBACKGROUND}}>
                            <TouchableOpacity onPress={() => navigation.pop()}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.title}>FAQ</Text>
                    </View>
                </View>

                <View style={{marginBottom: 75}}>
                    {helpData.map((value, index) => {
                        return <Accordian value={value} key={index} />;
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

export default Help;
