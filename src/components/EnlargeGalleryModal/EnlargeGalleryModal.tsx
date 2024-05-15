import {Pressable, TouchableWithoutFeedback, Image, Modal} from 'react-native';
import React, {useState} from 'react';
import ConfirmationModal from '../ConfirmationModal';

type EnlargeGalleryProps = {
    closeModal: () => void;
    deleteImage: (image: string) => Promise<void>;
    image: string;
};

const EnlargeGalleryModal = ({closeModal, image, deleteImage}: EnlargeGalleryProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const handleDeletePress = () => {
        setShowConfirmationModal(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirmationModal(false);

        await deleteImage(image);

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
                        borderRadius: 5,
                        width: '90%',
                        height: '75%',
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
};

export default EnlargeGalleryModal;
