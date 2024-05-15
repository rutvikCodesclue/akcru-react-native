import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    titleText1: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    titleText2: {
        ...FONTS.Title2,

        color: COLORS.DARKGREY,
        fontSize: 12,
    },
    titleText3: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        fontSize: 14,
    },
    CruImage: {
        width: 275,
        height: 125,
    },
    CruImageContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
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
    sendbutton: {
        backgroundColor: COLORS.AKCRUBLUE,
        height: 35,
        justifyContent: 'center',
        width: 90,
        borderRadius: 5,
        alignItems: 'center',
    },
});
