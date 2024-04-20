import {View, Text, TextInput, TouchableOpacity, Pressable, Modal, ImageBackground, Alert, Platform, Image, FlatList} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import React, { useEffect, useRef, useState } from 'react';
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
import TabContainer from '../../../components/TabContainer/TabContainer';
import { IHelpVideo } from '../../../../types';
import { getHelpVideos } from '../../../lib/api/helpvideo.lib';
import HelpVideoList from '../../../components/HelpVideoList';
import Video from 'react-native-video';
import AkcruButtons from '../../../components/akcruButtons';


const Help = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>()

    const [helpVideos, setHelpVideos] = useState<IHelpVideo[]>([]);

    useEffect(() => {
        const loadHelpVideos = async () => {
            const fetchedHelpVideos = await getHelpVideos();
            setHelpVideos(fetchedHelpVideos);
        };
        loadHelpVideos();
    }, []);

    

    return (
        <TabContainer>
            <View>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                        <Header />
                        <View style={styles.container}>
                            <View style={{backgroundColor: COLORS.AKCRUBACKGROUND, paddingBottom: 5}}>
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
                        </View>
                    </View>

                    <View style={{marginBottom: 10}}>
                        <Text style={styles.title}>FAQ</Text>
                        {helpData.map((value, index) => {
                            return <Accordian value={value} key={index} />;
                        })}
                    </View>
                    <Text style={styles.title}>TUTORIALS BY TRINITY</Text>

                    <View style={{}}>
                        <HelpVideoList
                            Help_Video={{
                                id: 'helpvideo',
                                title: '',
                                helpvideo: helpVideos,
                            }}
                        />
                    </View>
                </ScrollView>
            </View>
        </TabContainer>
    );
};

export default Help;
