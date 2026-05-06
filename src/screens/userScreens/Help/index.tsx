import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import styles from './styles';
import {COLORS} from '../../../../assets/constants';
import Header from '../../../components/header';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserProfileStackParams} from '../../../navigation/UserProfileStack';
import {helpData} from '../../../../assets/constants/helpData';
import Accordian from '../../../components/Accordian/Accordian';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {IHelpVideo} from '../../../../types';
import {getHelpVideos} from '../../../lib/api/helpvideo.lib';
import HelpVideoList from '../../../components/HelpVideoList';
import BackButton from '../../../components/General/backbutton';

const Help = () => {
    const navigation = useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

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
            <View style={styles.screenRoot}>
                <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.headerWrap}>
                        <Header />
                        <View style={styles.container}>
                            <View style={{backgroundColor: COLORS.BLACK, paddingBottom: 5}}>
                                <BackButton navigation={navigation} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.title}>FAQ</Text>
                        <Text style={styles.subtitle}>Find quick answers to common questions</Text>
                        <View style={styles.sectionCard}>
                            {helpData.map((value, index) => {
                                return <Accordian value={value} key={index} />;
                            })}
                        </View>
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.title}>TUTORIALS BY TRINITY</Text>
                        <Text style={styles.subtitle}>Watch step-by-step guides</Text>
                        <View style={styles.sectionCard}>
                            <View style={styles.tutorialWrap}>
                                <HelpVideoList
                                    Help_Video={{
                                        id: 'helpvideo',
                                        title: '',
                                        helpvideo: helpVideos,
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </TabContainer>
    );
};

export default Help;
