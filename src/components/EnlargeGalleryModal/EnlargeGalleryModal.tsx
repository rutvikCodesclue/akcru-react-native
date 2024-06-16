import { Pressable, TouchableWithoutFeedback, Image, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import ConfirmationModal from '../ConfirmationModal';

type EnlargeGalleryProps = {
    closeModal: () => void;
    deleteImage: (image: string) => Promise<void>;
    image: string;
};

const EnlargeGalleryModal = ({ closeModal, image, deleteImage }: EnlargeGalleryProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleDeletePress = () => {
        setShowConfirmationModal(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirmationModal(false);
        await deleteImage(image);
        closeModal();
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <Pressable
            onPress={closeModal}
            style={styles.overlay}
        >
            <TouchableWithoutFeedback onLongPress={handleDeletePress}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <Pressable onPress={toggleDropdown} style={styles.ellipsisButton}>
                        <Text style={styles.ellipsis}>⋮</Text>
                    </Pressable>
                    {showDropdown && (
                        <View style={styles.dropdownMenu}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDropdown(false);
                                    handleDeletePress();
                                }}
                                style={styles.dropdownItem}
                            >
                                <Text style={styles.dropdownText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    imageContainer: {
        position: 'relative',
        width: '90%',
        height: '75%',
    },
    image: {
        borderRadius: 5,
        width: '100%',
        height: '100%',
    },
    ellipsisButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 15,
        padding: 5,
    },
    ellipsis: {
        fontSize: 24,
        color: 'white',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        zIndex: 20,
    },
    dropdownItem: {
        padding: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: 'black',
    },
});

export default EnlargeGalleryModal;
