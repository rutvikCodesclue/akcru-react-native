import { Pressable, TouchableWithoutFeedback, Image, Dimensions, Modal } from 'react-native'
import React, { useState } from 'react'
import ConfirmationModal from '../ConfirmationModal';

type EnlargeGalleryProps = {
    closeModal: () => void;
    deleteImage: (image: string) => Promise<void>;
    image: string;
};

const EnlargeGalleryModal = ({closeModal, image, deleteImage}: EnlargeGalleryProps) => {

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const {width, height} = Dimensions.get('window');

    const handleDeletePress = () => {
        // Show confirmation modal
        setShowConfirmationModal(true);
    };

     const handleConfirmDelete = async () => {
         // Hide confirmation modal
         setShowConfirmationModal(false);
         // Call delete image function
         await deleteImage(image);
         // Close the image modal after deletion
         closeModal();
     };

  return (
      <Pressable
          onPress={closeModal}
          style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <TouchableWithoutFeedback onLongPress={handleDeletePress}>
              <Image
                  source={{uri: image}}
                  style={{
                      width: '100%',
                      height: height * 0.4, // for example, set the height to 40% of screen height

                      borderRadius: 5,
                  }}
                  resizeMode="cover"
              />
          </TouchableWithoutFeedback>

          <Modal visible={showConfirmationModal} transparent={true} animationType="fade">
              <ConfirmationModal
                  confirmationText="Are you sure you want to delete this image?"
                  onPressYes={handleConfirmDelete}
                  onPressNo={() => setShowConfirmationModal(false)}
              />
          </Modal>
      </Pressable>
  );
}

export default EnlargeGalleryModal