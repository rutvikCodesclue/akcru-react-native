import {
    Pressable,
    TouchableWithoutFeedback,
    Image,
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import ConfirmationModal from '../ConfirmationModal';
import { COLORS, FONTS } from '../../../assets/constants';
import {Icon} from '@rneui/base';

type EnlargeGalleryProps = {
    closeModal: () => void;
    deleteImage: (image: string) => Promise<void>;
    image: string;
    square?: boolean;
};

const EnlargeGalleryModal = ({closeModal, image, deleteImage, square = false}: EnlargeGalleryProps) => {
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
        <Pressable onPress={closeModal} style={styles.overlay}>
            <TouchableWithoutFeedback onLongPress={handleDeletePress}>
                <View style={square ? styles.imageContainerSquare : styles.imageContainer}>
                    <Image source={{uri: image}} style={styles.image} resizeMode="contain" />
                    <Pressable onPress={handleDeletePress} style={styles.deleteButton}>
                        <Icon name="trash" type="ionicon" color={COLORS.WHITE} size={18} />
                    </Pressable>
                </View>
            </TouchableWithoutFeedback>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.OVERLAY_BLACK_50,
    },
    imageContainer: {
        position: 'relative',
        width: '90%',
        height: '75%',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainerSquare: {
        position: 'relative',
        width: '90%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.PURPLE,
        borderRadius: 15,
        padding: 8,
    },
    closeButton: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.OVERLAY_BLACK_45,
    },
    closeButtonText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
});

export default EnlargeGalleryModal;
