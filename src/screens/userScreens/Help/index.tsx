import {View, Text, TextInput, TouchableOpacity, Pressable, Modal, ImageBackground, SafeAreaView, Alert, Platform, Image, FlatList} from 'react-native';
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
import imageindex from '../../../../assets/images/imageindex';
import { TrinityHowToData } from '../../../../assets/constants/helpData';
import HowToTrinity from '../../../components/HowToTrinity';


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

                <View style={{marginBottom: 10}}>
                    {helpData.map((value, index) => {
                        return <Accordian value={value} key={index} />;
                    })}
                </View>
                <Text style={styles.title}>TUTORIALS BY TRINITY</Text>
                <View style={{}}>
                    <FlatList
                        data={TrinityHowToData}
                        keyExtractor={item => item.id}
                        horizontal={false}
                        numColumns={2}
                        renderItem={({item}) => <HowToTrinity value={item} />}
                        contentContainerStyle={{alignSelf: 'center', marginBottom: 75}}
                    />
                </View>

                {/* <View style={{width: '93%', alignSelf: 'center', marginBottom: 75}}></View> */}
            </ScrollView>
        </View>
    );
};

export default Help;
