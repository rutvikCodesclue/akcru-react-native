import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    screenTitle: {
        ...FONTS.Title3,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
    },
    topcontainer: {
        marginTop: 70,
        marginHorizontal: 15,
    },
    bottomcontainer: {
        marginHorizontal: 15,
        marginTop: 30,
    },
    poster: {width: 65, height: 100, borderRadius: 5},
    datebox: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.TRANSAKCRUBLUE,
        height: 75,
        borderRadius: 5,
        width: 175,
        marginBottom: 10,
    },
    datetext: {
        ...FONTS.Title2,
        marginVertical: 3,
        color: COLORS.AKCRUBLUE,
    },
    sheetcontainer: {
        flex: 1,
    },
    sheetview: {},
    opensheet: {
        height: 100,
        backgroundColor: COLORS.TAGCOLOR,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignItems: 'center',
        height: 35,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
});
