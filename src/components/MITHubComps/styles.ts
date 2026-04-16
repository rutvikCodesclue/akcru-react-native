import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    panelBody: {
        width: '100%',
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
    },
    cardTouch: {
        width: '100%',
        marginHorizontal: 0,
        marginTop: 8,
        marginBottom: 8,
    },
    cardGradientBorder: {
        borderRadius: 18,
        padding: 1.25,
        shadowColor: '#E547FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.55,
        shadowRadius: 12,
        elevation: 6,
    },
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    cruchat: {
        ...FONTS.paragraph1,
        fontSize: 12,
        color: COLORS.AKCRUBLUE,
    },
    cruchat2: {
        ...FONTS.paragraph1,
        fontSize: 12,
    },
    cardcontainer: {
        borderRadius: 17,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(38,42,84,0.96)',
    },
    cardOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 17,
    },
    cardContent: {
        flexDirection: 'column',
        alignItems: 'stretch',
        minHeight: 0,
        paddingVertical: 12,
        paddingHorizontal: 10,
        zIndex: 2,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    leftSection: {
        flexDirection: 'row',
        flex: 1,
        minWidth: 0,
    },
    avatarWrap: {
        marginRight: 14,
    },
    nameSection: {
        flex: 1,
        minWidth: 0,
    },
    badgeWrap: {
        alignSelf: 'flex-start',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        flexWrap: 'wrap',
    },
    name: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
        fontWeight: '800',
        fontSize: 16,
        marginRight: 8,
        flexShrink: 1,
    },
    ribbon: {
        marginRight: 5,
    },
    dateTimeCol: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    dateLine: {
        ...FONTS.paragraph1,
        fontSize: 12,
        color: 'rgba(255,255,255,0.72)',
        fontWeight: '600',
        textAlign: 'right',
    },
    time: {
        ...FONTS.paragraph1,
        fontSize: 13,
        color: 'rgba(255,255,255,0.86)',
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 2,
    },
    previewText: {
        ...FONTS.paragraph1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    statusLabel: {
        ...FONTS.paragraph1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.PINK,
        flexShrink: 1,
    },
    cancelButton: {
        borderWidth: 1.5,
        borderColor: COLORS.PINK,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,79,152,0.14)',
        maxWidth: '62%',
    },
    cancelText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        textAlign: 'center',
        fontSize: 12,
    },
    stamps: {
        ...FONTS.Title2Orange,
        marginBottom: 3,
    },
    stamps2: {
        ...FONTS.Title2AkcruBlue,
        fontSize: 12,
    },
    titleText1: {
        ...FONTS.Title2,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    paragraphText: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,

        marginHorizontal: 5,
    },
    paragraphText2: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
    },
    paragraphText3: {
        ...FONTS.paragraph1,
        color: COLORS.PINK,
    },
    declineButton: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
    },
});
