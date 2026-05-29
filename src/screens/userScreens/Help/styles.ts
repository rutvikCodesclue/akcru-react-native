import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    screenRoot: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    headerWrap: {
        zIndex: 20,
        backgroundColor: COLORS.BLACK,
    },
    contentContainer: {
        paddingBottom: 18,
    },
    title: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 8,
        textAlign: 'center',
        textDecorationLine: 'underline',
        color: COLORS.AKCRUBLUE,
    },
    subtitle: {
        ...FONTS.paragraph2,
        textAlign: 'center',
        color: COLORS.LIGHTGREY,
        marginBottom: 12,
    },
    container: {
        marginHorizontal: SIZES.ScreenWidth * 0.03,
        marginTop: Platform.OS === 'ios' ? '-2%' : '-1%',
    },
    sectionCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_10,
        backgroundColor: COLORS.BLACK,
        padding: 10,
        marginTop: 12,
    },
    sectionTitle: {
        ...FONTS.Title2,
        textAlign: 'center',
        color: COLORS.PINK,
        marginBottom: 10,
    },
    tutorialWrap: {
        marginTop: 4,
    },
});
