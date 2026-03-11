import {StyleSheet} from 'react-native';
import {SIZES} from '../../../../assets/constants';
import {AUTH_TEXT_FIELD_THEME} from '../../../../assets/constants/authTheme';

export default StyleSheet.create({
    bgimage: {
        height: SIZES.ScreenHeight,
    },
    logoTop: {
        alignItems: 'center',
        paddingTop: SIZES.ScreenHeight * 0.03,
        marginBottom: SIZES.ScreenHeight * 0.02,
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    contentCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    signInFormCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    blurInputWrapper: {
        ...AUTH_TEXT_FIELD_THEME,
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mastercontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
    },
});
