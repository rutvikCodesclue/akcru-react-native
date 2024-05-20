import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
    backbutton: {
        backgroundColor: COLORS.AKCRUBACKGROUND,
        marginTop: Platform.OS === 'ios' ? '10%' : 0,
    },
    box: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    flexCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fontstyle: {...FONTS.Title3, marginLeft: 5},
});
