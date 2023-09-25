import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    cruinvitebutton: {
        width: 125,
        height: 30,
        backgroundColor: COLORS.AKCRUBLUE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        marginRight: 10,
    },
    followbutton: {
        width: 125,
        height: 30,
        backgroundColor: COLORS.TAGCOLOR,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
    unfollowbutton: {
        width: 125,
        height: 30,
        backgroundColor: COLORS.DARKORANGE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
    watchlisttext: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
    },
    watchlistcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 20,
    },
    seperator: {
        borderBottomWidth: 1.5,
        borderColor: COLORS.DARKERGREY,
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 15,
    },
    desctext: {
        ...FONTS.Title2,
        marginTop: 25,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
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
