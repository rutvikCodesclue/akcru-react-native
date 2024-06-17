import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    pictureFrame: {
        width: '90%',
        height: '75%',
        overflow: 'hidden',
        backgroundColor: COLORS.PURPLE,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    floatingicon: {
        position: 'absolute',
        right: 20,
        top: 10,
        backgroundColor: COLORS.TRANSLIGHTGREY,
        padding: 5,
        borderRadius: 20,
        zIndex: 1,
    },
    heartAnimation: {
        position: 'absolute',
        right: 0,
        left: 0,
        bottom: 0,
        top: '50%',
        zIndex: 1,
    },
    count: {
        ...FONTS.Title1,
        color: COLORS.AKCRUBLUE,
        textAlign: 'center',
    },
});
