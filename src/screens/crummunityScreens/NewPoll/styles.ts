import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';

export default StyleSheet.create({
    input: {
        width: SIZES.ScreenWidth * 0.92,
        borderColor: COLORS.LIGHTGREY,
        marginTop: 10,
        alignSelf: 'center',
        height: SIZES.ScreenHeight * 0.1,
    },
    textinput: {
        color: COLORS.LIGHTGREY,
    },
    container: {
        marginHorizontal: 15,
    },
    searchinput: {
        width: SIZES.ScreenWidth / 1.08,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        height: 35,
    },
    screenTitle: {
        ...FONTS.Title3,
        marginHorizontal: 15,
        marginBottom: 10,
        marginTop: '20%',
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
    postButton: {
        ...FONTS.Title3,
        marginLeft: 5,
        backgroundColor: COLORS.AKCRUBLUE,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: COLORS.PINK,
        borderRadius: 5,
    },
    postButtonDisabled: {
        ...FONTS.Title3,
        marginLeft: 5,
        backgroundColor: COLORS.DARKERGREY,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: COLORS.LIGHTGREY,
        borderRadius: 5,
    },
    cancelButton: {
        ...FONTS.paragraph1,
        backgroundColor: COLORS.AKCRUPINK,
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 5,
    },
    postgallerycontainer: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    postvideo: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    choicesContainer: {
        marginTop: 10,
    },
    choice: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    choiceInput: {
        flex: 1,
        ...FONTS.paragraph1,
        color: COLORS.WHITE,
    },
    choiceImage: {
        width: 40,
        height: 40,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    choiceButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addChoiceButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    addChoiceButtonText: {
        ...FONTS.Title2,
        color: COLORS.AKCRUPINK,
    },
    durationContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    durationLabel: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
    },
    durationInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    durationInput: {
        ...FONTS.paragraph1,
        borderWidth: 1,
        borderColor: COLORS.AKCRUBLUE,
        borderRadius: 5,
        paddingHorizontal: 10,
        width: '30%',
        height: 40,
    },
    durationSeparator: {
        ...FONTS.Title3,
        color: COLORS.AKCRUBLUE,
        marginHorizontal: 10,
    },
});
