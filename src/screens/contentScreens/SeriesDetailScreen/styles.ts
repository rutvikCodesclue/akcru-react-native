import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    activitycontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        justifyContent: 'center',
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignItems: 'flex-start',
        height: 150,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    sendbutton: {
        backgroundColor: COLORS.AKCRUBLUE,
        height: 35,
        justifyContent: 'center',
        width: 90,
        borderRadius: 5,
        alignItems: 'center',
    },
    lineSeperator: {
        borderBottomWidth: 1.5,
        borderColor: COLORS.DARKERGREY,
        marginTop: 20,
        marginBottom: 10,
    },
    selectedSeasonButton: {
        backgroundColor: COLORS.PURPLE,
    },
    seasonButtonText: {
        ...FONTS.Title2,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    seasonfonttag: {
        ...FONTS.Title2,
        backgroundColor: COLORS.DARKERGREY,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginHorizontal: 2,
        marginVertical: 2,
        borderRadius: 3,
        textAlign: 'center',
        justifyContent: 'center',
    },
});
