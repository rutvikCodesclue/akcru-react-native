import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    searchinput: {
        width: SIZES.ScreenWidth / 1.08,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 40,
        justifyContent: 'space-between',
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
});
