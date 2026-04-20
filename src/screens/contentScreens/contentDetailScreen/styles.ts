import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        backgroundColor: COLORS.BLACK,
    },
    activitycontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        justifyContent: 'center',
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignItems: 'flex-start',
        height: 150,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    sendbutton: {
        backgroundColor: COLORS.AKCRUBLUE,
        height: 35,
        justifyContent: 'center',
        width: 90,
        borderRadius: 5,
        alignItems: 'center',
    },
});
