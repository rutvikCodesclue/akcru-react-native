import {View, Text, FlatList, TouchableOpacity, Modal} from 'react-native';
import {FONTS} from '../../../assets/constants';
import React, {useRef, useState} from 'react';
import {IHelpVideo} from '../../../types';
import HexAvatar from '../HexAvatar';
import {COLORS, MULTISIZES, SIZES} from '../../../assets/constants/theme';
import Video from 'react-native-video';

interface HelpVideoListProps {
    Help_Video: {
        id: string;
        title: string;
        helpvideo: IHelpVideo[];
    };
}

const HelpVideoList = (props: HelpVideoListProps) => {
    const {Help_Video} = props;

    const modalVideoRef = useRef(null);

    const [isVideoModalVisible, setVideoModalVisible] = useState(false);
    const [, setShowSkipButton] = useState(false);
    const [, setIsVideoLoaded] = useState(false);
    const [selectedVideoURL, setSelectedVideoURL] = useState('');

    const handleVideoError = () => {
        setVideoModalVisible(false);
    };

    const handleModalVideoLoad = () => {
        setIsVideoLoaded(true);
        setShowSkipButton(true);
    };

    const handleVideoEnd = () => {
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
                </View>
            </Modal>
        </View>
    );
};

export default HelpVideoList;
