import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    headerShell: {
        backgroundColor: COLORS.BLACK,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        paddingBottom: 8,
    },
    headerWrap: {
        zIndex: 10,
    },
    backButtonWrap: {
        marginHorizontal: 15,
        marginTop: 0,
    },
    titleWrap: {
        paddingHorizontal: 18,
        paddingTop: 2,
        paddingBottom: 8,
    },
    titleText: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
    },
    subtitleText: {
        ...FONTS.Title3,
        color: COLORS.DARKGREY,
        marginTop: 4,
        opacity: 0.9,
    },
    tabBar: {
        backgroundColor: COLORS.BLACK,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        elevation: 0,
        shadowOpacity: 0,
    },
    tabBarContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItem: {
        width: SIZES.ScreenWidth / 2,
        minHeight: 46,
    },
    tabLabel: {
        ...FONTS.Title3,
        textTransform: 'none',
        letterSpacing: 0.2,
    },
    tabIndicator: {
        backgroundColor: COLORS.PURPLE,
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    sceneContainer: {
        marginBottom: 8,
    },
});
