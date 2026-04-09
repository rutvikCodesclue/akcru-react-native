import {Platform, StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import {isTablet} from '../../../../assets/constants/theme';

const NEON_BORDER = 'rgba(155, 89, 182, 0.65)';

export default StyleSheet.create({
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignItems: 'flex-start',
        height: 150,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    container: {
        marginHorizontal: 15,
    },
    searchinput: {
        width: SIZES.ScreenWidth / 1.1,
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: NEON_BORDER,
        borderRadius: 22,
        paddingHorizontal: 14,
        marginVertical: 10,
        alignItems: 'center',
        height: isTablet() ? 60 : 46,
        backgroundColor: '#12121c',
        ...Platform.select({
            ios: {
                shadowColor: '#3498db',
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.35,
                shadowRadius: 8,
            },
            android: {elevation: 4},
        }),
    },
    screenTitle: {
        ...FONTS.Title3,
        marginHorizontal: isTablet() ? 40 : 15,
        marginBottom: 10,
        marginTop: '20%',
        color: COLORS.WHITE,
        fontWeight: '700',
        ...Platform.select({
            ios: {
                textShadowColor: 'rgba(52, 152, 219, 0.85)',
                textShadowOffset: {width: 0, height: 0},
                textShadowRadius: 12,
            },
            android: {},
        }),
    },
    feedLabel: {
        ...FONTS.Title2,
        color: '#5dade2',
        marginRight: 10,
        fontWeight: '700',
    },
    screenTitle2: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '2%',
        textAlign: 'center',
    },
    postcontainer: {
        width: SIZES.ScreenWidth * 0.93,
        alignSelf: 'center',
        marginBottom: 5,
    },
    floatingbutton: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        paddingRight: '5%',
    },
    floatingbutton2: {
        width: 55,
        height: 55,
        borderRadius: 25,
        position: 'relative',
        bottom: Platform.OS === 'ios' ? '31%' : '26%',
        left: '80%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noPostText: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '25%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
    },
    skipButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    skipButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
