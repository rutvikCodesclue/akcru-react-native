import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    bgimage: {
        height: SIZES.ScreenHeight,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: SIZES.ScreenHeight * 0.03,
        marginBottom: SIZES.ScreenHeight * 0.02,
        paddingHorizontal: SIZES.ScreenWidth * 0.03,
    },
    backButton: {
        padding: 8,
    },
    logoCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        marginHorizontal: SIZES.ScreenWidth * 0.03,
    },
    container2: {
        flex: 1,
        marginTop: SIZES.ScreenHeight * 0.1,
        alignItems: 'center',
    },
    mastercontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
    },
    input: {
        width: 45,
        height: 55,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.DARKERGREY,
        backgroundColor: COLORS.AKCRUBLUE,
        borderRadius: 5,
    },
    backbutton: {},
});
