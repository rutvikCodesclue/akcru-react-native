import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    screenTitle: {
        ...FONTS.Title3,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
    },
    topcontainer: {
        marginTop: 70,
        marginHorizontal: 15,
    },
    bottomcontainer: {
        marginHorizontal: 15,
        marginTop: -10,
    },
    poster: {width: 85, height: 115, borderRadius: 5},
    datebox: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.TRANSAKCRUBLUE,

        borderRadius: 5,
        padding: 15,
    },
    datetext: {
        ...FONTS.Title2,
        
        color: COLORS.AKCRUBLUE,
    },
    sheetcontainer: {
        flex: 1,
    },
    sheetview: {},
    opensheet: {
        height: SIZES.ScreenHeight * 0.2,
        backgroundColor: COLORS.TAGCOLOR,
        padding: 10,
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingLeft: 10,
        alignContent: 'center',
        height: 40,
        alignItems: 'center',
    },
    textinput: {
        color: COLORS.LIGHTGREY,
        width: '100%',
        flex: 1,
    },
    drawfonttag: {
        ...FONTS.Title2Orange,
        color: COLORS.BLACK,
        backgroundColor: COLORS.STARGOLD,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginHorizontal: 2,
        borderRadius: 4,
        textAlign: 'center',
    },
    playButton: {
        ...FONTS.Title2,
    },
    activitycontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        justifyContent: 'center',
    },
    postcontainer: {
        width: SIZES.ScreenWidth * 0.93,
        alignSelf: 'center',
        marginBottom: 5,
    },
    //Ticket styles
    ticketContainer: {
        width: SIZES.ScreenWidth / 4.3,
        height: SIZES.ScreenWidth / 2.7,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderStyle: 'dashed',
        borderColor: '#000000',
        borderBottomWidth: 2,
    },
    ticketImage: {
        overflow: 'hidden',
        alignSelf: 'center',
        width: SIZES.ScreenWidth / 4.3,
        height: SIZES.ScreenWidth / 2.7,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        justifyContent: 'flex-end',
    },
    ticketFooter: {
        padding: 10,
        backgroundColor: COLORS.AKCRUBLUE,
        width: SIZES.ScreenWidth / 4.3,
        height: SIZES.ScreenWidth / 7.3,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderStyle: 'dashed',
        borderColor: COLORS.AKCRUBACKGROUND,
        borderTopWidth: 2,
        overflow: 'hidden',
    },
    linearGradient: {
        height: '70%',
    },
    ticketCircle: {
        height: 20,
        width: 20,
        borderRadius: 20,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
});
