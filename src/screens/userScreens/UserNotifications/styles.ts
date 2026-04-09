import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    cardcontainer: {
        backgroundColor: '#1C202A',
        borderColor: '#1C202A',
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 15,
        justifyContent: 'center',
        marginBottom: 10,
       
        
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? '10%' : 0,
    },
    bulkActionsBar: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.DARKGREY,
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
    bulkActionsRow: {
        alignItems: 'center',
    },
    bulkActionsRowSplit: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
    },
    bulkActionsRowSingle: {
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
    },
    chatListPanel: {
        backgroundColor: 'transparent',
    },
});
