import { Pressable, TouchableWithoutFeedback, Image, Dimensions, Modal } from 'react-native'
import React, { useState } from 'react'
import ConfirmationModal from '../ConfirmationModal';

type EnlargeGalleryProps = {
    closeModal: () => void;
    image: string;
};

const EnlargeGalleryModal = ({closeModal, image,}: EnlargeGalleryProps) => {


    const {width, height} = Dimensions.get('window');

  return (
      <Pressable
          onPress={closeModal}
          style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <TouchableWithoutFeedback>
              <Image
                  source={{uri: image}}
                  style={{
                      width: '100%',
                      height: height * 0.5, // for example, set the height to 40% of screen height

                      borderRadius: 5,
                  }}
                  resizeMode="cover"
              />
          </TouchableWithoutFeedback>
      </Pressable>
  );
}

export default EnlargeGalleryModal