import {Platform, StyleSheet} from 'react-native';
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
    },
    container: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.01,
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
        marginTop: 10,
        justifyContent: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderColor: COLORS.PINK,
        borderWidth: 2,
        alignContent: 'center',
        justifyContent: 'center',
    },
    checkboxText: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        marginLeft: 10,
    },
    checkboxContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 20,
        width: SIZES.ScreenWidth / 3.2,
    },
    checkbox2: {
        width: 20,
        height: 20,
        borderColor: COLORS.PINK,
        borderWidth: 2,
        alignContent: 'center',
        justifyContent: 'center',
    },
    checkboxText2: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        marginLeft: 10,
    },
    phonenuminput: {
        color: COLORS.WHITE,
        width: '100%',
    },
    phoneinput: {
        width: SIZES.ScreenWidth * 0.9,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 45,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    datepicker: {
        height: 120,
        marginTop: -10,
    },
    datepickios: {
        width: 320,
        backgroundColor: 'white',
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
    textinput: {
        color: COLORS.WHITE,
        width: '100%',
    },
    textinputprefix: {
        color: COLORS.WHITE,
        marginBottom: 2,
    },
    input: {
        width: SIZES.ScreenWidth * 0.9,
        borderWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'center',
        height: SIZES.ScreenHeight * 0.15,
        paddingHorizontal: 10,
    },
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
        marginTop: Platform.OS === 'ios' ? '10%' : 0,
    },
    skipButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    skipButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
