import {StyleSheet} from 'react-native';
import {FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    cardcontainer: {
        backgroundColor: '#1C202A',
        borderColor: '#1C202A',
        borderWidth: 0.5,
        borderRadius: 5,
        padding: 10,
    },
    review: {
        ...FONTS.paragraph1,
        fontSize: 12,
    },
    datestamp: {
        ...FONTS.Title2Orange,
        marginBottom: 3,
        textAlign: 'right',
        marginTop: 10,
    },
});
