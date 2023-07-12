import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  titleText1: {
    ...FONTS.Title2,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  paragraphText: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
    marginHorizontal: 5,
  },
  paragraphText2: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE,
    fontSize: 12,
  },
  paragraphText3: {
    ...FONTS.Title2,
    color: COLORS.MIDORANGE,
    fontSize: 12,
  },
  declineButton: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE,
  },
});
