import {StyleSheet, Platform} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    activitycontainer: {
      backgroundColor: COLORS.BLACK,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? 40 : 0,
       
    },
});

