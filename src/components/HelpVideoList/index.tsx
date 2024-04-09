import {View, Text, Image, FlatList, TouchableOpacity, Modal} from 'react-native';
import styles from './styles';
import { FONTS } from '../../../assets/constants';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { IHelpVideo} from '../../../types';
import { NoBottomTabStackParams } from '../../navigation/NoBottomTabStack';
import HexAvatar from '../HexAvatar';
import { COLORS, MULTISIZES, SIZES } from '../../../assets/constants/theme';
import Video from 'react-native-video';

interface HelpVideoListProps {
    Help_Video: {
        id: string;
        title: string;
        helpvideo: IHelpVideo[];
    };
}

const HelpVideoList = (props: HelpVideoListProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const {Help_Video} = props;

    const modalVideoRef = useRef(null);

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [showSkipButton, setShowSkipButton] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [selectedVideoURL, setSelectedVideoURL] = useState('');

    const handleVideoError = () => {
        // Logic for handling video errors
        setVideoModalVisible(false);
    };

    const handleVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
    };

    const handleModalVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
        setShowSkipButton(true);
    };

    const handleSkipVideo = () => {
        // Logic for skipping the video
        setVideoModalVisible(false);
    };

    const handleVideoEnd = () => {
        // Logic for when the video ends
        setVideoModalVisible(false);
    };

    return (
        <View style={{marginBottom: '5%', alignContent: 'center'}}>
            <FlatList
                data={Help_Video.helpvideo}
                numColumns={2}
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index}) => (
                    <View style={{alignItems: 'center', width: SIZES.ScreenWidth * 0.45, margin: 10}}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedVideoURL(item.videoURL);
                                setVideoModalVisible(true);
                                console.log('Video URL: ', item.videoURL);
                            }}>
                            <HexAvatar
                                source={{uri: item?.imageURL}}
                                size={MULTISIZES.Xlarge150}
                                bordercolor={COLORS.PURPLE}
                            />
                        </TouchableOpacity>
                        <View>
                            <Text style={{...FONTS.paragraph2, textAlign: 'center'}}>{item.title}</Text>
                        </View>
                    </View>
                )}
            />
            <Modal visible={isVideoModalVisible} transparent={true} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}>
                    <Video
                        ref={modalVideoRef}
                        style={{width: '100%', height: '100%'}}
                        source={{uri: selectedVideoURL}}
                        resizeMode="cover"
                        onEnd={handleVideoEnd}
                        repeat={false}
                        onError={handleVideoError}
                        onLoad={handleModalVideoLoad}
                        muted={false}
                    />
                    {/* {showSkipButton && (
                        <View style={{position: 'absolute', zIndex: 10, bottom: '3%', right: '50%', left: '33%'}}>
                            <AkcruButtons.SmallButton
                                color={COLORS.PINK}
                                btnname={'Skip'}
                                onPress={handleSkipVideo}
                                disabled={false}
                            />
                        </View>
                    )} */}
                </View>
            </Modal>
        </View>
    );
};

export default HelpVideoList;
