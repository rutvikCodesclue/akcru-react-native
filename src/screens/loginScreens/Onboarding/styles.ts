import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    tosmodal: {
        flex: 1,
        backgroundColor: COLORS.FADEDBLACK,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tosmodalcontainer: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        width: SIZES.ScreenWidth * 0.8,
        height: SIZES.ScreenHeight * 0.8,
        paddingHorizontal: 10,
    },
    tostitle: {
        ...FONTS.Title2,
        textAlign: 'center',
        marginVertical: 10,
    },
    tosparagraph: {
        ...FONTS.Title2White,
        fontSize: 12,
        paddingBottom: 10,
        textAlign: 'center',
    },

    datePicker: {
        width: SIZES.ScreenWidth / 2,
        height: 50,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        color: COLORS.LIGHTGREY,
        fontSize: 16,
        marginBottom: 10,
    },
    bgimage: {
        height: SIZES.ScreenHeight,
        // width: SIZES.ScreenWidth,
    },
    container: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.09,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    mastercontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
    },
    warningText: {
        ...FONTS.Title2,
        color: 'red',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 20,
        width: SIZES.ScreenWidth / 3
    },
    checkbox: {
        width: 20,
        height: 20,
        borderColor: COLORS.LIGHTGREY,
        borderWidth: 2,
        alignContent: 'center',
        justifyContent: 'center',
    },
    checkboxText: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        marginLeft: 10,
    },
    backbutton: {},
    input: {
        width: SIZES.ScreenWidth * 0.8,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 40,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    descinput: {
      width: SIZES.ScreenWidth * 0.8,
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        alignSelf: 'center',
        marginVertical: 10,
        paddingLeft: 5,
        alignItems: 'flex-start',
        height: 150,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    textinput: {
        color: COLORS.WHITE,
    },
    datepicker: {
        height: 120,
        marginTop: -10,
    },
    iosbutton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: COLORS.LIGHTGREY,
    },
    iospickerbutton: {
        paddingHorizontal: 20,
    },
});
