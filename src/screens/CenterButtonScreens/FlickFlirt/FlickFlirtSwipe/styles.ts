import {Platform, StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../../assets/constants';
import {isTablet} from '../../../../../assets/constants/theme';

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
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight,
        borderRadius: 0,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        justifyContent: 'flex-end',
    },
    bigTitle: {
        ...FONTS.HeroTitle,
        width: '75%',
    },
    /** Swipe card index — top right, large semi-transparent */
    cardIndexBadge: {
        position: 'absolute',
        top: isTablet() ? 18 : 12,
        right: isTablet() ? 18 : 12,
        zIndex: 2,
    },
    cardIndexText: {
        fontSize: isTablet() ? 60 : 60,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.72)',
        textShadowColor: 'rgba(0, 0, 0, 0.55)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 4,
    },
    desc: {
        ...FONTS.paragraph1,
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
    unlockWrapper: {marginTop: 20, alignItems: 'center'},
    gotToStartWrapper: {paddingTop: 20, alignItems: 'center'},
    unlockText: {...FONTS.Title3, color: COLORS.LIGHTGREY, marginBottom: 10},

    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
    modalContent: {width: '80%', backgroundColor: COLORS.AKCRUBACKGROUND, borderRadius: 8, padding: 20},
    modalTitle: {...FONTS.Title2, marginBottom: 15, textAlign: 'center'},
    modalLabel: {...FONTS.Title3, marginBottom: 10},
    optionRow: {padding: 10, borderWidth: 1, borderColor: COLORS.LIGHTGREY, borderRadius: 4, marginBottom: 8},
    optionRowSelected: {backgroundColor: COLORS.PURPLE},
    optionText: {...FONTS.Title3, color: COLORS.LIGHTGREY, textAlign: 'center'},
    modalButtonsRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 20},
    modalBtn: {flex: 1, padding: 10, borderRadius: 4, alignItems: 'center', marginHorizontal: 5},
    cancelBtn: {backgroundColor: COLORS.AKCRUBLUE},
    confirmBtn: {backgroundColor: COLORS.PURPLE},
    modalBtnText: {...FONTS.Title3, color: COLORS.WHITE},
});
