import {StyleSheet} from 'react-native';
import {COLORS} from '../../../../assets/constants';

export default StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        backgroundColor: COLORS.BLACK,
        paddingBottom: 16,
    },
    headerContainer: {
        backgroundColor: COLORS.BLACK,
    },
    detailsCardContainer: {
        marginTop: -50,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    helperText: {
        color: COLORS.LIGHTGREY,
        marginTop: 10,
        fontSize: 14,
    },
});
