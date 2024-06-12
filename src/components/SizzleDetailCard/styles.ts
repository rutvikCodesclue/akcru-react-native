import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    video: {
        alignSelf: 'center',
        width: SIZES.ScreenWidth,
        height: 200,
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
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginHorizontal: 2,
        marginVertical: 2,
        borderRadius: 3,
        textAlign: 'center',
        justifyContent: 'center',
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
    videocontain: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'center',
    },
    videoplayer: {
        alignSelf: 'center',
        aspectRatio: 16 / 9,
        width: '100%',
    },
    MITbutton: {
        borderColor: COLORS.AKCRUBLUE,
        borderWidth: 1,
        borderRadius: 5,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});
