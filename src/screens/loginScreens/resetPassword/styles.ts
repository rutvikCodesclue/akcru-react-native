import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';

export default StyleSheet.create({
    bgimage: {
        height: SIZES.ScreenHeight,

    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: SIZES.ScreenHeight * 0.03,
        marginBottom: SIZES.ScreenHeight * 0.02,
        paddingHorizontal: SIZES.ScreenWidth * 0.03,
    },
    backButton: {
        padding: 8,
    },
    logoCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blurInputWrapper: {
        ...AUTH_TEXT_FIELD_THEME,
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    container2: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.09,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    warningText: {
        ...FONTS.Title2,
        color: 'red',
        textAlign: 'center',
    },
    warningText2: {
        ...FONTS.Title2,
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    input: {
        width: SIZES.ScreenWidth * .9,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        height: 45,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    textinput: {
        color: COLORS.WHITE,
        width: '100%',
    },
    textinputprefix: {
        color: COLORS.WHITE,
        marginBottom:2
    },
});
