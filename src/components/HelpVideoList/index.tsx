import {View, Text, FlatList, TouchableOpacity, Modal} from 'react-native';
import {FONTS} from '../../../assets/constants';
import React, {useRef, useState} from 'react';
import {IHelpVideo} from '../../../types';
import HexAvatar from '../HexAvatar';
import {COLORS, MULTISIZES, SIZES} from '../../../assets/constants/theme';
import Video from 'react-native-video';
import {Icon} from '@rneui/base';

interface HelpVideoListProps {
    Help_Video: {
        id: string;
        title: string;
        helpvideo: IHelpVideo[];
    };
}

const HelpVideoList = (props: HelpVideoListProps) => {
    const {Help_Video} = props;
    const ITEM_WIDTH = SIZES.ScreenWidth * 0.43;
    const HEX_SIZE = Math.min(MULTISIZES.Xlarge150, ITEM_WIDTH - 8);

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
                columnWrapperStyle={{justifyContent: 'space-between'}}
                contentContainerStyle={{paddingHorizontal: 4}}
                renderItem={({item, index}) => (
                    <View style={{alignItems: 'center', width: ITEM_WIDTH, marginBottom: 14}}>
                        <TouchableOpacity
                            style={{position: 'relative'}}
                            onPress={() => {
                                setSelectedVideoURL(item.videoURL);
                                setVideoModalVisible(true);
                                console.log('Video URL: ', item.videoURL);
                            }}>
                            <HexAvatar
                                source={{uri: item?.imageURL}}
                                size={HEX_SIZE}
                                bordercolor={COLORS.PURPLE}
                                rotateFrameDegrees={90}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                    backgroundColor: 'rgba(0,0,0,0.38)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <Icon
                                    name="play"
                                    type="ionicon"
                                    size={34}
                                    color="rgba(255,255,255,0.72)"
                                    style={{marginLeft: 2}}
                                />
                            </View>
                        </TouchableOpacity>
                        <View style={{marginTop: 6}}>
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
