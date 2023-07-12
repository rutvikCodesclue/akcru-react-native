import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  drawfonttag: {
    ...FONTS.Title2Orange,
    color: COLORS.DARKGREY,
    backgroundColor: COLORS.TAGCOLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  posterstyle: {
    width: 60,
    height: 90,
    borderRadius: 5,
  },
  paragraphText: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
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
});
