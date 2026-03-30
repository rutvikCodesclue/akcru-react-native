import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';

const inputHeight = isTablet() ? 60 : 50;

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
        width: SIZES.ScreenWidth * 0.9,
        height: inputHeight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        overflow: 'hidden',
        marginVertical: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: inputHeight,
    },
    errorText: {
        width: SIZES.ScreenWidth * 0.9,
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: -4,
        marginBottom: 8,
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
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
        alignSelf: 'flex-start',
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
