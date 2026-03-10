
import {StyleSheet} from 'react-native';
import {SIZES} from '../../../../assets/constants';

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
        width: SIZES.ScreenWidth * 0.9,
        borderRadius: 5,
        overflow: 'hidden',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#fff',
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
