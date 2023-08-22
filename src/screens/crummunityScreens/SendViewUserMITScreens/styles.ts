import { StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS } from "../../../../assets/constants";

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
    sendbutton: {
        backgroundColor: COLORS.AKCRUBLUE,
        height: 35,
        justifyContent: 'center',
        width: 90,
        borderRadius: 5,
        alignItems: 'center',
    },
    topcontainer: {
        marginHorizontal: 15,
        backgroundColor: COLORS.AKCRUBACKGROUND,
    },
    screenTitle: {
        ...FONTS.Title3,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
    },
    choosedate: {
        ...FONTS.Title3,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
        textAlign: 'center',
        textDecorationLine: 'underline',
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
    //Starting Picker Styles
    container: {
        marginHorizontal: 15,
    },
    monthContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    monthText: {
        ...FONTS.Title3,
        marginHorizontal: 10,
        color: COLORS.AKCRUBLUE,
    },
    arrowButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowbuttonstyle: {
        color: COLORS.WHITE,
        fontSize: 18,
    },
    datePickerContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
    },
    dayButton: {
        width: 60,
        height: 60,
        borderRadius: 5,
        backgroundColor: COLORS.TAGCOLOR,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    dayButtonSelected: {
        backgroundColor: COLORS.AKCRUBLUE,
    },
    dayText: {
        ...FONTS.Title2,
    },
    dayTextSelected: {
        color: 'white',
    },
    dayOfWeekText: {
        ...FONTS.Title2,
        marginTop: 5,
    },
    timePickerContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    timeButton: {
        width: 70,
        height: 30,
        borderRadius: 5,
        backgroundColor: COLORS.TAGCOLOR,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    timeButtonSelected: {
        backgroundColor: COLORS.AKCRUBLUE,
    },
    timeText: {
        ...FONTS.Title2,
    },
    timeTextSelected: {
        color: 'white',
    },
    timeZonePickerContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    timeZoneButton: {
        height: 30,
        borderRadius: 5,
        backgroundColor: COLORS.TAGCOLOR,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginRight: 5,
    },
    timeZoneButtonSelected: {
        backgroundColor: COLORS.AKCRUBLUE,
    },
    timeZoneText: {
        ...FONTS.Title2,
    },
    timeZoneTextSelected: {
        color: 'white',
    },
    selectedDateTimeContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    selectedDateTimeText: {
        ...FONTS.Title2,
        marginBottom: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    searchmodal: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        alignItems: 'center',
    },
    searchinput: {
        width: SIZES.ScreenWidth / 1.1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 40,
    },
    icon: {
        marginRight: 5,
    },
    activitycontainer: {
        height: SIZES.ScreenHeight,
        width: SIZES.ScreenWidth,
        alignItems: 'center',
        justifyContent: 'center'
    },
    
});


