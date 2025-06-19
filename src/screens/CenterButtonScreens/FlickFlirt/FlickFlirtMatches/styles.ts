import {Platform, StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../../assets/constants';

export default StyleSheet.create({
    bgimage: {
        height: SIZES.ScreenHeight,
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
    intentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.TRANSPURPLGT,
        borderRadius: 6,
        padding: 12,
        marginBottom: 10,
    },

    intentOptionSelected: {
        backgroundColor: COLORS.AKCRUBLUE + '33', // slightly tinted
    },

    intentText: {
        ...FONTS.Title3,
        color: COLORS.LIGHTGREY,
    },
    card: {
        width: SIZES.ScreenWidth / 1.2,
        height: SIZES.ScreenHeight / 1.6,
        borderRadius: 7,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 7,
        elevation: 8,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 7,
        justifyContent: 'flex-end',
    },
    bigTitle: {
        ...FONTS.HeroTitle,
        width: '75%',
    },
    desc: {
        ...FONTS.Username,
        marginBottom: 10,
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
