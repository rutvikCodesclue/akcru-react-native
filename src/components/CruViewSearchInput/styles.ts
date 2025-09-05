import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES} from '../../../assets/constants';
import { FONTS, isTablet } from '../../../assets/constants/theme';

export default StyleSheet.create({
    searchmodal: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        alignItems: 'center',
    },
    searchinput: {
            width: SIZES.ScreenWidth / 1.1,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: COLORS.DARKGREY,
            borderRadius: 5,
            paddingHorizontal: 10,
            marginVertical: 10,
            alignItems: 'center',
            height: isTablet() ? 60 : 45,
        },
    icon: {
        marginRight: 5,
    },
    textinput: {
            ...FONTS.Title2,
            color: COLORS.WHITE,
            width: '100%',
        },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? '10%' : 0,
    },
});
