import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    bgimage: {
        height: SIZES.ScreenHeight,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container2: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.1,
        alignItems: 'center',
    },
    mastercontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
    },
    input: {
        width: 45,
        height: 55,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.DARKERGREY,
        backgroundColor: COLORS.AKCRUBLUE,
        borderRadius: 5,
       
    },
});
