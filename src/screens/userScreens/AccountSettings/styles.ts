import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    input: {
        width: SIZES.ScreenWidth * 0.92,

        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        height: 40,
    },
    textinput: {
        ...FONTS.paragraph1,
        color: COLORS.WHITE,
        width: '100%',
    },
    inputlabel: {
        ...FONTS.paragraph1,
        marginLeft: 5,
        color: COLORS.AKCRUBLUE,
    },
    title: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        color: COLORS.AKCRUBLUE,
        textDecorationLine: 'underline',
    },
    container: {
        marginBottom: 75,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    bgimage: {
        height: SIZES.ScreenHeight,
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
    warningText: {
        ...FONTS.Title2,
        color: 'red',
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? '10%' : 0,
    },
    datepickios: {
        width: 320,
        backgroundColor: 'white',
    },
    modalBtn: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 4,
        alignItems: 'center',
    },
    cancelBtn: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 4,
        alignItems: 'center',
        backgroundColor: COLORS.AKCRUBLUE,
    },
    confirmBtn: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 4,
        alignItems: 'center',
        backgroundColor: COLORS.CATREDLGT,
    },
    modalBtnText: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderRadius: 8,
        padding: 20,
    },
});
