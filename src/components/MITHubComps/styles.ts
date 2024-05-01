import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    cruchat: {
        ...FONTS.paragraph1,
        fontSize: 12,
        color: COLORS.AKCRUBLUE,
    },
    cruchat2: {
        ...FONTS.paragraph1,
        fontSize: 12,
    },
    cardcontainer: {
        backgroundColor: '#1C202A',
        borderColor: COLORS.CATPURPDRK,
        borderWidth: 2,
        borderRadius: 5,
        padding: 10,
    },
    stamps: {
        ...FONTS.Title2Orange,
        marginBottom: 3,
    },
    stamps2: {
        ...FONTS.Title2AkcruBlue,
        fontSize: 12,
    },
    titleText1: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    paragraphText: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,

        marginHorizontal: 5,
    },
    paragraphText2: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
    },
    paragraphText3: {
        ...FONTS.paragraph1,
        color: COLORS.PINK,
    },
    declineButton: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
    },
});
