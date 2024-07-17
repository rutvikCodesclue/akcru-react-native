import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    post: {
        ...FONTS.paragraph2,
        lineHeight: 18,
    },
    footStats: {
        ...FONTS.paragraph1,
        lineHeight: 18,
        color: COLORS.AKCRUBLUE,
        opacity: 0.5,
        paddingTop: 3,
    },
    cardcontainer: {
        backgroundColor: '#1C202A',
        borderRadius: 5,
        padding: 10,
    },
    stamps: {
        ...FONTS.Title2Orange,
        marginBottom: 3,
    },
    stamps2: {
        ...FONTS.Title2AkcruBlue,
        fontSize: 14,
        color: COLORS.LIGHTGREY,
    },
    reply: {
        ...FONTS.Title1,
        color: COLORS.AKCRUBLUE,
        fontSize: 14,
    },
    viewreply: {
        ...FONTS.Title1,
        color: COLORS.CATPURPLGT,
        fontSize: 14,
    },
    postimage: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
    postvideo: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        marginTop: 10,
    },
    postfooter: {
        marginTop: 20,
        width: SIZES.ScreenWidth / 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    postfooterside: {
        justifyContent: 'space-between',
    },
    postoptionsmodal: {
        width: '100%',
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 15,
    },
    postoptioncontainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    videoStyle: {width: '100%', height: '100%', borderRadius: 10},
    choiceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        backgroundColor: COLORS.WHITE,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    choiceImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    choiceText: {
        flex: 1,
        ...FONTS.paragraph1,
    },
    choicePercentage: {
        ...FONTS.paragraph1,
        color: COLORS.PURPLE,
    },
    selectedPollChoice: {
        backgroundColor: COLORS.PURPLE, // Highlight selected choice
        borderColor: COLORS.AKCRUBLUE,
        borderWidth: 1,
    },
    choiceSelected: {
        ...FONTS.paragraph1,
        color: COLORS.AKCRUPINK,
        textAlign: 'center',
        marginTop: 5,
    },
    pollChoice: {
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: COLORS.AKCRUBLUE,
        flexDirection: 'row',
        alignItems: 'center',
    },
});
