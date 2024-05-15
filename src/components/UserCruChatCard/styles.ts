import {StyleSheet} from 'react-native';
import {FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    cruchat: {
        ...FONTS.paragraph1,
        fontSize: 12,
    },
    cardcontainer: {
        backgroundColor: '#1C202A',
        borderColor: '#1C202A',
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
    },
    stamps: {
        ...FONTS.Title2Orange,
        fontSize: 12,
    },
    stamps2: {
        ...FONTS.Title2AkcruBlue,
        fontSize: 12,
    },
});
