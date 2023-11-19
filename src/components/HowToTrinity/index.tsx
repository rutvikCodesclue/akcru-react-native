import { View, Text, Pressable, Image, Modal, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import imageindex from '../../../assets/images/imageindex';
import { COLORS, FONTS } from '../../../assets/constants';
import { TrinityHowToData } from '../../../assets/constants/helpData';
import Video from 'react-native-video';
import AkcruButtons from '../akcruButtons';

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
        setTrinityModal(false);
    };

    const handleVideoLoad = () => {
        // Logic for when the video is loaded
        setIsVideoLoaded(true);
        setShowSkipButton(true);
    };

  return (
      <View>
          <Pressable style={{alignItems: 'center', padding: 20}} onPress={() => setTrinityModal(true)}>
              <Image
                  source={imageindex.Trinity}
                  style={{width: 150, height: 150, borderRadius: 100, borderColor: COLORS.PURPLE, borderWidth: 2}}
              />
              <Text style={{...FONTS.Title2, paddingTop: 10}}>{value.title}</Text>
          </Pressable>

          <Modal animationType="fade" transparent={true} visible={trinityModal}>
              <View style={{flex: 1, justifyContent: 'center', backgroundColor: COLORS.AKCRUBACKGROUND, width: '100%'}}>
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