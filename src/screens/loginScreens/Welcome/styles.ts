import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    loadingFullScreen: {
        flex: 1,
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight,
    },
    bgimage: {
        height: SIZES.ScreenHeight,
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    logoCenterWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(47, 191, 241, 0.45)',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.AKCRUBLUE,
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.4,
                shadowRadius: 20,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    logoContainerOverlay: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tagline: {
        ...FONTS.paragraph2,
        color: COLORS.WHITE,
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.95,
    },
    buttonsBottomWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    buttonsInner: {
        marginBottom: 50,
        width: '100%',
        alignItems: 'center',
    },
    welcomeButton: {
        width: SIZES.ScreenWidth * 0.9,
        borderRadius: 5,
        overflow: 'hidden',
    },
    welcomeButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
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
});
