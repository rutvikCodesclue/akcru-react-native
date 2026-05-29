import {StyleSheet} from 'react-native';
import {COLORS} from '../../../../assets/constants';

export default StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        backgroundColor: COLORS.BLACK,
        paddingBottom: 120,
    },
    headerContainer: {
        backgroundColor: COLORS.BLACK,
    },
    detailsCardContainer: {
        marginTop: 2,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bottomActionContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 14,
        backgroundColor: 'rgba(0,0,0,0.92)',
        borderTopWidth: 1,
        borderTopColor: COLORS.OVERLAY_WHITE_08,
    },
});
