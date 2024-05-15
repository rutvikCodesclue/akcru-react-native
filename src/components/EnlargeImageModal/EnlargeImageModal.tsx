import {Pressable, TouchableWithoutFeedback, Image, Dimensions} from 'react-native';
import React from 'react';

type EnlargeGalleryProps = {
    closeModal: () => void;
    image: string;
};

const EnlargeGalleryModal = ({closeModal, image}: EnlargeGalleryProps) => {
    const {height} = Dimensions.get('window');

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
                        height: height * 0.5,

                        borderRadius: 5,
                    }}
                    resizeMode="cover"
                />
            </TouchableWithoutFeedback>
        </Pressable>
    );
};

export default EnlargeGalleryModal;
