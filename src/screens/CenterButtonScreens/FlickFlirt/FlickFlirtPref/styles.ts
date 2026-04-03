import {StyleSheet} from 'react-native';
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
    /** Multi-select chips (OnboardArchetypeStandalone pattern) */
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginHorizontal: 0,
        marginTop: 4,
        marginBottom: 8,
        gap: 10,
    },
});
