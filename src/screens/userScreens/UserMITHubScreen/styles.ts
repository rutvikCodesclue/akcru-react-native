import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

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
        height: 35,
    },
    screenTitle: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
    },
    topcontainer: {
        marginTop: 60,
        marginHorizontal: 15,
    },
    MITbutton: {
        borderColor: COLORS.CATPURPDRK,
        borderWidth: 1,
        borderRadius: 5,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: COLORS.TRANSPURPLE,
        width: SIZES.ScreenWidth / 1.08,
    },
    buttonText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 14,
    },
    /* modal styles */
    modalOverlay: {flex: 1, backgroundColor: COLORS.OVERLAY_BLACK_50, justifyContent: 'center', alignItems: 'center'},
    modalContent: {width: '80%', backgroundColor: COLORS.AKCRUBACKGROUND, padding: 20, borderRadius: 8},
    modalTitle: {...FONTS.Title2, textAlign: 'center', marginBottom: 12},
    optionRow: {padding: 10, borderWidth: 1, borderColor: COLORS.LIGHTGREY, borderRadius: 4, marginVertical: 4},
    optionRowSelected: {backgroundColor: COLORS.PURPLE},
    optionText: {...FONTS.Title3, color: COLORS.WHITE, textAlign: 'center'},
    modalButtonsRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 16},
    modalBtn: {flex: 1, padding: 10, borderRadius: 4, alignItems: 'center', marginHorizontal: 4},
    cancelBtn: {backgroundColor: COLORS.AKCRUBLUE},
    confirmBtn: {backgroundColor: COLORS.PURPLE},
    modalBtnText: {...FONTS.Title3, color: COLORS.WHITE},
});
