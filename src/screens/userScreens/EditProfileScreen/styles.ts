import {StyleSheet, Platform} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { isTablet } from '../../../../assets/constants/theme';

const isIOS = Platform.OS === 'ios';
const containerMargin = isIOS ? '-2%' : '-1%';

export default StyleSheet.create({
    gallerycontainer: {
        marginBottom: 20,
    },
    galleryImage: {
        width: SIZES.ScreenWidth / 3.7,
        height: SIZES.ScreenWidth / 3.7,
        marginRight: 10,
        borderRadius: 4,
    },
    galleryImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
    },
    container: {
        marginBottom: '5%',
        marginHorizontal: SIZES.ScreenWidth * 0.03,
        marginTop:containerMargin
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 10,
    },
    title: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        color: COLORS.AKCRUBLUE,
        textDecorationLine: 'underline',
    },
    input: {
        width: SIZES.ScreenWidth * 0.92,

        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        height: 45,
    },
    bioinput: {
        width: SIZES.ScreenWidth * 0.92,

        borderBottomWidth: 1,
        borderColor: COLORS.LIGHTGREY,
        marginBottom: 20,
        alignSelf: 'center',
        height: 120,
    },
    biotextinput: {
        ...FONTS.paragraph2,
        color: COLORS.WHITE,
        width: '100%',
        height: isTablet() ? 120 : 45,
    },
    textinput: {
        ...FONTS.paragraph2,
        color: COLORS.WHITE,
        width: '100%',
        height: isTablet() ? 55 : 45,
    },
    inputlabel: {
        ...FONTS.paragraph1,
        marginLeft: 5,
        color: COLORS.AKCRUBLUE,
        alignSelf: 'flex-start',
    },
    settingslabel: {
        ...FONTS.paragraph2,
        marginLeft: 5,
        color: COLORS.PINK,
    },
    descinput: {
        width: SIZES.ScreenWidth * 0.8,
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        alignSelf: 'center',
        marginVertical: 10,
        paddingLeft: 5,
        alignItems: 'flex-start',
        height: 150,
        backgroundColor: COLORS.TRANSDARKGREY,
    },
    warningText: {
        ...FONTS.Title2,
        color: 'red',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'flex-start',
        marginTop: 20,
        width: SIZES.ScreenWidth / 3,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderColor: COLORS.PINK,
        borderWidth: 2,
        alignContent: 'center',
        justifyContent: 'center',
    },
    checkboxText: {
        ...FONTS.Title2,
        color: COLORS.LIGHTGREY,
        marginLeft: 10,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginTop: 10,
        gap: 10,
    },
    bgimage: {
        height: SIZES.ScreenHeight,
    },
    genresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? '10%' : 0,
    },
});
