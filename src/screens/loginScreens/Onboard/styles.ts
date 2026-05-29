import {Platform, StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';

const inputHeight = isTablet() ? 60 : 50;

export default StyleSheet.create({
    // Modal styles matching Welcome/Signin
    tosmodal: {
        flex: 1,
        backgroundColor: COLORS.OVERLAY_BLACK_55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tosmodalcontainer: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        width: SIZES.ScreenWidth * 0.88,
        maxWidth: 500,
        height: SIZES.ScreenHeight * 0.8,
        paddingHorizontal: 20,
        borderRadius: 18,
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
        flex: 1,
        height: SIZES.ScreenHeight,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
    /** Full width + flex so OnboardArchetypeStandalone fills the stack when opened from profile */
    standaloneBgFill: {
        width: '100%',
        flex: 1,
    },
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: SIZES.ScreenHeight * 0.03,
        marginBottom: SIZES.ScreenHeight * 0.02,
        paddingHorizontal: 0,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    logoCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginTop: 10,
        gap: 10,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: COLORS.OVERLAY_WHITE_30,
        backgroundColor: COLORS.OVERLAY_WHITE_05,
    },
    chipSelected: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: COLORS.PINK,
        backgroundColor: COLORS.PINK,
    },
    chipText: {
        ...FONTS.Title2,
        color: COLORS.OVERLAY_WHITE_90,
    },
    chipTextSelected: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
    },
    phonenuminput: {
        color: COLORS.WHITE,
        width: '100%',
        fontSize: isTablet() ? 18 : 14,
    },
    // Blur input wrapper matching Signin
    blurInputWrapper: {
        width: SIZES.ScreenWidth * 0.9,
        height: inputHeight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_25,
        overflow: 'hidden',
        marginVertical: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: inputHeight,
    },
    datepicker: {
        height: 120,
        marginTop: -10,
    },
    datepickios: {
        width: 320,
        backgroundColor: COLORS.WHITE,
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
        fontSize: isTablet() ? 18 : 14,
    },
    textinputprefix: {
        color: COLORS.WHITE,
        marginBottom: 2,
        fontSize: isTablet() ? 18 : 14,
    },
    input: {
        width: SIZES.ScreenWidth * 0.9,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_25,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'center',
        height: SIZES.ScreenHeight * 0.15,
        paddingHorizontal: 12,
    },
    errorText: {
        width: SIZES.ScreenWidth * 0.9,
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: -4,
        marginBottom: 8,
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
        marginTop: Platform.OS === 'ios' || isTablet() ? '10%' : '10%',
    },
    skipButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: COLORS.WHITE,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    skipButtonText: {
        color: COLORS.BLACK,
        fontWeight: 'bold',
    },
    progress: {
        marginBottom: 16,
    },
    stepIndicator: {
        ...FONTS.Title2,
        color: COLORS.OVERLAY_WHITE_70,
        marginLeft: 8,
    },
    contentScrollCenter: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 24,
    },
});
