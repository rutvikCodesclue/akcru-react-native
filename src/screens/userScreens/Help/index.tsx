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
            <View>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND}}>
                        <Header />
                        <View style={styles.container}>
                            <View style={{backgroundColor: COLORS.AKCRUBACKGROUND, paddingBottom: 5}}>
                                <BackButton navigation={navigation} />
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
