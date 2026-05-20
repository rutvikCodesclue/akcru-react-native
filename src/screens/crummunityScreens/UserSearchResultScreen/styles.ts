import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    topBlock: {
        paddingBottom: 6,
    },
    backButtonWrap: {
        marginHorizontal: 15,
    },
    searchWrap: {
        alignItems: 'center',
    },
    searchinput: {
        width: SIZES.ScreenWidth / 1.08,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginVertical: 10,
        alignItems: 'center',
        height: 44,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    searchInputInner: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInputText: {
        color: COLORS.LIGHTGREY,
        width: '100%',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 120,
        backgroundColor: COLORS.BLACK,
    },
    listHeader: {
        marginBottom: 8,
    },
    sectionTitle: {
        color: COLORS.LIGHTGREY,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    inlineLoader: {
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    cardWrap: {
        marginVertical: 0,
    },
    emptyWrap: {
        paddingTop: 28,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.DARKGREY,
        fontSize: 14,
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
});
