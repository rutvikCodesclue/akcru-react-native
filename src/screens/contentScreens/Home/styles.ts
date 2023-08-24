import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants/index';

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
    },
    video: {
        alignSelf: 'center',
        width: SIZES.ScreenWidth,
        height: SIZES.ScreenHeight / 1.63,
    },
    videocontainer: {
        flex: 1,
        backgroundcolor: COLORS.AKCRUBACKGROUND,
        height: SIZES.ScreenHeight / 2,
        width: SIZES.ScreenWidth,
        zindex: 1,
        marginTop: -70,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
    bigTitle: {
        ...FONTS.Title3,
        fontSize: 25,
        width: 250,
    },
    desc: {
        ...FONTS.Title2,
        marginBottom: 10,
    },
    activitycontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        alignItems: 'center',
        justifyContent: 'center'
    },
});
