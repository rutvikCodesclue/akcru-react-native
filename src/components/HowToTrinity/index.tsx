import {View, Text, Pressable, Image, Modal, ActivityIndicator, Alert} from 'react-native';
import React, {useState} from 'react';
import imageindex from '../../../assets/images/imageindex';
import {COLORS, FONTS} from '../../../assets/constants';
import {TrinityHowToData} from '../../../assets/constants/helpData';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';
import Svg, {Path} from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';

type Props = {
    value: TrinityHowToData;
};

export default function HowToTrinity({value}: Props) {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [trinityModal, setTrinityModal] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [showSkipButton, setShowSkipButton] = useState(false);

    const handleSkipVideo = () => {
        // Logic for skipping the video
        setTrinityModal(false);
    };

    const handleVideoEnd = () => {
        // Logic for when the video ends
        setTrinityModal(false);
    };

    const handleVideoError = () => {
        // Logic for handling video errors
        Alert.alert(
            'Video Loading Error',
            "We're having trouble loading this video. Please check your connection and try again.",
            [
                {
                    text: 'Retry',
                    onPress: () => {
                        /* Retry logic here */
                    },
                },
                {text: 'Cancel', onPress: () => setTrinityModal(false)},
            ],
        );
        setTrinityModal(false);
    };

    const handleVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
        setShowSkipButton(true);
    };

    const hexagonPath = 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z';
    const borderSize = 5;
    const size = 150;
    const bordercolor = COLORS.PURPLE;

    return (
        <View>
            <Pressable style={{alignItems: 'center', padding: 20}} onPress={() => setTrinityModal(true)}>
                <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
                    <Svg height={size} width={size} viewBox={`0 0 270 234`} style={{position: 'absolute'}}>
                        <Path d={hexagonPath} fill={bordercolor} />
                    </Svg>
                    <MaskedView
                        style={{width: size - borderSize, height: size - borderSize, alignSelf: 'center'}}
                        maskElement={
                            <Svg
                                height={size - borderSize}
                                width={size - borderSize}
                                viewBox={`0 0 270 234`}
                                style={{overflow: 'hidden'}}>
                                <Path d={hexagonPath} fill="black" />
                            </Svg>
                        }>
                        <Image
                            source={imageindex.Trinity}
                            style={{width: size, height: size, alignSelf: 'center'}}
                            resizeMode="cover"
                        />
                    </MaskedView>
                </View>
                {/* <Image
                  source={imageindex.Trinity}
                  style={{width: 150, height: 150, borderRadius: 100, borderColor: COLORS.PURPLE, borderWidth: 2}}
              /> */}
                <Text style={{...FONTS.Title2, paddingTop: 10, width: '75%', textAlign: 'center'}}>{value.title}</Text>
            </Pressable>

            <Modal animationType="fade" transparent={true} visible={trinityModal}>
                <View
                    style={{flex: 1, justifyContent: 'center', backgroundColor: COLORS.AKCRUBACKGROUND, width: '100%'}}>
                    {/* Display the loading indicator if the video is still loading */}
                    {!isVideoLoaded && (
                        <View style={{position: 'absolute', zIndex: 10, bottom: '50%', left: '50%'}}>
                            <ActivityIndicator size="large" color={COLORS.PURPLE} />
                        </View>
                    )}
                    <Video
                        style={{width: '100%', height: '100%'}}
                        source={{uri: value.link}}
                        resizeMode="cover"
                        onEnd={handleVideoEnd}
                        repeat={false}
                        onError={handleVideoError}
                        onLoad={handleVideoLoad}
                    />

                    {showSkipButton && (
                        <View style={{position: 'absolute', zIndex: 10, bottom: '3%', right: '50%', left: '33%'}}>
                            <AkcruButtons.SmallButton
                                color={COLORS.MIDORANGE}
                                btnname={'Skip'}
                                onPress={handleSkipVideo}
                                disabled={false}
                            />
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}
