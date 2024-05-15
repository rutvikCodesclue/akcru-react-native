import {StyleSheet} from 'react-native';
import {SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    galleryImage: {
        width: SIZES.ScreenWidth / 3.55,
        height: SIZES.ScreenWidth / 2.35,
        margin: 5,
        borderRadius: 5,
    },
    gallerycontainer: {
        marginHorizontal: 15,
        marginBottom: 90,
    },

    galleryImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
    },
    selectedPhotoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedPhoto: {
        width: SIZES.ScreenWidth,
        aspectRatio: 1,
        opacity: 0,
        marginTop: -100,
    },
});
