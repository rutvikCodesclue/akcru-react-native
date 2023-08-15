import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    cruinvitebutton: {
        width: 125,
        height: 30,
        backgroundColor: COLORS.AKCRUBLUE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        marginRight: 10,
    },
    followbutton: {
        width: 125,
        height: 30,
        backgroundColor: COLORS.TAGCOLOR,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
    unfollowbutton: {
        width: 125,
        height: 30,
        backgroundColor: COLORS.DARKORANGE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
});
